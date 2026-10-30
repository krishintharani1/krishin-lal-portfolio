import * as THREE from "./vendor/three.module.min.js";
import { SYSTEMS, PROJECTS } from "./data.js";

const TAU = Math.PI * 2;
const RING_RADIUS = 4.35;
const RING_Y = -0.72;
const ORANGE = 0xff6a2b;
const LIME = 0xc4f000;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function shortestDelta(from, to) {
  let delta = (to - from) % TAU;
  if (delta > Math.PI) delta -= TAU;
  if (delta < -Math.PI) delta += TAU;
  return delta;
}

function advanceSpring(spring, target, delta, stiffness = 70, damping = 11) {
  for (let remaining = delta; remaining > 0; ) {
    const dt = Math.min(remaining, 1 / 120);
    spring.velocity += ((target - spring.value) * stiffness - spring.velocity * damping) * dt;
    spring.value += spring.velocity * dt;
    remaining -= dt;
  }
  return spring.value;
}

function mat(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.36,
    metalness: 0.16,
    ...options
  });
}

function glowMat(color, opacity = 0.3) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

function box(w, h, d, color, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, options));
  mesh.castShadow = !options.transparent;
  mesh.receiveShadow = !options.transparent;
  return mesh;
}

function cyl(radiusTop, radiusBottom, height, color, options = {}, segments = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), mat(color, options));
  mesh.castShadow = !options.transparent;
  mesh.receiveShadow = !options.transparent;
  return mesh;
}

function torus(radius, tube, color, options = {}) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 64), mat(color, options));
  mesh.castShadow = !options.transparent;
  mesh.receiveShadow = !options.transparent;
  return mesh;
}

function add(parent, mesh, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  parent.add(mesh);
  return mesh;
}

function line(points, color, opacity = 0.35) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

function buildRag(group, item, color, accent) {
  const dark = 0x122033;
  const slabs = [];

  for (let i = 0; i < 4; i += 1) {
    const slab = box(1.04 - i * 0.055, 0.11, 0.76, i % 2 ? color : dark, { roughness: 0.55, metalness: 0.12 });
    add(group, slab, 0, 0.22 + i * 0.145, 0, 0, (i - 1.5) * 0.09, 0);
    slabs.push(slab);
  }

  const top = box(0.96, 0.11, 0.7, accent, { emissive: accent, emissiveIntensity: 0.08, roughness: 0.45 });
  add(group, top, 0.02, 0.84, 0, 0, 0.12, 0);

  const orbit = new THREE.Group();
  orbit.position.y = 1.2;
  group.add(orbit);

  const lens = new THREE.Group();
  const lensRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.04, 8, 48),
    mat(color, { emissive: color, emissiveIntensity: 0.55, metalness: 0.5 })
  );
  lens.add(lensRing);
  const handle = box(0.055, 0.3, 0.055, accent, { metalness: 0.4 });
  add(lens, handle, 0.25, 0.24, 0, 0, 0, -0.62);
  lens.position.set(0.58, 0, 0);
  orbit.add(lens);

  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(0.42, 0.95, 24, 1, true),
    glowMat(color, 0.06)
  );
  add(group, beam, 0, 1.2, 0);

  return (time) => {
    orbit.rotation.y = time * 0.62;
    lens.rotation.z = Math.sin(time * 0.8) * 0.16;
    top.position.y = 0.84 + Math.sin(time * 1.2) * 0.02;
    beam.material.opacity = 0.045 + Math.sin(time * 1.7) * 0.012;
    slabs[3].rotation.y = 0.12 + Math.sin(time * 0.4) * 0.02;
  };
}

function buildInvoice(group, item, color, accent) {
  const documents = new THREE.Group();
  documents.position.y = 0.64;
  group.add(documents);

  const paperColors = [0xf4f1e7, 0xebe6d8, 0xfbf8ee];
  for (let i = 0; i < 3; i += 1) {
    const document = box(0.62, 0.86, 0.035, paperColors[i], { roughness: 0.68, metalness: 0.02 });
    document.position.set((i - 1) * 0.28, 0, (i - 1) * 0.12);
    document.rotation.y = (i - 1) * 0.22;
    documents.add(document);

    for (let j = 0; j < 4; j += 1) {
      const textLine = box(0.35 - j * 0.03, 0.018, 0.006, 0x1a2a3a, { roughness: 0.8, metalness: 0 });
      textLine.position.set(-0.02, 0.2 - j * 0.12, 0.022);
      document.add(textLine);
    }
  }

  const scanner = box(0.9, 0.03, 0.08, color, { emissive: color, emissiveIntensity: 1.3, metalness: 0.4 });
  add(group, scanner, 0, 1.15, 0.18);

  const chips = [];
  for (let i = 0; i < 3; i += 1) {
    const chip = box(0.12, 0.12, 0.12, i === 0 ? accent : color, {
      emissive: color,
      emissiveIntensity: 0.2,
      metalness: 0.3
    });
    add(group, chip, 0.72 + i * 0.17, 0.55 + i * 0.18, 0.2);
    chips.push(chip);
  }

  return (time) => {
    scanner.position.y = 0.32 + ((Math.sin(time * 1.45) + 1) / 2) * 0.98;
    scanner.material.emissiveIntensity = 1.0 + Math.sin(time * 3) * 0.18;
    documents.rotation.y = Math.sin(time * 0.28) * 0.08;
    chips.forEach((chip, index) => {
      chip.position.y = 0.55 + index * 0.18 + Math.sin(time * 1.1 + index) * 0.035;
      chip.rotation.y = time * 0.5 + index;
    });
  };
}

