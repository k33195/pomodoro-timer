import pyautogui
import time
import os
import sys
import subprocess

# --- 設定項目 ---
ZOOM_URL = "https://us06web.zoom.us/j/99544229806?pwd=eHhxL2p4TndYME1xMnVQOFBCWjhZQT09"

# タイマーファイルの絶対パスを取得
TIMER_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../index.html'))

def run_applescript(script):
    """AppleScriptを実行する補助関数"""
    subprocess.run(["osascript", "-e", script])

def main():
    print(f"--- Zoom自動化プロセス開始 ---")
    
    # 1. Zoomミーティングを起動
    print(f"1. Zoomを起動中...")
    subprocess.run(["open", ZOOM_URL])
    time.sleep(5) # Zoomが安定するまで待機

    # 4. オーディオ参加を確定 (Enter)
    pyautogui.press('enter')
    time.sleep(5)

    # 2. タイマーをSafariの「新規ウィンドウ」で開く（パス問題を回避）
    # webbrowserを使うのをやめて、Macの'open'コマンドを直接使います
    print(f"2. タイマーをSafariで起動...")
    subprocess.run(["open", "-a", "Safari", TIMER_PATH])
    time.sleep(5) # タイマーが確実に開くのを待つ

    # 3. Zoomアプリを最前面にする
    print(f"3. Zoomアプリにフォーカスを移動...")
    run_applescript('tell application "zoom.us" to activate')
    time.sleep(2)



    # 5. 画面共有ダイアログを起動 (Cmd + Shift + S)
    print(f"5. 画面共有を開始...")
    pyautogui.hotkey('command', 'shift', 's')
    time.sleep(3)

    # 6. 音声を共有をオンにする (Cmd + Option + S)
    pyautogui.hotkey('command', 'option', 's')
    time.sleep(1)

    # 7. 共有ターゲットを選択 (Tab)
    # タイマーが最後に開かれたウィンドウなので、Tabで正しく選ばれるはずです
    print(f"7. 共有ウィンドウを選択...")
    pyautogui.press('tab') 
    time.sleep(1)
    
    # 8. 共有を確定 (Enter)
    pyautogui.press('enter')
    
    print("--- 全工程が完了しました。勉強頑張ってください！ ---")

if __name__ == "__main__":
    main()