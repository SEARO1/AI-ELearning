#!/bin/bash

echo "DSE AI 學習平台啟動中..."
echo

# 檢查 Node.js 是否已安裝
if ! command -v node &> /dev/null; then
    echo "錯誤：未找到 Node.js，請先安裝 Node.js"
    echo "下載地址：https://nodejs.org/"
    exit 1
fi

# 檢查是否存在 .env 文件
if [ ! -f .env ]; then
    echo "警告：未找到 .env 文件"
    echo "正在從 env.example 創建 .env 文件..."
    cp env.example .env
    echo
    echo "請編輯 .env 文件，添加你的 OpenAI API 密鑰"
    echo "然後重新運行此腳本"
    exit 1
fi

# 檢查是否已安裝依賴
if [ ! -d "node_modules" ]; then
    echo "正在安裝依賴包..."
    npm install
    if [ $? -ne 0 ]; then
        echo "錯誤：依賴安裝失敗"
        exit 1
    fi
fi

echo "啟動服務器..."
echo "應用將在 http://localhost:3000 運行"
echo "按 Ctrl+C 停止服務器"
echo

npm start

