// RectAreaLight Hero
// Adapted from three.js webgl_lights_rectarealight example (MIT license)
// https://github.com/mrdoob/three.js/blob/dev/examples/webgl_lights_rectarealight.html

import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

// Brand colors
const COLORS = {
  softBlue: 0x7FA7C9,
  deepBlue: 0x4F7FA8,
  beige: 0xF8F6F2,
  deepBeige: 0xE8DCCB,
  nude: 0xC9A98C,
  darkText: 0x2F4A63
};

// Check prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class RectAreaLightHero {
  constructor() {
    this.container = document.getElementById('hero-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.lights = [];
    this.centerPiece = null;
    this.animationId = null;
    this.time = 0;

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
    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    this.camera.position.set(0, 8, -20);
    this.camera.lookAt(0, 5, 0);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.beige);
    this.scene.fog = new THREE.Fog(COLORS.beige, 20, 80);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    // Initialize RectAreaLight uniforms
    RectAreaLightUniformsLib.init();

    // Ambient light (soft overall illumination)
    const ambientLight = new THREE.AmbientLight(COLORS.beige, 0.3);
    this.scene.add(ambientLight);

    // Create three rectangular area lights with brand colors
    // Left light - soft blue
    const rectLight1 = new THREE.RectAreaLight(COLORS.softBlue, 3, 6, 12);
    rectLight1.position.set(-8, 7, 3);
    rectLight1.lookAt(0, 5, 0);
    this.scene.add(rectLight1);
    this.lights.push(rectLight1);

    // Center light - white
    const rectLight2 = new THREE.RectAreaLight(0xffffff, 4, 6, 12);
    rectLight2.position.set(0, 7, 3);
    rectLight2.lookAt(0, 5, 0);
    this.scene.add(rectLight2);
    this.lights.push(rectLight2);

    // Right light - nude/warm
    const rectLight3 = new THREE.RectAreaLight(COLORS.nude, 3, 6, 12);
    rectLight3.position.set(8, 7, 3);
    rectLight3.lookAt(0, 5, 0);
    this.scene.add(rectLight3);
    this.lights.push(rectLight3);
  }

  setupGeometry() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: COLORS.deepBeige,
      roughness: 0.8,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    this.scene.add(floor);

    // Back wall
    const wallGeometry = new THREE.PlaneGeometry(100, 50);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.9
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 12, 15);
    this.scene.add(wall);

    // Center sphere (architectural element)
    const sphereGeometry = new THREE.SphereGeometry(2.5, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.8
    });
    this.centerPiece = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.centerPiece.position.set(0, 5.5, 0);
    this.scene.add(this.centerPiece);

    // Add subtle pedestal
    const pedestalGeometry = new THREE.CylinderGeometry(1.2, 1.5, 1.5, 32);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.deepBeige,
      roughness: 0.7
    });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.set(0, 0.75, 0);
    this.scene.add(pedestal);
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

    if (!prefersReducedMotion) {
      this.time += 0.01;
      
      // Gentle rotation of lights
      if (this.lights.length === 3) {
        this.lights[0].rotation.y = Math.sin(this.time * 0.5) * 0.3;
        this.lights[1].rotation.y = Math.sin(this.time * 0.3) * 0.2;
        this.lights[2].rotation.y = Math.sin(this.time * 0.7) * 0.3;
      }

      // Slow rotation of center piece
      if (this.centerPiece) {
        this.centerPiece.rotation.y += 0.003;
      }
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
  document.addEventListener('DOMContentLoaded', () => new RectAreaLightHero());
} else {
  new RectAreaLightHero();
}
