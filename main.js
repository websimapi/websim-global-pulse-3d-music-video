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
        
        // Extend fog for infinite feeling
        this.scene.fog = new THREE.Fog(0x000011, 50, 200);
        
        // Global lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        this.camera.position.set(0, 5, 10);
        
        // Create trippy skybox
        this.createSkybox();
    }
    
    createSkybox() {
        const skyboxGeometry = new THREE.SphereGeometry(500, 64, 64);
        const skyboxMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: window.Shaders.skyboxVertex,
            fragmentShader: window.Shaders.skyboxFragment,
            side: THREE.BackSide
        });
        
        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        skybox.userData.isSkybox = true;
        this.scene.add(skybox);
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
        this.createTerrain(); // Add proper terrain first
        this.createEnergyElements();
        this.createMarketElements();
        this.createConflictElements();
        this.createHopeElements();
        this.createGlobeElement();
        this.createDroneElements();
        this.createImageBillboards();
    }
    
    createTerrain() {
        // Create stable ground terrain that won't clip
        const terrainGeometry = new THREE.PlaneGeometry(300, 300, 100, 100);
        const vertices = terrainGeometry.attributes.position.array;
        
        // Add height variation to terrain
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            vertices[i + 1] = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 2;
        }
        terrainGeometry.attributes.position.needsUpdate = true;
        terrainGeometry.computeVertexNormals();
        
        const terrainMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            wireframe: false,
            transparent: false,
            side: THREE.DoubleSide
        });
        
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.position.y = -1;
        terrain.receiveShadow = true;
        terrain.userData.isTerrain = true;
        this.scene.add(terrain);
        
        // Add wireframe overlay for better visibility
        const wireframeGeometry = terrainGeometry.clone();
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x666666,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const wireframeTerrain = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        wireframeTerrain.rotation.x = -Math.PI / 2;
        wireframeTerrain.position.y = -0.99;
        wireframeTerrain.userData.isTerrainWireframe = true;
        this.scene.add(wireframeTerrain);
    }
    
    createEnergyElements() {
        // Load energy pattern texture
        const textureLoader = new THREE.TextureLoader();
        const energyTexture = textureLoader.load('/energy_pattern.png');
        
        // Enhanced energy waves - positioned above ground to avoid clipping
        const geometry = new THREE.PlaneGeometry(80, 80, 120, 120);
        const vertices = geometry.attributes.position.array;
        
        // Add wave displacement to vertices
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            vertices[i + 1] = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5;
        }
        geometry.attributes.position.needsUpdate = true;
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                amplitude: { value: 1.0 },
                color1: { value: new THREE.Color(0xff4500) },
                color2: { value: new THREE.Color(0xffd700) },
                energyTexture: { value: energyTexture }
            },
            vertexShader: window.Shaders.energyVertex,
            fragmentShader: window.Shaders.energyFragment,
            transparent: true,
            depthWrite: false // Prevent depth issues
        });
        
        const energyWave = new THREE.Mesh(geometry, material);
        energyWave.rotation.x = -Math.PI / 2;
        energyWave.position.y = 0.5; // Position above ground
        energyWave.userData.isEnergyWave = true;
        this.scene.add(energyWave);
        
        // More detailed energy tunnel with better geometry
        const tunnelGeometry = new THREE.CylinderGeometry(12, 12, 60, 64, 8, true);
        const tunnelMaterial = new THREE.MeshBasicMaterial({
            map: energyTexture,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const energyTunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
        energyTunnel.rotation.x = Math.PI / 2;
        energyTunnel.position.set(0, 8, -35);
        energyTunnel.userData.isEnergyTunnel = true;
        this.scene.add(energyTunnel);
        
        // More detailed floating energy orbs with better geometry
        for (let i = 0; i < 60; i++) {
            const orbGeometry = new THREE.IcosahedronGeometry(0.3, 3); // Increased detail
            const orbMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(0.1, 1, 0.5 + Math.random() * 0.5),
                transparent: true,
                opacity: 0.9,
                emissive: new THREE.Color().setHSL(0.1, 0.5, 0.3),
                shininess: 100
            });
            
            const orb = new THREE.Mesh(orbGeometry, orbMaterial);
            orb.position.set(
                (Math.random() - 0.5) * 120,
                Math.random() * 25 + 3,
                (Math.random() - 0.5) * 120
            );
            orb.castShadow = true;
            orb.userData.isEnergyOrb = true;
            orb.userData.speed = Math.random() * 0.02 + 0.01;
            this.scene.add(orb);
        }
    }
    
    createMarketElements() {
        // Load market data texture
        const textureLoader = new THREE.TextureLoader();
        const marketTexture = textureLoader.load('/market_data.png');
        
        // Enhanced holographic market display
        const displayGeometry = new THREE.PlaneGeometry(20, 10);
        const displayMaterial = new THREE.MeshBasicMaterial({
            map: marketTexture,
            transparent: true,
            opacity: 0.8
        });
        const marketDisplay = new THREE.Mesh(displayGeometry, displayMaterial);
        marketDisplay.position.set(-15, 8, -10);
        marketDisplay.rotation.y = Math.PI / 4;
        marketDisplay.userData.isMarketDisplay = true;
        this.scene.add(marketDisplay);
        
        // More detailed stock market bars with better geometry
        const barCount = 100;
        for (let i = 0; i < barCount; i++) {
            const height = Math.random() * 5 + 1;
            const geometry = new THREE.CylinderGeometry(0.15, 0.15, height, 8);
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
                (i - barCount/2) * 1.5,
                height / 2,
                -20 + Math.sin(i * 0.1) * 30
            );
            bar.userData.isMarketData = true;
            bar.userData.index = i;
            this.scene.add(bar);
        }
    }
    
    createConflictElements() {
        // Load conflict texture
        const textureLoader = new THREE.TextureLoader();
        const conflictTexture = textureLoader.load('/conflict_texture.png');
        
        // Enhanced conflict visualization with texture
        const conflictGeometry = new THREE.DodecahedronGeometry(3, 2);
        const conflictMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: 0.5 },
                warColor: { value: new THREE.Color(0xff0000) },
                peaceColor: { value: new THREE.Color(0x0088ff) },
                conflictTexture: { value: conflictTexture }
            },
            vertexShader: window.Shaders.conflictVertex,
            fragmentShader: window.Shaders.conflictFragment,
            transparent: true
        });
        
        const conflictSphere = new THREE.Mesh(conflictGeometry, conflictMaterial);
        conflictSphere.position.set(0, 3, 0);
        conflictSphere.userData.isConflict = true;
        this.scene.add(conflictSphere);
        
        // Conflict shards around the main sphere
        for (let i = 0; i < 12; i++) {
            const shardGeometry = new THREE.TetrahedronGeometry(0.5, 1);
            const shardMaterial = new THREE.MeshBasicMaterial({
                map: conflictTexture,
                transparent: true,
                opacity: 0.7
            });
            const shard = new THREE.Mesh(shardGeometry, shardMaterial);
            const angle = (i / 12) * Math.PI * 2;
            shard.position.set(
                Math.cos(angle) * 6,
                3 + Math.sin(i) * 2,
                Math.sin(angle) * 6
            );
            shard.userData.isConflictShard = true;
            shard.userData.angle = angle;
            this.scene.add(shard);
        }
    }
    
    createHopeElements() {
        // Load protest crowd texture
        const textureLoader = new THREE.TextureLoader();
        const protestTexture = textureLoader.load('/protest_crowd.png');
        
        // Protest crowd billboards
        const crowdGeometry = new THREE.PlaneGeometry(8, 4);
        const crowdMaterial = new THREE.MeshBasicMaterial({
            map: protestTexture,
            transparent: true,
            alphaTest: 0.1
        });
        
        for (let i = 0; i < 5; i++) {
            const crowd = new THREE.Mesh(crowdGeometry, crowdMaterial.clone());
            crowd.position.set(
                (Math.random() - 0.5) * 60,
                2,
                (Math.random() - 0.5) * 60
            );
            crowd.rotation.y = Math.random() * Math.PI * 2;
            crowd.userData.isProtestCrowd = true;
            this.scene.add(crowd);
        }
        
        // Enhanced rising elements with better geometry
        for (let i = 0; i < 80; i++) {
            const geometry = new THREE.ConeGeometry(0.15, 3, 8);
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(0.6, 0.7, 0.6),
                transparent: true,
                opacity: 0.8,
                shininess: 100
            });
            
            const cone = new THREE.Mesh(geometry, material);
            cone.position.set(
                (Math.random() - 0.5) * 100,
                0,
                (Math.random() - 0.5) * 100
            );
            cone.userData.isHope = true;
            cone.userData.targetY = Math.random() * 15 + 2;
            cone.userData.riseSpeed = Math.random() * 0.02 + 0.005;
            this.scene.add(cone);
        }
    }
    
    createGlobeElement() {
        // Create highly detailed globe with world map texture
        const textureLoader = new THREE.TextureLoader();
        const globeTexture = textureLoader.load('/globe_texture.png');
        
        // Increased sphere detail significantly
        const globeGeometry = new THREE.SphereGeometry(6, 128, 128);
        const globeMaterial = new THREE.MeshPhongMaterial({
            map: globeTexture,
            transparent: false, // Remove transparency to prevent clipping
            shininess: 30,
            bumpScale: 0.1
        });
        
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        globe.position.set(25, 12, -25); // Positioned higher to avoid ground clipping
        globe.castShadow = true;
        globe.receiveShadow = true;
        globe.userData.isGlobe = true;
        this.scene.add(globe);
        
        // Enhanced atmosphere effect with better geometry
        const atmosphereGeometry = new THREE.SphereGeometry(6.3, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                opacity: { value: 0.3 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float opacity;
                varying vec3 vNormal;
                void main() {
                    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
                    float pulse = sin(time * 2.0) * 0.1 + 0.9;
                    gl_FragColor = vec4(0.3, 0.6, 1.0, fresnel * opacity * pulse);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            depthWrite: false
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        globe.add(atmosphere);
        
        // Add orbital rings for more detail
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(7 + i * 0.5, 7.2 + i * 0.5, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.y = i * 0.3;
            ring.userData.isGlobeRing = true;
            ring.userData.index = i;
            globe.add(ring);
        }
    }
    
    createDroneElements() {
        // Load drone silhouette texture
        const textureLoader = new THREE.TextureLoader();
        const droneTexture = textureLoader.load('/drone_silhouette.png');
        
        // Create drone billboards
        for (let i = 0; i < 8; i++) {
            const droneGeometry = new THREE.PlaneGeometry(2, 1);
            const droneMaterial = new THREE.MeshBasicMaterial({
                map: droneTexture,
                transparent: true,
                alphaTest: 0.1
            });
            
            const drone = new THREE.Mesh(droneGeometry, droneMaterial);
            drone.position.set(
                (Math.random() - 0.5) * 80,
                8 + Math.random() * 10,
                (Math.random() - 0.5) * 80
            );
            drone.userData.isDrone = true;
            drone.userData.speed = Math.random() * 0.02 + 0.01;
            drone.userData.radius = Math.random() * 20 + 10;
            drone.userData.angle = Math.random() * Math.PI * 2;
            this.scene.add(drone);
        }
    }
    
    createImageBillboards() {
        // Create floating image displays with proper depth sorting
        const textureLoader = new THREE.TextureLoader();
        const textures = [
            '/energy_pattern.png',
            '/market_data.png',
            '/conflict_texture.png'
        ];
        
        textures.forEach((texturePath, index) => {
            const texture = textureLoader.load(texturePath);
            const billboardGeometry = new THREE.PlaneGeometry(5, 5);
            const billboardMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.6,
                depthWrite: false, // Prevent depth conflicts with 3D assets
                alphaTest: 0.1
            });
            
            const billboard = new THREE.Mesh(billboardGeometry, billboardMaterial);
            billboard.position.set(
                Math.cos(index * 2.1) * 40,
                8 + index * 4,
                Math.sin(index * 2.1) * 40
            );
            billboard.userData.isBillboard = true;
            billboard.userData.index = index;
            billboard.renderOrder = 1; // Render after 3D assets
            this.scene.add(billboard);
        });
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
        const progress = Math.min(this.currentTime / 90, 1);
        document.getElementById('progressBar').style.width = `${progress * 100}%`;
        
        // Update lyrics
        window.AnimationController.updateLyrics(this.currentTime);
        
        // Animate elements
        this.scene.traverse((child) => {
            if (child.userData.isSkybox && child.material.uniforms) {
                child.material.uniforms.time.value = this.currentTime;
            }
            
            if (child.userData.isEnergyWave && child.material.uniforms) {
                child.material.uniforms.time.value = this.currentTime;
                child.material.uniforms.amplitude.value = Math.sin(this.currentTime * 2) * 0.5 + 1;
            }
            
            if (child.userData.isEnergyTunnel) {
                child.rotation.z += 0.015;
                child.material.opacity = 0.3 + Math.sin(this.currentTime * 3) * 0.1;
            }
            
            if (child.userData.isEnergyOrb) {
                child.position.y += Math.sin(this.currentTime * child.userData.speed * 10) * 0.015;
                child.rotation.y += child.userData.speed;
                child.rotation.x += child.userData.speed * 0.5;
            }
            
            if (child.userData.isMarketDisplay) {
                child.position.y = 8 + Math.sin(this.currentTime * 2) * 0.5;
                child.rotation.y = Math.PI / 4 + Math.sin(this.currentTime) * 0.1;
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
            
            if (child.userData.isConflictShard) {
                const orbitRadius = 6 + Math.sin(this.currentTime * 2) * 2;
                child.position.x = Math.cos(child.userData.angle + this.currentTime) * orbitRadius;
                child.position.z = Math.sin(child.userData.angle + this.currentTime) * orbitRadius;
                child.rotation.x += 0.02;
                child.rotation.y += 0.03;
            }
            
            if (child.userData.isGlobe) {
                child.rotation.y += 0.003;
                child.position.y = 12 + Math.sin(this.currentTime * 0.5) * 0.8;
                
                // Animate globe rings
                child.children.forEach((ringChild) => {
                    if (ringChild.userData.isGlobeRing) {
                        ringChild.rotation.z += 0.01 * (ringChild.userData.index + 1);
                        if (ringChild.material.uniforms && ringChild.material.uniforms.time) {
                            ringChild.material.uniforms.time.value = this.currentTime;
                        }
                    }
                });
            }
            
            if (child.userData.isDrone) {
                child.userData.angle += child.userData.speed;
                child.position.x = Math.cos(child.userData.angle) * child.userData.radius;
                child.position.z = Math.sin(child.userData.angle) * child.userData.radius;
                child.position.y += Math.sin(this.currentTime * 4 + child.userData.angle) * 0.05;
                child.lookAt(this.camera.position);
            }
            
            if (child.userData.isBillboard) {
                child.rotation.y = Math.sin(this.currentTime + child.userData.index) * 0.3;
                child.position.y = 8 + child.userData.index * 4 + Math.sin(this.currentTime * 2 + child.userData.index) * 0.5;
                child.lookAt(this.camera.position);
            }
            
            if (child.userData.isProtestCrowd) {
                child.position.y = 2 + Math.sin(this.currentTime * 3 + child.position.x) * 0.1;
                child.lookAt(this.camera.position);
            }
            
            if (child.userData.isHope) {
                if (child.position.y < child.userData.targetY) {
                    child.position.y += child.userData.riseSpeed;
                }
                child.rotation.y += 0.01;
            }
        });
        
        // Enhanced camera movement for infinite feel with better positioning
        const cameraRadius = 35;
        this.camera.position.x = Math.cos(this.currentTime * 0.08) * cameraRadius;
        this.camera.position.z = Math.sin(this.currentTime * 0.08) * cameraRadius;
        this.camera.position.y = 15 + Math.sin(this.currentTime * 0.04) * 8;
        this.camera.lookAt(0, 5, 0);
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