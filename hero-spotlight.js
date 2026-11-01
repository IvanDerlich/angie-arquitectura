// Spotlight Hero
// Adapted from three.js webgl_lights_spotlight example (MIT license)
// https://github.com/mrdoob/three.js/blob/dev/examples/webgl_lights_spotlight.html

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

class SpotlightHero {
  constructor() {
    this.container = document.getElementById('hero-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.spotlight = null;
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
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.camera.position.set(7, 4, 1);
    this.camera.lookAt(0, 1, 0);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.darkText);
    this.scene.fog = new THREE.Fog(COLORS.darkText, 8, 20);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    // Ambient hemisphere light
    const ambient = new THREE.HemisphereLight(COLORS.softBlue, COLORS.deepBeige, 0.15);
    this.scene.add(ambient);

    // Main spotlight with warm color
    this.spotlight = new THREE.SpotLight(COLORS.nude, 100);
    this.spotlight.position.set(2.5, 5, 2.5);
    this.spotlight.angle = Math.PI / 6;
    this.spotlight.penumbra = 0.8;
    this.spotlight.decay = 2;
    this.spotlight.distance = 0;
    
    this.spotlight.castShadow = true;
    this.spotlight.shadow.mapSize.width = 1024;
    this.spotlight.shadow.mapSize.height = 1024;
    this.spotlight.shadow.camera.near = 2;
    this.spotlight.shadow.camera.far = 10;
    this.spotlight.shadow.focus = 1;
    this.spotlight.shadow.bias = -0.003;
    this.spotlight.shadow.intensity = 0.8;
    
    this.scene.add(this.spotlight);
  }

  setupGeometry() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: COLORS.deepBeige
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, -1, 0);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Center pedestal/column
    const pedestalGeometry = new THREE.CylinderGeometry(0.4, 0.5, 2, 32);
    const pedestalMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff
    });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.set(0, 0, 0);
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    this.scene.add(pedestal);
    this.objects.push(pedestal);

    // Top sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshLambertMaterial({ 
      color: COLORS.softBlue
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 1.5, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    this.scene.add(sphere);
    this.objects.push(sphere);

    // Additional accent objects
    const cubeGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const cubeMaterial = new THREE.MeshLambertMaterial({ 
      color: COLORS.deepBlue
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(1.5, 0.2, -1);
    cube.castShadow = true;
    cube.receiveShadow = true;
    this.scene.add(cube);
    this.objects.push(cube);

    // Small sphere accent
    const smallSphereGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const smallSphereMaterial = new THREE.MeshLambertMaterial({ 
      color: COLORS.nude
    });
    const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
    smallSphere.position.set(-1.2, 0.25, -0.8);
    smallSphere.castShadow = true;
    smallSphere.receiveShadow = true;
    this.scene.add(smallSphere);
    this.objects.push(smallSphere);
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
      this.time += 0.0003;
      
      // Circular motion of spotlight
      this.spotlight.position.x = Math.cos(this.time) * 2.5;
      this.spotlight.position.z = Math.sin(this.time) * 2.5;
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
  document.addEventListener('DOMContentLoaded', () => new SpotlightHero());
} else {
  new SpotlightHero();
}
