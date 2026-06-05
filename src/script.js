import * as THREE from 'three';
window.THREE = THREE;
// dat.gui diganti dengan kontrol kustom
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

// ======  FIREBASE SETUP  ======
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js';
// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyDp8ODPNTzr8W3MRNhGkcNnXEgoTL6IAXI",
  authDomain: "astro-quest-77076.firebaseapp.com",
  projectId: "astro-quest-77076",
  storageBucket: "astro-quest-77076.firebasestorage.app",
  messagingSenderId: "222113161208",
  appId: "1:222113161208:web:e68ac0cb7a2dd2e6b8c00d",
  measurementId: "G-Z5CBS0KRKX"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Global State untuk User
window.appUser = null;

// ==========================================
// OFFLINE / LOCALSTORAGE DATABASE MOCK
// (Bypass Firestore billing requirement)
// ==========================================
window.db = "local";
window.doc = function(db, collection, uid) { return uid; };
window.arrayUnion = function(val) { return { _isUnion: true, val: val }; };
window.updateDoc = async function(uid, updates) {
  const localKey = 'astroquest_user_' + uid;
  let data = JSON.parse(localStorage.getItem(localKey)) || {};
  for (let key in updates) {
    const updateVal = updates[key];
    if (updateVal && updateVal._isUnion) {
      if (!data[key]) data[key] = [];
      if (!data[key].includes(updateVal.val)) data[key].push(updateVal.val);
    } else {
      data[key] = updateVal;
    }
  }
  localStorage.setItem(localKey, JSON.stringify(data));
  window.appUserData = data;
};

import bgTexture1 from './images/1.jpg';
import bgTexture2 from './images/2.jpg';
import bgTexture3 from './images/3.jpg';
import bgTexture4 from './images/4.jpg';
import sunTexture from './images/sun.jpg';
import mercuryTexture from './images/mercurymap.jpg';
import mercuryBump from './images/mercurybump.jpg';
import venusTexture from './images/venusmap.jpg';
import venusBump from './images/venusmap.jpg';
import venusAtmosphere from './images/venus_atmosphere.jpg';
import earthTexture from './images/earth_daymap.jpg';
import earthNightTexture from './images/earth_nightmap.jpg';
import earthAtmosphere from './images/earth_atmosphere.jpg';
import earthMoonTexture from './images/moonmap.jpg';
import earthMoonBump from './images/moonbump.jpg';
import marsTexture from './images/marsmap.jpg';
import marsBump from './images/marsbump.jpg';
import jupiterTexture from './images/jupiter.jpg';
import ioTexture from './images/jupiterIo.jpg';
import europaTexture from './images/jupiterEuropa.jpg';
import ganymedeTexture from './images/jupiterGanymede.jpg';
import callistoTexture from './images/jupiterCallisto.jpg';
import saturnTexture from './images/saturnmap.jpg';
import satRingTexture from './images/saturn_ring.png';
import uranusTexture from './images/uranus.jpg';
import uraRingTexture from './images/uranus_ring.png';
import neptuneTexture from './images/neptune.jpg';
import plutoTexture from './images/plutomap.jpg';

// ******  SETUP  ******
console.log("Create the scene");
const scene = new THREE.Scene();
let isSimulationRunning = false;



console.log("Create a perspective projection camera");
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(-175, 115, 5);

console.log("Create the renderer");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1); // default opaque black, changed to 0 alpha in Camera AR mode
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;

console.log("Create an orbit control");
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.75;
controls.screenSpacePanning = false;

console.log("Set up texture loader");
const cubeTextureLoader = new THREE.CubeTextureLoader();
const loadTexture = new THREE.TextureLoader();

// ******  POSTPROCESSING setup ******
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// ******  OUTLINE PASS  ******
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 1;
outlinePass.visibleEdgeColor.set(0xffffff);
outlinePass.hiddenEdgeColor.set(0x190a05);
composer.addPass(outlinePass);

// ******  BLOOM PASS  ******
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
bloomPass.threshold = 1;
bloomPass.radius = 0.9;
composer.addPass(bloomPass);

// ****** AMBIENT LIGHT ******
console.log("Add the ambient light");
var lightAmbient = new THREE.AmbientLight(0x222222, 6); 
scene.add(lightAmbient);

// ******  Star background  ******
scene.background = cubeTextureLoader.load([

  bgTexture3,
  bgTexture1,
  bgTexture2,
  bgTexture2,
  bgTexture4,
  bgTexture2
]);

// ====== CAMERA AR: Save original background reference ======
const originalSpaceBackground = scene.background;

// ======  KONTROL SIMULASI (kustom, mengganti dat.GUI)  ======
const settings = {
  accelerationOrbit: 1,
  acceleration: 1,
  sunIntensity: 1.9
};

// Toggle buka/tutup panel kontrol
const toggleBtn = document.getElementById('kontrol-toggle-btn');
const kontrolBody = document.getElementById('kontrol-body');
const kontrolArrow = document.getElementById('kontrol-arrow');
const statusDot = document.getElementById('status-dot');

toggleBtn.addEventListener('click', () => {
  const terbuka = kontrolBody.classList.toggle('terbuka');
  kontrolArrow.classList.toggle('terbuka', terbuka);
  toggleBtn.classList.toggle('aktif', terbuka);
  document.body.classList.toggle('kontrol-terbuka', terbuka);
});

// Keterangan dinamis untuk setiap slider
function ketOrbit(v) {
  if (v === 0) return 'Berhenti — planet tidak berevolusi';
  if (v < 1) return 'Lambat — pergerakan orbit diperlambat';
  if (v <= 1) return 'Normal — planet berevolusi mengelilingi Matahari';
  if (v <= 3) return 'Cepat — orbit dipercepat ' + v.toFixed(1) + '× lipat';
  return 'Sangat cepat — orbit dipercepat ' + v.toFixed(1) + '× lipat!';
}
function ketRotasi(v) {
  if (v === 0) return 'Berhenti — planet tidak berotasi';
  if (v < 1) return 'Lambat — rotasi pada sumbu diperlambat';
  if (v <= 1) return 'Normal — planet berotasi pada sumbunya';
  if (v <= 3) return 'Cepat — rotasi dipercepat ' + v.toFixed(1) + '× lipat';
  return 'Sangat cepat — rotasi ' + v.toFixed(1) + '× dari normal!';
}
function ketMatahari(v) {
  if (v <= 1) return 'Redup — pencahayaan minimal';
  if (v <= 2) return 'Sedang — pencahayaan realistis permukaan planet';
  if (v <= 5) return 'Terang — intensitas cahaya tinggi (' + v.toFixed(1) + '×)';
  return 'Sangat terang — cahaya maksimal ' + v.toFixed(1) + '×!';
}

function updateStatusDot() {
  if (settings.accelerationOrbit === 0 && settings.acceleration === 0) {
    statusDot.classList.add('pause');
  } else {
    statusDot.classList.remove('pause');
  }
}

// Setup slider dengan keterangan
function setupSlider(id, fillId, valId, ketId, ketFn, onInput) {
  const slider = document.getElementById(id);
  const fill = document.getElementById(fillId);
  const val = document.getElementById(valId);
  const ket = document.getElementById(ketId);
  const updateFill = (v, min, max) => {
    fill.style.width = ((v - min) / (max - min) * 100) + '%';
  };
  updateFill(slider.value, slider.min, slider.max);
  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    val.textContent = v.toFixed(1) + '×';
    updateFill(v, slider.min, slider.max);
    if (ket) ket.textContent = ketFn(v);
    onInput(v);
    updateStatusDot();
  });
}

setupSlider('slider-orbit', 'fill-orbit', 'val-orbit', 'ket-orbit', ketOrbit,
  v => { settings.accelerationOrbit = v; });
setupSlider('slider-rotasi', 'fill-rotasi', 'val-rotasi', 'ket-rotasi', ketRotasi,
  v => { settings.acceleration = v; });
setupSlider('slider-matahari', 'fill-matahari', 'val-matahari', 'ket-matahari', ketMatahari,
  v => { settings.sunIntensity = v; if(sunMat) sunMat.emissiveIntensity = v; });

// Tombol Jeda Orbit
let orbitPaused = false;
let savedOrbitVal = 1;
const btnPause = document.getElementById('btn-pause-orbit');
btnPause.addEventListener('click', () => {
  const slider = document.getElementById('slider-orbit');
  if (!orbitPaused) {
    savedOrbitVal = settings.accelerationOrbit;
    settings.accelerationOrbit = 0;
    slider.value = 0;
    slider.dispatchEvent(new Event('input'));
    btnPause.textContent = '▶️ Lanjut Orbit';
    orbitPaused = true;
  } else {
    settings.accelerationOrbit = savedOrbitVal;
    slider.value = savedOrbitVal;
    slider.dispatchEvent(new Event('input'));
    btnPause.textContent = '⏸️ Jeda Orbit';
    orbitPaused = false;
  }
});

