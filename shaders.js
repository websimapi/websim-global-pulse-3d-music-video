// Global shader definitions
window.Shaders = {
    // Energy wave shader for oil/energy themes
    energyVertex: `
        uniform float time;
        uniform float amplitude;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            vUv = uv;
            vPosition = position;
            
            vec3 pos = position;
            pos.z += sin(pos.x * 10.0 + time * 2.0) * amplitude * 0.1;
            pos.z += sin(pos.y * 8.0 + time * 1.5) * amplitude * 0.05;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    
    energyFragment: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform sampler2D energyTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            float wave = sin(vPosition.x * 5.0 + time * 3.0) * 0.5 + 0.5;
            wave += sin(vPosition.y * 3.0 + time * 2.0) * 0.3;
            
            vec4 textureColor = texture2D(energyTexture, vUv + vec2(time * 0.1, 0.0));
            vec3 color = mix(color1, color2, wave) * textureColor.rgb;
            float alpha = (0.8 + sin(time * 4.0 + vPosition.x * 2.0) * 0.2) * textureColor.a;
            
            gl_FragColor = vec4(color, alpha);
        }
    `,
    
    // Holographic shader for digital/market themes
    holoVertex: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vUv = uv;
            vNormal = normal;
            vPosition = position;
            
            vec3 pos = position;
            pos += normal * sin(time * 2.0 + position.y * 10.0) * 0.02;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    
    holoFragment: `
        uniform float time;
        uniform vec3 baseColor;
        uniform float opacity;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 2.0);
            float scanline = sin(vPosition.y * 100.0 + time * 10.0) * 0.1 + 0.9;
            
            vec3 color = baseColor * (fresnel + 0.3) * scanline;
            float alpha = opacity * (fresnel * 0.8 + 0.2);
            
            gl_FragColor = vec4(color, alpha);
        }
    `,
    
    // Conflict/crisis shader with distortion
    conflictVertex: `
        uniform float time;
        uniform float intensity;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            vUv = uv;
            vPosition = position;
            
            vec3 pos = position;
            float noise = sin(pos.x * 20.0 + time * 5.0) * sin(pos.y * 15.0 + time * 3.0);
            pos += normal * noise * intensity * 0.1;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    
    conflictFragment: `
        uniform float time;
        uniform float intensity;
        uniform vec3 warColor;
        uniform vec3 peaceColor;
        uniform sampler2D conflictTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            float conflict = sin(time * 6.0 + vPosition.x * 5.0) * 0.5 + 0.5;
            conflict *= intensity;
            
            vec4 textureColor = texture2D(conflictTexture, vUv + vec2(0.0, time * 0.05));
            vec3 color = mix(peaceColor, warColor, conflict) * textureColor.rgb;
            float distortion = sin(vPosition.x * 30.0 + time * 8.0) * 0.1;
            
            gl_FragColor = vec4(color + distortion, 0.9 * textureColor.a);
        }
    `,

    // Trippy skybox shader
    skyboxVertex: `
        varying vec3 vWorldPosition;
        
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    
    skyboxFragment: `
        uniform float time;
        varying vec3 vWorldPosition;
        
        // Noise function
        float noise(vec3 p) {
            return sin(p.x * 2.0) * sin(p.y * 3.0) * sin(p.z * 1.5);
        }
        
        // Fractal noise
        float fractalNoise(vec3 p) {
            float value = 0.0;
            float amplitude = 1.0;
            for(int i = 0; i < 4; i++) {
                value += noise(p) * amplitude;
                p *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }
        
        void main() {
            vec3 direction = normalize(vWorldPosition);
            
            // Create flowing patterns
            float pattern1 = sin(direction.x * 10.0 + time * 2.0) * cos(direction.y * 8.0 + time * 1.5);
            float pattern2 = fractalNoise(direction * 5.0 + time * 0.5);
            
            // Spiral effect
            float angle = atan(direction.x, direction.z);
            float spiral = sin(angle * 8.0 + direction.y * 15.0 + time * 3.0);
            
            // Color cycling
            vec3 color1 = vec3(0.8, 0.2, 1.0); // Purple
            vec3 color2 = vec3(0.0, 0.8, 1.0); // Cyan
            vec3 color3 = vec3(1.0, 0.4, 0.0); // Orange
            vec3 color4 = vec3(1.0, 0.0, 0.5); // Pink
            
            float colorMix = (pattern1 + pattern2 + spiral) * 0.33;
            colorMix = sin(colorMix + time) * 0.5 + 0.5;
            
            vec3 finalColor = mix(
                mix(color1, color2, colorMix),
                mix(color3, color4, colorMix),
                sin(time * 0.8) * 0.5 + 0.5
            );
            
            // Add brightness variation
            float brightness = 0.3 + abs(pattern2) * 0.7;
            finalColor *= brightness;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};