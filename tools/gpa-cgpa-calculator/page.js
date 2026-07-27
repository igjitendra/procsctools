
        // ==================== STATE MANAGEMENT ====================
        let semesters = [];
        let gradeScale = {
            'O': 10,
            'A+': 9,
            'A': 8,
            'B+': 7,
            'B': 6,
            'C': 5,
            'P': 4,
            'F': 0
        };
        let charts = {};

        // Initialize default data
        function initDefaultData() {
            semesters = [{
                name: 'Semester 1',
                subjects: [{
                        name: 'Mathematics',
                        credits: 4,
                        grade: 'A',
                        tag: 'Core'
                    },
                    {
                        name: 'Physics',
                        credits: 3,
                        grade: 'B+',
                        tag: 'Core'
                    },
                    {
                        name: 'Chemistry',
                        credits: 3,
                        grade: 'A',
                        tag: 'Core'
                    }
                ]
            }];
        }

        // Load saved data
        function loadSavedData() {
            try {
                const saved = localStorage.getItem('gpaCalculatorData');
                if (saved) {
                    semesters = JSON.parse(saved);
                } else {
                    initDefaultData();
                }

                const savedScale = localStorage.getItem('gradeScale');
                if (savedScale) {
                    gradeScale = JSON.parse(savedScale);
                }
            } catch (e) {
                console.error('Error loading data:', e);
                initDefaultData();
            }
        }

        // Save data
        function saveAllData() {
            try {
                localStorage.setItem('gpaCalculatorData', JSON.stringify(semesters));
                localStorage.setItem('gradeScale', JSON.stringify(gradeScale));
                showToast('Progress saved successfully!', 'success');
                return true;
            } catch (e) {
                console.error('Error saving data:', e);
                showToast('Error saving data', 'error');
                return false;
            }
        }

        // ==================== RENDERING ====================
        function renderGradeScale() {
            const container = document.getElementById('gradeScale');
            if (!container) return;

            container.innerHTML = Object.entries(gradeScale)
                .map(([grade, points]) => `
          <div class="flex justify-between items-center py-1 border-b border-gray-100">
            <span class="font-medium">${grade}</span>
            <span class="text-indigo-600 font-semibold">${points} GPA</span>
          </div>
        `).join('');
        }

        function renderSemesters() {
            const container = document.getElementById('semestersList');
            if (!container) return;

            container.innerHTML = '';

            semesters.forEach((semester, semIndex) => {
                const semDiv = document.createElement('div');
                semDiv.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5';
                semDiv.innerHTML = `
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-3">
              <i class="fas fa-graduation-cap text-indigo-500"></i>
              <input type="text" value="${semester.name}" 
                     data-sem="${semIndex}" 
                     class="sem-name font-semibold text-lg px-2 py-1 border rounded dark:bg-gray-700 focus:ring-2 focus:ring-indigo-300"
                     placeholder="Semester Name">
            </div>
            <div>
              <button class="remove-sem text-red-500 hover:text-red-700 mr-2" data-sem="${semIndex}" title="Remove Semester">
                <i class="fas fa-trash"></i>
              </button>
              <button class="copy-sem text-blue-500 hover:text-blue-700" data-sem="${semIndex}" title="Copy Semester">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          
          <div class="space-y-2" id="subjects-${semIndex}">
            ${semester.subjects.map((subject, subIndex) => `
              <div class="subject-item flex flex-wrap gap-2 items-center p-2 bg-gray-50 dark:bg-gray-700 rounded" data-sem="${semIndex}" data-sub="${subIndex}">
                <input type="text" value="${subject.name}" 
                       data-sem="${semIndex}" data-sub="${subIndex}" data-field="name"
                       class="flex-1 min-w-[150px] px-2 py-1 border rounded dark:bg-gray-600 text-sm"
                       placeholder="Subject">
                <input type="number" value="${subject.credits}" min="1" max="10"
                       data-sem="${semIndex}" data-sub="${subIndex}" data-field="credits"
                       class="w-16 px-2 py-1 border rounded dark:bg-gray-600 text-sm"
                       placeholder="Credits">
                <select data-sem="${semIndex}" data-sub="${subIndex}" data-field="grade"
                        class="w-20 px-2 py-1 border rounded dark:bg-gray-600 text-sm">
                  ${Object.keys(gradeScale).map(grade => 
                    `<option value="${grade}" ${subject.grade === grade ? 'selected' : ''}>${grade}</option>`
                  ).join('')}
                </select>
                <select data-sem="${semIndex}" data-sub="${subIndex}" data-field="tag"
                        class="w-24 px-2 py-1 border rounded dark:bg-gray-600 text-sm">
                  <option value="Core" ${subject.tag === 'Core' ? 'selected' : ''}>Core</option>
                  <option value="Elective" ${subject.tag === 'Elective' ? 'selected' : ''}>Elective</option>
                  <option value="Lab" ${subject.tag === 'Lab' ? 'selected' : ''}>Lab</option>
                </select>
                <button class="remove-sub text-red-500 hover:text-red-700" data-sem="${semIndex}" data-sub="${subIndex}">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            `).join('')}
          </div>
          
          <button class="add-sub mt-3 text-indigo-600 hover:text-indigo-800 text-sm flex items-center" data-sem="${semIndex}">
            <i class="fas fa-plus-circle mr-1"></i> Add Subject
          </button>
        `;

                container.appendChild(semDiv);
            });

            updateSemesterCount();
        }

        // ==================== CALCULATIONS ====================
        function calculateAll() {
            let totalCredits = 0,
                totalPoints = 0;
            const sgpas = [],
                semesterCredits = [];
            const gradeCount = {};

            // Initialize grade count
            Object.keys(gradeScale).forEach(g => gradeCount[g] = 0);

            // Calculate each semester
            semesters.forEach((semester, index) => {
                let semCredits = 0,
                    semPoints = 0;

                semester.subjects.forEach(subject => {
                    const points = gradeScale[subject.grade] || 0;
                    semCredits += subject.credits;
                    semPoints += points * subject.credits;
                    gradeCount[subject.grade] = (gradeCount[subject.grade] || 0) + 1;
                });

                const sgpa = semCredits > 0 ? semPoints / semCredits : 0;
                sgpas.push(sgpa);
                semesterCredits.push(semCredits);

                totalCredits += semCredits;
                totalPoints += semPoints;
            });

            // Calculate CGPA
            const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
            const percentage = (cgpa * 9.5).toFixed(2);

            // Update UI
            document.getElementById('cgpa').textContent = cgpa.toFixed(3);
            document.getElementById('totalCredits').textContent = totalCredits;
            document.getElementById('percentage').textContent = percentage + '%';

            // Grade based on CGPA
            let gradeText = '';
            if (cgpa >= 9) gradeText = 'Outstanding (O)';
            else if (cgpa >= 8) gradeText = 'Excellent (A+)';
            else if (cgpa >= 7) gradeText = 'Very Good (A)';
            else if (cgpa >= 6) gradeText = 'Good (B+)';
            else if (cgpa >= 5) gradeText = 'Average (B)';
            else gradeText = 'Needs Improvement';
            document.getElementById('cgpaGrade').textContent = gradeText;

            // Update history table
            updateHistoryTable(sgpas, semesterCredits);

            // Update subject details
            updateSubjectDetails();

            // Update charts
            updateCharts(sgpas, gradeCount);

            // Show results panel
            document.getElementById('resultsPanel').classList.remove('hidden');

            return {
                cgpa,
                totalCredits,
                percentage,
                sgpas,
                semesterCredits
            };
        }

        function updateHistoryTable(sgpas, semesterCredits) {
            const tbody = document.getElementById('historyTableBody');
            if (!tbody) return;

            tbody.innerHTML = '';

            let runningCredits = 0,
                runningPoints = 0;

            semesters.forEach((semester, index) => {
                runningCredits += semesterCredits[index];

                // Calculate running points for CGPA
                let semPoints = 0;
                semester.subjects.forEach(sub => {
                    semPoints += (gradeScale[sub.grade] || 0) * sub.credits;
                });
                runningPoints += semPoints;

                const cgpa = runningCredits > 0 ? runningPoints / runningCredits : 0;

                tbody.innerHTML += `
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="p-3 font-medium">${semester.name}</td>
            <td class="p-3 text-center font-semibold ${sgpas[index] >= 8 ? 'text-green-600' : sgpas[index] >= 6 ? 'text-blue-600' : 'text-orange-600'}">
              ${sgpas[index].toFixed(3)}
            </td>
            <td class="p-3 text-center">${semesterCredits[index]}</td>
            <td class="p-3 text-center font-bold text-indigo-600">${cgpa.toFixed(3)}</td>
            <td class="p-3 text-center">${(semPoints).toFixed(1)}</td>
          </tr>
        `;
            });
        }

        function updateSubjectDetails() {
            const container = document.getElementById('subjectDetails');
            if (!container) return;

            container.innerHTML = '';

            semesters.forEach((semester, semIndex) => {
                semester.subjects.forEach((subject, subIndex) => {
                    const points = gradeScale[subject.grade] || 0;
                    const gradePoint = points * subject.credits;

                    container.innerHTML += `
            <div class="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
              <span class="font-semibold">${semester.name}</span> - ${subject.name}<br>
              <span class="text-indigo-600">${subject.grade} (${points})</span> × ${subject.credits} = ${gradePoint} pts
            </div>
          `;
                });
            });
        }

        function updateCharts(sgpas, gradeCount) {
            // Destroy existing charts
            if (charts.trend) charts.trend.destroy();
            if (charts.dist) charts.dist.destroy();

            // Trend Chart
            const ctx1 = document.getElementById('trendChart') ? .getContext('2d');
            if (ctx1) {
                charts.trend = new Chart(ctx1, {
                    type: 'line',
                    data: {
                        labels: semesters.map((s, i) => `Sem ${i+1}`),
                        datasets: [{
                            label: 'SGPA',
                            data: sgpas,
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                min: 0,
                                max: 10,
                                grid: {
                                    display: true
                                }
                            }
                        }
                    }
                });
            }

            // Grade Distribution Chart
            const ctx2 = document.getElementById('gradeDistChart') ? .getContext('2d');
            if (ctx2) {
                const grades = Object.keys(gradeCount);
                const counts = Object.values(gradeCount);

                charts.dist = new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: grades,
                        datasets: [{
                            data: counts,
                            backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
        }

        // ==================== PDF GENERATION ====================
        async function downloadPDF() {
            try {
                showToast('Generating PDF...', 'info');

                // Calculate latest results
                const results = calculateAll();

                // Create PDF preview HTML
                const pdfPreview = document.getElementById('pdfPreview');
                const currentDate = new Date().toLocaleDateString();

                // Build PDF content
                let pdfHTML = `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
            <h1 style="text-align: center; color: #4f46e5; margin-bottom: 20px; font-size: 24px;">Academic Report</h1>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">Generated on: ${currentDate}</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                <h3 style="margin: 0; color: #4f46e5; font-size: 14px;">CGPA</h3>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${results.cgpa.toFixed(3)}</p>
              </div>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                <h3 style="margin: 0; color: #10b981; font-size: 14px;">Percentage</h3>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${results.percentage}%</p>
              </div>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                <h3 style="margin: 0; color: #f59e0b; font-size: 14px;">Total Credits</h3>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${results.totalCredits}</p>
              </div>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                <h3 style="margin: 0; color: #ef4444; font-size: 14px;">Semesters</h3>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${semesters.length}</p>
              </div>
            </div>
            
            <h2 style="color: #4f46e5; margin-top: 30px; font-size: 18px;">Semester-wise Breakdown</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; border: 1px solid #ddd;">
              <thead>
                <tr style="background: #4f46e5; color: white;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #4f46e5;">Semester</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #4f46e5;">SGPA</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #4f46e5;">Credits</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #4f46e5;">CGPA</th>
                </tr>
              </thead>
              <tbody>
        `;

                let runningCredits = 0,
                    runningPoints = 0;

                semesters.forEach((semester, index) => {
                    let semCredits = 0,
                        semPoints = 0;
                    semester.subjects.forEach(sub => {
                        semCredits += sub.credits;
                        semPoints += (gradeScale[sub.grade] || 0) * sub.credits;
                    });

                    runningCredits += semCredits;
                    runningPoints += semPoints;
                    const cgpa = runningCredits > 0 ? runningPoints / runningCredits : 0;

                    pdfHTML += `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 8px; border: 1px solid #ddd;">${semester.name}</td>
              <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${results.sgpas[index].toFixed(3)}</td>
              <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${semCredits}</td>
              <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${cgpa.toFixed(3)}</td>
            </tr>
          `;
                });

                pdfHTML += `
              </tbody>
            </table>
            
            <h2 style="color: #4f46e5; margin-top: 30px; font-size: 18px;">Subject Details</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; border: 1px solid #ddd;">
              <thead>
                <tr style="background: #4f46e5; color: white;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #4f46e5;">Semester</th>
                  <th style="padding: 10px; text-align: left; border: 1px solid #4f46e5;">Subject</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #4f46e5;">Credits</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #4f46e5;">Grade</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #4f46e5;">Points</th>
                </tr>
              </thead>
              <tbody>
        `;

                semesters.forEach((semester, semIndex) => {
                    semester.subjects.forEach((subject, subIndex) => {
                        const points = gradeScale[subject.grade] || 0;
                        pdfHTML += `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px; border: 1px solid #ddd;">${semester.name}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${subject.name}</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${subject.credits}</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${subject.grade}</td>
                <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${points}</td>
              </tr>
            `;
                    });
                });

                pdfHTML += `
              </tbody>
            </table>
            
            <p style="text-align: center; margin-top: 40px; color: #666; font-size: 12px;">
              Generated by GPA & CGPA Calculator Pro - Pro CSC Tools
            </p>
          </div>
        `;

                pdfPreview.innerHTML = pdfHTML;

                // Generate PDF using html2canvas and jsPDF
                const canvas = await html2canvas(pdfPreview, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false,
                    allowTaint: true,
                    useCORS: true
                });

                const imgData = canvas.toDataURL('image/png');
                const {
                    jsPDF
                } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const width = imgWidth * ratio;
                const height = imgHeight * ratio;

                pdf.addImage(imgData, 'PNG', 0, 0, width, height);
                pdf.save(`gpa-report-${currentDate.replace(/\//g, '-')}.pdf`);

                showToast('PDF downloaded successfully!', 'success');

            } catch (error) {
                console.error('PDF Error:', error);
                showToast('Error generating PDF. Please try again.', 'error');
            }
        }

        // ==================== EVENT HANDLERS ====================
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize data
            loadSavedData();
            renderGradeScale();
            renderSemesters();

            // Auto-calculate if data exists
            if (semesters.length > 0) calculateAll();

            // FIXED: Save Progress Button
            document.getElementById('saveProgressBtn').addEventListener('click', function() {
                if (saveAllData()) {
                    showToast('Progress saved successfully!', 'success');
                }
            });

            // FIXED: Load Data Button
            document.getElementById('loadProgressBtn').addEventListener('click', function() {
                loadSavedData();
                renderSemesters();
                renderGradeScale();
                calculateAll();
                showToast('Data loaded successfully!', 'success');
            });

            // FIXED: Reset Button
            document.getElementById('resetProgressBtn').addEventListener('click', function() {
                if (confirm('Reset all data? This cannot be undone.')) {
                    localStorage.removeItem('gpaCalculatorData');
                    initDefaultData();
                    renderSemesters();
                    renderGradeScale();
                    calculateAll();
                    showToast('Data reset to default', 'info');
                }
            });

            // FIXED: PDF Download Button
            document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);

            // Add Semester
            document.getElementById('addSemester').addEventListener('click', function() {
                semesters.push({
                    name: `Semester ${semesters.length + 1}`,
                    subjects: [{
                        name: 'New Subject',
                        credits: 3,
                        grade: 'A',
                        tag: 'Core'
                    }]
                });
                renderSemesters();
                saveAllData();
                calculateAll();
                showToast('New semester added', 'success');
            });

            // Calculate Button
            document.getElementById('calculateBtn').addEventListener('click', function() {
                calculateAll();
                showToast('Calculation completed', 'success');
            });

            // Print Button
            document.getElementById('printBtn').addEventListener('click', function() {
                window.print();
            });

            // Copy Results Button
            document.getElementById('copyResultsBtn').addEventListener('click', function() {
                const cgpa = document.getElementById('cgpa').textContent;
                const percentage = document.getElementById('percentage').textContent;
                const text = `CGPA: ${cgpa}, Percentage: ${percentage}`;

                navigator.clipboard.writeText(text).then(() => {
                    showToast('Results copied to clipboard!', 'success');
                }).catch(() => {
                    showToast('Failed to copy', 'error');
                });
            });

            // Goal Planner
            document.getElementById('calcGoal').addEventListener('click', function() {
                const targetCgpa = parseFloat(document.getElementById('targetCgpa').value);
                const futureCredits = parseFloat(document.getElementById('futureCredits').value);

                if (!targetCgpa || !futureCredits) {
                    showToast('Enter target CGPA and future credits', 'warning');
                    return;
                }

                // Calculate current total
                let currentCredits = 0,
                    currentPoints = 0;
                semesters.forEach(sem => {
                    sem.subjects.forEach(sub => {
                        currentCredits += sub.credits;
                        currentPoints += (gradeScale[sub.grade] || 0) * sub.credits;
                    });
                });

                const requiredPoints = targetCgpa * (currentCredits + futureCredits) - currentPoints;
                const requiredGpa = requiredPoints / futureCredits;

                const resultDiv = document.getElementById('goalResult');
                resultDiv.classList.remove('hidden');

                if (requiredGpa > 10) {
                    resultDiv.innerHTML = `<span class="text-red-600">Target too high! Need ${requiredGpa.toFixed(2)} GPA (max 10)</span>`;
                } else if (requiredGpa < 0) {
                    resultDiv.innerHTML = `<span class="text-green-600">You already achieved your target! 🎉</span>`;
                } else {
                    resultDiv.innerHTML = `
            <span class="font-bold">Required GPA: ${requiredGpa.toFixed(3)}</span><br>
            <span class="text-xs">in next ${futureCredits} credits</span>
          `;
                }
            });

            // Edit Grade Scale
            document.getElementById('editScaleBtn').addEventListener('click', function() {
                const newScale = prompt('Enter custom grade scale (e.g., A:10,B:8,C:6)',
                    Object.entries(gradeScale).map(([g, p]) => `${g}:${p}`).join(','));

                if (newScale) {
                    try {
                        const pairs = newScale.split(',');
                        const updatedScale = {};
                        pairs.forEach(pair => {
                            const [grade, points] = pair.split(':');
                            updatedScale[grade.trim()] = parseFloat(points);
                        });
                        gradeScale = updatedScale;
                        localStorage.setItem('gradeScale', JSON.stringify(gradeScale));
                        renderGradeScale();
                        renderSemesters();
                        calculateAll();
                        showToast('Grade scale updated', 'success');
                    } catch (e) {
                        showToast('Invalid format', 'error');
                    }
                }
            });
        });

        // Semester management events
        document.getElementById('semestersList').addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const semIndex = target.dataset.sem;

            // Remove semester
            if (target.classList.contains('remove-sem')) {
                if (semesters.length > 1) {
                    if (confirm('Remove this semester?')) {
                        semesters.splice(semIndex, 1);
                        renderSemesters();
                        calculateAll();
                        saveAllData();
                    }
                } else {
                    showToast('At least one semester required', 'warning');
                }
            }

            // Copy semester
            if (target.classList.contains('copy-sem')) {
                const newSem = JSON.parse(JSON.stringify(semesters[semIndex]));
                newSem.name = `Copy of ${newSem.name}`;
                semesters.push(newSem);
                renderSemesters();
                saveAllData();
                calculateAll();
                showToast('Semester copied', 'success');
            }

            // Add subject
            if (target.classList.contains('add-sub')) {
                semesters[semIndex].subjects.push({
                    name: 'New Subject',
                    credits: 3,
                    grade: 'A',
                    tag: 'Elective'
                });
                renderSemesters();
                saveAllData();
                calculateAll();
            }

            // Remove subject
            if (target.classList.contains('remove-sub')) {
                const subIndex = target.dataset.sub;
                if (semesters[semIndex].subjects.length > 1) {
                    semesters[semIndex].subjects.splice(subIndex, 1);
                    renderSemesters();
                    saveAllData();
                    calculateAll();
                } else {
                    showToast('At least one subject required', 'warning');
                }
            }
        });

        // Input handling
        document.getElementById('semestersList').addEventListener('input', (e) => {
            const target = e.target;
            const semIndex = target.dataset.sem;
            const subIndex = target.dataset.sub;

            if (semIndex !== undefined && subIndex !== undefined) {
                // Subject field update
                const field = target.dataset.field;
                if (field === 'name') {
                    semesters[semIndex].subjects[subIndex].name = target.value;
                } else if (field === 'credits') {
                    semesters[semIndex].subjects[subIndex].credits = parseFloat(target.value) || 1;
                }
            } else if (target.classList.contains('sem-name')) {
                // Semester name update
                semesters[semIndex].name = target.value;
            }

            // Auto-save and calculate
            saveAllData();
            calculateAll();
        });

        // Select handling
        document.getElementById('semestersList').addEventListener('change', (e) => {
            const target = e.target;
            const semIndex = target.dataset.sem;
            const subIndex = target.dataset.sub;

            if (semIndex !== undefined && subIndex !== undefined) {
                const field = target.dataset.field;
                if (field === 'grade') {
                    semesters[semIndex].subjects[subIndex].grade = target.value;
                } else if (field === 'tag') {
                    semesters[semIndex].subjects[subIndex].tag = target.value;
                }

                saveAllData();
                calculateAll();
            }
        });

        // Update semester count
        function updateSemesterCount() {
            const countEl = document.getElementById('semesterCount');
            if (countEl) countEl.textContent = semesters.length;
        }

        // Toast notification
        function showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            if (!container) return;

            const toast = document.createElement('div');

            const colors = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                info: 'bg-blue-500',
                warning: 'bg-yellow-500'
            };

            toast.className = `toast-message ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center`;
            toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-3"></i>
        ${message}
      `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    