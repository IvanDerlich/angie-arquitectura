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
        if (href.startsWith('#/obra/') || href.startsWith('#/proyecto/') || href.startsWith('#/actividad/')) return;
        
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

// Activities data store
const activitiesData = {
    'proyecto': {
        slug: 'proyecto',
        name: 'Proyecto',
        intro: '[REEMPLAZAR: intro de Proyecto]'
    },
    'direccion-de-obra': {
        slug: 'direccion-de-obra',
        name: 'Dirección de obra',
        intro: '[REEMPLAZAR: intro de Dirección de obra]'
    },
    'remodelaciones': {
        slug: 'remodelaciones',
        name: 'Remodelaciones',
        intro: '[REEMPLAZAR: intro de Remodelaciones]'
    },
    'amoblamiento': {
        slug: 'amoblamiento',
        name: 'Amoblamiento',
        intro: '[REEMPLAZAR: intro de Amoblamiento]'
    }
};

// Work-Activities join table (many-to-many relationship)
// Each entry describes what she did in that activity for that work
const workActivities = [
    // Example: { workSlug: 'bano', activitySlug: 'actividad-1', text: 'Diseñé la distribución...' }
    // [REEMPLAZAR: agregar entradas reales]
];

// Initialize project data from cards
document.querySelectorAll('.project-card').forEach(card => {
    const slug = card.dataset.slug;
    const coverImg = card.querySelector('.project-image-wrapper img').src;
    projectsData[slug] = {
        slug,
        type: card.dataset.type || 'proyecto', // 'obra' or 'proyecto'
        title: card.dataset.title,
        category: card.dataset.category || card.querySelector('.project-location')?.textContent || '',
        location: card.dataset.location || '',
        description: card.dataset.description || card.querySelector('.project-description')?.textContent || '',
        gallery: JSON.parse(card.dataset.gallery || '[]'),
        design: card.dataset.design ? JSON.parse(card.dataset.design) : null,
        real: card.dataset.real ? JSON.parse(card.dataset.real) : null,
        coverImage: coverImg
    };
});

