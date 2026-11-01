// Ocean Hero - Adapted from three.js webgl_shaders_ocean example (MIT License)
// Source: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_shaders_ocean.html
// Adapted for Ángeles Arquitectura with calm, architectural aesthetic

import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

let camera, scene, renderer;
let water, sun, sky;
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

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.3;
    container.appendChild(renderer.domElement);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        1,
        20000
    );
    camera.position.set(30, 15, 100);
    camera.lookAt(0, 0, 0);

    // Sun
    sun = new THREE.Vector3();

    // Water - Using Angie's brand colors
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    // Create a simple water normal texture fallback
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(512, 512);
    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 128 + Math.random() * 20;
        imgData.data[i + 1] = 128 + Math.random() * 20;
        imgData.data[i + 2] = 255;
        imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    
    const waterNormals = new THREE.CanvasTexture(canvas);
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x4F7FA8, // Angie's deeper blue
        distortionScale: prefersReducedMotion ? 1.0 : 2.5,
        fog: scene.fog !== undefined
    });

    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Sky - Configured for Angie's palette
    sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 8;
    skyUniforms['rayleigh'].value = 1.5;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.7;
    
    // Soft, calm sky parameters
    const parameters = {
        elevation: 8, // Low sun for calm, warm light
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sceneEnv = new THREE.Scene();

    function updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();

        sceneEnv.add(sky);
        const renderTarget = pmremGenerator.fromScene(sceneEnv);
        scene.add(sky);

        scene.environment = renderTarget.texture;
    }

    updateSun();

    // Ambient light for soft, architectural feel
    const ambientLight = new THREE.AmbientLight(0x7FA7C9, 0.5);
    scene.add(ambientLight);

    // Resize handler
    window.addEventListener('resize', onWindowResize);

    // Start animation
    if (!prefersReducedMotion) {
        animate();
    } else {
        // Render once for reduced motion
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
    if (!water || !renderer || !scene || !camera) return;

    const time = performance.now() * 0.0005; // Slower for calm feel
    water.material.uniforms['time'].value = time;

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
