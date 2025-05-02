// 拡張機能がインストールされたときに初期状態を設定
chrome.runtime.onInstalled.addListener(() => {
  // デフォルトでは無効状態にする
  chrome.storage.local.set({ isEnabled: false }, () => {
    // 初期アイコン状態を設定
    updateIcon(false);
  });
});

// ポップアップからのメッセージを受け取るリスナーを追加
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateIcon") {
    updateIcon(message.isEnabled);
    sendResponse({ success: true });
  }
});

// 拡張機能アイコンがクリックされたときの処理（ポップアップが設定されていない場合のフォールバック）
chrome.action.onClicked.addListener((tab) => {
  // 現在の状態を取得
  chrome.storage.local.get('isEnabled', (data) => {
    // 状態を反転させる
    const newState = !data.isEnabled;
    
    // 新しい状態を保存
    chrome.storage.local.set({ isEnabled: newState });
    
    // アイコンの表示を更新
    updateIcon(newState);
    
    // コンテンツスクリプトに状態変更を通知
    chrome.tabs.sendMessage(tab.id, { action: "toggleBlur", isEnabled: newState });
  });
});

// アイコンの表示を更新する関数
function updateIcon(isEnabled) {
  console.log("アイコン更新: " + isEnabled); // デバッグ用
  
  // 有効/無効状態に応じてアイコンを変更する
  const iconPath = isEnabled 
    ? { 
        16: "images/icon16-active.png",
        48: "images/icon48-active.png",
        128: "images/icon128-active.png"
      }
    : {
        16: "images/icon16.png",
        48: "images/icon48.png",
        128: "images/icon128.png"
      };
  
  chrome.action.setIcon({ path: iconPath });
}