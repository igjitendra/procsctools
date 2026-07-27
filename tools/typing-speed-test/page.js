
        // Header chrome
        (function () {
            var burger = document.getElementById('pcsBurger'), mob = document.getElementById('pcsMobile');
            if (burger) { burger.addEventListener('click', function () { var o = mob.classList.toggle('open'); burger.setAttribute('aria-expanded', o); }); mob.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mob.classList.remove('open'); }); }); }
        })();

        // ===== Typing Speed Test core =====
        (function () {
            'use strict';
            var PASSAGES = [
                "The government of India has launched several digital initiatives to make public services more accessible to citizens in rural areas. Through common service centres, people can now apply for certificates, pay bills, and access banking facilities without travelling long distances to district offices. This transformation has improved efficiency and reduced the time required to complete essential administrative tasks.",
                "Education plays a vital role in the development of any nation. A well informed citizen is better equipped to participate in democratic processes and contribute meaningfully to society. Modern technology has made learning resources available to students in even the most remote villages, ensuring that knowledge is no longer limited by geography or economic background.",
                "The banking sector has undergone a remarkable transformation in the past decade. With the introduction of unified payment systems, customers can transfer money instantly using a mobile phone. This convenience has encouraged more people to adopt digital transactions, reducing dependence on cash and promoting a more transparent financial system across the country.",
                "Agriculture remains the backbone of the rural economy, supporting millions of families across the nation. Farmers are increasingly using weather forecasts, soil testing, and market price information to make better decisions. These tools help improve crop yields and ensure that produce reaches markets at fair prices, strengthening the livelihood of farming communities.",
                "Good communication skills are essential in both personal and professional life. The ability to express ideas clearly and listen carefully to others builds trust and understanding. In the workplace, effective communication reduces misunderstandings, improves teamwork, and helps organisations achieve their goals more efficiently and with greater cooperation among colleagues.",
                "Time management is one of the most important skills a person can develop. By planning tasks in advance and setting clear priorities, individuals can accomplish more while reducing stress. Successful people often begin their day with a simple list of goals, focusing their energy on the most important work before moving on to less urgent activities."
            ];
            var $ = function (id) { return document.getElementById(id); };
            var setupState = $('ttsSetup'), testArea = $('ttsTestArea'), resultState = $('ttsResult');
            var passageBox = $('ttsPassageBox'), hiddenInput = $('ttsHiddenInput');
            var timerVal = $('ttsTimerVal'), wpmVal = $('ttsWpmVal'), accVal = $('ttsAccVal');

            var selectedDuration = 60, passageText = '', currentPos = 0, typedChars = [];
            var totalKeystrokes = 0, errorCount = 0, testStarted = false, testEnded = false;
            var startTime = null, timeRemaining = 60, timerInterval = null, wpmSnapshots = [];
            var soundEnabled = true, audioCtx = null;
            var lastResult = { wpm: 0, accuracy: 0 };

            function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
            function formatTime(s) { var m = Math.floor(s / 60), sec = s % 60; return m + ':' + (sec < 10 ? '0' : '') + sec; }
            function toast(msg) { var t = $('ttsToast'); t.textContent = msg; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 2000); }
            function showErr(m) { var e = $('ttsError'); $('ttsErrorMsg').textContent = m; e.classList.add('show'); setTimeout(function () { e.classList.remove('show'); }, 3000); }

            // best score
            function showBest() { var b = 0; try { b = parseInt(localStorage.getItem('tts_best') || '0', 10); } catch (e) { } if (b > 0) { $('ttsBest').style.display = 'block'; $('ttsBest').innerHTML = '<i class="fas fa-trophy"></i> Your Personal Best: ' + b + ' WPM'; } }

            // Duration buttons
            $('ttsDurationGrid').querySelectorAll('.tts-dur').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    $('ttsDurationGrid').querySelectorAll('.tts-dur').forEach(function (b) { b.classList.remove('active'); });
                    btn.classList.add('active'); selectedDuration = parseInt(btn.dataset.dur, 10);
                });
            });

            // Sound toggle
            $('ttsSoundToggle').addEventListener('click', function () {
                soundEnabled = !soundEnabled;
                $('ttsSoundIcon').className = soundEnabled ? 'fas fa-volume-high' : 'fas fa-volume-xmark';
                $('ttsSoundLabel').textContent = soundEnabled ? 'Sound On' : 'Sound Off';
            });

            function initAudioContext() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } } if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); }
            function playKeySound() {
                if (!soundEnabled || !audioCtx) return;
                var now = audioCtx.currentTime, dur = 0.018, bs = Math.floor(audioCtx.sampleRate * dur);
                var buffer = audioCtx.createBuffer(1, bs, audioCtx.sampleRate), data = buffer.getChannelData(0);
                for (var i = 0; i < bs; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bs, 2);
                var noise = audioCtx.createBufferSource(); noise.buffer = buffer;
                var f = audioCtx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3200 + Math.random() * 600;
                var g = audioCtx.createGain(); g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + dur);
                noise.connect(f); f.connect(g); g.connect(audioCtx.destination); noise.start(now); noise.stop(now + dur);
            }
            function playTone(freq, duration, type, volume) { if (!soundEnabled || !audioCtx) return; var osc = audioCtx.createOscillator(), gain = audioCtx.createGain(); osc.type = type || 'sine'; osc.frequency.value = freq; var now = audioCtx.currentTime; gain.gain.setValueAtTime(volume || 0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + duration); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + duration); }
            function playCompleteSound() { playTone(523, .15, 'sine', .08); setTimeout(function () { playTone(659, .15, 'sine', .08); }, 120); setTimeout(function () { playTone(784, .25, 'sine', .08); }, 240); }

            function renderPassage() {
                var html = '';
                for (var i = 0; i < passageText.length; i++) {
                    var cls = 'char-pending';
                    if (i < currentPos) cls = typedChars[i] ? 'char-correct' : 'char-wrong';
                    else if (i === currentPos) cls = 'char-current';
                    html += '<span class="' + cls + '">' + escHtml(passageText[i]) + '</span>';
                }
                passageBox.innerHTML = html;
                var cur = passageBox.querySelector('.char-current');
                if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
            }

            function startTest() {
                passageText = PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
                currentPos = 0; typedChars = []; totalKeystrokes = 0; errorCount = 0;
                testStarted = false; testEnded = false; startTime = null; wpmSnapshots = [];
                timeRemaining = selectedDuration;
                wpmVal.textContent = '0'; accVal.textContent = '100%';
                renderPassage();
                setupState.classList.add('tts-hide'); resultState.classList.add('tts-hide'); testArea.classList.remove('tts-hide');
                timerVal.textContent = formatTime(timeRemaining);
                setTimeout(function () { hiddenInput.focus(); passageBox.focus(); }, 100);
            }
            $('ttsStartBtn').addEventListener('click', startTest);
            $('ttsRetryBtn').addEventListener('click', startTest);
            passageBox.addEventListener('click', function () { hiddenInput.focus(); });

            hiddenInput.addEventListener('input', function () {
                if (testEnded) return;
                var val = this.value; this.value = ''; if (!val) return;
                for (var i = 0; i < val.length; i++) {
                    var ch = val[i]; if (currentPos >= passageText.length) break;
                    if (!testStarted) { testStarted = true; startTime = Date.now(); startTimer(); initAudioContext(); }
                    totalKeystrokes++;
                    var isCorrect = ch === passageText[currentPos];
                    typedChars[currentPos] = isCorrect; if (!isCorrect) errorCount++;
                    playKeySound(); currentPos++;
                    if (currentPos >= passageText.length) { endTest(); break; }
                }
                renderPassage(); updateLiveStats();
            });
            hiddenInput.addEventListener('keydown', function (e) { if (e.key === 'Backspace') { e.preventDefault(); if (currentPos > 0) { currentPos--; typedChars[currentPos] = undefined; renderPassage(); } } });

            function updateLiveStats() {
                if (!startTime) return;
                var elapsedMin = (Date.now() - startTime) / 60000; if (elapsedMin <= 0) return;
                var correct = typedChars.filter(function (v) { return v === true; }).length;
                var wpm = Math.round((correct / 5) / elapsedMin);
                var acc = totalKeystrokes > 0 ? Math.round((correct / totalKeystrokes) * 100) : 100;
                wpmVal.textContent = wpm > 0 ? wpm : 0; accVal.textContent = acc + '%';
                wpmSnapshots.push(wpm > 0 ? wpm : 0);
            }
            function startTimer() { timerInterval = setInterval(function () { timeRemaining--; timerVal.textContent = formatTime(timeRemaining); updateLiveStats(); if (timeRemaining <= 0) endTest(); }, 1000); }

            function endTest() {
                if (testEnded) return; testEnded = true; clearInterval(timerInterval);
                var elapsedSeconds = startTime ? (Date.now() - startTime) / 1000 : selectedDuration;
                var elapsedMin = elapsedSeconds / 60;
                var correct = typedChars.filter(function (v) { return v === true; }).length;
                var finalWpm = elapsedMin > 0 ? Math.round((correct / 5) / elapsedMin) : 0;
                var finalAcc = totalKeystrokes > 0 ? Math.round((correct / totalKeystrokes) * 10000) / 100 : 100;
                var grossWpm = elapsedMin > 0 ? Math.round((totalKeystrokes / 5) / elapsedMin) : 0;
                var consistencyScore = 100, trimmed = wpmSnapshots.slice(2);
                while (trimmed.length > 0 && trimmed[trimmed.length - 1] === 0) trimmed.pop();
                var stable = trimmed.filter(function (v) { return v > 0; });
                if (stable.length >= 4) {
                    var avg = stable.reduce(function (a, b) { return a + b; }, 0) / stable.length;
                    var variance = stable.reduce(function (a, b) { return a + Math.pow(b - avg, 2); }, 0) / stable.length;
                    var coefVar = avg > 0 ? (Math.sqrt(variance) / avg) : 0;
                    consistencyScore = Math.max(40, Math.min(100, Math.round(100 - (coefVar * 100))));
                }
                testArea.classList.add('tts-hide'); resultState.classList.remove('tts-hide');
                $('ttsResultWpm').textContent = finalWpm;
                $('ttsResultAcc').textContent = finalAcc + '%';
                $('ttsResultChars').textContent = totalKeystrokes;
                $('ttsResultErrors').textContent = errorCount;
                $('ttsResultGross').textContent = grossWpm;
                $('ttsResultConsistency').textContent = consistencyScore + '%';
                lastResult.wpm = finalWpm; lastResult.accuracy = finalAcc;
                try { var b = parseInt(localStorage.getItem('tts_best') || '0', 10); if (finalWpm > b) { localStorage.setItem('tts_best', finalWpm); toast('New personal best: ' + finalWpm + ' WPM!'); } } catch (e) { }
                showBest();
                playCompleteSound();
            }

            $('ttsShareBtn').addEventListener('click', function () {
                var msg = 'I scored ' + lastResult.wpm + ' WPM with ' + lastResult.accuracy + '% accuracy on the Pro CSC Tools Typing Speed Test! Try it: https://procsctools.in/tools/typing-speed-test.html';
                window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
            });

            showBest();
        })();
    