import { ARButton } from "https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js";

let camera, scene, renderer;
let target;
let placedObjects = [];

let hitTestSource = null;
let localSpace = null;
let hitTestSourceInitialized = false;

let artisticSphere
let hue = 0;

initConfiguration();
initScene();
addTargetObject();
addInteraction();
addTorusFigure();
addArtisticSphere();

function initConfiguration() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    40
  );

  camera.position.set(0, 3, 3);
  camera.rotation.set(-0.4, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);
  document.body.appendChild(
    ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
    })
  );
  renderer.domElement.style.display = "none";

  renderer.setAnimationLoop(render);
}

function initScene() {
  var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  AddInitialObjects();

  function AddInitialObjects() {
    const material = new THREE.MeshPhongMaterial({
      shininess: 6,
      flatShading: true,
      transparent: 1,
      opacity: 0.8,
    });

    SetObject(
      new THREE.CylinderGeometry(0.2, 0.2, 1, 32),
      material.clone(),
      [-0.5, 1.5, 0],
      new THREE.Color("rgb(226,35,0)")
    );
    SetObject(
      new THREE.BoxGeometry(1, 1, 1),
      material.clone(),
      [0.5, 1.5, 0],
      new THREE.Color("rgb(100,100,255)")
    );
    SetObject(
      new THREE.SphereGeometry(0.6, 20, 20),
      material.clone(),
      [0, 1.5, -0.5],
      new THREE.Color("rgb(0,255,0)")
    );

    function SetObject(geometry, mat, position, color) {
      mat.color = color;
      let mesh = new THREE.Mesh(geometry, mat.clone());
      mesh.position.set(position[0], position[1], position[2]);
      mesh.scale.set(0.1, 0.1, 0.1);
      scene.add(mesh);
    }
  }
}

function addTorusFigure() {
  const geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 100, 16);
  const material = new THREE.MeshPhongMaterial({ color: 0xff69b4 });
  const torusKnot = new THREE.Mesh(geometry, material);
  torusKnot.position.set(1.5, 1.0, -0.5);
  scene.add(torusKnot);
}

function addArtisticSphere() {
  const geometry = new THREE.SphereGeometry(0.2, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  artisticSphere = new THREE.Mesh(geometry, material);
  
  // Position it above and in front of the initial camera viewpoint
  artisticSphere.position.set(0, 2, -1);
  scene.add(artisticSphere);
}

async function initializeHitTestSource() {
  const session = renderer.xr.getSession();
  const viewerSpace = await session.requestReferenceSpace("viewer");
  hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
  localSpace = await session.requestReferenceSpace("local");
  hitTestSourceInitialized = true;
  session.addEventListener("end", () => {
    hitTestSourceInitialized = false;
    hitTestSource = null;
  });
}

function addTargetObject() {
  const geometry = new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(
    -Math.PI / 2
  );
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  target = new THREE.Mesh(geometry, material);
  target.matrixAutoUpdate = false;
  target.visible = false;
  scene.add(target);
  target.add(new THREE.AxesHelper(1));
}

function addInteraction() {
  var controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  scene.add(controller);
}

function onSelect() {
  if (target.visible) {
    const geometry = new THREE.CylinderBufferGeometry(0, 0.05, 0.2, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff * Math.random(),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.setFromMatrixPosition(target.matrix);
    mesh.quaternion.setFromRotationMatrix(target.matrix);

    mesh.userData.rotateSpeedX = Math.random() * 0.05 + 0.01;
    mesh.userData.rotateSpeedZ = Math.random() * 0.05 + 0.01;

    placedObjects.push(mesh);
    scene.add(mesh);
  }
}

function render(timestamp, frame) {
  if (frame) {
    if (!hitTestSourceInitialized) {
      initializeHitTestSource();
    } else if (hitTestSourceInitialized) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(localSpace);
        target.visible = true;
        target.matrix.fromArray(pose.transform.matrix);
      } else {
        target.visible = false;
      }
    }

    // Update placed objects rotation
    placedObjects.forEach((obj) => {
      obj.rotation.x += obj.userData.rotateSpeedX;
      obj.rotation.z += obj.userData.rotateSpeedZ;
    });

    // Animate the artistic sphere
    // Pulsate scale
    const scale = 0.2 + 0.05 * Math.sin(timestamp / 500);
    artisticSphere.scale.set(scale, scale, scale);

    // Shift color hue over time
    hue += 0.001;
    if (hue > 1) hue = 0;
    artisticSphere.material.color.setHSL(hue, 1.0, 0.5);

    renderer.render(scene, camera);
  }
}
