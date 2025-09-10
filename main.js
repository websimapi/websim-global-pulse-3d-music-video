import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class MusicVideo {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('canvas'),
            antialias: true 
        });
        
        this.clock = new THREE.Clock();
        this.isPlaying = false;
        this.audioContext = null;
        this.currentTime = 0;
        
        this.init();
        this.setupPostProcessing();
        this.createScenes();
        this.setupControls();
        this.animate();
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.scene.fog = new THREE.Fog(0x000000, 10, 100);
        
        // Global lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        this.camera.position.set(0, 5, 10);
    }
    
    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, 0.4, 0.85
        );
        this.composer.addPass(bloomPass);
    }
    
    createScenes() {
        this.createEnergyElements();
        this.createMarketElements();
        this.createConflictElements();
        this.createHopeElements();
    }
    
    createEnergyElements() {
        // Oil/energy waves
        const geometry = new THREE.PlaneGeometry(20, 20, 50, 50);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                amplitude: { value: 1.0 },
                color1: { value: new THREE.Color(0xff4500) },
                color2: { value: new THREE.Color(0xffd700) }
            },
            vertexShader: window.Shaders.energyVertex,
            fragmentShader: window.Shaders.energyFragment,
            transparent: true
        });
        
        const energyWave = new THREE.Mesh(geometry, material);
        energyWave.rotation.x = -Math.PI / 2;
        energyWave.userData.isEnergyWave = true;
        this.scene.add(energyWave);
        
        // Floating energy orbs
        for (let i = 0; i < 20; i++) {
            const orbGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const orbMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.1, 1, 0.5 + Math.random() * 0.5),
                transparent: true,
                opacity: 0.8
            });
            
            const orb = new THREE.Mesh(orbGeometry, orbMaterial);
            orb.position.set(
                (Math.random() - 0.5) * 30,
                Math.random() * 10 + 2,
                (Math.random() - 0.5) * 30
            );
            orb.userData.isEnergyOrb = true;
            orb.userData.speed = Math.random() * 0.02 + 0.01;
            this.scene.add(orb);
        }
    }
    
    createMarketElements() {
        // Stock market data visualization
        const barCount = 50;
        for (let i = 0; i < barCount; i++) {
            const height = Math.random() * 5 + 1;
            const geometry = new THREE.BoxGeometry(0.3, height, 0.3);
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    baseColor: { value: new THREE.Color(0x00ff88) },
                    opacity: { value: 0.7 }
                },
                vertexShader: window.Shaders.holoVertex,
                fragmentShader: window.Shaders.holoFragment,
                transparent: true
            });
            
            const bar = new THREE.Mesh(geometry, material);
            bar.position.set(
                (i - barCount/2) * 0.5,
                height / 2,
                -5
            );
            bar.userData.isMarketData = true;
            bar.userData.index = i;
            this.scene.add(bar);
        }
    }
    
    createConflictElements() {
        // Conflict visualization with distorted geometries
        const conflictGeometry = new THREE.IcosahedronGeometry(3, 2);
        const conflictMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: 0.5 },
                warColor: { value: new THREE.Color(0xff0000) },
                peaceColor: { value: new THREE.Color(0x0088ff) }
            },
            vertexShader: window.Shaders.conflictVertex,
            fragmentShader: window.Shaders.conflictFragment,
            transparent: true
        });
        
        const conflictSphere = new THREE.Mesh(conflictGeometry, conflictMaterial);
        conflictSphere.position.set(0, 3, 0);
        conflictSphere.userData.isConflict = true;
        this.scene.add(conflictSphere);
    }
    
    createHopeElements() {
        // Rising elements for hope/rebuilding theme
        for (let i = 0; i < 30; i++) {
            const geometry = new THREE.ConeGeometry(0.1, 2, 6);
            const material = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(0.6, 0.7, 0.6),
                transparent: true,
                opacity: 0.8
            });
            
            const cone = new THREE.Mesh(geometry, material);
            cone.position.set(
                (Math.random() - 0.5) * 20,
                0,
                (Math.random() - 0.5) * 20
            );
            cone.userData.isHope = true;
            cone.userData.targetY = Math.random() * 8 + 2;
            cone.userData.riseSpeed = Math.random() * 0.02 + 0.005;
            this.scene.add(cone);
        }
    }
    
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', () => {
            this.togglePlay();
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = this.isPlaying ? 'Pause' : 'Play';
        
        if (this.isPlaying) {
            this.clock.start();
        }
    }
    
    updateScene() {
        if (!this.isPlaying) return;
        
        this.currentTime = this.clock.getElapsedTime();
        
        // Update progress bar
        const progress = Math.min(this.currentTime / 90, 1); // 90 seconds total
        document.getElementById('progressBar').style.width = `${progress * 100}%`;
        
        // Update lyrics
        window.AnimationController.updateLyrics(this.currentTime);
        
        // Animate energy elements
        this.scene.traverse((child) => {
            if (child.userData.isEnergyWave && child.material.uniforms) {
                child.material.uniforms.time.value = this.currentTime;
                child.material.uniforms.amplitude.value = Math.sin(this.currentTime * 2) * 0.5 + 1;
            }
            
            if (child.userData.isEnergyOrb) {
                child.position.y += Math.sin(this.currentTime * child.userData.speed * 10) * 0.02;
                child.rotation.y += child.userData.speed;
            }
            
            if (child.userData.isMarketData) {
                const wave = Math.sin(this.currentTime * 3 + child.userData.index * 0.1);
                child.position.y = Math.abs(wave) * 2 + 0.5;
                if (child.material.uniforms) {
                    child.material.uniforms.time.value = this.currentTime;
                }
            }
            
            if (child.userData.isConflict && child.material.uniforms) {
                child.material.uniforms.time.value = this.currentTime;
                child.material.uniforms.intensity.value = Math.abs(Math.sin(this.currentTime * 2)) * 0.8 + 0.2;
                child.rotation.x += 0.01;
                child.rotation.y += 0.02;
            }
            
            if (child.userData.isHope) {
                if (child.position.y < child.userData.targetY) {
                    child.position.y += child.userData.riseSpeed;
                }
                child.rotation.y += 0.01;
            }
        });
        
        // Camera movement based on time
        const cameraRadius = 15;
        this.camera.position.x = Math.cos(this.currentTime * 0.1) * cameraRadius;
        this.camera.position.z = Math.sin(this.currentTime * 0.1) * cameraRadius;
        this.camera.position.y = 5 + Math.sin(this.currentTime * 0.05) * 3;
        this.camera.lookAt(0, 2, 0);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateScene();
        this.controls.update();
        this.composer.render();
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    new MusicVideo();
});

