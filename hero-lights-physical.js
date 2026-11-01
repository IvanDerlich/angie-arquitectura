// Physical Lights Hero
// Adapted from three.js webgl_lights_physical example (MIT license)
// https://github.com/mrdoob/three.js/blob/dev/examples/webgl_lights_physical.html

import * as THREE from 'three';

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

class PhysicalLightsHero {
  constructor() {
    this.container = document.getElementById('hero-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.bulbLight = null;
    this.objects = [];
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
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    this.camera.position.set(-4, 2, 4);
    this.camera.lookAt(0, 1, 0);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.beige);
    this.scene.fog = new THREE.Fog(COLORS.beige, 8, 20);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = Math.pow(0.68, 5.0);
    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    // Physically accurate point light (like a bulb)
    const bulbGeometry = new THREE.SphereGeometry(0.05, 16, 8);
    this.bulbLight = new THREE.PointLight(COLORS.nude, 400, 100, 2); // Warm light
    
    const bulbMat = new THREE.MeshStandardMaterial({
      emissive: COLORS.nude,
      emissiveIntensity: 2,
      color: 0x000000
    });
    this.bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
    this.bulbLight.position.set(0, 2, 0);
    this.bulbLight.castShadow = true;
    this.bulbLight.shadow.camera.near = 0.1;
    this.bulbLight.shadow.camera.far = 10;
    this.scene.add(this.bulbLight);

    // Hemisphere light (ambient/sky)
    const hemiLight = new THREE.HemisphereLight(COLORS.softBlue, COLORS.deepBeige, 0.02);
    this.scene.add(hemiLight);
  }

  setupGeometry() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.deepBeige,
      roughness: 0.9,
      metalness: 0.1
    });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // Sphere 1 - soft blue
    const sphere1Geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const sphere1Material = new THREE.MeshStandardMaterial({
      color: COLORS.softBlue,
      roughness: 0.3,
      metalness: 0.8
    });
    const sphere1 = new THREE.Mesh(sphere1Geometry, sphere1Material);
    sphere1.position.set(1, 0.3, 1);
    sphere1.castShadow = true;
    this.scene.add(sphere1);
    this.objects.push(sphere1);

    // Cube 1 - white/beige
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.2
    });
    const cube1 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube1.position.set(-0.5, 0.25, -1);
    cube1.castShadow = true;
    this.scene.add(cube1);
    this.objects.push(cube1);

    // Sphere 2 - deep blue
    const sphere2Geometry = new THREE.SphereGeometry(0.25, 32, 32);
    const sphere2Material = new THREE.MeshStandardMaterial({
      color: COLORS.deepBlue,
      roughness: 0.4,
      metalness: 0.6
    });
    const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);
    sphere2.position.set(-1.5, 0.25, 0.5);
    sphere2.castShadow = true;
    this.scene.add(sphere2);
    this.objects.push(sphere2);

    // Cylinder - nude/terracotta
    const cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.6, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.nude,
      roughness: 0.8,
      metalness: 0.1
    });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(0.8, 0.3, -1.5);
    cylinder.castShadow = true;
    this.scene.add(cylinder);
    this.objects.push(cylinder);
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
      this.time += 0.005;
      
      // Gentle vertical motion of the light
      this.bulbLight.position.y = Math.cos(this.time) * 0.4 + 2;
      
      // Slight horizontal sway
      this.bulbLight.position.x = Math.sin(this.time * 0.7) * 0.5;
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
  document.addEventListener('DOMContentLoaded', () => new PhysicalLightsHero());
} else {
  new PhysicalLightsHero();
}
