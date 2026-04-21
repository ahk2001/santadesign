document.addEventListener("DOMContentLoaded", () => {
    // 1. Preloader logic
    const preloader = document.getElementById('preloader');
    const body = document.body;
    const heroContent = document.querySelector('.hero-content');

    // Simulate load time for glitch effect to show off
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.visibility = 'hidden';
            body.style.overflowY = 'auto'; // allow scrolling now
            
            // Fade in and translate content up
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
            
            // Initialize Parallax
            initParallax();
        }, 1000); // Wait for fade out transition in CSS
    }, 2500); // Glitch shows for 2.5 seconds


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
});
