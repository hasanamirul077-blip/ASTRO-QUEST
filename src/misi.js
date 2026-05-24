import * as THREE from 'three';

import mercuryImg from './images/mercurymap.jpg';
import venusImg from './images/venusmap.jpg';
import earthImg from './images/earth_daymap.jpg';
import marsImg from './images/marsmap.jpg';
import jupiterImg from './images/jupiter.jpg';
import saturnImg from './images/saturnmap.jpg';
import uranusImg from './images/uranus.jpg';
import neptuneImg from './images/neptune.jpg';
import sunImg from './images/sun.jpg';
import astronautImg from './images/astronut.png';

// State Game
let lives = 3;
let collectedPlanets = [];
let planetQueue = [];
let currentPlanetObj = null;
let spawnSideCounter = 0;

// Konstanta (Urutan dari terjauh ke matahari)
const PLANET_KEYS = ['Neptune', 'Uranus', 'Saturn', 'Jupiter', 'Mars', 'Earth', 'Venus', 'Mercury', 'Sun'];

const PLANET_IMAGES = {
  'Mercury': mercuryImg,
  'Venus': venusImg,
  'Earth': earthImg,
  'Mars': marsImg,
  'Jupiter': jupiterImg,
  'Saturn': saturnImg,
  'Uranus': uranusImg,
  'Neptune': neptuneImg,
  'Sun': sunImg
};

const INSIGHTS = [
  "Ayo jelajahi luar angkasa!",
  "Tahukah kamu? Cahaya matahari butuh 8 menit untuk sampai ke Bumi.",
  "Matahari adalah bintang yang sangat besar!",
  "Jaga semangatmu, astronaut muda!",
  "Setiap planet punya rahasia unik.",
  "Kecepatan cahaya adalah batas akhir!",
  "Bumi adalah rumah kita di alam semesta."
];

// Setup awal kontainer
function initMisiUI() {
  const container = document.getElementById('misi-container');
  container.innerHTML = `
    <canvas id="warp-canvas" style="position:absolute; inset:0; z-index:1;"></canvas>
    <button class="misi-btn-back" onclick="tanyaKeluar()">
      <span class="material-symbols-rounded">arrow_back</span>
    </button>
    <div class="misi-hud">
      <div class="misi-lives">
        <span class="material-symbols-rounded" style="vertical-align:middle; margin-right:5px;">favorite</span>
        <span id="hud-lives">3</span>
      </div>
      <div class="misi-score">
        <span class="material-symbols-rounded" style="color:#fbbf24; vertical-align:middle; margin-right:5px;">inventory_2</span>
        Progres: <span id="hud-score">0</span>/9
      </div>
    </div>
    <div class="misi-astronaut" id="astronaut">
      <div id="astro-insight-box"></div>
      <div class="astro-body">
        <img src="${astronautImg}" alt="Astronaut" id="astro-img" style="width:120px; filter: drop-shadow(0 0 20px rgba(59,130,246,0.5));" />
      </div>
    </div>
    <div id="planet-spawn-area"></div>
    
    <!-- Modal Kuis -->
    <div class="misi-modal" id="modal-kuis" style="display:none;">
      <div class="kuis-card">
        <div class="kuis-header-glow"></div>
        <div class="kuis-planet-img" id="kuis-icon"></div>
        <div class="kuis-pertanyaan" id="kuis-tanya">Pertanyaan?</div>
        <div class="kuis-opsi-container" id="kuis-opsi"></div>
      </div>
    </div>

    <!-- Modal Konfirmasi Keluar -->
    <div class="misi-modal" id="modal-konfirmasi" style="display:none;">
      <div class="kuis-card">
        <div class="kuis-header-glow" style="background: #ef4444;"></div>
        <h2 style="margin-bottom: 15px;">MENYERAH?</h2>
        <p>Apakah Anda yakin ingin menghentikan kuis ini? Progres Anda akan hilang.</p>
        <div class="misi-confirm-btns">
          <button class="confirm-btn confirm-btn-yes" onclick="gameOver()">Ya, Menyerah</button>
          <button class="confirm-btn confirm-btn-no" onclick="lanjutKuis()">Lanjut Quiz</button>
        </div>
      </div>
    </div>

    <!-- Modal Akhir -->
    <div class="misi-modal" id="modal-akhir" style="display:none;">
      <div class="kuis-card end-card">
        <div class="kuis-header-glow"></div>
        <h2 class="end-title" id="end-title">CONGRATULATIONS!</h2>
        <p id="end-desc" style="color: rgba(255,255,255,0.7); margin-bottom: 20px;"></p>
        <div class="koleksi-grid" id="end-koleksi"></div>
        <button class="end-btn" onclick="tutupMisi()">
          <span class="material-symbols-rounded" style="vertical-align:middle; margin-right:8px;">home</span> Kembali ke Menu
        </button>
      </div>
    </div>
  `;
  initWarpSpeed();
  startInsightRotation();
}

