
        // ===== Header chrome =====
        (function () {
            var burger = document.getElementById('pcsBurger'), mob = document.getElementById('pcsMobile');
            if (burger) { burger.addEventListener('click', function () { var o = mob.classList.toggle('open'); burger.setAttribute('aria-expanded', o); }); mob.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mob.classList.remove('open'); }); }); }
        })();

        // ===== Password Generator core (preserved logic) =====
        (function () {
            var pgUpper = document.getElementById('pgUpper'), pgLower = document.getElementById('pgLower'), pgNums = document.getElementById('pgNums'), pgSyms = document.getElementById('pgSyms');
            var pgPronounce = document.getElementById('pgPronounce'), pgNoSimilar = document.getElementById('pgNoSimilar'), pgNoAmbig = document.getElementById('pgNoAmbig'), pgAutoRegen = document.getElementById('pgAutoRegen');
            var pgLenSlider = document.getElementById('pgLenSlider'), pgLenVal = document.getElementById('pgLenVal'), pgLenHint = document.getElementById('pgLenHint');
            var pgOutput = document.getElementById('pgOutput'), pgCopyBtn = document.getElementById('pgCopyBtn'), pgRefreshBtn = document.getElementById('pgRefreshBtn');
            var pgStrBadge = document.getElementById('pgStrBadge'), pgStrBar = document.getElementById('pgStrBar');
            var pgError = document.getElementById('pgError'), pgErrorMsg = document.getElementById('pgErrorMsg');
            var pgBulkCount = document.getElementById('pgBulkCount'), pgBulkOutput = document.getElementById('pgBulkOutput'), pgBulkList = document.getElementById('pgBulkList'), pgBulkCopyAll = document.getElementById('pgBulkCopyAll');
            var pgHistoryList = document.getElementById('pgHistoryList'), pgHistoryEmpty = document.getElementById('pgHistoryEmpty');

            var CHARS = { upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', nums: '0123456789', syms: '!@#$%^&*-_=+', symsFull: '!@#$%^&*-_=+[]{}|;:,.<>?/', similar: 'O0lI1', ambig: "{}[]()/'\\`~;:,.<>" };
            var VOWELS = 'aeiou', CONSONANTS = 'bcdfghjklmnpqrstvwxyz';

            function cryptoRandInt(max) { var arr = new Uint32Array(1); var limit = Math.floor(0xFFFFFFFF / max) * max; do { window.crypto.getRandomValues(arr); } while (arr[0] >= limit); return arr[0] % max; }
            function cryptoRandChar(str) { return str[cryptoRandInt(str.length)]; }

            function buildCharset() {
                var cs = '';
                if (pgUpper.checked) cs += CHARS.upper;
                if (pgLower.checked) cs += CHARS.lower;
                if (pgNums.checked) cs += CHARS.nums;
                if (pgSyms.checked) cs += pgNoAmbig.checked ? CHARS.syms : CHARS.symsFull;
                if (pgNoSimilar.checked) { var sim = CHARS.similar; cs = cs.split('').filter(function (c) { return sim.indexOf(c) < 0; }).join(''); }
                if (pgNoAmbig.checked && pgSyms.checked) { var amb = CHARS.ambig; cs = cs.split('').filter(function (c) { return amb.indexOf(c) < 0; }).join(''); }
                return cs;
            }

            function generateOne(len) {
                var pronounce = pgPronounce.checked;
                if (pronounce) {
                    var cons = CONSONANTS, vow = VOWELS;
                    if (pgNoSimilar.checked) { cons = cons.replace(/[il]/g, ''); vow = vow.replace(/[o]/g, ''); }
                    var pw = '', useVowel = cryptoRandInt(2) === 0;
                    for (var i = 0; i < len; i++) {
                        var extra = (pgNums.checked && i > 0 && cryptoRandInt(4) === 0) || (pgSyms.checked && i > 0 && cryptoRandInt(6) === 0);
                        if (extra) { var extraSet = ''; if (pgNums.checked) extraSet += CHARS.nums; if (pgSyms.checked) extraSet += pgNoAmbig.checked ? CHARS.syms : CHARS.symsFull; if (extraSet) pw += cryptoRandChar(extraSet); else pw += cryptoRandChar(useVowel ? vow : cons); }
                        else { var base = useVowel ? vow : cons; var c = cryptoRandChar(base); pw += (pgUpper.checked && cryptoRandInt(4) === 0) ? c.toUpperCase() : c; useVowel = !useVowel; }
                    }
                    return pw;
                }
                var charset = buildCharset(); if (!charset) return '';
                var required = [];
                if (pgUpper.checked) { var uc = CHARS.upper; if (pgNoSimilar.checked) uc = uc.replace(/[IO]/g, ''); if (uc) required.push(cryptoRandChar(uc)); }
                if (pgLower.checked) { var lc = CHARS.lower; if (pgNoSimilar.checked) lc = lc.replace(/[lo]/g, ''); if (lc) required.push(cryptoRandChar(lc)); }
                if (pgNums.checked) { var nc = CHARS.nums; if (pgNoSimilar.checked) nc = nc.replace(/[01]/g, ''); if (nc) required.push(cryptoRandChar(nc)); }
                if (pgSyms.checked) { var sc = pgNoAmbig.checked ? CHARS.syms : CHARS.symsFull; if (pgNoAmbig.checked) { var amb = CHARS.ambig; sc = sc.split('').filter(function (c) { return amb.indexOf(c) < 0; }).join(''); } if (sc) required.push(cryptoRandChar(sc)); }
                var remaining = len - required.length, pw = required.slice();
                for (var j = 0; j < remaining; j++) pw.push(cryptoRandChar(charset));
                for (var k = pw.length - 1; k > 0; k--) { var idx = cryptoRandInt(k + 1); var tmp = pw[k]; pw[k] = pw[idx]; pw[idx] = tmp; }
                return pw.join('');
            }

            function calcStrength(pw) {
                if (!pw) return { label: 'None', cls: 'pg-str-weak', pct: 0, color: '#e5e7eb' };
                var score = 0, len = pw.length;
                if (len >= 8) score++; if (len >= 12) score++; if (len >= 16) score++; if (len >= 24) score++;
                if (/[A-Z]/.test(pw)) score++; if (/[a-z]/.test(pw)) score++; if (/[0-9]/.test(pw)) score++; if (/[^A-Za-z0-9]/.test(pw)) score += 2;
                if (score <= 3) return { label: 'Weak', cls: 'pg-str-weak', pct: 18, color: '#ef4444' };
                if (score <= 5) return { label: 'Fair', cls: 'pg-str-fair', pct: 42, color: '#F59E0B' };
                if (score <= 7) return { label: 'Good', cls: 'pg-str-good', pct: 68, color: '#1a56db' };
                return { label: 'Strong', cls: 'pg-str-strong', pct: 100, color: '#059669' };
            }
            function updateStrength(pw) { var s = calcStrength(pw); pgStrBadge.textContent = s.label; pgStrBadge.className = 'pg-strength-badge ' + s.cls; pgStrBar.style.width = s.pct + '%'; pgStrBar.style.background = s.color; }

            function sliderFill() { var mn = +pgLenSlider.min, mx = +pgLenSlider.max, v = +pgLenSlider.value; var pct = ((v - mn) / (mx - mn)) * 100; pgLenSlider.style.background = 'linear-gradient(to right,#ab183d ' + pct + '%,#fde68a ' + pct + '%,#fde68a 100%)'; }
            function updateLenHint(v) { pgLenVal.textContent = v; var h; if (v < 8) h = 'Too short'; else if (v < 12) h = 'Acceptable'; else if (v < 16) h = 'Good length'; else if (v < 24) h = 'Strong'; else h = 'Very strong'; pgLenHint.textContent = h; }
            function showError(m) { pgErrorMsg.textContent = m; pgError.classList.add('show'); }
            function hideError() { pgError.classList.remove('show'); }
            function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

            var history = [];
            function addToHistory(pw) { if (!pw) return; if (history.length > 0 && history[0].pw === pw) return; history.unshift({ pw: pw, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }); if (history.length > 5) history.pop(); renderHistory(); }
            function renderHistory() {
                pgHistoryList.querySelectorAll('.pg-history-item').forEach(function (el) { el.remove(); });
                if (history.length === 0) { pgHistoryEmpty.style.display = ''; return; }
                pgHistoryEmpty.style.display = 'none';
                history.forEach(function (item) {
                    var div = document.createElement('div'); div.className = 'pg-history-item';
                    div.innerHTML = '<span class="pg-history-pw">' + escHtml(item.pw) + '</span><span class="pg-history-meta">' + item.time + '</span><button class="pg-history-copy" type="button">Copy</button>';
                    div.querySelector('.pg-history-copy').addEventListener('click', function () { copyToClipboard(item.pw, div.querySelector('.pg-history-copy')); });
                    pgHistoryList.appendChild(div);
                });
            }
            document.getElementById('pgHistoryClear').addEventListener('click', function () { history = []; renderHistory(); });

            var copyTimer;
            function copyToClipboard(text, btn) {
                var orig = btn.textContent;
                function done() { btn.textContent = 'Copied!'; btn.classList.add('copied'); clearTimeout(copyTimer); copyTimer = setTimeout(function () { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1800); }
                if (navigator.clipboard) { navigator.clipboard.writeText(text).then(done).catch(fallback); } else { fallback(); }
                function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) { } document.body.removeChild(ta); done(); }
            }

            function generate() {
                hideError();
                if (!pgUpper.checked && !pgLower.checked && !pgNums.checked && !pgSyms.checked && !pgPronounce.checked) { showError('Please select at least one character type.'); return ''; }
                var len = parseInt(pgLenSlider.value, 10) || 12;
                var pw = generateOne(len);
                if (!pw) { showError('Could not generate a password — please check your options.'); return ''; }
                pgOutput.classList.remove('flash'); void pgOutput.offsetWidth; pgOutput.classList.add('flash');
                pgOutput.value = pw; updateStrength(pw); addToHistory(pw); return pw;
            }

            document.getElementById('pgBtnGenerate').addEventListener('click', generate);
            document.getElementById('pgBtnBulk').addEventListener('click', function () {
                hideError();
                if (!pgUpper.checked && !pgLower.checked && !pgNums.checked && !pgSyms.checked && !pgPronounce.checked) { showError('Please select at least one character type.'); return; }
                var count = Math.max(1, Math.min(20, parseInt(pgBulkCount.value, 10) || 5));
                var len = parseInt(pgLenSlider.value, 10) || 12; pgBulkList.innerHTML = '';
                for (var i = 0; i < count; i++) { (function (pw) { var div = document.createElement('div'); div.className = 'pg-bulk-item'; div.innerHTML = '<span class="pg-bulk-pw">' + escHtml(pw) + '</span><button class="pg-bulk-item-copy" type="button">Copy</button>'; div.querySelector('.pg-bulk-item-copy').addEventListener('click', function () { copyToClipboard(pw, div.querySelector('.pg-bulk-item-copy')); }); pgBulkList.appendChild(div); })(generateOne(len)); }
                pgBulkOutput.classList.add('show'); pgBulkOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
            pgBulkCopyAll.addEventListener('click', function () { var all = []; pgBulkList.querySelectorAll('.pg-bulk-pw').forEach(function (el) { all.push(el.textContent); }); copyToClipboard(all.join('\n'), pgBulkCopyAll); });
            pgCopyBtn.addEventListener('click', function () { if (pgOutput.value) copyToClipboard(pgOutput.value, pgCopyBtn); });
            pgRefreshBtn.addEventListener('click', generate);

            function autoRegen() { if (pgAutoRegen.checked && pgOutput.value) generate(); }
            [pgUpper, pgLower, pgNums, pgSyms, pgPronounce, pgNoSimilar, pgNoAmbig].forEach(function (el) { el.addEventListener('change', autoRegen); });
            pgLenSlider.addEventListener('input', function () { updateLenHint(this.value); sliderFill(); autoRegen(); });

            sliderFill(); updateLenHint(pgLenSlider.value); generate();
        })();
    