@echo off
echo DSE AI 學習平台啟動中...
echo.

REM 檢查 Node.js 是否已安裝
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 錯誤：未找到 Node.js，請先安裝 Node.js
    echo 下載地址：https://nodejs.org/
    pause
    exit /b 1
)

REM 檢查是否存在 .env 文件
if not exist .env (
    echo 警告：未找到 .env 文件
    echo 正在從 env.example 創建 .env 文件...
    copy env.example .env
    echo.
    echo 請編輯 .env 文件，添加你的 OpenAI API 密鑰
    echo 然後重新運行此腳本
    pause
    exit /b 1
)

REM 檢查是否已安裝依賴
if not exist node_modules (
    echo 正在安裝依賴包...
    npm install
    if %errorlevel% neq 0 (
        echo 錯誤：依賴安裝失敗
        pause
        exit /b 1
    )
)

echo 啟動服務器...
echo 應用將在 http://localhost:3000 運行
echo 按 Ctrl+C 停止服務器
echo.

npm start