let insightTimer;
function startInsightRotation() {
  const box = document.getElementById('astro-insight-box');
  const showInsight = () => {
    const text = INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)];
    box.innerHTML = `<div class="astro-insight">${text}</div>`;
    setTimeout(() => { box.innerHTML = ''; }, 6000);
  };
  showInsight();
  insightTimer = setInterval(showInsight, 12000);
}

window.mulaiMisi = function() {
  const landing = document.getElementById('landing-page');
  if (landing) landing.style.display = 'none';
  
  const container = document.getElementById('misi-container');
  container.style.display = 'block';

  if (window.playBGM) window.playBGM('quiz');
  
  resetGame();
  initMisiUI();
  updateHUD();
  spawnNextPlanet();
};

window.tutupMisi = function() {
  clearInterval(insightTimer);
  document.getElementById('misi-container').style.display = 'none';
  const landing = document.getElementById('landing-page');
  if (landing) landing.style.display = 'flex';
  
  if (window.playBGM) window.playBGM('backsound');
};

window.tanyaKeluar = function() {
  document.getElementById('modal-konfirmasi').style.display = 'flex';
};

window.lanjutKuis = function() {
  document.getElementById('modal-konfirmasi').style.display = 'none';
};

function resetGame() {
  lives = 3;
  collectedPlanets = [];
  planetQueue = [...PLANET_KEYS];
}

function updateHUD() {
  const scoreEl = document.getElementById('hud-score');
  const livesEl = document.getElementById('hud-lives');
  if(scoreEl) scoreEl.textContent = collectedPlanets.length;
  if(livesEl) livesEl.textContent = lives;
}

function spawnNextPlanet() {
  if(planetQueue.length === 0) {
    menang();
    return;
  }
  
  const spawnArea = document.getElementById('planet-spawn-area');
  if(!spawnArea) return;
  spawnArea.innerHTML = ''; 
  
  const pKey = planetQueue[0]; 
  const el = document.createElement('div');
  el.className = 'misi-planet-obj';
  el.style.backgroundImage = `url('${PLANET_IMAGES[pKey]}')`;
  
  // Alternating Center -> Left/Right
  const isLeft = spawnSideCounter % 2 === 0;
  spawnSideCounter++;
  el.style.animation = `flyFromCenter${isLeft ? 'Left' : 'Right'} 10s linear infinite`;
  
  el.onclick = () => {
    klikPlanet(pKey);
  };
  
  spawnArea.appendChild(el);
  currentPlanetObj = el;
  if (warpSpeedControls) warpSpeedControls.speed = 1.2;
}

function klikPlanet(pKey) {
  if(currentPlanetObj) currentPlanetObj.style.display = 'none';
  tampilkanKuis(pKey);
}

function tampilkanKuis(pKey) {
  const pData = window.planetData[pKey.toLowerCase()] || {
    namaBahasa: 'Matahari',
    tipe: 'Bintang (G-type)',
    bulan: '0',
    rotasi: '25-35 hari',
    info: 'Pusat tata surya kita.'
  };

  const iconEl = document.getElementById('kuis-icon');
  iconEl.style.backgroundImage = `url('${PLANET_IMAGES[pKey]}')`;
  
  const fields = [
    { key: 'tipe', q: `Apa klasifikasi dari ${pData.namaBahasa}?` },
    { key: 'bulan', q: `Berapa jumlah satelit alami / info bulan ${pData.namaBahasa}?` },
    { key: 'rotasi', q: `Berapa lama waktu rotasi ${pData.namaBahasa}?` }
  ];
  
  const soal = fields[Math.floor(Math.random() * fields.length)];
  document.getElementById('kuis-tanya').textContent = soal.q;
  
  const jawabanBenar = pData[soal.key];
  let opsiSalah = new Set();
  const allKeys = Object.keys(PLANET_IMAGES);
  let loopCount = 0;
  while(opsiSalah.size < 3 && loopCount < 100) {
    loopCount++;
    const randomP = allKeys[Math.floor(Math.random() * allKeys.length)];
    const dataRandom = window.planetData[randomP.toLowerCase()] || { tipe: 'Bintang', bulan: '0', rotasi: '25 hari' };
    const val = dataRandom[soal.key];
    if(val && val !== jawabanBenar) opsiSalah.add(val);
  }
  
  let fallbackCount = 1;
  while(opsiSalah.size < 3) {
    opsiSalah.add(`Opsi Alternatif ${fallbackCount++}`);
  }
  
  let semuaOpsi = [jawabanBenar, ...Array.from(opsiSalah)];
  semuaOpsi.sort(() => Math.random() - 0.5);
  
  const opsiContainer = document.getElementById('kuis-opsi');
  opsiContainer.innerHTML = '';
  
  semuaOpsi.forEach(opsi => {
    const btn = document.createElement('button');
    btn.className = 'kuis-btn';
    btn.textContent = opsi;
    btn.onclick = () => cekJawaban(opsi === jawabanBenar, pKey, btn, jawabanBenar);
    opsiContainer.appendChild(btn);
  });
  
  document.getElementById('modal-kuis').style.display = 'flex';
}