function buildTrade(group, item, color, accent) {
  const documentGroup = new THREE.Group();
  documentGroup.position.set(0, 0.72, 0);
  documentGroup.rotation.set(-0.06, 0.18, 0);
  group.add(documentGroup);

  const paper = box(0.8, 1.06, 0.035, 0xf6f2e6, { roughness: 0.7, metalness: 0.02 });
  documentGroup.add(paper);

  for (let i = 0; i < 6; i += 1) {
    const textLine = box(0.45 - (i % 2) * 0.12, 0.014, 0.006, 0x24364a, { roughness: 0.8, metalness: 0 });
    textLine.position.set(-0.05, 0.34 - i * 0.11, 0.022);
    documentGroup.add(textLine);
  }

  const scribblePoints = [
    new THREE.Vector3(-0.24, -0.25, 0.028),
    new THREE.Vector3(-0.15, -0.19, 0.028),
    new THREE.Vector3(-0.08, -0.27, 0.028),
    new THREE.Vector3(0.02, -0.2, 0.028),
    new THREE.Vector3(0.1, -0.28, 0.028),
    new THREE.Vector3(0.2, -0.22, 0.028)
  ];
  const scribble = line(scribblePoints, ORANGE, 0.9);
  documentGroup.add(scribble);

  const lens = new THREE.Group();
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.045, 8, 48),
    mat(color, { emissive: color, emissiveIntensity: 0.7, metalness: 0.55 })
  );
  lens.add(rim);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.24, 32), glowMat(color, 0.08));
  glass.position.z = 0.012;
  lens.add(glass);
  const handle = box(0.055, 0.34, 0.055, accent, { metalness: 0.4 });
  add(lens, handle, 0.25, 0.29, 0, 0, 0, -0.7);
  add(group, lens, 0.42, 1.04, 0.45);

  const scan = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.02), glowMat(color, 0.35));
  add(group, scan, 0, 0.95, 0.28);

  return (time) => {
    lens.position.x = Math.sin(time * 0.9) * 0.38;
    lens.position.y = 1.04 + Math.cos(time * 0.7) * 0.12;
    lens.rotation.z = Math.sin(time * 0.5) * 0.12;
    scan.position.y = 0.32 + ((Math.sin(time * 1.25) + 1) / 2) * 0.98;
    scan.material.opacity = 0.18 + (Math.sin(time * 2.4) + 1) * 0.08;
    documentGroup.rotation.y = 0.18 + Math.sin(time * 0.3) * 0.05;
  };
}

function buildAccount(group, item, color, accent) {
  const arch = new THREE.Group();
  arch.position.y = 0.55;
  group.add(arch);

  const archMat = mat(color, { metalness: 0.45, roughness: 0.3 });
  const topArc = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.06, 8, 48, Math.PI), archMat);
  topArc.position.y = 0.55;
  topArc.castShadow = true;
  arch.add(topArc);

  add(arch, box(0.11, 0.62, 0.11, color, { metalness: 0.4 }), -0.58, 0.22, 0);
  add(arch, box(0.11, 0.62, 0.11, color, { metalness: 0.4 }), 0.58, 0.22, 0);

  const card = box(0.44, 0.3, 0.035, accent, { emissive: accent, emissiveIntensity: 0.1, roughness: 0.42 });
  add(arch, card, 0, 0.45, 0.12);

  for (let i = 0; i < 3; i += 1) {
    const lineMesh = box(0.28 - i * 0.05, 0.012, 0.006, 0x142336, { roughness: 0.8 });
    add(card, lineMesh, -0.02, 0.07 - i * 0.06, 0.022);
  }

  for (let i = 0; i < 3; i += 1) {
    add(group, box(1.1 - i * 0.17, 0.09, 0.32, i === 0 ? 0x17263c : 0x122033, { roughness: 0.7 }), 0, 0.06 + i * 0.09, 0.18 + i * 0.1);
  }

  return (time) => {
    card.position.y = 0.45 + Math.sin(time * 1.3) * 0.04;
    card.rotation.y = Math.sin(time * 0.6) * 0.16;
    arch.rotation.y = Math.sin(time * 0.25) * 0.03;
  };
}

function buildMatch(group, item, color, accent) {
  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.065, 10, 64),
    mat(color, { emissive: color, emissiveIntensity: 0.35, metalness: 0.5 })
  );
  add(group, ringA, -0.18, 0.88, 0, Math.PI / 2, 0, 0);

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.065, 10, 64),
    mat(accent, { emissive: accent, emissiveIntensity: 0.35, metalness: 0.5 })
  );
  add(group, ringB, 0.18, 0.88, 0, 0, Math.PI / 2, 0);

  add(group, box(0.66, 0.06, 0.06, 0xf1eee4, { metalness: 0.35 }), 0, 0.36, 0);
  add(group, box(0.5, 0.08, 0.5, 0x122033, { roughness: 0.7 }), 0, 0.27, 0);

  const spark = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 32), glowMat(LIME, 0.5));
  add(group, spark, 0, 0.88, 0);

  return (time) => {
    ringA.rotation.z = time * 0.75;
    ringB.rotation.x = -time * 0.6;
    spark.rotation.z = time * 1.2;
    spark.rotation.y = time * 0.8;
  };
}

