let items = [];
const itemsDiv = document.getElementById("items");
const input = document.getElementById("itemInput");
const addButton = document.getElementById("addButton");
const storageKey = "items";
let dragStartIndex = null;

// Dark Mode
const darkModeToggle = document.getElementById("darkModeToggle");

function applySmartDarkMode() {
    const hour = new Date().getHours();
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if(prefersDark || hour >= 19 || hour < 6){
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode","true");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode","false");
    }
    updateDarkModeIcon();
}

function updateDarkModeIcon(){
    darkModeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
}

darkModeToggle.addEventListener("click",()=>{
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode",document.body.classList.contains("dark-mode"));
    updateDarkModeIcon();
});

// ==================== TODO ====================
function loadItems() {
    const saved = localStorage.getItem(storageKey);
    if(saved) items = JSON.parse(saved);
    items.forEach(item=>{if(!item.subtasks)item.subtasks=[];});
    renderItems();
}

function renderItems() {
    itemsDiv.innerHTML = "";
    items.forEach((item, idx)=>{
        const container = document.createElement("div");
        container.classList.add("todo-container");
        container.setAttribute("draggable", true);

        const text = document.createElement("p");
        text.textContent = item.text;
        if(item.done) text.classList.add("done");

        const btnGroup = document.createElement("div");
        btnGroup.classList.add("button-group");

        const doneBtn = document.createElement("button");
        doneBtn.classList.add("done-btn");
        if(item.subtasks.length>0 && !item.subtasks.every(s=>s.done)){
            doneBtn.disabled = true; doneBtn.style.opacity=0.5;
        }
        doneBtn.addEventListener("click",()=>toggleDone(idx));

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click",()=>removeItem(idx));

        btnGroup.appendChild(doneBtn); btnGroup.appendChild(deleteBtn);

        const header = document.createElement("div");
        header.classList.add("todo-header");
        header.appendChild(text); header.appendChild(btnGroup);
        container.appendChild(header);

        // Subtasks
        const subList = document.createElement("ul");
        subList.classList.add("subtask-list");
        item.subtasks.forEach((sub, subIdx)=>{
            const li = document.createElement("li");
            li.classList.add("subtask-item");

            const subText = document.createElement("span");
            subText.textContent = sub.text;
            if(sub.done) subText.classList.add("done");

            const subBtnGroup = document.createElement("div");
            subBtnGroup.classList.add("button-group");

            const subDone = document.createElement("button");
            subDone.classList.add("sub-done-btn");
            subDone.addEventListener("click",()=>toggleSubDone(idx,subIdx));

            const subDelete = document.createElement("button");
            subDelete.classList.add("sub-delete-btn");
            subDelete.addEventListener("click",()=>removeSubtask(idx,subIdx));

            subBtnGroup.appendChild(subDone); subBtnGroup.appendChild(subDelete);
            li.appendChild(subText); li.appendChild(subBtnGroup);
            subList.appendChild(li);
        });
        container.appendChild(subList);

        // Subtask Input
        const subInputContainer = document.createElement("div");
        subInputContainer.classList.add("sub-input-container");

        const subInput = document.createElement("input");
        subInput.type="text"; subInput.placeholder="Add a subtask...";
        subInput.disabled = item.done;

        const subAddBtn = document.createElement("button");
        subAddBtn.classList.add("add-sub-btn"); subAddBtn.textContent = "+";
        subAddBtn.disabled = item.done;
        subAddBtn.addEventListener("click",()=>{
            addSubtask(idx, subInput.value.trim()); subInput.value="";
        });

        subInput.addEventListener("keydown",(e)=>{
            if(e.key==="Enter"){ addSubtask(idx, subInput.value.trim()); subInput.value=""; }
        });

        subInputContainer.appendChild(subInput); subInputContainer.appendChild(subAddBtn);
        container.appendChild(subInputContainer);

        // Drag & Drop
        container.addEventListener("dragstart", dragStart);
        container.addEventListener("dragover", dragOver);
        container.addEventListener("drop", drop);
        container.addEventListener("dragend", dragEnd);

        itemsDiv.appendChild(container);
    });
}