function cekJawaban(benar, pKey, btnEl, correctVal) {
  const btns = document.querySelectorAll('.kuis-btn');
  btns.forEach(b => b.style.pointerEvents = 'none');
  
  if(benar) {
    btnEl.classList.add('benar');
    setTimeout(() => {
      document.getElementById('modal-kuis').style.display = 'none';
      planetQueue.shift();
      collectedPlanets.push(pKey);
      updateHUD();
      spawnNextPlanet();
    }, 1000);
  } else {
    btnEl.classList.add('salah');
    lives--;
    updateHUD();
    btns.forEach(b => { if(b.textContent === correctVal) b.classList.add('benar'); });

    setTimeout(() => {
      document.getElementById('modal-kuis').style.display = 'none';
      if (lives <= 0) {
        gameOver();
      } else {
        planetQueue.shift();
        planetQueue.push(pKey);
        spawnNextPlanet();
      }
    }, 1500);
  }
}

window.gameOver = function() {
  document.getElementById('modal-konfirmasi').style.display = 'none';
  document.getElementById('modal-akhir').style.display = 'flex';
  document.getElementById('end-title').textContent = 'GAME OVER';
  document.getElementById('end-title').style.color = '#ef4444';
  document.getElementById('end-title').style.background = 'none';
  document.getElementById('end-title').style.webkitTextFillColor = '#ef4444';
  document.getElementById('end-desc').textContent = 'Anda telah menyerah atau kehabisan nyawa. Coba lagi!';
  document.getElementById('end-koleksi').innerHTML = '';
};

function menang() {
  const rewardPlanets = ['Jupiter', 'Saturn', 'Mars', 'Earth'];
  const reward = rewardPlanets[Math.floor(Math.random() * rewardPlanets.length)];
  
  const userName = window.appUser ? window.appUser.displayName : 'Guest';

  // Sinkronisasi ke Firestore jika login
  if (window.appUser && window.appUserData) {
    const userRef = window.doc(window.db, 'users', window.appUser.uid);
    
    // Tambah Koleksi
    if (!window.appUserData.collections) window.appUserData.collections = [];
    if (!window.appUserData.collections.includes(reward)) {
      window.appUserData.collections.push(reward);
      window.updateDoc(userRef, { collections: window.arrayUnion(reward) });
    }

    // Cek Pencapaian Pertama
    if (!window.appUserData.achievements) window.appUserData.achievements = [];
    if (!window.appUserData.achievements.includes('first_discovery')) {
      window.appUserData.achievements.push('first_discovery');
      window.updateDoc(userRef, { achievements: window.arrayUnion('first_discovery') });
    }
  }

  document.getElementById('modal-akhir').style.display = 'flex';
  document.getElementById('end-title').textContent = 'CONGRATULATIONS!';
  document.getElementById('end-title').style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
  document.getElementById('end-title').style.webkitBackgroundClip = 'text';
  document.getElementById('end-desc').innerHTML = `Luar Biasa, ${userName}! Anda telah menaklukkan seluruh kuis <strong>ASTRO QUEST</strong>!<br><br>
    <div style="background:rgba(251,191,36,0.1); padding:15px; border-radius:12px; border:1px solid rgba(251,191,36,0.2);">
      <span class="material-symbols-rounded" style="color:#fbbf24; display:block; font-size:2rem; margin-bottom:10px;">auto_awesome</span>
      REWARD UNLOCKED: <strong>Planet ${reward}</strong><br>
      <span style="font-size:0.75rem; color:rgba(255,255,255,0.5);">Planet ini telah ditambahkan ke KOLEKSI Anda.</span>
    </div>`;
  
  const grid = document.getElementById('end-koleksi');
  grid.innerHTML = '';
  collectedPlanets.forEach(k => {
    grid.innerHTML += `<div class="koleksi-item" style="background-image:url('${PLANET_IMAGES[k]}')"></div>`;
  });
}

// --- THREE.JS SPACE WARP EFFECT ---
let warpSpeedControls = { speed: 1 };
function initWarpSpeed() {
  const canvas = document.getElementById('warp-canvas');
  if (!canvas) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 5;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const starCount = 800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 2 * 3); 
  const stars = [];
  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = Math.random() * -2000;
    stars.push({ x, y, z, velocity: Math.random() * 5 + 3 });
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
  const lineSystem = new THREE.LineSegments(geometry, material);
  scene.add(lineSystem);

  function animateWarp() {
    const posAttr = geometry.getAttribute('position');
    for (let i = 0; i < starCount; i++) {
      const star = stars[i];
      star.z += star.velocity * warpSpeedControls.speed;
      if (star.z > 500) star.z = -2000;
      const idx = i * 6;
      posAttr.array[idx] = star.x;
      posAttr.array[idx + 1] = star.y;
      posAttr.array[idx + 2] = star.z;
      const trailLength = 50 * (warpSpeedControls.speed > 1 ? 2 : 0.5);
      posAttr.array[idx + 3] = star.x;
      posAttr.array[idx + 4] = star.y;
      posAttr.array[idx + 5] = star.z - trailLength;
    }
    posAttr.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animateWarp);
  }
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  animateWarp();
}