// Tombol Reset
document.getElementById('btn-reset').addEventListener('click', () => {
  settings.accelerationOrbit = 1;
  settings.acceleration = 1;
  settings.sunIntensity = 1.9;
  orbitPaused = false;
  btnPause.textContent = '⏸️ Jeda Orbit';
  ['slider-orbit','slider-rotasi','slider-matahari'].forEach(id => {
    const el = document.getElementById(id);
    el.value = id === 'slider-matahari' ? 1.9 : 1;
    el.dispatchEvent(new Event('input'));
  });
  if(sunMat) sunMat.emissiveIntensity = 1.9;
});

// mouse movement
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

// ******  SELECT PLANET  ******
let selectedPlanet = null;
let isMovingTowardsPlanet = false;
let targetCameraPosition = new THREE.Vector3();
let offset;

function onDocumentMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(raycastTargets);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    selectedPlanet = identifyPlanet(clickedObject);
    if (selectedPlanet) {
      tutupInfoTanpaZoom();
      
      settings.accelerationOrbit = 0; // Stop orbital movement

      // Update camera to look at the selected planet
      const planetPosition = new THREE.Vector3();
      selectedPlanet.planet.getWorldPosition(planetPosition);
      controls.target.copy(planetPosition);
      camera.lookAt(planetPosition); // Orient the camera towards the planet

      targetCameraPosition.copy(planetPosition).add(camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset));
      isMovingTowardsPlanet = true;
    }
  }
}

function identifyPlanet(clickedObject) {
  // Logic to identify which planet was clicked based on the clicked object, different offset for camera distance
        if (clickedObject.material === mercury.planet.material) {
          offset = 10;
          return mercury;
        } else if (clickedObject.material === venus.Atmosphere.material) {
          offset = 25;
          return venus;
        } else if (clickedObject.material === earth.Atmosphere.material) {
          offset = 25;
          return earth;
        } else if (clickedObject.material === mars.planet.material) {
          offset = 15;
          return mars;
        } else if (clickedObject.material === jupiter.planet.material) {
          offset = 50;
          return jupiter;
        } else if (clickedObject.material === saturn.planet.material) {
          offset = 50;
          return saturn;
        } else if (clickedObject.material === uranus.planet.material) {
          offset = 25;
          return uranus;
        } else if (clickedObject.material === neptune.planet.material) {
          offset = 20;
          return neptune;
        } else if (clickedObject.material === pluto.planet.material) {
          offset = 10;
          return pluto;
        } else if (clickedObject === sun) {
          offset = 60;
          return { name: 'Sun', planet: sun };
        } 

  return null;
}

// ======  TAMPILKAN INFO PLANET  ======
function showPlanetInfo(planet) {
  const d = window.planetData[planet.toLowerCase()];
  if (!d) return;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  };

  setEl('info-nama', d.namaBahasa || planet);
  setEl('info-tipe', d.tipe);
  setEl('info-nomor', d.nomor);
  setEl('info-emoji', d.emoji);
  setEl('stat-radius', d.radius);
  setEl('stat-kemiringan', d.kemiringan);
  setEl('stat-rotasi', d.rotasi);
  setEl('stat-orbit', d.orbit);
  setEl('stat-jarak', d.jarak);
  setEl('info-desc', d.info);
  setEl('info-bulan', d.bulan);

  // Set warna glow berdasarkan planet
  const bgEl = document.getElementById('info-header-bg');
  if (bgEl) bgEl.style.setProperty('--planet-color', d.warna || '#fbbf24');

  const panel = document.getElementById('info-planet');
  panel.classList.add('info-planet-muncul');
  panel.style.display = 'block';
}

let isZoomingOut = false;
let zoomOutTargetPosition = new THREE.Vector3(-175, 115, 5);

function tutupInfo() {
  const panel = document.getElementById('info-planet');
  panel.style.display = 'none';
  panel.classList.remove('info-planet-muncul');
  
  // Kembalikan kecepatan orbit ke nilai slider
  const sliderOrbit = document.getElementById('slider-orbit');
  if (sliderOrbit) {
    settings.accelerationOrbit = parseFloat(sliderOrbit.value);
  } else {
    settings.accelerationOrbit = 1;
  }
  
  isMovingTowardsPlanet = false; // Batalkan zoom-in jika sedang berjalan
  isZoomingOut = true;           // Aktifkan zoom-out
  controls.target.set(0, 0, 0);  // Kembalikan pandangan ke Matahari
}

// Pasang event listener secara eksplisit untuk berjaga-jaga
const btnTutup = document.querySelector('.info-tutup');
if(btnTutup) {
  btnTutup.addEventListener('click', tutupInfo);
}
window.tutupInfo = tutupInfo;
// Alias lama agar tidak error
window.closeInfo = tutupInfo;

function tutupInfoTanpaZoom() {
  document.getElementById('info-planet').style.display = 'none';
}
// ******  SUN  ******
let sunMat;

const sunSize = 697/40; // 40 times smaller scale than earth
const sunGeom = new THREE.SphereGeometry(sunSize, 32, 20);
sunMat = new THREE.MeshStandardMaterial({
  emissive: 0xFFF88F,
  emissiveMap: loadTexture.load(sunTexture),
  emissiveIntensity: settings.sunIntensity
});
const sun = new THREE.Mesh(sunGeom, sunMat);
scene.add(sun);

//point light in the sun
const pointLight = new THREE.PointLight(0xFDFFD3 , 1200, 400, 1.4);
scene.add(pointLight);


// ******  PLANET CREATION FUNCTION  ******
function createPlanet(planetName, size, position, tilt, texture, bump, ring, atmosphere, moons){

  let material;
  if (texture instanceof THREE.Material){
    material = texture;
  } 
  else if(bump){
    material = new THREE.MeshPhongMaterial({
    map: loadTexture.load(texture),
    bumpMap: loadTexture.load(bump),
    bumpScale: 0.7
    });
  }
  else {
    material = new THREE.MeshPhongMaterial({
    map: loadTexture.load(texture)
    });
  } 

  const name = planetName;
  const geometry = new THREE.SphereGeometry(size, 32, 20);
  const planet = new THREE.Mesh(geometry, material);
  const planet3d = new THREE.Object3D;
  const planetSystem = new THREE.Group();
  planetSystem.add(planet);
  let Atmosphere;
  let Ring;
  planet.position.x = position;
  planet.rotation.z = tilt * Math.PI / 180;

  // add orbit path
  const orbitPath = new THREE.EllipseCurve(
    0, 0,            // ax, aY
    position, position, // xRadius, yRadius
    0, 2 * Math.PI,   // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
);

  const pathPoints = orbitPath.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.03 });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  planetSystem.add(orbit);

  //add ring
  if(ring)
  {
    const RingGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius,30);
    const RingMat = new THREE.MeshStandardMaterial({
      map: loadTexture.load(ring.texture),
      side: THREE.DoubleSide
    });
    Ring = new THREE.Mesh(RingGeo, RingMat);
    planetSystem.add(Ring);
    Ring.position.x = position;
    Ring.rotation.x = -0.5 *Math.PI;
    Ring.rotation.y = -tilt * Math.PI / 180;
  }
  
  //add atmosphere
  if(atmosphere){
    const atmosphereGeom = new THREE.SphereGeometry(size+0.1, 32, 20);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      map:loadTexture.load(atmosphere),
      transparent: true,
      opacity: 0.4,
      depthTest: true,
      depthWrite: false
    })
    Atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial)
    
    Atmosphere.rotation.z = 0.41;
    planet.add(Atmosphere);
  }

  //add moons
  if(moons){
    moons.forEach(moon => {
      let moonMaterial;
      
      if(moon.bump){
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture),
          bumpMap: loadTexture.load(moon.bump),
          bumpScale: 0.5
        });
      } else{
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture)
        });
      }
      const moonGeometry = new THREE.SphereGeometry(moon.size, 32, 20);
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      const moonOrbitDistance = size * 1.5;
      moonMesh.position.set(moonOrbitDistance, 0, 0);
      planetSystem.add(moonMesh);
      moon.mesh = moonMesh;
    });
  }
  //add planet system to planet3d object and to the scene
  planet3d.rotation.y = Math.random() * Math.PI * 2; // Acak posisi awal di orbit
  planet3d.add(planetSystem);
  scene.add(planet3d);
  return {name, planet, planet3d, Atmosphere, moons, planetSystem, Ring};
}


