(function () {
  const STORAGE_KEY = "todo-app-items";

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const countEl = document.getElementById("todo-count");
  const clearBtn = document.getElementById("clear-completed");
  const filterButtons = document.querySelectorAll(".filters__btn");

  let items = loadItems();
  let currentFilter = "all";

  function loadItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function getFilteredItems() {
    if (currentFilter === "active") return items.filter((item) => !item.done);
    if (currentFilter === "completed") return items.filter((item) => item.done);
    return items;
  }

  function render() {
    const filtered = getFilteredItems();
    list.innerHTML = "";

    if (filtered.length === 0) {
      const empty = document.createElement("li");
      empty.className = "todo-list__empty";
      empty.textContent =
        items.length === 0 ? "还没有任务，在上方输入并添加。" : "当前筛选下没有任务。";
      list.appendChild(empty);
    } else {
      filtered.forEach((item) => {
        list.appendChild(createTodoRow(item));
      });
    }

    const activeCount = items.filter((item) => !item.done).length;
    countEl.textContent =
      activeCount === 0 ? "全部完成" : `未完成 ${activeCount} 项`;

    const completedCount = items.length - activeCount;
    clearBtn.hidden = completedCount === 0;
  }

  function createTodoRow(item) {
    const li = document.createElement("li");
    li.className = "todo-item" + (item.done ? " todo-item--done" : "");
    li.dataset.id = item.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-item__check";
    checkbox.checked = item.done;
    checkbox.setAttribute("aria-label", item.done ? "标记为未完成" : "标记为已完成");

    const span = document.createElement("span");
    span.className = "todo-item__text";
    span.textContent = item.text;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "todo-item__delete";
    del.textContent = "删除";
    del.setAttribute("aria-label", `删除「${item.text.slice(0, 40)}」`);

    checkbox.addEventListener("change", () => {
      item.done = checkbox.checked;
      saveItems();
      render();
    });

    del.addEventListener("click", () => {
      items = items.filter((t) => t.id !== item.id);
      saveItems();
      render();
    });

    li.append(checkbox, span, del);
    return li;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    items.push({ id: uid(), text, done: false });
    input.value = "";
    saveItems();
    render();
    input.focus();
  });

  clearBtn.addEventListener("click", () => {
    items = items.filter((item) => !item.done);
    saveItems();
    render();
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter || "all";
      filterButtons.forEach((b) => b.classList.remove("filters__btn--active"));
      btn.classList.add("filters__btn--active");
      render();
    });
  });

  render();
})();
