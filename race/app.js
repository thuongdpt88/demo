// Game State
let userPoints = 10000000;
let selectedRacerId = null;
let raceRounds = 3;
let soundEnabled = true;
let isRacing = false;
let history = [];

// Enhanced Audio Manager with more contextual sounds
// Enhanced Audio Manager with more contextual sounds
const sounds = {
    start: new Audio('https://www.soundjay.com/buttons/beep-07a.mp3'),
    theme: new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/paza-moduless.mp3'), // Upbeat BGM
    engine: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'), // Continuous Kart Engine
    cheer: new Audio('https://actions.google.com/sounds/v1/crowds/crowd_celebration.ogg'),
    bomb: new Audio('https://actions.google.com/sounds/v1/impacts/crash.ogg'),
    boost: new Audio('https://actions.google.com/sounds/v1/science_fiction/alien_beam.ogg'),
    win: new Audio('https://actions.google.com/sounds/v1/crowds/large_crowd_cheer.ogg'),
    lose: new Audio('https://actions.google.com/sounds/v1/human_voices/group_groan.ogg'),
    countdown: new Audio('https://www.soundjay.com/buttons/beep-02.mp3')
};

// Configure Loops and Volume
sounds.theme.loop = true;
sounds.engine.loop = true;

sounds.theme.volume = 0.25;  // Main BGM
sounds.engine.volume = 0.15; // Background hum
sounds.cheer.volume = 0.5;   // Events

const playSound = (key) => {
    if (!soundEnabled || !sounds[key]) return;
    try {
        if (!sounds[key].loop) {
            sounds[key].currentTime = 0;
        }
        const promise = sounds[key].play();
        if (promise) promise.catch(e => console.warn(`Audio ${key} failed:`, e));
    } catch (e) {
        console.warn("Audio error:", e);
    }
};

const stopSound = (key) => {
    if (sounds[key]) {
        sounds[key].pause();
        sounds[key].currentTime = 0;
    }
};

// Racer Data - Updated with Emoji Avatars & Kart Colors
const racers = [
    { id: 1, name: "Thỏ Siêu Tốc", avatar: "🐰", color: "#ff4757", speed: 8.5, stamina: 4, luck: 7, desc: "Siêu nhanh nhưng mau mệt", form: 0 },
    { id: 2, name: "Cáo Mưu Mẹo", avatar: "🦊", color: "#ffa502", speed: 6.5, stamina: 7, luck: 6, desc: "Chạy khéo léo, né bẫy giỏi", form: 0 },
    { id: 3, name: "Gấu Trúc", avatar: "🐼", color: "#2ed573", speed: 5.5, stamina: 9, luck: 5, desc: "Cực kỳ bền bỉ, chạy đường dài", form: 0 },
    { id: 4, name: "Mèo Mun", avatar: "🐱", color: "#1e90ff", speed: 7.2, stamina: 5, luck: 8, desc: "Nhiều may mắn bất ngờ", form: 0 },
    { id: 5, name: "Cánh Cụt", avatar: "🐧", color: "#3742fa", speed: 6.8, stamina: 6, luck: 6, desc: "Cân bằng, trượt băng nhanh", form: 0 },
    { id: 6, name: "Khủng Long", avatar: "🦖", color: "#747d8c", speed: 9.0, stamina: 3, luck: 4, desc: "Vua tốc độ, tính nóng nảy", form: 0 }
];

// Randomize form before each race
function randomizeForm() {
    racers.forEach(r => {
        r.form = 5 + Math.floor(Math.random() * 6); // 5-10
    });
}

// UI Elements
const racerListEl = document.getElementById('racerList');
const userPointsEl = document.getElementById('userPoints');
const betAmountInput = document.getElementById('betAmount');
const btnStartRace = document.getElementById('btnStartRace');
const selectedRacerNameEl = document.getElementById('selectedRacerName');
const raceModal = document.getElementById('raceModal');
const configModal = document.getElementById('configModal');
const resultModal = document.getElementById('resultModal');
const trackContainer = document.getElementById('trackContainer');
const raceEventsEl = document.getElementById('raceEvents');
const raceRoundEl = document.getElementById('raceRound');

