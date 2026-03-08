const storeKeys = {
  users: "quizforge_users",
  currentUser: "quizforge_current_user",
  quizzes: "quizforge_quizzes",
};

const state = {
  currentUser: null,
  quizzes: [],
  activeQuiz: null,
  activeIndex: 0,
  answers: [],
};

const el = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel"),
  authStatus: document.getElementById("authStatus"),
  toast: document.getElementById("toast"),
  quizForm: document.getElementById("quizForm"),
  quizTitle: document.getElementById("quizTitle"),
  questionList: document.getElementById("questionList"),
  addQuestionBtn: document.getElementById("addQuestionBtn"),
  quizCatalog: document.getElementById("quizCatalog"),
  quizRunner: document.getElementById("quizRunner"),
  registerForm: document.getElementById("registerForm"),
  loginForm: document.getElementById("loginForm"),
  logoutBtn: document.getElementById("logoutBtn"),
};

function boot() {
  seedDefaultQuiz();
  state.currentUser = readJSON(storeKeys.currentUser, null);
  state.quizzes = readJSON(storeKeys.quizzes, []);

  bindTabs();
  bindAuth();
  bindQuizCreation();

  addQuestion();
  addQuestion();
  refreshAuthStatus();
  renderQuizCatalog();
}

function bindTabs() {
  el.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      el.tabs.forEach((t) => t.classList.remove("active"));
      el.panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.view).classList.add("active");
    });
  });
}

function bindAuth() {
  el.registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("regUser").value.trim();
    const password = document.getElementById("regPass").value;

    const users = readJSON(storeKeys.users, []);
    if (users.find((u) => u.username === username)) {
      toast("Username already exists", true);
      return;
    }

    users.push({ username, password });
    writeJSON(storeKeys.users, users);
    el.registerForm.reset();
    toast("Account created. You can login now.");
  });

  el.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("logUser").value.trim();
    const password = document.getElementById("logPass").value;

    const users = readJSON(storeKeys.users, []);
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      toast("Invalid credentials", true);
      return;
    }

    state.currentUser = { username };
    writeJSON(storeKeys.currentUser, state.currentUser);
    refreshAuthStatus();
    el.loginForm.reset();
    toast(`Logged in as ${username}`);
  });

  el.logoutBtn.addEventListener("click", () => {
    state.currentUser = null;
    localStorage.removeItem(storeKeys.currentUser);
    refreshAuthStatus();
    toast("Logged out");
  });
}

function refreshAuthStatus() {
  if (state.currentUser) {
    el.authStatus.innerHTML = `<strong>Welcome, ${escapeHTML(state.currentUser.username)}</strong><br/>Create and manage your quizzes.`;
  } else {
    el.authStatus.innerHTML = `<strong>Guest mode</strong><br/>Login to create quizzes.`;
  }
}

function bindQuizCreation() {
  el.addQuestionBtn.addEventListener("click", addQuestion);

  el.quizForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!state.currentUser) {
      toast("Please login first to create a quiz", true);
      return;
    }

    const title = el.quizTitle.value.trim();
    const blocks = Array.from(el.questionList.querySelectorAll(".question-block"));

    if (!title || blocks.length === 0) {
      toast("Add title and at least one question", true);
      return;
    }

    const questions = [];

    for (const block of blocks) {
      const questionText = block.querySelector(".q-text").value.trim();
      const optionInputs = Array.from(block.querySelectorAll(".q-option"));
      const options = optionInputs.map((input) => input.value.trim());
      const correctIndex = Number(block.querySelector(".q-correct").value);

      if (!questionText || options.some((o) => !o)) {
        toast("Each question needs text and four options", true);
        return;
      }

      questions.push({
        question: questionText,
        options,
        correctIndex,
      });
    }

    const quiz = {
      id: `quiz_${Date.now()}`,
      title,
      createdBy: state.currentUser.username,
      questions,
      createdAt: new Date().toISOString(),
    };

    state.quizzes.unshift(quiz);
    writeJSON(storeKeys.quizzes, state.quizzes);
    el.quizForm.reset();
    el.questionList.innerHTML = "";
    addQuestion();
    addQuestion();
    renderQuizCatalog();
    toast("Quiz saved successfully");
  });
}

function addQuestion() {
  const index = el.questionList.children.length + 1;
  const block = document.createElement("div");
  block.className = "question-block";
  block.innerHTML = `
    <div class="question-head">
      <strong>Question ${index}</strong>
      <button type="button" class="small-btn" title="Remove question">Remove</button>
    </div>
    <label>
      Question
      <input class="q-text" type="text" placeholder="Enter question text" required />
    </label>
    <label>
      Option A
      <input class="q-option" type="text" required />
    </label>
    <label>
      Option B
      <input class="q-option" type="text" required />
    </label>
    <label>
      Option C
      <input class="q-option" type="text" required />
    </label>
    <label>
      Option D
      <input class="q-option" type="text" required />
    </label>
    <label>
      Correct answer
      <select class="q-correct">
        <option value="0">Option A</option>
        <option value="1">Option B</option>
        <option value="2">Option C</option>
        <option value="3">Option D</option>
      </select>
    </label>
  `;

  const removeBtn = block.querySelector(".small-btn");
  removeBtn.addEventListener("click", () => {
    block.remove();
    renumberQuestions();
  });

  el.questionList.appendChild(block);
}

function renumberQuestions() {
  const blocks = Array.from(el.questionList.querySelectorAll(".question-block"));
  blocks.forEach((block, i) => {
    block.querySelector(".question-head strong").textContent = `Question ${i + 1}`;
  });
}

