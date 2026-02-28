/**
 * Challa Sowmya Portfolio - Script
 * Tech: Three.js, GSAP, ScrollTrigger
 */

// --- LOADER ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        initAnimations();
    }, 1500);
});

// --- VIBRANT PARTICLE CURSOR ---
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');
const particleContainer = document.getElementById('particle-container');

let mouseX = 0;
let mouseY = 0;
let dotX = 0;
let dotY = 0;
let outlineX = 0;
let outlineY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Create particles on move
    createParticle(mouseX, mouseY);
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'cursor-particle';
    particleContainer.appendChild(particle);

    const size = Math.random() * 6 + 2;
    const color = Math.random() > 0.5 ? '#00f2ff' : '#7000ff';

    gsap.set(particle, {
        x: x,
        y: y,
        width: size,
        height: size,
        backgroundColor: color,
        opacity: 0.8
    });

    gsap.to(particle, {
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        opacity: 0,
        scale: 0,
        duration: Math.random() * 1 + 0.5,
        ease: "power2.out",
        onComplete: () => particle.remove()
    });
}

function animateCursor() {
    // Smoother interpolation
    dotX += (mouseX - dotX) * 1;
    dotY += (mouseY - dotY) * 1;
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;

    gsap.set(cursorDot, { x: dotX, y: dotY });
    gsap.set(cursorOutline, { x: outlineX, y: outlineY });

    requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover Effect listeners
const interactiveElements = document.querySelectorAll('a, button, .glass-card, .skill-card, .social-icon, .project-card');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// Click animation
window.addEventListener('mousedown', () => {
    gsap.to(cursorOutline, { scale: 1.5, opacity: 0.5, duration: 0.2 });
    for (let i = 0; i < 10; i++) createParticle(mouseX, mouseY); // Burst on click
});
window.addEventListener('mouseup', () => {
    gsap.to(cursorOutline, { scale: 1, opacity: 1, duration: 0.2 });
});

// --- THREE.JS BACKGROUND ---
let scene, camera, renderer, sphere, innerSphere, particles;

function initThree() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Main Floating Object (Abstract Sphere)
    const geometry = new THREE.IcosahedronGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00f2ff,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Second floating object
    const innerGeo = new THREE.TorusGeometry(1, 0.05, 16, 100);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x7000ff, wireframe: true, transparent: true, opacity: 0.3 });
    innerSphere = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerSphere);

    // Particle Field
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 4000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.003,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    sphere.rotation.y += 0.002;
    sphere.rotation.x += 0.001;

    if (innerSphere) {
        innerSphere.rotation.x -= 0.003;
        innerSphere.rotation.y -= 0.003;
    }

    particles.rotation.y -= 0.0005;

    // Subtle float based on mouse position - Fixed variable name
    const mX = (mouseX / window.innerWidth - 0.5) * 2;
    const mY = (mouseY / window.innerHeight - 0.5) * 2;

    sphere.position.x += (mX - sphere.position.x) * 0.05;
    sphere.position.y += (-mY - sphere.position.y) * 0.05;

    if (innerSphere) {
        innerSphere.position.x += (mX * 0.5 - innerSphere.position.x) * 0.02;
        innerSphere.position.y += (-mY * 0.5 - innerSphere.position.y) * 0.02;
    }

    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GSAP ANIMATIONS ---
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Reveal
    const tl = gsap.timeline();
    tl.from('.reveal-text', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power4.out'
    });

    // Section Titles
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'back.out(1.7)'
        });
    });

    // Glass Cards Float
    gsap.utils.toArray('.glass-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
            },
            y: 100,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        });
    });

    // Skills Stagger
    gsap.from('.skill-card', {
        scrollTrigger: {
            trigger: '.skills-grid',
            start: 'top 80%',
        },
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.7)'
    });

    // Timeline Animation
    gsap.from('.timeline-item', {
        scrollTrigger: {
            trigger: '.timeline',
            start: 'top 70%',
        },
        x: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
}

// Initialize
initThree();

// Modal/Tilt logic (Simplified for Vanilla)
const cards = document.querySelectorAll('[data-tilt]');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        gsap.to(card, {
            rotationY: x * 30,
            rotationX: -y * 30,
            duration: 0.5,
            ease: 'power2.out',
            transformPerspective: 1000
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
