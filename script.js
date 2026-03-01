/**
 * CHALLA SOWMYA PORTFOLIO - CORE ENGINE
 * Tech: Three.js, GSAP, ScrollTrigger
 */

// --- PLUGINS ---
gsap.registerPlugin(ScrollTrigger);

// --- GLOBAL VARIABLES ---
let mouseX = 0, mouseY = 0;
let scene, camera, renderer, particles, linesMesh;

// --- LOADER ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        initGSAP(); // Start animations after load
    }, 1500);
});

// --- CUSTOM CURSOR ---
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Direct movement for the dot
    gsap.set(cursorDot, { x: mouseX, y: mouseY });

    // Smooth drag for the outline
    gsap.to(cursorOutline, {
        x: mouseX,
        y: mouseY,
        duration: 0.15,
        ease: 'power2.out'
    });
});

// Hover Effect
document.querySelectorAll('a, button, .glass-card, .menu-toggle').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// --- THREE.JS BACKGROUND ---
function initThree() {
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Particle Network (Constellation)
    const particlesCount = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const velocities = [];

    for (let i = 0; i < particlesCount; i++) {
        // Spread particles across a wide area
        positions[i * 3] = (Math.random() - 0.5) * 25;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 2;

        // Random slow velocities
        velocities.push({
            x: (Math.random() - 0.5) * 0.015,
            y: (Math.random() - 0.5) * 0.015,
            z: (Math.random() - 0.5) * 0.015
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.userData = { velocities };

    const material = new THREE.PointsMaterial({
        size: 0.06,
        color: 0x00f2ff, // Neon Cyan
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Lines for the constellation
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xb14bf4, // Neon Purple
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });

    // Create an initial empty buffer for lines
    const lineGeometry = new THREE.BufferGeometry();
    const maxConnections = particlesCount * 6; // generous buffer 
    const linePositions = new Float32Array(maxConnections * 3 * 2);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    animateThree();
}

function animateThree() {
    requestAnimationFrame(animateThree);

    // Update particles positions based on velocity
    const positions = particles.geometry.attributes.position.array;
    const velocities = particles.geometry.userData.velocities;

    for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;

        // Bounce off invisible walls
        if (Math.abs(positions[i * 3]) > 12) velocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 12) velocities[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2] + 2) > 8) velocities[i].z *= -1;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Update connecting lines based on distance
    let lineIndex = 0;
    const linePositions = linesMesh.geometry.attributes.position.array;

    for (let i = 0; i < positions.length / 3; i++) {
        for (let j = i + 1; j < positions.length / 3; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const distSq = dx * dx + dy * dy + dz * dz;

            // Connect if close enough (distance threshold)
            if (distSq < 4) {
                linePositions[lineIndex++] = positions[i * 3];
                linePositions[lineIndex++] = positions[i * 3 + 1];
                linePositions[lineIndex++] = positions[i * 3 + 2];
                linePositions[lineIndex++] = positions[j * 3];
                linePositions[lineIndex++] = positions[j * 3 + 1];
                linePositions[lineIndex++] = positions[j * 3 + 2];
            }
        }
    }

    // Zero out the rest of the array to prevent artifact lines
    for (let i = lineIndex; i < linePositions.length; i++) {
        linePositions[i] = 0;
    }

    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.setDrawRange(0, lineIndex / 3);

    // Mouse Influence - subtle rotation of the entire scene
    const mX = (mouseX / window.innerWidth - 0.5) * 2;
    const mY = (mouseY / window.innerHeight - 0.5) * 2;

    scene.rotation.x += (mY * 0.15 - scene.rotation.x) * 0.05;
    scene.rotation.y += (mX * 0.15 - scene.rotation.y) * 0.05;

    renderer.render(scene, camera);
}

// Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GSAP ANIMATIONS ---
function initGSAP() {
    // Hero Entrance
    const heroTl = gsap.timeline();
    heroTl.from('.reveal-text', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power4.out'
    });

    // Scroll Reveals
    gsap.utils.toArray('.reveal-on-scroll').forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
    });

    // Section Titles Bounce
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 90%'
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });
    });

    // Skills Stagger per category (removed to ensure cards are always visible on all devices/browsers)

    // Continuous Floating Micro-Animations (removed .skill-card to avoid transform overwrite)
    gsap.utils.toArray('.project-card-container').forEach(card => {
        gsap.to(card, {
            y: "-=15",
            rotation: () => Math.random() * 2 - 1, // subtle twist
            duration: 2.5 + Math.random(),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: Math.random() // random start offsets
        });
    });

    // Refresh ScrollTrigger to recalculate positions now that the loader is gone
    ScrollTrigger.refresh();
}

// --- 3D TILT EFFECT (VANILLA) ---
const cards = document.querySelectorAll('[data-tilt]');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        // Smooth rotation based on mouse position relative to card center
        gsap.to(card, {
            rotationY: x * 20,
            rotationX: -y * 20,
            transformPerspective: 1000,
            duration: 0.5,
            ease: 'power2.out'
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotationY: 0,
            rotationX: 0,
            duration: 0.5,
            ease: 'power2.out'
        });
    });
});

// --- MOBILE MENU ---
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// --- START ENGINE ---
initThree();
