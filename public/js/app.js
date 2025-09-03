// 應用狀態
let currentNoteId = null;
let subjects = [];
let uploadedFile = null;
let uploadedContent = "";

// DOM 元素
const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".nav-link");
const notesGrid = document.getElementById("notesGrid");
const noteModal = document.getElementById("noteModal");
const noteForm = document.getElementById("noteForm");
const createNoteBtn = document.getElementById("createNoteBtn");
const closeModal = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelBtn");
const askBtn = document.getElementById("askBtn");
const questionInput = document.getElementById("questionInput");
const subjectSelect = document.getElementById("subjectSelect");
const contextInput = document.getElementById("contextInput");
const answerContainer = document.getElementById("answerContainer");
const answerContent = document.getElementById("answerContent");
const loading = document.getElementById("loading");
const fileUpload = document.getElementById("fileUpload");
const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const removeFileBtn = document.getElementById("removeFile");
const fileUploadLabel = document.querySelector(".file-upload-label");

// 初始化應用
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

async function initializeApp() {
  await loadSubjects();
  await loadNotes();
  setupEventListeners();
}

// 設置事件監聽器
function setupEventListeners() {
  // 導航
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");
      showSection(section);
      updateActiveNav(link);
    });
  });

  // 筆記相關
  createNoteBtn.addEventListener("click", () => openNoteModal());
  closeModal.addEventListener("click", () => closeNoteModal());
  cancelBtn.addEventListener("click", () => closeNoteModal());
  noteForm.addEventListener("submit", handleNoteSubmit);

  // AI 問答
  askBtn.addEventListener("click", handleAskQuestion);

  // 文件上傳
  fileUpload.addEventListener("change", handleFileUpload);
  removeFileBtn.addEventListener("click", removeUploadedFile);

  // 拖拽上傳
  fileUploadLabel.addEventListener("dragover", handleDragOver);
  fileUploadLabel.addEventListener("dragleave", handleDragLeave);
  fileUploadLabel.addEventListener("drop", handleDrop);

  // 模態框外部點擊關閉
  window.addEventListener("click", (e) => {
    if (e.target === noteModal) {
      closeNoteModal();
    }
  });
}

// 導航功能
function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.remove("active");
  });
  document.getElementById(sectionId).classList.add("active");
}

function updateActiveNav(activeLink) {
  navLinks.forEach((link) => {
    link.classList.remove("active");
  });
  activeLink.classList.add("active");
}

// 載入科目列表
async function loadSubjects() {
  try {
    const response = await fetch("/api/subjects");
    subjects = await response.json();

    // 填充選擇框
    const subjectSelects = document.querySelectorAll(
      "#subjectSelect, #noteSubject"
    );
    subjectSelects.forEach((select) => {
      select.innerHTML = '<option value="">選擇科目</option>';
      subjects.forEach((subject) => {
        const option = document.createElement("option");
        option.value = subject.id;
        option.textContent = subject.name;
        select.appendChild(option);
      });
    });
  } catch (error) {
    console.error("載入科目失敗:", error);
    showNotification("載入科目失敗", "error");
  }
}

// 載入筆記
async function loadNotes() {
  try {
    const response = await fetch("/api/notes");
    const notes = await response.json();
    displayNotes(notes);
  } catch (error) {
    console.error("載入筆記失敗:", error);
    showNotification("載入筆記失敗", "error");
  }
}