// ******  LOADING OBJECTS METHOD  ******
function loadObject(path, position, scale, callback) {
  const loader = new GLTFLoader();

  loader.load(path, function (gltf) {
      const obj = gltf.scene;
      obj.position.set(position, 0, 0);
      obj.scale.set(scale, scale, scale);
      scene.add(obj);
      if (callback) {
        callback(obj);
      }
  }, undefined, function (error) {
      console.error('An error happened', error);
  });
}

// ******  ASTEROIDS  ******
const asteroids = [];
function loadAsteroids(path, numberOfAsteroids, minOrbitRadius, maxOrbitRadius) {
  const loader = new GLTFLoader();
  loader.load(path, function (gltf) {
      gltf.scene.traverse(function (child) {
          if (child.isMesh) {
              for (let i = 0; i < numberOfAsteroids / 12; i++) { // Divide by 12 because there are 12 asteroids in the pack
                  const asteroid = child.clone();
                  const orbitRadius = THREE.MathUtils.randFloat(minOrbitRadius, maxOrbitRadius);
                  const angle = Math.random() * Math.PI * 2;
                  const x = orbitRadius * Math.cos(angle);
                  const y = 0;
                  const z = orbitRadius * Math.sin(angle);
                  child.receiveShadow = true;
                  asteroid.position.set(x, y, z);
                  asteroid.scale.setScalar(THREE.MathUtils.randFloat(0.8, 1.2));
                  scene.add(asteroid);
                  asteroids.push(asteroid);
              }
          }
      });
  }, undefined, function (error) {
      console.error('An error happened', error);
  });
}


