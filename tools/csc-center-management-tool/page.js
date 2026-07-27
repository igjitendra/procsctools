
        // Initialize Data Store
        let customers = [];
        let expenses = [];
        let centerInfo = {
            name: 'Pro CSC Center',
            owner: 'VLE Operator',
            mobile: '9876543210',
            email: 'csc@procsctools.in',
            address: 'Main Market, City - 123456',
            gst: '',
            hours: '9:00 AM - 6:00 PM',
            welcomeMsg: 'Thank you for choosing Pro CSC Services'
        };
        
        let serviceCategories = [
            {
                id: 1,
                name: 'Government Services',
                services: [
                    { id: 101, name: 'Aadhaar Card', desc: 'New Aadhaar Enrollment/Update', price: 100 },
                    { id: 102, name: 'PAN Card', desc: 'New PAN Card Application', price: 150 },
                    { id: 103, name: 'Voter ID', desc: 'Voter ID Application', price: 80 }
                ]
            },
            {
                id: 2,
                name: 'Certificate Services',
                services: [
                    { id: 201, name: 'Birth Certificate', desc: 'Birth Certificate Application', price: 120 },
                    { id: 202, name: 'Death Certificate', desc: 'Death Certificate Application', price: 120 },
                    { id: 203, name: 'Income Certificate', desc: 'Income Certificate', price: 100 }
                ]
            },
            {
                id: 3,
                name: 'Document Services',
                services: [
                    { id: 301, name: 'Passport', desc: 'Passport Application Assistance', price: 500 },
                    { id: 302, name: 'Driving License', desc: 'DL Application', price: 300 }
                ]
            }
        ];
        
        // Chart instances
        let monthlyChart = null;
        let serviceChart = null;
        let financialChart = null;
        let monthlyComparisonChart = null;
        let profitDistributionChart = null;
        
        let serviceRowCount = 1;
        let currentSlipCustomerId = null;
        
        // Dark Mode State
        let isDarkMode = false;
        
        // Load data from LocalStorage on startup
        document.addEventListener('DOMContentLoaded', function() {
            loadFromLocalStorage();
            updateDashboard();
            setDefaultDates();
            initializeServiceDropdowns();
            renderWorkManager();
            renderPendingWork();
            updateCustomerSelect();
            renderCategories();
            loadCenterInfo();
            renderExpenseHistory();
            setTimeout(() => {
                initializeAllCharts();
            }, 100);
            checkForNotifications();
            
            // Initialize first service row
            initializeServiceRows();
            
            // Initialize calendar for expense date
            initializeCalendar();
            
            // Show dashboard by default
            showSection('dashboard');
            
            // Check for saved dark mode preference
            const savedDarkMode = localStorage.getItem('smartCscDarkMode');
            if (savedDarkMode === 'true') {
                toggleDarkMode();
            }
        });
        
        // Initialize Flatpickr Calendar
        function initializeCalendar() {
            flatpickr("#expenseDate", {
                dateFormat: "d/m/Y",
                maxDate: "today",
                onChange: function(selectedDates, dateStr, instance) {
                    // Optional: Auto-fill month/year based on selected date
                }
            });
        }
        
        // Initialize service rows
        function initializeServiceRows() {
            const container = document.getElementById('servicesContainer');
            if (container) {
                container.innerHTML = '';
                addServiceRow();
            }
        }
        
        // Initialize service dropdowns
        function initializeServiceDropdowns() {
            const dropdowns = document.querySelectorAll('.service-type');
            dropdowns.forEach(dropdown => {
                populateServiceDropdown(dropdown);
            });
        }
        
        // Populate service dropdown
        function populateServiceDropdown(dropdown) {
            let options = '<option value="">Select Service</option>';
            serviceCategories.forEach(category => {
                options += `<optgroup label="${category.name}">`;
                category.services.forEach(service => {
                    options += `<option value="${service.name}" data-price="${service.price}">${service.name} - ₹${service.price}</option>`;
                });
                options += `</optgroup>`;
            });
            dropdown.innerHTML = options;
            
            // Add change event to set price
            dropdown.addEventListener('change', function() {
                const selected = this.options[this.selectedIndex];
                const price = selected.dataset.price || 0;
                const row = this.closest('.service-card');
                if (row) {
                    const amountInput = row.querySelector('.service-amount');
                    if (amountInput && price > 0) {
                        amountInput.value = price;
                        calculateTotalAmount();
                    }
                }
            });
        }
        
        // Add new service row
        function addServiceRow() {
            const container = document.getElementById('servicesContainer');
            if (!container) return;
            
            const rowId = Date.now() + Math.random();
            const newRow = document.createElement('div');
            newRow.className = 'service-card';
            newRow.id = `serviceRow_${rowId}`;
            newRow.innerHTML = `
                <div class="flex justify-end mb-2">
                    <button type="button" onclick="removeServiceRow('${rowId}')" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-times-circle"></i> Remove
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                        <select class="service-type w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required>
                            <option value="">Select Service</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <input type="text" class="service-desc w-full p-2 border border-gray-300 rounded-lg" placeholder="Work description" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                        <input type="number" class="service-amount w-full p-2 border border-gray-300 rounded-lg" min="0" value="0" required onchange="calculateTotalAmount()">
                    </div>
                </div>
            `;
            container.appendChild(newRow);
            populateServiceDropdown(newRow.querySelector('.service-type'));
        }
        
        // Remove service row
        function removeServiceRow(rowId) {
            const row = document.getElementById(`serviceRow_${rowId}`);
            if (row) {
                row.remove();
                calculateTotalAmount();
            }
        }
        
        // Calculate total amount from all services
        function calculateTotalAmount() {
            const amounts = document.querySelectorAll('.service-amount');
            let total = 0;
            amounts.forEach(input => {
                total += parseFloat(input.value) || 0;
            });
            const totalAmountInput = document.getElementById('totalAmount');
            if (totalAmountInput) totalAmountInput.value = total;
            calculateRemaining();
        }
        
        // Calculate remaining amount
        function calculateRemaining() {
            const total = parseFloat(document.getElementById('totalAmount')?.value) || 0;
            const paid = parseFloat(document.getElementById('paidAmount')?.value) || 0;
            const remaining = total - paid;
            const remainingInput = document.getElementById('remainingAmount');
            if (remainingInput) remainingInput.value = remaining >= 0 ? remaining : 0;
            
            // Update payment status
            const paymentStatus = document.getElementById('paymentStatus');
            if (paymentStatus) {
                if (remaining <= 0 && total > 0) {
                    paymentStatus.value = 'Completed';
                } else if (paid > 0 && remaining > 0) {
                    paymentStatus.value = 'Partial';
                } else {
                    paymentStatus.value = 'Pending';
                }
            }
        }
        
        // Set default dates in form
        function setDefaultDates() {
            const today = new Date().toISOString().split('T')[0];
            const workDate = document.getElementById('workDate');
            const expectedDelivery = document.getElementById('expectedDelivery');
            
            if (workDate) workDate.value = today;
            
            if (expectedDelivery) {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                expectedDelivery.value = nextWeek.toISOString().split('T')[0];
            }
        }
        
        // Load from LocalStorage
        function loadFromLocalStorage() {
            // Load customers
            const storedCustomers = localStorage.getItem('smartCscCustomers');
            if (storedCustomers) {
                try {
                    customers = JSON.parse(storedCustomers);
                } catch (e) {
                    customers = [];
                }
            } else {
                // Add sample data
                customers = [
                    {
                        id: 1,
                        name: "Rajesh Kumar",
                        mobile: "9876543210",
                        address: "Delhi",
                        services: [{ type: "Aadhaar Card", description: "New Enrollment", amount: 500 }],
                        workDate: new Date().toISOString().split('T')[0],
                        expectedDelivery: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
                        totalAmount: 500,
                        paidAmount: 500,
                        remainingAmount: 0,
                        paymentStatus: "Completed",
                        status: "Completed",
                        createdAt: new Date().toISOString()
                    }
                ];
            }
            
            // Load expenses
            const storedExpenses = localStorage.getItem('smartCscExpenses');
            if (storedExpenses) {
                try {
                    expenses = JSON.parse(storedExpenses);
                } catch (e) {
                    expenses = [];
                }
            }
            
            // Load center info
            const storedCenter = localStorage.getItem('smartCscCenterInfo');
            if (storedCenter) {
                try {
                    centerInfo = JSON.parse(storedCenter);
                } catch (e) {}
            }
            
            // Load service categories
            const storedCategories = localStorage.getItem('smartCscServiceCategories');
            if (storedCategories) {
                try {
                    serviceCategories = JSON.parse(storedCategories);
                } catch (e) {}
            }
        }
        
        // Save to LocalStorage
        function saveToLocalStorage() {
            localStorage.setItem('smartCscCustomers', JSON.stringify(customers));
            localStorage.setItem('smartCscExpenses', JSON.stringify(expenses));
            localStorage.setItem('smartCscCenterInfo', JSON.stringify(centerInfo));
            localStorage.setItem('smartCscServiceCategories', JSON.stringify(serviceCategories));
            updateDashboard();
            renderWorkManager();
            renderPendingWork();
            updateCustomerSelect();
            checkForNotifications();
            initializeAllCharts();
            initializeServiceDropdowns();
        }
        
        // Add Expense with Date
        function addExpense() {
            const dateStr = document.getElementById('expenseDate').value;
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const desc = document.getElementById('expenseDesc').value;
            const category = document.getElementById('expenseCategory').value;
            
            if (!dateStr) {
                showToast('Please select a date', 'error');
                return;
            }
            
            if (!amount || amount <= 0) {
                showToast('Please enter valid amount', 'error');
                return;
            }
            
            // Parse date (format: dd/mm/yyyy)
            const parts = dateStr.split('/');
            const date = new Date(parts[2], parts[1] - 1, parts[0]);
            
            const expense = {
                id: Date.now(),
                date: date.toISOString(),
                day: parts[0],
                month: parseInt(parts[1]) - 1,
                year: parseInt(parts[2]),
                amount: amount,
                description: desc || 'Expense',
                category: category,
                dateStr: dateStr
            };
            
            expenses.push(expense);
            saveToLocalStorage();
            renderExpenseHistory();
            updateFinancialCharts();
            showToast('Expense added successfully!', 'success');
            
            // Clear form
            document.getElementById('expenseDate').value = '';
            document.getElementById('expenseAmount').value = '';
            document.getElementById('expenseDesc').value = '';
        }
        
        // Delete Expense
        function deleteExpense(id) {
            if (confirm('Delete this expense?')) {
                expenses = expenses.filter(e => e.id !== id);
                saveToLocalStorage();
                renderExpenseHistory();
                updateFinancialCharts();
                showToast('Expense deleted', 'success');
            }
        }
        
        // Render Expense History
        function renderExpenseHistory() {
            const tbody = document.getElementById('expenseHistoryTable');
            if (!tbody) return;
            
            if (expenses.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No expenses added yet</td></tr>';
                return;
            }
            
            let html = '';
            expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(exp => {
                html += `
                    <tr class="border-b">
                        <td class="py-2 px-2">${exp.dateStr || formatDate(exp.date)}</td>
                        <td class="py-2 px-2">${exp.category || 'Other'}</td>
                        <td class="py-2 px-2">${exp.description || '-'}</td>
                        <td class="py-2 px-2 font-bold">₹${exp.amount}</td>
                        <td class="py-2 px-2">
                            <button onclick="deleteExpense(${exp.id})" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
        }
        
        // Initialize all charts
        function initializeAllCharts() {
            initializeFinancialChart();
            initializeServiceChart();
            initializeMonthlyComparisonChart();
            initializeProfitDistributionChart();
            updateFinancialSummary();
        }
        
        // Update Financial Charts
        function updateFinancialCharts() {
            initializeMonthlyComparisonChart();
            initializeProfitDistributionChart();
            updateFinancialSummary();
        }
        
        // Initialize Financial Chart (Income/Expense/Profit)
        function initializeFinancialChart() {
            const ctx = document.getElementById('financialChart');
            if (!ctx) return;
            
            if (financialChart) financialChart.destroy();
            
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentYear = new Date().getFullYear();
            
            // Calculate monthly data
            const monthlyIncome = new Array(12).fill(0);
            const monthlyExpense = new Array(12).fill(0);
            const monthlyProfit = new Array(12).fill(0);
            
            // Calculate income from customers
            customers.forEach(c => {
                if (c.workDate && c.paidAmount) {
                    const date = new Date(c.workDate);
                    if (date.getFullYear() === currentYear) {
                        monthlyIncome[date.getMonth()] += c.paidAmount || 0;
                    }
                }
            });
            
            // Calculate expenses
            expenses.forEach(e => {
                if (e.year === currentYear) {
                    monthlyExpense[e.month] += e.amount || 0;
                }
            });
            
            // Calculate profit
            for (let i = 0; i < 12; i++) {
                monthlyProfit[i] = monthlyIncome[i] - monthlyExpense[i];
            }
            
            financialChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'Income',
                            data: monthlyIncome,
                            backgroundColor: '#10b981',
                            borderRadius: 5
                        },
                        {
                            label: 'Expense',
                            data: monthlyExpense,
                            backgroundColor: '#ef4444',
                            borderRadius: 5
                        },
                        {
                            label: 'Profit',
                            data: monthlyProfit,
                            backgroundColor: '#a855f7',
                            borderRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '₹' + value;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Initialize Service Chart
        function initializeServiceChart() {
            const ctx = document.getElementById('serviceDistributionChart');
            if (!ctx) return;
            
            if (serviceChart) serviceChart.destroy();
            
            const serviceCount = {};
            
            customers.forEach(c => {
                if (c.services) {
                    c.services.forEach(s => {
                        if (s.type) {
                            serviceCount[s.type] = (serviceCount[s.type] || 0) + 1;
                        }
                    });
                }
            });
            
            if (Object.keys(serviceCount).length === 0) {
                serviceCount['No Data'] = 1;
            }
            
            serviceChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(serviceCount),
                    datasets: [{
                        data: Object.values(serviceCount),
                        backgroundColor: [
                            '#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b',
                            '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 15
                            }
                        }
                    },
                    cutout: '60%'
                }
            });
        }
        
        // Initialize Monthly Comparison Chart
        function initializeMonthlyComparisonChart() {
            const ctx = document.getElementById('monthlyComparisonChart');
            if (!ctx) return;
            
            if (monthlyComparisonChart) monthlyComparisonChart.destroy();
            
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentYear = new Date().getFullYear();
            
            const monthlyIncome = new Array(12).fill(0);
            const monthlyExpense = new Array(12).fill(0);
            
            customers.forEach(c => {
                if (c.workDate && c.paidAmount) {
                    const date = new Date(c.workDate);
                    if (date.getFullYear() === currentYear) {
                        monthlyIncome[date.getMonth()] += c.paidAmount || 0;
                    }
                }
            });
            
            expenses.forEach(e => {
                if (e.year === currentYear) {
                    monthlyExpense[e.month] += e.amount || 0;
                }
            });
            
            monthlyComparisonChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'Income',
                            data: monthlyIncome,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Expense',
                            data: monthlyExpense,
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '₹' + value;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Initialize Profit Distribution Chart
        function initializeProfitDistributionChart() {
            const ctx = document.getElementById('profitDistributionChart');
            if (!ctx) return;
            
            if (profitDistributionChart) profitDistributionChart.destroy();
            
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentYear = new Date().getFullYear();
            
            const monthlyProfit = new Array(12).fill(0);
            const profitColors = [];
            
            customers.forEach(c => {
                if (c.workDate && c.paidAmount) {
                    const date = new Date(c.workDate);
                    if (date.getFullYear() === currentYear) {
                        monthlyProfit[date.getMonth()] += c.paidAmount || 0;
                    }
                }
            });
            
            expenses.forEach(e => {
                if (e.year === currentYear) {
                    monthlyProfit[e.month] -= e.amount || 0;
                }
            });
            
            // Set colors based on profit/loss
            monthlyProfit.forEach(profit => {
                profitColors.push(profit >= 0 ? '#10b981' : '#ef4444');
            });
            
            profitDistributionChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Profit/Loss',
                        data: monthlyProfit,
                        backgroundColor: profitColors,
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '₹' + value;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Update Financial Summary
        function updateFinancialSummary() {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            
            // Calculate monthly income
            const monthlyIncome = customers
                .filter(c => {
                    if (!c.workDate) return false;
                    const date = new Date(c.workDate);
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                })
                .reduce((sum, c) => sum + (c.paidAmount || 0), 0);
            
            // Calculate monthly expense
            const monthlyExpense = expenses
                .filter(e => e.month === currentMonth && e.year === currentYear)
                .reduce((sum, e) => sum + (e.amount || 0), 0);
            
            const monthlyProfit = monthlyIncome - monthlyExpense;
            const profitMargin = monthlyIncome > 0 ? ((monthlyProfit / monthlyIncome) * 100).toFixed(1) : 0;
            
            document.getElementById('financialMonthlyIncome').textContent = `₹${monthlyIncome}`;
            document.getElementById('financialMonthlyExpense').textContent = `₹${monthlyExpense}`;
            document.getElementById('financialMonthlyProfit').textContent = `₹${monthlyProfit}`;
            document.getElementById('financialProfitMargin').textContent = `${profitMargin}%`;
        }
        
        // Add Customer with multiple services
        function addCustomer() {
            // Get customer basic details
            const name = document.getElementById('customerName').value;
            const mobile = document.getElementById('mobileNumber').value;
            const address = document.getElementById('address').value;
            const workDate = document.getElementById('workDate').value;
            const expectedDelivery = document.getElementById('expectedDelivery').value;
            const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
            const paymentStatus = document.getElementById('paymentStatus').value;
            
            // Get all services
            const serviceTypes = document.querySelectorAll('.service-type');
            const serviceDescs = document.querySelectorAll('.service-desc');
            const serviceAmounts = document.querySelectorAll('.service-amount');
            
            // Validation
            if (!name || !mobile || !workDate || !expectedDelivery) {
                showToast('Please fill all required fields', 'error');
                return;
            }
            
            if (mobile.length !== 10) {
                showToast('Mobile number must be 10 digits', 'error');
                return;
            }
            
            // Validate at least one service
            if (serviceTypes.length === 0) {
                showToast('Please add at least one service', 'error');
                return;
            }
            
            // Create services array
            const services = [];
            let totalAmount = 0;
            
            for (let i = 0; i < serviceTypes.length; i++) {
                const type = serviceTypes[i].value;
                const desc = serviceDescs[i].value;
                const amount = parseFloat(serviceAmounts[i].value) || 0;
                
                if (!type || !desc) {
                    showToast('Please fill all service details', 'error');
                    return;
                }
                
                services.push({
                    type: type,
                    description: desc,
                    amount: amount
                });
                
                totalAmount += amount;
            }
            
            const remainingAmount = totalAmount - paidAmount;
            
            const customer = {
                id: Date.now(),
                name: name,
                mobile: mobile,
                address: address,
                services: services,
                workDate: workDate,
                expectedDelivery: expectedDelivery,
                totalAmount: totalAmount,
                paidAmount: paidAmount,
                remainingAmount: remainingAmount,
                paymentStatus: paymentStatus,
                status: 'Pending',
                createdAt: new Date().toISOString()
            };
            
            customers.push(customer);
            saveToLocalStorage();
            
            // Show success message
            showToast(`Customer added successfully with ${services.length} services!`, 'success');
            
            // Clear form
            clearForm();
            
            // Switch to work manager
            showSection('workmanager');
        }
        
        // Render Work Manager Table
        function renderWorkManager(filteredCustomers = null) {
            const data = filteredCustomers || customers;
            const tbody = document.getElementById('workManagerTableBody');
            
            if (!tbody) return;
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="10" class="text-center py-8 text-gray-500">No work records found</td></tr>';
                return;
            }
            
            let html = '';
            [...data].sort((a, b) => new Date(b.workDate) - new Date(a.workDate)).forEach((customer, index) => {
                const statusClass = customer.status === 'Completed' ? 'status-completed' : 
                                   customer.status === 'In Process' ? 'status-inprocess' : 'status-pending';
                
                // Get service names
                const serviceNames = customer.services ? customer.services.map(s => s.type).join(', ') : '-';
                
                html += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-3 px-2">${index + 1}</td>
                        <td class="py-3 px-2 font-medium">${customer.name || '-'}</td>
                        <td class="py-3 px-2">${customer.mobile || '-'}</td>
                        <td class="py-3 px-2">${serviceNames}</td>
                        <td class="py-3 px-2">
                            <span class="status-badge ${statusClass}">${customer.status || 'Pending'}</span>
                        </td>
                        <td class="py-3 px-2">${formatDate(customer.workDate)}</td>
                        <td class="py-3 px-2">₹${customer.totalAmount || 0}</td>
                        <td class="py-3 px-2">₹${customer.paidAmount || 0}</td>
                        <td class="py-3 px-2 font-bold ${customer.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}">
                            ₹${customer.remainingAmount || 0}
                        </td>
                        <td class="py-3 px-2">
                            <div class="flex space-x-2">
                                <button onclick="editCustomer(${customer.id})" class="text-blue-600 hover:text-blue-800" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteCustomer(${customer.id})" class="text-red-600 hover:text-red-800" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button onclick="showCustomerSlip(${customer.id})" class="text-purple-600 hover:text-purple-800" title="Print Slip">
                                    <i class="fas fa-receipt"></i>
                                </button>
                                <button onclick="sendWhatsApp('${customer.mobile}', '${customer.name}')" class="text-green-600 hover:text-green-800" title="Send WhatsApp">
                                    <i class="fab fa-whatsapp"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
        }
        
        // Filter Work Manager
        function filterWorkManager() {
            const nameFilter = document.getElementById('searchName')?.value.toLowerCase() || '';
            const mobileFilter = document.getElementById('searchMobile')?.value.toLowerCase() || '';
            const serviceFilter = document.getElementById('searchService')?.value || '';
            const statusFilter = document.getElementById('searchStatus')?.value || '';
            
            const filtered = customers.filter(customer => {
                const matchName = !nameFilter || (customer.name && customer.name.toLowerCase().includes(nameFilter));
                const matchMobile = !mobileFilter || (customer.mobile && customer.mobile.includes(mobileFilter));
                
                // Check if any service matches
                let matchService = !serviceFilter;
                if (serviceFilter && customer.services) {
                    matchService = customer.services.some(s => s.type === serviceFilter);
                }
                
                const matchStatus = !statusFilter || customer.status === statusFilter;
                
                return matchName && matchMobile && matchService && matchStatus;
            });
            
            renderWorkManager(filtered);
        }
        
        // Global Search
        function searchCustomers() {
            const searchTerm = document.getElementById('globalSearch')?.value.toLowerCase() || 
                              document.getElementById('mobileGlobalSearch')?.value.toLowerCase() || '';
            
            if (!searchTerm) {
                renderWorkManager();
                return;
            }
            
            const filtered = customers.filter(customer => 
                (customer.name && customer.name.toLowerCase().includes(searchTerm)) ||
                (customer.mobile && customer.mobile.includes(searchTerm)) ||
                (customer.services && customer.services.some(s => s.type.toLowerCase().includes(searchTerm)))
            );
            
            renderWorkManager(filtered);
        }
        
        // Edit Customer
        function editCustomer(id) {
            const customer = customers.find(c => c.id === id);
            if (!customer) return;
            
            document.getElementById('editId').value = customer.id;
            document.getElementById('editName').value = customer.name || '';
            document.getElementById('editMobile').value = customer.mobile || '';
            
            // Populate service dropdown
            const serviceSelect = document.getElementById('editService');
            populateServiceDropdown(serviceSelect);
            
            if (customer.services && customer.services.length > 0) {
                serviceSelect.value = customer.services[0].type;
            }
            
            document.getElementById('editStatus').value = customer.status || 'Pending';
            document.getElementById('editTotal').value = customer.totalAmount || 0;
            document.getElementById('editPaid').value = customer.paidAmount || 0;
            
            document.getElementById('editModal').style.display = 'block';
        }
        
        // Update Customer
        function updateCustomer() {
            const id = parseInt(document.getElementById('editId').value);
            const index = customers.findIndex(c => c.id === id);
            
            if (index !== -1) {
                const total = parseFloat(document.getElementById('editTotal').value) || 0;
                const paid = parseFloat(document.getElementById('editPaid').value) || 0;
                
                // Update basic info while preserving services
                customers[index] = {
                    ...customers[index],
                    name: document.getElementById('editName').value,
                    mobile: document.getElementById('editMobile').value,
                    status: document.getElementById('editStatus').value,
                    totalAmount: total,
                    paidAmount: paid,
                    remainingAmount: total - paid
                };
                
                // Update service if exists
                if (customers[index].services && customers[index].services.length > 0) {
                    customers[index].services[0].type = document.getElementById('editService').value;
                }
                
                saveToLocalStorage();
                closeEditModal();
                showToast('Customer updated successfully!', 'success');
            }
        }
        
        // Delete Customer
        function deleteCustomer(id) {
            if (confirm('Are you sure you want to delete this record?')) {
                customers = customers.filter(c => c.id !== id);
                saveToLocalStorage();
                showToast('Record deleted successfully!', 'success');
            }
        }
        
        // Show Customer Slip
        function showCustomerSlip(id) {
            currentSlipCustomerId = id;
            const customer = customers.find(c => c.id === id);
            if (!customer) return;
            
            const slipContent = document.getElementById('slipContent');
            const today = new Date().toLocaleDateString();
            
            let servicesHtml = '';
            if (customer.services && customer.services.length > 0) {
                customer.services.forEach((service, index) => {
                    servicesHtml += `
                        <div class="slip-row">
                            <span>${index + 1}. ${service.type}</span>
                            <span>₹${service.amount}</span>
                        </div>
                        <div class="text-xs text-gray-500 mb-2 pl-4">${service.description || ''}</div>
                    `;
                });
            }
            
            slipContent.innerHTML = `
                <div class="slip-header">
                    <h2 class="text-2xl font-bold text-purple-600">${centerInfo.name}</h2>
                    <p class="text-sm text-gray-600">${centerInfo.welcomeMsg}</p>
                </div>
                
                <div class="mb-4 text-center text-xs text-gray-500">
                    <p>${centerInfo.address}</p>
                    <p>📞 ${centerInfo.mobile} | ✉️ ${centerInfo.email}</p>
                    <p>🕒 ${centerInfo.hours}</p>
                </div>
                
                <div class="mb-4">
                    <p><strong>Receipt No:</strong> #${customer.id}</p>
                    <p><strong>Date:</strong> ${today}</p>
                </div>
                
                <div class="mb-4 p-3 bg-purple-50 rounded-lg">
                    <h3 class="font-bold mb-2">Customer Details:</h3>
                    <p><strong>Name:</strong> ${customer.name}</p>
                    <p><strong>Mobile:</strong> ${customer.mobile}</p>
                    <p><strong>Address:</strong> ${customer.address || 'N/A'}</p>
                </div>
                
                <div class="mb-4">
                    <h3 class="font-bold mb-2">Services:</h3>
                    ${servicesHtml}
                </div>
                
                <div class="mb-4">
                    <div class="slip-row font-bold">
                        <span>Total Amount:</span>
                        <span>₹${customer.totalAmount || 0}</span>
                    </div>
                    <div class="slip-row">
                        <span>Paid Amount:</span>
                        <span>₹${customer.paidAmount || 0}</span>
                    </div>
                    <div class="slip-row font-bold ${customer.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}">
                        <span>Due Amount:</span>
                        <span>₹${customer.remainingAmount || 0}</span>
                    </div>
                </div>
                
                <div class="mb-4">
                    <p><strong>Work Date:</strong> ${formatDate(customer.workDate)}</p>
                    <p><strong>Expected Delivery:</strong> ${formatDate(customer.expectedDelivery)}</p>
                </div>
                
                <div class="mt-4 pt-4 border-t text-center">
                    <p class="text-sm text-gray-600">Thank you for choosing ${centerInfo.name}</p>
                    <p class="text-xs text-gray-500">Authorized CSC Center | VLE: ${centerInfo.owner}</p>
                </div>
            `;
            
            document.getElementById('slipModal').style.display = 'block';
        }
        
        // Close Slip Modal
        function closeSlipModal() {
            document.getElementById('slipModal').style.display = 'none';
            currentSlipCustomerId = null;
        }
        
        // Print Slip
        function printSlip() {
            const slipContent = document.getElementById('slipContent').innerHTML;
            const printWindow = window.open('', '_blank');
            
            printWindow.document.write(`
                <html>
                <head>
                    <title>Customer Service Slip - ${centerInfo.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .service-slip { max-width: 400px; margin: 0 auto; }
                        .slip-header { text-align: center; border-bottom: 2px dashed #a855f7; padding-bottom: 15px; margin-bottom: 15px; }
                        .slip-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #e5e7eb; }
                        .text-purple-600 { color: #a855f7; }
                        .text-red-600 { color: #dc2626; }
                        .text-green-600 { color: #16a34a; }
                    </style>
                </head>
                <body>
                    <div class="service-slip">
                        ${slipContent}
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    <\/script>
                </body>
                </html>
            `);
            
            printWindow.document.close();
        }
        
        // Share Slip via WhatsApp (Fixed)
        function shareSlip() {
            if (!currentSlipCustomerId) {
                showToast('No slip selected', 'error');
                return;
            }
            
            const customer = customers.find(c => c.id === currentSlipCustomerId);
            if (!customer) return;
            
            // Create service list
            let serviceList = '';
            customer.services.forEach((s, i) => {
                serviceList += `• ${s.type}: ₹${s.amount}%0a`;
            });
            
            // Create message
            const message = `📄 *${centerInfo.name}*%0a📞 ${centerInfo.mobile}%0a%0a👤 *Customer:* ${customer.name}%0a📱 Mobile: ${customer.mobile}%0a%0a🛠️ *Services:*%0a${serviceList}%0a💰 *Total: ₹${customer.totalAmount}*%0a💵 Paid: ₹${customer.paidAmount}%0a⚡ Due: ₹${customer.remainingAmount}%0a%0a📅 Work Date: ${formatDate(customer.workDate)}%0a📦 Expected: ${formatDate(customer.expectedDelivery)}%0a%0a✅ Thank you for choosing ${centerInfo.name}!`;
            
            const url = `https://wa.me/91${customer.mobile}?text=${message}`;
            window.open(url, '_blank');
            showToast('WhatsApp opened!', 'success');
        }
        
        // Close Edit Modal
        function closeEditModal() {
            document.getElementById('editModal').style.display = 'none';
        }
        
        // Send WhatsApp
        function sendWhatsApp(mobile, name) {
            if (!mobile) {
                showToast('Mobile number not available', 'error');
                return;
            }
            const message = `Hello ${name}, your work is in process at ${centerInfo.name}. For any queries, contact ${centerInfo.mobile}. Thank you!`;
            const url = `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
        
        // Render Pending Work
        function renderPendingWork() {
            const pending = customers.filter(c => c.status !== 'Completed');
            const tbody = document.getElementById('pendingWorkTableBody');
            
            if (!tbody) return;
            
            if (pending.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-gray-500">No pending work</td></tr>';
                document.getElementById('totalPendingCount').textContent = '0';
                document.getElementById('overdueCount').textContent = '0';
                document.getElementById('urgentCount').textContent = '0';
                document.getElementById('pendingAmountTotal').textContent = '₹0';
                return;
            }
            
            let html = '';
            let overdue = 0;
            let urgent = 0;
            let totalPendingAmount = 0;
            
            pending.forEach(customer => {
                const today = new Date();
                const deliveryDate = new Date(customer.expectedDelivery);
                const daysPending = Math.ceil((today - deliveryDate) / (1000 * 60 * 60 * 24));
                
                if (daysPending > 0) {
                    if (daysPending > 15) urgent++;
                    else if (daysPending > 7) overdue++;
                }
                
                totalPendingAmount += customer.remainingAmount || 0;
                
                const statusClass = daysPending > 15 ? 'bg-red-100 text-red-800' :
                                   daysPending > 7 ? 'bg-orange-100 text-orange-800' :
                                   'bg-yellow-100 text-yellow-800';
                
                // Get service names
                const serviceNames = customer.services ? customer.services.map(s => s.type).join(', ') : '-';
                
                html += `
                    <tr class="border-b">
                        <td class="py-3 px-2 font-medium">${customer.name || '-'}</td>
                        <td class="py-3 px-2">${serviceNames}</td>
                        <td class="py-3 px-2">${formatDate(customer.workDate)}</td>
                        <td class="py-3 px-2">${formatDate(customer.expectedDelivery)}</td>
                        <td class="py-3 px-2">
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                                ${daysPending > 0 ? daysPending + ' days' : 'On Time'}
                            </span>
                        </td>
                        <td class="py-3 px-2 font-bold text-red-600">₹${customer.remainingAmount || 0}</td>
                        <td class="py-3 px-2">
                            <span class="status-badge ${customer.status === 'Pending' ? 'status-pending' : 'status-inprocess'}">
                                ${customer.status || 'Pending'}
                            </span>
                        </td>
                        <td class="py-3 px-2">
                            <button onclick="editCustomer(${customer.id})" class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
            document.getElementById('totalPendingCount').textContent = pending.length;
            document.getElementById('overdueCount').textContent = overdue;
            document.getElementById('urgentCount').textContent = urgent;
            document.getElementById('pendingAmountTotal').textContent = `₹${totalPendingAmount}`;
        }
        
        // Render Categories
        function renderCategories() {
            const container = document.getElementById('categoriesContainer');
            if (!container) return;
            
            let html = '';
            serviceCategories.forEach(category => {
                let servicesHtml = '';
                category.services.forEach(service => {
                    servicesHtml += `
                        <div class="service-item">
                            <div>
                                <span class="font-medium">${service.name}</span>
                                <p class="text-xs opacity-75">${service.desc || ''} | ₹${service.price || 0}</p>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="editService(${category.id}, ${service.id})" class="text-blue-300 hover:text-white">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteService(${category.id}, ${service.id})" class="text-red-300 hover:text-white">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                html += `
                    <div class="category-card">
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl font-bold">${category.name}</h3>
                            <div class="flex space-x-2">
                                <button onclick="openAddServiceModal(${category.id})" class="bg-white text-purple-600 px-3 py-1 rounded-lg text-sm hover:bg-purple-100">
                                    <i class="fas fa-plus mr-1"></i>Add Service
                                </button>
                                <button onclick="deleteCategory(${category.id})" class="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mt-3 space-y-2">
                            ${servicesHtml}
                        </div>
                    </div>
                `;
            });
            
            // Add button for new category at the bottom
            html += `
                <button onclick="addCategory()" class="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition">
                    <i class="fas fa-plus mr-2"></i>Add New Category
                </button>
            `;
            
            container.innerHTML = html;
        }
        
        // Add Category
        function addCategory() {
            const name = document.getElementById('newCategoryName')?.value;
            if (!name) {
                showToast('Please enter category name', 'error');
                return;
            }
            
            const newCategory = {
                id: Date.now(),
                name: name,
                services: []
            };
            
            serviceCategories.push(newCategory);
            saveToLocalStorage();
            renderCategories();
            initializeServiceDropdowns();
            
            document.getElementById('newCategoryName').value = '';
            showToast('Category added successfully!', 'success');
        }
        
        // Delete Category
        function deleteCategory(categoryId) {
            if (confirm('Are you sure? All services in this category will also be deleted.')) {
                serviceCategories = serviceCategories.filter(c => c.id !== categoryId);
                saveToLocalStorage();
                renderCategories();
                initializeServiceDropdowns();
                showToast('Category deleted', 'success');
            }
        }
        
        // Open Add Service Modal
        function openAddServiceModal(categoryId) {
            document.getElementById('serviceCategoryId').value = categoryId;
            document.getElementById('addServiceForm').reset();
            document.getElementById('addServiceModal').style.display = 'block';
        }
        
        // Close Add Service Modal
        function closeAddServiceModal() {
            document.getElementById('addServiceModal').style.display = 'none';
        }
        
        // Add Service to Category
        function addServiceToCategory() {
            const categoryId = parseInt(document.getElementById('serviceCategoryId').value);
            const name = document.getElementById('serviceName').value;
            const desc = document.getElementById('serviceDesc').value;
            const price = parseFloat(document.getElementById('servicePrice').value) || 0;
            
            if (!name) {
                showToast('Please enter service name', 'error');
                return;
            }
            
            const category = serviceCategories.find(c => c.id === categoryId);
            if (category) {
                const newService = {
                    id: Date.now(),
                    name: name,
                    desc: desc,
                    price: price
                };
                
                category.services.push(newService);
                saveToLocalStorage();
                renderCategories();
                initializeServiceDropdowns();
                closeAddServiceModal();
                showToast('Service added successfully!', 'success');
            }
        }
        
        // Edit Service
        function editService(categoryId, serviceId) {
            const category = serviceCategories.find(c => c.id === categoryId);
            if (!category) return;
            
            const service = category.services.find(s => s.id === serviceId);
            if (!service) return;
            
            const newName = prompt('Edit service name:', service.name);
            if (newName) {
                service.name = newName;
                
                const newDesc = prompt('Edit description:', service.desc || '');
                if (newDesc !== null) service.desc = newDesc;
                
                const newPrice = prompt('Edit price (₹):', service.price);
                if (newPrice !== null) service.price = parseFloat(newPrice) || 0;
                
                saveToLocalStorage();
                renderCategories();
                initializeServiceDropdowns();
                showToast('Service updated', 'success');
            }
        }
        
        // Delete Service
        function deleteService(categoryId, serviceId) {
            if (confirm('Delete this service?')) {
                const category = serviceCategories.find(c => c.id === categoryId);
                if (category) {
                    category.services = category.services.filter(s => s.id !== serviceId);
                    saveToLocalStorage();
                    renderCategories();
                    initializeServiceDropdowns();
                    showToast('Service deleted', 'success');
                }
            }
        }
        
        // Update Customer Select for History
        function updateCustomerSelect() {
            const select = document.getElementById('historyCustomerSelect');
            if (!select) return;
            
            const uniqueCustomers = [...new Map(customers.map(c => [c.mobile, c])).values()];
            
            let options = '<option value="">Select Customer</option>';
            uniqueCustomers.forEach(customer => {
                options += `<option value="${customer.mobile}">${customer.name || 'Unknown'} (${customer.mobile})</option>`;
            });
            
            select.innerHTML = options;
        }
        
        // Show Customer History
        function showCustomerHistory() {
            const mobile = document.getElementById('historyCustomerSelect').value;
            
            if (!mobile) {
                document.getElementById('customerHistoryDisplay').classList.add('hidden');
                return;
            }
            
            const customerRecords = customers.filter(c => c.mobile === mobile);
            const customer = customerRecords[0];
            
            if (!customer) return;
            
            document.getElementById('historyCustomerName').textContent = customer.name || 'Unknown';
            document.getElementById('historyMobile').textContent = customer.mobile;
            document.getElementById('historyAddress').textContent = customer.address || 'N/A';
            document.getElementById('historyTotalServices').textContent = customerRecords.length;
            
            const totalAmount = customerRecords.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
            const paidAmount = customerRecords.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
            const dueAmount = totalAmount - paidAmount;
            
            document.getElementById('historyTotalAmount').textContent = `₹${totalAmount}`;
            document.getElementById('historyPaidAmount').textContent = `₹${paidAmount}`;
            document.getElementById('historyDueAmount').textContent = `₹${dueAmount}`;
            
            let html = '';
            customerRecords.sort((a, b) => new Date(b.workDate) - new Date(a.workDate)).forEach(record => {
                // Get service names
                const serviceNames = record.services ? record.services.map(s => s.type).join(', ') : '-';
                
                html += `
                    <tr class="border-b">
                        <td class="py-2 px-2">${formatDate(record.workDate)}</td>
                        <td class="py-2 px-2">${serviceNames}</td>
                        <td class="py-2 px-2">${record.services ? record.services[0].description : '-'}</td>
                        <td class="py-2 px-2">
                            <span class="status-badge ${record.status === 'Completed' ? 'status-completed' : 'status-pending'}">
                                ${record.status || 'Pending'}
                            </span>
                        </td>
                        <td class="py-2 px-2">₹${record.totalAmount || 0}</td>
                    </tr>
                `;
            });
            
            document.getElementById('customerHistoryTable').innerHTML = html;
            document.getElementById('customerHistoryDisplay').classList.remove('hidden');
        }
        
        // Print Customer Slip (from history)
        function printCustomerSlip() {
            const mobile = document.getElementById('historyCustomerSelect').value;
            if (!mobile) return;
            
            const customerRecords = customers.filter(c => c.mobile === mobile);
            if (customerRecords.length === 0) return;
            
            // Show slip for latest record
            showCustomerSlip(customerRecords[0].id);
        }
        
        // Load Center Info
        function loadCenterInfo() {
            document.getElementById('centerName').value = centerInfo.name || '';
            document.getElementById('ownerName').value = centerInfo.owner || '';
            document.getElementById('centerMobile').value = centerInfo.mobile || '';
            document.getElementById('centerEmail').value = centerInfo.email || '';
            document.getElementById('centerAddress').value = centerInfo.address || '';
            document.getElementById('centerGST').value = centerInfo.gst || '';
            document.getElementById('workingHours').value = centerInfo.hours || '';
            document.getElementById('welcomeMessage').value = centerInfo.welcomeMsg || '';
            
            updateCenterPreview();
        }
        
        // Save Center Info
        function saveCenterInfo() {
            centerInfo = {
                name: document.getElementById('centerName').value,
                owner: document.getElementById('ownerName').value,
                mobile: document.getElementById('centerMobile').value,
                email: document.getElementById('centerEmail').value,
                address: document.getElementById('centerAddress').value,
                gst: document.getElementById('centerGST').value,
                hours: document.getElementById('workingHours').value,
                welcomeMsg: document.getElementById('welcomeMessage').value
            };
            
            saveToLocalStorage();
            updateCenterPreview();
            showToast('Center information saved successfully!', 'success');
        }
        
        // Update Center Preview
        function updateCenterPreview() {
            document.getElementById('previewCenterName').textContent = centerInfo.name || 'Pro CSC Center';
            document.getElementById('previewOwner').textContent = `VLE: ${centerInfo.owner || 'Your Name'}`;
            document.getElementById('previewAddress').textContent = centerInfo.address || 'Address will appear here';
            document.getElementById('previewContact').textContent = `Mobile: ${centerInfo.mobile || '-'} | Email: ${centerInfo.email || '-'}`;
        }
        
        // Update Dashboard
        function updateDashboard() {
            const today = new Date().toISOString().split('T')[0];
            
            const todayCustomers = customers.filter(c => c.workDate === today).length;
            const todayServices = customers.reduce((total, c) => {
                if (c.workDate === today) {
                    return total + (c.services ? c.services.length : 1);
                }
                return total;
            }, 0);
            
            const pendingWork = customers.filter(c => c.status !== 'Completed').length;
            const completedWork = customers.filter(c => c.status === 'Completed').length;
            
            const todayIncome = customers
                .filter(c => c.workDate === today)
                .reduce((sum, c) => sum + (c.paidAmount || 0), 0);
            
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyIncome = customers
                .filter(c => {
                    if (!c.workDate) return false;
                    const date = new Date(c.workDate);
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                })
                .reduce((sum, c) => sum + (c.paidAmount || 0), 0);
            
            const totalPendingAmount = customers.reduce((sum, c) => sum + (c.remainingAmount || 0), 0);
            
            // Calculate monthly profit
            const monthlyExpense = expenses
                .filter(e => e.month === currentMonth && e.year === currentYear)
                .reduce((sum, e) => sum + (e.amount || 0), 0);
            const monthlyProfit = monthlyIncome - monthlyExpense;
            
            document.getElementById('totalCustomersToday').textContent = todayCustomers;
            document.getElementById('totalServicesToday').textContent = todayServices;
            document.getElementById('pendingWork').textContent = pendingWork;
            document.getElementById('completedWork').textContent = completedWork;
            document.getElementById('todayIncome').textContent = `₹${todayIncome}`;
            document.getElementById('monthlyIncome').textContent = `₹${monthlyIncome}`;
            document.getElementById('totalPendingAmount').textContent = `₹${totalPendingAmount}`;
            document.getElementById('monthlyProfit').textContent = `₹${monthlyProfit}`;
            
            // Update recent customers table
            updateRecentCustomers();
        }
        
        // Update Recent Customers
        function updateRecentCustomers() {
            const recent = customers.slice(-5).reverse();
            const tbody = document.getElementById('recentCustomersTable');
            
            if (!tbody) return;
            
            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No customers yet</td></tr>';
                return;
            }
            
            let html = '';
            recent.forEach(customer => {
                const statusClass = customer.status === 'Completed' ? 'status-completed' : 
                                   customer.status === 'In Process' ? 'status-inprocess' : 'status-pending';
                
                // Get service names
                const serviceNames = customer.services ? customer.services.map(s => s.type).join(', ') : '-';
                
                html += `
                    <tr class="border-b">
                        <td class="py-2 px-2">${customer.name || '-'}</td>
                        <td class="py-2 px-2">${serviceNames}</td>
                        <td class="py-2 px-2">
                            <span class="status-badge ${statusClass}">${customer.status || 'Pending'}</span>
                        </td>
                        <td class="py-2 px-2">${formatDate(customer.workDate)}</td>
                        <td class="py-2 px-2">₹${customer.totalAmount || 0}</td>
                        <td class="py-2 px-2">
                            <button onclick="showSection('history'); setTimeout(() => { document.getElementById('historyCustomerSelect').value='${customer.mobile}'; showCustomerHistory(); }, 100);" 
                                    class="text-purple-600 hover:text-purple-800">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
        }
        
        // Generate Report
        function generateReport() {
            const type = document.getElementById('reportType').value;
            const date = document.getElementById('reportDate').value;
            const month = document.getElementById('reportMonth').value;
            const year = document.getElementById('reportYear').value || new Date().getFullYear();
            
            let filtered = [];
            
            if (type === 'daily' && date) {
                filtered = customers.filter(c => c.workDate === date);
            } else if (type === 'monthly' && month) {
                filtered = customers.filter(c => {
                    if (!c.workDate) return false;
                    const cDate = new Date(c.workDate);
                    return cDate.getMonth() + 1 === parseInt(month) && cDate.getFullYear() === parseInt(year);
                });
            } else {
                showToast('Please select date/month', 'warning');
                return;
            }
            
            // Update report stats
            document.getElementById('reportTotalCustomers').textContent = filtered.length;
            
            const totalServices = filtered.reduce((total, c) => {
                return total + (c.services ? c.services.length : 1);
            }, 0);
            document.getElementById('reportTotalServices').textContent = totalServices;
            
            const totalIncome = filtered.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
            const pendingAmount = filtered.reduce((sum, c) => sum + (c.remainingAmount || 0), 0);
            
            document.getElementById('reportTotalIncome').textContent = `₹${totalIncome}`;
            document.getElementById('reportPendingAmount').textContent = `₹${pendingAmount}`;
            
            // Render report table
            let html = '';
            if (filtered.length === 0) {
                html = '<tr><td colspan="7" class="text-center py-4">No data found</td></tr>';
            } else {
                filtered.sort((a, b) => new Date(b.workDate) - new Date(a.workDate)).forEach(c => {
                    // Get service names
                    const serviceNames = c.services ? c.services.map(s => s.type).join(', ') : '-';
                    
                    html += `
                        <tr class="border-b">
                            <td class="py-2 px-2">${formatDate(c.workDate)}</td>
                            <td class="py-2 px-2">${c.name || '-'}</td>
                            <td class="py-2 px-2">${serviceNames}</td>
                            <td class="py-2 px-2">
                                <span class="status-badge ${c.status === 'Completed' ? 'status-completed' : 'status-pending'}">
                                    ${c.status || 'Pending'}
                                </span>
                            </td>
                            <td class="py-2 px-2">₹${c.totalAmount || 0}</td>
                            <td class="py-2 px-2">₹${c.paidAmount || 0}</td>
                            <td class="py-2 px-2 font-bold ${c.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}">₹${c.remainingAmount || 0}</td>
                        </tr>
                    `;
                });
            }
            
            document.getElementById('reportTableBody').innerHTML = html;
            document.getElementById('reportResults').classList.remove('hidden');
        }
        
        // Export Financial Report to PDF
        function exportFinancialToPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.setTextColor(102, 126, 234);
            doc.text('Financial Report - Pro CSC Tools', 20, 20);
            
            // Add center info
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(centerInfo.name, 20, 30);
            doc.text(centerInfo.address, 20, 35);
            doc.text(`VLE: ${centerInfo.owner} | ${centerInfo.mobile}`, 20, 40);
            
            // Add date
            const today = new Date().toLocaleDateString();
            doc.text(`Generated on: ${today}`, 20, 50);
            
            // Add summary
            doc.setFontSize(14);
            doc.setTextColor(102, 126, 234);
            doc.text('Monthly Summary', 20, 65);
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            
            const monthlyIncome = document.getElementById('financialMonthlyIncome').textContent;
            const monthlyExpense = document.getElementById('financialMonthlyExpense').textContent;
            const monthlyProfit = document.getElementById('financialMonthlyProfit').textContent;
            const profitMargin = document.getElementById('financialProfitMargin').textContent;
            
            doc.text(`Monthly Income: ${monthlyIncome}`, 20, 75);
            doc.text(`Monthly Expense: ${monthlyExpense}`, 20, 82);
            doc.text(`Monthly Profit: ${monthlyProfit}`, 20, 89);
            doc.text(`Profit Margin: ${profitMargin}`, 20, 96);
            
            // Add expense table
            doc.setFontSize(14);
            doc.setTextColor(102, 126, 234);
            doc.text('Expense History', 20, 111);
            
            // Prepare table data
            const tableColumn = ["Date", "Category", "Description", "Amount"];
            const tableRows = [];
            
            expenses.slice(0, 10).forEach(exp => {
                const expData = [
                    exp.dateStr || formatDate(exp.date),
                    exp.category || 'Other',
                    exp.description || '-',
                    `₹${exp.amount}`
                ];
                tableRows.push(expData);
            });
            
            // Add table
            doc.autoTable({
                startY: 115,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [102, 126, 234] }
            });
            
            // Save PDF
            doc.save(`financial_report_${today.replace(/\//g, '-')}.pdf`);
            showToast('Financial report downloaded!', 'success');
        }
        
        // Export Report to PDF
        function exportReportToPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.setTextColor(102, 126, 234);
            doc.text('Customer Report - Pro CSC Tools', 20, 20);
            
            // Add center info
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(centerInfo.name, 20, 30);
            doc.text(centerInfo.address, 20, 35);
            doc.text(`VLE: ${centerInfo.owner} | ${centerInfo.mobile}`, 20, 40);
            
            // Add date
            const today = new Date().toLocaleDateString();
            doc.text(`Generated on: ${today}`, 20, 50);
            
            // Add summary stats
            doc.setFontSize(14);
            doc.setTextColor(102, 126, 234);
            doc.text('Summary', 20, 65);
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            
            const totalCustomers = document.getElementById('reportTotalCustomers').textContent;
            const totalServices = document.getElementById('reportTotalServices').textContent;
            const totalIncome = document.getElementById('reportTotalIncome').textContent;
            const pendingAmount = document.getElementById('reportPendingAmount').textContent;
            
            doc.text(`Total Customers: ${totalCustomers}`, 20, 75);
            doc.text(`Total Services: ${totalServices}`, 20, 82);
            doc.text(`Total Income: ${totalIncome}`, 20, 89);
            doc.text(`Pending Amount: ${pendingAmount}`, 20, 96);
            
            // Add report table
            doc.setFontSize(14);
            doc.setTextColor(102, 126, 234);
            doc.text('Customer Details', 20, 111);
            
            // Prepare table data
            const tableColumn = ["Date", "Customer", "Services", "Status", "Total"];
            const tableRows = [];
            
            customers.slice(0, 15).forEach(c => {
                const serviceNames = c.services ? c.services.map(s => s.type).join(', ') : '-';
                const cData = [
                    formatDate(c.workDate),
                    c.name || '-',
                    serviceNames,
                    c.status || 'Pending',
                    `₹${c.totalAmount || 0}`
                ];
                tableRows.push(cData);
            });
            
            // Add table
            doc.autoTable({
                startY: 115,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [102, 126, 234] }
            });
            
            // Save PDF
            doc.save(`customer_report_${today.replace(/\//g, '-')}.pdf`);
            showToast('Report downloaded!', 'success');
        }
        
        // Export to Excel
        function exportToExcel() {
            if (customers.length === 0) {
                showToast('No data to export', 'warning');
                return;
            }
            
            const exportData = customers.flatMap(c => {
                if (c.services && c.services.length > 0) {
                    return c.services.map(s => ({
                        'Customer Name': c.name || '',
                        'Mobile': c.mobile || '',
                        'Address': c.address || '',
                        'Service': s.type || '',
                        'Description': s.description || '',
                        'Work Date': c.workDate || '',
                        'Expected Delivery': c.expectedDelivery || '',
                        'Status': c.status || '',
                        'Service Amount': s.amount || 0,
                        'Total Bill': c.totalAmount || 0,
                        'Paid Amount': c.paidAmount || 0,
                        'Due Amount': c.remainingAmount || 0,
                        'Payment Status': c.paymentStatus || ''
                    }));
                } else {
                    return [{
                        'Customer Name': c.name || '',
                        'Mobile': c.mobile || '',
                        'Address': c.address || '',
                        'Service': '-',
                        'Description': '-',
                        'Work Date': c.workDate || '',
                        'Expected Delivery': c.expectedDelivery || '',
                        'Status': c.status || '',
                        'Service Amount': 0,
                        'Total Bill': c.totalAmount || 0,
                        'Paid Amount': c.paidAmount || 0,
                        'Due Amount': c.remainingAmount || 0,
                        'Payment Status': c.paymentStatus || ''
                    }];
                }
            });
            
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Customers');
            XLSX.writeFile(wb, `smart_csc_customers_${new Date().toISOString().split('T')[0]}.xlsx`);
            
            showToast('Excel file downloaded!', 'success');
        }
        
        // Print Invoice
        function printInvoice() {
            if (customers.length === 0) {
                showToast('No data to print', 'warning');
                return;
            }
            
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showToast('Please allow popups', 'error');
                return;
            }
            
            let html = `
                <html>
                <head>
                    <title>${centerInfo.name} - Customer Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #f3f4f6; padding: 10px; text-align: left; }
                        td { padding: 8px; border-bottom: 1px solid #ddd; }
                        h1 { color: #a855f7; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .summary { display: flex; gap: 20px; margin: 20px 0; }
                        .summary-card { background: #f9fafb; padding: 15px; border-radius: 8px; flex: 1; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${centerInfo.name}</h1>
                        <p>${centerInfo.address}</p>
                        <p>VLE: ${centerInfo.owner} | ${centerInfo.mobile}</p>
                        <p>${centerInfo.email}</p>
                        <hr>
                    </div>
                    <h2>CSC Customer Report</h2>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                    
                    <div class="summary">
                        <div class="summary-card">
                            <h3>Total Customers</h3>
                            <p style="font-size: 24px; font-weight: bold;">${customers.length}</p>
                        </div>
                        <div class="summary-card">
                            <h3>Total Revenue</h3>
                            <p style="font-size: 24px; font-weight: bold; color: #10b981;">₹${customers.reduce((sum, c) => sum + (c.paidAmount || 0), 0)}</p>
                        </div>
                        <div class="summary-card">
                            <h3>Pending Amount</h3>
                            <p style="font-size: 24px; font-weight: bold; color: #ef4444;">₹${customers.reduce((sum, c) => sum + (c.remainingAmount || 0), 0)}</p>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Services</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Paid</th>
                                <th>Due</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            customers.slice(0, 50).forEach(c => {
                const serviceNames = c.services ? c.services.map(s => s.type).join(', ') : '-';
                html += `
                    <tr>
                        <td>${c.name || ''}</td>
                        <td>${c.mobile || ''}</td>
                        <td>${serviceNames}</td>
                        <td>${c.status || ''}</td>
                        <td>₹${c.totalAmount || 0}</td>
                        <td>₹${c.paidAmount || 0}</td>
                        <td>₹${c.remainingAmount || 0}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                    <p style="margin-top: 20px; color: #666;">Generated by Pro CSC Tools - www.procsctools.in</p>
                </body>
                </html>
            `;
            
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.print();
        }
        
        // Clear Database
        function clearDatabase() {
            if (confirm('⚠️ Are you sure? This will delete ALL customer data permanently!')) {
                customers = [];
                localStorage.removeItem('smartCscCustomers');
                saveToLocalStorage();
                showToast('Database cleared!', 'warning');
            }
        }
        
        // Clear Form
        function clearForm() {
            if (confirm('Clear all form fields?')) {
                document.getElementById('customerForm').reset();
                setDefaultDates();
                
                // Reset services to just one
                const container = document.getElementById('servicesContainer');
                if (container) {
                    container.innerHTML = '';
                    addServiceRow();
                }
                
                document.getElementById('totalAmount').value = '0';
                document.getElementById('paidAmount').value = '0';
                document.getElementById('remainingAmount').value = '0';
            }
        }
        
        // Format Date
        function formatDate(dateString) {
            if (!dateString) return '-';
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return '-';
                return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch (e) {
                return '-';
            }
        }
        
        // Show Toast Notification
        function showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            if (!container) return;
            
            const toast = document.createElement('div');
            
            const colors = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                warning: 'bg-yellow-500',
                info: 'bg-blue-500'
            };
            
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };
            
            toast.className = `toast ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-slideIn`;
            toast.innerHTML = `
                <i class="fas ${icons[type]} mr-3"></i>
                <span>${message}</span>
            `;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 3000);
        }
        
        // Check for Notifications
        function checkForNotifications() {
            const pending = customers.filter(c => c.status !== 'Completed').length;
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                badge.textContent = pending;
                if (pending > 0) {
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
        
        // Show Notifications
        function showNotifications() {
            const pending = customers.filter(c => c.status !== 'Completed');
            
            if (pending.length === 0) {
                showToast('No pending notifications', 'info');
                return;
            }
            
            let message = `${pending.length} pending works:\n`;
            pending.slice(0, 3).forEach(c => {
                message += `\n• ${c.name || 'Unknown'} - ₹${c.remainingAmount || 0} due`;
            });
            
            if (pending.length > 3) {
                message += `\n\n...and ${pending.length - 3} more`;
            }
            
            alert(message);
        }
        
        // Toggle Dark Mode - Fixed
        function toggleDarkMode() {
            isDarkMode = !isDarkMode;
            const body = document.body;
            const icon = document.getElementById('darkModeIcon');
            const text = document.getElementById('darkModeText');
            
            if (isDarkMode) {
                body.classList.add('dark-mode');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                if (text) text.textContent = 'Light Mode';
                localStorage.setItem('smartCscDarkMode', 'true');
            } else {
                body.classList.remove('dark-mode');
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                if (text) text.textContent = 'Dark Mode';
                localStorage.setItem('smartCscDarkMode', 'false');
            }
        }
        
        // Toggle Mobile Search
        function toggleMobileSearch() {
            const mobileSearch = document.getElementById('mobileSearch');
            if (mobileSearch) {
                mobileSearch.classList.toggle('hidden');
            }
        }
        
        // Show Section
        function showSection(section) {
            // Hide all sections
            document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
            
            // Show selected section
            const selectedSection = document.getElementById(section + 'Section');
            if (selectedSection) {
                selectedSection.classList.remove('hidden');
            }
            
            // Update page title
            const titles = {
                dashboard: 'Dashboard',
                financial: 'Financial Management',
                customers: 'Add Customer',
                workmanager: 'Work Manager',
                pending: 'Pending Work',
                services: 'Services',
                center: 'Center Info',
                reports: 'Reports',
                history: 'Customer History'
            };
            
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = titles[section] || 'Dashboard';
            }
            
            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('bg-purple-700');
                if (item.dataset && item.dataset.section === section) {
                    item.classList.add('bg-purple-700');
                }
            });
            
            // Refresh data if needed
            if (section === 'dashboard') {
                updateDashboard();
                setTimeout(() => initializeAllCharts(), 100);
            } else if (section === 'financial') {
                updateFinancialSummary();
                renderExpenseHistory();
                setTimeout(() => {
                    initializeMonthlyComparisonChart();
                    initializeProfitDistributionChart();
                }, 100);
            } else if (section === 'workmanager') {
                renderWorkManager();
                initializeServiceDropdowns();
            } else if (section === 'pending') {
                renderPendingWork();
            } else if (section === 'history') {
                updateCustomerSelect();
            } else if (section === 'services') {
                renderCategories();
            } else if (section === 'center') {
                loadCenterInfo();
            }
        }
        
        // Click outside modal to close
        window.onclick = function(event) {
            const editModal = document.getElementById('editModal');
            const slipModal = document.getElementById('slipModal');
            const addServiceModal = document.getElementById('addServiceModal');
            
            if (event.target === editModal) {
                closeEditModal();
            }
            if (event.target === slipModal) {
                closeSlipModal();
            }
            if (event.target === addServiceModal) {
                closeAddServiceModal();
            }
        };
    