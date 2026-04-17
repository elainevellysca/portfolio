document.addEventListener("DOMContentLoaded", () => {
    const camera = document.getElementById('cameraScreen');
    const flash = document.querySelector('.flash-overlay');
    const dotNav = document.getElementById('dotNav');
    const dots = document.querySelectorAll('.dot');
    const sections = document.querySelectorAll('.section');

    let fired = false;
    let currentSection = 0;
    const totalSections = sections.length;

    // =========================================
    // 1. SECTION NAVIGATION
    // =========================================
    function goToSection(index) {
        if (index < 0 || index >= totalSections) return;

        // On mobile, sections live in a horizontal deck — scroll body horizontally
        if (window.matchMedia('(max-width: 900px)').matches) {
            sections.forEach(s => s.classList.remove('hidden'));
            const targetX = index * window.innerWidth;
            document.body.scrollTo({ left: targetX, top: 0, behavior: 'smooth' });
            currentSection = index;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSection));

            // Trigger bio typing when About card becomes active
            if (index === 1 && !bioTyped) {
                bioTyped = true;
                const bioLines = document.querySelectorAll('.bio-line');
                let cumulativeDelay = 200;
                bioLines.forEach(line => {
                    typeNote(line, cumulativeDelay);
                    cumulativeDelay += (line.dataset.text.length * 15) + 200;
                });
            }
            return;
        }

        sections[currentSection].classList.add('hidden');
        currentSection = index;
        sections[currentSection].classList.remove('hidden');
        sections[currentSection].style.animation = 'sectionSlideIn 0.5s cubic-bezier(0.2,0.8,0.2,1) forwards';
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSection));

        if (index === 1) {
            const bioLines = document.querySelectorAll('.bio-line');
            if (bioLines.length > 0 && !bioLines[0].classList.contains('typing')) {
                let cumulativeDelay = 400;
                bioLines.forEach(line => {
                    typeNote(line, cumulativeDelay);
                    cumulativeDelay += (line.dataset.text.length * 15) + 200;
                });
            }
        }
    }

    let bioTyped = false;

    dots.forEach(dot => dot.addEventListener('click', () => goToSection(parseInt(dot.dataset.index))));

    document.addEventListener('keydown', e => {
        if (dotNav.classList.contains('hidden')) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goToSection(currentSection + 1);
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goToSection(currentSection - 1);
    });

    let touchStartY = 0;
    const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

    document.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
    document.addEventListener('touchend', e => {
        if (dotNav.classList.contains('hidden')) return;
        if (isMobile()) return; // let natural scroll work on mobile
        const dy = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(dy) > 50) goToSection(dy > 0 ? currentSection + 1 : currentSection - 1);
    }, { passive: true });

    let scrollCooldown = false;
    document.addEventListener('wheel', e => {
        if (dotNav.classList.contains('hidden')) return;
        if (isMobile()) return; // natural scroll handles it on mobile
        if (scrollCooldown) return;
        scrollCooldown = true;
        goToSection(e.deltaY > 0 ? currentSection + 1 : currentSection - 1);
        setTimeout(() => { scrollCooldown = false; }, 800);
    }, { passive: true });

    const scrollCta = document.getElementById('scrollCta');
    if (scrollCta) scrollCta.addEventListener('click', () => goToSection(currentSection + 1));

    // =========================================
    // 2. TYPEWRITER
    // =========================================
    function typeNote(el, delay) {
        const text = el.dataset.text || '';
        let i = 0;
        el.textContent = '';
        setTimeout(() => {
            el.classList.add('typing');
            const tick = () => {
                if (i >= text.length) return;
                el.textContent = text.slice(0, i + 1);
                i++;
                setTimeout(tick, 10 + Math.random() * 10);
            };
            tick();
        }, delay);
    }

    // =========================================
    // 3. PARALLAX
    // =========================================
    function initParallax() {
        if (window.matchMedia('(max-width: 768px)').matches) return;
        [document.getElementById('introScreen'), document.getElementById('aboutScreen')].forEach(screen => {
            if (!screen) return;
            const elements = screen.querySelectorAll('.float-el,.float-el-fast,.float-el-slow,.float-el-reverse,.note,.portrait-img,.big-name,.about-title,.about-large,.about-small');
            screen.addEventListener('mousemove', e => {
                const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
                const dx = e.clientX - cx, dy = e.clientY - cy;
                elements.forEach(el => {
                    let m = 0.005;
                    if (el.classList.contains('float-el-fast')) m = 0.01;
                    if (el.classList.contains('float-el-slow')) m = -0.0025;
                    if (el.classList.contains('float-el-reverse')) m = -0.006;
                    if (el.classList.contains('note-1')) m = 0.015;
                    if (el.classList.contains('note-2')) m = -0.01;
                    if (el.classList.contains('note-3')) m = 0.02;
                    if (el.classList.contains('portrait-img')) m = -0.008;
                    if (el.classList.contains('big-name')) m = 0.004;
                    el.style.setProperty('--px', `${dx * m}px`);
                    el.style.setProperty('--py', `${dy * m}px`);
                });
            });
            screen.addEventListener('mouseleave', () => {
                elements.forEach(el => { el.style.setProperty('--px','0px'); el.style.setProperty('--py','0px'); });
            });
        });
    }

    // =========================================
    // 4. EXPERIENCE BUTTONS
    // =========================================
    const expBtns = document.querySelectorAll('.exp-sticker');
    const expPanels = document.querySelectorAll('.exp-panel');
    const expScreen = document.getElementById('experienceScreen');

    expBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.exp;

            expBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            expPanels.forEach(p => {
                p.classList.remove('active');
                p.classList.add('hidden');
            });

            const targetPanel = document.getElementById(`panel-${target}`);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                requestAnimationFrame(() => requestAnimationFrame(() => targetPanel.classList.add('active')));
            }

            if (expScreen) expScreen.dataset.active = target;

            // On mobile, scroll the section back to top so user sees the new panel from the top
            if (window.matchMedia('(max-width: 900px)').matches) {
                expScreen.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    if (expScreen) expScreen.dataset.active = '1';

    // =========================================
    // 5. CAMERA SEQUENCE
    // =========================================
    function playShutter() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const bufferSize = Math.floor(ctx.sampleRate * 0.07);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                const t = i / bufferSize;
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2);
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.8, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1200;
            filter.Q.value = 0.8;
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start();
        } catch (e) {}
    }

    function shakeCamera() {
        const img = camera.querySelector('.camera-img');
        img.classList.remove('camera-shake');
        void img.offsetWidth;
        img.classList.add('camera-shake');
    }

    function ejectPolaroid() {
        return new Promise(resolve => {
            const camImg = camera.querySelector('.camera-img');
            const rect = camImg.getBoundingClientRect();
            const pw = 110, ph = 130;
            const polaroid = document.createElement('div');
            polaroid.style.cssText = `position:fixed;width:${pw}px;height:${ph}px;left:${rect.left+rect.width/2-pw/2}px;top:${rect.bottom-20}px;z-index:20;pointer-events:none;background:#fff;border-radius:3px;box-shadow:0 4px 16px rgba(0,0,0,.18);padding:7px 7px 28px 7px;box-sizing:border-box;transform:translateY(0) rotate(-2deg);opacity:1;transition:none;`;
            const photoArea = document.createElement('div');
            photoArea.style.cssText = `width:100%;height:100%;background:#e8e0d8;border-radius:2px;overflow:hidden;position:relative;`;
            const img = document.createElement('img');
            img.src = 'elaine.png';
            img.style.cssText = `width:100%;height:100%;object-fit:cover;object-position:center 5%;display:block;`;
            const overlay = document.createElement('div');
            overlay.style.cssText = `position:absolute;inset:0;background:rgba(220,190,160,.15);mix-blend-mode:multiply;`;
            photoArea.appendChild(img);
            photoArea.appendChild(overlay);
            polaroid.appendChild(photoArea);
            document.body.appendChild(polaroid);

            requestAnimationFrame(() => {
                setTimeout(() => {
                    polaroid.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
                    polaroid.style.transform = 'translateY(90px) rotate(5deg)';
                    setTimeout(() => {
                        polaroid.style.transition = 'transform .55s ease-in,opacity .45s ease-in';
                        polaroid.style.transform = 'translateY(200px) rotate(9deg)';
                        polaroid.style.opacity = '0';
                        setTimeout(() => { polaroid.remove(); resolve(); }, 560);
                    }, 510);
                }, 16);
            });
        });
    }

    function showIntro() {
        camera.classList.add('hidden');
        const mobile = window.matchMedia('(max-width: 900px)').matches;

        if (mobile) {
            // Activate the horizontal deck — body becomes a snap scroll container
            document.body.classList.add('deck-mode');
            sections.forEach(s => s.classList.remove('hidden'));
            // Reset scroll to first card, THEN fade in deck after layout has fully settled
            requestAnimationFrame(() => {
                document.body.scrollLeft = 0;
                requestAnimationFrame(() => {
                    document.body.scrollLeft = 0;
                    // Wait one more frame for snap to engage, then reveal the deck
                    requestAnimationFrame(() => {
                        document.body.classList.add('deck-ready');
                        // On mobile, portrait is revealed AFTER all 3 notes finish typing
                        setTimeout(() => {
                            if (portraitImg) portraitImg.classList.add('ready');
                        }, 2700);
                    });
                });
            });
        } else {
            sections[0].classList.remove('hidden');
            if (portraitImg) portraitImg.classList.add('ready');
        }

        dotNav.classList.remove('hidden');
        document.querySelectorAll('.note').forEach((note, i) => typeNote(note, 600 + i * 800));
        initParallax();
        if (mobile) initMobileDeckObserver();
    }

    // =========================================
    // MOBILE DECK OBSERVER — track which card is centered horizontally
    // =========================================
    function initMobileDeckObserver() {
        // Use scroll listener on body for reliable tracking during fast swipes
        let scrollTimeout;
        document.body.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const idx = Math.round(document.body.scrollLeft / window.innerWidth);
                if (idx >= 0 && idx < totalSections && idx !== currentSection) {
                    currentSection = idx;
                    dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));

                    // Trigger bio typing when About card lands
                    if (idx === 1 && !bioTyped) {
                        bioTyped = true;
                        const bioLines = document.querySelectorAll('.bio-line');
                        let cumulativeDelay = 200;
                        bioLines.forEach(line => {
                            typeNote(line, cumulativeDelay);
                            cumulativeDelay += (line.dataset.text.length * 15) + 200;
                        });
                    }
                }
            }, 80);
        }, { passive: true });
    }

    // Decode the actual DOM portrait img so it appears fully formed when intro reveals it
    // (decoding a cloned Image() doesn't help — only decoding the real element forces full paint)
    const portraitImg = document.querySelector('.portrait-img');
    let portraitReady = false;

    function ensurePortraitDecoded() {
        if (!portraitImg) { portraitReady = true; return; }
        const finish = () => { portraitReady = true; };
        const tryDecode = () => {
            if (portraitImg.decode) {
                portraitImg.decode().then(finish).catch(finish);
            } else {
                if (portraitImg.complete && portraitImg.naturalWidth > 0) finish();
                else {
                    portraitImg.addEventListener('load', finish, { once: true });
                    portraitImg.addEventListener('error', finish, { once: true });
                }
            }
        };
        if (portraitImg.complete && portraitImg.naturalWidth > 0) {
            tryDecode();
        } else {
            portraitImg.addEventListener('load', tryDecode, { once: true });
            portraitImg.addEventListener('error', finish, { once: true });
        }
    }
    ensurePortraitDecoded();

    function triggerFlash() {
        if (fired) return;
        fired = true;
        playShutter();
        shakeCamera();
        ejectPolaroid().then(() => {
            flash.style.animation = 'none';
            void flash.offsetWidth;
            flash.style.animation = 'flashEffect .8s ease-out forwards';
            // Wait for portrait to be fully decoded before revealing the intro
            const reveal = () => setTimeout(showIntro, 150);
            if (portraitReady) {
                reveal();
            } else {
                const wait = setInterval(() => {
                    if (portraitReady) {
                        clearInterval(wait);
                        reveal();
                    }
                }, 50);
                // Failsafe: never wait more than 2s
                setTimeout(() => { clearInterval(wait); reveal(); }, 2000);
            }
        });
    }

    camera.addEventListener('animationend', e => { if (e.animationName === 'slideUp') setTimeout(triggerFlash, 600); });
    camera.addEventListener('click', triggerFlash);

    // Resize handler — keep section visibility synced if user resizes mobile <-> desktop
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (dotNav.classList.contains('hidden')) return;
            const mobile = window.matchMedia('(max-width: 900px)').matches;
            if (mobile) {
                document.body.classList.add('deck-mode');
                sections.forEach(s => s.classList.remove('hidden'));
                if (!bioTyped) initMobileDeckObserver();
            } else {
                document.body.classList.remove('deck-mode');
                sections.forEach((s, i) => {
                    if (i === currentSection) s.classList.remove('hidden');
                    else s.classList.add('hidden');
                });
            }
        }, 200);
    });
});