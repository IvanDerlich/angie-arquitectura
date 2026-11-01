// Lightprobe Hero - Adapted from three.js webgl_lightprobe example (MIT License)
// Source: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_lightprobe.html
// Adapted for Ángeles Arquitectura with calm, architectural aesthetic

import * as THREE from 'three';
import { LightProbe } from 'three';

let mesh, renderer, scene, camera;
let lightProbe, directionalLight;
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
    renderer.toneMappingExposure = 0.8;
    container.appendChild(renderer.domElement);

    // Scene with brand color background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE8DCCB); // Soft beige

    // Camera
    camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set(0, 0, 30);

    // Create procedural environment cube texture
    const cubeTexture = createProceduralEnvironment();
    
    // Light probe - using the cube texture for ambient lighting
    lightProbe = new LightProbe();
    generateLightProbe(cubeTexture);
    scene.add(lightProbe);

    // Directional light in brand color
    directionalLight = new THREE.DirectionalLight(0x7FA7C9, 0.6);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Geometry - elegant sphere
    const geometry = new THREE.SphereGeometry(5, 64, 32);

    // Material with brand palette
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        metalness: 0.1,
        roughness: 0.3,
        envMap: cubeTexture,
        envMapIntensity: 0.8,
    });

    // Mesh
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Resize handler
    window.addEventListener('resize', onWindowResize);

    // Start rendering
    if (!prefersReducedMotion) {
        animate();
    } else {
        render();
    }
}

function createProceduralEnvironment() {
    // Create a simple gradient cube texture using Angie's brand colors
    const size = 512;
    const data = new Uint8Array(size * size * 4 * 6);

    // Brand colors
    const topColor = { r: 127, g: 167, b: 201 }; // #7FA7C9 soft blue
    const bottomColor = { r: 232, g: 220, b: 203 }; // #E8DCCB beige
    const sideColor = { r: 201, g: 169, b: 140 }; // #C9A98C mid-tone

    // Helper to fill a face
    function fillFace(faceIndex, colors) {
        const offset = faceIndex * size * size * 4;
        for (let y = 0; y < size; y++) {
            const t = y / size;
            const r = colors.top.r + (colors.bottom.r - colors.top.r) * t;
            const g = colors.top.g + (colors.bottom.g - colors.top.g) * t;
            const b = colors.top.b + (colors.bottom.b - colors.top.b) * t;
            
            for (let x = 0; x < size; x++) {
                const i = offset + (y * size + x) * 4;
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
                data[i + 3] = 255;
            }
        }
    }

    // Fill all 6 faces: px, nx, py, ny, pz, nz
    fillFace(0, { top: sideColor, bottom: sideColor }); // px
    fillFace(1, { top: sideColor, bottom: sideColor }); // nx
    fillFace(2, { top: topColor, bottom: topColor }); // py (top)
    fillFace(3, { top: bottomColor, bottom: bottomColor }); // ny (bottom)
    fillFace(4, { top: sideColor, bottom: sideColor }); // pz
    fillFace(5, { top: sideColor, bottom: sideColor }); // nz

    const cubeTexture = new THREE.DataTexture(data, size, size);
    cubeTexture.format = THREE.RGBAFormat;
    cubeTexture.type = THREE.UnsignedByteType;
    cubeTexture.mapping = THREE.CubeReflectionMapping;
    cubeTexture.needsUpdate = true;

    return cubeTexture;
}

function generateLightProbe(cubeTexture) {
    // Simplified light probe generation using brand colors
    const sh = new THREE.SphericalHarmonics3();
    
    // Set coefficients to match brand palette lighting
    // Using soft blue (#7FA7C9) as primary ambient color
    const baseColor = new THREE.Color(0x7FA7C9);
    const intensity = 1.0;
    
    sh.coefficients[0].set(
        baseColor.r * intensity,
        baseColor.g * intensity,
        baseColor.b * intensity
    );
    
    lightProbe.sh.copy(sh);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    render();
}

function animate() {
    animationId = requestAnimationFrame(animate);
    render();
}

function render() {
    if (!renderer || !scene || !camera || !mesh) return;

    // Slow, subtle rotation for calm feel
    const time = performance.now() * 0.0002;
    mesh.rotation.y = time;
    mesh.rotation.x = Math.sin(time * 0.5) * 0.2;

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