// 顯示筆記
function displayNotes(notes) {
  notesGrid.innerHTML = "";

  if (notes.length === 0) {
    notesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-sticky-note" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <h3>還沒有筆記</h3>
                <p>點擊「新建筆記」開始記錄你的學習內容</p>
            </div>
        `;
    return;
  }

  notes.forEach((note) => {
    const noteCard = createNoteCard(note);
    notesGrid.appendChild(noteCard);
  });
}

// 創建筆記卡片
function createNoteCard(note) {
  const card = document.createElement("div");
  card.className = "note-card";

  const subject = subjects.find((s) => s.id === note.subject);
  const subjectName = subject ? subject.name : "未分類";
  const subjectColor = subject ? subject.color : "#AAB7B8";

  const tags =
    note.tags && note.tags.length > 0
      ? note.tags.map((tag) => `<span class="note-tag">${tag}</span>`).join("")
      : "";

  const createdAt = new Date(note.createdAt).toLocaleDateString("zh-TW");
  const updatedAt = new Date(note.updatedAt).toLocaleDateString("zh-TW");

  card.innerHTML = `
        <div class="note-subject" style="background-color: ${subjectColor}">${subjectName}</div>
        <h3>${note.title}</h3>
        <div class="note-content">${note.content}</div>
        ${tags ? `<div class="note-tags">${tags}</div>` : ""}
        <div class="note-meta">
            <span>創建於 ${createdAt}</span>
            <div class="note-actions">
                <button onclick="editNote('${note.id}')" title="編輯">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteNote('${note.id}')" title="刪除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

  card.addEventListener("click", (e) => {
    if (!e.target.closest(".note-actions")) {
      editNote(note.id);
    }
  });

  return card;
}

// 打開筆記模態框
function openNoteModal(noteId = null) {
  currentNoteId = noteId;
  const modalTitle = document.getElementById("modalTitle");
  const noteTitle = document.getElementById("noteTitle");
  const noteSubject = document.getElementById("noteSubject");
  const noteContent = document.getElementById("noteContent");
  const noteTags = document.getElementById("noteTags");

  if (noteId) {
    modalTitle.textContent = "編輯筆記";
    // 載入筆記數據
    loadNoteForEdit(noteId);
  } else {
    modalTitle.textContent = "新建筆記";
    noteForm.reset();
  }

  noteModal.style.display = "block";
  noteTitle.focus();
}

// 載入筆記進行編輯
async function loadNoteForEdit(noteId) {
  try {
    const response = await fetch("/api/notes");
    const notes = await response.json();
    const note = notes.find((n) => n.id === noteId);

    if (note) {
      document.getElementById("noteTitle").value = note.title;
      document.getElementById("noteSubject").value = note.subject;
      document.getElementById("noteContent").value = note.content;
      document.getElementById("noteTags").value = note.tags
        ? note.tags.join(", ")
        : "";
    }
  } catch (error) {
    console.error("載入筆記失敗:", error);
    showNotification("載入筆記失敗", "error");
  }
}

// 關閉筆記模態框
function closeNoteModal() {
  noteModal.style.display = "none";
  currentNoteId = null;
  noteForm.reset();
}

// 處理筆記提交
async function handleNoteSubmit(e) {
  e.preventDefault();

  const formData = new FormData(noteForm);
  const noteData = {
    title: document.getElementById("noteTitle").value,
    subject: document.getElementById("noteSubject").value,
    content: document.getElementById("noteContent").value,
    tags: document
      .getElementById("noteTags")
      .value.split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
  };

  try {
    const url = currentNoteId ? `/api/notes/${currentNoteId}` : "/api/notes";
    const method = currentNoteId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
    });

    if (response.ok) {
      showNotification(currentNoteId ? "筆記已更新" : "筆記已創建", "success");
      closeNoteModal();
      await loadNotes();
    } else {
      throw new Error("保存失敗");
    }
  } catch (error) {
    console.error("保存筆記失敗:", error);
    showNotification("保存筆記失敗", "error");
  }
}

// 編輯筆記
function editNote(noteId) {
  openNoteModal(noteId);
}

// 刪除筆記
async function deleteNote(noteId) {
  if (!confirm("確定要刪除這篇筆記嗎？")) {
    return;
  }

  try {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showNotification("筆記已刪除", "success");
      await loadNotes();
    } else {
      throw new Error("刪除失敗");
    }
  } catch (error) {
    console.error("刪除筆記失敗:", error);
    showNotification("刪除筆記失敗", "error");
  }
}

