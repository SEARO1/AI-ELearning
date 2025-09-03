const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // 替換為 Gemini
require("dotenv").config();

// 調試：檢查環境變量
console.log("環境變量檢查:");
console.log(
  "GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "已設置" : "未設置"
);
console.log("PORT:", process.env.PORT || 3000);

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Gemini 初始化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 筆記存儲路徑
const notesDir = path.join(__dirname, "notes");
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir);
}

// 文件上傳配置
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 限制
  },
  fileFilter: (req, file, cb) => {
    // 允許的文件類型
    const allowedTypes = [".pdf", ".txt", ".doc", ".docx", ".md"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error("不支持的文件類型。請上傳 PDF、TXT、DOC、DOCX 或 MD 文件。")
      );
    }
  },
});

// 獲取所有筆記
app.get("/api/notes", async (req, res) => {
  try {
    const files = await fs.readdir(notesDir);
    const notes = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(path.join(notesDir, file), "utf-8");
        return { id: file.replace(".json", ""), content: JSON.parse(content) };
      })
    );
    res.json(notes);
  } catch (error) {
    console.error("獲取筆記錯誤:", error);
    res.status(500).json({ error: "無法讀取筆記" });
  }
});

// 創建或更新筆記
app.post("/api/notes", async (req, res) => {
  try {
    const { id, content } = req.body;
    await fs.writeFile(
      path.join(notesDir, `${id}.json`),
      JSON.stringify(content, null, 2)
    );
    res.json({ success: true });
  } catch (error) {
    console.error("保存筆記錯誤:", error);
    res.status(500).json({ error: "保存筆記失敗" });
  }
});

// 刪除筆記
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await fs.unlink(path.join(notesDir, `${id}.json`));
    res.json({ success: true });
  } catch (error) {
    console.error("刪除筆記錯誤:", error);
    res.status(500).json({ error: "刪除筆記失敗" });
  }
});

// 文件上傳端點
app.post("/api/upload", upload.single("ebook"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "沒有上傳文件" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // 簡單的文本文件讀取（對於 PDF 等複雜格式，需要額外的庫）
    let fileContent = "";
    if (
      path.extname(fileName).toLowerCase() === ".txt" ||
      path.extname(fileName).toLowerCase() === ".md"
    ) {
      fileContent = await fs.readFile(filePath, "utf-8");
    } else {
      // 對於其他格式，暫時返回文件名
      fileContent = `文件：${fileName} 已上傳，但需要額外的處理來提取文本內容。`;
    }

    res.json({
      success: true,
      fileName: fileName,
      filePath: filePath,
      content:
        fileContent.substring(0, 1000) +
        (fileContent.length > 1000 ? "..." : ""),
      message: "文件上傳成功",
    });
  } catch (error) {
    console.error("文件上傳錯誤:", error);
    res.status(500).json({ error: "文件上傳失敗" });
  }
});

// AI 問答（Gemini 版本）
app.post("/api/ask", async (req, res) => {
  try {
    const { question, subject, context, uploadedContent } = req.body;

    let systemPrompt = `你是一位專業的香港DSE（中學文憑試）導師，專門幫助學生解答學術問題。請用繁體中文回答，並提供詳細、準確的解釋。

${subject ? `科目：${subject}` : ""}
${context ? `相關背景：${context}` : ""}`;

    // 如果有上傳的文件內容，加入到提示中
    if (uploadedContent) {
      systemPrompt += `\n\n學生提供的學習材料內容：\n${uploadedContent}`;
    }

    systemPrompt += `\n\n請確保你的回答：
1. 準確且符合DSE考試要求
2. 提供清晰的解釋和例子
3. 如果適用，提供學習建議
4. 使用適合中學生的語言水平
5. 如果學生提供了學習材料，請結合材料內容來回答問題`;

    // 使用 Gemini 生成回答
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
    const prompt = `${systemPrompt}\n\n學生問題：${question}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    res.json({
      answer: answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI 問答錯誤:", error);
    res.status(500).json({ error: "AI 問答服務暫時不可用" });
  }
});

// 獲取科目列表
app.get("/api/subjects", (req, res) => {
  const subjects = [
    { id: "chinese", name: "中國語文", color: "#FF6B6B" },
    { id: "english", name: "英國語文", color: "#4ECDC4" },
    { id: "math", name: "數學", color: "#45B7D1" },
    { id: "ls", name: "通識教育", color: "#96CEB4" },
    { id: "physics", name: "物理", color: "#FFEAA7" },
    { id: "chemistry", name: "化學", color: "#DDA0DD" },
    { id: "biology", name: "生物", color: "#98D8C8" },
    { id: "economics", name: "經濟", color: "#F7DC6F" },
    { id: "geography", name: "地理", color: "#BB8FCE" },
    { id: "history", name: "歷史", color: "#85C1E9" },
    { id: "chinese-history", name: "中國歷史", color: "#F8C471" },
    { id: "other", name: "其他", color: "#AAB7B8" },
  ];

  res.json(subjects);
});

// 啟動服務
app.listen(PORT, () => {
  console.log(`伺服器運行中：http://localhost:${PORT}`);
});
