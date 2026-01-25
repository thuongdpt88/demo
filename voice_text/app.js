// Simple Web Speech API demo (vanilla JS)
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');
const interimEl = document.getElementById('interim');
const finalEl = document.getElementById('final');
const langSelect = document.getElementById('lang');

let recognition = null;
let listening = false;

function supportsSpeechAPI() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function createRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const r = new SpeechRecognition();
  r.continuous = true; // keep receiving
  r.interimResults = true; // show interim results
  // set language
  const lang = langSelect.value;
  r.lang = (lang === 'auto') ? navigator.language || 'vi-VN' : lang;

  r.onstart = () => {
    listening = true;
    statusEl.textContent = 'Status: Listening...';
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  r.onend = () => {
    listening = false;
    statusEl.textContent = 'Status: Idle';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  r.onerror = (e) => {
    console.error('SpeechRecognition error', e);
    statusEl.textContent = 'Error: ' + (e.error || 'unknown');
  };

  r.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const res = event.results[i];
      if (res.isFinal) {
        const text = res[0].transcript.trim();
        appendFinal(text);
      } else {
        interim += res[0].transcript;
      }
    }
    interimEl.textContent = interim;
  };

  return r;
}

function appendFinal(text) {
  if (!text) return;
  finalEl.textContent += text + '\n';
}

startBtn.addEventListener('click', async () => {
  if (!supportsSpeechAPI()) {
    alert('Web Speech API not supported in this browser. Please use Chrome or Edge.');
    return;
  }

  // (re)create recognition to pick up lang changes
  recognition = createRecognition();
  try {
    recognition.start();
  } catch (err) {
    // starting twice throws in some browsers
    console.warn('Start error', err);
  }
});

stopBtn.addEventListener('click', () => {
  if (recognition && listening) {
    recognition.stop();
  }
});

// change language while running: restart recognition
langSelect.addEventListener('change', () => {
  if (listening && recognition) {
    recognition.onend = null; // prevent resetting UI twice
    recognition.stop();
    // small delay to allow stop
    setTimeout(() => {
      recognition = createRecognition();
      recognition.start();
    }, 200);
  }
});

// initialize UI
if (!supportsSpeechAPI()) {
  statusEl.textContent = 'Status: Browser does not support Web Speech API.';
  startBtn.disabled = true;
}