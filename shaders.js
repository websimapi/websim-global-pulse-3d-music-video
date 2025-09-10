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
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            float wave = sin(vPosition.x * 5.0 + time * 3.0) * 0.5 + 0.5;
            wave += sin(vPosition.y * 3.0 + time * 2.0) * 0.3;
            
            vec3 color = mix(color1, color2, wave);
            float alpha = 0.8 + sin(time * 4.0 + vPosition.x * 2.0) * 0.2;
            
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
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            float conflict = sin(time * 6.0 + vPosition.x * 5.0) * 0.5 + 0.5;
            conflict *= intensity;
            
            vec3 color = mix(peaceColor, warColor, conflict);
            float distortion = sin(vPosition.x * 30.0 + time * 8.0) * 0.1;
            
            gl_FragColor = vec4(color + distortion, 0.9);
        }
    `
};

