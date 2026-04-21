document.addEventListener("DOMContentLoaded", () => {
    // 1. Tactile Remotion Preloader Logic (Layered PNG)
    const preloader = document.getElementById('preloader');
    const body = document.body;
    const heroContent = document.querySelector('.hero-content');
    
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
            }, 1500);
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
        gsap.to(preloader, {
            opacity: 0,
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => {
                preloader.style.visibility = 'hidden';
                body.style.overflowY = 'auto'; // allow scroll
                
                // Initialize hero animations
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
                
                if (typeof initParallax === "function") {
                    initParallax();
                }
            }
        });
    }


    // 2. Parallax Logic
    function initParallax() {
        gsap.registerPlugin(ScrollTrigger);

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
                    scrub: true
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
        gsap.registerPlugin(ScrollTrigger);

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

    // Initialize all components that don't need to wait for preloader
    // Parallax is initialized after preloader finishes in transitionToHero()
    initAboutSection();
    initStatsAnimations();
    initProcessSlider();
    initFadeUpElements();

});
