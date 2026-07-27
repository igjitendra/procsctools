
        const stampImages = {
            '10': 'https://procsctools.in/images/stamp-10.webp',
            '20': 'https://procsctools.in/images/stamp-20.webp',
            '50': 'https://procsctools.in/images/stamp-50.webp',
            '100': 'https://procsctools.in/images/stamp-100.webp'
        };

        let customStampData = null;
        let currentLanguage = 'english';
        let currentAffidavitType = 'name_change';
        let currentStampValue = null;

        function toggleFaq(el) {
            const answer = el.querySelector('.faq-answer');
            const arrow = el.querySelector('.faq-question span');
            if (answer) {
                answer.classList.toggle('show');
                if (arrow) arrow.textContent = answer.classList.contains('show') ? '▲' : '▼';
            }
        }

        const templates = {
            english: {
                name_change: {
                    title: "AFFIDAVIT FOR NAME CHANGE",
                    body: "I, {name}, son/daughter/wife of {father}, resident of {address}, do hereby solemnly affirm and state on oath as under:\n\n1. That my original name as recorded in my educational certificates and other documents is {incorrect}.\n\n2. That I wish to change my name from {incorrect} to {correct} for personal and professional reasons.\n\n3. That I have relinquished all rights and claims associated with my previous name {incorrect}.\n\n4. That I have published a public notice regarding this name change in the leading newspapers.\n\n5. That I shall use the name {correct} for all future official purposes and dealings.\n\n6. That I have no intention to defraud or deceive anyone through this name change.\n\nI, the above named deponent, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. No part of it is false and nothing material has been concealed therefrom."
                },
                address_change: {
                    title: "AFFIDAVIT FOR ADDRESS CHANGE",
                    body: "I, {name}, son/daughter/wife of {father}, do hereby solemnly affirm and declare as under:\n\n1. That my previous residential address was {incorrect}.\n\n2. That I have permanently shifted to my current address: {address}.\n\n3. That I am residing at the said address since recently.\n\n4. That I am making this affidavit for the purpose of updating my address in official records including Aadhaar, Voter ID, Passport, Bank Accounts, etc.\n\n5. That I have valid address proof documents for my current address.\n\nI, the above named deponent, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. No part of it is false and nothing material has been concealed therefrom."
                },
                dob_correction: {
                    title: "AFFIDAVIT FOR DATE OF BIRTH CORRECTION",
                    body: "I, {name}, son/daughter/wife of {father}, resident of {address}, do hereby solemnly affirm and declare as under:\n\n1. That my correct date of birth is {correct}.\n\n2. That due to a clerical error, my date of birth has been incorrectly recorded as {incorrect} in certain documents.\n\n3. That I possess valid documentary evidence supporting my correct date of birth, including Birth Certificate/School Leaving Certificate.\n\n4. That I request the concerned authorities to correct my date of birth from {incorrect} to {correct} in all official records.\n\n5. That I am making this affidavit to support my application for date of birth correction.\n\nI, the above named deponent, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. No part of it is false and nothing material has been concealed therefrom."
                },
                education_correction: {
                    title: "AFFIDAVIT FOR EDUCATION CERTIFICATE CORRECTION",
                    body: "I, {name}, son/daughter/wife of {father}, resident of {address}, do hereby solemnly affirm and declare as under:\n\n1. That I possess an educational certificate wherein an error has occurred.\n\n2. That the certificate incorrectly shows: {incorrect}.\n\n3. That the correct information should be: {correct}.\n\n4. That this error occurred due to administrative/clerical mistake at the time of issuance.\n\n5. That I request the concerned educational board/university to make the necessary correction in my certificate.\n\nI, the above named deponent, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. No part of it is false and nothing material has been concealed therefrom."
                },
                passport_correction: {
                    title: "AFFIDAVIT FOR PASSPORT DETAILS CORRECTION",
                    body: "I, {name}, son/daughter/wife of {father}, resident of {address}, do hereby solemnly affirm and declare as under:\n\n1. That I am an applicant/holder of Indian Passport.\n\n2. That there is an error in my passport record regarding: {incorrect}.\n\n3. That the correct information that should be reflected is: {correct}.\n\n4. That I request the Passport Office to make the necessary correction in my passport.\n\nI, the above named deponent, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. No part of it is false and nothing material has been concealed therefrom."
                },
                marriage: {
                    title: "MARRIAGE AFFIDAVIT",
                    body: "I, {name}, son/daughter/wife of {father}, resident of {address}, do hereby solemnly affirm and declare as under:\n\n1. That I am legally married to {correct} (Spouse Name).\n\n2. That our marriage was solemnized as per custom and rites.\n\n3. That both parties were of legal age and consenting to this marriage.\n\n4. That there is no legal impediment to this marriage.\n\n5. That neither party has any spouse living at the time of marriage.\n\n6. That we are living together as husband and wife since the date of marriage.\n\nI, the above named deponent, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. No part of it is false and nothing material has been concealed therefrom."
                },
                general: {
                    title: "GENERAL AFFIDAVIT",
                    body: "I, {name}, son/daughter/wife of {father}, resident of {address}, do hereby solemnly affirm and declare as under:\n\n{additional}\n\nI, the above named deponent, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. No part of it is false and nothing material has been concealed therefrom."
                },
                custom: {
                    title: "CUSTOM AFFIDAVIT",
                    body: "I, {name}, son/daughter/wife of {father}, resident of {address}, do hereby solemnly affirm and declare as under:\n\n{additional}\n\nI, the above named deponent, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief. No part of it is false and nothing material has been concealed therefrom."
                }
            },
            hindi: {
                name_change: {
                    title: "नाम परिवर्तन हलफनामा",
                    body: "मैं, {name}, पुत्र/पुत्री/पत्नी {father}, निवासी {address}, शपथपूर्वक घोषित करता/करती हूं कि:\n\n1. कि मेरे शैक्षिक प्रमाण पत्रों एवं अन्य दस्तावेजों में मेरा मूल नाम {incorrect} दर्ज है।\n\n2. कि मैं व्यक्तिगत एवं व्यावसायिक कारणों से अपना नाम {incorrect} से बदलकर {correct} करना चाहता/चाहती हूं।\n\n3. कि मैंने प्रमुख समाचार पत्रों में इस नाम परिवर्तन की सूचना प्रकाशित करवा दी है।\n\n4. कि मैं भविष्य के सभी कार्यों में {correct} नाम का ही प्रयोग करूंगा/करूंगी।\n\n5. कि इस नाम परिवर्तन से किसी को कोई हानि नहीं होगी।\n\nमैं उपरोक्त घोषणा करता/करती हूं कि यह हलफनामा मेरी जानकारी और विश्वास के अनुसार सत्य एवं सही है।"
                },
                address_change: {
                    title: "पता परिवर्तन हलफनामा",
                    body: "मैं, {name}, पुत्र/पुत्री/पत्नी {father}, निवासी {address}, शपथपूर्वक घोषित करता/करती हूं कि:\n\n1. कि मेरा पिछला पता {incorrect} था।\n\n2. कि मैं स्थायी रूप से अपने वर्तमान पते {address} पर आ गया/गई हूं।\n\n3. कि मैं आधार, वोटर आईडी, पासपोर्ट, बैंक खातों में पता अद्यतन करने हेतु यह हलफनामा दे रहा/रही हूं।\n\nमैं उपरोक्त घोषणा करता/करती हूं कि यह हलफनामा मेरी जानकारी और विश्वास के अनुसार सत्य एवं सही है।"
                },
                dob_correction: {
                    title: "जन्म तिथि सुधार हलफनामा",
                    body: "मैं, {name}, पुत्र/पुत्री/पत्नी {father}, निवासी {address}, शपथपूर्वक घोषित करता/करती हूं कि:\n\n1. कि मेरी सही जन्म तिथि {correct} है।\n\n2. कि कुछ दस्तावेजों में त्रुटिवश मेरी जन्म तिथि {incorrect} दर्ज हो गई है।\n\n3. कि मेरे पास अपनी सही जन्म तिथि के प्रमाण हैं।\n\nमैं उपरोक्त घोषणा करता/करती हूं कि यह हलफनामा मेरी जानकारी और विश्वास के अनुसार सत्य एवं सही है।"
                },
                education_correction: {
                    title: "शैक्षिक प्रमाण पत्र सुधार हलफनामा",
                    body: "मैं, {name}, पुत्र/पुत्री/पत्नी {father}, निवासी {address}, शपथपूर्वक घोषित करता/करती हूं कि:\n\n1. कि मेरे शैक्षिक प्रमाण पत्र में त्रुटि है: {incorrect}।\n\n2. कि सही जानकारी {correct} होनी चाहिए।\n\n3. कि यह त्रुटि प्रशासनिक/लेखन संबंधी गलती के कारण हुई है।\n\nमैं उपरोक्त घोषणा करता/करती हूं कि यह हलफनामा मेरी जानकारी और विश्वास के अनुसार सत्य एवं सही है।"
                },
                passport_correction: {
                    title: "पासपोर्ट विवरण सुधार हलफनामा",
                    body: "मैं, {name}, पुत्र/पुत्री/पत्नी {father}, निवासी {address}, शपथपूर्वक घोषित करता/करती हूं कि:\n\n1. कि मेरे पासपोर्ट में {incorrect} में त्रुटि है।\n\n2. कि सही जानकारी {correct} है।\n\n3. कि मैं पासपोर्ट कार्यालय से सुधार का अनुरोध करता/करती हूं।\n\nमैं उपरोक्त घोषणा करता/करती हूं कि यह हलफनामा मेरी जानकारी और विश्वास के अनुसार सत्य एवं सही है।"
                },
                marriage: {
                    title: "विवाह हलफनामा",
                    body: "मैं, {name}, पुत्र/पुत्री/पत्नी {father}, निवासी {address}, शपथपूर्वक घोषित करता/करती हूं कि:\n\n1. कि मेरा विवाह {correct} से हुआ है।\n\n2. कि दोनों पक्ष विधिक आयु के हैं।\n\n3. कि इस विवाह में कोई विधिक बाधा नहीं है।\n\n4. कि विवाह के समय दोनों पक्ष अविवाहित थे।\n\nमैं उपरोक्त घोषणा करता/करती हूं कि यह हलफनामा मेरी जानकारी और विश्वास के अनुसार सत्य एवं सही है।"
                },
                general: {
                    title: "सामान्य हलफनामा",
                    body: "मैं, {name}, पुत्र/पुत्री/पत्नी {father}, निवासी {address}, शपथपूर्वक घोषित करता/करती हूं कि:\n\n{additional}\n\nमैं उपरोक्त घोषणा करता/करती हूं कि यह हलफनामा मेरी जानकारी और विश्वास के अनुसार सत्य एवं सही है।"
                },
                custom: {
                    title: "कस्टम हलफनामा",
                    body: "मैं, {name}, पुत्र/पुत्री/पत्नी {father}, निवासी {address}, शपथपूर्वक घोषित करता/करती हूं कि:\n\n{additional}\n\nमैं उपरोक्त घोषणा करता/करती हूं कि यह हलफनामा मेरी जानकारी और विश्वास के अनुसार सत्य एवं सही है।"
                }
            }
        };

        function getCurrentDate() {
            return new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        function uploadCustomStamp() {
            const file = document.getElementById('customStampUpload').files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                showToast('File size should be less than 2MB', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                customStampData = e.target.result;
                currentStampValue = 'custom';
                document.getElementById('stampPaperImage').src = customStampData;
                document.getElementById('stampImageContainer').style.display = 'block';
                ['10', '20', '50', '100'].forEach(v => {
                    const el = document.getElementById(`stamp-${v}`);
                    if(el) el.classList.remove('active');
                });
                adjustStampTopSpace();
                showToast('Custom stamp uploaded successfully');
            };
            reader.readAsDataURL(file);
        }

        function selectStamp(value) {
            currentStampValue = value;
            customStampData = null;
            ['10', '20', '50', '100'].forEach(v => {
                const el = document.getElementById(`stamp-${v}`);
                if (el) v === value ? el.classList.add('active') : el.classList.remove('active');
            });
            document.getElementById('stampPaperImage').src = stampImages[value];
            document.getElementById('stampImageContainer').style.display = 'block';
            adjustStampTopSpace();
            showToast(`₹${value} Stamp Paper selected`);
        }

        function removeStamp() {
            currentStampValue = null;
            customStampData = null;
            ['10', '20', '50', '100'].forEach(v => {
                const el = document.getElementById(`stamp-${v}`);
                if(el) el.classList.remove('active');
            });
            document.getElementById('stampImageContainer').style.display = 'none';
            document.getElementById('stampTopSpace').value = '1.0';
            document.getElementById('stampTopValue').innerText = '1.0';
            document.getElementById('stampSpaceDiv').style.height = '0px';
            showToast('Stamp paper removed');
        }

        function adjustStampTopSpace() {
            const value = parseFloat(document.getElementById('stampTopSpace').value);
            document.getElementById('stampTopValue').innerText = value;
            if (currentStampValue) document.getElementById('stampSpaceDiv').style.height = (value * 96) + 'px';
            else document.getElementById('stampSpaceDiv').style.height = '0px';
        }

        function updatePreview() {
            const name = document.getElementById('deponentName').value || '[Deponent Name]';
            const father = document.getElementById('fatherName').value || '[Father/Husband Name]';
            const mother = document.getElementById('motherName').value || '[Mother Name]';
            const address = document.getElementById('address').value || '[Address]';
            const incorrect = document.getElementById('incorrectInfo').value || '[Incorrect Info]';
            const correct = document.getElementById('correctInfo').value || '[Correct Info]';
            const verifiedPlace = document.getElementById('verifiedPlace').value || '[City/Place]';
            const additional = document.getElementById('additionalNotes').value || '';

            const template = templates[currentLanguage][currentAffidavitType];
            let bodyText = template.body;

            bodyText = bodyText.replace(/{name}/g, name);
            bodyText = bodyText.replace(/{father}/g, father);
            bodyText = bodyText.replace(/{mother}/g, mother);
            bodyText = bodyText.replace(/{address}/g, address);
            bodyText = bodyText.replace(/{incorrect}/g, incorrect);
            bodyText = bodyText.replace(/{correct}/g, correct);
            bodyText = bodyText.replace(/{additional}/g, additional);

            const paragraphs = bodyText.split('\n\n');
            let formattedHtml = `<h1 class="text-center font-extrabold text-lg mb-4">${template.title}</h1>`;

            paragraphs.forEach(para => {
                if (para.trim()) {
                    const lines = para.split('\n');
                    let paraHtml = '<div class="mb-3">';
                    lines.forEach(line => {
                        if (line.trim()) {
                            if (line.match(/^\d+\./)) paraHtml += `<div class="ml-4 mb-1 text-sm">${line}</div>`;
                            else paraHtml += `<div class="mb-1 text-sm">${line}</div>`;
                        }
                    });
                    paraHtml += '</div>';
                    formattedHtml += paraHtml;
                }
            });

            formattedHtml += `
                <div class="mt-6">
                    <div class="mb-1 text-sm">I, the above named deponent, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief.</div>
                    <div class="mb-1 text-sm font-semibold">Verified at ${verifiedPlace} on this ${getCurrentDate()}.</div>
                </div>
                <div class="flex justify-between mt-8 pt-4">
                    <div><div class="signature-line"></div><div class="text-xs font-bold mt-1">Deponent Signature</div></div>
                    <div><div class="signature-line"></div><div class="text-xs font-bold mt-1">Notary / Oath Commissioner</div></div>
                </div>
                <div class="mt-4 text-xs text-slate-600">
                    <div>Witness 1: __________________</div>
                    <div class="mt-1">Witness 2: __________________</div>
                </div>
            `;

            document.getElementById('affidavitText').innerHTML = formattedHtml;
        }

        function changeAffidavitType() {
            currentAffidavitType = document.getElementById('affidavitType').value;
            const correctionTypes = ['name_change', 'address_change', 'dob_correction', 'education_correction', 'passport_correction'];
            if (correctionTypes.includes(currentAffidavitType)) {
                document.getElementById('incorrectInfoGroup').style.display = 'block';
                document.getElementById('correctInfoGroup').style.display = 'block';
            } else {
                document.getElementById('incorrectInfoGroup').style.display = 'none';
                document.getElementById('correctInfoGroup').style.display = 'none';
            }
            updatePreview();
        }

        function setLanguage(lang) {
            currentLanguage = lang;
            document.getElementById('lang-en').classList.toggle('bg-[#ab183d]', lang === 'english');
            document.getElementById('lang-en').classList.toggle('text-white', lang === 'english');
            document.getElementById('lang-hi').classList.toggle('bg-[#ab183d]', lang === 'hindi');
            document.getElementById('lang-hi').classList.toggle('text-white', lang === 'hindi');
            updatePreview();
            showToast(`Language changed to ${lang === 'english' ? 'English' : 'हिंदी'}`);
        }

        function autoFillExample() {
            document.getElementById('deponentName').value = 'Krishna Kumar Thakur';
            document.getElementById('fatherName').value = 'Ramdas Kumar Thakur';
            document.getElementById('motherName').value = 'Madhu Bai Thakur';
            document.getElementById('address').value = 'H.No. 257, Sheetal Town Phase 1st Colony, New Mandideep - 462026';
            document.getElementById('incorrectInfo').value = 'Krishna Thakur';
            document.getElementById('correctInfo').value = 'Krishna Kumar Thakur';
            document.getElementById('verifiedPlace').value = 'New Mandideep';
            document.getElementById('additionalNotes').value = 'I declare that I have changed my name for professional reasons and have published the same in newspapers.';
            updatePreview();
            showToast('Sample example data auto-filled');
        }

        function resetForm() {
            if (confirm('Are you sure you want to reset all fields?')) {
                document.getElementById('deponentName').value = '';
                document.getElementById('fatherName').value = '';
                document.getElementById('motherName').value = '';
                document.getElementById('address').value = '';
                document.getElementById('incorrectInfo').value = '';
                document.getElementById('correctInfo').value = '';
                document.getElementById('verifiedPlace').value = '';
                document.getElementById('additionalNotes').value = '';
                removeStamp();
                updatePreview();
                showToast('Form reset successfully');
            }
        }

        function printAffidavit() {
            const affidavitText = document.getElementById('affidavitText').innerHTML;
            const stampTopSpace = document.getElementById('stampSpaceDiv').style.height;
            const printHtml = `<!DOCTYPE html><html><head><title>Affidavit Print</title><style>
                body { font-family: 'Inter', Arial, sans-serif; padding: 0.5in; margin: 0; }
                .affidavit-content { line-height: 1.6; font-size: 12pt; text-align: justify; }
                .affidavit-content h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 15px; }
                .signature-line { border-top: 1px solid #000; width: 200px; margin-top: 40px; padding-top: 8px; }
                @page { size: A4; margin: 0.5in; }
            </style></head><body><div style="height: ${stampTopSpace};"></div><div class="affidavit-content">${affidavitText}</div></body></html>`;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printHtml);
            printWindow.document.close();
            printWindow.print();
            showToast('Print dialog opened');
        }

        function downloadPDF() {
            const affidavitText = document.getElementById('affidavitText').cloneNode(true);
            const stampTopSpace = document.getElementById('stampSpaceDiv').style.height;
            const pdfContainer = document.createElement('div');
            pdfContainer.style.padding = '20px';
            pdfContainer.style.backgroundColor = 'white';
            const spacer = document.createElement('div');
            spacer.style.height = stampTopSpace;
            pdfContainer.appendChild(spacer);
            pdfContainer.appendChild(affidavitText);
            const opt = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: `affidavit_${currentAffidavitType}_${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            showToast('Generating PDF...');
            html2pdf().set(opt).from(pdfContainer).save().then(() => showToast('PDF downloaded successfully')).catch(() => showToast('Error generating PDF', 'error'));
        }

        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            document.getElementById('toastMessage').innerText = message;
            toast.classList.remove('hidden', 'bg-emerald-600', 'bg-rose-600');
            toast.classList.add(type === 'success' ? 'bg-emerald-600' : 'bg-rose-600');
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3000);
        }

        document.addEventListener('DOMContentLoaded', () => {
            updatePreview();
            adjustStampTopSpace();
        });

        // Mobile Menu Toggle
        (function(){
          var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
          if(btn&&menu){
            btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
            menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
          }
        })();
    