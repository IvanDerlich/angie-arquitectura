/**
 * Hero Exhibition Gallery
 * Adapted from Codrops Exhibition Demo
 * https://github.com/codrops/Exhibition
 */
;(function(window) {
    'use strict';

    // Check if we're on a page with the hero exhibition
    const heroScroller = document.querySelector('.hero-scroller');
    if (!heroScroller) return;

    const DOM = {
        scroller: heroScroller,
        rooms: [].slice.call(heroScroller.querySelectorAll('.hero-room'))
    };

    const initTransform = { 
        translateX: 0, 
        translateY: 0, 
        translateZ: '500px', 
        rotateX: 0, 
        rotateY: 0, 
        rotateZ: 0 
    };

    const tiltTransition = { 
        speed: '0.2s', 
        easing: 'ease-out' 
    };

    const tiltRotation = {
        rotateX: 1,
        rotateY: -3
    };

    let tilt = false;
    let isMoving = false;
    const win = {
        width: window.innerWidth, 
        height: window.innerHeight
    };

    function init() {
        move({
            transition: { speed: '0.9s', easing: 'ease' }, 
            transform: initTransform
        }).then(function() {
            initTilt();
        });
        initEvents();
    }

    function initTilt() {
        applyRoomTransition(tiltTransition);
        tilt = true;
    }

    function move(opts) {
        return new Promise(function(resolve) {
            if (isMoving && !opts.stopTransition) {
                resolve();
                return;
            }
            isMoving = true;

            if (opts.transition) {
                applyRoomTransition(opts.transition);
            }

            if (opts.transform) {
                applyRoomTransform(opts.transform);
                const onEndFn = function() {
                    isMoving = false;
                    resolve();
                };
                onEndTransition(DOM.scroller, onEndFn);
            } else {
                resolve();
            }
        });
    }

    function initEvents() {
        const onMouseMoveFn = function(ev) {
            requestAnimationFrame(function() {
                if (!tilt) return;

                const mousepos = getMousePos(ev);
                const rotX = tiltRotation.rotateX ? 
                    initTransform.rotateX - (2 * tiltRotation.rotateX / win.height * mousepos.y - tiltRotation.rotateX) : 0;
                const rotY = tiltRotation.rotateY ? 
                    initTransform.rotateY - (2 * tiltRotation.rotateY / win.width * mousepos.x - tiltRotation.rotateY) : 0;

                applyRoomTransform({
                    'translateX': initTransform.translateX,
                    'translateY': initTransform.translateY,
                    'translateZ': initTransform.translateZ,
                    'rotateX': rotX + 'deg',
                    'rotateY': rotY + 'deg',
                    'rotateZ': initTransform.rotateZ
                });
            });
        };

        const debounceResizeFn = debounce(function() {
            win.width = window.innerWidth;
            win.height = window.innerHeight;
        }, 10);

        document.addEventListener('mousemove', onMouseMoveFn);
        window.addEventListener('resize', debounceResizeFn);
    }

    function applyRoomTransform(transform) {
        DOM.scroller.style.transform = 
            'translate3d(' + transform.translateX + ', ' + transform.translateY + ', ' + transform.translateZ + ') ' +
            'rotate3d(1,0,0,' + transform.rotateX + ') rotate3d(0,1,0,' + transform.rotateY + ') rotate3d(0,0,1,' + transform.rotateZ + ')';
    }

    function applyRoomTransition(transition) {
        DOM.scroller.style.transition = transition === 'none' ? 
            transition : 'transform ' + transition.speed + ' ' + transition.easing;
    }

    function onEndTransition(el, callback) {
        const onEndCallbackFn = function() {
            el.removeEventListener('transitionend', onEndCallbackFn);
            if (callback && typeof callback === 'function') {
                callback.call();
            }
        };
        el.addEventListener('transitionend', onEndCallbackFn);
    }

    function getMousePos(e) {
        let posx = 0;
        let posy = 0;
        if (!e) e = window.event;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        return { x: posx, y: posy };
    }

    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Preload images then initialize
    if (window.imagesLoaded) {
        imagesLoaded(DOM.scroller, function() {
            init();
        });
    } else {
        // Fallback if imagesLoaded isn't available
        window.addEventListener('load', init);
    }

})(window);