// Earth day/night effect shader material
const earthMaterial = new THREE.ShaderMaterial({
  uniforms: {
    dayTexture: { type: "t", value: loadTexture.load(earthTexture) },
    nightTexture: { type: "t", value: loadTexture.load(earthNightTexture) },
    sunPosition: { type: "v3", value: sun.position }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    uniform vec3 sunPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
      vSunDirection = normalize(sunPosition - worldPosition.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;

    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    void main() {
      float intensity = max(dot(vNormal, vSunDirection), 0.0);
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv)* 0.2;
      gl_FragColor = mix(nightColor, dayColor, intensity);
    }
  `
});


// ******  MOONS  ******
// Earth
const earthMoon = [{
  size: 1.6,
  texture: earthMoonTexture,
  bump: earthMoonBump,
  orbitSpeed: 0.001 * settings.accelerationOrbit,
  orbitRadius: 10
}]

// Mars' moons with path to 3D models (phobos & deimos)
const marsMoons = [
  {
    modelPath: '/images/mars/phobos.glb',
    scale: 0.1,
    orbitRadius: 5,
    orbitSpeed: 0.002 * settings.accelerationOrbit,
    position: 100,
    mesh: null
  },
  {
    modelPath: '/images/mars/deimos.glb',
    scale: 0.1,
    orbitRadius: 9,
    orbitSpeed: 0.0005 * settings.accelerationOrbit,
    position: 120,
    mesh: null
  }
];

// Jupiter
const jupiterMoons = [
  {
    size: 1.6,
    texture: ioTexture,
    orbitRadius: 20,
    orbitSpeed: 0.0005 * settings.accelerationOrbit
  },
  {
    size: 1.4,
    texture: europaTexture,
    orbitRadius: 24,
    orbitSpeed: 0.00025 * settings.accelerationOrbit
  },
  {
    size: 2,
    texture: ganymedeTexture,
    orbitRadius: 28,
    orbitSpeed: 0.000125 * settings.accelerationOrbit
  },
  {
    size: 1.7,
    texture: callistoTexture,
    orbitRadius: 32,
    orbitSpeed: 0.00006 * settings.accelerationOrbit
  }
];

// ******  PLANET CREATIONS  ******
const mercury = new createPlanet('Mercury', 2.4, 40, 0, mercuryTexture, mercuryBump);
const venus = new createPlanet('Venus', 6.1, 65, 3, venusTexture, venusBump, null, venusAtmosphere);
const earth = new createPlanet('Earth', 6.4, 90, 23, earthMaterial, null, null, earthAtmosphere, earthMoon);
const mars = new createPlanet('Mars', 3.4, 115, 25, marsTexture, marsBump)
// Load Mars moons
marsMoons.forEach(moon => {
  loadObject(moon.modelPath, moon.position, moon.scale, function(loadedModel) {
    moon.mesh = loadedModel;
    mars.planetSystem.add(moon.mesh);
    moon.mesh.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
});

const jupiter = new createPlanet('Jupiter', 69/4, 200, 3, jupiterTexture, null, null, null, jupiterMoons);
const saturn = new createPlanet('Saturn', 58/4, 270, 26, saturnTexture, null, {
  innerRadius: 18, 
  outerRadius: 29, 
  texture: satRingTexture
});
const uranus = new createPlanet('Uranus', 25/4, 320, 82, uranusTexture, null, {
  innerRadius: 6, 
  outerRadius: 8, 
  texture: uraRingTexture
});
const neptune = new createPlanet('Neptune', 24/4, 340, 28, neptuneTexture);
const pluto = new createPlanet('Pluto', 1, 350, 57, plutoTexture);

  // ======  DATA PLANET (Bahasa Indonesia)  ======
  window.planetData = {
    'mercury': {
      namaBahasa: 'Merkurius', emoji: '⚫', tipe: 'Planet Dalam', nomor: 'Planet ke-1', warna: '#a0a0a0',
      radius: '2.439,7 km', kemiringan: '0,034°', rotasi: '58,6 hari Bumi',
      orbit: '88 hari Bumi', jarak: '57,9 juta km', bulan: 'Tidak memiliki bulan',
      info: 'Planet terkecil di tata surya dan yang terdekat dari Matahari. Permukaannya dipenuhi kawah seperti Bulan. Suhu siang mencapai 430°C namun malam turun hingga -180°C karena tidak memiliki atmosfer.',
      texture: mercuryTexture,
      desc: 'Planet terkecil dan terdekat dengan Matahari.'
    },
    'venus': {
      namaBahasa: 'Venus', emoji: '🟡', tipe: 'Planet Dalam', nomor: 'Planet ke-2', warna: '#e3bb76',
      radius: '6.051,8 km', kemiringan: '177,4°', rotasi: '243 hari Bumi',
      orbit: '225 hari Bumi', jarak: '108,2 juta km', bulan: 'Tidak memiliki bulan',
      info: 'Planet terpanas dengan suhu permukaan ~465°C akibat efek rumah kaca yang ekstrem. Venus berotasi terbalik — Matahari terbit dari barat dan terbenam di timur. Sering disebut "saudara kembar" Bumi karena ukurannya yang mirip.',
      texture: venusTexture,
      desc: 'Planet terpanas di Tata Surya dengan atmosfer tebal.'
    },
    'earth': {
      namaBahasa: 'Bumi', emoji: '🌍', tipe: 'Planet Dalam', nomor: 'Planet ke-3', warna: '#2271b3',
      radius: '6.371 km', kemiringan: '23,5°', rotasi: '24 jam',
      orbit: '365,25 hari', jarak: '150 juta km', bulan: '1 bulan — Bulan (Moon)',
      info: 'Satu-satunya planet yang diketahui memiliki kehidupan. Sekitar 71% permukaannya tertutup air. Atmosfer yang kaya oksigen dan nitrogen melindungi dari radiasi Matahari dan meteorit kecil.',
      texture: earthTexture,
      desc: 'Rumah kita, satu-satunya planet berpenghuni.'
    },
    'mars': {
      namaBahasa: 'Mars', emoji: '🔴', tipe: 'Planet Dalam', nomor: 'Planet ke-4', warna: '#e27b58',
      radius: '3.389,5 km', kemiringan: '25,19°', rotasi: '24,6 jam',
      orbit: '687 hari Bumi', jarak: '227,9 juta km', bulan: '2 bulan — Phobos & Deimos',
      info: 'Dikenal sebagai "Planet Merah" karena oksida besi di permukaannya. Memiliki gunung berapi terbesar (Olympus Mons, 21 km tinggi) dan lembah terbesar (Valles Marineris) di tata surya. Target utama kolonisasi manusia di masa depan.',
      texture: marsTexture,
      desc: 'Planet merah yang memiliki gunung tertinggi.'
    },
    'jupiter': {
      namaBahasa: 'Jupiter', emoji: '🟤', tipe: 'Raksasa Gas', nomor: 'Planet ke-5', warna: '#d39c7e',
      radius: '69.911 km', kemiringan: '3,13°', rotasi: '9,9 jam',
      orbit: '11,86 tahun Bumi', jarak: '778,5 juta km', bulan: '95 bulan diketahui — 4 terbesar: Io, Europa, Ganymede, Callisto',
      info: 'Planet terbesar di tata surya — massanya 2,5× massa gabungan semua planet lain. Bintik Merah Besar adalah badai setinggi 350 km yang telah berlangsung lebih dari 300 tahun. Jupiter berperan sebagai "perisai" Bumi dari komet dan asteroid.',
      texture: jupiterTexture,
      desc: 'Raksasa gas terbesar dengan bintik merah besar.'
    },
    'saturn': {
      namaBahasa: 'Saturnus', emoji: '🪐', tipe: 'Raksasa Gas', nomor: 'Planet ke-6', warna: '#c5ab6e',
      radius: '58.232 km', kemiringan: '26,73°', rotasi: '10,7 jam',
      orbit: '29,5 tahun Bumi', jarak: '1,43 miliar km', bulan: '146 bulan diketahui — terbesar: Titan (lebih besar dari Merkurius)',
      info: 'Terkenal dengan sistem cincinnya yang megah, terbuat dari miliaran partikel es dan batu berukuran debu hingga rumah. Saturnus memiliki kepadatan lebih rendah dari air — secara teori bisa mengapung!',
      texture: saturnTexture,
      desc: 'Planet dengan sistem cincin yang paling spektakuler.'
    },
    'uranus': {
      namaBahasa: 'Uranus', emoji: '🔵', tipe: 'Raksasa Es', nomor: 'Planet ke-7', warna: '#b5e3e3',
      radius: '25.362 km', kemiringan: '97,77°', rotasi: '17,2 jam',
      orbit: '84 tahun Bumi', jarak: '2,87 miliar km', bulan: '27 bulan diketahui — terbesar: Titania, Oberon, Umbriel, Ariel, Miranda',
      info: 'Unik karena berotasi miring hampir 90° sehingga tampak "menggelinding" di orbitnya. Atmosfer metana memberinya warna biru-hijau khas. Planet ini sangat dingin dengan suhu minimum -224°C.',
      texture: uranusTexture,
      desc: 'Planet es yang berotasi secara menyamping.'
    },
    'neptune': {
      namaBahasa: 'Neptunus', emoji: '💙', tipe: 'Raksasa Es', nomor: 'Planet ke-8', warna: '#4b70dd',
      radius: '24.622 km', kemiringan: '28,32°', rotasi: '16,1 jam',
      orbit: '165 tahun Bumi', jarak: '4,5 miliar km', bulan: '14 bulan diketahui — terbesar: Triton (mengorbit berlawanan arah)',
      info: 'Planet terjauh ke-8 dari Matahari dengan angin terkencang di tata surya mencapai 2.100 km/jam. Berwarna biru tua karena metana di atmosfernya. Ditemukan melalui perhitungan matematis sebelum diamati langsung.',
      texture: neptuneTexture,
      desc: 'Planet terjauh yang sangat berangin dan biru.'
    },
    'sun': {
      nama: 'Sun',
      namaBahasa: 'Matahari', emoji: '☀️',
      tipe: 'Bintang (G-type)',
      bulan: '0',
      rotasi: '25-35 hari',
      revolusi: 'N/A',
      jarak: '0 km',
      suhu: '5.500°C (Permukaan)',
      info: 'Pusat tata surya kita. Massa matahari mencakup 99,8% dari total massa seluruh tata surya.',
      texture: sunTexture,
      desc: 'Bintang pusat sistem tata surya kita.'
    },
    'pluto': {
      namaBahasa: 'Pluto', emoji: '⚪', tipe: 'Planet Kerdil', nomor: 'Eks Planet ke-9', warna: '#b8a89a',
      radius: '1.188,3 km', kemiringan: '122,53°', rotasi: '6,4 hari Bumi',
      orbit: '248 tahun Bumi', jarak: '5,9 miliar km', bulan: '5 bulan — Charon (terbesar), Styx, Nix, Kerberos, Hydra',
      info: 'Diklasifikasikan ulang menjadi planet kerdil pada 2006 oleh IAU. Terletak di Sabuk Kuiper. Misi New Horizons (2015) mengungkap permukaan bervariasi dengan pegunungan es dan dataran nitrogen beku berbentuk hati.',
      texture: plutoTexture,
      desc: 'Planet kerdil yang berada di Sabuk Kuiper.'
    }
  };


// Array of planets and atmospheres for raycasting
const raycastTargets = [
  mercury.planet, venus.planet, venus.Atmosphere, earth.planet, earth.Atmosphere, 
  mars.planet, jupiter.planet, saturn.planet, uranus.planet, neptune.planet, pluto.planet, sun
];

// ******  SHADOWS  ******
renderer.shadowMap.enabled = true;
pointLight.castShadow = true;

//properties for the point light
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 10;
pointLight.shadow.camera.far = 20;

//casting and receiving shadows
earth.planet.castShadow = true;
earth.planet.receiveShadow = true;
earth.Atmosphere.castShadow = true;
earth.Atmosphere.receiveShadow = true;
earth.moons.forEach(moon => {
moon.mesh.castShadow = true;
moon.mesh.receiveShadow = true;
});
mercury.planet.castShadow = true;
mercury.planet.receiveShadow = true;
venus.planet.castShadow = true;
venus.planet.receiveShadow = true;
venus.Atmosphere.receiveShadow = true;
mars.planet.castShadow = true;
mars.planet.receiveShadow = true;
jupiter.planet.castShadow = true;
jupiter.planet.receiveShadow = true;
jupiter.moons.forEach(moon => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
  });
saturn.planet.castShadow = true;
saturn.planet.receiveShadow = true;
saturn.Ring.receiveShadow = true;
uranus.planet.receiveShadow = true;
neptune.planet.receiveShadow = true;
pluto.planet.receiveShadow = true;




let _rafId = null;
function animate() {
  _rafId = requestAnimationFrame(animate);
  if (!isSimulationRunning) return;

  // Skip ALL heavy computation when a non-koleksi modal is open
  if (isModalOpen && currentOpenModalId && currentOpenModalId !== 'modal-koleksi') {
    controls.update();
    return;
  }

  //rotating planets around the sun and itself
  sun.rotateY(0.001 * settings.acceleration);
  mercury.planet.rotateY(0.001 * settings.acceleration);
  mercury.planet3d.rotateY(0.004 * settings.accelerationOrbit);
  venus.planet.rotateY(0.0005 * settings.acceleration)
  venus.Atmosphere.rotateY(0.0005 * settings.acceleration);
  venus.planet3d.rotateY(0.0006 * settings.accelerationOrbit);
  earth.planet.rotateY(0.005 * settings.acceleration);
  earth.Atmosphere.rotateY(0.001 * settings.acceleration);
  earth.planet3d.rotateY(0.001 * settings.accelerationOrbit);
  mars.planet.rotateY(0.01 * settings.acceleration);
  mars.planet3d.rotateY(0.0007 * settings.accelerationOrbit);
  jupiter.planet.rotateY(0.005 * settings.acceleration);
  jupiter.planet3d.rotateY(0.0003 * settings.accelerationOrbit);
  saturn.planet.rotateY(0.01 * settings.acceleration);
  saturn.planet3d.rotateY(0.0002 * settings.accelerationOrbit);
  uranus.planet.rotateY(0.005 * settings.acceleration);
  uranus.planet3d.rotateY(0.0001 * settings.accelerationOrbit);
  neptune.planet.rotateY(0.005 * settings.acceleration);
  neptune.planet3d.rotateY(0.00008 * settings.accelerationOrbit);
  pluto.planet.rotateY(0.001 * settings.acceleration)
  pluto.planet3d.rotateY(0.00006 * settings.accelerationOrbit)

  // Animate Earth's moon
  if (earth.moons) {
    earth.moons.forEach(moon => {
      const time = performance.now();
      const tiltAngle = 5 * Math.PI / 180;
      const moonX = earth.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
      const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.sin(tiltAngle);
      const moonZ = earth.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.cos(tiltAngle);
      moon.mesh.position.set(moonX, moonY, moonZ);
      moon.mesh.rotateY(0.01);
    });
  }
  // Animate Mars' moons
  if (marsMoons){
    marsMoons.forEach(moon => {
      if (moon.mesh) {
        const time = performance.now();
        const moonX = mars.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
        const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
        const moonZ = mars.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
        moon.mesh.position.set(moonX, moonY, moonZ);
        moon.mesh.rotateY(0.001);
      }
    });
  }

  // Animate Jupiter's moons
  if (jupiter.moons) {
    jupiter.moons.forEach(moon => {
      const time = performance.now();
      const moonX = jupiter.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
      const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
      const moonZ = jupiter.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
      moon.mesh.position.set(moonX, moonY, moonZ);
      moon.mesh.rotateY(0.01);
    });
  }

  // Rotate asteroids (Simplified for performance)
  const asteroidRotSpeed = 0.0001;
  const orbitSpeedVal = 0.0001 * settings.accelerationOrbit;
  if (orbitSpeedVal !== 0) {
    asteroids.forEach(asteroid => {
      asteroid.rotation.y += asteroidRotSpeed;
      const x = asteroid.position.x;
      const z = asteroid.position.z;
      asteroid.position.x = x * Math.cos(orbitSpeedVal) + z * Math.sin(orbitSpeedVal);
      asteroid.position.z = z * Math.cos(orbitSpeedVal) - x * Math.sin(orbitSpeedVal);
    });
  }

  // ****** OUTLINES ON PLANETS ******
  if (!isModalOpen) {
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(raycastTargets);
    outlinePass.selectedObjects = [];
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      if (intersectedObject === earth.Atmosphere) {
        outlinePass.selectedObjects = [earth.planet];
      } else if (intersectedObject === venus.Atmosphere) {
        outlinePass.selectedObjects = [venus.planet];
      } else {
        outlinePass.selectedObjects = [intersectedObject];
      }
    }
  }

  // ******  ZOOM IN/OUT  ******
  if (isMovingTowardsPlanet) {
    camera.position.lerp(targetCameraPosition, 0.03);
    if (camera.position.distanceTo(targetCameraPosition) < 1) {
      isMovingTowardsPlanet = false;
      showPlanetInfo(selectedPlanet.name);
    }
  } else if (isZoomingOut) {
    camera.position.lerp(zoomOutTargetPosition, 0.08);
    if (camera.position.distanceTo(zoomOutTargetPosition) < 1) {
      isZoomingOut = false;
    }
  }

  // ****** HAND TRACKING ACTIONS ******
  if (isHandActive || Math.abs(handVelocity.x) > 0.0001 || Math.abs(handVelocity.y) > 0.0001) {
    const rotateSpeed = 6.0; 
    const panSpeed = 35.0;    
    const zoomSpeed = 120.0;  

    // Hentikan sepenuhnya jika sangat kecil (mencegah drift)
    if (Math.abs(handVelocity.x) < 0.0001) handVelocity.x = 0;
    if (Math.abs(handVelocity.y) < 0.0001) handVelocity.y = 0;

    const isMoving = handVelocity.x !== 0 || handVelocity.y !== 0;

    if (isHandActive) {
      switch (handCurrentGesture) {
        case 'open_palm':
          if (isMoving) {
            const angleX = handVelocity.x * rotateSpeed;
            const angleY = handVelocity.y * rotateSpeed;
            
            camera.position.sub(controls.target);
            camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleX);
            
            const rightAxis = new THREE.Vector3().crossVectors(camera.up, camera.position).normalize();
            camera.position.applyAxisAngle(rightAxis, angleY);
            
            camera.position.add(controls.target);
            camera.lookAt(controls.target);
          }
          break;
        case 'fist':
          if (isMoving) {
            const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
            const right = new THREE.Vector3().crossVectors(camera.up, dir).normalize();
            const up = camera.up.clone().normalize();
            
            const moveX = right.multiplyScalar(-handVelocity.x * panSpeed);
            const moveY = up.multiplyScalar(-handVelocity.y * panSpeed);
            
            controls.target.add(moveX).add(moveY);
            camera.position.add(moveX).add(moveY);
          }
          break;
        case 'pinch':
          if (handVelocity.y !== 0) {
            const zoomAmount = handVelocity.y * zoomSpeed;
            const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
            const currentDist = camera.position.distanceTo(controls.target);
            
            const newDist = Math.max(5, Math.min(1000, currentDist + zoomAmount));
            camera.position.copy(controls.target).add(direction.multiplyScalar(newDist));
          }
          break;
      }
    }
    
    // Terapkan Efek Momentum (Friction / Gesekan)
    // 0.70 memberikan efek lebih berat dan cepat berhenti
    handVelocity.x *= 0.70;
    handVelocity.y *= 0.70;
  }

  controls.update();

  // Skip main 3D render when a non-koleksi modal is open (to save GPU)
  if (isModalOpen && currentOpenModalId && currentOpenModalId !== 'modal-koleksi') {
    return;
  }
  
  // In Camera AR mode, bypass EffectComposer to preserve canvas alpha transparency
  // so the camera video behind the canvas is visible
  if (isCameraARMode) {
    renderer.render(scene, camera);
  } else {
    composer.render();
  }
}
loadAsteroids('/asteroids/asteroidPack.glb', 200, 130, 160);
loadAsteroids('/asteroids/asteroidPack.glb', 600, 352, 370);

// Hide canvas at startup - don't animate until user enters simulation
renderer.domElement.style.display = 'none';
// DO NOT call animate() here - called only from mulaiJelajah()

renderer.domElement.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);

// ======  TOUCH SUPPORT FOR MOBILE  ======
let touchStartPos = { x: 0, y: 0 };
let touchStartTime = 0;

renderer.domElement.addEventListener('touchstart', function(event) {
  if (event.touches.length === 1) {
    const touch = event.touches[0];
    touchStartPos.x = touch.clientX;
    touchStartPos.y = touch.clientY;
    touchStartTime = Date.now();
    // Update mouse position for outline raycasting
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  }
}, { passive: true });

renderer.domElement.addEventListener('touchend', function(event) {
  if (event.changedTouches.length === 1) {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartPos.x;
    const dy = touch.clientY - touchStartPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const elapsed = Date.now() - touchStartTime;

    // Only trigger planet click on short taps with minimal movement
    if (dist < 15 && elapsed < 400) {
      mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(raycastTargets);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        selectedPlanet = identifyPlanet(clickedObject);
        if (selectedPlanet) {
          tutupInfoTanpaZoom();
          settings.accelerationOrbit = 0;
          const planetPosition = new THREE.Vector3();
          selectedPlanet.planet.getWorldPosition(planetPosition);
          controls.target.copy(planetPosition);
          camera.lookAt(planetPosition);
          targetCameraPosition.copy(planetPosition).add(
            camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset)
          );
          isMovingTowardsPlanet = true;
        }
      }
    }
  }
}, { passive: true });

window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  composer.setSize(window.innerWidth,window.innerHeight);
});

// ======  LANDING PAGE LOGIC  ======
function mulaiJelajah() {
  const landingPage = document.getElementById('landing-page');
  const btnBack = document.getElementById('btn-back-to-menu');
  const btnCameraAR = document.getElementById('btn-camera-ar-wrapper');
  if (landingPage) {
    // Show and start rendering
    renderer.domElement.style.display = 'block';
    isSimulationRunning = true;
    if (!_rafId) animate(); // Start loop only if not already running
    landingPage.classList.add('sembunyi');
    if (btnBack) btnBack.classList.add('aktif');
    if (btnCameraAR) btnCameraAR.classList.add('aktif');
    
    if (window.playBGM) window.playBGM('jelajah');

    // Aktifkan hand tracking secara otomatis di latar belakang
    aktifkanHandTrackingLatarBelakang();

    setTimeout(() => {
      landingPage.style.display = 'none';
    }, 900);
  }
}

function kembaliKeMenu() {
  const landingPage = document.getElementById('landing-page');
  const btnBack = document.getElementById('btn-back-to-menu');
  const btnCameraAR = document.getElementById('btn-camera-ar-wrapper');
  if (landingPage) {
    // If Camera AR is active, deactivate it first
    if (isCameraARMode) {
      nonaktifkanCameraARInstant();
    }
    
    // Matikan Hand Tracking dan Stream Latar Belakang
    nonaktifkanHandTrackingLatarBelakang();

    // Fully stop rendering and hide canvas
    isSimulationRunning = false;
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    renderer.domElement.style.display = 'none';
    landingPage.style.display = 'flex';
    
    if (window.playBGM) window.playBGM('backsound');

    setTimeout(() => landingPage.classList.remove('sembunyi'), 10);
    if (btnBack) btnBack.classList.remove('aktif');
    if (btnCameraAR) btnCameraAR.classList.remove('aktif');
  }
}



// ============================================================
// AUDIO SYSTEM
// ============================================================
const audioBacksound = document.getElementById('audio-backsound');
const audioJelajah = document.getElementById('audio-jelajah');
const audioQuiz = document.getElementById('audio-quiz');
const audioClick = document.getElementById('audio-click');

let currentBGM = null;

function stopAllBGM() {
  [audioBacksound, audioJelajah, audioQuiz].forEach(audio => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
}

function playBGM(type) {
  stopAllBGM();
  let target = null;
  if (type === 'backsound') target = audioBacksound;
  if (type === 'jelajah') target = audioJelajah;
  if (type === 'quiz') target = audioQuiz;

  if (target) {
    target.volume = document.getElementById('vol-back').value;
    target.play().catch(e => console.log("Audio blocked by browser"));
    currentBGM = target;
  }
}

function initAudio() {
  // Unlock all audio elements on first user interaction (critical for mobile iOS/Android)
  const unlockAudio = () => {
    [audioBacksound, audioJelajah, audioQuiz, audioClick].forEach(a => {
      if (a) {
        a.play().catch(() => {});
        a.pause();
        a.currentTime = 0;
      }
    });
    if (!currentBGM) playBGM('backsound');
    ['click', 'touchstart'].forEach(evt => window.removeEventListener(evt, unlockAudio));
  };
  ['click', 'touchstart'].forEach(evt => window.addEventListener(evt, unlockAudio, { once: true }));

  // Attach click sound to ALL buttons
  document.addEventListener('click', (e) => {
    if (e.target.closest('button')) {
      if (audioClick) {
        audioClick.volume = document.getElementById('vol-click').value;
        audioClick.currentTime = 0;
        audioClick.play().catch(() => {});
      }
    }
  });
}

// ============================================================
// LOADING SYSTEM
// ============================================================
function initLoading() {
  const loadingScreen = document.getElementById('loading-screen');
  const barFill = document.getElementById('loading-bar-fill');
  const percentText = document.getElementById('loading-percent');

  THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = (itemsLoaded / itemsTotal) * 100;
    if (barFill) barFill.style.width = progress + '%';
    if (percentText) percentText.innerText = Math.round(progress) + '%';
  };

  THREE.DefaultLoadingManager.onLoad = () => {
    setTimeout(() => {
      const barContainer = document.querySelector('.loading-bar-container');
      const statusText = document.querySelector('.loading-status');
      const actionContainer = document.getElementById('loading-action-container');

      if (barContainer) barContainer.style.display = 'none';
      if (statusText) statusText.innerHTML = '<span style="color: #4ade80; font-weight: bold; font-size: 1.1rem;">✔ Alam Semesta Siap Dijelajahi!</span>';
      if (actionContainer) actionContainer.style.display = 'block';
    }, 600);
  };
}

function selesaiLoading() {
  const loadingScreen = document.getElementById('loading-screen');

  // Explicitly unlock ALL audio elements inside this direct user click handler!
  [audioBacksound, audioJelajah, audioQuiz, audioClick].forEach(a => {
    if (a) {
      a.play().catch(() => {});
      a.pause();
      a.currentTime = 0;
    }
  });

  if (audioClick) audioClick.play().catch(() => {});
  playBGM('backsound');

  if (loadingScreen) {
    loadingScreen.classList.add('sembunyi');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 800);
  }
}
window.selesaiLoading = selesaiLoading;

function updateVolume(type) {
  const vol = document.getElementById(`vol-${type}`).value;
  const label = document.getElementById(`label-vol-${type}`);
  if (label) label.innerText = Math.round(vol * 100) + '%';
  
  if (type === 'back' && currentBGM) currentBGM.volume = vol;
  if (type === 'click' && audioClick) audioClick.volume = vol;
}

window.playBGM = playBGM;
window.updateVolume = updateVolume;
initLoading();
initAudio();

// ============================================================
// MODAL SYSTEM & COLLECTION PREVIEW
// ============================================================
let previewRenderer, previewScene, previewCamera, previewPlanet;
let isModalOpen = false;
let currentOpenModalId = null;

function initPreview3D() {
  const container = document.getElementById('planet-canvas-container');
  if (!container) return;

  previewScene = new THREE.Scene();
  previewCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  previewCamera.position.z = 4;

  previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  previewRenderer.setSize(container.clientWidth, container.clientHeight);
  previewRenderer.setPixelRatio(window.devicePixelRatio);
  
  // Fix canvas escaping modal due to global CSS
  previewRenderer.domElement.style.position = 'relative';
  previewRenderer.domElement.style.zIndex = '10';
  
  container.appendChild(previewRenderer.domElement);

  const light = new THREE.PointLight(0xffffff, 2.5);
  light.position.set(5, 3, 5);
  previewScene.add(light);
  previewScene.add(new THREE.AmbientLight(0xffffff, 1.5));

  function animate() {
    if (!isModalOpen) {
      _previewRafId = null;
      return; 
    }
    _previewRafId = requestAnimationFrame(animate);
    if (previewPlanet) previewPlanet.rotation.y += 0.005;
    previewRenderer.render(previewScene, previewCamera);
  }
  animate();
}

let _previewRafId = null;
function restartPreviewLoop() {
  if (isModalOpen && !_previewRafId) {
    const animate = () => {
      if (!isModalOpen) {
        _previewRafId = null;
        return;
      }
      _previewRafId = requestAnimationFrame(animate);
      if (previewPlanet) previewPlanet.rotation.y += 0.005;
      if (previewRenderer && previewScene && previewCamera) {
        previewRenderer.render(previewScene, previewCamera);
      }
    };
    animate();
  }
}

function selectPlanetPreview(name) {
  // Clear old planet
  if (previewPlanet) previewScene.remove(previewPlanet);

  const data = planetData[name.toLowerCase()] || planetData['earth'];
  
  // Re-use texture loader or use pre-loaded textures
  const texture = loadTexture.load(data.texture);
  const geometry = new THREE.SphereGeometry(1.5, 64, 64);
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 });
  previewPlanet = new THREE.Mesh(geometry, material);
  previewScene.add(previewPlanet);

  document.getElementById('preview-name').innerText = (data.namaBahasa || name).toUpperCase();
  document.getElementById('preview-desc').innerText = data.desc || data.info;
  
  // Highlight active item
  document.querySelectorAll('.coll-item').forEach(el => el.classList.remove('active'));
  const activeEl = Array.from(document.querySelectorAll('.coll-item')).find(el => el.title === name);
  if (activeEl) activeEl.classList.add('active');
}

function bukaKoleksi() {
  const modal = document.getElementById('modal-koleksi');
  const grid = document.getElementById('collection-items');
  const userNameEl = document.getElementById('koleksi-user-name');

  if (userNameEl) {
    userNameEl.innerText = window.appUserData ? window.appUserData.displayName : (window.appUser ? window.appUser.displayName : 'Guest Account');
  }

  if (grid) {
    grid.innerHTML = ''; // Selalu bersihkan sebelum render

    if (!window.appUser || !window.appUserData) {
      grid.innerHTML = '<div style="grid-column: 1 / -1; width:100%; text-align:center; padding: 20px; color: rgba(255,255,255,0.6);">Silakan login Google untuk melihat koleksi Anda.</div>';
    } else {
      const userCollections = window.appUserData.collections || [];
      
      if (userCollections.length === 0) {
        grid.innerHTML = '<div style="width:100%; text-align:center; padding: 20px; color: rgba(255,255,255,0.6);">Koleksi masih kosong. Mainkan Misi Kuis untuk mendapatkan planet!</div>';
      } else {
        userCollections.forEach(p => {
          const item = document.createElement('div');
          item.className = 'coll-item';
          const pData = planetData[p.toLowerCase()];
          const tex = pData ? pData.texture : '';
          item.style.backgroundImage = `url('${tex}')`;
          item.title = p;
          item.onclick = () => selectPlanetPreview(p);
          grid.appendChild(item);
        });
      }
    }
  }

  if (modal) {
    modal.style.display = 'flex';
    isModalOpen = true;
    currentOpenModalId = 'modal-koleksi';
    if (!previewRenderer) {
      initPreview3D();
    } else {
      restartPreviewLoop();
    }
    
    // Default select first item if available
    if (window.appUserData && window.appUserData.collections && window.appUserData.collections.length > 0) {
      selectPlanetPreview(window.appUserData.collections[0]);
    }
  }
}

function bukaPencapaian() {
  const modal = document.getElementById('modal-pencapaian');
  const list = document.getElementById('achievement-list');
  
  if (list) {
    list.innerHTML = ''; // Selalu bersihkan sebelum render

    if (!window.appUser || !window.appUserData) {
      list.innerHTML = '<div style="width:100%; text-align:center; padding: 20px; color: rgba(255,255,255,0.6);">Silakan login Google untuk melihat pencapaian Anda.</div>';
    } else {
      const userAchs = window.appUserData.achievements || [];
      
      const allAchs = [
        { id: 'explorer', t: 'Solar Explorer', d: 'Telah login untuk pertama kalinya.', i: 'explore' },
        { id: 'quiz_master', t: 'Quiz Master', d: 'Menjawab 50+ kuis dengan benar.', i: 'school' },
        { id: 'first_discovery', t: 'First Discovery', d: 'Mendapatkan planet pertama dari kuis.', i: 'auto_awesome' },
        { id: 'speed_runner', t: 'Speed Runner', d: 'Menyelesaikan kuis dalam waktu < 1 menit.', i: 'timer' },
        { id: 'star_gazer', t: 'Star Gazer', d: 'Melihat detail Matahari selama 5 menit.', i: 'wb_sunny' },
        { id: 'moon_walker', t: 'Moon Walker', d: 'Menemukan semua satelit alami di Bumi.', i: 'nightlight' },
        { id: 'interstellar', t: 'Interstellar', d: 'Mencapai skor sempurna di Misi Hard.', i: 'rocket_launch' }
      ];

      // Beri achievement dasar jika baru login pertama kali
      if (!userAchs.includes('explorer')) {
        userAchs.push('explorer');
        if(window.appUser) {
           updateDoc(doc(window.db, 'users', window.appUser.uid), {
             achievements: arrayUnion('explorer')
           });
        }
      }

      allAchs.forEach(a => {
        const isEarned = userAchs.includes(a.id);
        list.innerHTML += `
          <div class="ach-item ${isEarned ? 'earned' : 'locked'}">
            <div class="ach-icon"><span class="material-symbols-rounded">${a.i}</span></div>
            <div class="ach-info">
              <div class="ach-title">${a.t}</div>
              <div class="ach-desc">${a.d}</div>
            </div>
            ${isEarned ? '<span class="material-symbols-rounded" style="color:#22c55e;">check_circle</span>' : '<span class="material-symbols-rounded" style="color:rgba(255,255,255,0.2);">lock</span>'}
          </div>`;
      });
    }
  }
  if (modal) {
    modal.style.display = 'flex';
    isModalOpen = true;
    currentOpenModalId = 'modal-pencapaian';
  }
}

function bukaPengaturan() {
  const modal = document.getElementById('modal-pengaturan');
  if (modal) {
    modal.style.display = 'flex';
    isModalOpen = true;
    currentOpenModalId = 'modal-pengaturan';
  }
}

function tutupModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
    isModalOpen = false;
    currentOpenModalId = null;
  }
}



// ============================================================
// AUTHENTICATION & FIRESTORE LOGIC
// ============================================================
async function syncUserData(user) {
  const localKey = 'astroquest_user_' + user.uid;
  let data = JSON.parse(localStorage.getItem(localKey));

  if (data) {
    console.log("User data loaded from localStorage");
  } else {
    data = {
      displayName: user.displayName,
      photoURL: user.photoURL,
      collections: [],
      achievements: []
    };
    console.log("New user document created in localStorage");
  }

  let isUpdated = false;
  if (!data.collections || data.collections.length === 0) {
    data.collections = []; 
    isUpdated = true;
  }
  if (!data.achievements || data.achievements.length === 0) {
    data.achievements = ['explorer'];
    isUpdated = true;
  }

  if (isUpdated || !localStorage.getItem(localKey)) {
    localStorage.setItem(localKey, JSON.stringify(data));
    console.log("Initial data saved to localStorage");
  }

  window.appUserData = data;
}

function loginGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Logged in as:", result.user.displayName);
    }).catch((error) => {
      console.error("Login failed:", error);
      alert("Gagal login: " + error.code + "\n" + error.message);
    });
}

function logout() {
  signOut(auth).then(() => {
    console.log("Logged out");
    window.appUser = null;
    window.appUserData = null;
  }).catch((error) => {
    console.error("Logout failed:", error);
  });
}

function updateAuthUI(user) {
  const guestDiv = document.getElementById('auth-guest');
  const userDiv = document.getElementById('auth-user');
  const profilePic = document.getElementById('profile-pic');
  const profileName = document.getElementById('display-name-text');
  const btnLogin = document.getElementById('btn-login-google');
  const btnEdit = document.getElementById('btn-edit-profile');
  
  if (user) {
    if (guestDiv) guestDiv.style.display = 'none';
    if (userDiv) userDiv.style.display = 'flex';
    if (document.getElementById('user-photo')) document.getElementById('user-photo').src = user.photoURL;
    if (document.getElementById('user-name')) document.getElementById('user-name').innerText = user.displayName;
    
    // Update settings modal profile
    if (profilePic) {
      profilePic.innerHTML = `<img id="settings-profile-img" src="${user.photoURL}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    }
    if (profileName) profileName.innerText = user.displayName;
    if (btnLogin) btnLogin.style.display = 'none';
    if (btnEdit) btnEdit.style.display = 'inline-block';
  } else {
    if (guestDiv) guestDiv.style.display = 'block';
    if (userDiv) userDiv.style.display = 'none';
    if (profilePic) {
      profilePic.innerHTML = 'G';
      profilePic.style.background = '#8b5cf6';
    }
    if (profileName) profileName.innerText = 'Guest Account';
    if (btnLogin) btnLogin.style.display = 'inline-block';
    if (btnEdit) btnEdit.style.display = 'none';
  }
}

function toggleEditProfile() {
  const form = document.getElementById('edit-profile-form');
  if (form.style.display === 'none') {
    form.style.display = 'block';
    if (window.appUser) {
      document.getElementById('input-edit-name').value = window.appUser.displayName || '';
    }
    document.getElementById('edit-profile-status').innerText = '';
  } else {
    form.style.display = 'none';
  }
}

async function simpanProfil() {
  if (!window.appUser) return;
  const newName = document.getElementById('input-edit-name').value.trim();
  const fileInput = document.getElementById('input-edit-photo');
  const statusEl = document.getElementById('edit-profile-status');
  
  if (!newName) {
    statusEl.innerText = "Nama tidak boleh kosong.";
    return;
  }

  statusEl.innerText = "Menyimpan profil...";
  statusEl.style.color = "#fbbf24"; // yellow

  try {
    let newPhotoURL = window.appUser.photoURL;

    // Handle File Upload dengan Base64 (Bypass Firebase Storage)
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      statusEl.innerText = "Memproses foto...";
      
      // Convert file to Base64 String
      newPhotoURL = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject("Gagal membaca file gambar.");
        reader.readAsDataURL(file);
      });
    }

    // Update Firebase Auth Profile
    statusEl.innerText = "Memperbarui data autentikasi...";
    await updateProfile(window.appUser, {
      displayName: newName,
      photoURL: newPhotoURL
    });

    // Update LocalStorage Document
    statusEl.innerText = "Memperbarui database lokal...";
    await window.updateDoc(window.appUser.uid, {
      displayName: newName,
      photoURL: newPhotoURL
    });

    // Reload Data and UI
    window.appUserData.displayName = newName;
    window.appUserData.photoURL = newPhotoURL;
    updateAuthUI(window.appUser);
    
    statusEl.innerText = "Profil berhasil diperbarui!";
    statusEl.style.color = "#22c55e"; // green
    
    setTimeout(() => {
      toggleEditProfile();
    }, 1500);

  } catch (error) {
    console.error("Gagal menyimpan profil:", error);
    statusEl.innerText = "Error: " + error.message;
    statusEl.style.color = "#ef4444"; // red
  }
}

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  window.appUser = user;
  if (user) {
    await syncUserData(user);
  }
  updateAuthUI(user);
});


