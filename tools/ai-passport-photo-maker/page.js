
        var currentLang = 'hi';

        var prompts = {
            male: "Generate a professional male passport photo. Requirements: Plain white or very light gray background, face centered and looking straight at camera with neutral expression, both ears visible, proper even lighting with no shadows on face, shoulders and upper chest visible, formal attire preferred and same face, high resolution output. Aspect ratio 4:5. The photo must meet official government passport photo standards.",
            female: "Generate a professional female passport photo. Requirements: Plain white or very light gray background, face centered and looking straight at camera, both ears clearly visible, hair neatly styled away from face, neutral expression with mouth closed, proper even lighting with no shadows on face, shoulders visible, high resolution. Aspect ratio 4:5. Must meet official passport standards.",
            hijab: "Generate a professional passport photo of a female person wearing a hijab. Requirements: Plain white or very light gray background, full face completely visible and centered, hijab neatly and securely framing the face showing the entire face clearly, neutral expression, proper even lighting with no shadows on face, shoulders visible, high resolution output. Aspect ratio 4:5. Must meet official passport standards for religious head coverings."
        };

        var content = {
            en: {
                'txt-title': 'AI Passport Photo Maker',
                'txt-subtitle': 'Click a card to auto-copy the prompt and open Google AI Studio instantly.',
                'txt-male-label': 'Male Passport Photo',
                'txt-male-desc': 'Automatically generate a natural passport photo meeting official standards.',
                'txt-male-hint': 'Click → Prompt copies & AI Studio opens',
                'txt-female-label': 'Female Passport Photo',
                'txt-female-desc': 'Create a passport headshot from any photo, ears will be clearly visible.',
                'txt-female-hint': 'Click → Prompt copies & AI Studio opens',
                'txt-hijab-label': 'Hijab Passport Photo',
                'txt-hijab-desc': 'Create passport-perfect facial headshots from any photo wearing a hijab.',
                'txt-hijab-hint': 'Click → Prompt copies & AI Studio opens',
                'txt-btn-usage': 'View Usage Guide',
                'txt-btn-demo': 'View Demo Photos',
                'txt-guide-heading': 'How to Use & Guidelines',
                'txt-s1l': '1. Login:',
                'txt-s1': 'Access AI Studio with your Google account. Connect Google Drive if prompted for storage.',
                'txt-s2l': '2. Select Type:',
                'txt-s2': 'Click a photo category card above — the prompt will auto-copy to clipboard.',
                'txt-s3l': '3. Paste:',
                'txt-s3': 'In AI Studio, Paste (Ctrl+V) the prompt into the chat box.',
                'txt-s4l': '4. Settings:',
                'txt-s4': 'On the right sidebar, select Aspect Ratio: 4:5.',
                'txt-s5l': '5. Upload:',
                'txt-s5': "Click the '+' or Upload icon below the box to add your photo.",
                'txt-s6l': '6. Generate:',
                'txt-s6': 'Click the Run button. Wait 15 seconds for your HD passport photo!',
                'badge': '✓ Copied!',
                'toast': '✓ Prompt copied! Opening AI Studio...'
            },
            hi: {
                'txt-title': 'AI Passport Photo Maker',
                'txt-subtitle': 'Card click karein — prompt auto-copy hoga aur Google AI Studio khulega',
                'txt-male-label': 'Male Passport Photo',
                'txt-male-desc': 'Official standards ke anusaar natural passport photo automatically generate karta hai.',
                'txt-male-hint': 'Click karein → Prompt copy + AI Studio open',
                'txt-female-label': 'Female Passport Photo',
                'txt-female-desc': 'Kisi bhi photo se passport headshot banata hai, kaanon ke saath.',
                'txt-female-hint': 'Click karein → Prompt copy + AI Studio open',
                'txt-hijab-label': 'Hijab Passport Photo',
                'txt-hijab-desc': 'Hijab pehne kisi bhi photo se passport-perfect facial headshot banata hai.',
                'txt-hijab-hint': 'Click karein → Prompt copy + AI Studio open',
                'txt-btn-usage': 'Usage Guide Dekhein',
                'txt-btn-demo': 'Demo Photos Dekhein',
                'txt-guide-heading': 'Kaise Use Karein & Guidelines',
                'txt-s1l': '1. Login:',
                'txt-s1': 'Apne Google account se AI Studio mein jaayein. Storage ke liye Google Drive connect karein.',
                'txt-s2l': '2. Type Chunein:',
                'txt-s2': 'Upar diye gaye photo category card par click karein — Prompt auto-copy ho jaayega.',
                'txt-s3l': '3. Paste Karein:',
                'txt-s3': 'AI Studio mein chat box mein Paste (Ctrl+V) karein.',
                'txt-s4l': '4. Settings:',
                'txt-s4': 'Right sidebar mein Aspect Ratio: 4:5 select karein.',
                'txt-s5l': '5. Upload Karein:',
                'txt-s5': "Box ke neeche '+' ya Upload icon click karein aur apni photo add karein.",
                'txt-s6l': '6. Generate Karein:',
                'txt-s6': 'Run button click karein. Sirf 15 second mein HD passport photo taiyaar!',
                'badge': '✓ Copy ho gaya!',
                'toast': '✓ Prompt copy ho gaya! AI Studio khul raha hai...'
            }
        };

        function setLang(l) {
            currentLang = l;
            document.getElementById('btn-en').classList.toggle('active', l === 'en');
            document.getElementById('btn-hi').classList.toggle('active', l === 'hi');
            document.documentElement.lang = l === 'hi' ? 'hi' : 'en';
            var c = content[l];
            Object.keys(c).forEach(function(key) {
                if (key === 'badge' || key === 'toast') return;
                var el = document.getElementById(key);
                if (el) el.textContent = c[key];
            });
            ['male', 'female', 'hijab'].forEach(function(type) {
                var badge = document.getElementById('badge-' + type);
                if (badge) badge.textContent = c['badge'];
            });
        }

        function copyAndOpen(type) {
            var prompt = prompts[type];
            var c = content[currentLang];

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(prompt).catch(function() {
                    fallbackCopy(prompt);
                });
            } else {
                fallbackCopy(prompt);
            }

            var card = document.getElementById('card-' + type);
            card.classList.add('copied');
            setTimeout(function() {
                card.classList.remove('copied');
            }, 2600);

            showToast(c['toast']);

            setTimeout(function() {
                window.open('https://aistudio.google.com/prompts/new_chat', '_blank', 'noopener,noreferrer');
            }, 500);
        }

        function fallbackCopy(text) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            ta.style.top = '-9999px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            try {
                document.execCommand('copy');
            } catch (e) {}
            document.body.removeChild(ta);
        }

        var toastTimer;

        function showToast(msg) {
            var t = document.getElementById('toast');
            t.textContent = msg;
            t.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(function() {
                t.classList.remove('show');
            }, 3400);
        }

        // Init
        setLang('hi');
    