function buildGeo(group, item, color, accent) {
  add(group, cyl(0.95, 0.98, 0.14, 0x0d1a2b, { roughness: 0.62, metalness: 0.22 }), 0, 0.02, 0);
  add(group, cyl(0.82, 0.9, 0.06, 0x142638, { roughness: 0.78 }), 0, 0.12, 0);

  const road = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.012, 6, 64), glowMat(0x0a84ff, 0.16));
  add(group, road, 0, 0.17, 0, Math.PI / 2, 0, 0);

  const buildings = [];
  for (let i = 0; i < 11; i += 1) {
    const angle = i * 2.3;
    const radius = 0.18 + (i % 4) * 0.16;
    const height = 0.1 + (i % 5) * 0.06;
    const buildingColor = i % 3 === 0 ? accent : color;
    const building = box(0.12, height, 0.12, buildingColor, {
      emissive: buildingColor,
      emissiveIntensity: 0.08,
      roughness: 0.5
    });
    add(group, building, Math.cos(angle) * radius, 0.17 + height / 2, Math.sin(angle) * radius);
    buildings.push(building);
  }

  const pin = new THREE.Group();
  pin.position.set(0.48, 0.2, 0.18);
  group.add(pin);
  const pinCone = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 8), mat(LIME, { emissive: LIME, emissiveIntensity: 0.4 }));
  pinCone.position.y = 0.26;
  pinCone.castShadow = true;
  pin.add(pinCone);
  const pinRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 32), glowMat(LIME, 0.55));
  pinRing.rotation.x = Math.PI / 2;
  pinRing.position.y = 0.14;
  pin.add(pinRing);

  const scan = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.31, 64), glowMat(color, 0.28));
  add(group, scan, 0, 0.18, 0, -Math.PI / 2, 0, 0);

  return (time) => {
    const q = (time * 0.32) % 1;
    scan.scale.setScalar(1 + q * 2.2);
    scan.material.opacity = 0.28 * (1 - q);
    pin.position.y = 0.2 + Math.sin(time * 1.4) * 0.02;
    buildings.forEach((building, index) => {
      building.rotation.y = Math.sin(time * 0.3 + index) * 0.08;
    });
  };
}

function buildOmnivault(group, item, color, accent) {
  const safe = box(0.95, 0.95, 0.5, 0x16243a, { metalness: 0.6, roughness: 0.24 });
  add(group, safe, 0, 0.78, 0);

  const door = cyl(0.33, 0.33, 0.07, color, { metalness: 0.55, roughness: 0.3 });
  add(group, door, 0, 0.78, 0.29, Math.PI / 2, 0, 0);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 32), mat(accent, { emissive: accent, emissiveIntensity: 0.25, metalness: 0.5 }));
  add(group, handle, 0, 0.78, 0.35);

  const cardOrbit = new THREE.Group();
  cardOrbit.position.y = 1.08;
  group.add(cardOrbit);
  const cards = [];
  for (let i = 0; i < 3; i += 1) {
    const card = box(0.24, 0.34, 0.02, i === 1 ? accent : color, { emissive: color, emissiveIntensity: 0.08, roughness: 0.45 });
    const angle = (i / 3) * TAU;
    card.position.set(Math.cos(angle) * 0.72, 0, Math.sin(angle) * 0.72);
    card.rotation.y = -angle;
    cardOrbit.add(card);
    cards.push(card);
  }

  return (time) => {
    handle.rotation.z = time * 0.65;
    cardOrbit.rotation.y = time * 0.42;
    cards.forEach((card, index) => {
      card.position.y = Math.sin(time * 1.1 + index) * 0.04;
    });
  };
}

function buildNarrative(group, item, color, accent) {
  const director = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), mat(color, { emissive: color, emissiveIntensity: 0.3, metalness: 0.4 }));
  add(group, director, 0, 0.96, 0);

  const orbit = new THREE.Group();
  orbit.position.y = 0.96;
  group.add(orbit);

  const agentColors = [accent, ORANGE, 0x0a84ff];
  const agents = [];
  for (let i = 0; i < 3; i += 1) {
    const angle = (i / 3) * TAU;
    const agent = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.13, 0),
      mat(agentColors[i], { emissive: agentColors[i], emissiveIntensity: 0.25, metalness: 0.3 })
    );
    agent.position.set(Math.cos(angle) * 0.66, 0, Math.sin(angle) * 0.66);
    agent.castShadow = true;
    orbit.add(agent);
    agents.push(agent);

    const connector = line([new THREE.Vector3(0, 0, 0), agent.position.clone()], agentColors[i], 0.2);
    orbit.add(connector);
  }

  return (time) => {
    orbit.rotation.y = time * 0.45;
    director.rotation.y = time * 0.2;
    director.rotation.x = Math.sin(time * 0.35) * 0.12;
    agents.forEach((agent, index) => {
      agent.rotation.y = time * (0.4 + index * 0.1);
    });
  };
}

