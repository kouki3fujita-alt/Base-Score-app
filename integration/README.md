# Google Integration Setup Guide

## 1. Google Cloud Console Setup
安全な連携のために、ご自身で以下の設定を行ってください。

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスします。
2. 新しいプロジェクトを作成します（例: `base-score-integration`）。
3. **「APIとサービス」 > 「ライブラリ」** に移動し、以下を有効化します：
   - Google Drive API
   - Google Docs API
4. **「OAuth同意画面」** を設定します：
   - User Type: External (テスト用) または Internal
   - アプリ情報、連絡先を入力
   - **Scopes (スコープ)**: 手動で追加せず、コード側で制御しますが、必要であれば `.../auth/drive.file` と `.../auth/documents` を追加してください。
   - **Test Users (テストユーザー)**: あなたのGoogleアカウントを追加します。
5. **「認証情報」 > 「認証情報を作成」 > 「OAuth クライアント ID」**：
   - アプリケーションの種類: **Desktop App** (CLI/ローカル実行のため)
   - 名前: `Base Score Desktop`
   - 作成後、JSONファイルをダウンロードし、`credentials.json` という名前で `integration` フォルダに保存してください。

## 2. Environment Setup
```bash
cd integration
pip install -r requirements.txt
cp .env.example .env
```

## 3. Run Securely
```bash
python3 secure_connect.py
```

## Security Model Implemented
- **Least Privilege**: `drive.file` スコープのみを使用（エージェントが作成したファイルのみアクセス可能）。
- **Audit Logging**: `audit_log.py` がすべてのアクションとセキュリティイベントを記録します。
- **Secure Storage**: `token.pickle` は生成時に `600` (所有者のみ読み書き可能) の権限が設定されます。
