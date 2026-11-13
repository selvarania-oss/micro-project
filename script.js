// PAGE NAVIGATION
function showPage(pageId) {
    document.querySelectorAll(
        "#homePage, #loginPage, #signupPage, #dashboardPage"
    ).forEach(page => page.classList.add("hidden"));

    document.getElementById(pageId).classList.remove("hidden");

    window.scrollTo(0, 0);
}


// DEMO LOGIN AND SIGNUP
function demoLogin(event) {
    event.preventDefault();

    alert("Welcome to Rise Again! 🌱");

    showPage("dashboardPage");
    openSection("dashboard");
    updateProgress();
}


// LOGOUT
function logout() {
    showPage("homePage");
}


// DASHBOARD SECTION NAVIGATION
function openSection(section) {
    document.querySelectorAll(".app-section").forEach(item => {
        item.classList.add("hidden");
    });

    document.getElementById(section + "Section")
        .classList.remove("hidden");

    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    const buttons = document.querySelectorAll(".menu-item");

    const sectionIndexes = {
        dashboard: 0,
        planner: 1,
        chatbot: 2,
        progress: 3,
        motivation: 4
    };

    buttons[sectionIndexes[section]].classList.add("active");

    if (section === "planner") {
        displayTasks();
    }

    if (section === "progress") {
        updateProgress();
    }
}


// DARK MODE
function toggleTheme() {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem("riseTheme", isDark ? "dark" : "light");
}


// LOAD SAVED THEME
if (localStorage.getItem("riseTheme") === "dark") {
    document.body.classList.add("dark");
}


// MOTIVATIONAL QUOTES
const quotes = [
    "Believe in yourself. You are capable of great things.",
    "Your current situation is not your final destination.",
    "Small steps every day lead to big achievements.",
    "Don't give up. Your future is worth fighting for.",
    "Every expert was once a beginner.",
    "Your mistakes are proof that you are trying.",
    "A little progress each day adds up to big results.",
    "You can always begin again.",
    "Success starts with believing in yourself.",
    "Your hard work today creates your tomorrow."
];

let currentQuote = "";

function newQuote() {
    let quote;

    do {
        quote = quotes[Math.floor(Math.random() * quotes.length)];
    } while (quote === currentQuote && quotes.length > 1);

    currentQuote = quote;

    document.getElementById("dashboardQuote").textContent = quote;

    document.getElementById("motivationQuote").textContent = quote;
}


// COPY QUOTE
function copyQuote() {
    const quote = document.getElementById("motivationQuote").textContent;

    navigator.clipboard.writeText(quote)
        .then(() => alert("Quote copied! 💜"))
        .catch(() => alert("Copy is not available in this browser."));
}


// STUDY PLANNER
let tasks = JSON.parse(localStorage.getItem("riseTasks") || "[]");

function saveTasks() {
    localStorage.setItem("riseTasks", JSON.stringify(tasks));
}


// ADD TASK
function addTask() {
    const input = document.getElementById("taskInput");
    const dateInput = document.getElementById("taskDate");

    const taskName = input.value.trim();

    if (taskName === "") {
        alert("Please enter a study task!");
        return;
    }

    tasks.push({
        id: Date.now(),
        name: taskName,
        date: dateInput.value,
        completed: false
    });

    saveTasks();

    input.value = "";
    dateInput.value = "";

    displayTasks();
    updateProgress();
}


// DISPLAY TASKS
function displayTasks() {
    const taskList = document.getElementById("taskList");

    taskList.replaceChildren();

    if (tasks.length === 0) {
        taskList.textContent = "No tasks added yet. 🌱";
    }

    tasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("done");
        }

        const label = document.createElement("label");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            displayTasks();
            updateProgress();
        });

        const details = document.createElement("span");
        details.textContent = task.name +
            (task.date ? " — " + task.date : "");

        label.append(checkbox, details);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            displayTasks();
            updateProgress();
        });

        item.append(label, deleteButton);
        taskList.appendChild(item);
    });

    displayDashboardTasks();
}


// DASHBOARD TASK PREVIEW
function displayDashboardTasks() {
    const container = document.getElementById("dashboardTasks");

    container.replaceChildren();

    if (tasks.length === 0) {
        container.textContent =
            "No tasks yet. Add your first study task!";
        return;
    }

    tasks.slice(0, 5).forEach(task => {
        const p = document.createElement("p");

        p.textContent =
            (task.completed ? "✅ " : "📌 ") + task.name;

        p.style.padding = "8px 0";

        container.appendChild(p);
    });
}



// PROGRESS CALCULATION
function updateProgress() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent =
        completed;

    document.getElementById("progressPercent").textContent =
        percentage + "%";

    document.getElementById("progressBar").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        percentage + "% Completed";

    document.getElementById("progressDetails").textContent =
        completed + " out of " + total + " tasks completed.";

    displayDashboardTasks();
}


// INITIALIZE PLANNER
displayTasks();
updateProgress();


// AI CHATBOT INTERFACE
const chatForm = document.getElementById("chatForm");

chatForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (!message) return;

    addChatMessage(message, "user-message");

    input.value = "";

    const loading = addChatMessage(
        "Thinking... 🌱",
        "bot-message"
    );

    try {
        // This endpoint will be created in the AI backend.
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error("AI backend is not connected.");
        }

        const data = await response.json();

        loading.textContent = data.reply ||
            "I couldn't generate a reply. Please try again.";

    } catch (error) {
        loading.textContent =
            "I'm currently in demo mode 🌱. " +
            "Your real AI assistant will be available " +
            "after the secure AI backend is connected.";
    }
});


// DISPLAY CHAT MESSAGES
function addChatMessage(message, className) {
    const chatMessages = document.getElementById("chatMessages");

    const messageBox = document.createElement("div");

    messageBox.className = className;
    messageBox.textContent = message;

    chatMessages.appendChild(messageBox);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageBox;
}