function renderRacers() {
    racerListEl.innerHTML = racers.map(r => {
        const formColor = r.form >= 8 ? '#2ed573' : r.form >= 6 ? '#eab308' : '#ff4757';
        return `
    <div class="racer-card" onclick="selectRacer(${r.id})">
      <div class="racer-avatar" style="font-size: 60px; display: flex; align-items: center; justify-content: center;">${r.avatar}</div>
      <h4>${r.name}</h4>
      <p style="font-size: 0.8rem; margin: 5px 0; color: #94a3b8;">${r.desc}</p>
      <div class="stats-group">
        <label style="font-size: 0.75rem;">Phong độ</label>
        <div class="stats-bar"><div class="stats-fill" style="width: ${r.form * 10}%; background: ${formColor}"></div></div>
        <label style="font-size: 0.75rem;">Tốc độ</label>
        <div class="stats-bar"><div class="stats-fill" style="width: ${r.speed * 10}%"></div></div>
        <label style="font-size: 0.75rem;">Bền bỉ</label>
        <div class="stats-bar"><div class="stats-fill" style="width: ${r.stamina * 10}%; background: #3b82f6"></div></div>
      </div>
    </div>
  `;
    }).join('');
}

window.selectRacer = (id) => {
    if (isRacing) return;
    selectedRacerId = id;
    const racer = racers.find(r => r.id === id);
    selectedRacerNameEl.textContent = "Bạn chọn: " + racer.name;
    document.querySelectorAll('.racer-card').forEach((card, index) => {
        card.classList.toggle('selected', racers[index].id === id);
    });
    btnStartRace.disabled = false;
    playSound('start'); // Subtle feedback
};

