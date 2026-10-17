// ===== Storage =====
const STORAGE_KEY = "trackassign_assignments";

function loadAssignments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAssignments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
}

let assignments = loadAssignments();

// ===== Elements =====
const $ = (id) => document.getElementById(id);

const totalEl = $("totalAssignments");
const listEl = $("assignmentList");
const deadlineListEl = $("deadlineList");
const container = $("container");

const addBtn = $("addAssignmentBtn");
const assignmentForm = $("assignmentForm");
const quickForm = $("quickForm");

// ===== Helpers =====
function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(a) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !a.completed && new Date(a.due + "T00:00:00") < today;
}

function addAssignment(title, subject, due, priority = "Medium") {
  assignments.push({
    id: Date.now(),
    title: title.trim(),
    subject: subject.trim(),
    due,
    priority,
    completed: false,
  });
  saveAssignments();
  render();
}

function toggleComplete(id) {
  const a = assignments.find((x) => x.id === id);
  if (a) a.completed = !a.completed;
  saveAssignments();
  render();
}

function deleteAssignment(id) {
  assignments = assignments.filter((x) => x.id !== id);
  saveAssignments();
  render();
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text; // textContent = safe from HTML injection
  return node;
}

// ===== Render =====
function renderList() {
  listEl.innerHTML = "";

  if (assignments.length === 0) {
    listEl.append(el("p", "empty-state", "No assignments yet. Add your first one!"));
    return;
  }

  const sorted = [...assignments].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.due.localeCompare(b.due);
  });

  sorted.forEach((a) => {
    const card = el("div", "assignment-card" + (a.completed ? " completed" : ""));

    const info = el("div", "assignment-info");
    info.append(el("h3", "", a.title));

    const meta = el("p", "assignment-meta", `${a.subject} · Due ${formatDate(a.due)}`);
    info.append(meta);

    const actions = el("div", "card-actions");

    const badge = el("span", "badge badge-" + a.priority.toLowerCase(), a.priority);
    actions.append(badge);

    if (isOverdue(a)) actions.append(el("span", "badge badge-overdue", "Overdue"));

    const doneBtn = el("button", "small-btn", a.completed ? "Undo" : "Done");
    doneBtn.type = "button";
    doneBtn.addEventListener("click", () => toggleComplete(a.id));

    const delBtn = el("button", "small-btn danger", "Delete");
    delBtn.type = "button";
    delBtn.addEventListener("click", () => deleteAssignment(a.id));

    actions.append(doneBtn, delBtn);
    card.append(info, actions);
    listEl.append(card);
  });
}

function renderDeadlines() {
  deadlineListEl.innerHTML = "";

  assignments
    .filter((a) => !a.completed)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 4)
    .forEach((a) => {
      const li = el("li");
      li.append(el("strong", "", a.title), el("small", "", formatDate(a.due)));
      deadlineListEl.append(li);
    });
}

function render() {
  totalEl.textContent = assignments.length;
  renderList();
  renderDeadlines();
}

// ===== Dashboard "Add New" form =====
addBtn.addEventListener("click", () => {
  assignmentForm.hidden = !assignmentForm.hidden;
  if (!assignmentForm.hidden) $("assignmentTitle").focus();
});

assignmentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addAssignment($("assignmentTitle").value, $("assignmentSubject").value, $("assignmentDueDate").value);
  assignmentForm.reset();
  assignmentForm.hidden = true;
});

// ===== Quick add form (hero section) =====
quickForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addAssignment($("qTitle").value, $("qSubject").value, $("qDue").value, $("qPriority").value);
  quickForm.reset();
  container.classList.add("active"); // slide to deadlines panel
});

// ===== Slider toggle =====
$("showAdd").addEventListener("click", () => container.classList.remove("active"));
$("showDeadlines").addEventListener("click", () => container.classList.add("active"));

// ===== Buttons =====
$("getStarted").addEventListener("click", () => {
  container.classList.remove("active");
  container.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => $("qTitle").focus({ preventScroll: true }), 400);
});

$("dashboardBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== Sidebar active link =====
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

// ===== Start =====
render();
