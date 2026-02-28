/**
 * CHALLA SOWMYA PORTFOLIO - CORE ENGINE
 * Tech: Three.js, GSAP, ScrollTrigger
 */

// --- PLUGINS ---
gsap.registerPlugin(ScrollTrigger);

// --- GLOBAL VARIABLES ---
let mouseX = 0, mouseY = 0;
let scene, camera, renderer, particles, mainMesh;

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

    // Main Floating Object (Wireframe Sphere)
    const geometry = new THREE.IcosahedronGeometry(2, 4);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00f2ff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    mainMesh = new THREE.Mesh(geometry, material);
    scene.add(mainMesh);

    // Particle Field
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Light-like behavior for sphere
    const secondaryGeo = new THREE.SphereGeometry(2.1, 4, 4);
    const secondaryMat = new THREE.MeshBasicMaterial({
        color: 0x7000ff,
        wireframe: true,
        transparent: true,
        opacity: 0.05
    });
    const secondaryMesh = new THREE.Mesh(secondaryGeo, secondaryMat);
    mainMesh.add(secondaryMesh);

    animateThree();
}

function animateThree() {
    requestAnimationFrame(animateThree);

    // Rotating Objects
    mainMesh.rotation.y += 0.001;
    mainMesh.rotation.x += 0.0005;
    particles.rotation.y -= 0.0002;

    // Mouse Influence (Floating movement)
    const mX = (mouseX / window.innerWidth - 0.5) * 2;
    const mY = (mouseY / window.innerHeight - 0.5) * 2;

    mainMesh.position.x += (mX * 0.5 - mainMesh.position.x) * 0.05;
    mainMesh.position.y += (-mY * 0.5 - mainMesh.position.y) * 0.05;

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

    // Skills Stagger
    gsap.from('.skill-card', {
        scrollTrigger: {
            trigger: '.skills-grid',
            start: 'top 80%'
        },
        scale: 0.5,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.2)'
    });
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
