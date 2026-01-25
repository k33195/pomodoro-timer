# Zoom Pomodoro Timer & Automation

Zoomミーティングを自動で開き、画面共有を開始し、ポモドーロタイマーを表示する完全自動化ツールです。

## 機能
1. **Zoom自動参加**: 指定したURLを開きます。
2. **自動画面共有**: キーボードショートカットを自動入力して画面共有を開始します。
3. **タイマー表示**: 19:05〜22:00のスケジュールで動くタイマーをブラウザで開きます。

## 🚀 セットアップ (Python自動化版)

### 1. Python環境の準備
このツールはPythonを使用します。

```bash
# 必要なライブラリのインストール
pip install pyautogui
```

### 2. Zoom URLの設定
`automation/auto_zoom.py` ファイルを開き、以下の行をご自身のミーティングURLに書き換えてください。

```python
ZOOM_URL = "https://us06web.zoom.us/j/81554403977?pwd=9R7zFEe5uOJ3Ler2vyMvFdPRoUfQ4X.1" # ここを書き換え
```

### 3. 【重要】Macの権限設定
キーボード操作を自動化するため、**スクリプトを実行するプログラム（ターミナルやPython）**に許可を与える必要があります。

1. Macの「システム設定」を開く。
2. 「プライバシーとセキュリティ」 > **「アクセシビリティ」** を選択。
3. リストにある「ターミナル（Terminal）」のスイッチを**ON**にする。
   - もしリストになければ、「＋」ボタンから `/System/Applications/Utilities/Terminal.app` を追加してください。
4. （念のため）「画面収録」の権限もZoom自体に許可されているか確認してください。

---

## 📅 自動実行のスケジュール設定

### Mac「カレンダー」アプリを使う方法（推奨）

Pythonスクリプトを直接指定して実行させるため、シェルスクリプト `launch_timer.sh` ではなく、新しい設定が必要です。

今回はコマンドを実行する必要があるため、「カレンダー」ではなく、より確実な **Cron（クロン）** の設定をおすすめしますが、カレンダーで行う場合は「Automator」でアプリケーション化する手順が必要です。

#### 【推奨】Cronでの設定手順

1. ターミナルで以下を実行し、Pythonのパスを確認します。
   ```bash
   which python3
   # 結果例: /usr/bin/python3
   /usr/bin/python3
   ```
2. 設定を開きます。
   ```bash
   crontab -e
   ```
3. 以下の行を追加します（火・金・日の19:00に実行する例）。
   - パスはご自身の環境に合わせて修正してください。
   ```cron
   0 19 * * 0,2,5 /usr/bin/python3 "/Users/hagiwarakurumi/Library/CloudStorage/GoogleDrive-k33195928@gmail.com/マイドライブ/antigravity/zoom_pomodoro_timer/automation/auto_zoom.py"
   ```
   *(注: 0=日曜日, 2=火曜日, 5=金曜日)*

4. 保存して終了します。
   - 実行時に「ターミナル」等に画面操作権限がないと失敗するため、初回は手動で実行して許可ポップアップが出るか確認することをお勧めします。

## 手動テスト

ターミナルで以下を実行して動作を確認してください。

```bash
python3 automation/auto_zoom.py
```
