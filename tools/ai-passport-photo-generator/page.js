
        // ===================== PROMPTS =====================
        var prompts = {
            'male': "Generate a professional male passport photo following official Indian government standards. Requirements: Pure white or very light gray plain background only, face perfectly centered looking straight at the camera, neutral expression with mouth closed, both ears clearly visible, proper even lighting with absolutely no shadows on the face or background, shoulders and upper chest visible, clean formal attire preferred (light colored shirt or formal wear), high resolution output. Photo size ratio 4:5 (35mm × 45mm standard). The photo must strictly meet official government passport photo requirements.",

            'female': "Generate a professional female passport photo following official Indian government standards. Requirements: Pure white or very light gray plain background only, face perfectly centered looking straight at camera, both ears clearly visible, hair neatly styled away from face, neutral expression with mouth closed, proper even lighting with no shadows on face, shoulders and upper chest visible, light formal attire, high resolution output. Photo ratio 4:5 (35mm × 45mm standard). Must strictly meet official passport photo standards.",

            'hijab': "Generate a professional passport photo of a female person wearing a hijab following official government standards. Requirements: Pure white or very light gray plain background, full face completely visible and centered looking straight at camera, hijab neatly framing the face showing entire face clearly from forehead to chin, both sides of face fully visible, neutral expression with mouth closed, proper even lighting with no shadows on face, shoulders visible, high resolution output. Photo ratio 4:5. Must meet official passport standards for religious head coverings.",

            'turban': "Generate a professional passport photo of a male person wearing a turban/pagdi following official government standards for religious head coverings. Requirements: Pure white or very light gray plain background, full face completely visible and centered looking straight at camera, turban neatly tied, both ears or sides of face visible below the turban, neutral expression with mouth closed, proper even lighting with no shadows, shoulders and upper chest visible, formal attire, high resolution. Photo ratio 4:5 (35mm × 45mm). Must meet official passport requirements for religious headwear.",

            'elderly-male': "Generate a professional passport photo of an elderly male (senior citizen) following official government standards. Requirements: Pure white plain background, face centered looking straight at camera, natural aged features preserved authentically, neutral expression, both ears visible, proper even soft lighting with no harsh shadows on face, formal light-colored shirt, shoulders visible, high resolution output. Photo ratio 4:5. Must meet official passport photo standards.",

            'elderly-female': "Generate a professional passport photo of an elderly female (senior citizen) following official government standards. Requirements: Pure white plain background, face centered looking straight at camera, natural aged features preserved authentically, neutral expression with mouth closed, both ears visible or hair neat, proper soft even lighting with no shadows, light formal attire, shoulders visible, high resolution output. Photo ratio 4:5. Must meet official passport photo standards.",

            'school-boy': "Generate a professional school boy passport photo suitable for school ID card and official documents. Requirements: Pure white plain background, young male student (school age 6-15 years) centered looking straight at camera, wearing school uniform (white shirt preferred) or neat formal attire, neutral expression with mouth closed, both ears visible, neat hair, proper even lighting with no shadows, shoulders visible, high resolution output. Photo ratio 4:5. Must meet official school photo and passport photo standards.",

            'school-girl': "Generate a professional school girl passport photo suitable for school ID card and official documents. Requirements: Pure white plain background, young female student (school age 6-15 years) centered looking straight at camera, wearing school uniform or neat formal attire, neutral expression with mouth closed, both ears visible or hair neatly tied back, proper even lighting with no shadows, shoulders visible, high resolution output. Photo ratio 4:5. Must meet official school photo and passport photo standards.",

            'college-boy': "Generate a professional college student male passport photo suitable for college admission form, ID card and official documents. Requirements: Pure white plain background, young male (18-25 years) centered looking straight at camera, neat formal attire (collared shirt or blazer preferred), neutral confident expression with mouth closed, both ears visible, well-groomed hair, proper professional even lighting with no shadows, shoulders and upper chest visible, high resolution HD output. Photo ratio 4:5. Must meet official college admission and passport photo standards.",

            'college-girl': "Generate a professional college student female passport photo suitable for college admission form, ID card and official documents. Requirements: Pure white plain background, young female (18-25 years) centered looking straight at camera, neat formal attire, hair neatly styled, neutral confident expression with mouth closed, both ears visible, proper professional even lighting with no shadows, shoulders visible, high resolution HD output. Photo ratio 4:5. Must meet official college admission and passport photo standards.",

            'baby-boy': "Generate a professional infant/toddler male passport photo (baby boy, 1-2 years old) following official government infant passport photo standards. Requirements: Pure white plain background, baby's face centered and looking straight at camera as much as possible, neutral or calm expression, ears visible, proper soft even lighting with no harsh shadows, no pacifier or toys in photo, simple plain clothing (light colored), head upright or supported, high resolution output. Photo ratio 4:5. Must meet official infant passport photo requirements.",

            'baby-girl': "Generate a professional infant/toddler female passport photo (baby girl, 1-2 years old) following official government infant passport photo standards. Requirements: Pure white plain background, baby's face centered and looking straight at camera as much as possible, neutral or calm expression, ears visible or hair neat, proper soft even lighting with no harsh shadows, no pacifier or toys in photo, simple plain light-colored clothing, head upright, high resolution output. Photo ratio 4:5. Must meet official infant passport photo requirements."
        };

        // ===================== STATE =====================
        var currentLang = 'hi';

        // ===================== LANG =====================
        var txt = {
            en: {
                'txt-sub': 'Choose a category, prompt auto-copies — ChatGPT opens instantly. Upload your photo and get a professional passport photo in 15 seconds!',
                'sec1': 'Standard Photos',
                'sec2': 'School & College',
                'sec3': 'Baby & Toddler',
                'lbl-male': 'Male Passport Photo',
                'dsc-male': 'Professional male passport photo meeting official government standards',
                'lbl-female': 'Female Passport Photo',
                'dsc-female': 'Professional female passport photo, both ears clearly visible',
                'lbl-hijab': 'Hijab Passport Photo',
                'dsc-hijab': 'Female with hijab passport photo, full face visible',
                'lbl-turban': 'Turban Passport Photo',
                'dsc-turban': 'Male with turban/pagdi passport photo, full face visible',
                'lbl-elderly-male': 'Elderly Male Photo',
                'dsc-elderly-male': 'Senior citizen male passport photo, best quality',
                'lbl-elderly-female': 'Elderly Female Photo',
                'dsc-elderly-female': 'Senior citizen female passport photo, natural & professional',
                'lbl-school-boy': 'School Boy Photo',
                'dsc-school-boy': 'School uniform boy passport photo, perfect for school ID',
                'lbl-school-girl': 'School Girl Photo',
                'dsc-school-girl': 'School uniform girl passport photo, perfect for school ID',
                'lbl-college-boy': 'College Boy Photo',
                'dsc-college-boy': 'College student male professional photo, for admission/ID',
                'lbl-college-girl': 'College Girl Photo',
                'dsc-college-girl': 'College student female professional photo, for admission/ID',
                'lbl-baby-boy': 'Baby Boy (1–2 Yrs)',
                'dsc-baby-boy': '1-2 year old baby boy passport photo, infant standard',
                'lbl-baby-girl': 'Baby Girl (1–2 Yrs)',
                'dsc-baby-girl': '1-2 year old baby girl passport photo, infant standard',
                'cp-male': 'Prompt Copied!',
                'cp-female': 'Prompt Copied!',
                'cp-hijab': 'Prompt Copied!',
                'cp-turban': 'Prompt Copied!',
                'cp-elderly-male': 'Prompt Copied!',
                'cp-elderly-female': 'Prompt Copied!',
                'cp-school-boy': 'Prompt Copied!',
                'cp-school-girl': 'Prompt Copied!',
                'cp-college-boy': 'Prompt Copied!',
                'cp-college-girl': 'Prompt Copied!',
                'cp-baby-boy': 'Prompt Copied!',
                'cp-baby-girl': 'Prompt Copied!',
                'btn-chatgpt': 'Open ChatGPT',
                'btn-home': 'Explore All Tools',
                'toast': '✅ Prompt copied! ChatGPT is opening...'
            },
            hi: {
                'txt-sub': 'Category chunein, prompt auto-copy hoga — ChatGPT khulega, photo upload karein aur 15 seconds mein professional passport photo paayein!',
                'sec1': 'Standard Photos',
                'sec2': 'School & College',
                'sec3': 'Baby & Toddler',
                'lbl-male': 'Male Passport Photo',
                'dsc-male': 'Sarkari maapdand ke anusaar professional male passport photo',
                'lbl-female': 'Female Passport Photo',
                'dsc-female': 'Professional female passport photo, kaanon ke saath clearly visible',
                'lbl-hijab': 'Hijab Passport Photo',
                'dsc-hijab': 'Hijab pehne female ke liye, pura chehra visible',
                'lbl-turban': 'Turban Passport Photo',
                'dsc-turban': 'Pagdi/Turban ke saath passport photo, chehra poori tarah visible',
                'lbl-elderly-male': 'Elderly Male Photo',
                'dsc-elderly-male': 'Budhurgh purush ke liye passport photo, sabse behtar quality',
                'lbl-elderly-female': 'Elderly Female Photo',
                'dsc-elderly-female': 'Budhurgh mahila ke liye passport photo, natural aur professional',
                'lbl-school-boy': 'School Boy Photo',
                'dsc-school-boy': 'School uniform mein boy ka passport photo, school ID ke liye perfect',
                'lbl-school-girl': 'School Girl Photo',
                'dsc-school-girl': 'School uniform mein girl ka passport photo, school ID ke liye',
                'lbl-college-boy': 'College Boy Photo',
                'dsc-college-boy': 'College student boy ka professional photo, admission/ID ke liye',
                'lbl-college-girl': 'College Girl Photo',
                'dsc-college-girl': 'College student girl ka professional photo, admission/ID ke liye',
                'lbl-baby-boy': 'Baby Boy (1–2 Yrs)',
                'dsc-baby-boy': '1 se 2 saal ke baby boy ka passport photo, infant standard',
                'lbl-baby-girl': 'Baby Girl (1–2 Yrs)',
                'dsc-baby-girl': '1 se 2 saal ki baby girl ka passport photo, infant standard',
                'cp-male': 'Prompt Copy ho gaya!',
                'cp-female': 'Prompt Copy ho gaya!',
                'cp-hijab': 'Prompt Copy ho gaya!',
                'cp-turban': 'Prompt Copy ho gaya!',
                'cp-elderly-male': 'Prompt Copy ho gaya!',
                'cp-elderly-female': 'Prompt Copy ho gaya!',
                'cp-school-boy': 'Prompt Copy ho gaya!',
                'cp-school-girl': 'Prompt Copy ho gaya!',
                'cp-college-boy': 'Prompt Copy ho gaya!',
                'cp-college-girl': 'Prompt Copy ho gaya!',
                'cp-baby-boy': 'Prompt Copy ho gaya!',
                'cp-baby-girl': 'Prompt Copy ho gaya!',
                'btn-chatgpt': 'ChatGPT Kholein',
                'btn-home': 'Explore All Tools',
                'toast': '✅ Prompt copy ho gaya! ChatGPT khul raha hai...'
            }
        };

        function setLang(l) {
            currentLang = l;
            document.getElementById('btn-en').classList.toggle('active', l === 'en');
            document.getElementById('btn-hi').classList.toggle('active', l === 'hi');
            document.documentElement.lang = l === 'hi' ? 'hi' : 'en';
            var c = txt[l];
            Object.keys(c).forEach(function(k) {
                var el = document.getElementById(k);
                if (el) el.textContent = c[k];
            });
        }

        // ===================== COPY & OPEN =====================
        function copyAndOpen(type) {
            var prompt = prompts[type];
            var c = txt[currentLang];
            doCopy(prompt);
            var card = document.getElementById('card-' + type);
            if (card) {
                card.classList.add('copied');
                setTimeout(function() { card.classList.remove('copied'); }, 2800);
            }
            showToast(c['toast']);
            setTimeout(function() {
                window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer');
            }, 500);
        }

        function doCopy(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).catch(function() {
                    fallbackCopy(text);
                });
            } else {
                fallbackCopy(text);
            }
        }

        function fallbackCopy(text) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
        }

        var _toast;
        function showToast(msg) {
            var t = document.getElementById('toast');
            if (t) {
                t.textContent = msg;
                t.classList.add('show');
                clearTimeout(_toast);
                _toast = setTimeout(function() {
                    t.classList.remove('show');
                }, 3500);
            }
        }

        function toggleFaq(el) {
            const answer = el.querySelector('.faq-answer');
            const arrow = el.querySelector('.faq-question span');
            if (answer) {
                answer.classList.toggle('show');
                if (arrow) arrow.textContent = answer.classList.contains('show') ? '▲' : '▼';
            }
        }

        // Mobile Menu Toggle
        (function(){
          var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
          if(btn&&menu){
            btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
            menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
          }
        })();

        // Init
        setLang('hi');
    