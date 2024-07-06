import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Points for fingers
const fingerJoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

// Infinity Gauntlet Style
const style = {
  0: { color: "yellow", size: 15 },
  1: { color: "gold", size: 6 },
  2: { color: "green", size: 10 },
  3: { color: "gold", size: 6 },
  4: { color: "gold", size: 6 },
  5: { color: "purple", size: 10 },
  6: { color: "gold", size: 6 },
  7: { color: "gold", size: 6 },
  8: { color: "gold", size: 6 },
  9: { color: "blue", size: 10 },
  10: { color: "gold", size: 6 },
  11: { color: "gold", size: 6 },
  12: { color: "gold", size: 6 },
  13: { color: "red", size: 10 },
  14: { color: "gold", size: 6 },
  15: { color: "gold", size: 6 },
  16: { color: "gold", size: 6 },
  17: { color: "orange", size: 10 },
  18: { color: "gold", size: 6 },
  19: { color: "gold", size: 6 },
  20: { color: "gold", size: 6 },
};

// Buffer for smoothing
const smoothingBuffer = {};

// Smoothing function
const smoothLandmarks = (landmarks, bufferSize = 5) => {
  const smoothed = [];
  for (let i = 0; i < landmarks.length; i++) {
    if (!smoothingBuffer[i]) {
      smoothingBuffer[i] = [];
    }
    smoothingBuffer[i].push(landmarks[i]);
    if (smoothingBuffer[i].length > bufferSize) {
      smoothingBuffer[i].shift();
    }

    const avgX = smoothingBuffer[i].reduce((sum, p) => sum + p[0], 0) / smoothingBuffer[i].length;
    const avgY = smoothingBuffer[i].reduce((sum, p) => sum + p[1], 0) / smoothingBuffer[i].length;
    smoothed.push([avgX, avgY]);
  }
  return smoothed;
};

// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 5;

// Load GLTF model
let model;
const loader = new GLTFLoader();
loader.load('./bangle.glb', (gltf) => {
  model = gltf.scene;
  scene.add(model);
});

// Update Three.js scene
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};
animate();

// Drawing function
export const drawHand = (predictions, ctx) => {
  // Check if we have predictions
  if (predictions.length > 0) {
    predictions.forEach((prediction) => {
      // Smooth landmarks
      const landmarks = smoothLandmarks(prediction.landmarks);

      // Draw finger joints
      for (const finger of Object.keys(fingerJoints)) {
        const joints = fingerJoints[finger];
        for (let i = 0; i < joints.length - 1; i++) {
          const firstJoint = landmarks[joints[i]];
          const secondJoint = landmarks[joints[i + 1]];

          // Draw path
          ctx.beginPath();
          ctx.moveTo(firstJoint[0], firstJoint[1]);
          ctx.lineTo(secondJoint[0], secondJoint[1]);
          ctx.strokeStyle = "plum";
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }

      // Draw landmarks
      landmarks.forEach((landmark, index) => {
        const [x, y] = landmark;
        ctx.beginPath();
        ctx.arc(x, y, style[index].size, 0, 2 * Math.PI);
        ctx.fillStyle = style[index].color;
        ctx.fill();
      });

      // Update model position to the wrist landmark (index 0)
      if (model) {
        const [x, y] = landmarks[0];
        model.position.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0);
        model.position.z = -camera.position.z; // Adjust the depth position to match the camera's z position
      }
    });
  }
};
