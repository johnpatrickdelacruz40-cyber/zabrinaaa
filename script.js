let currentLevel = 0, jigsawLevel = 0, userGuess = "", selectedPiece = null;
let currentAudio = new Audio(), voicemailAudio = new Audio(), isMusicStarted = false;

// MUSIC CONTROLLER
function playMusic(track, vol = 1.0) {
    currentAudio.pause();
    currentAudio = new Audio(`music/${track}.mp3`);
    currentAudio.volume = vol;
    currentAudio.loop = (track !== 'message');
    currentAudio.play().catch(e => console.log("Interaction needed"));
}

document.addEventListener('click', () => {
    if (!isMusicStarted) { playMusic('login'); isMusicStarted = true; }
}, { once: true });

function moveFocus(input, index) {
    if (input.value && index < 5) document.querySelectorAll('.pass-box')[index + 1].focus();
}

function checkPassword() {
    let pass = Array.from(document.querySelectorAll('.pass-box')).map(b => b.value).join('');
    if (pass === "091125") { showScreen("menu-screen"); playMusic('menu'); spawnHearts(); }
    else alert("Incorrect key, Zabrina! 💙");
}

/* --- GAME DATA --- */
const game1Data = [
    { q: "Where did we first meet?", a: "GROW A GARDEN" },
    { q: "Where did we first chat?", a: "INSTAGRAM" },
    { q: "The 3rd social media where we followed each other?", a: "TIKTOK" },
    { q: "What was my first favorite Indonesian word?", a: "RAHASIA" },
    { q: "Tagalog translation for 'Apa lah'?", a: "ANO NGA" },
    { q: "Where is my university located?", a: "MALOLOS" },
    { q: "In which town do I live?", a: "BULAKAN" },
    { q: "Who is the 'Full Sun' that brightens your day?", a: "HAECHAN" },
    { q: "Cloud-colored, liquid, 'spoiled.' What am I?", a: "MILK" },
    { q: "What is the thing I say to you the most?", a: "I LOVE YOU" }
];

const game2Data = [
    { a: "PUNCAK", img: "images/4pics_1.jpg" },
    { a: "SLEEP CALL", img: "images/4pics_2.jpg" },
    { a: "EXERCISE", img: "images/4pics_3.jpg" },
    { a: "ANNOYED", img: "images/4pics_4.jpg" },
    { a: "ENAK", img: "images/4pics_5.jpg" },
    { a: "BALUT", img: "images/4pics_6.jpg" },
    { a: "STINKY", img: "images/4pics_7.jpg" }
];

const jigsawData = [
    { name: "Wan", size: 3, img: "images/wan.png" },
    { name: "Tu", size: 4, img: "images/tu.png" },
    { name: "Tri", size: 5, img: "images/tri.jpg" }
];

function showScreen(id) {
    document.querySelectorAll('.vault-container, .credits-wrap, #game3-screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

function unlockNext(num) {
    showScreen("menu-screen");
    playMusic('menu');
    let nextBtn = (num === 4) ? document.getElementById("btn-reward") : document.getElementById(`btn-game${num}`);
    nextBtn.disabled = false;
    nextBtn.classList.remove("locked");
    nextBtn.classList.add("active-game");
    if(num > 1) document.getElementById(`btn-game${num-1}`).classList.remove("active-game");
}

/* REWARD: Playing both music and voicemail */
function showReward() {
    showScreen('ending-screen');
    
    // 1. Play reward.mp3 at low volume (0.3)
    playMusic('reward', 0.3);
    
    // 2. Play message.mp3 after 1 second at full volume (1.0)
    setTimeout(() => {
        voicemailAudio = new Audio('music/message.mp3');
        voicemailAudio.volume = 1.0;
        voicemailAudio.play();
    }, 1000);
    
    document.getElementById('final-message').classList.add('scroll-active');
}

function startGame1() { playMusic('game1'); currentLevel = 0; showScreen("game1-screen"); loadG1(); }
function startGame2() { playMusic('game2'); currentLevel = 0; showScreen("game2-screen"); loadG2(); }
function startGame3() { playMusic('game3'); jigsawLevel = 0; showScreen("game3-screen"); initPuzzle(); }

function loadG1() { userGuess = ""; setupDisplay("g1", game1Data[currentLevel].a); document.getElementById("g1-question").innerText = game1Data[currentLevel].q; }
function loadG2() { userGuess = ""; setupDisplay("g2", game2Data[currentLevel].a); document.getElementById("collage-img").src = game2Data[currentLevel].img; }

function setupDisplay(prefix, answer) {
    const slots = document.getElementById(`${prefix}-slots`);
    slots.innerHTML = "";
    for(let char of answer) slots.innerHTML += `<span class="slot ${char === ' ' ? 'space' : ''}">${char === ' ' ? ' ' : '_'}</span>`;
    const opts = document.getElementById(`${prefix}-options`);
    opts.innerHTML = "";
    let letters = answer.replace(/\s/g, '').split('');
    while(letters.length < 20) letters.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random()*26)]);
    letters.sort(() => 0.5 - Math.random()).forEach(l => {
        opts.innerHTML += `<button onclick="handleType('${l}', '${prefix}')">${l}</button>`;
    });
}