// Render activities grid
(() => {
    const activitiesGrid = document.getElementById('actividades-grid');
    if (!activitiesGrid) return;
    
    Object.values(activitiesData).forEach((activity, index) => {
        const card = document.createElement('article');
        card.className = 'actividad-card';
        card.dataset.slug = activity.slug;
        
        const icon = document.createElement('div');
        icon.className = 'actividad-icon';
        icon.textContent = (index + 1).toString();
        
        const title = document.createElement('h3');
        title.className = 'actividad-title';
        title.textContent = activity.name;
        
        const intro = document.createElement('p');
        intro.className = 'actividad-description';
        intro.textContent = activity.intro;
        
        // Find works for this activity from join table
        const relatedWorks = workActivities.filter(wa => wa.activitySlug === activity.slug);
        
        const worksLabel = document.createElement('p');
        worksLabel.className = 'actividad-works';
        worksLabel.textContent = relatedWorks.length > 0 
            ? 'Aplicada en:' 
            : '[REEMPLAZAR: obras donde la aplicó]';
        
        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(intro);
        card.appendChild(worksLabel);
        
        if (relatedWorks.length > 0) {
            const worksList = document.createElement('ul');
            worksList.className = 'actividad-works-list';
            
            relatedWorks.forEach(wa => {
                const work = projectsData[wa.workSlug];
                if (work) {
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.className = 'actividad-work-link';
                    link.href = `#/${work.type}/${wa.workSlug}`;
                    link.textContent = work.title;
                    li.appendChild(link);
                    worksList.appendChild(li);
                }
            });
            
            card.appendChild(worksList);
        }
        
        // Click handler for activity card
        card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'A') {
                window.location.hash = `/actividad/${activity.slug}`;
            }
        });
        
        activitiesGrid.appendChild(card);
    });
})();

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
    let currentType = 'proyecto';
    
    const openQuickView = (card) => {
        const slug = card.dataset.slug;
        const project = projectsData[slug];
        if (!project) return;
        
        currentSlug = slug;
        currentType = project.type;
        qvImage.src = project.coverImage;
        qvImage.alt = project.title;
        qvTitle.textContent = project.title;
        qvCategory.textContent = `${project.category} · ${project.location}`;
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
    document.querySelectorAll('.project-card').forEach(card => {
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
        // Capture values before closing
        const targetSlug = currentSlug;
        const targetType = currentType;
        closeQuickView();
        window.location.hash = `/${targetType}/${targetSlug}`;
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
            // Add poster frame
            const posterSrc = src.replace('.mp4', '-poster.jpg');
            el.poster = posterSrc;
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
        activityView.hidden = true;
        document.title = 'Ángeles Arquitectura | Angie Serrano Squadrito - Arquitecta en Mendoza';
    };
    
    const activityView = document.getElementById('activity-view');
    const activityContent = activityView.querySelector('.activity-view-content');
    
    const showActivityPage = (slug) => {
        const activity = activitiesData[slug];
        if (!activity) {
            // 404 - go home
            window.location.hash = '';
            return;
        }
        
        mainSections.forEach(section => section.hidden = true);
        projectView.hidden = true;
        activityView.hidden = false;
        document.title = `${activity.name} | Ángeles Arquitectura`;
        
        let html = `
            <h1 class="activity-page-title">${activity.name}</h1>
            <p class="activity-page-description">${activity.intro}</p>
        `;
        
        // Find works for this activity from join table
        const relatedWorks = workActivities.filter(wa => wa.activitySlug === slug);
        
        if (relatedWorks.length > 0) {
            html += `
                <div class="activity-works-section">
                    <h3>Aplicada en estos proyectos:</h3>
                    <div class="activity-works-grid">
            `;
            
            relatedWorks.forEach(wa => {
                const work = projectsData[wa.workSlug];
                if (work) {
                    html += `
                        <a href="#/${work.type}/${wa.workSlug}" class="activity-work-card">
                            <h4>${work.title}</h4>
                            <p class="activity-work-text">${wa.text}</p>
                        </a>
                    `;
                }
            });
            
            html += `
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="activity-works-section">
                    <p class="activity-page-description">[REEMPLAZAR: obras donde la aplicó]</p>
                </div>
            `;
        }
        
        activityContent.innerHTML = html;
        window.scrollTo(0, 0);
    };
    
    const showProjectPage = (slug, type) => {
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
                const posterSrc = src.replace('.mp4', '-poster.jpg');
                return `
                    <button type="button" class="gallery-item" data-idx="${idx}">
                        <video src="${src}" poster="${posterSrc}" class="gallery-thumbnail"></video>
                        <div class="gallery-play-icon">▶</div>
                    </button>
                `;
            } else {
                return `
                    <button type="button" class="gallery-item" data-idx="${idx}">
                        <img src="${src}" alt="${project.title}" class="gallery-thumbnail">
                    </button>
                `;
            }
        }).join('');
        
        // Build "Diseño → Resultado real" section if both design and real photos exist
        let designRealHTML = '';
        if (project.design && project.real) {
            const designItemsHTML = project.design.map((src, idx) => {
                return `
                    <button type="button" class="gallery-item design-item" data-idx="${idx}">
                        <img src="${src}" alt="${project.title} - Diseño" class="gallery-thumbnail">
                    </button>
                `;
            }).join('');
            
            const realItemsHTML = project.real.map((src, idx) => {
                return `
                    <button type="button" class="gallery-item real-item" data-idx="${idx}">
                        <img src="${src}" alt="${project.title} - Resultado real" class="gallery-thumbnail">
                    </button>
                `;
            }).join('');
            
            designRealHTML = `
                <div class="project-comparison-section">
                    <h2 class="project-section-title">Diseño → Resultado real</h2>
                    <div class="project-comparison-grid">
                        <div class="project-comparison-column">
                            <h3 class="project-comparison-subtitle">Renders del diseño</h3>
                            <div class="project-gallery">
                                ${designItemsHTML}
                            </div>
                        </div>
                        <div class="project-comparison-column">
                            <h3 class="project-comparison-subtitle">Fotos del resultado</h3>
                            <div class="project-gallery">
                                ${realItemsHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        const backLink = type === 'obra' ? '#obras' : '#proyectos';
        const backText = type === 'obra' ? 'Volver a obras' : 'Volver a proyectos';
        
        projectContent.innerHTML = `
            <div class="project-hero">
                <img src="${project.coverImage}" alt="${project.title}" class="project-hero-image">
            </div>
            <div class="project-info">
                <h1 class="project-page-title">${project.title}</h1>
                <p class="project-page-category">${project.category} · ${project.location}</p>
                <div class="project-page-description">
                    <p>${project.description}</p>
                </div>
            </div>
            ${designRealHTML}
            <div class="project-gallery-section">
                <h2 class="project-gallery-title">Galería completa</h2>
                <div class="project-gallery">
                    ${galleryHTML}
                </div>
            </div>
            <div class="project-back-link">
                <a href="${backLink}" class="btn btn-secondary">${backText}</a>
            </div>
        `;
        
        // Add activities section using join table
        const projectActivities = workActivities.filter(wa => wa.workSlug === slug);
        
        if (projectActivities.length > 0) {
            projectContent.innerHTML += `
                <div class="project-activities">
                    <h3>Actividades en este trabajo</h3>
                    <ul class="project-activities-list">
                        ${projectActivities.map(wa => {
                            const activity = activitiesData[wa.activitySlug];
                            if (!activity) return '';
                            return `
                                <li>
                                    <a href="#/actividad/${wa.activitySlug}" class="project-activity-link">
                                        <strong>${activity.name}</strong>
                                        <span class="project-activity-text">${wa.text}</span>
                                    </a>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </div>
            `;
        } else {
            projectContent.innerHTML += `
                <div class="project-activities">
                    <h3>Actividades en este trabajo</h3>
                    <p>[REEMPLAZAR: actividades de este trabajo]</p>
                </div>
            `;
        }
        
        projectView.querySelector('.project-back').href = backLink;
        projectView.querySelector('.project-back').textContent = `← ${backText}`;
        
        // Add event listeners for gallery items
        setTimeout(() => {
            // Main gallery
            document.querySelectorAll('.project-gallery .gallery-item:not(.design-item):not(.real-item)').forEach(item => {
                item.addEventListener('click', () => {
                    const idx = parseInt(item.dataset.idx);
                    window.openLightbox(project.gallery, project.title, idx);
                });
            });
            
            // Design gallery
            document.querySelectorAll('.project-gallery .gallery-item.design-item').forEach(item => {
                item.addEventListener('click', () => {
                    const idx = parseInt(item.dataset.idx);
                    window.openLightbox(project.design, `${project.title} - Diseño`, idx);
                });
            });
            
            // Real photos gallery
            document.querySelectorAll('.project-gallery .gallery-item.real-item').forEach(item => {
                item.addEventListener('click', () => {
                    const idx = parseInt(item.dataset.idx);
                    window.openLightbox(project.real, `${project.title} - Resultado real`, idx);
                });
            });
        }, 0);
        
        window.scrollTo(0, 0);
    };
    
    const route = () => {
        const hash = window.location.hash;
        
        if (hash.startsWith('#/obra/')) {
            const slug = hash.replace('#/obra/', '');
            showProjectPage(slug, 'obra');
        } else if (hash.startsWith('#/proyecto/')) {
            const slug = hash.replace('#/proyecto/', '');
            showProjectPage(slug, 'proyecto');
        } else if (hash.startsWith('#/actividad/')) {
            const slug = hash.replace('#/actividad/', '');
            showActivityPage(slug);
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
