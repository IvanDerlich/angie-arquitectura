import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class GalleryRoomHero {
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
        this.frames = [];

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.enableAnimation = !prefersReducedMotion;

        this.imageUrls = [
            'assets/obras/fachada1.jpg',
            'assets/obras/fachada2.jpg',
            'assets/obras/fachada3-b.jpg',
            'assets/obras/cocina-2.jpg',
            'assets/obras/dormitorio-2.jpg',
            'assets/obras/bano-2.jpg'
        ];

        this.init();
    }

    init() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xE8DCCB);
        this.scene.fog = new THREE.Fog(0xE8DCCB, 10, 30);

        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        this.camera.position.set(0, 1.6, 5);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(width, height);
        
        this.container.appendChild(this.renderer.domElement);

        this.createRoom();
        this.loadImages();

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = this.enableAnimation;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.minPolarAngle = Math.PI / 2.5;
        this.controls.maxPolarAngle = Math.PI / 1.7;
        this.controls.target.set(0, 1.3, 0);

        window.addEventListener('resize', () => this.onWindowResize());

        this.animate();
    }

    createRoom() {
        const floorGeometry = new THREE.PlaneGeometry(15, 15);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xC9A98C,
            roughness: 0.8,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xF8F6F2,
            roughness: 0.9,
            metalness: 0
        });

        const wallGeometry = new THREE.PlaneGeometry(15, 5);
        
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.set(0, 2.5, -7.5);
        this.scene.add(backWall);

        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.position.set(-7.5, 2.5, 0);
        leftWall.rotation.y = Math.PI / 2;
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
        rightWall.position.set(7.5, 2.5, 0);
        rightWall.rotation.y = -Math.PI / 2;
        this.scene.add(rightWall);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const spotLight1 = new THREE.SpotLight(0x7FA7C9, 1.5);
        spotLight1.position.set(5, 4, 0);
        spotLight1.angle = Math.PI / 6;
        spotLight1.penumbra = 0.5;
        this.scene.add(spotLight1);

        const spotLight2 = new THREE.SpotLight(0x4F7FA8, 1.2);
        spotLight2.position.set(-5, 4, 0);
        spotLight2.angle = Math.PI / 6;
        spotLight2.penumbra = 0.5;
        this.scene.add(spotLight2);

        const fillLight = new THREE.DirectionalLight(0xE8DCCB, 0.3);
        fillLight.position.set(0, 3, 5);
        this.scene.add(fillLight);
    }

    loadImages() {
        const frameGeometry = new THREE.PlaneGeometry(1.5, 2);
        const frameBorderGeometry = new THREE.PlaneGeometry(1.6, 2.1);
        
        const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x2F4A63 });
        
        const loader = new THREE.TextureLoader();
        
        const positions = [
            { pos: new THREE.Vector3(-4, 1.8, -7.4), rot: new THREE.Euler(0, 0, 0) },
            { pos: new THREE.Vector3(-1.5, 1.8, -7.4), rot: new THREE.Euler(0, 0, 0) },
            { pos: new THREE.Vector3(1.5, 1.8, -7.4), rot: new THREE.Euler(0, 0, 0) },
            { pos: new THREE.Vector3(-7.4, 1.8, -3), rot: new THREE.Euler(0, Math.PI / 2, 0) },
            { pos: new THREE.Vector3(-7.4, 1.8, 0), rot: new THREE.Euler(0, Math.PI / 2, 0) },
            { pos: new THREE.Vector3(-7.4, 1.8, 3), rot: new THREE.Euler(0, Math.PI / 2, 0) }
        ];

        this.imageUrls.forEach((url, index) => {
            if (index >= positions.length) return;
            
            const border = new THREE.Mesh(frameBorderGeometry, frameMaterial);
            border.position.copy(positions[index].pos);
            border.rotation.copy(positions[index].rot);
            border.position.z += (positions[index].rot.y === 0) ? 0.01 : 0;
            border.position.x += (positions[index].rot.y !== 0) ? 0.01 : 0;
            this.scene.add(border);
            
            loader.load(
                url,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    
                    const material = new THREE.MeshStandardMaterial({ 
                        map: texture,
                        roughness: 0.5,
                        metalness: 0
                    });
                    
                    const frame = new THREE.Mesh(frameGeometry, material);
                    frame.position.copy(positions[index].pos);
                    frame.rotation.copy(positions[index].rot);
                    this.scene.add(frame);
                    
                    this.frames.push(frame);
                },
                undefined,
                (error) => {
                    console.error(`Error loading ${url}:`, error);
                    const fallbackMaterial = new THREE.MeshStandardMaterial({ color: 0x7FA7C9 });
                    const frame = new THREE.Mesh(frameGeometry, fallbackMaterial);
                    frame.position.copy(positions[index].pos);
                    frame.rotation.copy(positions[index].rot);
                    this.scene.add(frame);
                    this.frames.push(frame);
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

function initGalleryRoomHero() {
    if (heroInstance) {
        heroInstance.dispose();
    }
    
    heroInstance = new GalleryRoomHero('hero-canvas-container');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryRoomHero);
} else {
    initGalleryRoomHero();
}

export { GalleryRoomHero, initGalleryRoomHero };