// 處理文件上傳
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 檢查文件大小（10MB限制）
  if (file.size > 10 * 1024 * 1024) {
    showNotification("文件大小不能超過 10MB", "error");
    return;
  }

  // 檢查文件類型
  const allowedTypes = [".pdf", ".txt", ".doc", ".docx", ".md"];
  const fileExt = "." + file.name.split(".").pop().toLowerCase();
  if (!allowedTypes.includes(fileExt)) {
    showNotification(
      "不支持的文件類型。請上傳 PDF、TXT、DOC、DOCX 或 MD 文件。",
      "error"
    );
    return;
  }

  uploadedFile = file;
  fileName.textContent = file.name;
  fileInfo.style.display = "flex";
  fileUploadLabel.style.display = "none";

  // 上傳文件到服務器
  try {
    const formData = new FormData();
    formData.append("ebook", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      uploadedContent = data.content;
      showNotification("文件上傳成功！", "success");
    } else {
      throw new Error("文件上傳失敗");
    }
  } catch (error) {
    console.error("文件上傳錯誤:", error);
    showNotification("文件上傳失敗，請重試", "error");
    removeUploadedFile();
  }
}

// 移除上傳的文件
function removeUploadedFile() {
  uploadedFile = null;
  uploadedContent = "";
  fileUpload.value = "";
  fileInfo.style.display = "none";
  fileUploadLabel.style.display = "block";
}

// 拖拽處理
function handleDragOver(e) {
  e.preventDefault();
  fileUploadLabel.classList.add("dragover");
}

function handleDragLeave(e) {
  e.preventDefault();
  fileUploadLabel.classList.remove("dragover");
}

function handleDrop(e) {
  e.preventDefault();
  fileUploadLabel.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileUpload.files = files;
    handleFileUpload({ target: { files: files } });
  }
}

// 處理AI問答
async function handleAskQuestion() {
  const question = questionInput.value.trim();
  const subject = subjectSelect.value;
  const context = contextInput.value.trim();

  if (!question) {
    showNotification("請輸入問題", "warning");
    questionInput.focus();
    return;
  }

  // 顯示加載狀態
  loading.style.display = "flex";
  askBtn.disabled = true;
  answerContainer.style.display = "none";

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        subject,
        context,
        uploadedContent: uploadedContent || null,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      displayAnswer(data.answer);
    } else {
      throw new Error("AI 問答服務暫時不可用");
    }
  } catch (error) {
    console.error("AI 問答失敗:", error);
    showNotification("AI 問答失敗，請稍後再試", "error");
  } finally {
    loading.style.display = "none";
    askBtn.disabled = false;
  }
}

// 顯示AI回答
function displayAnswer(answer) {
  answerContent.textContent = answer;
  answerContainer.style.display = "block";
  answerContainer.scrollIntoView({ behavior: "smooth" });
}

// 顯示通知
function showNotification(message, type = "info") {
  // 創建通知元素
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // 設置樣式
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    color: "white",
    fontWeight: "600",
    zIndex: "4000",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
  });

  // 設置背景顏色
  const colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  };
  notification.style.backgroundColor = colors[type] || colors.info;

  // 添加到頁面
  document.body.appendChild(notification);

  // 顯示動畫
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // 自動隱藏
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// 鍵盤快捷鍵
document.addEventListener("keydown", function (e) {
  // Ctrl/Cmd + N: 新建筆記
  if ((e.ctrlKey || e.metaKey) && e.key === "n") {
    e.preventDefault();
    if (document.getElementById("notes").classList.contains("active")) {
      openNoteModal();
    }
  }

  // Escape: 關閉模態框
  if (e.key === "Escape") {
    if (noteModal.style.display === "block") {
      closeNoteModal();
    }
  }
});

// 添加一些實用的工具函數
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 搜索功能（可選擴展）
function searchNotes(query) {
  const noteCards = document.querySelectorAll(".note-card");
  const searchTerm = query.toLowerCase();

  noteCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const content = card
      .querySelector(".note-content")
      .textContent.toLowerCase();
    const subject = card
      .querySelector(".note-subject")
      .textContent.toLowerCase();

    const matches =
      title.includes(searchTerm) ||
      content.includes(searchTerm) ||
      subject.includes(searchTerm);

    card.style.display = matches ? "block" : "none";
  });
}
