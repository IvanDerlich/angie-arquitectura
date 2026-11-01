// HDR Environment Maps Hero
// Adapted from three.js webgl_materials_envmaps_hdr example (MIT license)
// https://github.com/mrdoob/three.js/blob/dev/examples/webgl_materials_envmaps_hdr.html

import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Brand colors
const COLORS = {
  softBlue: 0x7FA7C9,
  deepBlue: 0x4F7FA8,
  beige: 0xF8F6F2,
  deepBeige: 0xE8DCCB,
  nude: 0xC9A98C
};

// Check prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class EnvmapsHero {
  constructor() {
    this.container = document.getElementById('hero-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.sphere = null;
    this.animationId = null;

    this.init();
  }

  init() {
    // Check WebGL support
    if (!this.checkWebGLSupport()) {
      this.showFallback();
      return;
    }

    this.setupScene();
    this.setupLighting();
    this.setupGeometry();
    this.loadEnvironment();
    this.setupEventListeners();
    this.animate();
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  showFallback() {
    this.container.style.background = `linear-gradient(135deg, #${COLORS.deepBeige.toString(16)} 0%, #${COLORS.softBlue.toString(16)} 100%)`;
    this.container.style.opacity = '0.3';
  }

  setupScene() {
    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 1, 1000);
    this.camera.position.set(0, 0, 100);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.beige);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.9;
    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    // Ambient light with soft blue tint
    const ambientLight = new THREE.AmbientLight(COLORS.softBlue, 0.5);
    this.scene.add(ambientLight);

    // Key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(5, 5, 5);
    this.scene.add(keyLight);

    // Fill light with warm beige tint
    const fillLight = new THREE.DirectionalLight(COLORS.nude, 0.3);
    fillLight.position.set(-3, 0, -3);
    this.scene.add(fillLight);
  }

  setupGeometry() {
    // Use sphere geometry (simpler and more architectural)
    const geometry = new THREE.SphereGeometry(30, 64, 64);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.0
    });

    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);
  }

  loadEnvironment() {
    // Use a procedural environment as fallback (no external HDR file needed)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    // Create a simple gradient environment
    const envScene = new THREE.Scene();
    const envGeometry = new THREE.BoxGeometry(100, 100, 100);
    const envMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.softBlue,
      side: THREE.BackSide
    });
    const envBox = new THREE.Mesh(envGeometry, envMaterial);
    envScene.add(envBox);

    // Add lights to environment
    const envLight1 = new THREE.PointLight(0xffffff, 1);
    envLight1.position.set(50, 50, 50);
    envScene.add(envLight1);

    const envLight2 = new THREE.PointLight(COLORS.nude, 0.5);
    envLight2.position.set(-50, -50, -50);
    envScene.add(envLight2);

    const envMap = pmremGenerator.fromScene(envScene).texture;
    this.scene.environment = envMap;
    this.sphere.material.envMap = envMap;

    pmremGenerator.dispose();
    envScene.clear();
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize(), false);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (!prefersReducedMotion && this.sphere) {
      // Slow, calm rotation
      this.sphere.rotation.y += 0.002;
      this.sphere.rotation.x += 0.001;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new EnvmapsHero());
} else {
  new EnvmapsHero();
}
