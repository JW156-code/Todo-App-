"use strict";

// === SELECTEURS DOM ===

// Formulaire
const formEl = document.getElementById("task-form");

// Inputs
const inputTaskName = document.getElementById("task-name");
const inputTaskDeadline = document.getElementById("task-deadline");
const inputTaskPriority = document.getElementById("task-priority");
const inputTaskDescription = document.getElementById("task-description");

// Liste des tâches
const taskListEl = document.getElementById("task-list");

// Template
const taskTemplate = document.getElementById("task-item-template");

// Boutons filtres
const btnFilterAll = document.getElementById("filter-all");
const btnFilterTasksActive = document.getElementById("filter-active");
const btnFilterTasksCompleted = document.getElementById("filter-completed");

// Bouton principal du formulaire (Add / Update)
const btnAddTask = formEl.querySelector(".btn-primary");

let currentEditId = null;
let currentFilter = "all";

// CLASSE Task
class Task {
  constructor(name, deadline, priority, description) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.description = description ?? "";
    this.deadline = deadline;
    this.priority = priority;
    this.completed = false;
    this.createdAt = new Date();
  }

  complete(status) {
    this.completed = status;
  }

  updateName(newName) {
    this.name = newName;
  }

  updateDeadline(newDeadline) {
    this.deadline = newDeadline;
  }

  updateDescription(newDescription) {
    this.description = newDescription ?? "";
  }
}

// === CLASSE TaskManager ===
class TaskManager {
  constructor() {
    this.tasks = [];
    this.load();
  }

  load() {
    const data = localStorage.getItem("tasks");
    if (!data) {
      this.tasks = [];
      return;
    }

    const rawTasks = JSON.parse(data);

    this.tasks = rawTasks.map((t) => {
      const task = new Task(
        t.name,
        new Date(t.deadline),
        t.priority,
        t.description,
      );

      task.id = t.id;
      task.completed = t.completed;
      if (t.createdAt) task.createdAt = new Date(t.createdAt);

      return task;
    });
  }

  save() {
    const data = JSON.stringify(this.tasks);
    localStorage.setItem("tasks", data);
  }

  addTask({ name, deadline, priority, description }) {
    const task = new Task(name, deadline, priority, description);
    this.tasks.push(task);
    this.save();
    return task;
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.save();
    return this.tasks;
  }

  completeTask(id, status) {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) return null;

    task.complete(status);
    this.save();
    return task;
  }

  updateTask(id, data) {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) return null;

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(task, key)) {
        task[key] = data[key];
      }
    }

    this.save();
    return task;
  }
}

const manager = new TaskManager();

// afficher changement tâches
function renderTasks() {
  taskListEl.innerHTML = "";

  let tasksToDisplay = manager.tasks;

  if (currentFilter === "active") {
    tasksToDisplay = manager.tasks.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    tasksToDisplay = manager.tasks.filter((t) => t.completed);
  }

  tasksToDisplay.forEach((task) => {
    const fragment = taskTemplate.content.cloneNode(true);
    const li = fragment.querySelector(".task-item");

    const nameEl = fragment.querySelector(".task-name");
    const descEl = fragment.querySelector(".task-description-text");
    const deadlineEl = fragment.querySelector(".task-deadline-label");
    const checkboxEl = fragment.querySelector(".task-checkbox");
    const btnDelete = fragment.querySelector(".task-delete-btn");
    const btnEdit = fragment.querySelector(".task-edit-btn");
    const priorityBadge = fragment.querySelector(".task-priority-badge");

    nameEl.textContent = task.name;
    descEl.textContent = task.description || "Pas de description";

    if (task.deadline instanceof Date && !isNaN(task.deadline)) {
      deadlineEl.textContent = task.deadline.toISOString().slice(0, 10);
    } else {
      deadlineEl.textContent = "Pas de date";
    }

    checkboxEl.checked = task.completed;
    if (task.completed) {
      nameEl.classList.add("completed");
    }

    if (priorityBadge) {
      priorityBadge.textContent = task.priority;
      priorityBadge.classList.remove(
        "task-priority-high",
        "task-priority-medium",
        "task-priority-low",
      );
      if (task.priority === "high") {
        priorityBadge.classList.add("task-priority-high");
      } else if (task.priority === "medium") {
        priorityBadge.classList.add("task-priority-medium");
      } else if (task.priority === "low") {
        priorityBadge.classList.add("task-priority-low");
      }
    }

    btnDelete.addEventListener("click", () => {
      manager.deleteTask(task.id);
      renderTasks();
    });

    checkboxEl.addEventListener("change", (e) => {
      manager.completeTask(task.id, e.target.checked);
      renderTasks();
    });

    btnEdit.addEventListener("click", () => {
      currentEditId = task.id;

      inputTaskName.value = task.name;
      inputTaskDescription.value = task.description;
      inputTaskPriority.value = task.priority;
      inputTaskDeadline.value =
        task.deadline instanceof Date && !isNaN(task.deadline)
          ? task.deadline.toISOString().slice(0, 10)
          : "";

      btnAddTask.textContent = "Update Task";
    });

    taskListEl.appendChild(fragment);
  });
}

// action après envoie forme 
formEl.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = inputTaskName.value.trim();
  const description = inputTaskDescription.value.trim();
  const priority = inputTaskPriority.value;
  const deadlineValue = inputTaskDeadline.value;

  if (!name) {
    return;
  }

  const deadline = deadlineValue ? new Date(deadlineValue) : null;

  const data = { name, description, priority, deadline };

  if (currentEditId !== null) {
    manager.updateTask(currentEditId, data);
    currentEditId = null;
    btnAddTask.textContent = "Ajouter la tâche";
  } else {
    manager.addTask(data);
  }

  formEl.reset();

  renderTasks();
});

btnFilterAll.addEventListener("click", () => {
  currentFilter = "all";
  renderTasks();
});

btnFilterTasksActive.addEventListener("click", () => {
  currentFilter = "active";
  renderTasks();
});

btnFilterTasksCompleted.addEventListener("click", () => {
  currentFilter = "completed";
  renderTasks();
});

renderTasks();
