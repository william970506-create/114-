const guessSubmit = document.querySelector(".guessSubmit");
const guessField = document.querySelector(".guessField");
const result = document.querySelector(".result");
const count = document.querySelector(".count");

let countNum = 0;   //廣域變數
const answer = Math.floor(Math.random() * 100) + 1; //隨機答案

function checkGuess() {
    countNum++;
    count.textContent = "猜測次數：" + countNum;
    const userGuess = Number(guessField.value);  //取得欄位值，並轉為數字

    if (userGuess === answer) {
        result.textContent = "猜測結果：Congratulations!";
    } else if (userGuess < answer) {
        result.textContent = "猜測結果：數字太小!";
    } else if (userGuess > answer) {
        result.textContent = "猜測結果：數字太大!";
    }
    guessField.focus(); //游標焦點預設在輸入欄位裡
}

guessSubmit.addEventListener("click", checkGuess);   //當按鈕被點擊，執行函式
(() => {
  // DOM
  const guessField = document.getElementById('guessField');
  const submitBtn = document.querySelector('.guessSubmit');
  const resultDiv = document.getElementById('result');
  const countDiv = document.getElementById('count');
  const prevDiv = document.getElementById('prevGuesses');
  const badge = document.getElementById('statusBadge');
  const card = document.querySelector('.card');
  const confettiCanvas = document.getElementById('confetti');

  if (!guessField || !submitBtn || !resultDiv || !countDiv) {
    console.error('必要的 DOM 元素不存在。請確認 guess.html 與 guess.js 在同一資料夾且標記正確。');
    return;
  }

  // game state
  const secret = Math.floor(Math.random() * 100) + 1;
  let countNum = 0;
  const guesses = [];

  // WebAudio
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioCtx ? new AudioCtx() : null;

  function unlockAudioOnce() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
    document.body.removeEventListener('pointerdown', unlockAudioOnce);
    document.body.removeEventListener('keydown', unlockAudioOnce);
  }
  document.body.addEventListener('pointerdown', unlockAudioOnce);
  document.body.addEventListener('keydown', unlockAudioOnce);

  function playTone(freq, duration = 120, type = 'sine', gain = 0.05) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(gain, now);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(now);
    o.stop(now + duration / 1000);
  }

  function playWinMelody() {
    if (!audioCtx) return;
    const notes = [660, 880, 990];
    notes.forEach((n, i) => setTimeout(()=>playTone(n, 150, 'sine', 0.08), i * 160));
  }

  // confetti
  function triggerConfetti(duration = 1400) {
    if (!confettiCanvas || !confettiCanvas.getContext) return;
    const ctx = confettiCanvas.getContext('2d');
    const w = confettiCanvas.width = confettiCanvas.clientWidth;
    const h = confettiCanvas.height = confettiCanvas.clientHeight;
    const pieces = [];
    const colors = ['#FF5C7C','#FFD166','#06D6A0','#4D96FF','#B497FF'];
    for (let i = 0; i < 80; i++) {
      pieces.push({
        x: Math.random() * w,
        y: -10 - Math.random() * h,
        vx: (Math.random() - 0.5) * 6,
        vy: 1 + Math.random() * 6,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10
      });
    }
    const start = performance.now();
    function draw(now) {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (t < duration) requestAnimationFrame(draw);
      else ctx.clearRect(0,0,w,h);
    }
    requestAnimationFrame(draw);
  }

  // helpers
  function setBadge(text, color) {
    if (!badge) return;
    badge.textContent = text;
    badge.style.color = color || '';
    badge.style.borderColor = 'rgba(255,255,255,0.03)';
  }

  function evaluateByCount(c) {
    if (c === 1) return {title:'神射手！', desc:'一發入魂', color:'#f1c40f'};
    if (c <= 3) return {title:'極佳', desc:'很少次數就猜中', color:'#10b981'};
    if (c <= 6) return {title:'不錯', desc:'有耐心與邏輯', color:'#06b6d4'};
    if (c <= 10) return {title:'還行', desc:'繼續練習會更快', color:'#f97316'};
    return {title:'加油', desc:'多練習，會變更準', color:'#ef4444'};
  }

  function updatePrev() {
    if (!prevDiv) return;
    prevDiv.textContent = '先前猜測：' + (guesses.length ? guesses.join('，') : '尚無');
  }

  function proximityColor(diff) {
    if (diff === 0) return {bg:'linear-gradient(135deg,#062e1f,#042a1f)', cls:'', tone:880};
    if (diff <= 2) return {bg:'linear-gradient(135deg,#3b0a3a,#5b2b6b)', cls:'glow-veryclose', tone:720};
    if (diff <= 6) return {bg:'linear-gradient(135deg,#7a2e00,#a04100)', cls:'glow-close', tone:560};
    if (diff <= 12) return {bg:'linear-gradient(135deg,#2b3a67,#1f3d7a)', cls:'', tone:360};
    return {bg:'linear-gradient(135deg,#0f172a,#0b2545)', cls:'', tone:220};
  }

  // main submit
  function submitGuess() {
    // unlock audio on user action
    unlockAudioOnce();

    const raw = guessField.value;
    const n = Number(raw);
    if (!n || n < 1 || n > 100) {
      resultDiv.textContent = '請輸入 1 到 100 的整數。';
      if (card) {
        card.classList.add('shake');
        setTimeout(()=>card.classList.remove('shake'), 420);
      }
      playTone(160, 120, 'sawtooth', 0.06);
      return;
    }

    countNum++;
    guesses.push(n);
    updatePrev();
    countDiv.textContent = '已猜次數：' + countNum;

    const diff = Math.abs(n - secret);

    // visual + audio feedback
    const prox = proximityColor(diff);
    document.body.style.background = prox.bg;
    if (card) {
      card.classList.remove('glow-close','glow-veryclose');
      if (prox.cls) card.classList.add(prox.cls);
    }

    playTone(prox.tone + Math.max(0, 200 - diff * 6), 120, 'sine', 0.05);

    if (diff === 0) {
      const evalResult = evaluateByCount(countNum);
      resultDiv.innerHTML = `<strong style="color:var(--success)">${evalResult.title}</strong> — ${evalResult.desc}（總共 ${countNum} 次）`;
      setBadge('猜中！', evalResult.color);
      playWinMelody();
      triggerConfetti(1600);
      guessField.disabled = true;
      submitBtn.disabled = true;
      if (card) card.classList.add('pulse');
      if (prevDiv) prevDiv.textContent += ` → 正確答案：${secret}`;
      return;
    }

    if (n < secret) {
      resultDiv.textContent = `太小了！距離：${diff}`;
      setBadge('往上', '#7dd3fc');
    } else {
      resultDiv.textContent = `太大了！距離：${diff}`;
      setBadge('往下', '#ffb4c6');
    }

    if (diff <= 6 && diff > 0) {
      resultDiv.classList.add('pulse');
      setTimeout(()=>resultDiv.classList.remove('pulse'), 650);
    } else if (diff > 12 && card) {
      card.classList.add('shake');
      setTimeout(()=>card.classList.remove('shake'), 420);
    }

    guessField.value = '';
    guessField.focus();
  }

  submitBtn.addEventListener('click', submitGuess);
  guessField.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitGuess(); });

  setBadge('準備中', '#9ae6b4');

  function resizeCanvas(){
    if (!confettiCanvas) return;
    confettiCanvas.width = confettiCanvas.clientWidth;
    confettiCanvas.height = confettiCanvas.clientHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // debug: 若要看答案可解除下列註解
  // console.log('secret:', secret);
})();