// Race Logic
async function startRace() {
    const betAmount = parseInt(betAmountInput.value);
    if (betAmount > userPoints) {
        alert("Bạn không đủ điểm!");
        return;
    }

    isRacing = true;
    userPoints -= betAmount;
    updateUI();

    randomizeForm();
    renderRacers();

    raceModal.style.display = 'flex';
    initTrack();

    const totalRounds = parseInt(document.getElementById('roundsInput').value) || 3;
    const isEasy = document.getElementById('easyMode').checked;
    const finishLinePosition = 88;

    let racerLaps = racers.map(() => 0);
    let racerPositions = racers.map(() => 0);
    let racerLastPosition = racers.map(() => 0);
    let finishOrder = [];
    let winnerId = null;

    await showMarioKartCountdown();

    playSound('start');

    // Start continuous BGM and Engine
    playSound('theme');
    playSound('engine');

    // Random cheering (occasional)
    const cheerInterval = setInterval(() => {
        if (finishOrder.length < 3 && Math.random() > 0.7) {
            playSound('cheer');
        }
    }, 3500);

    window.raceCheerInterval = cheerInterval;

    await new Promise(resolve => {
        const interval = setInterval(() => {
            // --- Update Real-time Ranking ---
            const currentStandings = racers.map((r, i) => {
                const finishedIdx = finishOrder.indexOf(r.id);
                // Score: 
                // - Finished: High score based on finish order (1st = highest)
                // - Racing: Score based on laps + position
                let score = 0;
                if (finishedIdx !== -1) {
                    score = 1000000 - finishedIdx * 10000;
                } else {
                    score = racerLaps[i] * 1000 + racerPositions[i];
                }
                return { ...r, score };
            }).sort((a, b) => b.score - a.score);

            const rankingList = document.getElementById('miniRankingList');
            if (rankingList) {
                rankingList.innerHTML = currentStandings.slice(0, 3).map((r, idx) => `
                    <li class="rank-${idx + 1}" style="animation: slideIn 0.3s ease-out">
                        <span style="display:flex; align-items:center; gap:5px;">
                            ${idx === 0 ? '👑' : `#${idx + 1}`} 
                            <span style="font-size:18px;">${r.avatar}</span>
                        </span>
                        <span style="max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${r.name}</span>
                    </li>
                `).join('');
            }
            // --------------------------------

            racers.forEach((racer, i) => {
                if (finishOrder.includes(racer.id)) return;
                if (racerLaps[i] >= totalRounds) return;

                let move = (racer.speed * (0.08 + Math.random() * 0.06));
                move += (racer.form / 10) * 0.2;

                const totalProgress = (racerLaps[i] / totalRounds);
                const fatigue = totalProgress * (10 - racer.stamina);
                move = Math.max(0.05, move - fatigue * 0.03);

                if (isEasy && racer.id === selectedRacerId) {
                    move *= 1.8;
                    move += 0.3;
                }

                if (racerLaps[i] >= totalRounds - 1 && Math.random() > 0.99) {
                    const eventType = Math.random() > 0.5 ? 'bomb' : 'boost';
                    if (eventType === 'bomb' && !(isEasy && racer.id === selectedRacerId)) {
                        move -= 2;
                        createVisualEffect(i, '💣');
                        raceEventsEl.textContent = `💥 ${racer.name} dính bẫy!`;
                        playSound('bomb');
                    } else if (eventType === 'boost') {
                        move += 1.5;
                        createVisualEffect(i, '🚀');
                        raceEventsEl.textContent = `⚡ ${racer.name} tăng tốc!`;
                        playSound('boost');
                    }
                }

                racerPositions[i] += move;

                if (racerLastPosition[i] < finishLinePosition && racerPositions[i] >= finishLinePosition) {
                    racerLaps[i]++;

                    if (racerLaps[i] >= totalRounds) {
                        finishOrder.push(racer.id);
                        if (!winnerId) winnerId = racer.id;
                        if (finishOrder.length <= 3) playSound('cheer');
                    } else {
                        racerPositions[i] = 0;
                    }
                }

                racerLastPosition[i] = racerPositions[i];

                const token = document.getElementById(`token-${racer.id}`);
                if (token) {
                    token.style.left = `${Math.min(90, racerPositions[i])}%`;
                    token.style.transform = `translateY(${Math.sin(Date.now() / 100 + i) * 2}px)`;
                }
            });

            const leadLap = Math.max(...racerLaps);
            raceRoundEl.textContent = `Vòng ${leadLap} / ${totalRounds}`;

            if (finishOrder.length >= 3 || finishOrder.length === racers.length) {
                clearInterval(interval);
                resolve();
            }
        }, 50);
    });

    if (window.raceCheerInterval) clearInterval(window.raceCheerInterval);

    stopSound('engine');
    stopSound('theme');

    const winner = racers.find(r => r.id === winnerId);
    const win = winnerId === selectedRacerId;
    const payout = win ? betAmount * 5 : 0;

    userPoints += payout;
    recordHistory(winner.name, win, payout - betAmount);

    raceModal.style.display = 'none';
    showResultModal(win, winner, betAmount, payout, finishOrder);

    isRacing = false;
    updateUI();
}

async function showMarioKartCountdown() {
    const countdownEl = document.createElement('div');
    countdownEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 150px;
        font-weight: 900;
        text-shadow: 0 0 20px rgba(0,0,0,0.8);
        z-index: 10000;
        font-family: 'Outfit', sans-serif;
    `;

    const colors = ['#ef4444', '#eab308', '#2ed573'];

    for (let i = 3; i >= 1; i--) {
        countdownEl.textContent = i;
        countdownEl.style.color = colors[i - 1];
        countdownEl.style.transform = 'translate(-50%, -50%) scale(0.5)';
        countdownEl.style.opacity = '0';
        document.body.appendChild(countdownEl);

        // Simple animation
        countdownEl.animate([
            { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 1 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }
        ], { duration: 300, fill: 'forwards' });

        playSound('countdown');
        await new Promise(r => setTimeout(r, 1000));
        countdownEl.remove();
    }

    countdownEl.textContent = 'GO!';
    countdownEl.style.color = '#2ed573';
    document.body.appendChild(countdownEl);
    countdownEl.animate([
        { transform: 'translate(-50%, -50%) scale(1)' },
        { transform: 'translate(-50%, -50%) scale(2)', opacity: 0 }
    ], { duration: 800 });

    await new Promise(r => setTimeout(r, 800));
    countdownEl.remove();
}

function showResultModal(win, winner, betAmount, payout, finishOrder) {
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const fireworksCont = document.getElementById('fireworksContainer');

    fireworksCont.innerHTML = '';

    if (win) {
        resultIcon.textContent = '🏆';
        resultTitle.textContent = 'CHIẾN THẮNG!';
        resultMessage.innerHTML = `
            Chúc mừng! Bạn đã thắng lớn!<br>
            <span style="font-size: 1.5rem; color: #ffd700;">+${payout.toLocaleString()}</span> points
        `;
        playSound('win');
        launchFireworks(fireworksCont);
    } else {
        resultIcon.textContent = '😅';
        resultTitle.textContent = 'CỐ GẮNG LẦN SAU!';
        resultMessage.innerHTML = `
            Bạn đã thua cuộc đua này.<br>
            <span style="font-size: 1.2rem; color: #ff6b6b;">-${betAmount.toLocaleString()}</span> points
        `;
        playSound('lose');
    }

    // Add Podium
    if (finishOrder && finishOrder.length >= 3) {
        const top3Names = finishOrder.slice(0, 3).map(id => racers.find(r => r.id === id));
        let podiumHTML = '<div class="podium-container">';

        // 2nd Place
        podiumHTML += `
            <div class="podium-step step-2">
                <div class="podium-name">${top3Names[1].name}</div>
                <div class="podium-avatar">${top3Names[1].avatar}</div>
                <div class="podium-block">2</div>
            </div>`;

        // 1st Place
        podiumHTML += `
            <div class="podium-step step-1">
                <div class="podium-avatar">👑</div>
                <div class="podium-name" style="font-weight: bold; color: gold;">${top3Names[0].name}</div>
                <div class="podium-avatar">${top3Names[0].avatar}</div>
                <div class="podium-block">1</div>
            </div>`;

        // 3rd Place
        podiumHTML += `
            <div class="podium-step step-3">
                <div class="podium-name">${top3Names[2].name}</div>
                <div class="podium-avatar">${top3Names[2].avatar}</div>
                <div class="podium-block">3</div>
            </div>`;

        podiumHTML += '</div>';
        resultMessage.innerHTML += podiumHTML;
    }

    resultModal.style.display = 'flex';
}

function launchFireworks(container) {
    const colors = ['#ff4757', '#ffd700', '#2ed573', '#3b82f6', '#8b5cf6'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const x = Math.random() * container.offsetWidth;
            const y = Math.random() * container.offsetHeight;
            createFirework(container, x, y, colors[Math.floor(Math.random() * colors.length)]);
        }, i * 50);
    }
}

function createFirework(container, x, y, color) {
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = color;

        const angle = (Math.PI * 2 * i) / 12;
        const velocity = 50 + Math.random() * 50;
        particle.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
        particle.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

function initTrack() {
    trackContainer.innerHTML = racers.map((r, i) => {
        const isSelected = r.id === selectedRacerId ? 'user-pick' : '';
        return `
    <div class="track-line">
      <div id="token-${r.id}" class="racer-token ${isSelected}">
        <div class="kart-wrap">
            <div class="kart-body" style="--kart-color: ${r.color};">
                <div class="kart-wheel wheel-front"></div>
                <div class="kart-wheel wheel-back"></div>
                <div class="kart-spoiler"></div>
            </div>
            <div class="driver-avatar">${r.avatar}</div>
        </div>
      </div>
    </div>
  `;
    }).join('') + '<div class="finish-line"></div>';
}

function createVisualEffect(racerIdx, text) {
    const el = document.createElement('div');
    el.className = 'bomb-effect';
    el.textContent = text;
    el.style.left = '50%';
    el.style.top = `${racerIdx * 60}px`;
    trackContainer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
    // Sound now played in race logic for better context
}

function updateUI() {
    userPointsEl.textContent = userPoints.toLocaleString();
}

function recordHistory(winner, isWin, profit) {
    const item = {
        time: new Date().toLocaleTimeString(),
        winner,
        status: isWin ? 'Thắng' : 'Thua',
        profit
    };
    history.unshift(item);
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = history.slice(0, 10).map(h => `
        <div class="history-item">
            <span style="color: grey">${h.time}</span> | 
            <b>${h.winner}</b> | 
            <span style="color: ${h.profit >= 0 ? 'var(--secondary-color)' : 'var(--primary-color)'}">
                ${h.profit >= 0 ? '+' : ''}${h.profit.toLocaleString()}
            </span>
        </div>
    `).join('');
}

// Event Listeners
btnStartRace.addEventListener('click', startRace);
document.getElementById('btnConfig').addEventListener('click', () => configModal.style.display = 'flex');
document.getElementById('saveConfig').addEventListener('click', () => {
    raceRounds = parseInt(document.getElementById('roundsInput').value);
    soundEnabled = document.getElementById('soundToggle').checked;
    configModal.style.display = 'none';
});
document.getElementById('btnCloseResult').addEventListener('click', () => {
    resultModal.style.display = 'none';
});

// Close modals on outside click
window.onclick = (event) => {
    if (event.target == configModal) configModal.style.display = "none";
    if (event.target == resultModal) resultModal.style.display = "none";
};

// Init
randomizeForm();
renderRacers();
updateUI();

// Resume audio context on first interaction
document.addEventListener('click', () => {
    if (typeof AudioContext !== 'undefined') {
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') ctx.resume();
    }
}, { once: true });
