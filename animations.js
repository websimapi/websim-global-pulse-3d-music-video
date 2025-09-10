// Animation controller for scene transitions
window.AnimationController = {
    scenes: [],
    currentScene: 0,
    transitionDuration: 2.0,
    
    // Timeline markers for different song sections (in seconds)
    timeline: [
        { time: 0, scene: 'intro', theme: 'energy' },
        { time: 15, scene: 'verse1', theme: 'markets' },
        { time: 30, scene: 'chorus1', theme: 'sanctions' },
        { time: 45, scene: 'verse2', theme: 'drones' },
        { time: 60, scene: 'chorus2', theme: 'conflict' },
        { time: 75, scene: 'outro', theme: 'hope' }
    ],
    
    lyrics: [
        { time: 5, text: "هجوم energy طاقوي rising أسعار oil النفط pressure جديد market السوق", duration: 4 },
        { time: 10, text: "European عقوبات brewing يقظة jump الأسواق markets تراقب tight", duration: 4 },
        { time: 15, text: "日本 drones 領空 intercept ドローン urgent 迎撃 NATO 会議 上昇", duration: 4 },
        { time: 20, text: "नेपाली anger ग़ुस्सा Gen आंदोलन Z सोशल demand मीडिया अधिकार freedom मांगना", duration: 4 },
        { time: 25, text: "亚洲 stocks 股市 surge 上涨 Fed 联储 cut 降息 hype 预期 investing 热潮", duration: 4 },
        { time: 32, text: "UE wants sanctions veut peace sanctions en fragile suspens deeper division accrue", duration: 4 },
        { time: 37, text: "Novo layoffs cortes tariffs emprego global tarifas uncertainty lucro", duration: 4 },
        { time: 42, text: "Польща shoots збиває drones дрони NATO переговори rising ескалація threat підході", duration: 4 },
        { time: 47, text: "ضربات new جديدة on غزة Gaza كل crisis يوم civilians أزمة pay المدنيون price الثمن", duration: 4 },
        { time: 65, text: "通胀 easing 缓和 markets 市场 await 等待 cuts 降息 gold 黄金 record 创新高", duration: 4 },
        { time: 70, text: "जबरदस्त protests आंदोलन new नई hope उम्मीद nation देश rebuilding पुनर्निर्माण जागा rising", duration: 4 }
    ],
    
    createEnergyScene(scene, time) {
        // Animated energy waves and oil price visualizations
        const amplitude = Math.sin(time * 2) * 0.5 + 0.5;
        
        scene.traverse((child) => {
            if (child.material && child.material.uniforms) {
                if (child.material.uniforms.amplitude) {
                    child.material.uniforms.amplitude.value = amplitude;
                }
                if (child.material.uniforms.time) {
                    child.material.uniforms.time.value = time;
                }
            }
        });
    },
    
    createMarketsScene(scene, time) {
        // Stock market data visualization with holographic effects
        scene.traverse((child) => {
            if (child.userData.isMarketData) {
                child.position.y = Math.sin(time * 3 + child.userData.index) * 0.5;
                child.rotation.y = time * 0.5;
            }
        });
    },
    
    createConflictScene(scene, time) {
        // War/peace tension visualization
        const intensity = Math.abs(Math.sin(time * 4)) * 0.8 + 0.2;
        
        scene.traverse((child) => {
            if (child.material && child.material.uniforms) {
                if (child.material.uniforms.intensity) {
                    child.material.uniforms.intensity.value = intensity;
                }
            }
        });
    },
    
    updateLyrics(currentTime) {
        const lyricsElement = document.getElementById('lyrics');
        const currentLyric = this.lyrics.find(lyric => 
            currentTime >= lyric.time && currentTime < lyric.time + lyric.duration
        );
        
        if (currentLyric) {
            lyricsElement.textContent = currentLyric.text;
            lyricsElement.classList.add('visible');
        } else {
            lyricsElement.classList.remove('visible');
        }
    }
};

