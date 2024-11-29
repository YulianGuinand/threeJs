import GUI from "lil-gui";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import front from "../label.png";

/**
 * GUI (Interface utilisateur pour les réglages)
 */
const gui = new GUI();

/**
 * Smooth Scroll (Lenis)
 */
const lenis = new Lenis({
  lerp: 0.05,
  wheelMultiplier: 1,
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

/**
 * Base Setup
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Object Creation
 */
// Fonction pour générer les points d'un cercle
function generateCirclePoints(radius, numberOfPoints) {
  const points = [];
  for (let i = 0; i < numberOfPoints; i++) {
    const angle = (i / numberOfPoints) * Math.PI * 2;
    const x = radius * Math.sin(angle) * -1;
    const z = radius * Math.cos(angle);
    points.push(new THREE.Vector3(x, 0, z));
  }
  points.push(points[0].clone()); // Fermer le cercle
  return points;
}

// Points de la courbe avec cercle intégré
const radius = 1.45;
const numberOfCirclePoints = 100;
const circlePoints = generateCirclePoints(radius, numberOfCirclePoints);
const curvePoints = [
  new THREE.Vector3(30, 0, radius),
  new THREE.Vector3(2, 0, radius),
  ...circlePoints,
  new THREE.Vector3(-2, 0, radius),
  new THREE.Vector3(-30, 0, radius),
];

// Courbe CatmullRom
const curve = new THREE.CatmullRomCurve3(curvePoints);

// Chargement du modèle 3D
const loader = new GLTFLoader();
let bottle;
loader.load("bottle.glb", (gltf) => {
  bottle = gltf.scene;
  bottle.traverse((obj) => {
    if (obj instanceof THREE.Mesh) obj.castShadow = true;
  });
  bottle.position.set(0, -4, 0);
  bottle.scale.set(0.8, 0.8, 0.8);
  scene.add(bottle);
});

// Géométrie de plan basée sur la courbe
const number = 1000;
const frenetFrames = curve.computeFrenetFrames(number, false);
const spacedPoints = curve.getSpacedPoints(number);
const dimensions = [-0.7, 0.7];
const finalPoints = [];
let point = new THREE.Vector3();
let binormalShift = new THREE.Vector3();

dimensions.forEach((d) => {
  for (let i = 0; i <= number; i++) {
    point = spacedPoints[i];
    binormalShift.add(frenetFrames.binormals[i]).multiplyScalar(d);
    finalPoints.push(new THREE.Vector3().copy(point).add(binormalShift));
  }
});

/**
 * Création des Meshes
 */
function createMesh(finalPoints, front, back, scene) {
  const temPlane = new THREE.PlaneGeometry(1, 1, number, 1);
  temPlane.setFromPoints(finalPoints);
  temPlane.addGroup(0, 6000, 0);
  temPlane.addGroup(0, 6000, 1);

  const frontTexture = new THREE.TextureLoader().load(front);
  const backTexture = new THREE.TextureLoader().load(back);
  [frontTexture, backTexture].forEach((t) => {
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.repeat.set(-1, 1);
  });

  const frontMaterial = new THREE.MeshStandardMaterial({
    map: frontTexture,
    side: THREE.BackSide,
    alphaTest: true,
  });

  const backMaterial = new THREE.MeshStandardMaterial({
    map: backTexture,
    side: THREE.FrontSide,
    alphaTest: true,
  });

  const materials = [frontMaterial, backMaterial];
  const mesh = new THREE.Mesh(temPlane, materials);
  mesh.receiveShadow = true;
  scene.add(mesh);
  return { mesh, materials };
}

const { mesh: finalMesh, materials } = createMesh(
  finalPoints,
  front,
  front,
  scene
);
const { mesh: finalMesh2, materials: materials2 } = createMesh(
  finalPoints,
  front,
  front,
  scene
);
const { mesh: finalMesh3, materials: materials3 } = createMesh(
  finalPoints,
  front,
  front,
  scene
);

/**
 * Lights
 */
// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
gui.add(ambientLight, "intensity").min(0).max(3).step(0.001);
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 3.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.position.set(2, 2, -1);
gui.add(directionalLight, "intensity").min(0).max(4).step(0.001);
gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001);
scene.add(directionalLight);

/**
 * Plane
 */
const planeMaterial = new THREE.MeshStandardMaterial({
  color: "#fdfbe2",
  roughness: 0.7,
});
gui.add(planeMaterial, "metalness").min(0).max(1).step(0.001);
gui.add(planeMaterial, "roughness").min(0).max(1).step(0.001);

const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), planeMaterial);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -3.5;
plane.receiveShadow = true;
scene.add(plane);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

/**
 * Animation
 */
let scrollY = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY / sizes.height;
});

const clock = new THREE.Clock();
const positions = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  positions.x = e.clientX / sizes.width - 0.5;
  positions.y = e.clientY / sizes.height - 0.5;
});

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  if (bottle) bottle.rotation.y = -scrollY + 0.5;

  // Gérer la visibilité et les textures
  if (scrollY < 1) {
    finalMesh2.visible = false;
    finalMesh3.visible = false;
    finalMesh.visible = true;
    materials.forEach((m) => m.map.offset.setX(scrollY + 1));
  } else if (scrollY > 1 && scrollY < 2.75) {
    finalMesh.visible = false;
    finalMesh3.visible = false;
    finalMesh2.visible = true;
    materials2.forEach((m) => m.map.offset.setX(scrollY - 0.7));
  } else {
    finalMesh.visible = false;
    finalMesh2.visible = false;
    finalMesh3.visible = true;
    materials3.forEach((m) => m.map.offset.setX(scrollY - 2));
  }
  if (scrollY > 4)
    [finalMesh, finalMesh2, finalMesh3].forEach((m) => (m.visible = false));

  cameraGroup.position.set(scrollY + 5, scrollY + 4, 20 - scrollY * 1.5);
  camera.position.x = positions.x * 2;
  camera.position.y = -positions.y * 2;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
