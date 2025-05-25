const input = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("todoList");

// Define light colors and track used ones
const lightColors = [
  "#FFEBEE", "#E3F2FD", "#E8F5E9", "#FFFDE7", "#F3E5F5",
  "#E0F2F1", "#FBE9E7", "#FFF3E0", "#F1F8E9", "#ECEFF1"
];
let usedColorIndices = new Set();

function getUniqueLightColor() {
  if (usedColorIndices.size >= lightColors.length) {
    usedColorIndices.clear(); // Reset once all used
  }

  let index;
  do {
    index = Math.floor(Math.random() * lightColors.length);
  } while (usedColorIndices.has(index));

  usedColorIndices.add(index);
  return lightColors[index];
}

// Load todos on popup open
document.addEventListener("DOMContentLoaded", loadTodos);
addBtn.addEventListener("click", addTodo);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});


function addTodo() {
  const text = input.value.trim();
  if (text === "") return;

  const todo = { text, completed: false };
  createListItem(todo);
  saveTodo(todo);
  input.value = "";
}

function createListItem(todo, index = null) {
  const li = document.createElement("li");
  li.style.backgroundColor = getUniqueLightColor();

  // ✅ Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;

  const span = document.createElement("span");
  span.textContent = todo.text;
  span.style.textDecoration = todo.completed ? "line-through" : "none";

  checkbox.addEventListener("change", () => {
    span.style.textDecoration = checkbox.checked ? "line-through" : "none";
    if (index !== null) {
      toggleCompleted(index, checkbox.checked);
    }
  });

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.onclick = () => {
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.value = span.textContent;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.onclick = () => {
      span.textContent = inputField.value;
      updateTodo(index, inputField.value);
      li.replaceChild(span, inputField);
      li.replaceChild(editBtn, saveBtn);
    };

    li.replaceChild(inputField, span);
    li.replaceChild(saveBtn, editBtn);
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "delete";
  deleteBtn.onclick = () => {
    li.remove();
    removeTodo(index);
  };

  li.appendChild(checkbox);   // ✅ Add checkbox first
  li.appendChild(span);
li.appendChild(editBtn);
li.appendChild(deleteBtn);
list.insertBefore(li, list.firstChild); // ⬅️ Put item on top

}

function saveTodo(todo) {
  chrome.storage.local.get(["todos"], (result) => {
    const todos = result.todos || [];
    todos.unshift(todo); // ⬅️ Add to the beginning instead of push()
    chrome.storage.local.set({ todos });
  });
}


function loadTodos() {
  chrome.storage.local.get(["todos"], (result) => {
    const todos = result.todos || [];
    list.innerHTML = "";
    todos.forEach((todo, index) => {
      createListItem(todo, index);
    });
  });
}

function updateTodo(index, newText) {
  chrome.storage.local.get(["todos"], (result) => {
    const todos = result.todos || [];
    if (todos[index]) {
      todos[index].text = newText;
      chrome.storage.local.set({ todos });
    }
  });
}

function toggleCompleted(index, completed) {
  chrome.storage.local.get(["todos"], (result) => {
    const todos = result.todos || [];
    if (todos[index]) {
      todos[index].completed = completed;
      chrome.storage.local.set({ todos });
    }
  });
}

function removeTodo(index) {
  chrome.storage.local.get(["todos"], (result) => {
    let todos = result.todos || [];
    todos.splice(index, 1);
    chrome.storage.local.set({ todos }, loadTodos);
  });
}
