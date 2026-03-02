@echo off
REM 環境に応じてPythonコマンドを設定。通常は「python」で動作。
set PYTHON_COMMAND=python

REM サーバーを立ち上げるポート番号を設定
set PORT=8000

REM サーバー起動中にブラウザで開くURLを設定
set URL=http://localhost:%PORT%/test.html

echo.
echo =========================================================
echo ポケモン ダメージ計算ツール サーバー起動
echo =========================================================
echo.
echo ポート: %PORT% で簡易HTTPサーバーを起動します。
echo ブラウザで %URL% を開きます。
echo サーバーを終了するには、このウィンドウを閉じます。
echo.

REM サーバー起動と同時にブラウザでURLを開く
start "" "%URL%"

REM Pythonの簡易サーバーを起動
REM -m http.server は Python 3 の標準モジュールです。
%PYTHON_COMMAND% -m http.server %PORT%

REM サーバーが停止すると以下の行が実行されます
echo.
echo サーバーが停止しました。
pause