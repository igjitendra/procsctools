
    // Resume Data Management
    let sections = [];
    let headerColor = "#166534";
    let headingFont = "'Times New Roman', Times, serif";
    let headingSize = "22px";
    let bodyFont = "'Times New Roman', Times, serif";
    let bodySize = "11px";
    let photoDataURL = "";
    let sectionIdCounter = 100;
    let fieldIdCounter = 1000;
    let resumeCounter = 78234;
    let userCounter = 52847;
    
    // Animate counters
    function animateCounters() {
        let resumeElement = document.getElementById('resumeCount');
        let userElement = document.getElementById('userCount');
        if(resumeElement) {
            let currentResume = 72000;
            let targetResume = resumeCounter;
            let interval = setInterval(() => {
                if(currentResume < targetResume) {
                    currentResume += Math.ceil((targetResume - currentResume) / 30);
                    if(currentResume > targetResume) currentResume = targetResume;
                    resumeElement.textContent = currentResume.toLocaleString();
                } else {
                    clearInterval(interval);
                }
            }, 25);
        }
        if(userElement) {
            let currentUser = 48000;
            let targetUser = userCounter;
            let interval = setInterval(() => {
                if(currentUser < targetUser) {
                    currentUser += Math.ceil((targetUser - currentUser) / 30);
                    if(currentUser > targetUser) currentUser = targetUser;
                    userElement.textContent = currentUser.toLocaleString();
                } else {
                    clearInterval(interval);
                }
            }, 25);
        }
    }
    
    // Default sections data
    function initializeDefaultSections() {
        return [
            { id: "sec1", name: "Personal Details", fields: [
                { id: "f1", label: "Full Name", value: "Tivisha Chadokar", type: "text" },
                { id: "f2", label: "Address", value: "H.No. 257, Sector 2, New Mandideep - 422046", type: "text" },
                { id: "f3", label: "Contact Number", value: "+91 7000059835", type: "text" },
                { id: "f4", label: "Email ID", value: "tivisha@example.com", type: "email" }
            ]},
            { id: "sec2", name: "Career Objective", fields: [
                { id: "f5", label: "Objective", value: "To secure a challenging position in a reputed organization where I can utilize my skills and contribute to organizational growth while enhancing my knowledge.", type: "textarea" }
            ]},
            { id: "sec3", name: "Academic Qualification", fields: [
                { id: "f6", label: "10th", value: "CBSE | 2015 | 85% | First Division", type: "text" },
                { id: "f7", label: "12th", value: "CBSE | 2017 | 78% | First Division", type: "text" },
                { id: "f8", label: "B.Com", value: "Delhi University | 2020 | 72% | First Division", type: "text" }
            ]},
            { id: "sec4", name: "Professional Qualification", fields: [
                { id: "f9", label: "Diploma in Computer Application", value: "NIELIT | 2018 | A Grade", type: "text" }
            ]},
            { id: "sec5", name: "Extra Qualification", fields: [
                { id: "f10", label: "Skills", value: "Typing Speed 40 wpm, MS Office Specialist, Tally ERP, Internet Browsing", type: "text" }
            ]},
            { id: "sec6", name: "Work Experience", fields: [
                { id: "f11", label: "Experience", value: "Junior Accountant at ABC Pvt Ltd (2021-2023): Handled GST & TDS returns, financial reporting\nInternship at XYZ Corp: Assisted in auditing and data entry", type: "textarea" }
            ]},
            { id: "sec7", name: "Personal Information", fields: [
                { id: "f12", label: "Father's Name", value: "Shri Chandrashekhar", type: "text" },
                { id: "f13", label: "Date of Birth", value: "15/08/1997", type: "text" },
                { id: "f14", label: "Gender", value: "Female", type: "text" },
                { id: "f15", label: "Marital Status", value: "Unmarried", type: "text" },
                { id: "f16", label: "Nationality", value: "Indian", type: "text" },
                { id: "f17", label: "Languages Known", value: "Hindi, English", type: "text" }
            ]},
            { id: "sec8", name: "Declaration", fields: [
                { id: "f18", label: "Declaration", value: "I hereby declare that the above information is true and correct to the best of my knowledge.", type: "textarea" }
            ]},
            { id: "sec9", name: "Signature Details", fields: [
                { id: "f19", label: "Place", value: "Mandideep", type: "text" },
                { id: "f20", label: "Date", value: new Date().toLocaleDateString('en-IN'), type: "text" },
                { id: "f21", label: "Signature", value: "Tivisha", type: "text" }
            ]}
        ];
    }
    
    sections = initializeDefaultSections();
    
    // Reorder sections function
    function moveSectionUp(index) {
        if (index > 0) {
            [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
            renderFormBuilder();
            updatePreview();
        }
    }
    
    function moveSectionDown(index) {
        if (index < sections.length - 1) {
            [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
            renderFormBuilder();
            updatePreview();
        }
    }
    
    function renderFormBuilder() {
        let container = document.getElementById('sectionsContainer');
        if(!container) return;
        container.innerHTML = '';
        
        sections.forEach((sec, index) => {
            let secDiv = document.createElement('div');
            secDiv.className = 'form-section';
            secDiv.setAttribute('data-section-id', sec.id);
            
            let fieldsHtml = '';
            sec.fields.forEach((field) => {
                fieldsHtml += `
                    <div class="field-row" data-field-id="${field.id}">
                        <div class="field-content">
                            <input type="text" class="field-label-input" data-field-id="${field.id}" data-field-type="label" value="${escapeHtml(field.label)}" placeholder="Field Name">
                            ${field.type === 'textarea' ? 
                                `<textarea class="field-value-input" data-field-id="${field.id}" data-field-type="value" rows="2" placeholder="Field Value">${escapeHtml(field.value)}</textarea>` :
                                `<input type="text" class="field-value-input" data-field-id="${field.id}" data-field-type="value" value="${escapeHtml(field.value)}" placeholder="Field Value">`
                            }
                        </div>
                        <button class="remove-field-btn" data-section-id="${sec.id}" data-field-id="${field.id}">✖ Remove</button>
                    </div>
                `;
            });
            
            secDiv.innerHTML = `
                <div class="section-header">
                    <div class="section-header-left">
                        <span class="drag-handle">⋮⋮</span>
                        <input type="text" class="section-name-input" data-section-id="${sec.id}" value="${escapeHtml(sec.name)}" placeholder="Section Name">
                    </div>
                    <div class="section-actions">
                        <button class="move-up-btn" data-index="${index}" ${index === 0 ? 'disabled' : ''}>↑ Up</button>
                        <button class="move-down-btn" data-index="${index}" ${index === sections.length - 1 ? 'disabled' : ''}>↓ Down</button>
                        <button class="add-field-btn-section" data-section-id="${sec.id}">+ Add Field</button>
                        <button class="remove-section-btn" data-section-id="${sec.id}">✖ Remove</button>
                    </div>
                </div>
                <div class="fields-container">
                    ${fieldsHtml}
                </div>
            `;
            container.appendChild(secDiv);
        });
        
        attachFormEvents();
    }
    
    function attachFormEvents() {
        document.querySelectorAll('.section-name-input').forEach(input => {
            input.onchange = (e) => {
                let sec = sections.find(s => s.id === e.target.dataset.sectionId);
                if(sec) sec.name = e.target.value;
                updatePreview();
            };
        });
        
        document.querySelectorAll('.move-up-btn').forEach(btn => {
            btn.onclick = () => {
                let index = parseInt(btn.dataset.index);
                moveSectionUp(index);
            };
        });
        
        document.querySelectorAll('.move-down-btn').forEach(btn => {
            btn.onclick = () => {
                let index = parseInt(btn.dataset.index);
                moveSectionDown(index);
            };
        });
        
        document.querySelectorAll('.remove-section-btn').forEach(btn => {
            btn.onclick = () => {
                if(confirm('Are you sure you want to remove this section?')) {
                    sections = sections.filter(s => s.id !== btn.dataset.sectionId);
                    renderFormBuilder();
                    updatePreview();
                }
            };
        });
        
        document.querySelectorAll('.add-field-btn-section').forEach(btn => {
            btn.onclick = () => {
                let sec = sections.find(s => s.id === btn.dataset.sectionId);
                if(sec) {
                    let newId = 'f' + (++fieldIdCounter);
                    sec.fields.push({ id: newId, label: "New Field", value: "", type: "text" });
                    renderFormBuilder();
                    updatePreview();
                }
            };
        });
        
        document.querySelectorAll('.remove-field-btn').forEach(btn => {
            btn.onclick = () => {
                let sec = sections.find(s => s.id === btn.dataset.sectionId);
                if(sec) {
                    sec.fields = sec.fields.filter(f => f.id !== btn.dataset.fieldId);
                    renderFormBuilder();
                    updatePreview();
                }
            };
        });
        
        document.querySelectorAll('.field-label-input, .field-value-input').forEach(el => {
            el.oninput = (e) => {
                let fieldId = e.target.dataset.fieldId;
                let fieldType = e.target.dataset.fieldType;
                for(let sec of sections) {
                    let field = sec.fields.find(f => f.id == fieldId);
                    if(field) {
                        if(fieldType === 'label') {
                            field.label = e.target.value;
                        } else {
                            field.value = e.target.value;
                        }
                        updatePreview();
                        break;
                    }
                }
            };
        });
    }
    
    function updatePreview() {
        let resumeHTML = `
            <div class="resume-title" style="font-family: ${headingFont}; font-size: ${headingSize};">RESUME</div>
            <div class="resume-header" style="border-bottom-color: ${headerColor};">
                <div class="header-left">
                    <h1 style="font-family: ${headingFont}; font-size: ${headingSize};"></h1>
                    <div class="contact-details" style="font-family: ${bodyFont}; font-size: ${bodySize};">
                        <p><strong>Address:</strong> </p>
                        <p><strong>Contact:</strong> </p>
                        <p><strong>Email:</strong> </p>
                    </div>
                </div>
                ${photoDataURL ? `<div class="photo-container"><img src="${photoDataURL}" alt="Passport Photo"></div>` : ''}
            </div>`;
        
        sections.forEach(sec => {
            if(sec.fields.length === 0) return;
            
            if(sec.name !== "Personal Details") {
                resumeHTML += `<div class="section-head" style="background:${headerColor}; font-family: ${headingFont}; font-size: ${bodySize}; color:white;">${escapeHtml(sec.name).toUpperCase()}</div>`;
            }
            
            if(sec.name === "Personal Details") {
                let nameVal = "", addressVal = "", contactVal = "", emailVal = "";
                sec.fields.forEach(f => {
                    if(f.label === "Full Name") nameVal = f.value;
                    if(f.label === "Address") addressVal = f.value;
                    if(f.label === "Contact Number") contactVal = f.value;
                    if(f.label === "Email ID") emailVal = f.value;
                });
                resumeHTML = resumeHTML.replace("<h1", `<h1 style=\"font-family: ${headingFont}; font-size: ${headingSize};\">${escapeHtml(nameVal) || 'Your Name'}</h1`);
                resumeHTML = resumeHTML.replace("<p><strong>Address:</strong> </p>", `<p><strong>Address:</strong> ${escapeHtml(addressVal)}</p>`);
                resumeHTML = resumeHTML.replace("<p><strong>Contact:</strong> </p>", `<p><strong>Contact:</strong> ${escapeHtml(contactVal)}</p>`);
                resumeHTML = resumeHTML.replace("<p><strong>Email:</strong> </p>", `<p><strong>Email:</strong> ${escapeHtml(emailVal)}</p>`);
            } 
            else if(sec.name === "Academic Qualification") {
                resumeHTML += `<table class="qualification-table" style="font-family: ${bodyFont}; font-size: ${bodySize};">
                    <thead><tr><th>Qualification</th><th>Details</th></tr></thead>
                    <tbody>${sec.fields.map(f => `<tr><td>${escapeHtml(f.label)}</td><td>${escapeHtml(f.value)}</td></tr>`).join('')}</tbody>
                </table>`;
            }
            else if(sec.name === "Professional Qualification") {
                resumeHTML += `<table class="qualification-table" style="font-family: ${bodyFont}; font-size: ${bodySize};">
                    <thead><tr><th>Course/Certificate</th><th>Details</th></tr></thead>
                    <tbody>${sec.fields.map(f => `<tr><td>${escapeHtml(f.label)}</td><td>${escapeHtml(f.value)}</td></tr>`).join('')}</tbody>
                </table>`;
            }
            else if(sec.name === "Extra Qualification") {
                let skills = sec.fields[0]?.value || "";
                let skillsList = skills.split(',').map(s => `<li>${escapeHtml(s.trim())}</li>`).join('');
                resumeHTML += `<ul class="bullet-list" style="font-family: ${bodyFont}; font-size: ${bodySize};">${skillsList || '<li>Not specified</li>'}</ul>`;
            }
            else if(sec.name === "Work Experience") {
                resumeHTML += `<div style="font-family: ${bodyFont}; font-size: ${bodySize}; white-space:pre-line; line-height:1.5;">${escapeHtml(sec.fields[0]?.value || 'Fresher / No Experience').replace(/\n/g, '<br>')}</div>`;
            }
            else if(sec.name === "Personal Information") {
                let father = "", dob = "", gender = "", marital = "", nationality = "", languages = "";
                sec.fields.forEach(f => {
                    if(f.label === "Father's Name") father = f.value;
                    if(f.label === "Date of Birth") dob = f.value;
                    if(f.label === "Gender") gender = f.value;
                    if(f.label === "Marital Status") marital = f.value;
                    if(f.label === "Nationality") nationality = f.value;
                    if(f.label === "Languages Known") languages = f.value;
                });
                resumeHTML += `<div class="two-column" style="font-family: ${bodyFont}; font-size: ${bodySize};">
                    <div class="col"><strong>Father's Name:</strong> ${escapeHtml(father)}<br><strong>Gender:</strong> ${escapeHtml(gender)}<br><strong>Nationality:</strong> ${escapeHtml(nationality)}</div>
                    <div class="col"><strong>Date of Birth:</strong> ${escapeHtml(dob)}<br><strong>Marital Status:</strong> ${escapeHtml(marital)}<br><strong>Languages Known:</strong> ${escapeHtml(languages)}</div>
                </div>`;
            }
            else if(sec.name === "Declaration") {
                resumeHTML += `<div class="declaration-text" style="font-family: ${bodyFont}; font-size: ${bodySize};">${escapeHtml(sec.fields[0]?.value || '')}</div>`;
            }
            else if(sec.name === "Signature Details") {
                let place = "", date = "", signature = "";
                sec.fields.forEach(f => {
                    if(f.label === "Place") place = f.value;
                    if(f.label === "Date") date = f.value;
                    if(f.label === "Signature") signature = f.value;
                });
                resumeHTML += `<div class="signature-line" style="font-family: ${bodyFont}; font-size: ${bodySize};">
                    <div><strong>Place:</strong> ${escapeHtml(place)}</div>
                    <div><strong>Date:</strong> ${escapeHtml(date)}</div>
                    <div><strong>Signature:</strong> (${escapeHtml(signature)})</div>
                </div>`;
            }
            else {
                sec.fields.forEach(f => {
                    resumeHTML += `<div style="font-family: ${bodyFont}; font-size: ${bodySize}; margin-bottom: 10px;">
                        <strong>${escapeHtml(f.label)}:</strong> ${escapeHtml(f.value)}
                    </div>`;
                });
            }
        });
        
        resumeHTML += `<hr style="margin-top: 15px;"><div style="font-size:7px; text-align:center; margin-top:10px; color:#94a3b8;">Generated by Pro CSC Tools • procsctools.in</div>`;
        document.getElementById('resumeContainer').innerHTML = resumeHTML;
    }
    
    function escapeHtml(str) {
        if(!str) return '';
        return String(str).replace(/[&<>]/g, function(m) {
            if(m === '&') return '&amp;';
            if(m === '<') return '&lt;';
            if(m === '>') return '&gt;';
            return m;
        });
    }
    
    // Photo handling
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoInput = document.getElementById('photoInput');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    
    photoUploadArea.onclick = () => photoInput.click();
    
    photoInput.onchange = (e) => {
        if(e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if(file.size > 2 * 1024 * 1024) {
                alert('Photo size should be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                photoDataURL = ev.target.result;
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    };
    
    removePhotoBtn.onclick = () => {
        photoDataURL = "";
        photoInput.value = "";
        updatePreview();
    };
    
    document.getElementById('addMainSectionBtn').onclick = () => {
        let newId = 'sec' + (++sectionIdCounter);
        sections.push({
            id: newId,
            name: "New Section",
            fields: [{ id: 'f' + (++fieldIdCounter), label: "New Field", value: "", type: "text" }]
        });
        renderFormBuilder();
        updatePreview();
    };
    
    document.getElementById('resetAllBtn').onclick = () => {
        if(confirm('This will reset all your data. Are you sure?')) {
            sections = initializeDefaultSections();
            photoDataURL = "";
            headerColor = "#166534";
            headingFont = "'Times New Roman', Times, serif";
            headingSize = "22px";
            bodyFont = "'Times New Roman', Times, serif";
            bodySize = "11px";
            document.getElementById('headerColorPicker').value = "#166534";
            document.getElementById('headingFontSelect').value = "'Times New Roman', Times, serif";
            document.getElementById('headingSizeSelect').value = "22px";
            document.getElementById('bodyFontSelect').value = "'Times New Roman', Times, serif";
            document.getElementById('bodySizeSelect').value = "11px";
            photoInput.value = "";
            renderFormBuilder();
            updatePreview();
        }
    };
    
    document.getElementById('refreshPreviewBtn').onclick = () => updatePreview();
    document.getElementById('headerColorPicker').onchange = (e) => { headerColor = e.target.value; updatePreview(); };
    document.getElementById('headingFontSelect').onchange = (e) => { headingFont = e.target.value; updatePreview(); };
    document.getElementById('headingSizeSelect').onchange = (e) => { headingSize = e.target.value; updatePreview(); };
    document.getElementById('bodyFontSelect').onchange = (e) => { bodyFont = e.target.value; updatePreview(); };
    document.getElementById('bodySizeSelect').onchange = (e) => { bodySize = e.target.value; updatePreview(); };
    
    async function downloadPDF() {
        const element = document.getElementById('resumeContainer');
        const opt = {
            margin: [0.4, 0.4, 0.4, 0.4],
            filename: 'Professional_Resume.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, letterRendering: true, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        try {
            await html2pdf().set(opt).from(element).save();
            alert('PDF downloaded successfully!');
        } catch(error) {
            alert('Error generating PDF. Please try again.');
        }
    }
    
    document.getElementById('downloadPdfBtn').onclick = downloadPDF;
    document.getElementById('printResumeBtn').onclick = () => window.print();
    
    window.toggleFaq = function(element) {
        const answer = element.querySelector('.faq-answer');
        answer.classList.toggle('show');
        const icon = element.querySelector('.faq-question span');
        if(icon) icon.innerHTML = answer.classList.contains('show') ? '▲' : '▼';
    };
    
    // Initialize
    renderFormBuilder();
    updatePreview();
    animateCounters();


    // ===== Pro CSC Tools mobile menu =====
    (function(){
      var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
      if(btn&&menu){
        btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
        menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
      }
    })();

