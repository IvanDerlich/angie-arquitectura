import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class TransmissionHero {
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

        this.init();
    }

    init() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 2000);
        this.camera.position.set(0, 0, 8);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(width, height);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        this.container.appendChild(this.renderer.domElement);

        this.loadEnvironmentAndCreateScene();

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
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
                
                this.scene.background = texture;
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
        const geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 128, 32, 2, 3);
        
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0.05,
            ior: 1.5,
            transmission: 1.0,
            thickness: 0.5,
            specularIntensity: 1,
            specularColor: 0xffffff,
            envMap: envTexture,
            envMapIntensity: 1.0,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
    }

    createFallbackScene() {
        const bgColor = new THREE.Color(0xF8F6F2);
        this.scene.background = bgColor;
        
        const geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 64, 16, 2, 3);
        const material = new THREE.MeshNormalMaterial();
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (this.controls) {
            this.controls.update();
        }

        if (this.mesh) {
            this.mesh.rotation.y += 0.002;
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

function initTransmissionHero() {
    if (heroInstance) {
        heroInstance.dispose();
    }
    
    heroInstance = new TransmissionHero('hero-canvas-container');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTransmissionHero);
} else {
    initTransmissionHero();
}

export { TransmissionHero, initTransmissionHero };
