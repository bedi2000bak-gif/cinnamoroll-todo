let items = [];

const itemsDiv = document.getElementById("items");
const input = document.getElementById("itemInput");
const addButton = document.getElementById("addButton");
const storageKey = "items";

let dragStartIndex = null;

/* ===============================
   LOAD ITEMS
================================ */
function loadItems() {
    const saved = localStorage.getItem(storageKey);
    if (saved) items = JSON.parse(saved);
    items.forEach(item => {
        if (!item.subtasks) item.subtasks = [];
    });
    renderItems();
}

/* ===============================
   RENDER ITEMS
================================ */
function renderItems() {
    itemsDiv.innerHTML = "";

    items.forEach((item, idx) => {
        const container = document.createElement("div");
        container.classList.add("todo-container");
        container.setAttribute("draggable", true);

        container.style.opacity = 0;
        container.style.transform = "scale(0.85)";
        setTimeout(() => {
            container.style.transition = "all 0.3s ease";
            container.style.opacity = 1;
            container.style.transform = "scale(1)";
        }, 10);

        // Haupttext
        const text = document.createElement("p");
        text.textContent = item.text;
        if (item.done) text.classList.add("done");

        // Buttons Haupttask (Herz)
        const btnGroup = document.createElement("div");
        btnGroup.classList.add("button-group");

        const doneBtn = document.createElement("button");
        doneBtn.classList.add("done-btn");

        // Wenn Subtasks vorhanden und nicht alle erledigt sind → Button deaktivieren
        if (item.subtasks.length > 0 && !item.subtasks.every(sub => sub.done)) {
            doneBtn.disabled = true;
            doneBtn.style.opacity = 0.5;
        } else {
            doneBtn.disabled = false;
            doneBtn.style.opacity = 1;
        }

        doneBtn.addEventListener("click", () => toggleDone(idx));

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => removeItem(idx));

        btnGroup.appendChild(doneBtn);
        btnGroup.appendChild(deleteBtn);

        // Header: Text links, Buttons rechts
        const header = document.createElement("div");
        header.classList.add("todo-header");
        header.appendChild(text);
        header.appendChild(btnGroup);

        container.appendChild(header);

        // Subtasks Liste
        const subList = document.createElement("ul");
        subList.classList.add("subtask-list");

        item.subtasks.forEach((sub, subIdx) => {
            const li = document.createElement("li");
            li.classList.add("subtask-item");

            li.style.opacity = 0;
            li.style.transform = "scale(0.6)";
            setTimeout(() => {
                li.style.transition = "all 0.3s ease";
                li.style.opacity = 1;
                li.style.transform = "scale(1)";
            }, 10);

            const subText = document.createElement("span");
            subText.textContent = sub.text;
            if (sub.done) subText.classList.add("done");

            const subBtnGroup = document.createElement("div");
            subBtnGroup.classList.add("button-group");

            const subDone = document.createElement("button");
            subDone.classList.add("sub-done-btn");
            subDone.addEventListener("click", () => toggleSubDone(idx, subIdx));

            const subDelete = document.createElement("button");
            subDelete.classList.add("sub-delete-btn");
            subDelete.addEventListener("click", () => removeSubtask(idx, subIdx));

            subBtnGroup.appendChild(subDone);
            subBtnGroup.appendChild(subDelete);

            li.appendChild(subText);
            li.appendChild(subBtnGroup);

            subList.appendChild(li);
        });

        container.appendChild(subList);

        // Subtask Input
        const subInputContainer = document.createElement("div");
        subInputContainer.classList.add("sub-input-container");

        const subInput = document.createElement("input");
        subInput.type = "text";
        subInput.placeholder = "Add a subtask...";

        const subAddBtn = document.createElement("button");
        subAddBtn.classList.add("add-sub-btn");
        subAddBtn.textContent = "+";
        subAddBtn.addEventListener("click", () => {
            addSubtask(idx, subInput.value.trim());
            subInput.value = "";
        });

        subInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                addSubtask(idx, subInput.value.trim());
                subInput.value = "";
            }
        });

        subInputContainer.appendChild(subInput);
        subInputContainer.appendChild(subAddBtn);
        container.appendChild(subInputContainer);

        // Drag & Drop
        container.addEventListener("dragstart", dragStart);
        container.addEventListener("dragover", dragOver);
        container.addEventListener("drop", drop);
        container.addEventListener("dragend", dragEnd);

        itemsDiv.appendChild(container);
    });
}

/* ===============================
   SAVE ITEMS
================================ */
function saveItems() {
    localStorage.setItem(storageKey, JSON.stringify(items));
}

/* ===============================
   ADD MAIN ITEM
================================ */
function addItem() {
    const value = input.value.trim();
    if (!value) return;
    items.push({ text: value, done: false, subtasks: [] });
    input.value = "";
    renderItems();
    saveItems();
}

