document.addEventListener("DOMContentLoaded", () => {
    // Prevenir restauração de scroll do browser (preloader cobre tudo)
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // 1. Tactile Remotion Preloader Logic (Layered PNG)
    const preloader = document.getElementById('preloader');
    const body = document.body;
    const heroContent = document.querySelector('.hero-content');

    // === SAFETY TIMEOUT: Unlock site if preloader gets stuck ===
    const safetyTimeout = setTimeout(() => {
        console.warn('[Santa] Safety timeout - forcing preloader exit');
        if (preloader) { preloader.style.opacity = '0'; preloader.style.visibility = 'hidden'; }
        body.style.overflowY = 'auto';
        if (heroContent) { heroContent.style.opacity = '1'; heroContent.style.transform = 'translateY(0)'; }
        // Inicializar componentes ScrollTrigger no fallback
        try { initAboutSection(); } catch(e) {}
        try { initStatsAnimations(); } catch(e) {}
        try { initFadeUpElements(); } catch(e) {}
        try { initWorksReveal(); } catch(e) {}
        // Forçar visibilidade
        document.querySelectorAll('.fade-up, .reveal-item, .stat-item').forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
    }, 6000);

    // Guard: if GSAP didn't load from CDN, skip all animations
    if (typeof gsap === 'undefined') {
        console.error('[Santa] GSAP not loaded - skipping animations');
        clearTimeout(safetyTimeout);
        if (preloader) { preloader.style.display = 'none'; }
        body.style.overflowY = 'auto';
        if (heroContent) { heroContent.style.opacity = '1'; heroContent.style.transform = 'translateY(0)'; }
        document.querySelectorAll('.fade-up').forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
        return; // exit DOMContentLoaded entirely
    }

    // Register ScrollTrigger early
    if (typeof ScrollTrigger !== 'undefined') { gsap.registerPlugin(ScrollTrigger); }

    // Create GSAP Timeline for preloader (assets separados)
    const tl = gsap.timeline({
        onComplete: () => {
            // Pulse loop after full reveal
            gsap.to(['.logo-center', '.logo-ring'], {
                scale: 1.03,
                duration: 1.5,
                transformOrigin: "center center",
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
                stagger: { each: 0.15, from: "start" }
            });

            // Transition out after a beat
            setTimeout(() => {
                transitionToHero();
            }, 400);
        }
    });

    // Initial state: tudo escondido, pronto para explodir
    gsap.set('.logo-center', { scale: 0, opacity: 0, transformOrigin: 'center center' });
    gsap.set('.logo-ring', { scale: 0.3, opacity: 0, transformOrigin: 'center center' });
    gsap.set('.logo-text-top', { y: -80, opacity: 0, transformOrigin: 'center center' });
    gsap.set('.logo-text-bottom', { y: 80, opacity: 0, transformOrigin: 'center center' });
    // Estrelas começam ENORMES ocupando a tela toda
    gsap.set('.logo-star-left', { scale: 20, opacity: 0, transformOrigin: 'center center' });
    gsap.set('.logo-star-right', { scale: 20, opacity: 0, transformOrigin: 'center center' });

    // Step 1: Centro SD EXPLODE com elastic bounce forte
    tl.to('.logo-center', {
        scale: 1,
        opacity: 1,
        duration: 0.7,
        ease: "elastic.out(1.1, 0.4)"
    });

    // Step 2: Anel externo expande com impacto
    tl.to('.logo-ring', {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(2.5)"
    }, "-=0.2");

    // Step 3: Texto superior SLAM de cima
    tl.to('.logo-text-top', {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power4.out"
    }, "-=0.1");

    // Step 4: Texto inferior SLAM de baixo
    tl.to('.logo-text-bottom', {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power4.out"
    }, "-=0.35");

    // Step 5: Pausa curta antes do impacto final
    tl.to({}, { duration: 0.15 });

    // Step 6: ★★ ESTRELAS — zoom-out de tela cheia até a posição final
    tl.to('.logo-star-left', {
        scale: 1,
        opacity: 1,
        duration: 0.45,
        ease: "power3.out"
    });

    tl.to('.logo-star-right', {
        scale: 1,
        opacity: 1,
        duration: 0.45,
        ease: "power3.out"
    }, "-=0.40");

    // Step 7: IMPACTO — logo inteiro faz um bump de escala como onda de choque
    tl.add("impact");

    // Scale bump — logo inteiro "incha" e volta com bounce
    tl.to('.logo-assembly', {
        scale: 1.06,
        duration: 0.08,
        ease: "power4.out"
    }, "impact");

    tl.to('.logo-assembly', {
        scale: 1,
        duration: 0.6,
        ease: "elastic.out(1.2, 0.3)"
    });

    // Flash laranja suave no impacto
    tl.to('.logo-assembly', {
        filter: 'drop-shadow(0px 0px 25px rgba(253, 109, 20, 0.7))',
        duration: 0.15,
        ease: "power2.out"
    }, "impact");

    tl.to('.logo-assembly', {
        filter: 'drop-shadow(0px 8px 12px rgba(0, 0, 0, 0.4)) drop-shadow(0px 2px 4px rgba(253, 109, 20, 0.2))',
        duration: 1,
        ease: "power2.out"
    });

    // Função que força a visibilidade de elementos animáveis que já passaram do viewport
    // Resolve o problema de seções pretas ao recarregar a página fora da home
    function forceShowPassedElements() {
        // Esperar o browser fazer reflow após overflow-y: auto
        requestAnimationFrame(() => {
            const viewportHeight = window.innerHeight;

            // 1. Fade-up e reveal-item
            document.querySelectorAll('.fade-up, .reveal-item').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < viewportHeight) {
                    gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
                }
            });

            // 2. Stat items (opacity e y controlados por GSAP, contadores e linhas)
            document.querySelectorAll('.stat-item').forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.top < viewportHeight) {
                    gsap.set(item, { opacity: 1, y: 0, clearProps: "transform" });
                    
                    // Mostrar o valor final do contador
                    const countSpan = item.querySelector('.count-up');
                    if (countSpan) {
                        const originalValue = countSpan.getAttribute('data-target');
                        if (originalValue) {
                            countSpan.innerText = originalValue;
                        }
                    }
                    
                    // Expandir a linha
                    const line = item.querySelector('.stat-line');
                    if (line) {
                        gsap.set(line, { width: '100%' });
                    }
                }
            });

            // 3. Word reveal (texto about section)
            document.querySelectorAll('.word').forEach(word => {
                const rect = word.getBoundingClientRect();
                if (rect.top < viewportHeight) {
                    gsap.set(word, { color: '#ffffff' });
                }
            });
        });
    }

    function transitionToHero() {
        clearTimeout(safetyTimeout); // Cancel safety timeout since preloader is exiting normally
        gsap.to(preloader, {
            opacity: 0,
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => {
                preloader.style.visibility = 'hidden';
                body.style.overflowY = 'auto'; // allow scroll

                // Inicializar componentes ScrollTrigger com delay para garantir reflow completo
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        try { initAboutSection(); } catch (e) { console.error('[Santa] About error:', e); }
                        try { initStatsAnimations(); } catch (e) { console.error('[Santa] Stats error:', e); }
                        try { initFadeUpElements(); } catch (e) { console.error('[Santa] FadeUp error:', e); }
                        try { initWorksReveal(); } catch (e) { console.error('[Santa] WorksReveal error:', e); }
                    });
                });

                // Initialize hero animations with delay (coordinated with layer entrance)
                gsap.to(['.hero-content', '.language-switcher'], {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    duration: 1.5,
                    delay: 0.8, 
                    ease: "power2.out",
                    pointerEvents: "auto",
                    onStart: () => {
                        if (heroContent) heroContent.style.visibility = 'visible';
                    }
                });

                try { initParallax(); } catch (e) { console.error('[Santa] Parallax error:', e); }
            }
        });
    }


    // 2. Parallax Logic
    function initParallax() {
        if (typeof ScrollTrigger === 'undefined') return;

        const isDesktop = window.innerWidth > 768;
        const selector = isDesktop ? '.desktop-layers .layer' : '.mobile-layers .layer';
        const layers = document.querySelectorAll(selector);

        if (!layers.length) return;

        // Settings for layers: speed multipliers
        const baseSpeeds = [
            0.02,  // Layer 1 (Back)
            0.05,  // Layer 2
            0.1,  // Layer 3
            0.15,  // Layer 4
            0.22   // Layer 5 (Front)
        ];

        // Initial entrance state for layers (except layer-1)
        layers.forEach((layer, index) => {
            if (index > 0) {
                gsap.set(layer, {
                    y: 200,
                    opacity: 0
                });
            }
        });

        // Entrance Animation: Sliding up + Fade-in
        gsap.to(Array.from(layers).slice(1), {
            y: 0,
            opacity: 1,
            duration: (i) => 2.5 + (i * 0.5),
            stagger: 0.2,
            delay: 0.1,
            ease: "expo.out",
            onComplete: () => {
                // Parallax só inicia DEPOIS que a entrada terminou
                startParallax();
            }
        });

        // Increased parallax effect for mobile
        const mobileSpeeds = [
            0.08,
            0.18,
            0.35,
            0.55,
            0.8
        ];

        const speeds = isDesktop ? baseSpeeds : mobileSpeeds;

        // Função que inicia o parallax (só chamada APÓS a entrada terminar)
        function startParallax() {
            ScrollTrigger.refresh();

            // Scroll Parallax (Both Desktop & Mobile)
            layers.forEach((layer, index) => {
                gsap.to(layer, {
                    y: () => window.innerHeight * speeds[index],
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".hero-parallax",
                        start: "top top",
                        end: "bottom top",
                        scrub: true,
                        invalidateOnRefresh: true
                    }
                });
            });

            // Mouse Parallax (Only Desktop)
            if (isDesktop) {
                const heroSection = document.querySelector('.hero-parallax');

                heroSection.addEventListener("mousemove", (e) => {
                    const x = (e.clientX / window.innerWidth - 0.5) * 2;
                    const y = (e.clientY / window.innerHeight - 0.5) * 2;

                    layers.forEach((layer, index) => {
                        const movementX = x * (index + 1) * 8;
                        const movementY = y * (index + 1) * 8;

                        gsap.to(layer, {
                            x: movementX,
                            y: movementY,
                            duration: 1,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    });
                });

                heroSection.addEventListener("mouseleave", () => {
                    layers.forEach((layer) => {
                        gsap.to(layer, {
                            x: 0,
                            y: 0,
                            duration: 1.5,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    });
                });
            }
        }
    }

    // 3. About Section Scroll Logic (Friction & Word Reveal)
    function initAboutSection() {
        if (typeof ScrollTrigger === 'undefined') return;

        // Friction effect: makes the text wrapper move up slowly (slower than normal scroll)
        gsap.to(".about-container", {
            y: () => -window.innerHeight * 0.15,
            ease: "none",
            scrollTrigger: {
                trigger: ".about-section",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        // Word reveal setup
        const revealTexts = document.querySelectorAll('.reveal-text');
        const allWords = [];

        // Kill existing reveal triggers to avoid duplicates
        ScrollTrigger.getAll().forEach(st => {
            if (st.vars.id === 'wordReveal') st.kill();
        });

        revealTexts.forEach((text) => {
            // Split text into words, wrap in spans
            const content = text.innerText;
            const words = content.split(/\s+/); // Split by any whitespace

            // clear contents
            text.innerHTML = '';

            words.forEach(word => {
                if (word.trim().length === 0) return;
                const span = document.createElement('span');
                span.className = 'word';
                span.innerText = word;
                text.appendChild(span);
                text.appendChild(document.createTextNode(' '));
                allWords.push(span);
            });
        });

        // Animate ALL words as a single sequence
        if (allWords.length > 0) {
            gsap.fromTo(allWords,
                { color: "#333333" },
                {
                    color: "#ffffff",
                    ease: "none",
                    stagger: 0.1,
                    scrollTrigger: {
                        id: 'wordReveal',
                        trigger: ".about-container",
                        start: "top 85%", // Start reveal slightly earlier
                        end: "bottom 60%", // End reveal when container is past midpoint
                        scrub: true
                    }
                }
            );
        }
    }

    // 4. Stats Animation Logic
    function initStatsAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        const statItems = gsap.utils.toArray('.stat-item');

        statItems.forEach((item, index) => {
            const countSpan = item.querySelector('.count-up');
            const line = item.querySelector('.stat-line');
            const targetValue = parseInt(countSpan.innerText);

            // Estado inicial limpo
            gsap.set(item, { 
                opacity: 0, 
                y: 80, 
                perspective: 1000,
                transformStyle: "preserve-3d" 
            });
            gsap.set(line, { width: 0 });
            countSpan.setAttribute('data-target', targetValue); // Salvar valor original
            countSpan.innerText = "0";

            // Timeline disparada pelo Scroll
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                    onEnter: () => item.classList.add('is-counting'),
                    once: true 
                }
            });

            // 1. Entrada Elite: Staggered Fade + Slide com elasticidade controlada
            tl.to(item, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "expo.out",
                delay: index * 0.15
            });

            // 2. Contador Progressivo Premium
            const countObj = { val: 0 };
            tl.to(countObj, {
                val: targetValue,
                duration: 3,
                ease: "expo.out",
                onUpdate: () => {
                    countSpan.innerText = Math.floor(countObj.val);
                },
                onComplete: () => {
                    item.classList.remove('is-counting');
                    // Garante o valor exato no final
                    countSpan.innerText = targetValue;
                }
            }, "-=0.8");

            // 3. Linha crescendo em harmonia absoluta
            tl.to(line, {
                width: '100%',
                duration: 2,
                ease: "expo.inOut"
            }, "-=2.5");

            // --- INTERAÇÃO MAGNÉTICA 3D (TILT) ---
            if (window.innerWidth > 768) {
                item.addEventListener('mousemove', (e) => {
                    const rect = item.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    // Mouse variables para o CSS (radial-glow)
                    item.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
                    item.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

                    // Tilt Calculation
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / 10; // Sensibilidade
                    const rotateY = (centerX - x) / 10;

                    gsap.to(item, {
                        rotateX: rotateX,
                        rotateY: rotateY,
                        x: (x - centerX) * 0.1,
                        y: (y - centerY) * 0.1,
                        duration: 0.5,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                });

                item.addEventListener('mouseleave', () => {
                    gsap.to(item, {
                        rotateX: 0,
                        rotateY: 0,
                        x: 0,
                        y: 0,
                        duration: 1,
                        ease: "elastic.out(1, 0.3)",
                        overwrite: "auto"
                    });
                });
            }
        });
    }

    // 5. Process Before/After Slider
    function initProcessSlider() {
        const slider = document.getElementById('processSlider');
        const beforeImage = document.querySelector('.image-before');
        const handle = document.querySelector('.slider-handle');

        if (slider && beforeImage && handle) {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                beforeImage.style.width = `${value}%`;
                handle.style.left = `${value}%`;
            });
        }
    }

    // 6. Global Fade-up Elements
    function initFadeUpElements() {
        gsap.utils.toArray('.fade-up').forEach(element => {
            gsap.to(element, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%"
                }
            });
        });
    }

    // 6.5. Works Reveal Animation
    function initWorksReveal() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        const items = gsap.utils.toArray('.reveal-item');

        items.forEach((item) => {
            gsap.to(item, {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 92%",
                    toggleActions: "play none none none"
                }
            });
        });
    }

    // 7. Language Switcher Logic
    const translations = {
        pt: {
            hero_title_1: "DESIGNING THE",
            hero_title_2: "ELITE",
            hero_subtitle: "Gráficos esportivos que elevam o jogo ao nível global",
            hero_btn: "VER PORTFÓLIO",
            scroll: "SCROLL",
            about_title_1: "Onde a Performance",
            about_title_2: "encontra o Design.",
            about_p1: "Na Santa Design, acreditamos que a imagem de um atleta é tão decisiva quanto o seu desempenho em campo. Com mais de 4 anos de especialização no mercado de esportes de elite, transformamos carreiras em marcas visuais icônicas.",
            about_p2: "De flyers de dia de jogo a campanhas globais, nossa assinatura está presente em 7 países, conectando jogadores de alto nível aos seus fãs através de uma estética impecável e agressiva. Com mais de 200 artes exclusivas em nosso portfólio, não apenas entregamos design; entregamos autoridade visual para aqueles que nasceram para vencer.",
            stats_years: "ANOS NO MERCADO",
            stats_years_desc: "Especialização em design esportivo de elite",
            stats_countries: "PAÍSES ALCANZADOS",
            stats_countries_desc: "Presença global no futebol profissional",
            stats_art: "ARTES EXCLUSIVAS",
            stats_art_desc: "Para atletas de alto desempenho",
            process_title: "NOSSO PROCESSO",
            final_art: "ARTE FINAL",
            initial_photo: "FOTO INICIAL",
            cta_title: 'PRONTO PARA ELEVAR <span class="text-orange">SUA IMAGEM?</span>',
            cta_btn: 'PEÇA UM ORÇAMENTO <span class="arrow">&rarr;</span>',
            footer_text: "Transformando atletas em marcas visuais icônicas desde 2020",
            footer_copyright: "Todos os direitos reservados."
        },
        en: {
            hero_title_1: "DESIGNING THE",
            hero_title_2: "ELITE",
            hero_subtitle: "Sports graphics that elevate the game to a global level",
            hero_btn: "VIEW PORTFOLIO",
            scroll: "SCROLL",
            about_title_1: "Where Performance",
            about_title_2: "meets Design.",
            about_p1: "At Santa Design, we believe that an athlete's image is as decisive as their performance on the field. With over 4 years of specialization in the elite sports market, we transform careers into iconic visual brands.",
            about_p2: "From matchday flyers to global campaigns, our signature is present in 7 countries, connecting high-level players to their fans through impeccable and aggressive aesthetics. With over 200 exclusive artworks in our portfolio, we don't just deliver design; we deliver visual authority for those born to win.",
            stats_years: "YEARS IN THE MARKET",
            stats_years_desc: "Specialization in elite sports design",
            stats_countries: "COUNTRIES REACHED",
            stats_countries_desc: "Global presence in professional football",
            stats_art: "EXCLUSIVE ARTWORKS",
            stats_art_desc: "For high-performance athletes",
            process_title: "OUR PROCESS",
            final_art: "FINAL ART",
            initial_photo: "INITIAL PHOTO",
            cta_title: 'READY TO ELEVATE <span class="text-orange">YOUR IMAGE?</span>',
            cta_btn: 'REQUEST A QUOTE <span class="arrow">&rarr;</span>',
            footer_text: "Transforming athletes into iconic visual brands since 2020",
            footer_copyright: "All rights reserved."
        },
        es: {
            hero_title_1: "DISEÑANDO LA",
            hero_title_2: "ÉLITE",
            hero_subtitle: "Gráficos deportivos que elevan el juego a nivel mundial",
            hero_btn: "VER PORTAFOLIO",
            scroll: "SCROLL",
            about_title_1: "Donde el Rendimiento",
            about_title_2: "encuentra el Diseño.",
            about_p1: "En Santa Design, creemos que la imagen de un atleta es tan decisiva como su desempeño en el campo. Con más de 4 años de especialización en el mercado deportivo de élite, transformamos carreras en marcas visuales icónicas.",
            about_p2: "Desde folletos para días de partido até campañas globales, nuestra firma está presente en 7 países, conectando a jugadores de alto nivel con sus fanáticos a través de una estética impecable y agresiva. Con más de 200 obras de arte exclusivas en nuestro portafolio, no solo entregamos diseño; entregamos autoridad visual para aquellos que nacieron para ganar.",
            stats_years: "AÑOS EN EL MERCADO",
            stats_years_desc: "Especialización en diseño deportivo de élite",
            stats_countries: "PAÍSES ALCANZADOS",
            stats_countries_desc: "Presencia global en el fútbol profesional",
            stats_art: "OBRAS DE ARTE EXCLUSIVAS",
            stats_art_desc: "Para atletas de alto rendimiento",
            process_title: "NUESTRO PROCESO",
            final_art: "ARTE FINAL",
            initial_photo: "FOTO INICIAL",
            cta_title: '¿LISTO PARA ELEVAR <span class="text-orange">TU IMAGEN?</span>',
            cta_btn: 'SOLICITAR PRESUPUESTO <span class="arrow">&rarr;</span>',
            footer_text: "Transformando atletas em marcas visuais icônicas desde 2020",
            footer_copyright: "Todos los derechos reservados."
        }
    };

    let currentLang = localStorage.getItem('santa_lang') || 'pt';

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('santa_lang', lang);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Update active class in dropdown and trigger text
        const options = document.querySelectorAll('.lang-option');
        options.forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            const isActive = btnLang === lang;
            btn.classList.toggle('active', isActive);
            if (isActive) {
                const currentBtn = document.getElementById('langCurrent');
                if (currentBtn) {
                    currentBtn.innerText = lang.toUpperCase();
                }
            }
        });

        // Close dropdown
        const switcher = document.getElementById('langSwitcher');
        if (switcher) switcher.classList.remove('open');

        // Re-initialize animations that depend on text content
        initAboutSection();
    }

    function initLanguageSwitcher() {
        const switcher = document.getElementById('langSwitcher');
        const trigger = document.getElementById('langCurrent');
        const options = document.querySelectorAll('.lang-option');

        if (!trigger || !switcher) return;

        // Toggle dropdown on trigger click
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            switcher.classList.toggle('open');
        });

        // Select language from options
        options.forEach(btn => {
            btn.addEventListener('click', () => {
                setLanguage(btn.getAttribute('data-lang'));
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (switcher.classList.contains('open') && !switcher.contains(e.target)) {
                switcher.classList.remove('open');
            }
        });

        // Initial set
        setLanguage(currentLang);
    }

    // 8. Lightbox Gallery Logic (GSAP Optimized)
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const closeBtn = document.querySelector('.lightbox-close');
        const galleryItems = document.querySelectorAll('.gallery-item');

        if (!lightbox || !lightboxImg || !closeBtn) return;

        // Timeline base para abertura e fechamento
        const openTl = gsap.timeline({ paused: true });
        
        // Reset base properties na timeline
        openTl.to(lightbox, {
            autoAlpha: 1, // handles visibility and opacity
            duration: 0.5,
            ease: "power2.inOut"
        });
        
        openTl.fromTo(lightboxImg, 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.2)" },
            "-=0.3"
        );
        
        openTl.fromTo(lightboxCaption,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4 },
            "-=0.2"
        );

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const description = item.getAttribute('data-description');
                
                if (img) {
                    lightboxImg.src = img.src;
                    lightboxCaption.innerText = description || '';
                    
                    // Play animation
                    openTl.play();
                    document.body.style.overflow = 'hidden'; 
                }
            });
        });

        const closeLightbox = () => {
            openTl.reverse();
            document.body.style.overflowY = 'auto'; 
        };

        closeBtn.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.visibility === 'visible') {
                closeLightbox();
            }
        });
    }

    // Initialize all components safely (apenas os que NAO dependem do ScrollTrigger)
    // Os componentes com ScrollTrigger são inicializados no transitionToHero()
    try { initLanguageSwitcher(); } catch (e) { console.error('[Santa] LangSwitcher error:', e); }
    try { initProcessSlider(); } catch (e) { console.error('[Santa] Slider error:', e); }
    try { initLightbox(); } catch (e) { console.error('[Santa] Lightbox error:', e); }

});
