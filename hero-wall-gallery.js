import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class WallGalleryHero {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.animationId = null;
        this.imagePlanes = [];

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.enableAnimation = !prefersReducedMotion;

        this.imageUrls = [
            'assets/obras/fachada1.jpg',
            'assets/obras/fachada2.jpg',
            'assets/obras/fachada3-a.jpg',
            'assets/obras/cocina-1.jpg',
            'assets/obras/dormitorio-1.jpg',
            'assets/obras/bano-1.jpg'
        ];

        this.init();
    }

    init() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xF8F6F2);

        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 15);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(width, height);
        
        this.container.appendChild(this.renderer.domElement);

        this.loadImages();

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = this.enableAnimation;
        this.controls.autoRotateSpeed = 1.0;
        this.controls.minPolarAngle = Math.PI / 3;
        this.controls.maxPolarAngle = (2 * Math.PI) / 3;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0x7FA7C9, 0.8);
        directionalLight1.position.set(5, 5, 5);
        this.scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0x4F7FA8, 0.5);
        directionalLight2.position.set(-5, 3, -3);
        this.scene.add(directionalLight2);

        window.addEventListener('resize', () => this.onWindowResize());

        this.animate();
    }

    loadImages() {
        const geometry = new THREE.PlaneGeometry(3, 2);
        const loader = new THREE.TextureLoader();
        
        const gridSize = 3;
        const spacing = 4.5;
        const startX = -(gridSize - 1) * spacing / 2;
        const startY = -(gridSize - 1) * spacing / 2;

        this.imageUrls.forEach((url, index) => {
            const col = index % gridSize;
            const row = Math.floor(index / gridSize);
            
            const x = startX + col * spacing;
            const y = startY + row * spacing;
            const z = -10 + Math.sin(col * 0.5) * 2 + Math.cos(row * 0.5) * 2;
            
            loader.load(
                url,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    
                    const material = new THREE.MeshStandardMaterial({ 
                        map: texture,
                        side: THREE.DoubleSide,
                        roughness: 0.5,
                        metalness: 0.1
                    });
                    
                    const plane = new THREE.Mesh(geometry, material);
                    plane.position.set(x, y, z);
                    plane.rotation.y = (col - 1) * 0.15;
                    plane.rotation.x = (row - 1) * -0.1;
                    
                    this.scene.add(plane);
                    this.imagePlanes.push({ mesh: plane, initialZ: z, col, row });
                },
                undefined,
                (error) => {
                    console.error(`Error loading ${url}:`, error);
                    const fallbackMaterial = new THREE.MeshStandardMaterial({ 
                        color: 0x7FA7C9,
                        side: THREE.DoubleSide
                    });
                    const plane = new THREE.Mesh(geometry, fallbackMaterial);
                    plane.position.set(x, y, z);
                    this.scene.add(plane);
                    this.imagePlanes.push({ mesh: plane, initialZ: z, col, row });
                }
            );
        });
    }

    animate() {
        if (!this.enableAnimation) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        this.animationId = requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.0005;
        
        this.imagePlanes.forEach((item) => {
            item.mesh.position.z = item.initialZ + Math.sin(time + item.col * 0.5) * 0.3;
        });

        if (this.controls) {
            this.controls.update();
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

        if (this.controls) {
            this.controls.dispose();
        }

        window.removeEventListener('resize', () => this.onWindowResize());
    }
}

let heroInstance = null;

function initWallGalleryHero() {
    if (heroInstance) {
        heroInstance.dispose();
    }
    
    heroInstance = new WallGalleryHero('hero-canvas-container');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWallGalleryHero);
} else {
    initWallGalleryHero();
}

export { WallGalleryHero, initWallGalleryHero };
