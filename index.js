let items = [];

const itemsDiv = document.getElementById("items");
const input = document.getElementById("itemInput");
const addButton = document.getElementById("addButton");
const storageKey = "items";

let dragStartIndex = null;

/* LOAD ITEMS */
function loadItems() {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        items = JSON.parse(saved);
        renderItems();
    }
}

/* RENDER ITEMS */
function renderItems() {
    itemsDiv.innerHTML = "";

    items.forEach((item, idx) => {
        const container = document.createElement("div");
        container.setAttribute("draggable", true);

        // Text
        const text = document.createElement("p");
        text.textContent = item.text;
        if (item.done) text.classList.add("done");

        // Buttons nebeneinander
        const buttonGroup = document.createElement("div");
        buttonGroup.classList.add("button-group");

        const doneButton = document.createElement("button");
        doneButton.classList.add("done-btn");
        doneButton.addEventListener("click", () => toggleDone(idx));

        const removeButton = document.createElement("button");
        removeButton.classList.add("delete-btn");
        removeButton.addEventListener("click", () => removeItem(idx));

        buttonGroup.appendChild(doneButton);
        buttonGroup.appendChild(removeButton);

        container.appendChild(text);
        container.appendChild(buttonGroup);

        // Drag & Drop
        container.addEventListener("dragstart", dragStart);
        container.addEventListener("dragover", dragOver);
        container.addEventListener("drop", drop);
        container.addEventListener("dragend", dragEnd);

        itemsDiv.appendChild(container);
    });
}

/* SAVE ITEMS */
function saveItems() {
    localStorage.setItem(storageKey, JSON.stringify(items));
}

/* ADD ITEM */
function addItem() {
    const value = input.value.trim();
    if (!value) return;
    items.push({ text: value, done: false });
    input.value = "";
    renderItems();
    saveItems();
}

/* TOGGLE DONE */
function toggleDone(idx) {
    items[idx].done = !items[idx].done;
    renderItems();
    saveItems();
}

/* REMOVE ITEM */
function removeItem(idx) {
    const container = itemsDiv.children[idx];
    container.classList.add("removing");

    container.addEventListener("transitionend", function handler(e) {
        // nur auf das container selbst reagieren, nicht auf Pseudo-Elemente
        if (e.target === container) {
            items.splice(idx, 1);
            renderItems();
            saveItems();
            container.removeEventListener("transitionend", handler);
        }
    });
}


/* DRAG & DROP */
function dragStart(e) {
    dragStartIndex = Array.from(itemsDiv.children).indexOf(this);
    this.classList.add("dragging");
}

function dragOver(e) {
    e.preventDefault();
}

function drop() {
    const dragEndIndex = Array.from(itemsDiv.children).indexOf(this);
    swapItems(dragStartIndex, dragEndIndex);
    renderItems();
    saveItems();
}

function dragEnd(e) {
    this.classList.remove("dragging");
}

function swapItems(from, to) {
    const temp = items[from];
    items[from] = items[to];
    items[to] = temp;
}

/* EVENTS */
addButton.addEventListener("click", addItem);
document.addEventListener("DOMContentLoaded", loadItems);
