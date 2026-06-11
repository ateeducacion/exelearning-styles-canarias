var myTheme = {
    init: function () {
        // Common functions
        if (this.inIframe()) $('body').addClass('in-iframe');
        if (!$('body').hasClass('exe-web-site')) return;
        // Add menu and search bar togglers
        var togglers =
            '\
            <button type="button" id="siteNavToggler" class="toggler" title="' +
            $exe_i18n.menu +
            '">\
                <span class="sr-av">' +
            $exe_i18n.menu +
            '</span>\
            </button>\
            <button type="button" id="searchBarTogger" class="toggler" title="' +
            $exe_i18n.search +
            '">\
                <span class="sr-av">' +
            $exe_i18n.search +
            '</span>\
            </button>\
        ';
        $('#siteNav').before(togglers);
        // Check the current NAV status
        var url = window.location.href;
        url = url.split('?');
        if (url.length > 1) {
            if (url[1].indexOf('nav=false') != -1) {
                $('body').addClass('siteNav-off');
                myTheme.params('add');
            }
        }
        // Portada page menu close default
        if ($('article:first').hasClass("portada")) {
            if (!$('body').hasClass('siteNav-off')) {
                $('body').toggleClass('siteNav-off');
            }
            $('.page-content').toggleClass('fullWidth')
        } else {
            if ($('.page-content').hasClass('fullWidth')) {
                $('.page-content').toggleClass('fullWidth')
            }
        }
        // Portada page menu close default
        if ($('article:first').hasClass("creditos")) {
            $('#siteFooter').toggleClass('noDisplay'); 
        } 
        // Click open function
        $(".goal-container").on("click", function () {
            $(this).next(".invisible-goal").slideToggle(200);
        });
        // Change SLCNP-Cover image
        var coverSLCNP = document.getElementsByClassName("SLCNP-Cover");
        for (var c = 0; c < coverSLCNP.length; c++) {
            coverSLCNP[c].src = "../theme/img/preguntav2.png"
        }
        // Change SLCNP-HistGGame image (final image)
        var finalImageHist = document.getElementsByClassName("SLCNP-HistGGame");
        for (var d = 0; d < finalImageHist.length; d++) {
            finalImageHist[d].src = "../theme/img/trofeo.png"
            console.log(finalImageHist[d].src)
        }
        // Trivia Scripts
        $('img[src*="trivial/tvltv4.png"]').each(function() {
            $(this).attr("src", "../theme/img/trivia4.png");
        });
        var triviaGameCont = document.getElementsByClassName("trivial-GameContainer")
        
        Array.from(triviaGameCont).forEach(container => {
            // Evitar ejecutar dos veces
            if (container.classList.contains("trivial-reestructurado")) return;

            const interno = container.querySelector(".trivial-Tablero");
            if (!interno) return;

            // Crear nuevo linkCont
            const linkCont = document.createElement("div");
            linkCont.className = "trivial-Board";

            // Insertarlo antes del tablero
            container.insertBefore(linkCont, interno);

            // Mover los enlaces específicos
            const enlaces = interno.querySelectorAll(
                "a.trivial-LinkFullScreen, a.trivial-LinkMinimize"
            );

            enlaces.forEach(el => linkCont.appendChild(el));

            // Marcar como procesado
            container.classList.add("trivial-reestructurado");
        });
        // Changes color work
        const EXE_THEME = {
            relate: {
                borderColors: {
                    blue: "#efb734",
                    green: "#00A300",
                    red: "#b3092f",
                }
            },
            rosco: {
                colors: {
                    black: "#505050", // Color without word definition
                    blue: "#efb734", // default color
                    green: "#00a300", // good answer
                    red: "#b3092f", // wrong answer
                    white: "#ffffff", // letter color
                    yellow: "#F2D89C", // active letter selection
                    blackl: "#333333",
                },
                radiusLetter: 22,
                canvasSize: 450 // change the rosco size
            }
        };

        // === Helpers ===
        const getByPath = (obj, path) =>
            path.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : null), obj);

        const mergeAtPath = (obj, path, patch) => {
            const keys = path.split(".");
            const last = keys.pop();
            const base = keys.reduce((o, k) => (o && o[k] != null ? o[k] : null), obj);
            if (!base || !last) return false;
            base[last] = { ...(base[last] || {}), ...(patch || {}) };
            return true;
        };

        const setKeysAtPath = (obj, path, patch) => {
            const target = getByPath(obj, path);
            if (!target || !patch) return false;
            Object.keys(patch).forEach(k => { if (patch[k] != null) target[k] = patch[k]; });
            return true;
        };

        const setValueAtPath = (obj, path, value) => {
            const keys = path.split(".");
            const last = keys.pop();
            const base = keys.reduce((o, k) => (o && o[k] != null ? o[k] : null), obj);
            if (!base || !last) return false;
            base[last] = value;
            return true;
        };

        // === ROSCO: resize real SIN perder preview (snapshot + restore) ===
        function hardResizePreserve(canvas, size) {
            if (!canvas) return false;

            let snap = null;
            try {
                snap = document.createElement("canvas");
                snap.width = canvas.width;
                snap.height = canvas.height;
                snap.getContext("2d").drawImage(canvas, 0, 0);
            } catch { }

            // Resize real (borra el canvas)
            canvas.width = size;
            canvas.height = size;

            // Restaurar lo que había (preview) escalado
            if (snap) {
                const ctx = canvas.getContext("2d");
                ctx.drawImage(snap, 0, 0, size, size);
            }
            return true;
        }

        function resizeRoscoWithPreview(size) {
            if (!window.$azquizgame || !size) return false;

            // Tamaño lógico usado por el core
            $azquizgame.mcanvas = $azquizgame.mcanvas || {};
            $azquizgame.mcanvas.width = size;
            $azquizgame.mcanvas.height = size;

            // Layout: full width + alto fijo
            document.querySelectorAll(".rosco-IDevice").forEach(w => {
                w.style.width = "100%";
                w.style.maxWidth = "100%";
            });

            // Resize real + restore preview
            document.querySelectorAll(".rosco-IDevice canvas").forEach(c => {
                c.style.width = "100%";
                c.style.maxWidth = size + "px";
                c.style.height = size + "px";
                hardResizePreserve(c, size);
            });

            // Empujón para observers internos
            try { window.dispatchEvent(new Event("resize")); } catch { }
            return true;
        }

        function patchRoscoMessagePositioning() {
            if (!window.$azquizgame || window.__exeRoscoMsgPosPatched) return false;
            window.__exeRoscoMsgPosPatched = true;

            const BASE = 360; // tamaño base del core

            const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
            const scale = () => clamp(($azquizgame?.mcanvas?.width || BASE) / BASE, 0.75, 2.0);

            const originalDrawMessage = $azquizgame.drawMessage?.bind($azquizgame);
            const originalDrawText = $azquizgame.drawText?.bind($azquizgame);

            // --- Ajuste de la caja/mensaje (Correcto/Incorrecto/Info) ---
            $azquizgame.drawMessage = function (Hit, word, pista, instance) {
                const opt = $azquizgame.options?.[instance];
                if (!opt?.ctxt) return originalDrawMessage ? originalDrawMessage(Hit, word, pista, instance) : undefined;

                const s = scale();
                const ctxt = opt.ctxt;

                const w = $azquizgame.mcanvas.width;
                const h = $azquizgame.mcanvas.height;
                const xCenter = w / 2;
                const yCenter = h / 2;

                // Mantén el font original, pero escálalo para que acompañe al canvas
                const fontPx = Math.round(18 * s);
                ctxt.font = `bold ${fontPx}px sans-serif`;

                // Escala las constantes del core
                const boxW = Math.round(277 * s);
                const boxH = Math.round(120 * s);
                const boxX = Math.round(xCenter - boxW / 2);

                // En el core está fijo en y=130; lo escalamos
                const boxY = Math.round(130 * s);

                const innerX = boxX + Math.round(13 * s);
                const innerY = yCenter - Math.round(32 * s);
                const innerW = Math.round(257 * s);
                const lineH = Math.round(24 * s);
                const radius = Math.round(8 * s);

                // Respeta colores del core (no tocamos theme aquí)
                let msg = $azquizgame.getRetroFeedMessages(Hit, instance);
                const lColor = Hit ? $azquizgame.colors.green : $azquizgame.colors.red;

                ctxt.fillStyle = $azquizgame.colors.white;
                ctxt.strokeStyle = "#DDDDDD";
                ctxt.lineWidth = Math.max(1, Math.round(2 * s));

                // Caja redondeada usando util del core
                $azquizgame.roundRect(boxX, boxY, boxW, boxH, radius, true, true, ctxt);

                ctxt.textAlig = "center";
                ctxt.textBaseline = "top";
                ctxt.fillStyle = lColor;

                // Si es pista/info: wrap dentro de la caja escalada
                if (pista) {
                    const finalText = opt.msgs.msgInformation + ": " + opt.itinerary.clueGame;
                    $azquizgame.wrapText(ctxt, finalText, innerX, innerY, innerW, lineH);
                    const p = document.querySelector(`#roscoPMessages-${instance}`);
                    if (p) p.textContent = finalText;
                    return;
                }

                // Mensaje normal centrado
                const msgW = ctxt.measureText(msg).width;
                const posX = xCenter - msgW / 2;
                const posY = opt.showSolution ? (yCenter - Math.round(10 * s)) : yCenter;

                ctxt.fillText(msg, posX, posY);

                const p = document.querySelector(`#roscoPMessages-${instance}`);
                if (p) p.textContent = msg;

                // Si muestra solución, ajusta posición del texto de solución también
                if (opt.showSolution) {
                    const sol = word;
                    $azquizgame.wrapText(ctxt, sol, boxX + Math.round(10 * s), posY + Math.round(10 * s), innerW, lineH);
                    if (p) p.textContent = msg + " " + sol;
                }

                document.querySelector(`#roscoEdReply-${instance}`)?.focus?.();
            };

            // --- Ajuste del texto simple (cuando solo muestra una línea) ---
            $azquizgame.drawText = function (texto, color, instance) {
                const opt = $azquizgame.options?.[instance];
                if (!opt?.ctxt) return originalDrawText ? originalDrawText(texto, color, instance) : undefined;

                const s = scale();
                const ctxt = opt.ctxt;

                const w = $azquizgame.mcanvas.width;
                const h = $azquizgame.mcanvas.height;
                const xCenter = w / 2;
                const yCenter = h / 2;

                const fontPx = Math.round(18 * s);
                ctxt.font = `bold ${fontPx}px sans-serif`;

                const radiusLetter = opt.radiusLetter;
                const wText = w - 7 * radiusLetter;
                const xMessage = xCenter - wText / 2;
                const yMessage = yCenter;
                const boxH = Math.round(30 * s);

                const textW = ctxt.measureText(texto).width;
                const xText = xCenter - textW / 2;

                ctxt.fillStyle = "transparent";
                ctxt.fillRect(xMessage, yMessage, wText, boxH);
                ctxt.textAlig = "center";
                ctxt.textBaseline = "top";
                ctxt.fillStyle = color;
                ctxt.fillText(texto, xText, yMessage + Math.round(3 * s));
                ctxt.closePath();

                const p = document.querySelector(`#roscoPMessages-${instance}`);
                if (p) p.textContent = texto;
            };

            return true;
        }

        // === Aplicador multi-iDevice ===
        (function applyExeTheme(theme) {
            const targets = [
                // RELATE: borderColors
                {
                    root: () => window.$eXeRelaciona,
                    kind: "setKeys",
                    path: "borderColors",
                    patch: () => theme.relate.borderColors,
                    after: (r) => {
                        if (r?.options?.length) {
                            for (let i = 0; i < r.options.length; i++) {
                                try { r.redibujarLineas(i, false); } catch { }
                            }
                        }
                    }
                },

                // ROSCO: colors
                {
                    root: () => window.$azquizgame,
                    kind: "setKeys",
                    path: "colors",
                    patch: () => theme.rosco.colors,
                    // ✅ NUEVO: repinta el rosco con los nuevos colores ANTES del snapshot/resize
                    after: (r) => {
                        try {
                            if (Array.isArray(r.options)) {
                                // Asegura que el repintado ocurre en el siguiente frame
                                // (muy importante cuando el DOM/canvas acaba de inicializarse)
                                requestAnimationFrame(() => {
                                    for (let i = 0; i < r.options.length; i++) {
                                        try { r.drawRosco(i); } catch { }
                                    }
                                });
                            }
                        } catch { }
                    }
                },

                // ROSCO: radiusLetter (valor simple)
                {
                    root: () => window.$azquizgame,
                    kind: "setValue",
                    path: "radiusLetter",
                    patch: () => theme.rosco.radiusLetter,
                    after: () => { }
                },

                // ROSCO: canvasSize (resize real preservando preview)
                {
                    root: () => window.$azquizgame,
                    kind: "custom",
                    patch: () => theme.rosco.canvasSize,
                    after: (_, __, size) => { resizeRoscoWithPreview(size); }
                },

                // ROSCO: canvas message align
                {
                    root: () => window.$azquizgame,
                    kind: "custom",
                    patch: () => true,
                    after: () => { patchRoscoMessagePositioning(); }
                },

                // (Opcional) Gamification global: borderColors
                {
                    root: () => window.$exeDevices,
                    kind: "merge",
                    path: "iDevice.gamification.colors.borderColors",
                    patch: () => theme.relate.borderColors,
                    after: () => { }
                },
            ];

            const applyOnce = () => {
                let applied = false;

                targets.forEach(t => {
                    const r = t.root();
                    if (!r) return;

                    const p = t.patch();
                    let ok = false;

                    if (t.kind === "merge") ok = mergeAtPath(r, t.path, p);
                    else if (t.kind === "setValue") ok = setValueAtPath(r, t.path, p);
                    else if (t.kind === "custom") ok = true;
                    else ok = setKeysAtPath(r, t.path, p);

                    if (ok) {
                        applied = true;
                        try { t.after?.(r, theme, p); } catch { }
                    }
                });

                return applied;
            };

            if (applyOnce()) return;

            const id = setInterval(() => { if (applyOnce()) clearInterval(id); }, 50);
            setTimeout(() => clearInterval(id), 3000); // stop infinite interval
        })(EXE_THEME);

        // Menu toggler
        $('#siteNavToggler').on('click', function () {
            if (myTheme.isLowRes()) {
                $('#exe-client-search').hide();
                if ($('body').hasClass('siteNav-off')) {
                    $('body').removeClass('siteNav-off');
                } else {
                    if ($('#siteNav').isInViewport()) {
                        $('body').addClass('siteNav-off');
                        myTheme.params('add');
                    }
                }
            } else {
                $('body').toggleClass('siteNav-off');
                myTheme.params(
                    $('body').hasClass('siteNav-off') ? 'add' : 'remove'
                );
            }
        });
        // Search bar toggler
        $('#searchBarTogger').on('click', function () {
            var bar = $('#exe-client-search');
            if (bar.is(':visible')) {
                bar.hide();
            } else {
                if (myTheme.isLowRes()) {
                    $('body').addClass('siteNav-off');
                }
                bar.show();
                $('#exe-client-search-text').focus();
            }
        });
        if (!this.inIframe()) {
            // Fixed navigation
            $('#siteNav').wrap('<div id="sidebar-nav"></div>');
            myTheme.checkNav();
            $(window).bind('resize', function () {
                myTheme.checkNav();
            });
        }
        // Search form
        this.searchForm();

        // mover .page-title dentro de .page-content
        this.movePageTitle();
    },
    inIframe: function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    },
    searchForm: function () {
        $('#exe-client-search-text').attr('class', 'form-control');
    },
    isLowRes: function () {
        return $('#siteNav').css('float') == 'none';
    },
    checkNav: function () {
        var wrapper = $('#sidebar-nav');
        var navH = $('#siteNav > ul').height(); // Menu height
        navH = navH + 50;
        if (navH < $(window).height()) wrapper.addClass('fixed');
        else wrapper.removeClass('fixed');
    },
    param: function (e, act) {
        if (act == 'add') {
            var ref = e.href;
            var con = '?';
            if (ref.indexOf('.html?') != -1) con = '&';
            var param = 'nav=false';
            if (ref.indexOf(param) == -1) {
                ref += con + param;
                e.href = ref;
            }
        } else {
            // This will remove all params
            var ref = e.href;
            ref = ref.split('?');
            e.href = ref[0];
        }
    },
    params: function (act) {
        $('.nav-buttons a').each(function () {
            myTheme.param(this, act);
        });
    },

    // function that move the h2 outside the header
    movePageTitle: function () {
        const tryMove = () => {
            const $header = $('.main-header .page-header');
            const $title = $header.find('.page-title').first();

            // Search container of content
            let $content = $('.page-content').first();
            if (!$content.length)
                $content = $('.content, main .content').first();
            if (!$content.length) $content = $('#main, #content').first();
            if (!$content.length && $header.length)
                $content = $header.nextAll(':not(header)').first();
            if (!$content.length && $header.length) $content = $header.parent();

            if ($header.length && $title.length && $content.length) {
                $content.prepend($title); // move it to the start
                return true;
            }
            return false;
        };

        if (tryMove()) return;

        const observer = new MutationObserver(() => {
            if (tryMove()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    },
    // 🔼
};

$(function () {
    myTheme.init();
});

$.fn.isInViewport = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
};
