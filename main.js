document.addEventListener("DOMContentLoaded", () => {
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
        // Show all fade-up elements
        document.querySelectorAll('.fade-up').forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
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

    // Create new GSAP Timeline for the Remotion style preloader
    const tl = gsap.timeline({
        onComplete: () => {
            // Start the repeating loops for continuous pulse/glow
            gsap.to(['.logo-center', '.logo-rings'], {
                scale: 1.025,
                duration: 2,
                transformOrigin: "center center",
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
                stagger: {
                    each: 0.1,
                    from: "start"
                }
            });

            gsap.to('.logo-stars', {
                opacity: 0.6,
                duration: 1.5,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });

            // Transition out preloader after loop starts
            setTimeout(() => {
                transitionToHero();
            }, 200);
        }
    });

    // Initial state: hide and prepare elements
    gsap.set('.logo-center', { scale: 0, transformOrigin: 'center center' });
    gsap.set('.logo-rings', { scale: 0, transformOrigin: 'center center', opacity: 0 });
    // Text wrappers start displaced and invisible for floating effect
    gsap.set('.text-top-wrapper', { y: -60, opacity: 0, rotation: -15, transformOrigin: 'center center' });
    gsap.set('.text-bottom-wrapper', { y: 60, opacity: 0, rotation: 15, transformOrigin: 'center center' });
    gsap.set('.logo-stars', { scale: 0.8, opacity: 0, transformOrigin: 'center center' });

    // Step 1: Central Disc emerges with a bounce
    tl.to('.logo-center', {
        scale: 1,
        duration: 0.9,
        ease: "back.out(2)"
    });

    // Step 2: Rings expanding outward
    tl.to('.logo-rings', {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
    }, "-=0.4");

    // Step 3: Text arches float in with smooth curving movements
    tl.to('.text-top-wrapper', {
        y: 0,
        opacity: 1,
        rotation: 0,
        duration: 1.2,
        ease: "power3.out"
    }, "-=0.4");

    tl.to('.text-bottom-wrapper', {
        y: 0,
        opacity: 1,
        rotation: 0,
        duration: 1.2,
        ease: "power3.out"
    }, "-=1.0");

    // Step 4: Stars gently appear (shows the full logo with an elegant glow transition)
    tl.to('.logo-stars', {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "power2.inOut"
    }, "-=0.2");

    function transitionToHero() {
        clearTimeout(safetyTimeout); // Cancel safety timeout since preloader is exiting normally
        gsap.to(preloader, {
            opacity: 0,
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => {
                preloader.style.visibility = 'hidden';
                body.style.overflowY = 'auto'; // allow scroll

                // Initialize hero animations with delay (coordinated with layer entrance)
                // We Wait until the last image is close to finishing (~3-3.5s)
                gsap.to(['.hero-content', '.language-switcher'], {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    duration: 1.5,
                    delay: 0.8, 
                    ease: "power2.out",
                    pointerEvents: "auto",
                    onStart: () => {
                        // Ensure they are visible if they had display: none or similar
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
                    opacity: 0 // Inicia invisível para o efeito de fade-in
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
                // Ao terminar a entrada, limpamos o transform para não conflitar com o parallax
                // e forçamos o ScrollTrigger a recalcular tudo (essencial para mobile)
                gsap.set(Array.from(layers).slice(1), { clearProps: "y" });
                ScrollTrigger.refresh();
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
                    invalidateOnRefresh: true // Recalcula ao redimensionar (comum em mobile)
                }
            });
        });

        // Mouse Parallax (Only Desktop)
        if (isDesktop) {
            const heroSection = document.querySelector('.hero-parallax');

            heroSection.addEventListener("mousemove", (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
                const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

                layers.forEach((layer, index) => {
                    // Reverse movement: foreground moves more than background
                    const movementX = x * (index + 1) * 8;
                    const movementY = y * (index + 1) * 8;

                    gsap.to(layer, {
                        x: movementX,
                        y: movementY,
                        duration: 1,
                        ease: "power2.out",
                        overwrite: "auto" // Only overwrite mouse movements, ScrollTrigger takes care of its own y via scrub
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

        revealTexts.forEach((text) => {
            // Kill existing ScrollTriggers on this element to avoid duplicates after language change
            ScrollTrigger.getAll().forEach(st => {
                if (st.trigger === text) st.kill();
            });

            // Split text into words, wrap in spans
            const content = text.innerText;
            const words = content.split(' ');

            // clear contents
            text.innerHTML = '';

            const wordsArray = [];
            words.forEach(word => {
                const span = document.createElement('span');
                span.className = 'word';
                span.innerText = word;
                // Add a space after each word except the last one if we want, but inline-block + margin could work.
                // An easier way is just keep it inline but preserve spaces.
                // Wait, if it's inline-block, trailing spaces inside won't work perfectly. Let's just append TextNode space.
                text.appendChild(span);
                text.appendChild(document.createTextNode(' '));
                wordsArray.push(span);
            });

            // Animate words color from grey to white over scroll
            gsap.fromTo(wordsArray,
                { color: "#333333" },
                {
                    color: "#ffffff",
                    ease: "none",
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: text,
                        start: "top 80%", // Animates when it hits the lower part of screen
                        end: "bottom 50%", // Finishes animating exactly mid-screen
                        scrub: true
                    }
                }
            );
        });
    }

    // 4. Stats Animation Logic
    function initStatsAnimations() {
        gsap.utils.toArray('.stat-line').forEach(line => {
            gsap.to(line, {
                width: '100%',
                duration: 1.5,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: line,
                    start: "top 85%"
                }
            });
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

    // Initialize all components safely
    try { initLanguageSwitcher(); } catch (e) { console.error('[Santa] LangSwitcher error:', e); }
    try { initStatsAnimations(); } catch (e) { console.error('[Santa] Stats error:', e); }
    try { initProcessSlider(); } catch (e) { console.error('[Santa] Slider error:', e); }
    try { initFadeUpElements(); } catch (e) { console.error('[Santa] FadeUp error:', e); }

});
