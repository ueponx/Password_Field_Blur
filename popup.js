// ポップアップが開かれたときに実行される
document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('blurToggle');
  const statusText = document.getElementById('statusText');
  const descriptionText = document.getElementById('descriptionText');
  
  // 現在の状態を取得して表示
  chrome.storage.local.get('isEnabled', function(data) {
    const isEnabled = data.isEnabled || false;
    toggleSwitch.checked = isEnabled;
    updateStatusText(isEnabled);
    
    // ポップアップが開かれた時点でもアイコンを更新（念のため）
    updateIcon(isEnabled);
  });
  
  // トグルスイッチの状態が変更されたときの処理
  toggleSwitch.addEventListener('change', function() {
    const isEnabled = toggleSwitch.checked;
    
    // 状態を保存
    chrome.storage.local.set({ isEnabled: isEnabled }, function() {
      console.log("状態を保存しました: " + isEnabled); // デバッグ用
    });
    
    // 表示テキストを更新
    updateStatusText(isEnabled);
    
    // 現在のタブに状態を通知
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: "toggleBlur", 
          isEnabled: isEnabled 
        });
      }
    });
    
    // アイコンを更新
    updateIcon(isEnabled);
  });
  
  // 状態テキストを更新する関数
  function updateStatusText(isEnabled) {
    if (isEnabled) {
      statusText.textContent = 'オン';
      statusText.style.color = '#2196F3';
      descriptionText.textContent = 'パスワードフィールドのぼかしは有効です';
    } else {
      statusText.textContent = 'オフ';
      statusText.style.color = '#666';
      descriptionText.textContent = 'パスワードフィールドのぼかしは無効です';
    }
  }
  
  // バックグラウンドスクリプトにアイコン更新を依頼する関数
  function updateIcon(isEnabled) {
    chrome.runtime.sendMessage({ 
      action: "updateIcon", 
      isEnabled: isEnabled 
    }, function(response) {
      console.log("アイコン更新応答:", response); // デバッグ用
    });
  }
});