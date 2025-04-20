let tasks = []
let total = 0
let done = 0
let not_done = 0

window.onload = function(){
    loadFromLocalStorage() 
    updateTaskHighlights()// Завантажуємо задачі та лічильники
    
}

setInterval(() => {
    updateTaskHighlights();
    updateCounters(); // оновлення також overdue
}, 60000);


inputText.addEventListener('keydown', function(e){
    if (e.key === 'Enter') change_text()
})

function change_text() {
    const inputText = document.getElementById("inputText")
    const text = inputText.value.trim()
    const deadLineInput = document.getElementById('deadLineInput')
    const deadLine = deadLineInput.value

    if (text === '') return

    const task = {
        id: Date.now(),
        text: text,
        done: false,
        deadLine: deadLine
    }

    tasks.push(task)
    total++
    not_done++

    saveTasksToLocalStorage()
    renderTask(task)

    inputText.value = ''
    updateCounters() // Оновлюємо лічильники
}

function renderTask(task) {
    const mainDiv = document.getElementById('div1');

    const div = document.createElement("div");
    div.className = 'box';
    div.setAttribute('data-id', task.id);

    const p = document.createElement("p");
    p.innerText = task.text;
    if (task.done) {
        p.classList.add('done');
    }


    // 🔴 ПЕРЕНОСИМО дедлайн сюди, після створення div і p:
    if (task.deadLine) {
        const deadLineDate = new Date(task.deadLine);

        if (!task.done) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const deadlineDay = new Date(deadLineDate.getFullYear(), deadLineDate.getMonth(), deadLineDate.getDate());
        
            const timeDiff = deadlineDay - today;
            const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
            if (dayDiff < 0) {
                div.style.backgroundColor = '#ffe6e6';
            } else if (dayDiff === 0) {
                div.style.backgroundColor = '#fffda1';
            } else if (dayDiff === 1) {
                div.style.backgroundColor = '#f2cd7c';
            }
        }

        // Створюємо таймер
        const timerSpan = document.createElement('span');
        timerSpan.className = 'countdown';
        p.appendChild(timerSpan);

        function updateCountdown() {
            const now = new Date();
            const diff = deadLineDate - now;

            if (diff <= 0) {
                timerSpan.innerText = ' ⛔ Deadline missed!';
                div.style.backgroundColor = '#ffe6e6';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            timerSpan.innerText = ` ⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    

    // Далі все як було
    p.addEventListener('click', function () {
        const input = document.createElement('input');
        input.value = p.innerText;
        input.id = 'inputEdit-' + task.id;
        div.insertBefore(input, p);
        p.style.display = 'none';

        input.addEventListener('blur', function () {
            if (input.value.trim() !== '') {
                p.innerText = input.value;
                task.text = input.value;
                p.style.display = 'block';
                input.remove();
                saveTasksToLocalStorage();
            } else {
                p.style.display = 'block';
                input.remove();
            }
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    });

    div.appendChild(p);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', function () {
        task.done = checkbox.checked;
        if (checkbox.checked) {
            p.classList.add('done');
            div.style.backgroundColor = '#80f27c';
            done++;
            not_done--;
        } else {
            p.classList.remove('done');
            div.style.backgroundColor = '#fcfcfc';
            done--;
            not_done++;
        }
        saveTasksToLocalStorage();
        updateCounters();
    });
    div.appendChild(checkbox);

    const edit = document.createElement('button');
    edit.innerText = 'Edit';
    edit.classList.add('btn-edit');
    div.appendChild(edit);

    const delete_butn = document.createElement('button');
    delete_butn.innerText = 'Delete';
    delete_butn.classList.add('btn-delete');
    delete_butn.addEventListener('click', function () {
        div.remove();
        tasks = tasks.filter(t => t.id !== task.id);

        total--;
        if (task.done) {
            done--;
        } else {
            not_done--;
        }

        saveTasksToLocalStorage();
        updateCounters();
    });

    div.appendChild(delete_butn);

    mainDiv.appendChild(div);
}



function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks))
    saveCountersToLocalStorage() // Зберігаємо лічильники в localStorage
}

function saveCountersToLocalStorage(){
    localStorage.setItem('total', total)
    localStorage.setItem('done', done)
    localStorage.setItem('not_done', not_done)
}

function loadFromLocalStorage(){
    const savedTasks = localStorage.getItem('tasks')
    const savedTotal = localStorage.getItem('total')
    const savedDone = localStorage.getItem('done')
    const savedNotDone = localStorage.getItem('not_done')

    if (savedTasks) {
        tasks = JSON.parse(savedTasks)
        tasks.forEach(task => renderTask(task))
    }

    if (savedTotal) {
        total = parseInt(savedTotal)
    }
    if (savedDone) {
        done = parseInt(savedDone)
    }
    if (savedNotDone) {
        not_done = parseInt(savedNotDone)
    }

    updateCounters() // Оновлюємо лічильники після завантаження
}

function updateCounters(){
    if (total < 0) total = 0
    if (not_done < 0) not_done = 0

    document.getElementById('total').innerText = `Total: ${total}`
    document.getElementById('done').innerText = `Done: ${done}`
    document.getElementById('not_done').innerText = `Not Done: ${not_done}`

    // 🔥 ПІДРАХУНОК ПРОСТРОЧЕНИХ:
    const now = new Date()
    const overdueCount = tasks.filter(task => {
        const deadline = task.deadLine ? new Date(task.deadLine) : null
        return deadline && deadline < now && !task.done
    }).length

    const overdueEl = document.getElementById('overdueCount')
    overdueEl.innerText = overdueCount

    const filterOverdueBtn = document.getElementById('filterOverdue')

    if (overdueCount > 0) {
        overdueEl.style.color = 'red'
        overdueEl.style.fontWeight = 'bold'
        filterOverdueBtn.style.backgroundColor = '#ffcccc'
        filterOverdueBtn.style.border = '1px solid red'
        filterOverdueBtn.style.fontWeight = 'bold'
    } else {
        overdueEl.style.color = ''
        overdueEl.style.fontWeight = ''
        filterOverdueBtn.style.backgroundColor = ''
        filterOverdueBtn.style.border = ''
        filterOverdueBtn.style.fontWeight = ''
    }
}




function filterTasks(type) {
    const boxes = document.querySelectorAll('.box')

    boxes.forEach(box => {
        const taskId = parseInt(box.getAttribute('data-id'))
        const task = tasks.find(t => t.id === taskId)

        if (!task) return

        if (type === 'all') {
            box.style.display = 'flex'
        } else if (type === 'done') {
            box.style.display = task.done ? 'flex' : 'none'
        } else if (type === 'not_done') {
            box.style.display = !task.done ? 'flex' : 'none'
        } else if (type === 'overdue') {
            const now = new Date()
            const deadline = task.deadLine ? new Date(task.deadLine) : null

            const isOverdue = deadline && (deadline < now) && !task.done
            box.style.display = isOverdue ? 'flex' : 'none'
        }
    })
}


document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const mainDiv = document.getElementById('div1');

    if (query === '') {
        // Очищаємо всі задачі з екрана
        mainDiv.innerHTML = '';
        // Відображаємо всі задачі в початковому порядку
        tasks.forEach(task => renderTask(task));
    } else {
        const taskElements = Array.from(document.querySelectorAll('#div1 .box'));

        taskElements.forEach(taskEl => {
            const text = taskEl.querySelector('p').innerText.toLowerCase();

            if (text.includes(query)) {
                taskEl.style.display = 'flex';
                mainDiv.insertBefore(taskEl, mainDiv.firstChild); // переносимо вверх
            } else {
                taskEl.style.display = 'none';
            }
        });
    }
});

function updateTaskHighlights() {
    const boxes = document.querySelectorAll('.box');

    boxes.forEach(box => {
        const taskId = parseInt(box.getAttribute('data-id'));
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.deadLine) return;

        const div = box;
        const deadLineDate = new Date(task.deadLine);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const deadlineDay = new Date(deadLineDate.getFullYear(), deadLineDate.getMonth(), deadLineDate.getDate());

        const timeDiff = deadlineDay - today;
        const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (task.done) {
            div.style.backgroundColor = '#e6ffe6'; // виконано
        } else {
            if (dayDiff < 0) {
                div.style.backgroundColor = '#ffe6e6'; // прострочено
            } else if (dayDiff === 0) {
                div.style.backgroundColor = '#fff3cd'; // сьогодні
            } else if (dayDiff === 1) {
                div.style.backgroundColor = '#ffecc7'; // завтра
            } else {
                div.style.backgroundColor = ''; // скидуємо, якщо без дедлайну або далеко
            }
        }
    });
}

function sortByDeadline() {
    // Сортуємо tasks по дедлайну
    tasks.sort((a, b) => {
        if (!a.deadLine && !b.deadLine) return 0;
        if (!a.deadLine) return 1;
        if (!b.deadLine) return -1;
        return new Date(a.deadLine) - new Date(b.deadLine);
    });

    // Зберігаємо оновлений порядок у localStorage
    saveTasksToLocalStorage();

    // Очищуємо основний контейнер
    const mainDiv = document.getElementById('div1');
    mainDiv.innerHTML = '';

    // Ререндеримо задачі у новому порядку
    tasks.forEach(task => renderTask(task));
}


function sortByDeadline() {
    // Сортуємо tasks по дедлайну
    tasks.sort((a, b) => {
        if (!a.deadLine && !b.deadLine) return 0;
        if (!a.deadLine) return 1;
        if (!b.deadLine) return -1;
        return new Date(a.deadLine) - new Date(b.deadLine);
    });

    saveTasksToLocalStorage();

    const mainDiv = document.getElementById('div1');
    mainDiv.innerHTML = '';

    tasks.forEach(task => renderTask(task));
}

function deleteTask(box) {
    box.classList.add("removing");
    setTimeout(() => {
        box.remove();
        updateCounters();
    }, 400); // 400 мс = тривалість анімації
}

function toggleTheme() {
    document.body.classList.toggle("dark");

    // Збереження теми в localStorage
    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}

// При завантаженні перевірити localStorage
window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }
});
