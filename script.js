// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const nav = document.getElementById('nav');

if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Close mobile menu when clicking on a nav link
    const navLinks = nav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            nav.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenuBtn.classList.remove('active');
            nav.classList.remove('active');
        }
    });
}

// Header scroll effect
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 2px 8px rgba(47, 74, 99, 0.08)';
    } else {
        header.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Contact Form Handler
const contactForm = document.getElementById('contacto-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const mensaje = document.getElementById('mensaje').value;
        
        // Create WhatsApp message
        const whatsappMessage = `Hola Angie, soy ${nombre}.%0A%0A${mensaje}%0A%0AMi email es: ${email}`;
        const whatsappUrl = `https://wa.me/542617685148?text=${whatsappMessage}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Show confirmation
        alert('Te voy a redirigir a WhatsApp para enviar tu consulta.');
        
        // Reset form
        contactForm.reset();
    });
}

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Don't prevent default for just "#"
        if (href === '#') return;
        
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Project gallery lightbox
document.addEventListener('DOMContentLoaded', () => {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    
    const stage = lb.querySelector('.lightbox-stage');
    const caption = lb.querySelector('.lightbox-caption');
    const closeBtn = lb.querySelector('.lightbox-close');
    const prevBtn = lb.querySelector('.lightbox-prev');
    const nextBtn = lb.querySelector('.lightbox-next');
    
    let items = [];
    let idx = 0;
    let title = '';

    const render = () => {
        stage.innerHTML = '';
        const src = items[idx];
        let el;
        
        if (/\.mp4$/i.test(src)) {
            el = document.createElement('video');
            el.src = src;
            el.controls = true;
            el.playsInline = true;
            el.preload = 'metadata';
        } else {
            el = document.createElement('img');
            el.src = src;
            el.alt = title;
        }
        
        stage.appendChild(el);
        caption.textContent = `${title} · ${idx + 1} / ${items.length}`;
        
        const multi = items.length > 1;
        prevBtn.hidden = !multi;
        nextBtn.hidden = !multi;
    };

    const open = (gallery, projectTitle, startIdx = 0) => {
        items = gallery;
        if (!items.length) return;
        title = projectTitle;
        idx = startIdx;
        lb.hidden = false;
        document.body.style.overflow = 'hidden';
        render();
    };

    const close = () => {
        lb.hidden = true;
        stage.innerHTML = '';
        document.body.style.overflow = '';
    };

    const step = (d) => {
        idx = (idx + d + items.length) % items.length;
        render();
    };

    // Make project cards open lightbox
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't open if clicking on a link with its own href
            if (e.target.tagName === 'A' && e.target.href && e.target.href !== '#') {
                return;
            }
            
            e.preventDefault();
            const gallery = JSON.parse(card.dataset.gallery || '[]');
            const projectTitle = card.dataset.title || '';
            open(gallery, projectTitle, 0);
        });
    });

    // Lightbox controls
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    
    // Click outside to close
    lb.addEventListener('click', (e) => {
        if (e.target === lb || e.target === stage) {
            close();
        }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (lb.hidden) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
    });
});