/* ===============================
   ADD SUBTASK
================================ */
function addSubtask(todoIdx, text) {
    if (!text) return;
    items[todoIdx].subtasks.push({ text, done: false });
    renderItems();
    saveItems();
}

/* ===============================
   TOGGLE DONE mit Pop-Animation
================================ */
function toggleDone(idx) {
    const task = items[idx];

    if (task.subtasks.length > 0 && !task.subtasks.every(sub => sub.done)) {
        alert("Bitte erst alle Subtasks erledigen!");
        return;
    }

    task.done = !task.done;
    renderItems();
    saveItems();

    // Sanfter Pop-Effekt auf Haupttext
    const taskEl = itemsDiv.children[idx].querySelector("p");
    if (taskEl) {
        taskEl.style.transition = "transform 0.3s ease";
        taskEl.style.transform = "scale(1.05)";
        setTimeout(() => {
            taskEl.style.transform = "scale(1)";
        }, 150);
    }

    checkAllDone();
}

function toggleSubDone(todoIdx, subIdx) {
    items[todoIdx].subtasks[subIdx].done = !items[todoIdx].subtasks[subIdx].done;
    renderItems();
    saveItems();

    // Sanfter Pop-Effekt auf Subtask
    const subEl = itemsDiv.children[todoIdx]
        .querySelectorAll(".subtask-item span")[subIdx];
    if (subEl) {
        subEl.style.transition = "transform 0.3s ease";
        subEl.style.transform = "scale(1.05)";
        setTimeout(() => {
            subEl.style.transform = "scale(1)";
        }, 150);
    }

    checkAllDone();
}

/* ===============================
   REMOVE ITEMS
================================ */
function removeItem(idx) {
    const el = itemsDiv.children[idx];
    el.style.transition = "all 0.3s ease";
    el.style.opacity = 0;
    el.style.transform = "scale(0.8)";
    setTimeout(() => {
        items.splice(idx, 1);
        renderItems();
        saveItems();
    }, 300);
}

function removeSubtask(todoIdx, subIdx) {
    const subList = itemsDiv.children[todoIdx].querySelectorAll(".subtask-item")[subIdx];
    subList.style.transition = "all 0.3s ease";
    subList.style.opacity = 0;
    subList.style.transform = "scale(0.8)";
    setTimeout(() => {
        items[todoIdx].subtasks.splice(subIdx, 1);
        renderItems();
        saveItems();
    }, 300);
}

/* ===============================
   CHECK ALL DONE & KONFETTI
================================ */
function checkAllDone() {
    const allDone = items.length > 0 && items.every(item =>
        item.done && item.subtasks.every(sub => sub.done)
    );
    if (allDone) celebrateConfetti();
}

/* ===============================
   DRAG & DROP
================================ */
function dragStart(e) {
    dragStartIndex = Array.from(itemsDiv.children).indexOf(this);
    this.classList.add("dragging");
}
function dragOver(e) { e.preventDefault(); }
function drop() {
    const dragEndIndex = Array.from(itemsDiv.children).indexOf(this);
    const temp = items[dragStartIndex];
    items[dragStartIndex] = items[dragEndIndex];
    items[dragEndIndex] = temp;
    renderItems();
    saveItems();
}
function dragEnd(e) { this.classList.remove("dragging"); }

/* ===============================
   KONFETTI
================================ */
function celebrateConfetti() {
    const confettiContainer = document.createElement("div");
    confettiContainer.style.position = "fixed";
    confettiContainer.style.top = 0;
    confettiContainer.style.left = 0;
    confettiContainer.style.width = "100%";
    confettiContainer.style.height = "100%";
    confettiContainer.style.pointerEvents = "none";
    confettiContainer.style.overflow = "hidden";
    confettiContainer.style.zIndex = 9999;
    document.body.appendChild(confettiContainer);

    const colors = ["#f6b1c8", "#9cccf3", "#fff176", "#ffffff"];
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement("div");
        confetti.style.position = "absolute";
        confetti.style.width = "8px";
        confetti.style.height = "8px";
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + "%";
        confetti.style.top = "-10px";
        confetti.style.opacity = Math.random() * 0.8 + 0.2;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.borderRadius = "50%";
        confettiContainer.appendChild(confetti);

        const fall = confetti.animate([
            { transform: confetti.style.transform + " translateY(0px)" },
            { transform: confetti.style.transform + " translateY(100vh)" }
        ], {
            duration: 2000 + Math.random() * 2000,
            iterations: 1,
            easing: "ease-out"
        });

        fall.onfinish = () => confetti.remove();
    }

    setTimeout(() => confettiContainer.remove(), 3000);
}

/* ===============================
   EVENTS
================================ */
addButton.addEventListener("click", addItem);
input.addEventListener("keydown", e => { if (e.key === "Enter") addItem(); });
document.addEventListener("DOMContentLoaded", loadItems);
