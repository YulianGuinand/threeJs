import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import front from "../label.png";

const lenis = new Lenis({
  // Valeur entre 0 et 1
  // Valeur par défaut : 0,1
  // Plus la valeur est faible, plus le scroll sera fluide
  lerp: 0.05,
  // Valeur par défaut : 1
  // Plus la valeur est haute, plus le défilement sera rapide
  wheelMultiplier: 1,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * OBJECT
 */

// Fonction pour générer automatiquement les points d'un cercle
function generateCirclePoints(radius, numberOfPoints) {
  const points = [];
  for (let i = 0; i < numberOfPoints; i++) {
    const angle = (i / numberOfPoints) * Math.PI * 2; // Angle en radians
    const x = radius * Math.sin(angle) * -1; // Coordonnée X
    const z = radius * Math.cos(angle); // Coordonnée Z
    points.push(new THREE.Vector3(x, 0, z)); // Point sur le plan XZ
  }
  // Assure que le cercle revient à son point de départ
  points.push(points[0].clone());
  return points;
}

// Génération des points d'un cercle
const radius = 1.45;
const numberOfCirclePoints = 100; // Ajuste pour plus ou moins de précision
const circlePoints = generateCirclePoints(radius, numberOfCirclePoints);

// Création de la courbe avec des segments et un cercle intégré
const curvePoints = [
  new THREE.Vector3(30, 0, radius), // Début de la courbe
  new THREE.Vector3(2, 0, radius), // Point intermédiaire avant le cercle
  ...circlePoints, // Points du cercle
  new THREE.Vector3(-2, 0, radius), // Reprise après le cercle
  new THREE.Vector3(-30, 0, radius), // Fin de la courbe
];

// Création de la courbe CatmullRom
const curve = new THREE.CatmullRomCurve3(curvePoints);

const loader = new GLTFLoader();
let bottle;
loader.load("bottle.glb", (gltf) => {
  bottle = gltf.scene;
  bottle.position.set(0, -4, 0);
  bottle.scale.set(0.8, 0.8, 0.8);
  scene.add(bottle);
});

let number = 1000;
let frenetFrames = curve.computeFrenetFrames(number, false);
let spacedPoints = curve.getSpacedPoints(number);

let temPlane = new THREE.PlaneGeometry(1, 1, number, 1);
let dimensions = [-0.7, 0.7];

let point = new THREE.Vector3();
let binormalShift = new THREE.Vector3();

let finalPoints = [];

dimensions.forEach((d) => {
  for (let i = 0; i <= number; i++) {
    point = spacedPoints[i];
    binormalShift.add(frenetFrames.binormals[i]).multiplyScalar(d);

    finalPoints.push(new THREE.Vector3().copy(point).add(binormalShift));
  }
});

temPlane.setFromPoints(finalPoints);

let frontTexture = new THREE.TextureLoader().load(front);
let backTexture = new THREE.TextureLoader().load(front);

[frontTexture, backTexture].forEach((t) => {
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.repeat.set(-1, 1);
});

let frontMaterial = new THREE.MeshStandardMaterial({
  map: frontTexture,
  side: THREE.BackSide,
  // roughness: 0.65,
  // metalness: 0.25,
  alphaTest: true,
});

let backMaterial = new THREE.MeshStandardMaterial({
  map: backTexture,
  side: THREE.FrontSide,
  // roughness: 0.65,
  // metalness: 0.25,
  alphaTest: true,
});

const materials = [frontMaterial, backMaterial];
temPlane.addGroup(0, 6000, 0);
temPlane.addGroup(0, 6000, 1);

let finalMesh = new THREE.Mesh(temPlane, materials);

scene.add(finalMesh);

//  SECONDE
let temPlane2 = new THREE.PlaneGeometry(1, 1, number, 1);

temPlane2.setFromPoints(finalPoints);

temPlane2.addGroup(0, 6000, 0);
temPlane2.addGroup(0, 6000, 1);

let frontTexture2 = new THREE.TextureLoader().load(front);
let backTexture2 = new THREE.TextureLoader().load(front);

[frontTexture2, backTexture2].forEach((t) => {
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.repeat.set(-1, 1);
});

let frontMaterial2 = new THREE.MeshStandardMaterial({
  map: frontTexture,
  side: THREE.BackSide,
  // roughness: 0.65,
  // metalness: 0.25,
  alphaTest: true,
});

let backMaterial2 = new THREE.MeshStandardMaterial({
  map: backTexture,
  side: THREE.FrontSide,
  // roughness: 0.65,
  // metalness: 0.25,
  alphaTest: true,
});

const materials2 = [frontMaterial2, backMaterial2];

let finalMesh2 = new THREE.Mesh(temPlane2, materials2);

scene.add(finalMesh2);

//  THIRD
let temPlane3 = new THREE.PlaneGeometry(1, 1, number, 1);

temPlane3.setFromPoints(finalPoints);

temPlane3.addGroup(0, 6000, 0);
temPlane3.addGroup(0, 6000, 1);

let frontTexture3 = new THREE.TextureLoader().load(front);
let backTexture3 = new THREE.TextureLoader().load(front);

[frontTexture3, backTexture3].forEach((t) => {
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.repeat.set(-1, 1);
});

let frontMaterial3 = new THREE.MeshStandardMaterial({
  map: frontTexture,
  side: THREE.BackSide,
  // roughness: 0.65,
  // metalness: 0.25,
  alphaTest: true,
});

let backMaterial3 = new THREE.MeshStandardMaterial({
  map: backTexture,
  side: THREE.FrontSide,
  // roughness: 0.65,
  // metalness: 0.25,
  alphaTest: true,
});

const materials3 = [frontMaterial3, backMaterial3];

let finalMesh3 = new THREE.Mesh(temPlane3, materials3);

scene.add(finalMesh3);

// LIGHTS
// ambientLight.position.
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// gui.add(ambientLight, "intensity").min(0).max(3).step(0.001);

const directionnalLight = new THREE.DirectionalLight(0x00fffc, 0.9);
directionnalLight.position.set(-1, 2.5, -1);
scene.add(directionnalLight);

const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.9);
scene.add(hemisphereLight);

const pointLight = new THREE.PointLight(0xff9000, 1.5, 10, 0.3);
pointLight.position.set(1, -0.5, 1);

scene.add(pointLight);

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 6, 1, 1);
rectAreaLight.position.set(-1.3, 0, 1.5);
rectAreaLight.lookAt(new THREE.Vector3());
scene.add(rectAreaLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
// scene.add(camera);

const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
cameraGroup.add(camera);

// camera.lookAt(new THREE.Vector3(0, 0, 0));

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animation
 */

let scrollY = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY / sizes.height;
});

