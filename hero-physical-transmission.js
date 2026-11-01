import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class PhysicalTransmissionHero {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.controls = null;
        this.animationId = null;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.enableAnimation = !prefersReducedMotion;

        this.init();
    }

    init() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(40, width / height, 1, 2000);
        this.camera.position.set(0, 0, 120);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(width, height);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        this.container.appendChild(this.renderer.domElement);

        this.loadEnvironmentAndCreateScene();

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = this.enableAnimation;
        this.controls.autoRotateSpeed = 0.3;
        this.controls.minPolarAngle = Math.PI / 3;
        this.controls.maxPolarAngle = (2 * Math.PI) / 3;

        window.addEventListener('resize', () => this.onWindowResize());

        this.animate();
    }

    loadEnvironmentAndCreateScene() {
        const loader = new THREE.TextureLoader();
        
        loader.load(
            'assets/obras/cocina-1.jpg',
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;
                
                this.scene.background = new THREE.Color(0xE8DCCB);
                this.scene.environment = texture;

                this.createGlassGeometry(texture);
            },
            undefined,
            (error) => {
                console.error('Error loading environment texture:', error);
                this.createFallbackScene();
            }
        );
    }

    createGlassGeometry(envTexture) {
        const geometry = new THREE.SphereGeometry(20, 64, 32);
        
        const texture = this.generateTexture();
        const canvasTexture = new THREE.CanvasTexture(texture);
        canvasTexture.magFilter = THREE.NearestFilter;
        canvasTexture.wrapT = THREE.RepeatWrapping;
        canvasTexture.wrapS = THREE.RepeatWrapping;
        canvasTexture.repeat.set(1, 3.5);
        
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x7FA7C9,
            metalness: 0,
            roughness: 0,
            ior: 1.5,
            alphaMap: canvasTexture,
            envMap: envTexture,
            envMapIntensity: 1.0,
            transmission: 1.0,
            thickness: 0.01,
            specularIntensity: 1,
            specularColor: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        const ambientLight = new THREE.AmbientLight(0xE8DCCB, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x7FA7C9, 1.2);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
    }

    generateTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 2;

        const context = canvas.getContext('2d');
        context.fillStyle = 'white';
        context.fillRect(0, 0, 2, 2);
        context.fillStyle = 'black';
        context.fillRect(0, 0, 1, 1);
        context.fillRect(1, 1, 1, 1);

        return canvas;
    }

    createFallbackScene() {
        const bgColor = new THREE.Color(0xF8F6F2);
        this.scene.background = bgColor;
        
        const geometry = new THREE.SphereGeometry(20, 64, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x7FA7C9,
            metalness: 0.3,
            roughness: 0.4
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
    }

    animate() {
        if (!this.enableAnimation) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        this.animationId = requestAnimationFrame(() => this.animate());

        if (this.controls) {
            this.controls.update();
        }

        if (this.mesh && this.enableAnimation) {
            this.mesh.rotation.y += 0.001;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        if (this.controls) {
            this.controls.dispose();
        }

        window.removeEventListener('resize', () => this.onWindowResize());
    }
}

let heroInstance = null;

function initPhysicalTransmissionHero() {
    if (heroInstance) {
        heroInstance.dispose();
    }
    
    heroInstance = new PhysicalTransmissionHero('hero-canvas-container');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhysicalTransmissionHero);
} else {
    initPhysicalTransmissionHero();
}

export { PhysicalTransmissionHero, initPhysicalTransmissionHero };
