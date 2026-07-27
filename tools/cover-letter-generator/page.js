
        // ==================== GLOBAL VARIABLES ====================
        let selectedTemplate = 1;
        let lastGeneratedContent = '';

        // DOM Elements
        const templateCards = document.querySelectorAll('.template-card');
        const form = document.getElementById('coverLetterForm');
        const preview = document.getElementById('coverLetterPreview');

        // Input Elements
        const inputs = {
            fullName: document.getElementById('fullName'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            location: document.getElementById('location'),
            linkedin: document.getElementById('linkedin'),
            portfolio: document.getElementById('portfolio'),
            jobTitle: document.getElementById('jobTitle'),
            companyName: document.getElementById('companyName'),
            hiringManager: document.getElementById('hiringManager'),
            experience: document.getElementById('experience'),
            currentJob: document.getElementById('currentJob'),
            skills: document.getElementById('skills'),
            achievement: document.getElementById('achievement'),
            additionalInfo: document.getElementById('additionalInfo')
        };

        // ==================== INITIALIZATION ====================
        document.addEventListener('DOMContentLoaded', function() {
            // Set first template as selected
            if (templateCards.length > 0) {
                templateCards[0].classList.add('selected');
            }

            // Load sample data for demonstration
            loadSampleData();

            // Attach event listeners
            attachEventListeners();

            // Check for saved draft
            checkForSavedDraft();

            // Start auto-save
            startAutoSave();

            // Update progress bar initially
            updateProgressBar();
        });

        function attachEventListeners() {
            // Template selection
            templateCards.forEach(card => {
                card.addEventListener('click', function() {
                    templateCards.forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedTemplate = parseInt(this.getAttribute('data-template'));

                    // If form has data, regenerate preview
                    if (inputs.fullName.value) {
                        generateCoverLetter();
                        showToast('Template changed', 'info');
                    }
                });

                // Keyboard accessibility
                card.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });

            // Form submission
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                if (validateForm()) {
                    generateCoverLetter();
                }
            });

            // Input listeners for real-time preview and progress
            Object.values(inputs).forEach(input => {
                if (input) {
                    input.addEventListener('input', function() {
                        updateProgressBar();
                        updateSkillsPreview();
                    });
                }
            });

            // Skills preview
            document.getElementById('skills').addEventListener('input', updateSkillsPreview);

            // Button listeners
            document.getElementById('downloadPdfBtn').addEventListener('click', downloadAsPDF);
            document.getElementById('printBtn').addEventListener('click', () => window.print());
            document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
            document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
            document.getElementById('loadDraftBtn').addEventListener('click', loadDraft);
            document.getElementById('resetFormBtn').addEventListener('click', resetForm);
        }

        // ==================== FORM VALIDATION ====================
        function validateForm() {
            const required = [{
                    field: inputs.fullName,
                    name: 'Full Name'
                },
                {
                    field: inputs.email,
                    name: 'Email'
                },
                {
                    field: inputs.phone,
                    name: 'Phone'
                },
                {
                    field: inputs.location,
                    name: 'Location'
                },
                {
                    field: inputs.jobTitle,
                    name: 'Job Title'
                },
                {
                    field: inputs.companyName,
                    name: 'Company Name'
                },
                {
                    field: inputs.experience,
                    name: 'Experience'
                },
                {
                    field: inputs.skills,
                    name: 'Skills'
                }
            ];

            for (let item of required) {
                if (!item.field.value || item.field.value.trim() === '') {
                    showToast(`Please enter ${item.name}`, 'error');
                    item.field.focus();
                    return false;
                }
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(inputs.email.value)) {
                showToast('Please enter a valid email address', 'error');
                inputs.email.focus();
                return false;
            }

            // Phone validation
            const phoneRegex = /^[\d\s\-+()]{10,}$/;
            if (!phoneRegex.test(inputs.phone.value.replace(/\s/g, ''))) {
                showToast('Please enter a valid phone number', 'error');
                inputs.phone.focus();
                return false;
            }

            return true;
        }

        // ==================== SKILLS PREVIEW ====================
        function updateSkillsPreview() {
            const skillsInput = inputs.skills.value;
            const preview = document.getElementById('skills-preview');

            if (!skillsInput) {
                preview.innerHTML = '<span class="text-gray-400 text-sm">Skills will appear here</span>';
                return;
            }

            const skills = skillsInput.split(',').map(s => s.trim()).filter(s => s);
            preview.innerHTML = '';

            skills.forEach(skill => {
                if (skill) {
                    const tag = document.createElement('span');
                    tag.className = 'skill-tag';
                    tag.textContent = skill;
                    preview.appendChild(tag);
                }
            });
        }

        // ==================== PROGRESS BAR ====================
        function updateProgressBar() {
            const requiredFields = [
                inputs.fullName, inputs.email, inputs.phone, inputs.location,
                inputs.jobTitle, inputs.companyName, inputs.experience, inputs.skills
            ];

            let filled = 0;
            requiredFields.forEach(field => {
                if (field && field.value && field.value.trim() !== '') {
                    filled++;
                }
            });

            const percentage = Math.round((filled / requiredFields.length) * 100);
            document.getElementById('progress-bar').style.width = percentage + '%';
            document.getElementById('progress-percentage').textContent = percentage + '%';
        }

        // ==================== TAB NAVIGATION ====================
        window.nextTab = function(tabName) {
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
            document.getElementById(tabName + '-tab').classList.remove('hidden');

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active', 'text-indigo-600', 'border-indigo-600');
                btn.classList.add('text-gray-600');
            });

            const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn =>
                btn.dataset.tab === tabName
            );
            if (activeBtn) {
                activeBtn.classList.add('active', 'text-indigo-600', 'border-indigo-600');
            }
        };

        // ==================== COVER LETTER GENERATION ====================
        function generateCoverLetter() {
            if (!validateForm()) return;

            // Show loading state
            preview.innerHTML = `
                <div class="flex items-center justify-center h-64">
                    <div class="loading-spinner"></div>
                    <span class="ml-4 text-gray-600">Generating your cover letter...</span>
                </div>
            `;

            // Get form values
            const values = {};
            Object.keys(inputs).forEach(key => {
                values[key] = inputs[key] ? inputs[key].value : '';
            });

            // Generate based on template
            setTimeout(() => {
                let html = '';
                switch (selectedTemplate) {
                    case 1:
                        html = generateTemplate1(values);
                        break;
                    case 2:
                        html = generateTemplate2(values);
                        break;
                    case 3:
                        html = generateTemplate3(values);
                        break;
                    case 4:
                        html = generateTemplate4(values);
                        break;
                    case 5:
                        html = generateTemplate5(values);
                        break;
                }

                preview.innerHTML = html;
                lastGeneratedContent = html;

                // Update word count
                updateWordCount(html);

                // Update last generated time
                document.getElementById('lastGenerated').textContent = new Date().toLocaleTimeString();

                showToast('Cover letter generated successfully!', 'success');
            }, 300);
        }

        // Template 1: Professional
        function generateTemplate1(values) {
            const date = new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            const manager = values.hiringManager || 'Hiring Manager';
            const skills = values.skills.split(',').map(s => s.trim());
            const achievement = values.achievement ? `<p class="font-medium text-gray-800">Key Achievement: ${values.achievement}</p>` : '';

            return `
                <div class="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg border-l-4 border-indigo-600">
                    <div class="mb-8">
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">${values.fullName}</h1>
                        <div class="flex flex-wrap gap-4 text-gray-600">
                            <div class="flex items-center"><i class="fas fa-envelope mr-2 text-indigo-500"></i>${values.email}</div>
                            <div class="flex items-center"><i class="fas fa-phone mr-2 text-indigo-500"></i>${values.phone}</div>
                            <div class="flex items-center"><i class="fas fa-map-marker-alt mr-2 text-indigo-500"></i>${values.location}</div>
                        </div>
                        ${values.linkedin ? `<div class="flex items-center mt-1"><i class="fab fa-linkedin mr-2 text-indigo-500"></i>${values.linkedin}</div>` : ''}
                    </div>
                    
                    <div class="mb-6 text-gray-600">
                        <p>${date}</p>
                    </div>
                    
                    <div class="mb-6">
                        <p class="font-medium">${manager}<br>${values.companyName}</p>
                    </div>
                    
                    <div class="mb-4">
                        <p class="font-semibold text-lg text-indigo-600">Re: Application for ${values.jobTitle} Position</p>
                    </div>
                    
                    <div class="space-y-4 text-gray-700">
                        <p>Dear ${manager},</p>
                        
                        <p>I am writing to express my strong interest in the ${values.jobTitle} position at ${values.companyName}. With ${values.experience} years of experience and expertise in ${skills.slice(0, 2).join(' and ')}, I am confident in my ability to contribute effectively to your team.</p>
                        
                        ${values.currentJob ? `<p>Currently serving as ${values.currentJob}, I have developed a comprehensive skill set that includes ${skills.join(', ')}.` : `<p>Throughout my career, I have developed expertise in ${skills.join(', ')}.`} My experience has enabled me to deliver consistent results and exceed expectations.</p>
                        
                        ${achievement}
                        
                        ${values.additionalInfo ? `<p>${values.additionalInfo}</p>` : ''}
                        
                        <p>I am particularly drawn to ${values.companyName} because of your reputation for excellence in the industry. I am excited about the opportunity to contribute to your continued success.</p>
                        
                        <p>Thank you for considering my application. I look forward to discussing how my skills and experience align with the needs of your team.</p>
                        
                        <p>Sincerely,<br><span class="font-semibold">${values.fullName}</span></p>
                    </div>
                </div>
            `;
        }

        // Template 2: Creative
        function generateTemplate2(values) {
            const date = new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            const manager = values.hiringManager || 'Hiring Manager';
            const skills = values.skills.split(',').map(s => s.trim());

            return `
                <div class="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-lg border border-blue-200">
                    <div class="text-center mb-8">
                        <h1 class="text-2xl md:text-3xl font-bold text-indigo-700 mb-2">${values.fullName}</h1>
                        <div class="flex flex-wrap justify-center gap-4 text-gray-600">
                            <div class="flex items-center"><i class="fas fa-envelope mr-2 text-indigo-500"></i>${values.email}</div>
                            <div class="flex items-center"><i class="fas fa-phone mr-2 text-indigo-500"></i>${values.phone}</div>
                            <div class="flex items-center"><i class="fas fa-map-marker-alt mr-2 text-indigo-500"></i>${values.location}</div>
                        </div>
                    </div>
                    
                    <div class="mb-6 text-right text-gray-600">
                        <p>${date}</p>
                    </div>
                    
                    <div class="mb-6">
                        <p class="font-medium">${manager}<br>${values.companyName}</p>
                    </div>
                    
                    <div class="mb-4 text-center">
                        <p class="font-bold text-xl text-indigo-700">Application for ${values.jobTitle} Position</p>
                    </div>
                    
                    <div class="space-y-4 text-gray-700">
                        <p>Dear ${manager},</p>
                        
                        <p>I am thrilled to apply for the ${values.jobTitle} position at ${values.companyName}. With ${values.experience} years of creative experience in ${skills.slice(0, 2).join(' and ')}, I bring a unique blend of innovation and technical expertise.</p>
                        
                        <p>My professional journey has been defined by my passion for ${skills[0] || 'creative problem-solving'}. I have successfully delivered projects involving ${skills.join(', ')}, always pushing boundaries while maintaining high quality standards.</p>
                        
                        ${values.achievement ? `<p class="font-medium">✨ ${values.achievement}</p>` : ''}
                        
                        ${values.additionalInfo ? `<p>${values.additionalInfo}</p>` : ''}
                        
                        <p>I am inspired by ${values.companyName}'s innovative approach to ${skills[1] || 'business'} and would love to bring my creative energy to your team. I am confident that my unique perspective would be a valuable addition.</p>
                        
                        <p>Thank you for your time and consideration. I look forward to the opportunity to discuss how I can contribute to ${values.companyName}'s creative vision.</p>
                        
                        <p>Best regards,<br><span class="font-semibold text-indigo-700">${values.fullName}</span></p>
                    </div>
                </div>
            `;
        }

        // Template 3: Modern
        function generateTemplate3(values) {
            const date = new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            const manager = values.hiringManager || 'Hiring Manager';
            const skills = values.skills.split(',').map(s => s.trim());

            return `
                <div class="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-200">
                        <div>
                            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">${values.fullName}</h1>
                            <p class="text-gray-600">${values.currentJob || values.jobTitle} Professional</p>
                        </div>
                        <div class="mt-4 md:mt-0 text-right">
                            <div class="text-gray-600"><i class="fas fa-envelope mr-2 text-indigo-500"></i>${values.email}</div>
                            <div class="text-gray-600"><i class="fas fa-phone mr-2 text-indigo-500"></i>${values.phone}</div>
                            <div class="text-gray-600"><i class="fas fa-map-marker-alt mr-2 text-indigo-500"></i>${values.location}</div>
                        </div>
                    </div>
                    
                    <div class="mb-6 text-gray-600">
                        <p>${date}</p>
                    </div>
                    
                    <div class="mb-6">
                        <p class="font-medium">${manager}<br>${values.companyName}</p>
                    </div>
                    
                    <div class="mb-4">
                        <p class="font-semibold text-gray-800">Subject: Application for ${values.jobTitle} Position</p>
                    </div>
                    
                    <div class="space-y-4 text-gray-700">
                        <p>Dear ${manager},</p>
                        
                        <p>I am writing to apply for the ${values.jobTitle} position at ${values.companyName}. With ${values.experience} years of experience specializing in ${skills.slice(0, 2).join(' and ')}, I have developed a comprehensive skill set that aligns perfectly with your requirements.</p>
                        
                        <p>My expertise spans across ${skills.join(', ')}, with a proven ability to deliver measurable results. I am adept at leveraging these skills to drive innovation and efficiency.</p>
                        
                        ${values.achievement ? `<p>📊 <span class="font-medium">Impact:</span> ${values.achievement}</p>` : ''}
                        
                        ${values.additionalInfo ? `<p>${values.additionalInfo}</p>` : ''}
                        
                        <p>I am impressed by ${values.companyName}'s growth trajectory and would be excited to contribute to your continued success. I am confident that my modern approach to ${skills[0] || 'work'} would be valuable to your team.</p>
                        
                        <p>Thank you for reviewing my application. I look forward to discussing how I can contribute to ${values.companyName}'s objectives.</p>
                        
                        <p>Yours sincerely,<br><span class="font-semibold">${values.fullName}</span></p>
                    </div>
                </div>
            `;
        }

        // Template 4: Elegant
        function generateTemplate4(values) {
            const date = new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            const manager = values.hiringManager || 'Hiring Manager';
            const skills = values.skills.split(',').map(s => s.trim());

            return `
                <div class="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg border-t-4 border-pink-500">
                    <div class="text-center mb-8">
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-1">${values.fullName}</h1>
                        <div class="h-1 w-20 bg-pink-500 mx-auto my-4"></div>
                        <div class="flex flex-wrap justify-center gap-4 text-gray-600">
                            <span>${values.email}</span>
                            <span>${values.phone}</span>
                            <span>${values.location}</span>
                        </div>
                    </div>
                    
                    <div class="mb-8 text-right text-gray-600">
                        <p>${date}</p>
                    </div>
                    
                    <div class="mb-6">
                        <p class="font-medium">${manager}<br>${values.companyName}</p>
                    </div>
                    
                    <div class="mb-4">
                        <p class="font-semibold text-lg text-gray-800">Re: ${values.jobTitle} Position</p>
                    </div>
                    
                    <div class="space-y-4 text-gray-700">
                        <p>Dear ${manager},</p>
                        
                        <p>I am writing to express my sincere interest in the ${values.jobTitle} position at ${values.companyName}. With ${values.experience} years of dedicated experience in ${skills.slice(0, 2).join(' and ')}, I bring a refined skill set and professional approach to every project.</p>
                        
                        <p>My career has been marked by expertise in ${skills.join(', ')}, consistently delivering exceptional results with attention to detail and strategic insight.</p>
                        
                        ${values.achievement ? `<p class="italic">"${values.achievement}"</p>` : ''}
                        
                        ${values.additionalInfo ? `<p>${values.additionalInfo}</p>` : ''}
                        
                        <p>I have long admired ${values.companyName}'s reputation for excellence and would be honored to contribute to your esteemed organization. The opportunity to bring my refined skills to your team is one I approach with great enthusiasm.</p>
                        
                        <p>Thank you for considering my application. I look forward to discussing how my background can benefit your organization.</p>
                        
                        <p>Respectfully yours,<br><span class="font-semibold">${values.fullName}</span></p>
                    </div>
                </div>
            `;
        }

        // Template 5: Minimal
        function generateTemplate5(values) {
            const date = new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            const manager = values.hiringManager || 'Hiring Manager';
            const skills = values.skills.split(',').map(s => s.trim());

            return `
                <div class="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg">
                    <div class="mb-8">
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">${values.fullName}</h1>
                        <div class="text-gray-600">${values.email} | ${values.phone} | ${values.location}</div>
                    </div>
                    
                    <div class="mb-6 text-gray-600">
                        <p>${date}</p>
                    </div>
                    
                    <div class="mb-6">
                        <p>${manager}<br>${values.companyName}</p>
                    </div>
                    
                    <div class="mb-4">
                        <p class="font-medium">${values.jobTitle} Position</p>
                    </div>
                    
                    <div class="space-y-4 text-gray-700">
                        <p>Dear ${manager},</p>
                        
                        <p>I am applying for the ${values.jobTitle} position at ${values.companyName}. With ${values.experience} years of experience in ${skills.slice(0, 2).join(' and ')}, I am confident in my ability to contribute to your team.</p>
                        
                        <p>My skills include ${skills.join(', ')}. I have a track record of delivering results in challenging environments.</p>
                        
                        ${values.achievement ? `<p>→ ${values.achievement}</p>` : ''}
                        
                        ${values.additionalInfo ? `<p>${values.additionalInfo}</p>` : ''}
                        
                        <p>I am interested in ${values.companyName} because of your focus on ${skills[0] || 'innovation'}. I believe my experience would be a valuable addition to your team.</p>
                        
                        <p>Thank you for your consideration. I am available to discuss my qualifications further.</p>
                        
                        <p>Sincerely,<br>${values.fullName}</p>
                    </div>
                </div>
            `;
        }

        // ==================== WORD COUNT ====================
        function updateWordCount(html) {
            const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const words = text.split(' ').filter(word => word.length > 0);
            document.getElementById('wordCount').textContent = words.length;
        }

        // ==================== PDF DOWNLOAD ====================
        function downloadAsPDF() {
            if (!lastGeneratedContent) {
                showToast('Please generate a cover letter first', 'error');
                return;
            }

            const element = document.getElementById('coverLetterPreview');
            const opt = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: `cover_letter_${inputs.fullName.value.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`,
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 2,
                    letterRendering: true
                },
                jsPDF: {
                    unit: 'in',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };

            showToast('Generating PDF...', 'info');

            html2pdf().from(element).set(opt).save().then(() => {
                showToast('PDF downloaded successfully!', 'success');
            }).catch(error => {
                showToast('Error generating PDF', 'error');
                console.error(error);
            });
        }

        // ==================== COPY TO CLIPBOARD ====================
        function copyToClipboard() {
            if (!lastGeneratedContent) {
                showToast('Please generate a cover letter first', 'error');
                return;
            }

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = lastGeneratedContent;
            const text = tempDiv.textContent || tempDiv.innerText;

            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard!', 'success');
            }).catch(() => {
                showToast('Failed to copy', 'error');
            });
        }

        // ==================== DRAFT MANAGEMENT ====================
        function saveDraft() {
            const formData = {};
            Object.keys(inputs).forEach(key => {
                if (inputs[key]) formData[key] = inputs[key].value;
            });
            formData.selectedTemplate = selectedTemplate;

            localStorage.setItem('coverLetterDraft', JSON.stringify(formData));
            showToast('Draft saved successfully!', 'success');
        }

        function loadDraft() {
            const saved = localStorage.getItem('coverLetterDraft');
            if (!saved) {
                showToast('No saved draft found', 'error');
                return;
            }

            try {
                const data = JSON.parse(saved);

                Object.keys(data).forEach(key => {
                    if (inputs[key]) {
                        inputs[key].value = data[key];
                    }
                });

                if (data.selectedTemplate) {
                    selectedTemplate = data.selectedTemplate;
                    templateCards.forEach(card => {
                        card.classList.remove('selected');
                        if (parseInt(card.getAttribute('data-template')) === selectedTemplate) {
                            card.classList.add('selected');
                        }
                    });
                }

                updateSkillsPreview();
                updateProgressBar();
                generateCoverLetter();
                showToast('Draft loaded successfully!', 'success');
            } catch (e) {
                showToast('Error loading draft', 'error');
            }
        }

        function resetForm() {
            if (confirm('Are you sure you want to reset all fields?')) {
                Object.values(inputs).forEach(input => {
                    if (input) input.value = '';
                });

                updateSkillsPreview();
                updateProgressBar();
                preview.innerHTML = `
                    <div class="text-center text-gray-500 italic h-full flex items-center justify-center">
                        <div>
                            <i class="fas fa-file-alt text-5xl mb-4 text-gray-300"></i>
                            <p class="text-lg">Select a template and fill out the form to generate your cover letter</p>
                        </div>
                    </div>
                `;
                lastGeneratedContent = '';

                showToast('Form reset', 'info');
            }
        }

        function checkForSavedDraft() {
            const saved = localStorage.getItem('coverLetterDraft');
            if (saved) {
                if (confirm('You have a saved draft. Would you like to load it?')) {
                    loadDraft();
                }
            }
        }

        // ==================== AUTO SAVE ====================
        function startAutoSave() {
            setInterval(() => {
                if (Object.values(inputs).some(input => input && input.value)) {
                    saveDraft();
                }
            }, 30000); // Auto save every 30 seconds
        }

        // ==================== SAMPLE DATA ====================
        function loadSampleData() {
            inputs.fullName.value = 'John Doe';
            inputs.email.value = 'john.doe@example.com';
            inputs.phone.value = '(123) 456-7890';
            inputs.location.value = 'New York, NY';
            inputs.jobTitle.value = 'Frontend Developer';
            inputs.companyName.value = 'Tech Solutions Inc.';
            inputs.hiringManager.value = 'Jane Smith';
            inputs.experience.value = '5';
            inputs.currentJob.value = 'Senior Frontend Developer';
            inputs.skills.value = 'JavaScript, React, HTML, CSS, UI/UX Design, Team Leadership';
            inputs.achievement.value = 'Led development of a web application used by 10,000+ monthly active users';
            inputs.additionalInfo.value = 'Passionate about creating intuitive user experiences and mentoring junior developers.';

            updateSkillsPreview();
            updateProgressBar();
        }

        // ==================== TOAST NOTIFICATIONS ====================
        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');

            const colors = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                info: 'bg-blue-500',
                warning: 'bg-yellow-500'
            };

            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                info: 'fa-info-circle',
                warning: 'fa-exclamation-triangle'
            };

            toast.className = `toast-message ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center`;
            toast.innerHTML = `
                <i class="fas ${icons[type]} mr-3"></i>
                ${message}
            `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // ==================== SHARE FUNCTIONS ====================
        window.shareOnWhatsApp = function() {
            const text = 'Check out this free Cover Letter Generator - Create professional job application letters online';
            const url = window.location.href;
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        };

        window.shareOnFacebook = function() {
            const url = window.location.href;
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        };

        window.shareOnTwitter = function() {
            const text = 'Free Cover Letter Generator - Create professional job application letters in minutes';
            const url = window.location.href;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        };

        window.shareOnLinkedIn = function() {
            const title = 'Free Cover Letter Generator';
            const summary = 'Create professional job application letters instantly';
            const url = window.location.href;
            window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`, '_blank');
        };
    