function renderQuizCatalog() {
  if (!state.quizzes.length) {
    el.quizCatalog.innerHTML = `<p>No quizzes yet. Create one from the Quiz Creation tab.</p>`;
    return;
  }

  el.quizCatalog.innerHTML = state.quizzes
    .map((quiz) => {
      const count = quiz.questions.length;
      return `
        <article class="quiz-item">
          <div class="badge">${count} question${count > 1 ? "s" : ""}</div>
          <h3>${escapeHTML(quiz.title)}</h3>
          <p>By ${escapeHTML(quiz.createdBy)}</p>
          <button class="btn primary" data-take-id="${quiz.id}">Take Quiz</button>
        </article>
      `;
    })
    .join("");

  el.quizCatalog.querySelectorAll("[data-take-id]").forEach((btn) => {
    btn.addEventListener("click", () => startQuiz(btn.dataset.takeId));
  });
}

function startQuiz(quizId) {
  const quiz = state.quizzes.find((q) => q.id === quizId);
  if (!quiz) {
    toast("Quiz not found", true);
    return;
  }

  state.activeQuiz = quiz;
  state.activeIndex = 0;
  state.answers = [];

  selectTab("take");
  renderRunnerStep();
}

function renderRunnerStep() {
  const quiz = state.activeQuiz;
  if (!quiz) return;

  const current = quiz.questions[state.activeIndex];
  if (!current) {
    renderResults();
    return;
  }

  const selected = state.answers[state.activeIndex];

  el.quizRunner.innerHTML = `
    <div class="badge">Question ${state.activeIndex + 1} of ${quiz.questions.length}</div>
    <h3>${escapeHTML(quiz.title)}</h3>
    <p><strong>${escapeHTML(current.question)}</strong></p>
    <div class="option-list">
      ${current.options
        .map(
          (opt, index) => `
            <button type="button" class="option-item ${selected === index ? "selected" : ""}" data-index="${index}">
              <span>${String.fromCharCode(65 + index)}.</span>
              <span>${escapeHTML(opt)}</span>
            </button>
          `
        )
        .join("")}
    </div>
    <div class="form-actions">
      <button type="button" class="btn secondary" id="prevBtn" ${state.activeIndex === 0 ? "disabled" : ""}>Previous</button>
      <button type="button" class="btn primary" id="nextBtn">${state.activeIndex === quiz.questions.length - 1 ? "Submit Quiz" : "Next"}</button>
    </div>
  `;

  el.quizRunner.querySelectorAll(".option-item").forEach((button) => {
    button.addEventListener("click", () => {
      const value = Number(button.dataset.index);
      state.answers[state.activeIndex] = value;
      renderRunnerStep();
    });
  });

  el.quizRunner.querySelector("#prevBtn").addEventListener("click", () => {
    if (state.activeIndex > 0) {
      state.activeIndex -= 1;
      renderRunnerStep();
    }
  });

  el.quizRunner.querySelector("#nextBtn").addEventListener("click", () => {
    if (state.answers[state.activeIndex] === undefined) {
      toast("Please select an option", true);
      return;
    }

    if (state.activeIndex < quiz.questions.length - 1) {
      state.activeIndex += 1;
      renderRunnerStep();
    } else {
      renderResults();
    }
  });
}

function renderResults() {
  const quiz = state.activeQuiz;
  let score = 0;

  const rows = quiz.questions
    .map((q, i) => {
      const selected = state.answers[i];
      const correct = q.correctIndex;
      const isRight = selected === correct;
      if (isRight) score += 1;

      return `
        <div class="result ${isRight ? "good" : "warn"}">
          <p><strong>Q${i + 1}:</strong> ${escapeHTML(q.question)}</p>
          <p>Your answer: ${selected === undefined ? "Not answered" : escapeHTML(q.options[selected])}</p>
          <p>Correct answer: ${escapeHTML(q.options[correct])}</p>
        </div>
      `;
    })
    .join("");

  const percent = Math.round((score / quiz.questions.length) * 100);

  el.quizRunner.innerHTML = `
    <h3>Quiz Results</h3>
    <p><strong>Score:</strong> ${score}/${quiz.questions.length} (${percent}%)</p>
    ${rows}
    <button class="btn primary" id="retakeBtn">Take Again</button>
  `;

  document.getElementById("retakeBtn").addEventListener("click", () => startQuiz(quiz.id));
}

function seedDefaultQuiz() {
  const existing = readJSON(storeKeys.quizzes, null);
  if (existing && existing.length) return;

  const starter = [
    {
      id: "quiz_demo_1",
      title: "Web Development Basics",
      createdBy: "system",
      createdAt: new Date().toISOString(),
      questions: [
        {
          question: "Which language is used for page structure?",
          options: ["CSS", "HTML", "SQL", "Python"],
          correctIndex: 1,
        },
        {
          question: "Which property changes text color in CSS?",
          options: ["font-style", "text-color", "color", "shade"],
          correctIndex: 2,
        },
        {
          question: "Which keyword declares a variable in JavaScript?",
          options: ["v", "let", "int", "data"],
          correctIndex: 1,
        },
      ],
    },
  ];

  writeJSON(storeKeys.quizzes, starter);
}

function selectTab(name) {
  el.tabs.forEach((t) => t.classList.toggle("active", t.dataset.view === name));
  el.panels.forEach((p) => p.classList.toggle("active", p.id === name));
}

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

let toastTimer;
function toast(message, isError = false) {
  el.toast.textContent = message;
  el.toast.style.background = isError ? "#8c1f1f" : "#10233d";
  el.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2200);
}

boot();