function handleType(char, prefix) {
    const data = (prefix === "g1") ? game1Data[currentLevel] : game2Data[currentLevel];
    const answer = data.a;
    let cleanAnswer = answer.replace(/\s/g, '');
    if (userGuess.length < cleanAnswer.length) {
        userGuess += char;
        const slots = document.querySelectorAll(`#${prefix}-slots .slot:not(.space)`);
        slots[userGuess.length - 1].innerText = char;
    }
    let currentInput = "";
    let guessIdx = 0;
    for(let i=0; i<answer.length; i++) {
        if(answer[i] === " ") currentInput += " ";
        else { currentInput += userGuess[guessIdx] || ""; guessIdx++; }
    }
    if (currentInput === answer) {
        setTimeout(() => {
            currentLevel++;
            if(prefix === "g1" && currentLevel < game1Data.length) loadG1();
            else if (prefix === "g1") unlockNext(2);
            else if (prefix === "g2" && currentLevel < game2Data.length) loadG2();
            else if (prefix === "g2") unlockNext(3);
        }, 300);
    }
}

function resetGuess(p) { userGuess = ""; document.querySelectorAll(`#${p}-slots .slot:not(.space)`).forEach(s => s.innerText = "_"); }

function initPuzzle() {
    const data = jigsawData[jigsawLevel];
    const board = document.getElementById("puzzle-board");
    board.style.gridTemplateColumns = `repeat(${data.size}, 1fr)`;
    board.innerHTML = "";
    let order = Array.from(Array(data.size*data.size).keys()).sort(() => Math.random() - 0.5);
    order.forEach((pos) => {
        const piece = document.createElement("div");
        piece.className = "puzzle-piece";
        piece.dataset.orig = pos;
        const s = 300/data.size;
        piece.style.width = s+"px"; piece.style.height = s+"px";
        piece.style.backgroundImage = `url('${data.img}')`;
        piece.style.backgroundPosition = `-${(pos%data.size)*s}px -${Math.floor(pos/data.size)*s}px`;
        piece.style.backgroundSize = "300px 300px";
        piece.onclick = () => {
            if(!selectedPiece) { selectedPiece = piece; piece.style.outline = "4px solid white"; }
            else {
                let tBG = piece.style.backgroundPosition; let tO = piece.dataset.orig;
                piece.style.backgroundPosition = selectedPiece.style.backgroundPosition;
                piece.dataset.orig = selectedPiece.dataset.orig;
                selectedPiece.style.backgroundPosition = tBG;
                selectedPiece.dataset.orig = tO;
                selectedPiece.style.outline = "none"; selectedPiece = null;
                let win = true; document.querySelectorAll(".puzzle-piece").forEach((p,i) => { if(parseInt(p.dataset.orig) !== i) win = false; });
                if(win) setTimeout(() => { jigsawLevel++; if(jigsawLevel < 3) initPuzzle(); else unlockNext(4); }, 500);
            }
        };
        board.appendChild(piece);
    });
}

function spawnHearts() {
    setInterval(() => {
        const h = document.createElement("div"); h.className = "heart"; h.innerHTML = "💙";
        h.style.left = Math.random()*100+"vw"; document.getElementById("heart-bg").appendChild(h);
        setTimeout(() => h.remove(), 6000);
    }, 500);
}

window.onload = () => spawnHearts();