function saveItems(){ localStorage.setItem(storageKey,JSON.stringify(items)); }
function addItem(){ const val=input.value.trim(); if(!val) return; items.push({text:val,done:false,subtasks:[]}); input.value=""; renderItems(); saveItems();}
function addSubtask(todoIdx,text){ if(!text) return; items[todoIdx].subtasks.push({text,done:false}); renderItems(); saveItems();}
function toggleDone(idx){ const task=items[idx]; if(task.subtasks.length>0 && !task.subtasks.every(s=>s.done)){ alert("Bitte erst alle Subtasks erledigen!"); return; } task.done=!task.done; renderItems(); saveItems(); checkAllDone(); }
function toggleSubDone(todoIdx,subIdx){ items[todoIdx].subtasks[subIdx].done=!items[todoIdx].subtasks[subIdx].done; renderItems(); saveItems(); checkAllDone(); }
function removeItem(idx){ items.splice(idx,1); renderItems(); saveItems(); }
function removeSubtask(todoIdx,subIdx){ items[todoIdx].subtasks.splice(subIdx,1); renderItems(); saveItems(); }
function checkAllDone(){ if(items.length>0 && items.every(item=>item.done && item.subtasks.every(s=>s.done))) celebrateConfetti(); }

// Drag & Drop
function dragStart(e){ dragStartIndex=Array.from(itemsDiv.children).indexOf(this); this.classList.add("dragging"); }
function dragOver(e){ e.preventDefault(); }
function drop(){ const dragEndIndex=Array.from(itemsDiv.children).indexOf(this); [items[dragStartIndex],items[dragEndIndex]]=[items[dragEndIndex],items[dragStartIndex]]; renderItems(); saveItems(); }
function dragEnd(e){ this.classList.remove("dragging"); }

// Confetti
function celebrateConfetti(){
    const confettiContainer=document.createElement("div");
    confettiContainer.style.position="fixed"; confettiContainer.style.top=0; confettiContainer.style.left=0;
    confettiContainer.style.width="100%"; confettiContainer.style.height="100%";
    confettiContainer.style.pointerEvents="none"; confettiContainer.style.overflow="hidden"; confettiContainer.style.zIndex=9999;
    document.body.appendChild(confettiContainer);
    const colors=["#f6b1c8","#9cccf3","#fff176","#ffffff"];
    for(let i=0;i<100;i++){
        const confetti=document.createElement("div");
        confetti.style.position="absolute"; confetti.style.width="8px"; confetti.style.height="8px";
        confetti.style.backgroundColor=colors[Math.floor(Math.random()*colors.length)];
        confetti.style.left=Math.random()*100+"%"; confetti.style.top="-10px";
        confetti.style.opacity=Math.random()*0.8+0.2; confetti.style.transform=`rotate(${Math.random()*360}deg)`; confetti.style.borderRadius="50%";
        confettiContainer.appendChild(confetti);
        const fall=confetti.animate([{transform:confetti.style.transform+" translateY(0px)"},{transform:confetti.style.transform+" translateY(100vh)"}],{duration:2000+Math.random()*2000,iterations:1,easing:"ease-out"});
        fall.onfinish=()=>confetti.remove();
    }
    setTimeout(()=>confettiContainer.remove(),3000);
}

// Events
addButton.addEventListener("click",addItem);
input.addEventListener("keydown",e=>{ if(e.key==="Enter") addItem(); });

document.addEventListener("DOMContentLoaded",()=>{
    const stored=localStorage.getItem("darkMode");
    if(stored==="true") document.body.classList.add("dark-mode");
    else if(stored==="false") document.body.classList.remove("dark-mode");
    else applySmartDarkMode();
    updateDarkModeIcon();
    loadItems();
});
setInterval(applySmartDarkMode,60*60*1000);
