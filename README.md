# DSE AI 學習平台

一個專為香港中學文憑試（DSE）考生設計的智能學習平台，具備筆記管理和 AI 問答功能。

## 功能特色

### 📝 智能筆記系統

- 創建、編輯、刪除筆記
- 按 DSE 科目分類管理
- 標籤系統便於整理
- 響應式設計，支援手機和桌面

### 🤖 AI 學習助手

- 24/7 智能問答服務
- 專為 DSE 考試優化的回答
- 支援所有 DSE 科目
- 提供學習建議和解釋

### 📚 DSE 科目支援

- 中國語文
- 英國語文
- 數學
- 通識教育
- 物理、化學、生物
- 經濟、地理、歷史、中國歷史
- 其他選修科目

## 技術架構

- **後端**: Node.js + Express
- **前端**: 原生 HTML/CSS/JavaScript
- **AI 服務**: OpenAI GPT-3.5-turbo
- **數據存儲**: 本地 JSON 文件
- **樣式**: 自定義 CSS + Font Awesome 圖標

## 安裝指南

### 1. 克隆專案

```bash
git clone <repository-url>
cd dse-ai-learning-platform
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 環境配置

複製 `env.example` 文件並重命名為 `.env`：

```bash
cp env.example .env
```

編輯 `.env` 文件，添加你的 OpenAI API 密鑰：

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### 4. 啟動應用

```bash
# 開發模式
npm run dev

# 生產模式
npm start
```

應用將在 `http://localhost:3000` 運行。

## 使用說明

### 筆記功能

1. 點擊「筆記」頁面
2. 點擊「新建筆記」按鈕
3. 填寫標題、選擇科目、輸入內容
4. 添加標籤（可選）
5. 點擊「保存」

### AI 問答功能

1. 點擊「AI 問答」頁面
2. 選擇相關科目（可選）
3. 輸入你的問題
4. 提供背景信息（可選）
5. 點擊「提問」等待 AI 回答

### 快捷鍵

- `Ctrl/Cmd + N`: 新建筆記
- `Escape`: 關閉模態框

## 專案結構

```
dse-ai-learning-platform/
├── public/                 # 前端文件
│   ├── css/
│   │   └── style.css      # 樣式文件
│   ├── js/
│   │   └── app.js         # 前端邏輯
│   └── index.html         # 主頁面
├── data/                  # 數據存儲
│   └── notes/            # 筆記文件
├── server.js             # 後端服務器
├── package.json          # 依賴配置
├── env.example           # 環境變量示例
└── README.md            # 說明文件
```

## API 端點

### 筆記相關

- `GET /api/notes` - 獲取所有筆記
- `POST /api/notes` - 創建新筆記
- `PUT /api/notes/:id` - 更新筆記
- `DELETE /api/notes/:id` - 刪除筆記

### AI 問答

- `POST /api/ask` - 提交問題給 AI

### 科目信息

- `GET /api/subjects` - 獲取 DSE 科目列表

## 開發指南

### 添加新功能

1. 在 `server.js` 中添加新的 API 端點
2. 在 `public/js/app.js` 中添加前端邏輯
3. 在 `public/css/style.css` 中添加樣式

### 自定義科目

編輯 `server.js` 中的 `subjects` 數組來添加或修改科目。

### 部署

1. 設置環境變量
2. 運行 `npm start`
3. 使用 PM2 或類似工具進行進程管理

## 注意事項

- 需要有效的 OpenAI API 密鑰
- 筆記數據存儲在本地文件中
- 建議定期備份 `data/notes/` 目錄
- 生產環境請使用 HTTPS

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個專案！

## 支援

如有問題，請聯繫開發團隊或提交 Issue。

