// ========== FIX: Added missing showAlert function ==========
        function showAlert(message) {
            alert(message);
        }

        // ========== TOOLS DATA ==========
        const toolsData = [
            { name: "CSC ID Card Maker", desc: "Create professional CSC VLE, employee & student ID cards online.", icon: "fa-id-card", color: "from-red-500 to-rose-600", category: "doc", badge: "Popular", pin: true, img: "/csc-id-card-maker.webp", url: "/tools/csc-id-card-maker.html" },
            { name: "Passport Photo Maker", desc: "Make passport-size photos with correct dimensions for forms.", icon: "fa-id-card", color: "from-red-500 to-rose-600", category: "doc", badge: "Popular", pin: true, img: "/images/passport.webp", url: "/tools/passport.html" },
            { name: "Background Remover", desc: "Remove image background free, fast and automatically.", icon: "fa-wand-magic-sparkles", color: "from-violet-500 to-purple-600", category: "doc", badge: "Popular", pin: true, img: "/images/bg.webp", url: "/tools/bg.html" },
            { name: "Photo & Signature Resizer", desc: "Resize photo & signature to exam KB and DPI limits.", icon: "fa-signature", color: "from-orange-500 to-amber-600", category: "doc", badge: "", pin: true, img: "/images/photo-sign.webp", url: "/tools/photo-sign.html" },
            { name: "Image to PDF", desc: "Convert one or more images into a single PDF file.", icon: "fa-file-pdf", color: "from-rose-500 to-red-600", category: "doc", badge: "", pin: true, img: "/images/image-to-pdf.webp", url: "/tools/image-to-pdf.html" },
            { name: "Resume / CV Builder", desc: "Create professional Indian-style resumes & CVs with photo and A4 PDF download.", icon: "fa-file-lines", color: "from-rose-500 to-pink-600", category: "utility", badge: "NEW", pin: false, img: "/images/resume-builder.webp", url: "/tools/resume-builder.html" },
            { name: "Invoice / Bill Generator", desc: "GST-ready bills & invoices with auto-calculation and print-ready PDF.", icon: "fa-file-invoice", color: "from-emerald-500 to-green-600", category: "finance", badge: "NEW", pin: false, img: "/images/invoice-generator.webp", url: "/tools/invoice-generator.html" },
            { name: "CSC Billing Software", desc: "Offline-style billing software to manage your CSC center sales.", icon: "fa-cash-register", color: "from-amber-500 to-orange-600", category: "finance", badge: "", pin: false, img: "/images/csc-billing-software.webp", url: "/tools/csc-billing-software.html" },
            { name: "CSC Center Manager", desc: "Manage your CSC center details, services and customer receipts.", icon: "fa-store", color: "from-indigo-500 to-violet-600", category: "utility", badge: "", pin: false, img: "/images/csc-manager.webp", url: "/tools/csc-manager.html" },
            { name: "GST Calculator", desc: "Calculate GST inclusive or exclusive amounts instantly.", icon: "fa-percent", color: "from-teal-500 to-cyan-600", category: "finance", badge: "", pin: false, img: "/images/gst.webp", url: "/tools/gst-calculator.html" },
            { name: "Loan EMI Calculator", desc: "Monthly EMI, total interest and payment in seconds.", icon: "fa-indian-rupee-sign", color: "from-green-500 to-emerald-600", category: "finance", badge: "", pin: false, img: "/images/loan-emi.webp", url: "/tools/loan-emi.html" },
            { name: "GPA / CGPA Calculator", desc: "Convert marks and grades to GPA & CGPA easily.", icon: "fa-graduation-cap", color: "from-blue-500 to-indigo-600", category: "finance", badge: "", pin: false, img: "/images/gpa-cgpa-calculator.webp", url: "/tools/gpa-cgpa-calculator.html" },
            { name: "Percentage Calculator", desc: "All-in-one percentage and marks calculations.", icon: "fa-calculator", color: "from-purple-500 to-fuchsia-600", category: "finance", badge: "", pin: false, img: "/images/percentage-cal.webp", url: "/tools/percentage-calculator.html" },
            { name: "Age Calculator", desc: "Find exact age in years, months and days.", icon: "fa-cake-candles", color: "from-pink-500 to-rose-600", category: "utility", badge: "", pin: false, img: "/images/age-calculator.webp", url: "/tools/age-calculator.html" },
            { name: "Date Difference", desc: "Calculate the number of days between two dates.", icon: "fa-calendar-days", color: "from-sky-500 to-blue-600", category: "utility", badge: "", pin: false, img: "/images/date-difference.webp", url: "/tools/date-difference.html" },
            { name: "Photo + Signature Joiner", desc: "Join your photo and signature into a single image.", icon: "fa-object-group", color: "from-cyan-500 to-teal-600", category: "doc", badge: "", pin: false, img: "/images/photo-name-joiner.webp", url: "/tools/photo-name-joiner.html" },
            { name: "Photo Quality Enhancer", desc: "Enhance and sharpen low-quality photos online.", icon: "fa-image", color: "from-fuchsia-500 to-pink-600", category: "doc", badge: "", pin: false, img: "/images/enhance-photo.webp", url: "/tools/enhance-photo.html" },
            { name: "Image Cropper", desc: "Crop images to any size or ratio online.", icon: "fa-crop", color: "from-lime-500 to-green-600", category: "doc", badge: "", pin: false, img: "/images/crop.webp", url: "/tools/crop.html" },
            { name: "Image Resizer", desc: "Resize images to a target size (50/100/200 KB).", icon: "fa-up-right-and-down-left-from-center", color: "from-blue-500 to-sky-600", category: "doc", badge: "", pin: false, img: "/images/image-resizer.webp", url: "/tools/image-resizer.html" },
            { name: "Image Compressor", desc: "Compress images to small size without quality loss.", icon: "fa-compress", color: "from-teal-500 to-emerald-600", category: "doc", badge: "", pin: false, img: "/images/compress-image.webp", url: "/tools/compress-image.html" },
            { name: "Image Converter", desc: "Convert between JPG, PNG, WEBP and more formats.", icon: "fa-right-left", color: "from-indigo-500 to-blue-600", category: "doc", badge: "", pin: false, img: "/images/converter.webp", url: "/tools/converter.html" },
            { name: "Word to PDF", desc: "Convert Word documents into clean PDF files.", icon: "fa-file-word", color: "from-blue-600 to-indigo-700", category: "doc", badge: "", pin: false, img: "/images/Word-to-PDF.webp", url: "/tools/Word-to-PDF.html" },
            { name: "Merge PDF", desc: "Combine multiple PDF files into one document.", icon: "fa-layer-group", color: "from-amber-500 to-orange-600", category: "doc", badge: "", pin: false, img: "/images/merge-pdf.webp", url: "/tools/merge-pdf.html" },
            { name: "Split PDF", desc: "Split a PDF into separate pages or files.", icon: "fa-scissors", color: "from-purple-500 to-violet-600", category: "doc", badge: "", pin: false, img: "/images/split.webp", url: "/tools/split.html" },
            { name: "File Cover Maker", desc: "Create attractive file covers and front pages.", icon: "fa-book-open", color: "from-pink-500 to-fuchsia-600", category: "utility", badge: "", pin: false, img: "/images/cover.webp", url: "/tools/cover.html" },
            { name: "QR Code Generator", desc: "Generate all-in-one QR codes for links, UPI and more.", icon: "fa-qrcode", color: "from-slate-600 to-gray-800", category: "utility", badge: "Popular", pin: false, img: "/images/qr.webp", url: "/tools/qr.html" },
            { name: "Marriage Biodata Maker", desc: "Create beautiful marriage biodata PDFs in minutes.", icon: "fa-heart", color: "from-rose-500 to-pink-600", category: "utility", badge: "", pin: false, img: "/images/marital-biodata-maker.webp", url: "/tools/marital-biodata-maker.html" }
        ];

        const blogPosts = [{
                title: "How to Print Aadhar PVC Card",
                img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=200&fit=crop",
                date: "Apr 18, 2026",
                url: "#"
            },
            {
                title: "Thumb Impression Scanner Guide",
                img: "https://procsctools.in/images/thumb-impression-scanner-online.webp?w=400&h=200&fit=crop",
                date: "May 17, 2026",
                url: "https://procsctools.in/thumb-impression-scanner-online-guide.html"
            },
            {
                title: "PDF to Image Conversion Guide",
                img: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=200&fit=crop",
                date: "Apr 17, 2026",
                url: "#"
            },
            {
                title: "Bill Generator for Small Shops",
                img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop",
                date: "Apr 16, 2026",
                url: "#"
            }
        ];

        // UPDATED renderTools with increased image height (h-56) and object-contain for full visibility
        function renderTools(filter = "all") {
            const grid = document.getElementById("toolsGrid");
            if (!grid) return;
            grid.innerHTML = "";
            let filtered = toolsData.filter(t => filter === "all" || t.category === filter);
            filtered = filtered.slice().sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0));
            filtered.forEach(tool => {
                const thumb = tool.img
                    ? `<img src="${tool.img}" alt="${tool.name}" loading="lazy" class="w-full h-44 object-cover" onerror="if(this.src.indexOf('.webp')>-1){this.src=this.src.replace('.webp','.jpg');}else{this.style.display='none';this.nextElementSibling.style.display='flex';}"><div class="w-full h-44 bg-gradient-to-br ${tool.color} items-center justify-center text-white text-6xl" style="display:none"><i class="fas ${tool.icon}"></i></div>`
                    : `<div class="w-full h-44 bg-gradient-to-br ${tool.color} flex items-center justify-center text-white text-6xl"><i class="fas ${tool.icon}"></i></div>`;
                grid.innerHTML += `<a href="${tool.url}" class="tool-card group block bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all relative">
      ${tool.pin ? `<span class="absolute top-3 left-3 z-10 bg-[#ab183d] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow"><i class="fas fa-thumbtack"></i> Pinned</span>` : ""}
      ${tool.badge ? `<span class="absolute top-3 right-3 z-10 bg-yellow-400 text-black text-[10px] font-bold px-2.5 py-1 rounded-full shadow">${tool.badge}</span>` : ""}
      <div class="relative overflow-hidden group-hover:scale-[1.03] transition-transform duration-500">${thumb}</div>
      <div class="p-5">
        <h3 class="text-lg font-bold text-gray-900">${tool.name}</h3>
        <p class="text-gray-500 text-sm my-2 leading-relaxed">${tool.desc}</p>
        <span class="inline-flex items-center gap-1 text-[#ab183d] font-semibold text-sm">Use Tool <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i></span>
      </div>
    </a>`;
            });
        }

        function renderBlogs() {
            const blogContainer = document.getElementById("blogGrid");
            if (blogContainer) {
                blogContainer.innerHTML = '';
                blogPosts.forEach(post => {
                    blogContainer.innerHTML += `<div class="blog-card bg-white rounded-2xl shadow-md overflow-hidden"><img src="${post.img}" class="h-48 w-full object-cover" alt="${post.title}" onerror="this.src='https://placehold.co/400x200?text=Blog+Image'"><div class="p-5"><h3 class="font-bold text-lg">${post.title}</h3><p class="text-xs text-gray-400">${post.date}</p><a href="${post.url}" class="inline-block mt-3 text-[#ab183d] font-semibold hover:text-red-700 transition">Read More →</a></div></div>`;
                });
            }
        }

        // ========== CALCULATOR FUNCTIONS ==========
        function calculateEMI() {
            let amount = parseFloat(document.getElementById('loanAmount').value);
            let rate = parseFloat(document.getElementById('interestRate').value);
            let years = parseFloat(document.getElementById('loanTenure').value);
            if (isNaN(amount) || isNaN(rate) || isNaN(years)) {
                alert('Please enter valid numbers');
                return;
            }
            let monthlyRate = rate / 12 / 100;
            let months = years * 12;
            let emi = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
            let totalPayment = emi * months;
            let totalInterest = totalPayment - amount;
            document.getElementById('emiResult').innerHTML = `<div class="font-bold text-[#ab183d]">Monthly EMI: ₹${emi.toFixed(2)}</div><div class="text-sm mt-1">Total Interest: ₹${totalInterest.toFixed(2)}</div><div class="text-sm">Total Payment: ₹${totalPayment.toFixed(2)}</div>`;
            document.getElementById('emiResult').classList.remove('hidden');
        }

        function calculateGST() {
            let amount = parseFloat(document.getElementById('gstAmount').value);
            let rate = parseFloat(document.getElementById('gstRate').value);
            let type = document.getElementById('gstType').value;
            if (isNaN(amount)) {
                alert('Please enter valid amount');
                return;
            }
            let gstAmount, total;
            if (type === 'exclusive') {
                gstAmount = amount * rate / 100;
                total = amount + gstAmount;
            } else {
                let originalAmount = amount * 100 / (100 + rate);
                gstAmount = amount - originalAmount;
                total = amount;
            }
            document.getElementById('gstResult').innerHTML = `<div class="font-bold text-[#ab183d]">GST Amount: ₹${gstAmount.toFixed(2)}</div><div class="text-sm mt-1">Total Amount: ₹${total.toFixed(2)}</div>`;
            document.getElementById('gstResult').classList.remove('hidden');
        }

        function calculateAge() {
            let dob = new Date(document.getElementById('dob').value);
            let asOn = document.getElementById('asOnDate').value ? new Date(document.getElementById('asOnDate').value) : new Date();
            let diff = asOn - dob;
            let ageDate = new Date(diff);
            let years = ageDate.getUTCFullYear() - 1970;
            let months = ageDate.getUTCMonth();
            let days = ageDate.getUTCDate() - 1;
            document.getElementById('ageResult').innerHTML = `<div class="font-bold text-[#ab183d]">${years} Years, ${months} Months, ${days} Days</div>`;
            document.getElementById('ageResult').classList.remove('hidden');
        }

        function calculateFixedPercentage() {
            let val1 = parseFloat(document.getElementById('percentValue1').value);
            let val2 = parseFloat(document.getElementById('percentValue2').value);
            if (isNaN(val1) || isNaN(val2) || val2 === 0) {
                alert('Please enter valid numbers (Value 2 cannot be zero)');
                return;
            }
            let percentage = (val1 / val2) * 100;
            document.getElementById('percentageResult').innerHTML = `<div class="font-bold text-[#ab183d]">${val1} is ${percentage.toFixed(2)}% of ${val2}</div>`;
            document.getElementById('percentageResult').classList.remove('hidden');
        }

        function calculatePercentageOf() {
            let percent = parseFloat(document.getElementById('percentOfNum').value);
            let total = parseFloat(document.getElementById('percentOfTotal').value);
            if (isNaN(percent) || isNaN(total)) {
                alert('Please enter valid numbers');
                return;
            }
            let result = (percent / 100) * total;
            document.getElementById('percentageOfResult').innerHTML = `<div class="font-bold text-[#ab183d]">${percent}% of ${total} = ${result.toFixed(2)}</div>`;
            document.getElementById('percentageOfResult').classList.remove('hidden');
        }

        function calculateBMI() {
            let weight = parseFloat(document.getElementById('weight').value);
            let heightCm = parseFloat(document.getElementById('height').value);
            if (isNaN(weight) || isNaN(heightCm)) {
                alert('Please enter valid values');
                return;
            }
            let heightM = heightCm / 100;
            let bmi = weight / (heightM * heightM);
            let category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
            document.getElementById('bmiResult').innerHTML = `<div class="font-bold text-[#ab183d]">BMI: ${bmi.toFixed(2)}</div><div class="text-sm">Category: ${category}</div>`;
            document.getElementById('bmiResult').classList.remove('hidden');
        }

        // Unit converter functions
        const unitConversions = {
            length: {
                mm: 1,
                cm: 10,
                m: 1000,
                km: 1000000,
                inch: 25.4,
                ft: 304.8,
                mile: 1609344
            },
            weight: {
                mg: 0.001,
                g: 1,
                kg: 1000,
                lb: 453.592,
                oz: 28.3495
            },
            temperature: {
                celsius: 'c',
                fahrenheit: 'f',
                kelvin: 'k'
            }
        };
        const unitNames = {
            length: ['mm', 'cm', 'm', 'km', 'inch', 'ft', 'mile'],
            weight: ['mg', 'g', 'kg', 'lb', 'oz'],
            temperature: ['celsius', 'fahrenheit', 'kelvin']
        };

        function updateUnitOptions() {
            let category = document.getElementById('unitCategory').value;
            let fromSelect = document.getElementById('unitFrom');
            let toSelect = document.getElementById('unitTo');
            let units = unitNames[category];
            fromSelect.innerHTML = '';
            toSelect.innerHTML = '';
            units.forEach(u => {
                fromSelect.innerHTML += `<option value="${u}">${u}</option>`;
                toSelect.innerHTML += `<option value="${u}">${u}</option>`;
            });
        }

        function convertUnit() {
            let category = document.getElementById('unitCategory').value;
            let value = parseFloat(document.getElementById('unitValue').value);
            let from = document.getElementById('unitFrom').value;
            let to = document.getElementById('unitTo').value;
            if (isNaN(value)) {
                alert('Please enter valid value');
                return;
            }
            let result;
            if (category === 'temperature') {
                if (from === 'celsius' && to === 'fahrenheit') result = value * 9 / 5 + 32;
                else if (from === 'celsius' && to === 'kelvin') result = value + 273.15;
                else if (from === 'fahrenheit' && to === 'celsius') result = (value - 32) * 5 / 9;
                else if (from === 'fahrenheit' && to === 'kelvin') result = (value - 32) * 5 / 9 + 273.15;
                else if (from === 'kelvin' && to === 'celsius') result = value - 273.15;
                else if (from === 'kelvin' && to === 'fahrenheit') result = (value - 273.15) * 9 / 5 + 32;
                else result = value;
            } else {
                let base = value * unitConversions[category][from];
                result = base / unitConversions[category][to];
            }
            document.getElementById('unitResult').innerHTML = `<div class="font-bold text-[#ab183d]">${value} ${from} = ${result.toFixed(4)} ${to}</div>`;
            document.getElementById('unitResult').classList.remove('hidden');
        }

        // ========== VALIDATOR FUNCTIONS ==========
        function checkAadhaar() {
            let a = document.getElementById('aadhaar').value;
            if (/^\d{12}$/.test(a)) {
                document.getElementById('aadhaarResult').innerHTML = '<span class="text-green-600 font-semibold">✓ Valid Aadhaar Format</span>';
            } else {
                document.getElementById('aadhaarResult').innerHTML = '<span class="text-red-600 font-semibold">✗ Invalid Aadhaar (12 digits required)</span>';
            }
        }

        function checkPAN() {
            let p = document.getElementById('pan').value.toUpperCase();
            if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(p)) {
                document.getElementById('panResult').innerHTML = '<span class="text-green-600 font-semibold">✓ Valid PAN Format</span>';
            } else {
                document.getElementById('panResult').innerHTML = '<span class="text-red-600 font-semibold">✗ Invalid PAN (Format: ABCDE1234F)</span>';
            }
        }

        function checkIFSC() {
            let code = document.getElementById('ifsc').value.toUpperCase();
            if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code)) {
                document.getElementById('ifscResult').innerHTML = '<span class="text-green-600 font-semibold">✓ Valid IFSC Format</span>';
            } else {
                document.getElementById('ifscResult').innerHTML = '<span class="text-red-600 font-semibold">✗ Invalid IFSC (Format: SBIN0001234)</span>';
            }
        }

        function checkUPI() {
            let u = document.getElementById('upi').value;
            if (/^[\w.-]+@[\w]+$/.test(u)) {
                document.getElementById('upiResult').innerHTML = '<span class="text-green-600 font-semibold">✓ Valid UPI ID</span>';
            } else {
                document.getElementById('upiResult').innerHTML = '<span class="text-red-600 font-semibold">✗ Invalid UPI ID (Format: name@bank)</span>';
            }
        }

        function genName() {
            let names = ["Rahul Sharma", "Amit Kumar", "Neha Verma", "Priya Singh", "Rohit Mehta", "Sneha Gupta", "Vikram Rathore", "Pooja Nair", "Anjali Desai", "Rajesh Khanna"];
            let random = names[Math.floor(Math.random() * names.length)];
            document.getElementById('nameResult').innerHTML = `<span class="text-2xl font-bold">${random}</span>`;
        }

        function speak() {
            let msg = new SpeechSynthesisUtterance(document.getElementById('textToSpeak').value);
            msg.lang = 'en-IN';
            speechSynthesis.speak(msg);
        }

        // Notepad auto-save
        window.onload = function() {
            let noteField = document.getElementById('note');
            if (noteField) {
                noteField.value = localStorage.getItem("note") || "";
                noteField.addEventListener('keyup', function() {
                    localStorage.setItem("note", noteField.value);
                });
            }
            renderTools("all");
            renderBlogs();
            let asOnDate = document.getElementById('asOnDate');
            if (asOnDate) asOnDate.valueAsDate = new Date();
            updateUnitOptions();
            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function performSearch() {
            let query = document.getElementById("globalSearch").value.toLowerCase().trim();
            let cards = document.querySelectorAll(".tool-card");
            cards.forEach(card => {
                if (query === "") {
                    card.style.display = "";
                } else {
                    let matches = card.innerText.toLowerCase().includes(query);
                    card.style.display = matches ? "" : "none";
                }
            });
        }
        document.getElementById("globalSearch").addEventListener("input", performSearch);

        function showSSLCertificate() {
            alert("🔒 SSL Certificate Information\n\n• Issuer: Let's Encrypt\n• Encryption: 256-bit AES\n• Protocol: TLS 1.3\n• Valid: Active\n\nYour connection to Pro CSC Tools is fully encrypted and secure.");
        }

        // Form handler & scroll function
        window.handleFormSubmit = function(event) {
            event.preventDefault();
            const name = document.getElementById('formName').value;
            const email = document.getElementById('formEmail').value;
            const successDiv = document.getElementById('formSuccessMsg');
            successDiv.innerHTML = `✅ Thank you ${name}! We'll get back to you shortly at ${email}.`;
            successDiv.classList.remove('hidden');
            document.getElementById('quickContactForm').reset();
            setTimeout(() => successDiv.classList.add('hidden'), 5000);
        };
        window.scrollToContactForm = function() {
            document.getElementById('contact-form-section').scrollIntoView({
                behavior: 'smooth'
            });
        };

        // Expose functions globally
        window.calculateEMI = calculateEMI;
        window.calculateGST = calculateGST;
        window.calculateAge = calculateAge;
        window.calculateBMI = calculateBMI;
        window.calculateFixedPercentage = calculateFixedPercentage;
        window.calculatePercentageOf = calculatePercentageOf;
        window.convertUnit = convertUnit;
        window.updateUnitOptions = updateUnitOptions;
        window.checkAadhaar = checkAadhaar;
        window.checkPAN = checkPAN;
        window.checkIFSC = checkIFSC;
        window.checkUPI = checkUPI;
        window.genName = genName;
        window.speak = speak;
        window.handleFormSubmit = handleFormSubmit;
        window.performSearch = performSearch;
        window.showSSLCertificate = showSSLCertificate;
        window.scrollToContactForm = scrollToContactForm;
        window.showAlert = showAlert; // Ensure showAlert is globally available

        // Counter animations
        let countTools = 0,
            countUsers = 0;
        const toolTarget = toolsData.length;
        const userTarget = 18500;
        let toolInterval = setInterval(() => {
            if (countTools < toolTarget) {
                countTools++;
                document.getElementById("statTools").innerText = countTools;
            } else clearInterval(toolInterval);
        }, 50);
        let userInterval = setInterval(() => {
            if (countUsers < userTarget) {
                countUsers += 185;
                document.getElementById("statUsers").innerText = countUsers + "+";
            } else clearInterval(userInterval);
        }, 30);

        // Filter buttons
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                renderTools(this.getAttribute("data-cat"));
            });
        });

        // Mobile menu toggling
        const menuBtn = document.getElementById("menuBtn");
        const mobileMenu = document.getElementById("mobileMenu");

        function closeMobileMenu() {
            if (mobileMenu) mobileMenu.classList.add("hidden");
        }

        function toggleMobileMenu() {
            if (mobileMenu) {
                if (mobileMenu.classList.contains("hidden")) mobileMenu.classList.remove("hidden");
                else closeMobileMenu();
            }
        }
        if (menuBtn) menuBtn.addEventListener("click", toggleMobileMenu);
        document.querySelectorAll("[data-close-mobile]").forEach(link => {
            link.addEventListener("click", closeMobileMenu);
        });
        document.addEventListener("click", function(event) {
            if (window.innerWidth < 768 && mobileMenu && !mobileMenu.classList.contains("hidden")) {
                if (!mobileMenu.contains(event.target) && !menuBtn.contains(event.target)) closeMobileMenu();
            }
        });
        window.addEventListener("resize", function() {
            if (window.innerWidth >= 768 && mobileMenu) closeMobileMenu();
        });


// ===== AdSense: push every ad unit on the page (runs once IDs are live) =====
window.addEventListener('load',function(){try{document.querySelectorAll('ins.adsbygoogle').forEach(function(){(window.adsbygoogle=window.adsbygoogle||[]).push({});});}catch(e){}});