function buildEdnova(group, item, color, accent) {
  add(group, box(0.9, 0.08, 0.6, 0x16243a, { metalness: 0.5, roughness: 0.3 }), 0, 0.45, 0);

  const screenGroup = new THREE.Group();
  screenGroup.position.set(0, 0.78, -0.18);
  screenGroup.rotation.x = -0.28;
  group.add(screenGroup);

  const screen = box(0.8, 0.5, 0.04, 0x0b1526, { metalness: 0.3, roughness: 0.3 });
  screenGroup.add(screen);

  const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), glowMat(color, 0.14));
  screenGlow.position.z = 0.03;
  screenGroup.add(screenGlow);

  const bars = [];
  for (let i = 0; i < 4; i += 1) {
    const bar = box(0.08, 0.04 + i * 0.04, 0.012, i === 0 ? color : accent, { emissive: color, emissiveIntensity: 0.18 });
    bar.position.set(-0.24 + i * 0.15, -0.13 + (i % 2) * 0.04, 0.04);
    screenGroup.add(bar);
    bars.push(bar);
  }

  return (time) => {
    screenGroup.rotation.y = Math.sin(time * 0.4) * 0.04;
    screenGlow.material.opacity = 0.11 + (Math.sin(time * 1.5) + 1) * 0.025;
    bars.forEach((bar, index) => {
      bar.scale.y = 0.8 + Math.sin(time * 1.2 + index * 0.7) * 0.15;
    });
  };
}

const BUILDERS = {
  rag: buildRag,
  invoice: buildInvoice,
  trade: buildTrade,
  account: buildAccount,
  entity: buildMatch,
  geo: buildGeo,
  omnivault: buildOmnivault,
  narrative: buildNarrative,
  ednova: buildEdnova
};