// ============================================================
// EXPOSE ALL FUNCTIONS TO GLOBAL SCOPE (at end, after all defs)
// ============================================================
// ============================================================
// CAMERA AR SYSTEM & HAND TRACKING
// ============================================================
let isCameraARMode = false;
let cameraStream = null;

// Variabel Global Hand Tracking
let arHandsInstance = null;
let fpEstimator = null;
let isHandsProcessing = false;
let isHandActive = false;
let handCurrentGesture = 'none';
let handVelocity = { x: 0, y: 0 };
let handPrevPos = { x: 0, y: 0 };
let handPinchDistance = 0;
let handCanvas = null;
let handCtx = null;

function initHandTracking() {
  if (arHandsInstance) return;
  if (!window.Hands || !window.fp) {
    console.warn("MediaPipe atau Fingerpose belum termuat.");
    return;
  }

  // Override window.alert untuk mencegah popup native yang mengganggu dari MediaPipe
  // karena Brave Browser / Fingerprinting Protection memblokir WebGL.
  if (!window._originalAlertSaved) {
    window._originalAlertSaved = true;
    const originalAlert = window.alert;
    window.alert = function(msg) {
      if (typeof msg === 'string' && msg.includes("Failed to create WebGL canvas context")) {
        console.error("MediaPipe WebGL Error:", msg);
        originalAlert("Browser memblokir fitur Hand Tracking AR (Kemungkinan karena Brave Shields atau ekstensi AdBlocker). Silakan MATIKAN Brave Shields (ikon Singa di address bar) atau gunakan Google Chrome.");
        
        // Hentikan proses hand tracking agar tidak alert terus menerus
        if (arHandsInstance) {
          isHandTrackingActive = false;
        }
      } else {
        originalAlert(msg);
      }
    };
  }

  try {
    arHandsInstance = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    
    arHandsInstance.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    const OpenPalmGesture = new window.fp.GestureDescription('open_palm');
    for (const finger of [window.fp.Finger.Thumb, window.fp.Finger.Index, window.fp.Finger.Middle, window.fp.Finger.Ring, window.fp.Finger.Pinky]) {
      OpenPalmGesture.addCurl(finger, window.fp.FingerCurl.NoCurl, 1.0);
      OpenPalmGesture.addCurl(finger, window.fp.FingerCurl.HalfCurl, 0.5); // Toleransi sedikit menekuk
    }
    
    const FistGesture = new window.fp.GestureDescription('fist');
    for (const finger of [window.fp.Finger.Thumb, window.fp.Finger.Index, window.fp.Finger.Middle, window.fp.Finger.Ring, window.fp.Finger.Pinky]) {
      FistGesture.addCurl(finger, window.fp.FingerCurl.FullCurl, 1.0);
      FistGesture.addCurl(finger, window.fp.FingerCurl.HalfCurl, 0.8); // Toleransi genggaman kurang rapat
    }
    FistGesture.addCurl(window.fp.Finger.Thumb, window.fp.FingerCurl.HalfCurl, 1.0);
    FistGesture.addCurl(window.fp.Finger.Thumb, window.fp.FingerCurl.NoCurl, 0.5);

    fpEstimator = new window.fp.GestureEstimator([OpenPalmGesture, FistGesture]);

    arHandsInstance.onResults((results) => {
      isHandsProcessing = false;
      
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        isHandActive = true;
        const landmarks = results.multiHandLandmarks[0];
        
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) +
          Math.pow(thumbTip.y - indexTip.y, 2) +
          Math.pow(thumbTip.z - indexTip.z, 2)
        );

        const fpLandmarks = landmarks.map((lm) => [lm.x, lm.y, lm.z]);
        // Menurunkan batas minimal skor keyakinan dari 8.0 menjadi 6.5 agar lebih mudah terdeteksi
        const estimatedGestures = fpEstimator.estimate(fpLandmarks, 6.5);
        
        let detectedGesture = 'none';
        // Memperbesar jarak maksimal cubit dari 0.05 ke 0.10 agar jauh lebih mudah mendeteksi Pinch
        if (distance < 0.10) {
          detectedGesture = 'pinch';
        } else if (estimatedGestures.gestures.length > 0) {
          const bestGesture = estimatedGestures.gestures.reduce((p, c) => p.score > c.score ? p : c);
          detectedGesture = bestGesture.name;
        }
        
        handCurrentGesture = detectedGesture;
        handPinchDistance = distance;
        
        const center = landmarks[9];
        const prevX = handPrevPos.x;
        const prevY = handPrevPos.y;

        if (prevX === 0 && prevY === 0) {
          handPrevPos.x = center.x;
          handPrevPos.y = center.y;
        } else {
          // Low-pass filter (0.3) untuk menghaluskan noise dari AI MediaPipe
          const smoothX = prevX + (center.x - prevX) * 0.3;
          const smoothY = prevY + (center.y - prevY) * 0.3;
          
          // Tambahkan pergerakan ke kecepatan (Velocity)
          handVelocity.x += -(smoothX - prevX);
          handVelocity.y += (smoothY - prevY);
          
          handPrevPos.x = smoothX;
          handPrevPos.y = smoothY;
        }
      } else {
        isHandActive = false;
        handCurrentGesture = 'none';
        // Saat tangan hilang, kurangi kecepatan drastis agar berhenti dengan halus
        handVelocity.x *= 0.5;
        handVelocity.y *= 0.5;
        handPrevPos = { x: 0, y: 0 };
      }
    });
  } catch (err) {
    console.error("Error inisialisasi hand tracking:", err);
  }
}

