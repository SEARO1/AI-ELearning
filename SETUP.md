# DSE AI 學習平台 - 安裝指南

## 快速開始

### Windows 用戶

1. 雙擊運行 `start.bat` 文件
2. 按照提示完成設置

### Linux/Mac 用戶

1. 在終端中運行：`./start.sh`
2. 按照提示完成設置

## 手動安裝步驟

### 1. 安裝 Node.js

- 前往 [Node.js 官網](https://nodejs.org/) 下載並安裝
- 建議安裝 LTS 版本

### 2. 安裝依賴

```bash
npm install
```

### 3. 配置環境變量

```bash
# 複製環境變量模板
cp env.example .env

# 編輯 .env 文件，添加你的 OpenAI API 密鑰
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### 4. 啟動應用

```bash
# 開發模式（自動重啟）
npm run dev

# 生產模式
npm start
```

## 獲取 OpenAI API 密鑰

1. 前往 [OpenAI 官網](https://platform.openai.com/)
2. 註冊或登入帳戶
3. 前往 API Keys 頁面
4. 創建新的 API 密鑰
5. 複製密鑰並貼到 `.env` 文件中

## 功能說明

### 筆記功能

- ✅ 創建、編輯、刪除筆記
- ✅ 按科目分類
- ✅ 標籤系統
- ✅ 搜索功能

### AI 問答

- ✅ 智能回答 DSE 相關問題
- ✅ 支援所有 DSE 科目
- ✅ 提供學習建議

### 用戶體驗

- ✅ 響應式設計
- ✅ 現代化界面
- ✅ 快捷鍵支援
- ✅ 實時通知

## 故障排除

### 常見問題

**Q: 啟動時出現 "Module not found" 錯誤**
A: 運行 `npm install` 重新安裝依賴

**Q: AI 問答功能不工作**
A: 檢查 `.env` 文件中的 OpenAI API 密鑰是否正確

**Q: 筆記無法保存**
A: 確保 `data/notes/` 目錄存在且有寫入權限

**Q: 頁面顯示異常**
A: 清除瀏覽器緩存或嘗試硬刷新 (Ctrl+F5)

### 聯繫支援

如遇到其他問題，請提交 Issue 或聯繫開發團隊。

## 更新日誌

### v1.0.0

- 初始版本發布
- 基本筆記功能
- AI 問答系統
- DSE 科目支援
- 響應式設計