export function initLab({ onReady, onChange, onSelect, onInteract, onMotionChange, onFallback } = {}) {
  const canvas = document.getElementById("world");
  const labelLayer = document.getElementById("labels");
  if (!canvas || !labelLayer) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
  } catch (error) {
    document.documentElement.classList.add("no-webgl");
    onFallback?.();
    return null;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reduceQuery.matches;
  let motion = !reduced;
  let zeroG = motion;
  let raf = null;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let lastTime = performance.now();
  let time = 1.2;
  let pingAt = 0;
  let pingFlash = 0;
  let ready = false;

  const state = {
    view: "overview",
    travel: { value: 0, velocity: 0 },
    inspectYaw: 0,
    inspectZoom: 0,
    mode: "systems",
    active: { systems: 0, projects: 0 },
    target: { systems: 0, projects: 0 },
    dragging: false,
    zoom: 0,
    pointer: { x: 0, y: 0 }
  };

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05070d, 12, 32);

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 80);
  camera.position.set(0, 6.4, 14.4);

  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x08101c, 1.35));

  const key = new THREE.DirectionalLight(0xfff7ed, 2.4);
  key.position.set(6, 10, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -9;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  key.target.position.set(0, 0.4, 0);
  scene.add(key, key.target);

  const fill = new THREE.DirectionalLight(0x6fb5ff, 1.25);
  fill.position.set(-8, 5, -6);
  scene.add(fill);

  const warm = new THREE.PointLight(ORANGE, 26, 24, 2);
  warm.position.set(6, 2.5, 6);
  scene.add(warm);

  const coreLight = new THREE.PointLight(0x0a84ff, 18, 18, 2);
  coreLight.position.set(0, 1.4, 0);
  scene.add(coreLight);

  // Stage
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(8.5, 64),
    new THREE.MeshStandardMaterial({ color: 0x05080f, roughness: 0.92, metalness: 0.12, transparent: true, opacity: 0.82 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.92;
  ground.receiveShadow = true;
  scene.add(ground);

  const shadowPlane = new THREE.Mesh(new THREE.CircleGeometry(8.5, 64), new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.3 }));
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.91;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const track = new THREE.Mesh(new THREE.TorusGeometry(RING_RADIUS, 0.012, 6, 180), glowMat(0x0a84ff, 0.14));
  track.rotation.x = Math.PI / 2;
  track.position.y = RING_Y;
  scene.add(track);

  const outerTrack = new THREE.Mesh(new THREE.RingGeometry(6.1, 6.14, 128), glowMat(LIME, 0.12));
  outerTrack.rotation.x = -Math.PI / 2;
  outerTrack.position.y = -0.9;
  scene.add(outerTrack);

  // Central reactor
  const core = new THREE.Group();
  core.position.y = 0.86;
  scene.add(core);

  const coreGeometry = new THREE.IcosahedronGeometry(0.95, 1);
  const coreMesh = new THREE.Mesh(
    coreGeometry,
    new THREE.MeshStandardMaterial({
      color: 0x0f1a2c,
      emissive: 0x0a3a7a,
      emissiveIntensity: 0.75,
      roughness: 0.25,
      metalness: 0.6
    })
  );
  coreMesh.castShadow = true;
  core.add(coreMesh);

  const coreWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(coreGeometry),
    new THREE.LineBasicMaterial({ color: 0x0a84ff, transparent: true, opacity: 0.26 })
  );
  core.add(coreWire);

  const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(1.08, 32, 32), glowMat(0x0a84ff, 0.07));
  core.add(coreGlow);

  const coreRingA = new THREE.Mesh(new THREE.TorusGeometry(1.34, 0.022, 8, 120), mat(0x0a84ff, { emissive: 0x0a84ff, emissiveIntensity: 1.1, metalness: 0.4 }));
  coreRingA.rotation.x = Math.PI / 2.35;
  coreRingA.rotation.y = 0.3;
  core.add(coreRingA);

  const coreRingB = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.018, 8, 120), glowMat(ORANGE, 0.65));
  coreRingB.rotation.x = Math.PI / 2.9;
  coreRingB.rotation.y = -0.4;
  core.add(coreRingB);

  const coreBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 12), glowMat(0x0a84ff, 0.08));
  coreBeam.position.y = 1.2;
  scene.add(coreBeam);

  const pulseRings = [];
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 0.94, 64), glowMat(0x0a84ff, 0));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.86;
    ring.visible = false;
    scene.add(ring);
    pulseRings.push(ring);
  }

  const rings = {};
  const labels = [];

  function createModule(item, index, total, radius) {
    const group = new THREE.Group();
    const color = new THREE.Color(item.color);
    const accent = new THREE.Color(item.accent);
    const angle = (index / total) * TAU;

    group.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
    group.rotation.y = angle;
    group.userData.item = item;
    group.userData.index = index;
    group.userData.angle = angle;
    group.userData.itemId = item.id;

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1.1, 0.18, 32),
      new THREE.MeshStandardMaterial({ color: 0x0b1322, roughness: 0.42, metalness: 0.55 })
    );
    pedestal.position.y = -0.55;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    group.add(pedestal);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.99, 0.018, 8, 64), glowMat(color, 0.42));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.45;
    group.add(rim);

    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.006, 6, 96), glowMat(color, 0.14));
    halo.rotation.x = Math.PI / 2;
    halo.position.y = -0.46;
    group.add(halo);

    const float = new THREE.Group();
    float.position.y = 0.05;
    group.add(float);

    const build = BUILDERS[item.id] || ((g) => {
      const fallback = box(0.6, 0.6, 0.6, color, { metalness: 0.4 });
      add(g, fallback, 0, 0.7, 0);
    });
    const update = build(float, item, color, accent);

    group.userData.float = float;
    group.userData.baseY = 0.05;
    group.userData.phase = index * 1.7;
    group.userData.update = update;
    group.userData.halo = halo;
    group.userData.rim = rim;
    group.userData.bounce = { value: 0, velocity: 0 };

    group.traverse((object) => {
      if (object.isMesh) {
        object.userData.itemId = item.id;
        if (!object.material.transparent) object.castShadow = true;
      }
    });

    return group;
  }

  function buildRing(mode, items) {
    const group = new THREE.Group();
    const modules = [];
    const connections = [];
    const radius = RING_RADIUS;

    items.forEach((item, index) => {
      const module = createModule(item, index, items.length, radius);
      group.add(module);
      modules.push(module);

      const connection = line(
        [new THREE.Vector3(0, 0.86, 0), new THREE.Vector3(module.position.x, 0.3, module.position.z)],
        item.color,
        0.08
      );
      group.add(connection);
      connections.push(connection);
    });

    group.visible = mode === state.mode;
    scene.add(group);
    rings[mode] = { group, modules, connections, items, n: items.length, radius, rotation: { value: 0, velocity: 0 } };
  }

  buildRing("systems", SYSTEMS);
  buildRing("projects", PROJECTS);

  // A chamber unfolds around the selected machine as the camera travels inward.
  const chamber = new THREE.Group();
  const chamberMaterials = [];
  function addChamberObject(object) {
    chamber.add(object);
    object.material.userData.opacity = object.material.opacity;
    chamberMaterials.push(object.material);
    return object;
  }
  const chamberFloor = new THREE.Mesh(new THREE.RingGeometry(2.9, 2.94, 96), glowMat(0x0a84ff, 0.5));
  chamberFloor.rotation.x = -Math.PI / 2;
  chamberFloor.position.y = -0.65;
  addChamberObject(chamberFloor);
  const chamberFrame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(5.6, 3.4, 0.1)),
    new THREE.LineBasicMaterial({ color: 0x0a84ff, transparent: true, opacity: 0.45 })
  );
  chamberFrame.position.set(0, 1.25, -1.9);
  addChamberObject(chamberFrame);
  for (const x of [-2.8, 2.8]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 3.4, 0.025), glowMat(LIME, 0.65));
    pillar.position.set(x, 1.05, -1.8);
    addChamberObject(pillar);
  }
  const processNodes = [];
  const processPoints = [];
  for (let i = 0; i < 5; i++) {
    const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), glowMat(i % 2 ? ORANGE : LIME, 0.85));
    node.position.set(-2 + i, 2.35 + (i % 2) * 0.18, -1.8);
    processPoints.push(node.position.clone());
    processNodes.push(addChamberObject(node));
  }
  addChamberObject(line(processPoints, 0x0a84ff, 0.4));
  chamber.visible = false;
  scene.add(chamber);
  const machinePosition = new THREE.Vector3();
  const overviewPosition = new THREE.Vector3();
  const insidePosition = new THREE.Vector3();
  const overviewLook = new THREE.Vector3();
  const insideLook = new THREE.Vector3();
  const cameraLook = new THREE.Vector3();

  function makeLabels() {
    Object.keys(rings).forEach((mode) => {
      rings[mode].items.forEach((item, index) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "node-label";
        el.tabIndex = -1;
        el.setAttribute("aria-hidden", "true");
        el.innerHTML = `<span class="node-label__num">${item.num}</span><span class="node-label__name">${item.short}</span>`;
        el.addEventListener("pointerdown", (event) => event.stopPropagation());
        el.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          focus(mode, index, { select: true });
          onInteract?.();
        });
        labelLayer.appendChild(el);
        labels.push({ el, mode, index, item });
      });
    });
  }

  makeLabels();

  function emitChange() {
    const data = rings[state.mode];
    onChange?.({
      mode: state.mode,
      index: state.active[state.mode],
      item: data.items[state.active[state.mode]],
      zeroG,
      motion
    });
  }

  function updateLabelVisibility() {
    labels.forEach(({ el, mode }) => {
      el.style.display = mode === state.mode && state.view === "overview" ? "" : "none";
    });
  }

  function updateLabels() {
    const point = new THREE.Vector3();
    labels.forEach(({ el, mode, index, item }) => {
      if (mode !== state.mode || state.travel.value > 0.15 || state.view === "inside") {
        el.style.display = "none";
        return;
      }
      el.style.display = "";

      const data = rings[mode];
      const module = data.modules[index];
      point.set(0, item.kind === "system" ? 1.85 : 1.9, 0.5);
      module.localToWorld(point);
      const ndc = point.clone().project(camera);

      if (ndc.z < -1 || ndc.z > 1) {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        return;
      }

      const x = (ndc.x * 0.5 + 0.5) * width;
      const y = (-ndc.y * 0.5 + 0.5) * height;
      const facing = Math.cos(module.userData.angle + data.group.rotation.y);
      const active = index === state.active[mode];
      const opacity = facing > -0.12 ? 0.14 + 0.86 * Math.max(0, facing) : 0;
      const halfWidth = (el.offsetWidth || 120) / 2;
      const clampedX = Math.min(width - halfWidth - 8, Math.max(halfWidth + 8, x));

      el.style.transform = `translate3d(${clampedX}px, ${y}px, 0) translate(-50%, -50%)`;
      el.style.opacity = opacity.toFixed(2);
      el.style.pointerEvents = facing > 0.12 ? "auto" : "none";
      el.classList.toggle("is-active", active);
    });
  }

  function layout() {
    width = window.innerWidth;
    height = window.innerHeight;
    const mobile = width < 760;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    rings.systems.group.scale.setScalar(mobile ? 0.84 : 1);
    rings.projects.group.scale.setScalar(mobile ? 0.84 : 1);
    updateCamera(1);

    if (!motion) renderStatic();
  }

  function updateCamera(delta) {
    const mobile = width < 760;
    const baseZ = mobile ? 17.4 : 14.4;
    const baseY = mobile ? 7.6 : 6.4;
    const targetX = state.pointer.x * (mobile ? 0.15 : 0.45);
    const targetY = baseY + state.pointer.y * (mobile ? 0.12 : 0.25);

    const blend = clamp(state.travel.value, 0, 1);
    const selected = rings[state.mode].modules[state.active[state.mode]];
    selected.getWorldPosition(machinePosition);
    overviewPosition.set(targetX, targetY, baseZ + state.zoom);
    overviewLook.set(0, mobile ? 0.15 : 0.75, 0);
    insidePosition.set(mobile ? 0 : 1.6, mobile ? 2.8 : 2.5, (mobile ? 8.6 : 7.2) + state.inspectZoom).add(machinePosition);
    insideLook.set(mobile ? 0 : 1.6, mobile ? -0.7 : 0.85, 0).add(machinePosition);
    camera.position.lerpVectors(overviewPosition, insidePosition, blend);
    cameraLook.lerpVectors(overviewLook, insideLook, blend);
    camera.lookAt(cameraLook);
    camera.fov = (mobile ? 52 : 38) + blend * (mobile ? -4 : 4);
    camera.updateProjectionMatrix();
  }

  function updateScene(delta) {
    time += delta;
    const travelTarget = state.view === "inside" ? 1 : 0;
    if (motion) advanceSpring(state.travel, travelTarget, delta, 36, 12);
    else { state.travel.value = travelTarget; state.travel.velocity = 0; }
    const blend = clamp(state.travel.value, 0, 1);

    core.rotation.y = time * 0.14;
    core.rotation.x = Math.sin(time * 0.24) * 0.06;
    coreMesh.rotation.y = -time * 0.1;
    coreWire.rotation.y = time * 0.18;
    coreRingA.rotation.z = time * 0.22;
    coreRingB.rotation.x = Math.PI / 2.9 + Math.sin(time * 0.18) * 0.08;
    coreBeam.material.opacity = (0.055 + Math.sin(time * 1.2) * 0.015) * (1 - blend);
    core.scale.setScalar(Math.max(0.001, 1 - blend));
    core.visible = blend < 0.98;
    track.material.opacity = 0.14 * (1 - blend);
    outerTrack.material.opacity = 0.12 * (1 - blend);

    pingFlash = Math.max(0, pingFlash - delta * 2.1);
    if (pingAt) {
      const elapsed = (performance.now() - pingAt) / 1000;
      pulseRings.forEach((ring, index) => {
        const q = elapsed - index * 0.13;
        if (q > 0 && q < 1) {
          ring.visible = true;
          ring.scale.setScalar(1 + q * 5.8);
          ring.material.opacity = 0.34 * (1 - q);
        } else {
          ring.visible = false;
        }
      });
    }

    const data = rings[state.mode];
    if (!state.dragging) {
      const target = state.target[state.mode];
      if (motion) data.group.rotation.y = advanceSpring(data.rotation, target, delta);
      else { data.group.rotation.y = target; data.rotation.value = target; data.rotation.velocity = 0; }
    }

    data.modules.forEach((module, index) => {
      const { float, baseY, phase, update, halo, rim, bounce } = module.userData;
      const active = index === state.active[state.mode];

      if (motion) advanceSpring(bounce, 0, delta, 90, 8);
      else { bounce.value = 0; bounce.velocity = 0; }
      float.position.y = baseY + bounce.value + (zeroG ? Math.sin(time * 1.2 + phase) * 0.08 : 0);
      float.rotation.y = active ? state.inspectYaw * blend : 0;

      if (update) update(time, delta, active);

      module.visible = active || blend < 0.96;
      const scale = active ? 1.06 + blend * 0.64 + bounce.value * 0.4 : Math.max(0.01, 1 - blend);
      module.scale.setScalar(scale);

      halo.material.opacity = active ? 0.38 : 0.13;
      rim.material.opacity = active ? 0.78 : 0.4;
    });

    data.connections.forEach((connection, index) => {
      const active = index === state.active[state.mode];
      connection.material.opacity = ((active ? 0.38 : 0.07) + pingFlash * 0.18) * (1 - blend);
    });
    const selected = data.modules[state.active[state.mode]];
    selected.getWorldPosition(machinePosition);
    chamber.position.copy(machinePosition);
    chamber.scale.setScalar(0.25 + blend * 0.75);
    chamber.visible = blend > 0.01;
    chamberMaterials.forEach(material => { material.opacity = material.userData.opacity * blend; });
    processNodes.forEach((node, index) => {
      node.rotation.y = time * 0.45 + index;
      node.scale.setScalar(1 + (zeroG ? Math.sin(time * 2 - index) * 0.12 : 0));
    });
  }

  function renderStatic() {
    updateScene(0);
    updateCamera(1);
    renderer.render(scene, camera);
    updateLabels();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const delta = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    updateScene(delta);
    updateCamera(delta);
    renderer.render(scene, camera);
    updateLabels();
  }

  function start() {
    if (raf || !motion) return;
    lastTime = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function focus(mode, index, options = {}) {
    if (!rings[mode]) return;
    if (mode !== state.mode) switchMode(mode);

    const data = rings[mode];
    const nextIndex = ((index % data.n) + data.n) % data.n;
    state.active[mode] = nextIndex;

    const step = TAU / data.n;
    const desired = -nextIndex * step;
    const target = data.group.rotation.y + shortestDelta(data.group.rotation.y, desired);
    state.target[mode] = target;
    data.modules[nextIndex].userData.bounce.velocity = motion ? 2.2 : 0;

    if (!motion) data.group.rotation.y = target;

    emitChange();
    if (options.select) onSelect?.(data.items[nextIndex], mode, nextIndex);
    if (!motion) renderStatic();
  }

  function switchMode(mode) {
    if (!rings[mode] || mode === state.mode) return;
    rings[state.mode].group.visible = false;
    state.mode = mode;
    rings[mode].group.visible = true;

    const data = rings[mode];
    const step = TAU / data.n;
    const desired = -state.active[mode] * step;
    data.group.rotation.y = desired;
    data.rotation.value = desired;
    data.rotation.velocity = 0;
    state.target[mode] = desired;

    updateLabelVisibility();
    emitChange();
    if (!motion) renderStatic();
  }

  function step(direction) {
    const data = rings[state.mode];
    const next = (state.active[state.mode] + direction + data.n) % data.n;
    focus(state.mode, next, { select: state.view === "inside" });
  }

  function enter(mode, index) {
    const alreadyInside = state.view === "inside";
    focus(mode, index);
    if (alreadyInside) {
      const data = rings[mode];
      const angle = -state.active[mode] * TAU / data.n;
      data.group.rotation.y = angle;
      data.rotation.value = angle;
      data.rotation.velocity = 0;
      state.target[mode] = angle;
      state.travel.value = Math.min(state.travel.value, 0.82);
      state.travel.velocity = 0;
    }
    state.view = "inside";
    state.inspectYaw = 0;
    state.inspectZoom = 0;
    state.dragging = false;
    document.body.classList.remove("is-dragging");
    updateLabelVisibility();
    if (!motion) renderStatic();
  }

  function exit() {
    state.view = "overview";
    state.inspectYaw = 0;
    state.inspectZoom = 0;
    updateLabelVisibility();
    if (!motion) renderStatic();
  }

  function snapNearest() {
    const data = rings[state.mode];
    const stepAngle = TAU / data.n;
    const raw = -data.group.rotation.y / stepAngle;
    let index = Math.round(raw);
    index = ((index % data.n) + data.n) % data.n;
    state.active[state.mode] = index;
    const desired = -index * stepAngle;
    state.target[state.mode] = data.group.rotation.y + shortestDelta(data.group.rotation.y, desired);
    emitChange();
    if (!motion) {
      data.group.rotation.y = state.target[state.mode];
      renderStatic();
    }
  }

  function ping() {
    pingAt = performance.now();
    pingFlash = 1;
    if (!motion) renderStatic();
  }

  function setZeroG(enabled) {
    zeroG = Boolean(enabled) && motion;
    onMotionChange?.({ reduced, motion, zeroG });
    if (!motion) renderStatic();
  }

  function setMode(mode) {
    switchMode(mode);
  }

  function reset() {
    exit();
    state.zoom = 0;
    state.pointer.x = 0;
    state.pointer.y = 0;
    if (state.mode !== "systems") switchMode("systems");
    focus("systems", 0);
    layout();
    if (!motion) renderStatic();
  }

  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();

  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointerNdc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObjects(rings[state.mode].modules.filter(module => module.visible), true);
    if (!hits.length) return null;
    let node = hits[0].object;
    while (node && !node.userData.itemId) node = node.parent;
    if (!node) return null;
    const index = rings[state.mode].items.findIndex((item) => item.id === node.userData.itemId);
    return index >= 0 ? index : null;
  }

  const pointers = new Map();
  let lastX = 0;
  let lastY = 0;
  let moved = 0;
  let pinchStart = 0;
  let pinchZoom = 0;
  let hoveredIndex = null;

  function pointerDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);

    if (pointers.size === 1) {
      state.dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      moved = 0;
      document.body.classList.add("is-dragging");
    } else if (pointers.size === 2) {
      state.dragging = false;
      const values = Array.from(pointers.values());
      pinchStart = pointerDistance(values[0], values[1]);
      pinchZoom = state.view === "inside" ? state.inspectZoom : state.zoom;
      document.body.classList.remove("is-dragging");
    }

    onInteract?.();
  }, { passive: true });

  canvas.addEventListener("pointermove", (event) => {
    if (pointers.has(event.pointerId)) pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    state.pointer.x = (event.clientX / width) * 2 - 1;
    state.pointer.y = -(event.clientY / height) * 2 + 1;

    if (pointers.size === 2 && pinchStart) {
      const values = Array.from(pointers.values());
      const distance = pointerDistance(values[0], values[1]);
      const zoomKey = state.view === "inside" ? "inspectZoom" : "zoom";
      state[zoomKey] = clamp(pinchZoom + (pinchStart - distance) * 0.018, -2, 2.4);
      if (!motion) renderStatic();
      return;
    }

    if (!state.dragging) {
      const hovered = pick(event.clientX, event.clientY);
      canvas.style.cursor = state.view === "inside" || hovered === null ? "grab" : "pointer";
      if (hovered !== null && hovered !== hoveredIndex && motion && state.view === "overview") {
        rings[state.mode].modules[hovered].userData.bounce.velocity = 1.3;
      }
      hoveredIndex = hovered;
      return;
    }

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    const data = rings[state.mode];
    if (state.view === "inside") {
      state.inspectYaw += dx * 0.01;
    } else {
      data.group.rotation.y += dx * 0.006;
      data.rotation.value = data.group.rotation.y;
      data.rotation.velocity = 0;
      state.target[state.mode] = data.group.rotation.y;
    }
    if (!motion) renderStatic();
  }, { passive: true });

  function endPointer(event) {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchStart = 0;

    if (state.dragging && pointers.size === 0) {
      state.dragging = false;
      document.body.classList.remove("is-dragging");
      if (state.view === "overview") {
        if (moved < 6 && event.type !== "pointercancel") {
          const index = pick(event.clientX, event.clientY);
          if (index !== null) focus(state.mode, index, { select: true });
        } else {
          snapNearest();
        }
      }
    }

    if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  canvas.addEventListener("pointerup", endPointer, { passive: true });
  canvas.addEventListener("pointercancel", endPointer, { passive: true });
  canvas.addEventListener("pointerleave", () => {
    if (!state.dragging) canvas.style.cursor = "grab";
  });

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const zoomKey = state.view === "inside" ? "inspectZoom" : "zoom";
    state[zoomKey] = clamp(state[zoomKey] + event.deltaY * 0.0018, -2, 2.4);
    if (!motion) renderStatic();
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    const active = document.activeElement;
    if (active && active.closest && active.closest(".index-panel, .detail")) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (state.mode === "systems" && /^[1-6]$/.test(event.key)) {
      event.preventDefault();
      focus("systems", Number(event.key) - 1, { select: true });
    } else if (event.key.toLowerCase() === "p") {
      event.preventDefault();
      ping();
      onInteract?.();
    } else if (event.key.toLowerCase() === "g") {
      event.preventDefault();
      setZeroG(!zeroG);
    }
  });

  window.addEventListener("resize", () => {
    layout();
    if (!motion) renderStatic();
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (motion) start();
  });

  if (typeof reduceQuery.addEventListener === "function") {
    reduceQuery.addEventListener("change", (event) => {
      reduced = event.matches;
      motion = !reduced;
      zeroG = motion;
      stop();
      if (motion) start();
      else renderStatic();
      onMotionChange?.({ reduced, motion, zeroG });
    });
  }

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    stop();
    document.documentElement.classList.add("no-webgl");
    onFallback?.();
  });

  updateLabelVisibility();
  layout();
  emitChange();
  ready = true;
  onReady?.({ reduced, motion, zeroG });
  if (motion) start();
  else renderStatic();

  return {
    focus,
    step,
    setMode,
    ping,
    setZeroG,
    enter,
    exit,
    reset,
    getState: () => ({
      mode: state.mode,
      index: state.active[state.mode],
      item: rings[state.mode].items[state.active[state.mode]],
      reduced,
      motion,
      zeroG,
      view: state.view,
      ready
    })
  };
}
