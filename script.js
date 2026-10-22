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
        
        // Don't prevent default for project routes
        if (href.startsWith('#/obra/')) return;
        
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

// Add loading animation for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.style.opacity = '0';
            setTimeout(() => {
                img.style.transition = 'opacity 0.3s';
                img.style.opacity = '1';
            }, 50);
        });
    });
});

// Project data store
const projectsData = {};

// Initialize project data from cards
document.querySelectorAll('.project-card.project-open').forEach(card => {
    const slug = card.dataset.slug;
    const coverImg = card.querySelector('.project-image-wrapper img').src;
    projectsData[slug] = {
        slug,
        title: card.dataset.title,
        category: card.querySelector('.project-location').textContent,
        description: card.querySelector('.project-description').textContent,
        gallery: JSON.parse(card.dataset.gallery || '[]'),
        coverImage: coverImg
    };
});

// Quick View Modal
(() => {
    const quickView = document.getElementById('quick-view');
    if (!quickView) return;
    
    const qvImage = quickView.querySelector('.quick-view-image');
    const qvTitle = quickView.querySelector('.quick-view-title');
    const qvCategory = quickView.querySelector('.quick-view-category');
    const qvDescription = quickView.querySelector('.quick-view-description');
    const qvFullBtn = quickView.querySelector('.quick-view-full');
    const qvCloseBtn = quickView.querySelector('.quick-view-close');
    const qvOverlay = quickView.querySelector('.quick-view-overlay');
    
    let currentSlug = '';
    
    const openQuickView = (card) => {
        const slug = card.dataset.slug;
        const project = projectsData[slug];
        if (!project) return;
        
        currentSlug = slug;
        qvImage.src = project.coverImage;
        qvImage.alt = project.title;
        qvTitle.textContent = project.title;
        qvCategory.textContent = project.category;
        qvDescription.textContent = project.description;
        
        quickView.hidden = false;
        document.body.style.overflow = 'hidden';
    };
    
    const closeQuickView = () => {
        quickView.hidden = true;
        document.body.style.overflow = '';
        currentSlug = '';
    };
    
    // Open quick view when clicking project card
    document.querySelectorAll('.project-card.project-open').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't open if clicking on a link that has its own action
            if (e.target.tagName === 'A' && e.target.href && !e.target.classList.contains('project-link')) {
                return;
            }
            e.preventDefault();
            openQuickView(card);
        });
    });
    
    // Navigate to full project page
    qvFullBtn.addEventListener('click', () => {
        closeQuickView();
        window.location.hash = `/obra/${currentSlug}`;
    });
    
    // Close handlers
    qvCloseBtn.addEventListener('click', closeQuickView);
    qvOverlay.addEventListener('click', closeQuickView);
    
    // Keyboard handler
    document.addEventListener('keydown', (e) => {
        if (!quickView.hidden && e.key === 'Escape') {
            closeQuickView();
        }
    });
})();

// Project gallery lightbox
(() => {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    const stage = lb.querySelector('.lightbox-stage');
    const caption = lb.querySelector('.lightbox-caption');
    let items = [], idx = 0, title = '';

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
            el.style.maxWidth = '100%';
            el.style.maxHeight = '100%';
        } else {
            el = document.createElement('img');
            el.src = src;
            el.alt = title;
        }
        stage.appendChild(el);
        caption.textContent = `${title} · ${idx + 1} / ${items.length}`;
        const multi = items.length > 1;
        lb.querySelector('.lightbox-prev').hidden = !multi;
        lb.querySelector('.lightbox-next').hidden = !multi;
    };

    window.openLightbox = (gallery, projectTitle, startIdx = 0) => {
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

    // Lightbox controls
    lb.querySelector('.lightbox-close').addEventListener('click', close);
    lb.querySelector('.lightbox-prev').addEventListener('click', () => step(-1));
    lb.querySelector('.lightbox-next').addEventListener('click', () => step(1));
    
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
})();

// SPA Router for project pages
(() => {
    const mainSections = document.querySelectorAll('section, header, footer');
    const projectView = document.getElementById('project-view');
    const projectContent = projectView.querySelector('.project-view-content');
    
    const showMainSite = () => {
        mainSections.forEach(section => section.hidden = false);
        projectView.hidden = true;
        document.title = 'Ángeles Arquitectura | Angie Serrano Squadrito - Arquitecta en Mendoza';
    };
    
    const showProjectPage = (slug) => {
        const project = projectsData[slug];
        if (!project) {
            // 404 - go home
            window.location.hash = '';
            return;
        }
        
        mainSections.forEach(section => section.hidden = true);
        projectView.hidden = false;
        document.title = `${project.title} | Ángeles Arquitectura`;
        
        // Build project page content
        const galleryHTML = project.gallery.map((src, idx) => {
            const isVideo = /\.mp4$/i.test(src);
            if (isVideo) {
                return `
                    <button type="button" class="gallery-item" onclick="window.openLightbox(${JSON.stringify(project.gallery)}, '${project.title}', ${idx})">
                        <video src="${src}" class="gallery-thumbnail"></video>
                        <div class="gallery-play-icon">▶</div>
                    </button>
                `;
            } else {
                return `
                    <button type="button" class="gallery-item" onclick="window.openLightbox(${JSON.stringify(project.gallery)}, '${project.title}', ${idx})">
                        <img src="${src}" alt="${project.title}" class="gallery-thumbnail">
                    </button>
                `;
            }
        }).join('');
        
        projectContent.innerHTML = `
            <div class="project-hero">
                <img src="${project.coverImage}" alt="${project.title}" class="project-hero-image">
            </div>
            <div class="project-info">
                <h1 class="project-page-title">${project.title}</h1>
                <p class="project-page-category">${project.category}</p>
                <div class="project-page-description">
                    <p>${project.description}</p>
                </div>
            </div>
            <div class="project-gallery-section">
                <h2 class="project-gallery-title">Galería del proyecto</h2>
                <div class="project-gallery">
                    ${galleryHTML}
                </div>
            </div>
        `;
        
        window.scrollTo(0, 0);
    };
    
    const route = () => {
        const hash = window.location.hash;
        
        if (hash.startsWith('#/obra/')) {
            const slug = hash.replace('#/obra/', '');
            showProjectPage(slug);
        } else {
            showMainSite();
            
            // Handle section scroll
            if (hash && hash.length > 1 && !hash.startsWith('#/')) {
                setTimeout(() => {
                    const target = document.querySelector(hash);
                    if (target) {
                        const headerHeight = header ? header.offsetHeight : 0;
                        const targetPosition = target.offsetTop - headerHeight;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            }
        }
    };
    
    // Handle hash changes
    window.addEventListener('hashchange', route);
    
    // Initial route
    route();
})();
