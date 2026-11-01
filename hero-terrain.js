// Terrain Hero - Adapted from three.js webgl_geometry_terrain example (MIT License)
// Source: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_geometry_terrain.html
// Adapted for Ángeles Arquitectura with calm, architectural aesthetic

import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

let camera, scene, renderer;
let mesh;
let animationId;

const worldWidth = 256;
const worldDepth = 256;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function init() {
    const container = document.getElementById('hero-canvas-container');
    if (!container) return;

    // Check for WebGL support
    if (!isWebGLAvailable()) {
        container.innerHTML = '<div style="background: linear-gradient(135deg, #E8DCCB 0%, #C9A98C 50%, #7FA7C9 100%); opacity: 0.3; width: 100%; height: 100%;"></div>';
        return;
    }

    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );
    camera.position.set(100, 800, -800);
    camera.lookAt(-100, 810, -800);

    // Scene with Angie's brand color as background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE8DCCB); // Soft beige from brand palette
    scene.fog = new THREE.FogExp2(0xE8DCCB, 0.0025);

    // Generate terrain
    const data = generateHeight(worldWidth, worldDepth);

    const geometry = new THREE.PlaneGeometry(7500, 7500, worldWidth - 1, worldDepth - 1);
    geometry.rotateX(-Math.PI / 2);

    const vertices = geometry.attributes.position.array;
    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
        vertices[j + 1] = data[i] * 10;
    }

    const texture = new THREE.CanvasTexture(generateTexture(data, worldWidth, worldDepth));
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    mesh = new THREE.Mesh(
        geometry, 
        new THREE.MeshBasicMaterial({ map: texture })
    );
    scene.add(mesh);

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Resize handler
    window.addEventListener('resize', onWindowResize);

    // Start animation or render once
    if (!prefersReducedMotion) {
        animate();
    } else {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function generateHeight(width, height) {
    let seed = Math.PI / 4;
    const originalRandom = Math.random;
    
    window.Math.random = function () {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const size = width * height;
    const data = new Uint8Array(size);
    const perlin = new ImprovedNoise();
    const z = Math.random() * 100;

    let quality = 1;

    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < size; i++) {
            const x = i % width;
            const y = ~~(i / width);
            data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);
        }
        quality *= 5;
    }

    window.Math.random = originalRandom;
    return data;
}

function generateTexture(data, width, height) {
    const vector3 = new THREE.Vector3(0, 0, 0);
    const sun = new THREE.Vector3(1, 1, 1);
    sun.normalize();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    let context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    let image = context.getImageData(0, 0, canvas.width, canvas.height);
    let imageData = image.data;

    // Generate terrain with Angie's brand colors
    // Using soft blues (#7FA7C9, #4F7FA8) for valleys and beige (#E8DCCB) for peaks
    for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
        vector3.x = data[j - 2] - data[j + 2];
        vector3.y = 2;
        vector3.z = data[j - width * 2] - data[j + width * 2];
        vector3.normalize();

        const shade = vector3.dot(sun);
        const height = data[j];

        // Interpolate between soft blue (valleys) and beige (peaks)
        // Low values (valleys): soft blue #7FA7C9
        // High values (peaks): beige #E8DCCB
        const valleyColor = { r: 127, g: 167, b: 201 }; // #7FA7C9
        const peakColor = { r: 232, g: 220, b: 203 };   // #E8DCCB
        
        const t = height / 255;
        const r = valleyColor.r + (peakColor.r - valleyColor.r) * t;
        const g = valleyColor.g + (peakColor.g - valleyColor.g) * t;
        const b = valleyColor.b + (peakColor.b - valleyColor.b) * t;

        imageData[i] = r * (0.5 + shade * 0.5);
        imageData[i + 1] = g * (0.5 + shade * 0.5);
        imageData[i + 2] = b * (0.5 + shade * 0.5);
    }

    context.putImageData(image, 0, 0);

    // Scale 4x for better quality
    const canvasScaled = document.createElement('canvas');
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext('2d');
    context.scale(4, 4);
    context.drawImage(canvas, 0, 0);

    image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
    imageData = image.data;

    // Add subtle noise
    for (let i = 0, l = imageData.length; i < l; i += 4) {
        const v = ~~(Math.random() * 3);
        imageData[i] += v;
        imageData[i + 1] += v;
        imageData[i + 2] += v;
    }

    context.putImageData(image, 0, 0);

    return canvasScaled;
}

function animate() {
    animationId = requestAnimationFrame(animate);
    render();
}

function render() {
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
}

function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (renderer) {
        renderer.dispose();
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
