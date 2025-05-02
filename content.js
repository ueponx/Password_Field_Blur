// 初期状態を取得
let blurEnabled = false;

// 拡張機能が有効かどうかの状態を保持する変数
chrome.storage.local.get('isEnabled', (data) => {
  blurEnabled = data.isEnabled;
  if (blurEnabled) {
    applyBlurToPasswordFields();
  }
});

// バックグラウンドスクリプトからのメッセージを受け取る
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleBlur") {
    blurEnabled = message.isEnabled;
    
    if (blurEnabled) {
      applyBlurToPasswordFields();
    } else {
      removeBlurFromPasswordFields();
    }
  }
});

// パスワードフィールドにぼかしを適用する関数
function applyBlurToPasswordFields() {
  // 既存のパスワードフィールドを全て取得
  const passwordFields = document.querySelectorAll('input[type="password"]');
  
  // 各パスワードフィールドにぼかしクラスを適用
  passwordFields.forEach(field => {
    field.classList.add('password-field-blur');
  });
  
  // 新しく追加されるパスワードフィールドを監視
  setupMutationObserver();
}

// パスワードフィールドからぼかしを削除する関数
function removeBlurFromPasswordFields() {
  // ぼかしクラスが適用されている全てのフィールドから削除
  const blurredFields = document.querySelectorAll('.password-field-blur');
  
  blurredFields.forEach(field => {
    field.classList.remove('password-field-blur');
  });
  
  // 監視を停止
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

// DOM変更を監視するためのMutationObserver
let observer = null;

function setupMutationObserver() {
  // 既に監視が設定されている場合は何もしない
  if (observer) return;
  
  // 新しい監視を設定
  observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      // 新しく追加されたノードがある場合
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          // 要素ノードの場合
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 追加されたノードがパスワードフィールドの場合
            if (node.tagName === 'INPUT' && node.type === 'password') {
              node.classList.add('password-field-blur');
            }
            
            // 追加されたノード内にパスワードフィールドがある場合
            const passwordFields = node.querySelectorAll('input[type="password"]');
            passwordFields.forEach(field => {
              field.classList.add('password-field-blur');
            });
          }
        });
      }
      
      // 属性が変更された場合（例：テキストフィールドからパスワードフィールドに変更）
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'type' && 
          mutation.target.tagName === 'INPUT') {
        
        const target = mutation.target;
        if (target.type === 'password') {
          target.classList.add('password-field-blur');
        } else {
          target.classList.remove('password-field-blur');
        }
      }
    }
  });
  
  // ドキュメント全体の変更を監視
  observer.observe(document.body, {
    childList: true,  // 子要素の追加・削除を監視
    subtree: true,    // 全ての子孫要素を監視
    attributes: true, // 属性の変更を監視
    attributeFilter: ['type']  // type属性の変更のみ監視
  });
}

// ページ読み込み時に既存のパスワードフィールドを監視
document.addEventListener('DOMContentLoaded', () => {
  if (blurEnabled) {
    applyBlurToPasswordFields();
  }
});

// 動的に生成されるパスワードフィールドのために、読み込み完了後も処理を行う
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (blurEnabled) {
    applyBlurToPasswordFields();
  }
}