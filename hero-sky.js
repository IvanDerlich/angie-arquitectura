// Sky Hero - Adapted from three.js webgl_shaders_sky example (MIT License)
// Source: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_shaders_sky.html
// Adapted for Ángeles Arquitectura with calm, architectural aesthetic

import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

let camera, scene, renderer;
let sky, sun;
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
        60,
        window.innerWidth / window.innerHeight,
        100,
        2000000
    );
    camera.position.set(0, 100, 2000);
    camera.lookAt(0, 0, 0);

    // Scene
    scene = new THREE.Scene();

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.2; // Soft, calm exposure
    container.appendChild(renderer.domElement);

    // Sky - Configured for Angie's brand palette
    sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    sun = new THREE.Vector3();

    const skyUniforms = sky.material.uniforms;
    
    // Calm, architectural sky parameters matching brand palette
    skyUniforms['turbidity'].value = 8;
    skyUniforms['rayleigh'].value = 2; // Soft blue atmospheric scattering
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.7;
    skyUniforms['cloudCoverage'].value = 0.3; // Light clouds
    skyUniforms['cloudDensity'].value = 0.4;
    skyUniforms['cloudElevation'].value = 0.5;
    skyUniforms['showSunDisc'].value = true;

    // Low sun position for warm, calm light matching Angie's palette
    const elevation = 20; // Low sun angle
    const azimuth = 0;
    
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    skyUniforms['sunPosition'].value.copy(sun);

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

function animate() {
    animationId = requestAnimationFrame(animate);
    render();
}

function render() {
    if (!sky || !renderer || !scene || !camera) return;

    // Slow, subtle time progression for calm feel
    const time = performance.now() * 0.0002;
    sky.material.uniforms['time'].value = time;

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
