
        // Header chrome
        (function () {
            var burger = document.getElementById('pcsBurger'), mob = document.getElementById('pcsMobile');
            if (burger) { burger.addEventListener('click', function () { var o = mob.classList.toggle('open'); burger.setAttribute('aria-expanded', o); }); mob.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mob.classList.remove('open'); }); }); }
        })();

        // ===== Color Picker core (preserved logic) =====
        (function () {
            'use strict';
            var toast = document.getElementById('cpToast'), toastTimer;
            function showToast(msg, dur) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, dur || 2000); }

            function hexToRgb(hex) { return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) }; }
            function rgbToHex(r, g, b) { return '#' + [r, g, b].map(function (v) { return v.toString(16).padStart(2, '0'); }).join('').toUpperCase(); }
            function rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; var max = Math.max(r, g, b), min = Math.min(r, g, b); var h, s, l = (max + min) / 2; if (max === min) { h = s = 0; } else { var d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; default: h = ((r - g) / d + 4) / 6; } } return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }; }
            function rgbToHsv(r, g, b) { r /= 255; g /= 255; b /= 255; var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min; var h, s = max === 0 ? 0 : d / max, v = max; if (max === min) { h = 0; } else { switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; default: h = ((r - g) / d + 4) / 6; } } return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }; }
            function luminance(r, g, b) { var a = [r, g, b].map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; }
            function contrastRatio(l1, l2) { var lighter = Math.max(l1, l2), darker = Math.min(l1, l2); return (lighter + .05) / (darker + .05); }
            function hslToHex(h, s, l) { h /= 360; s /= 100; l /= 100; var r, g, b; if (s === 0) { r = g = b = l; } else { function hue2rgb(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; } var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3); } return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)); }

            var currentHex = '#F59E0B', currentPalMode = 'complementary', history = [], MAX_HIST = 12, favorites = [];
            try { favorites = JSON.parse(localStorage.getItem('cp_favorites') || '[]'); } catch (e) { }

            function applyColor(hex, addHistory) {
                hex = hex.toUpperCase(); if (!/^#[0-9A-F]{6}$/.test(hex)) return; currentHex = hex;
                var rgb = hexToRgb(hex), r = rgb.r, g = rgb.g, b = rgb.b;
                var hsl = rgbToHsl(r, g, b), hsv = rgbToHsv(r, g, b), lum = luminance(r, g, b);
                var contrastW = contrastRatio(lum, luminance(255, 255, 255)), contrastB = contrastRatio(lum, luminance(0, 0, 0));
                document.getElementById('cpPreview').style.background = hex;
                document.getElementById('cpPreviewHex').textContent = hex;
                document.getElementById('cpPreviewHex').style.color = lum > .4 ? '#1F2937' : '#fff';
                document.getElementById('cpColorInput').value = hex; document.getElementById('cpHexInput').value = hex;
                document.getElementById('fmtHex').textContent = hex;
                document.getElementById('fmtRgb').textContent = 'rgb(' + r + ', ' + g + ', ' + b + ')';
                document.getElementById('fmtHsl').textContent = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
                document.getElementById('fmtHsv').textContent = 'hsv(' + hsv.h + ', ' + hsv.s + '%, ' + hsv.v + '%)';
                document.getElementById('fmtRgb1').textContent = 'rgb(' + [r, g, b].map(function (v) { return (v / 255).toFixed(2); }).join(', ') + ')';
                var ctx2 = document.createElement('canvas').getContext('2d'); ctx2.fillStyle = hex; ctx2.fillRect(0, 0, 1, 1);
                document.getElementById('fmtCssName').textContent = ctx2.fillStyle !== hex.toLowerCase() ? ctx2.fillStyle : '\u2013';
                document.getElementById('cpLuminance').textContent = lum.toFixed(3);
                var aaEl = document.getElementById('cpContrastAA'), aaaEl = document.getElementById('cpContrastAAA');
                aaEl.textContent = 'AA ' + (contrastW >= 4.5 ? '\u2713' : '\u2717') + ' ' + contrastW.toFixed(1) + ':1'; aaEl.className = 'cp-contrast-badge ' + (contrastW >= 4.5 ? 'cp-badge-pass' : 'cp-badge-fail');
                aaaEl.textContent = 'AAA ' + (contrastB >= 7 ? '\u2713' : '\u2717') + ' ' + contrastB.toFixed(1) + ':1'; aaaEl.className = 'cp-contrast-badge ' + (contrastB >= 7 ? 'cp-badge-pass' : 'cp-badge-fail');
                renderShades(hsl.h, hsl.s);
                renderPalette(currentPalMode, hsl.h, hsl.s, hsl.l);
                document.getElementById('cpGrad1').value = hex; updateGradient();
                if (addHistory !== false) { history = [hex].concat(history.filter(function (c) { return c !== hex; })).slice(0, MAX_HIST); renderHistory(); }
            }

            function renderShades(h, s) { var row = document.getElementById('cpShadesRow'); row.innerHTML = ''; [95, 85, 75, 65, 55, 45, 35, 25, 15].forEach(function (l) { var sw = document.createElement('div'); sw.className = 'cp-shade-swatch'; var hex = hslToHex(h, s, l); sw.style.background = hex; sw.title = hex; sw.addEventListener('click', function () { applyColor(hex); showToast('Color picked: ' + hex); }); row.appendChild(sw); }); }

            function renderPalette(mode, h, s, l) {
                var grid = document.getElementById('cpPaletteGrid'); grid.innerHTML = ''; var colors = [];
                switch (mode) {
                    case 'complementary': colors = [[h, s, l], [h, s * .8, l * 1.15], [h, s * .6, l * .8], [(h + 180) % 360, s, l], [(h + 180) % 360, s * .8, l * 1.15], [(h + 180) % 360, s * .6, l * .8]]; break;
                    case 'analogous': colors = [[-30], [-15], [0], [15], [30]].map(function (x) { return [(h + x[0] + 360) % 360, s, l]; }); break;
                    case 'triadic': colors = [[h, s, l], [h, s * .7, l * 1.1], [(h + 120) % 360, s, l], [(h + 120) % 360, s * .7, l * 1.1], [(h + 240) % 360, s, l], [(h + 240) % 360, s * .7, l * 1.1]]; break;
                    case 'split': colors = [[h, s, l], [(h + 150) % 360, s, l], [(h + 150) % 360, s * .7, l * 1.1], [(h + 210) % 360, s, l], [(h + 210) % 360, s * .7, l * 1.1], [h, s * .7, l * 1.2]]; break;
                    case 'mono': colors = [[h, s, 95], [h, s, 80], [h, s, 65], [h, s, 50], [h, s, 35], [h, s, 20]]; break;
                    default: colors = [[h, s, l]];
                }
                colors.forEach(function (c) { var ch = c[0], cs = Math.min(100, Math.max(0, c[1])), cl = Math.min(95, Math.max(10, c[2])); var hex = hslToHex(ch, cs, cl); var wrap = document.createElement('div'); wrap.className = 'cp-pal-swatch'; wrap.innerHTML = '<div class="cp-pal-swatch-box" style="background:' + hex + '" title="' + hex + '"></div><div class="cp-pal-swatch-hex">' + hex + '</div>'; wrap.addEventListener('click', function () { applyColor(hex); showToast('Color picked: ' + hex); }); grid.appendChild(wrap); });
            }
            document.getElementById('cpPalTabs').querySelectorAll('.cp-pal-tab').forEach(function (tab) { tab.addEventListener('click', function () { document.getElementById('cpPalTabs').querySelectorAll('.cp-pal-tab').forEach(function (t) { t.classList.remove('active'); }); tab.classList.add('active'); currentPalMode = tab.dataset.pal; var rgb = hexToRgb(currentHex); var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b); renderPalette(currentPalMode, hsl.h, hsl.s, hsl.l); }); });

            var gradAngle = 135;
            function updateGradient() { var c1 = document.getElementById('cpGrad1').value, c2 = document.getElementById('cpGrad2').value; var css = 'linear-gradient(' + gradAngle + 'deg, ' + c1 + ', ' + c2 + ')'; document.getElementById('cpGradPreview').style.background = css; document.getElementById('cpGradCode').textContent = 'background: ' + css + ';'; }
            document.getElementById('cpGrad1').addEventListener('input', updateGradient);
            document.getElementById('cpGrad2').addEventListener('input', updateGradient);
            document.getElementById('cpGradAngle').addEventListener('input', function () { gradAngle = +this.value; document.getElementById('cpGradAngleVal').textContent = gradAngle + '\u00b0'; var pct = (gradAngle / 360) * 100; this.style.background = 'linear-gradient(to right,#ab183d ' + pct + '%,#f3d4dc ' + pct + '%)'; updateGradient(); });
            document.getElementById('cpGradCopy').addEventListener('click', function () { navigator.clipboard.writeText(document.getElementById('cpGradCode').textContent).then(function () { showToast('Gradient CSS copied!'); }).catch(function () { showToast('Copy failed'); }); });
            document.getElementById('cpGradSwap').addEventListener('click', function () { var c1 = document.getElementById('cpGrad1').value, c2 = document.getElementById('cpGrad2').value; document.getElementById('cpGrad1').value = c2; document.getElementById('cpGrad2').value = c1; updateGradient(); });
            document.getElementById('cpGradUseMain').addEventListener('click', function () { document.getElementById('cpGrad1').value = currentHex; updateGradient(); showToast('Main color applied to gradient'); });
            (function () { var sl = document.getElementById('cpGradAngle'); sl.style.background = 'linear-gradient(to right,#ab183d ' + ((135 / 360) * 100) + '%,#f3d4dc ' + ((135 / 360) * 100) + '%)'; })();

            document.getElementById('cpColorInput').addEventListener('input', function () { applyColor(this.value); });
            document.getElementById('cpHexInput').addEventListener('input', function () { var v = this.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9A-Fa-f]{6}$/.test(v)) applyColor(v.toUpperCase()); });
            document.getElementById('cpHexInput').addEventListener('blur', function () { this.value = currentHex; });

            var copyMap = { hex: function () { return document.getElementById('fmtHex').textContent; }, rgb: function () { return document.getElementById('fmtRgb').textContent; }, hsl: function () { return document.getElementById('fmtHsl').textContent; }, hsv: function () { return document.getElementById('fmtHsv').textContent; }, name: function () { return document.getElementById('fmtCssName').textContent; }, rgb1: function () { return document.getElementById('fmtRgb1').textContent; } };
            document.querySelectorAll('.cp-fmt-copy').forEach(function (btn) { btn.addEventListener('click', function () { var txt = copyMap[btn.dataset.fmt] && copyMap[btn.dataset.fmt](); if (!txt || txt === '\u2013') { showToast('No value to copy'); return; } navigator.clipboard.writeText(txt).then(function () { btn.textContent = '\u2713'; btn.classList.add('copied'); setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1600); showToast('Copied: ' + txt); }).catch(function () { showToast('Copy failed'); }); }); });

            document.getElementById('cpRandBtn').addEventListener('click', function () { var arr = new Uint8Array(3); window.crypto.getRandomValues(arr); applyColor(rgbToHex(arr[0], arr[1], arr[2])); showToast('Random color generated!'); });

            var eyeBtn = document.getElementById('cpEyedrop');
            if (typeof EyeDropper === 'undefined') { eyeBtn.classList.add('no-support'); eyeBtn.title = 'Eyedropper not supported in this browser'; eyeBtn.disabled = true; }
            else { eyeBtn.addEventListener('click', function () { var ed = new EyeDropper(); ed.open().then(function (r) { applyColor(r.sRGBHex.toUpperCase()); showToast('Color picked from screen!'); }).catch(function () { }); }); }

            function renderHistory() { var row = document.getElementById('cpHistRow'); if (history.length === 0) { row.innerHTML = '<span class="cp-empty-txt">No history yet</span>'; return; } row.innerHTML = ''; history.forEach(function (hex) { var sw = document.createElement('div'); sw.className = 'cp-hist-swatch'; sw.style.background = hex; sw.title = hex; sw.addEventListener('click', function () { applyColor(hex, false); showToast('Color picked: ' + hex); }); row.appendChild(sw); }); }

            function saveFavorites() { try { localStorage.setItem('cp_favorites', JSON.stringify(favorites)); } catch (e) { } }
            function renderFavorites() { var row = document.getElementById('cpFavRow'); row.innerHTML = ''; var addBtn = document.createElement('button'); addBtn.className = 'cp-fav-add'; addBtn.type = 'button'; addBtn.title = 'Save current color'; addBtn.textContent = '+'; addBtn.addEventListener('click', addCurrentFav); row.appendChild(addBtn); if (favorites.length === 0) { var em = document.createElement('span'); em.className = 'cp-empty-txt'; em.textContent = 'No favorites yet'; row.appendChild(em); return; } favorites.forEach(function (hex) { var sw = document.createElement('div'); sw.className = 'cp-fav-swatch'; sw.style.background = hex; sw.title = hex + ' \u2014 click to use, right-click to remove'; sw.addEventListener('click', function () { applyColor(hex, false); showToast('Color picked: ' + hex); }); sw.addEventListener('contextmenu', function (e) { e.preventDefault(); favorites = favorites.filter(function (c) { return c !== hex; }); saveFavorites(); renderFavorites(); showToast('Removed from favorites'); }); row.appendChild(sw); }); }
            function addCurrentFav() { if (favorites.indexOf(currentHex) >= 0) { showToast('Already in favorites'); return; } favorites.unshift(currentHex); if (favorites.length > 24) favorites.pop(); saveFavorites(); renderFavorites(); showToast('Added to favorites!'); }
            document.getElementById('cpAddFav').addEventListener('click', addCurrentFav);

            var imgCanvas = document.getElementById('cpImgCanvas'), imgCtx = imgCanvas.getContext('2d', { willReadFrequently: true });
            var imgCursor = document.getElementById('cpImgCursor'), imgCanvasWrap = document.getElementById('cpImgCanvasWrap'), imgDrop = document.getElementById('cpImgDrop'), imgFile = document.getElementById('cpImgFile'), imgClearBtn = document.getElementById('cpImgClear');
            imgDrop.addEventListener('click', function () { imgFile.click(); });
            imgDrop.addEventListener('dragover', function (e) { e.preventDefault(); imgDrop.classList.add('dov'); });
            ['dragleave', 'dragend'].forEach(function (ev) { imgDrop.addEventListener(ev, function () { imgDrop.classList.remove('dov'); }); });
            imgDrop.addEventListener('drop', function (e) { e.preventDefault(); imgDrop.classList.remove('dov'); if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]); });
            imgFile.addEventListener('change', function () { if (this.files[0]) loadImage(this.files[0]); this.value = ''; });
            function loadImage(file) { if (!file.type.startsWith('image/')) { showToast('Only image files accepted'); return; } if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5 MB'); return; } var reader = new FileReader(); reader.onload = function (e) { var img = new Image(); img.onload = function () { var maxW = 600, scale = Math.min(1, maxW / img.width); imgCanvas.width = Math.round(img.width * scale); imgCanvas.height = Math.round(img.height * scale); imgCtx.drawImage(img, 0, 0, imgCanvas.width, imgCanvas.height); imgDrop.style.display = 'none'; imgCanvasWrap.classList.add('show'); imgClearBtn.style.display = ''; extractPalette(); }; img.src = e.target.result; }; reader.readAsDataURL(file); }
            imgCanvas.addEventListener('mousemove', function (e) { var rect = imgCanvas.getBoundingClientRect(); var x = Math.round((e.clientX - rect.left) * (imgCanvas.width / rect.width)); var y = Math.round((e.clientY - rect.top) * (imgCanvas.height / rect.height)); x = Math.max(0, Math.min(imgCanvas.width - 1, x)); y = Math.max(0, Math.min(imgCanvas.height - 1, y)); var px = imgCtx.getImageData(x, y, 1, 1).data; var hex = rgbToHex(px[0], px[1], px[2]); imgCursor.style.left = e.offsetX + 'px'; imgCursor.style.top = e.offsetY + 'px'; imgCursor.style.display = 'block'; imgCursor.style.background = hex; });
            imgCanvas.addEventListener('mouseleave', function () { imgCursor.style.display = 'none'; });
            imgCanvas.addEventListener('click', function (e) { var rect = imgCanvas.getBoundingClientRect(); var x = Math.round((e.clientX - rect.left) * (imgCanvas.width / rect.width)); var y = Math.round((e.clientY - rect.top) * (imgCanvas.height / rect.height)); x = Math.max(0, Math.min(imgCanvas.width - 1, x)); y = Math.max(0, Math.min(imgCanvas.height - 1, y)); var px = imgCtx.getImageData(x, y, 1, 1).data; var hex = rgbToHex(px[0], px[1], px[2]); applyColor(hex); showToast('Color picked: ' + hex); });
            imgCanvas.addEventListener('touchend', function (e) { var touch = e.changedTouches[0]; var rect = imgCanvas.getBoundingClientRect(); var x = Math.round((touch.clientX - rect.left) * (imgCanvas.width / rect.width)); var y = Math.round((touch.clientY - rect.top) * (imgCanvas.height / rect.height)); x = Math.max(0, Math.min(imgCanvas.width - 1, x)); y = Math.max(0, Math.min(imgCanvas.height - 1, y)); var px = imgCtx.getImageData(x, y, 1, 1).data; applyColor(rgbToHex(px[0], px[1], px[2])); showToast('Color picked!'); }, { passive: true });
            imgClearBtn.addEventListener('click', function () { imgCanvasWrap.classList.remove('show'); imgDrop.style.display = ''; imgClearBtn.style.display = 'none'; document.getElementById('cpImgPaletteWrap').style.display = 'none'; document.getElementById('cpImgPalette').innerHTML = ''; imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height); });
            function extractPalette() { var step = Math.max(1, Math.floor(Math.min(imgCanvas.width, imgCanvas.height) / 12)); var counts = {}; for (var y = 0; y < imgCanvas.height; y += step) { for (var x = 0; x < imgCanvas.width; x += step) { var d = imgCtx.getImageData(x, y, 1, 1).data; var qr = Math.round(d[0] / 32) * 32, qg = Math.round(d[1] / 32) * 32, qb = Math.round(d[2] / 32) * 32; var key = qr + ',' + qg + ',' + qb; counts[key] = (counts[key] || 0) + 1; } } var sorted = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 8); var palWrap = document.getElementById('cpImgPaletteWrap'), palEl = document.getElementById('cpImgPalette'); palEl.innerHTML = ''; sorted.forEach(function (key) { var parts = key.split(',').map(Number); var hex = rgbToHex(Math.min(255, parts[0]), Math.min(255, parts[1]), Math.min(255, parts[2])); var sw = document.createElement('div'); sw.className = 'cp-img-swatch'; sw.style.background = hex; sw.title = hex; sw.addEventListener('click', function () { applyColor(hex); showToast('Color picked: ' + hex); }); palEl.appendChild(sw); }); palWrap.style.display = ''; }

            // INIT
            applyColor('#F59E0B', false); updateGradient(); renderFavorites(); renderHistory();
        })();
    