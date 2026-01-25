// Modern Web Speech API Transcriber
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const interimEl = document.getElementById('interim');
const finalEl = document.getElementById('final');
const langSelect = document.getElementById('lang');

let recognition = null;
let listening = false;

function supportsSpeechAPI() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function updateStatus(state) {
  if (state === 'listening') {
    document.body.classList.add('listening');
    statusBadge.classList.add('listening');
    statusText.textContent = 'Listening...';
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else if (state === 'idle') {
    document.body.classList.remove('listening');
    statusBadge.classList.remove('listening');
    statusText.textContent = 'Ready';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  } else if (state === 'error') {
    document.body.classList.remove('listening');
    statusBadge.classList.remove('listening');
    statusText.textContent = 'Error';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

function createRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const r = new SpeechRecognition();
  r.continuous = true;
  r.interimResults = true;

  // set language
  const lang = langSelect.value;
  r.lang = (lang === 'auto') ? navigator.language || 'vi-VN' : lang;

  r.onstart = () => {
    listening = true;
    updateStatus('listening');
  };

  r.onend = () => {
    listening = false;
    updateStatus('idle');
  };

  r.onerror = (e) => {
    console.error('SpeechRecognition error', e);
    updateStatus('error');
    if (e.error === 'not-allowed') {
      alert('Microphone access denied. Please allow microphone permissions.');
    }
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
    interimEl.textContent = interim || (listening ? "Listening for voice..." : "Voice captured.");
  };

  return r;
}

function appendFinal(text) {
  if (!text) return;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedText = `[${timestamp}] ${text}\n`;
  finalEl.textContent += formattedText;

  // Auto scroll to bottom
  finalEl.scrollTop = finalEl.scrollHeight;
}

startBtn.addEventListener('click', async () => {
  if (!supportsSpeechAPI()) {
    alert('Web Speech API not supported in this browser. Please use Chrome or Edge.');
    return;
  }

  recognition = createRecognition();
  try {
    recognition.start();
  } catch (err) {
    console.warn('Start error', err);
  }
});

stopBtn.addEventListener('click', () => {
  if (recognition && listening) {
    recognition.stop();
  }
});

clearBtn.addEventListener('click', () => {
  if (confirm('Clear all transcript?')) {
    finalEl.textContent = '';
  }
});

copyBtn.addEventListener('click', () => {
  const text = finalEl.textContent;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const originalContent = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i data-lucide="check"></i>';
    lucide.createIcons();
    setTimeout(() => {
      copyBtn.innerHTML = originalContent;
      lucide.createIcons();
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
});

langSelect.addEventListener('change', () => {
  if (listening && recognition) {
    recognition.onend = null;
    recognition.stop();
    setTimeout(() => {
      recognition = createRecognition();
      recognition.start();
    }, 200);
  }
});

// Initialize
if (!supportsSpeechAPI()) {
  statusText.textContent = 'Unsupported';
  startBtn.disabled = true;
}