
const ADMIN_EMAIL = "admin@quiz.com";
const ADMIN_PASSWORD = "admin123";

let currentQuiz = null;
let currentQuizData = null;
let selectedAnswers = [];

const quizTitle = document.getElementById("quiz-title");
const quizProgress = document.getElementById("quiz-progress");
const questionContainer = document.getElementById("question-container");
const submitQuizBtn = document.getElementById("submit-quiz");
const resultContainer = document.getElementById("result-container");
const scoreDisplay = document.getElementById("score-display");
const backToHomeBtn = document.getElementById("back-to-home");

const userScoresBody = document.getElementById("user-scores-body");

const authContainer = document.getElementById("auth-container");
const homeContainer = document.getElementById("home-container");
const quizContainer = document.getElementById("quiz-container");
const adminContainer = document.getElementById("admin-container");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginMessage = document.getElementById("login-message");
const registerMessage = document.getElementById("register-message");
const welcomeMessage = document.getElementById("welcome-message");
const quizList = document.getElementById("quiz-list");

const logoutBtn = document.getElementById("logout-btn");
const logoutAdminBtn = document.getElementById("logout-admin-btn");

const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

let currentUser = null;

const initialQuizzes = [
  {
    id: 1,
    title: "JavaScript Basics",
    questions: [
      {
        question: "What is JavaScript?",
        options: ["Markup", "Programming", "Styling"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 2,
    title: "HTML Fundamentals",
    questions: [
      {
        question: "What does HTML stand for?",
        options: ["High Tech Markup", "Hyper Text Markup", "Hyper Transfer"],
        correctAnswer: 1
      }
    ]
  }
];

function initApp() {
  if (!localStorage.getItem("quizzes")) {
    localStorage.setItem("quizzes", JSON.stringify(initialQuizzes));
  }

  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
  }

  if (!localStorage.getItem("scores")) {
    localStorage.setItem("scores", JSON.stringify([]));
  }

  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showAppropriateScreen();
  }

  setupListeners();
}

function setupListeners() {
    submitQuizBtn.addEventListener("click", submitQuiz);
backToHomeBtn.addEventListener("click", () => {
  quizContainer.classList.add("hidden");
  homeContainer.classList.remove("hidden");
});

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`${tab}-form`).classList.add("active");
    });
  });

  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);
  logoutBtn.addEventListener("click", handleLogout);
  logoutAdminBtn.addEventListener("click", handleLogout);
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    currentUser = { name: "Admin", email, isAdmin: true };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    showAppropriateScreen();
    return;
  }

  const users = JSON.parse(localStorage.getItem("users"));
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = { name: user.name, email };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    showAppropriateScreen();
  } else {
    loginMessage.textContent = "Invalid email or password.";
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  const users = JSON.parse(localStorage.getItem("users"));
  if (users.some((u) => u.email === email)) {
    registerMessage.textContent = "Email already exists.";
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));
  registerMessage.textContent = "Registered! Now login.";
  registerForm.reset();
  document.querySelector('[data-tab="login"]').click();
}

function handleLogout() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  showAuthScreen();
}

function showAppropriateScreen() {
  authContainer.classList.add("hidden");
  homeContainer.classList.add("hidden");
  quizContainer.classList.add("hidden");
  adminContainer.classList.add("hidden");

  if (!currentUser) {
    showAuthScreen();
  } else if (currentUser.isAdmin) {
    showAdminDashboard();
  } else {
    showHomeScreen();
  }
}

function showAuthScreen() {
  authContainer.classList.remove("hidden");
  loginForm.reset();
  registerForm.reset();
  loginMessage.textContent = "";
  registerMessage.textContent = "";
}

function showHomeScreen() {
  homeContainer.classList.remove("hidden");
  welcomeMessage.textContent = `Welcome, ${currentUser.name}!`;
}