const clock = new THREE.Clock();
let i = 0;

const positions = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e) => {
  positions.x = e.clientX / sizes.width - 0.5;
  positions.y = e.clientY / sizes.height - 0.5;
});

// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// Fonction principale d'animation
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (bottle) {
    bottle.rotation.y = -scrollY + 0.5;
  }

  if (scrollY < 1) {
    finalMesh2.visible = false;
    finalMesh3.visible = false;
    finalMesh.visible = true;
    materials.forEach((m) => {
      m.map.offset.setX(scrollY + 1);
    });
  } else if (scrollY > 1 && scrollY < 2.75) {
    finalMesh.visible = false;
    finalMesh3.visible = false;
    finalMesh2.visible = true;
    materials2.forEach((m) => {
      m.map.offset.setX(scrollY - 0.7);
    });
  } else {
    finalMesh.visible = false;
    finalMesh2.visible = false;
    finalMesh3.visible = true;
    materials3.forEach((m) => {
      m.map.offset.setX(scrollY - 2);
    });
  }

  if (scrollY > 4) {
    [finalMesh, finalMesh2, finalMesh3].forEach((m) => {
      m.visible = false;
    });
  }

  cameraGroup.position.set(scrollY + 5, scrollY + 4, 20 - scrollY * 1.5);

  camera.position.x = positions.x * 2;
  camera.position.y = -positions.y * 2;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // controls.update();

  // Render
  renderer.render(scene, camera);

  // Appeler à nouveau `tick` sur le prochain frame
  window.requestAnimationFrame(tick);
};

tick();
