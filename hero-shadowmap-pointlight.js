// Shadowmap Pointlight Hero - Adapted from three.js webgl_shadowmap_pointlight example (MIT License)
// Source: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_shadowmap_pointlight.html
// Adapted for Ángeles Arquitectura with calm, architectural aesthetic

import * as THREE from 'three';

let camera, scene, renderer;
let pointLight1, pointLight2;
let animationId;

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
        45,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set(0, 10, 40);

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF8F6F2);
    
    // Ambient light matching brand palette
    const ambientLight = new THREE.AmbientLight(0xE8DCCB, 2);
    scene.add(ambientLight);

    // Create point lights with Angie's brand colors
    pointLight1 = createLight(0x7FA7C9); // Soft blue
    scene.add(pointLight1);

    pointLight2 = createLight(0x4F7FA8); // Deeper blue
    scene.add(pointLight2);

    // Room box - architectural space
    const roomGeometry = new THREE.BoxGeometry(30, 30, 30);
    const roomMaterial = new THREE.MeshPhongMaterial({
        color: 0xE8DCCB, // Beige from brand palette
        shininess: 5,
        specular: 0x7FA7C9, // Soft blue specular
        side: THREE.BackSide
    });
    const room = new THREE.Mesh(roomGeometry, roomMaterial);
    room.position.y = 10;
    room.receiveShadow = true;
    scene.add(room);

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

function createLight(color) {
    const intensity = 150;

    const light = new THREE.PointLight(color, intensity, 20);
    light.castShadow = true;
    light.shadow.bias = -0.005;
    light.shadow.mapSize.setScalar(256);
    light.shadow.radius = 8;

    // Light source sphere
    const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 8);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: color });
    sphereMaterial.color.multiplyScalar(intensity * 0.01);
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    light.add(sphere);

    // Soft glow sphere
    const glowGeometry = new THREE.SphereGeometry(1.5, 32, 16);
    const glowTexture = generateGlowTexture();
    const glowMaterial = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide,
        alphaMap: glowTexture,
        transparent: true,
        opacity: 0.6
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    glowSphere.castShadow = true;
    glowSphere.receiveShadow = true;
    light.add(glowSphere);

    return light;
}

function generateGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;

    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function onWindowResize() {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    render();
}

function render() {
    if (!renderer || !scene || !camera || !pointLight1 || !pointLight2) return;

    // Slow, calm movement
    const time = performance.now() * 0.0003;

    pointLight1.position.x = Math.sin(time * 0.6) * 8;
    pointLight1.position.y = Math.sin(time * 0.7) * 6 + 10;
    pointLight1.position.z = Math.sin(time * 0.8) * 8;
    pointLight1.rotation.x = time * 0.5;
    pointLight1.rotation.z = time * 0.5;

    const time2 = time + Math.PI;
    pointLight2.position.x = Math.sin(time2 * 0.6) * 8;
    pointLight2.position.y = Math.sin(time2 * 0.7) * 6 + 10;
    pointLight2.position.z = Math.sin(time2 * 0.8) * 8;
    pointLight2.rotation.x = time2 * 0.5;
    pointLight2.rotation.z = time2 * 0.5;

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