function showAdminDashboard() {
  adminContainer.classList.remove("hidden");
}
function showHomeScreen() {
    homeContainer.classList.remove("hidden");
    welcomeMessage.textContent = `Welcome, ${currentUser.name}!`;
    loadQuizzes();
  }
  
  function loadQuizzes() {
    const quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
    quizList.innerHTML = '';
  
    quizzes.forEach(quiz => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.textContent = quiz.title;
      card.addEventListener('click', () => showQuizScreen(quiz.id));
      quizList.appendChild(card);
    });
  }
  function showQuizScreen(quizId) {
    homeContainer.classList.add("hidden");
    quizContainer.classList.remove("hidden");
  
    const quizzes = JSON.parse(localStorage.getItem("quizzes"));
    currentQuizData = quizzes.find(q => q.id === quizId);
    currentQuiz = quizId;
    selectedAnswers = new Array(currentQuizData.questions.length).fill(null);
  
    quizTitle.textContent = currentQuizData.title;
    resultContainer.classList.add("hidden");
    submitQuizBtn.classList.remove("hidden");
  
    renderQuiz();
  }
  function renderQuiz() {
    questionContainer.innerHTML = '';
    quizProgress.textContent = `Question: 1/${currentQuizData.questions.length}`;
  
    currentQuizData.questions.forEach((questionData, questionIndex) => {
      const questionEl = document.createElement("div");
      questionEl.className = "question";
      questionEl.style.display = questionIndex === 0 ? "block" : "none";
      questionEl.setAttribute("data-question-index", questionIndex);
  
      const title = document.createElement("h3");
      title.textContent = `${questionIndex + 1}. ${questionData.question}`;
  
      const optionsList = document.createElement("ul");
      optionsList.className = "options";
  
      questionData.options.forEach((option, optionIndex) => {
        const optionEl = document.createElement("li");
        optionEl.className = "option";
        optionEl.textContent = option;
        optionEl.setAttribute("data-option-index", optionIndex);
  
        optionEl.addEventListener("click", () => {
          const allOptions = questionEl.querySelectorAll(".option");
          allOptions.forEach(o => o.classList.remove("selected"));
  
          optionEl.classList.add("selected");
          selectedAnswers[questionIndex] = optionIndex;

          if (questionIndex < currentQuizData.questions.length - 1) {
            setTimeout(() => {
              questionEl.style.display = "none";
              const nextQ = document.querySelector(`.question[data-question-index="${questionIndex + 1}"]`);
              nextQ.style.display = "block";
              quizProgress.textContent = `Question: ${questionIndex + 2}/${currentQuizData.questions.length}`;
            }, 300);
          }
        });
  
        optionsList.appendChild(optionEl);
      });
  
      questionEl.appendChild(title);
      questionEl.appendChild(optionsList);
      questionContainer.appendChild(questionEl);
    });
  }
  function submitQuiz() {
    let score = 0;
    selectedAnswers.forEach((selected, index) => {
      if (selected === currentQuizData.questions[index].correctAnswer) {
        score++;
      }
    });
  
    const finalScore = (score / currentQuizData.questions.length) * 100;
  
    const scores = JSON.parse(localStorage.getItem("scores")) || [];
    scores.push({
      user: currentUser.email,
      name: currentUser.name,
      quizId: currentQuiz,
      quizTitle: currentQuizData.title,
      score: finalScore,
      date: new Date().toISOString()
    });
    localStorage.setItem("scores", JSON.stringify(scores));
  
    scoreDisplay.textContent = `You scored ${score} out of ${currentQuizData.questions.length} (${finalScore.toFixed(1)}%)`;
    resultContainer.classList.remove("hidden");
    submitQuizBtn.classList.add("hidden");
  }
  function showAdminDashboard() {
    adminContainer.classList.remove("hidden");
    loadUserScores();
  }
  
  function loadUserScores() {
    const scores = JSON.parse(localStorage.getItem("scores")) || [];
    userScoresBody.innerHTML = '';
  
    scores.forEach(score => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${score.name}</td>
        <td>${score.user}</td>
        <td>${score.quizTitle}</td>
        <td>${score.score.toFixed(1)}%</td>
      `;
      userScoresBody.appendChild(row);
    });
  }
          

document.addEventListener("DOMContentLoaded", initApp);