let isHandTrackingActive = false;

async function aktifkanHandTrackingLatarBelakang() {
  if (isHandTrackingActive) return;
  const video = document.getElementById('camera-ar-video');
  try {
    if (!cameraStream) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const constraints = {
        video: {
          facingMode: isMobile ? { ideal: 'environment' } : 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = cameraStream;
      await video.play();
    }
    
    isHandTrackingActive = true;
    try {
      initHandTracking();
      processHandTrackingFrame();
    } catch (err) {
      console.error("Gagal menjalankan hand tracking di latar belakang:", err);
    }
  } catch (err) {
    console.error('Kamera gagal diakses untuk hand tracking:', err);
  }
}

function nonaktifkanHandTrackingLatarBelakang() {
  isHandTrackingActive = false;
  isHandActive = false;
  const video = document.getElementById('camera-ar-video');
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  if (video) video.srcObject = null;
}

function processHandTrackingFrame() {
  if (!isHandTrackingActive) return;
  const video = document.getElementById('camera-ar-video');
  if (video && video.readyState >= 2 && video.videoWidth > 0 && arHandsInstance && !isHandsProcessing) {
    
    if (!handCanvas) {
      handCanvas = document.createElement('canvas');
      handCtx = handCanvas.getContext('2d', { willReadFrequently: true });
    }
    if (handCanvas.width !== video.videoWidth || handCanvas.height !== video.videoHeight) {
      handCanvas.width = video.videoWidth;
      handCanvas.height = video.videoHeight;
    }
    
    try {
      handCtx.drawImage(video, 0, 0, handCanvas.width, handCanvas.height);
      isHandsProcessing = true;
      arHandsInstance.send({ image: handCanvas }).catch(err => {
        console.error("MediaPipe Process Error:", err);
      }).finally(() => {
        isHandsProcessing = false;
      });
    } catch (e) {
      console.error("Canvas draw error:", e);
      isHandsProcessing = false;
    }
  }
  
  if (isHandTrackingActive) {
    requestAnimationFrame(processHandTrackingFrame);
  }
}

async function aktifkanCameraAR() {
  // Prevent double activation
  if (isCameraARMode) return;

  const overlay = document.getElementById('camera-ar-overlay');
  
  // Jika karena suatu alasan stream belum ada (misal diblock), coba panggil ulang
  if (!cameraStream) {
    await aktifkanHandTrackingLatarBelakang();
  }
  
  // Jika tetap gagal, berarti memang tidak bisa (ditolak akses)
  if (!cameraStream) {
    alert("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.");
    return;
  }

  // Smooth transition: fade overlay in
  overlay.classList.add('aktif');

  setTimeout(() => {
    // Switch Three.js background to transparent
    scene.background = null;
    renderer.setClearColor(0x000000, 0); // fully transparent

    // Mark body as camera AR active (shows video, hides camera AR btn, shows back btn)
    document.body.classList.add('camera-ar-aktif');
    isCameraARMode = true;

    // Fade overlay out
    setTimeout(() => {
      overlay.classList.remove('aktif');
    }, 100);
  }, 600);
}

function nonaktifkanCameraAR() {
  if (!isCameraARMode) return;

  const overlay = document.getElementById('camera-ar-overlay');

  // Smooth transition: fade overlay in
  overlay.classList.add('aktif');

  setTimeout(() => {
    // Restore space background
    scene.background = originalSpaceBackground;
    renderer.setClearColor(0x000000, 1); // opaque again

    // Remove camera AR active state
    document.body.classList.remove('camera-ar-aktif');
    isCameraARMode = false;

    // Fade overlay out
    setTimeout(() => {
      overlay.classList.remove('aktif');
    }, 100);
  }, 600);
  
  // Kamera (cameraStream) TETAP DIBIARKAN MENYALA agar hand tracking berjalan
}

// Instant version (no transition) — used when going back to menu
function nonaktifkanCameraARInstant() {
  if (!isCameraARMode) return;

  scene.background = originalSpaceBackground;
  renderer.setClearColor(0x000000, 1);

  document.body.classList.remove('camera-ar-aktif');
  isCameraARMode = false;
  
  // Kamera (cameraStream) TETAP DIBIARKAN MENYALA (akan dimatikan oleh kembaliKeMenu)
}

window.mulaiJelajah = mulaiJelajah;
window.kembaliKeMenu = kembaliKeMenu;
window.bukaKoleksi = bukaKoleksi;
window.bukaPencapaian = bukaPencapaian;
window.bukaPengaturan = bukaPengaturan;
window.tutupModal = tutupModal;
window.selectPlanetPreview = selectPlanetPreview;
window.loginGoogle = loginGoogle;
window.logout = logout;
window.toggleEditProfile = toggleEditProfile;
window.simpanProfil = simpanProfil;
window.planetData = planetData;
window.updateVolume = updateVolume;
window.aktifkanCameraAR = aktifkanCameraAR;
window.nonaktifkanCameraAR = nonaktifkanCameraAR;
