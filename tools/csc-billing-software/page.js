// ==================== STATE MANAGEMENT ====================

let appState = {
    centerProfile: {
        logo: null,
        qrCode: null,
        centerName: '',
        vleName: '',
        cscId: '',
        mobile: '',
        email: '',
        address: ''
    },
    services: [],
    customers: [],
    bills: [],
    categories: ['Government', 'Banking', 'Insurance', 'Recharge', 'Other'],
    lastBillNumber: 0,
    darkMode: false,
    invoiceSettings: {
        primaryColor: '#ab183d',
        showBorder: true,
        borderWidth: '2px',
        borderRadius: '12px',
        headerBg: '#f8fafc',
        fontSize: '14px',
        templateId: 1
    },
    googleSheet: {
        webAppUrl: '',
        autoSync: false,
        isConnected: false
    }
};

let currentBill = {
    items: [],
    customerName: '',
    customerMobile: '',
    discount: 0,
    gst: 0,
    paymentMode: 'Cash',
    subtotal: 0,
    total: 0
};

let lastGeneratedBill = null;

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    initializeDefaultData();
    setupEventListeners();
    updateDashboard();
    renderServices();
    renderCustomers();
    renderBillsHistory();
    updateBillPreview();
    updateStats();
    applyTheme();
    applyInvoiceSettings();
    populateSettingsForm();
    updateSheetBadge();
});

function loadFromLocalStorage() {
    try {
        const savedProfile = localStorage.getItem('smartCscCenterProfile');
        if (savedProfile) {
            appState.centerProfile = JSON.parse(savedProfile);
            populateCenterProfile();
            populateQRCode();
        }

        const savedServices = localStorage.getItem('smartCscServices');
        if (savedServices) {
            appState.services = JSON.parse(savedServices);
        }

        const savedCustomers = localStorage.getItem('smartCscCustomers');
        if (savedCustomers) {
            appState.customers = JSON.parse(savedCustomers);
        }

        const savedBills = localStorage.getItem('smartCscBills');
        if (savedBills) {
            appState.bills = JSON.parse(savedBills);
            if (appState.bills.length > 0) {
                const lastBill = appState.bills[appState.bills.length - 1];
                const billNum = parseInt(lastBill.billNumber.split('-')[1]);
                appState.lastBillNumber = billNum || 0;
            }
        }

        const savedSettings = localStorage.getItem('smartCscInvoiceSettings');
        if (savedSettings) {
            appState.invoiceSettings = JSON.parse(savedSettings);
        }

        const savedDarkMode = localStorage.getItem('smartCscDarkMode');
        if (savedDarkMode) {
            appState.darkMode = savedDarkMode === 'true';
        }

        const savedSheetConfig = localStorage.getItem('smartCscGoogleSheet');
        if (savedSheetConfig) {
            appState.googleSheet = JSON.parse(savedSheetConfig);
            const urlInput = document.getElementById('googleSheetUrl');
            const autoSyncCheckbox = document.getElementById('autoSyncSheets');
            if (urlInput) urlInput.value = appState.googleSheet.webAppUrl || '';
            if (autoSyncCheckbox) autoSyncCheckbox.checked = !!appState.googleSheet.autoSync;
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data', 'error');
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('smartCscCenterProfile', JSON.stringify(appState.centerProfile));
        localStorage.setItem('smartCscServices', JSON.stringify(appState.services));
        localStorage.setItem('smartCscCustomers', JSON.stringify(appState.customers));
        localStorage.setItem('smartCscBills', JSON.stringify(appState.bills));
        localStorage.setItem('smartCscDarkMode', appState.darkMode);
        localStorage.setItem('smartCscInvoiceSettings', JSON.stringify(appState.invoiceSettings));
        localStorage.setItem('smartCscGoogleSheet', JSON.stringify(appState.googleSheet));
    } catch (error) {
        console.error('Error saving data:', error);
        showToast('Error saving data', 'error');
    }
}

function initializeDefaultData() {
    if (appState.services.length === 0) {
        const defaultServices = [
            { id: '1', name: 'PAN Card Apply', category: 'Government', price: 50 },
            { id: '2', name: 'Aadhaar Update', category: 'Government', price: 30 },
            { id: '3', name: 'Voter ID Apply', category: 'Government', price: 40 },
            { id: '4', name: 'Ayushman Card', category: 'Government', price: 60 },
            { id: '5', name: 'Electricity Bill', category: 'Recharge', price: 20 },
            { id: '6', name: 'Bank CSP Withdrawal', category: 'Banking', price: 10 },
            { id: '7', name: 'Insurance Premium', category: 'Insurance', price: 100 },
            { id: '8', name: 'Mobile Recharge', category: 'Recharge', price: 10 },
            { id: '9', name: 'DTH Recharge', category: 'Recharge', price: 10 },
            { id: '10', name: 'Passport Service', category: 'Government', price: 150 }
        ];

        defaultServices.forEach(service => {
            appState.services.push({
                id: Date.now() + Math.random().toString(),
                ...service
            });
        });
    }
    saveToLocalStorage();
}

function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    document.getElementById('serviceSearch')?.addEventListener('input', function() {
        renderServices(this.value);
    });

    document.getElementById('customerSearch')?.addEventListener('input', function() {
        renderCustomers(this.value);
    });

    document.getElementById('historySearch')?.addEventListener('input', function() {
        renderBillsHistory(this.value);
    });

    document.getElementById('billServiceSelect')?.addEventListener('change', function() {
        const selected = this.options[this.selectedIndex];
        if (selected && selected.value) {
            const price = selected.dataset.price;
            document.getElementById('billCustomPrice').value = price;
        }
    });
}

// ==================== QR CODE FUNCTIONS ====================

function handleQRUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            showToast('QR code size should be less than 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const qrPreview = document.getElementById('qrPreview');
            const qrPlaceholder = document.getElementById('qrPlaceholder');

            qrPreview.src = e.target.result;
            qrPreview.classList.remove('hidden');
            qrPlaceholder.classList.add('hidden');

            appState.centerProfile.qrCode = e.target.result;
            saveToLocalStorage();
            updateBillPreview();
            showToast('QR code uploaded successfully! It will appear on all bills.', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function populateQRCode() {
    const qrCode = appState.centerProfile.qrCode;
    if (qrCode) {
        const qrPreview = document.getElementById('qrPreview');
        const qrPlaceholder = document.getElementById('qrPlaceholder');

        qrPreview.src = qrCode;
        qrPreview.classList.remove('hidden');
        qrPlaceholder.classList.add('hidden');
    }
}

// ==================== THEME FUNCTIONS ====================

function toggleDarkMode() {
    appState.darkMode = !appState.darkMode;
    applyTheme();
    saveToLocalStorage();
    showToast(`Dark mode ${appState.darkMode ? 'enabled' : 'disabled'}`, 'success');
}

function applyTheme() {
    if (appState.darkMode) {
        document.body.classList.add('dark-mode');
        document.querySelectorAll('.card').forEach(card => card.classList.add('dark-mode'));
    } else {
        document.body.classList.remove('dark-mode');
        document.querySelectorAll('.card').forEach(card => card.classList.remove('dark-mode'));
    }
}

// ==================== TAB FUNCTIONS ====================

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabName + '-tab').classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('tab-active', 'bg-[#fbe9ee]');
    });

    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => btn.dataset.tab === tabName);
    if (activeBtn) {
        activeBtn.classList.add('tab-active', 'bg-[#fbe9ee]');
    }

    if (tabName === 'dashboard') updateStats();
    if (tabName === 'services') renderServices();
    if (tabName === 'customers') renderCustomers();
    if (tabName === 'history') renderBillsHistory();
    if (tabName === 'billing') {
        populateServiceSelect();
        updateBillPreview();
    }
    if (tabName === 'reports') generateReport();
    if (tabName === 'settings') populateSettingsForm();
    if (tabName === 'data') updateSheetBadge();
}

// ==================== CENTER PROFILE FUNCTIONS ====================

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            showToast('Logo size should be less than 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const logoPreview = document.getElementById('logoPreview');
            const logoPlaceholder = document.getElementById('logoPlaceholder');

            logoPreview.src = e.target.result;
            logoPreview.classList.remove('hidden');
            logoPlaceholder.classList.add('hidden');

            appState.centerProfile.logo = e.target.result;
            saveToLocalStorage();
            updateBillPreview();
            showToast('Logo uploaded successfully', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function populateCenterProfile() {
    const profile = appState.centerProfile;

    document.getElementById('centerName').value = profile.centerName || '';
    document.getElementById('vleName').value = profile.vleName || '';
    document.getElementById('cscId').value = profile.cscId || '';
    document.getElementById('centerMobile').value = profile.mobile || '';
    document.getElementById('centerEmail').value = profile.email || '';
    document.getElementById('centerAddress').value = profile.address || '';

    if (profile.logo) {
        const logoPreview = document.getElementById('logoPreview');
        const logoPlaceholder = document.getElementById('logoPlaceholder');
        logoPreview.src = profile.logo;
        logoPreview.classList.remove('hidden');
        logoPlaceholder.classList.add('hidden');
    }
}

function saveCenterProfile() {
    const centerName = document.getElementById('centerName').value;
    const vleName = document.getElementById('vleName').value;
    const cscId = document.getElementById('cscId').value;
    const mobile = document.getElementById('centerMobile').value;
    const address = document.getElementById('centerAddress').value;

    if (!centerName || !vleName || !cscId || !mobile || !address) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    if (mobile.length !== 10) {
        showToast('Please enter valid 10-digit mobile number', 'error');
        return;
    }

    appState.centerProfile = {
        ...appState.centerProfile,
        centerName,
        vleName,
        cscId,
        mobile,
        email: document.getElementById('centerEmail').value,
        address
    };

    saveToLocalStorage();
    updateBillPreview();
    showToast('Center profile saved successfully!', 'success');
}

// ==================== SERVICE FUNCTIONS ====================

function openServiceModal(editId = null) {
    if (editId) {
        const service = appState.services.find(s => s.id === editId);
        if (service) {
            document.getElementById('serviceModalTitle').textContent = 'Edit Service';
            document.getElementById('modalServiceName').value = service.name;
            document.getElementById('modalServiceCategory').value = service.category;
            document.getElementById('modalServicePrice').value = service.price;
            document.getElementById('editingServiceId').value = service.id;
        }
    } else {
        document.getElementById('serviceModalTitle').textContent = 'Add Service';
        document.getElementById('modalServiceName').value = '';
        document.getElementById('modalServiceCategory').value = 'Government';
        document.getElementById('modalServicePrice').value = '';
        document.getElementById('editingServiceId').value = '';
    }
    document.getElementById('serviceModal').classList.remove('hidden');
}

function closeServiceModal() {
    document.getElementById('serviceModal').classList.add('hidden');
}

function saveService() {
    const name = document.getElementById('modalServiceName').value;
    const category = document.getElementById('modalServiceCategory').value;
    const price = document.getElementById('modalServicePrice').value;
    const editId = document.getElementById('editingServiceId').value;

    if (!name || !price) {
        showToast('Please fill all fields', 'error');
        return;
    }

    if (editId) {
        const index = appState.services.findIndex(s => s.id === editId);
        if (index !== -1) {
            appState.services[index] = {
                ...appState.services[index],
                name,
                category,
                price: parseFloat(price)
            };
            showToast('Service updated successfully', 'success');
        }
    } else {
        const newService = {
            id: Date.now().toString() + Math.random(),
            name,
            category,
            price: parseFloat(price)
        };
        appState.services.push(newService);
        showToast('Service added successfully', 'success');
    }

    saveToLocalStorage();
    renderServices();
    populateServiceSelect();
    closeServiceModal();
}

function deleteService(id) {
    if (confirm('Are you sure you want to delete this service?')) {
        appState.services = appState.services.filter(s => s.id !== id);
        saveToLocalStorage();
        renderServices();
        populateServiceSelect();
        showToast('Service deleted successfully', 'success');
    }
}

let currentCategory = 'all';

function filterServicesByCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('bg-[#ab183d]', 'text-white');
        btn.classList.add('border');
    });
    event.target.classList.add('bg-[#ab183d]', 'text-white');
    event.target.classList.remove('border');
    renderServices(document.getElementById('serviceSearch').value);
}

function renderServices(searchTerm = '') {
    const servicesList = document.getElementById('servicesList');
    let filteredServices = appState.services;

    if (currentCategory !== 'all') {
        filteredServices = filteredServices.filter(s => s.category === currentCategory);
    }
    if (searchTerm) {
        filteredServices = filteredServices.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filteredServices.length === 0) {
        servicesList.innerHTML = '<p class="text-gray-500 text-center col-span-3 py-8">No services found</p>';
        return;
    }

    servicesList.innerHTML = filteredServices.map(service => `
        <div class="border rounded-lg p-4 card-hover">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-semibold">${service.name}</h4>
                    <p class="text-sm text-gray-500">${service.category}</p>
                    <p class="text-[#ab183d] font-bold mt-2">₹${service.price}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="openServiceModal('${service.id}')" class="text-[#ab183d] hover:text-[#8a0f2f] p-2"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteService('${service.id}')" class="text-red-600 hover:text-red-800 p-2"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function populateServiceSelect() {
    const select = document.getElementById('billServiceSelect');
    select.innerHTML = '<option value="">Select Service</option>' +
        appState.services.map(s => `<option value="${s.id}" data-price="${s.price}">${s.name} - ₹${s.price}</option>`).join('');
}

// ==================== CUSTOMER FUNCTIONS ====================

function searchCustomerByMobile() {
    const mobile = document.getElementById('billMobile').value;
    if (mobile.length === 10) {
        const customer = appState.customers.find(c => c.mobile === mobile);
        if (customer) {
            document.getElementById('newCustomerName').value = customer.name;
            document.getElementById('customerInfo').classList.remove('hidden');
            document.getElementById('selectedCustomerName').textContent = customer.name;
            document.getElementById('selectedCustomerMobile').textContent = customer.mobile;

            currentBill.customerName = customer.name;
            currentBill.customerMobile = customer.mobile;

            document.getElementById('newCustomerForm').classList.add('hidden');
            showToast('Customer loaded', 'success');
        } else {
            document.getElementById('customerInfo').classList.add('hidden');
            document.getElementById('newCustomerForm').classList.remove('hidden');
            currentBill.customerName = '';
            currentBill.customerMobile = mobile;
        }
    }
}

function saveCustomer(name, mobile) {
    if (!name || !mobile) return;
    const existing = appState.customers.find(c => c.mobile === mobile);
    if (!existing) {
        appState.customers.push({
            id: Date.now().toString(),
            name,
            mobile,
            createdAt: new Date().toISOString()
        });
        saveToLocalStorage();
        renderCustomers();
    }
}

function renderCustomers(searchTerm = '') {
    const customersList = document.getElementById('customersList');
    let filteredCustomers = appState.customers;
    if (searchTerm) {
        filteredCustomers = appState.customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.mobile.includes(searchTerm));
    }

    if (filteredCustomers.length === 0) {
        customersList.innerHTML = '<p class="text-gray-500 text-center py-8">No customers found</p>';
        return;
    }

    customersList.innerHTML = filteredCustomers.map(customer => `
        <div class="border rounded-lg p-4 flex justify-between items-center">
            <div>
                <p class="font-semibold">${customer.name}</p>
                <p class="text-sm text-gray-500">${customer.mobile}</p>
            </div>
            <button onclick="useCustomer('${customer.mobile}')" class="bg-[#ab183d] text-white px-4 py-2 rounded-lg text-sm">Use for Bill</button>
        </div>
    `).join('');
}

function useCustomer(mobile) {
    switchTab('billing');
    document.getElementById('billMobile').value = mobile;
    searchCustomerByMobile();
}

// ==================== NEW BILL FUNCTION ====================

function newBill() {
    currentBill = {
        items: [],
        customerName: '',
        customerMobile: '',
        discount: 0,
        gst: 0,
        paymentMode: 'Cash',
        subtotal: 0,
        total: 0
    };

    document.getElementById('billMobile').value = '';
    document.getElementById('newCustomerName').value = '';
    document.getElementById('billDiscount').value = 0;
    document.getElementById('billGst').value = 0;
    document.getElementById('billPaymentMode').value = 'Cash';
    document.getElementById('billQuantity').value = 1;
    document.getElementById('billCustomPrice').value = '';
    document.getElementById('customerInfo').classList.add('hidden');
    document.getElementById('newCustomerForm').classList.remove('hidden');

    document.getElementById('previewBillNo').textContent = 'Bill No: CSC-0001';
    updateBillPreview();
    switchTab('billing');
    showToast('New bill started', 'success');
}

// ==================== BILLING FUNCTIONS ====================

function addServiceToBill() {
    const select = document.getElementById('billServiceSelect');
    const quantity = parseInt(document.getElementById('billQuantity').value) || 1;
    const customPrice = parseFloat(document.getElementById('billCustomPrice').value);

    if (!select.value) {
        showToast('Please select a service', 'error');
        return;
    }

    const selectedOption = select.options[select.selectedIndex];
    const serviceId = select.value;
    const service = appState.services.find(s => s.id === serviceId);

    if (service) {
        const price = customPrice || service.price;
        const total = price * quantity;

        currentBill.items.push({
            id: Date.now().toString() + Math.random(),
            name: service.name,
            price: price,
            quantity: quantity,
            total: total
        });

        showToast('Service added to bill', 'success');
        updateBillTotals();

        document.getElementById('billQuantity').value = 1;
        document.getElementById('billCustomPrice').value = '';
    }
}

function removeBillItem(itemId) {
    currentBill.items = currentBill.items.filter(item => item.id !== itemId);
    updateBillTotals();
}

function updateBillTotals() {
    const subtotal = currentBill.items.reduce((sum, item) => sum + item.total, 0);
    currentBill.subtotal = subtotal;

    const discountPercent = parseFloat(document.getElementById('billDiscount').value) || 0;
    const gstPercent = parseFloat(document.getElementById('billGst').value) || 0;
    const paymentMode = document.getElementById('billPaymentMode').value;

    currentBill.discount = discountPercent;
    currentBill.gst = gstPercent;
    currentBill.paymentMode = paymentMode;

    const discountAmount = (subtotal * discountPercent) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * gstPercent) / 100;
    currentBill.total = afterDiscount + gstAmount;

    updateBillPreview();
}

function updateBillPreview() {
    const profile = appState.centerProfile;
    const settings = appState.invoiceSettings;

    document.documentElement.style.setProperty('--invoice-primary', settings.primaryColor);
    document.documentElement.style.setProperty('--invoice-border', settings.showBorder ? `${settings.borderWidth} solid ${settings.primaryColor}` : 'none');
    document.documentElement.style.setProperty('--invoice-border-radius', settings.borderRadius);
    document.documentElement.style.setProperty('--invoice-header-bg', settings.headerBg);
    document.documentElement.style.setProperty('--invoice-font-size', settings.fontSize);

    document.getElementById('billPreview').innerHTML = generateBillPreviewHTML(profile, currentBill);
}

function generateBillPreviewHTML(profile, bill) {
    const settings = appState.invoiceSettings;
    let itemsRows = '';
    if (bill.items.length === 0) {
        itemsRows = '<tr><td colspan="5" class="text-center p-4">No services added</td></tr>';
    } else {
        itemsRows = bill.items.map(item => `
            <tr class="border-b">
                <td class="p-2">${item.name}</td>
                <td class="p-2 text-right">${item.quantity}</td>
                <td class="p-2 text-right">₹${item.price}</td>
                <td class="p-2 text-right">₹${item.total}</td>
                <td class="p-2 text-right no-print">
                    <button onclick="removeBillItem('${item.id}')" class="text-red-600 hover:text-red-800"><i class="fas fa-times"></i></button>
                </td>
            </tr>
        `).join('');
    }

    const subtotal = bill.subtotal || 0;
    const discountAmount = (subtotal * (bill.discount || 0)) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * (bill.gst || 0)) / 100;
    const grandTotal = bill.total || 0;
    const today = new Date().toLocaleDateString();

    return `
        <div style="border: ${settings.showBorder ? settings.borderWidth + ' solid ' + settings.primaryColor : 'none'}; border-radius: ${settings.borderRadius}; padding: 15px;">
            <div class="print-header" style="border-bottom-color: ${settings.primaryColor};">
                ${profile.logo ? `<img src="${profile.logo}" style="width: 60px; height: 60px; margin: 0 auto 10px; border-radius: 8px;">` : ''}
                <h1 style="color: ${settings.primaryColor};">${profile.centerName || 'CSC Center'}</h1>
                <p style="color: #4b5563;">${profile.address || ''}</p>
                <p style="color: #4b5563;">CSC ID: ${profile.cscId || ''} | VLE: ${profile.vleName || ''}</p>
                <p style="color: #4b5563;">Mobile: ${profile.mobile || ''}</p>
            </div>
            <div class="print-details" style="background: ${settings.headerBg};">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <p><strong>Bill No:</strong> <span id="previewBillNo">CSC-${String(appState.lastBillNumber + 1).padStart(4, '0')}</span></p>
                        <p><strong>Date:</strong> ${today}</p>
                    </div>
                    <div>
                        <p><strong>Customer:</strong> <span id="previewCustomerName">${bill.customerName || '-'}</span></p>
                        <p><strong>Mobile:</strong> <span id="previewCustomerMobile">${bill.customerMobile || '-'}</span></p>
                    </div>
                </div>
            </div>
            <table class="print-table" style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <thead>
                    <tr style="background: ${settings.primaryColor}; color: white;">
                        <th style="padding: 8px; text-align: left;">Service</th>
                        <th style="padding: 8px; text-align: right;">Qty</th>
                        <th style="padding: 8px; text-align: right;">Price</th>
                        <th style="padding: 8px; text-align: right;">Total</th>
                        <th class="no-print" style="padding: 8px; text-align: right;">Action</th>
                    </tr>
                </thead>
                <tbody>${itemsRows}</tbody>
            </table>
            <div class="print-total" style="border-top-color: ${settings.primaryColor};">
                <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
                <p>Discount (${bill.discount}%): -₹${discountAmount.toFixed(2)}</p>
                <p>GST (${bill.gst}%): +₹${gstAmount.toFixed(2)}</p>
                <p style="font-size: 18px; color: ${settings.primaryColor};">Grand Total: ₹${grandTotal.toFixed(2)}</p>
                <p style="font-size: 14px; color: #4b5563;">Payment Mode: ${bill.paymentMode}</p>
            </div>
            <div class="print-footer">
                <div class="qr-section">
                    ${profile.qrCode ? `
                        <img src="${profile.qrCode}" style="width: 70px; height: 70px; border: 1px solid #e2e8f0; border-radius: 8px;" alt="Scan to Pay">
                        <div class="qr-text"><p><strong>Scan to Pay</strong></p><p>UPI / QR Code</p></div>
                    ` : ''}
                </div>
                <div class="text-right">
                    <p>This is a computer generated invoice.</p>
                    <p>CSC ID: ${profile.cscId || ''} | VLE: ${profile.vleName || ''}</p>
                </div>
            </div>
        </div>
    `;
}

// ==================== GENERATE BILL ====================

function generateBill() {
    const customerName = document.getElementById('newCustomerName').value || currentBill.customerName;
    const customerMobile = document.getElementById('billMobile').value;

    if (!customerName) {
        showToast('Please enter customer name', 'error');
        return;
    }

    if (currentBill.items.length === 0) {
        showToast('Please add at least one service', 'error');
        return;
    }

    if (customerMobile && customerMobile.length === 10) {
        saveCustomer(customerName, customerMobile);
    }

    appState.lastBillNumber++;
    const billNumber = 'CSC-' + String(appState.lastBillNumber).padStart(4, '0');

    const newBill = {
        id: Date.now().toString(),
        billNumber: billNumber,
        date: new Date().toISOString(),
        customerName: customerName,
        customerMobile: customerMobile || '',
        items: [...currentBill.items],
        discount: currentBill.discount || 0,
        gst: currentBill.gst || 0,
        subtotal: currentBill.subtotal,
        total: currentBill.total,
        paymentMode: currentBill.paymentMode || 'Cash',
        centerProfile: { ...appState.centerProfile },
        createdAt: new Date().toISOString()
    };

    appState.bills.push(newBill);
    saveToLocalStorage();

    if (appState.googleSheet && appState.googleSheet.autoSync && appState.googleSheet.webAppUrl) {
        sendBillToGoogleSheet(newBill);
    }

    lastGeneratedBill = newBill;
    showToast(`Bill generated: ${billNumber}`, 'success');

    openPrintLayout(newBill);
    resetBill();
    renderBillsHistory();
    updateStats();
}

function resetBill() {
    currentBill = {
        items: [],
        customerName: '',
        customerMobile: '',
        discount: 0,
        gst: 0,
        paymentMode: 'Cash',
        subtotal: 0,
        total: 0
    };

    document.getElementById('billMobile').value = '';
    document.getElementById('newCustomerName').value = '';
    document.getElementById('billDiscount').value = 0;
    document.getElementById('billGst').value = 0;
    document.getElementById('billPaymentMode').value = 'Cash';
    document.getElementById('billQuantity').value = 1;
    document.getElementById('billCustomPrice').value = '';
    document.getElementById('customerInfo').classList.add('hidden');
    document.getElementById('newCustomerForm').classList.remove('hidden');

    updateBillPreview();
}

// ==================== PRINT LAYOUT FUNCTIONS ====================

function openPrintLayout(bill) {
    const container = document.getElementById('printBillContainer');
    container.innerHTML = generatePrintBillHTML(bill);
    document.getElementById('printLayoutModal').classList.remove('hidden');
}

function closePrintModal() {
    document.getElementById('printLayoutModal').classList.add('hidden');
}

function generatePrintBillHTML(bill) {
    const profile = bill.centerProfile;
    const settings = appState.invoiceSettings;
    const itemsRows = bill.items.map(item => `
        <tr>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">${item.name}</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right;">${item.quantity}</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right;">₹${item.price}</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right;">₹${item.total}</td>
        </tr>
    `).join('');

    const discountAmount = (bill.subtotal * (bill.discount || 0)) / 100;
    const afterDiscount = bill.subtotal - discountAmount;
    const gstAmount = (afterDiscount * (bill.gst || 0)) / 100;

    return `
        <div style="border: ${settings.showBorder ? settings.borderWidth + ' solid ' + settings.primaryColor : 'none'}; border-radius: ${settings.borderRadius}; padding: 15px; background: white;">
            <div class="print-header" style="border-bottom-color: ${settings.primaryColor}; margin-bottom: 15px;">
                ${profile.logo ? `<img src="${profile.logo}" style="width: 60px; height: 60px; margin: 0 auto 10px; border-radius: 8px;">` : ''}
                <h1 style="color: ${settings.primaryColor}; font-size: 24px; margin-bottom: 5px;">${profile.centerName || 'CSC Center'}</h1>
                <p style="color: #4b5563; margin: 2px 0;">${profile.address || ''}</p>
                <p style="color: #4b5563; margin: 2px 0;">CSC ID: ${profile.cscId || ''} | VLE: ${profile.vleName || ''}</p>
                <p style="color: #4b5563; margin: 2px 0;">Mobile: ${profile.mobile || ''}</p>
            </div>
            <div class="print-details" style="background: ${settings.headerBg}; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <p style="margin: 2px 0;"><strong>Bill No:</strong> ${bill.billNumber}</p>
                        <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p style="margin: 2px 0;"><strong>Customer:</strong> ${bill.customerName}</p>
                        <p style="margin: 2px 0;"><strong>Mobile:</strong> ${bill.customerMobile || 'N/A'}</p>
                    </div>
                </div>
            </div>
            <table class="print-table" style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <thead>
                    <tr style="background: ${settings.primaryColor}; color: white;">
                        <th style="padding: 8px; text-align: left; font-size: 13px;">Service</th>
                        <th style="padding: 8px; text-align: right; font-size: 13px;">Qty</th>
                        <th style="padding: 8px; text-align: right; font-size: 13px;">Price</th>
                        <th style="padding: 8px; text-align: right; font-size: 13px;">Total</th>
                    </tr>
                </thead>
                <tbody>${itemsRows}</tbody>
            </table>
            <div class="print-total" style="border-top-color: ${settings.primaryColor}; margin-top: 15px; padding-top: 10px;">
                <p style="margin: 2px 0;">Subtotal: ₹${bill.subtotal.toFixed(2)}</p>
                <p style="margin: 2px 0;">Discount (${bill.discount}%): -₹${discountAmount.toFixed(2)}</p>
                <p style="margin: 2px 0;">GST (${bill.gst}%): +₹${gstAmount.toFixed(2)}</p>
                <p style="font-size: 18px; color: ${settings.primaryColor}; margin: 5px 0;">Grand Total: ₹${bill.total.toFixed(2)}</p>
                <p style="font-size: 14px; color: #4b5563; margin: 2px 0;">Payment Mode: ${bill.paymentMode}</p>
            </div>
            <div class="print-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${profile.qrCode ? `
                        <img src="${profile.qrCode}" style="width: 70px; height: 70px; border: 1px solid #e2e8f0; border-radius: 8px;" alt="Scan to Pay">
                        <div style="font-size: 9px; line-height: 1.2;"><p><strong>Scan to Pay</strong></p><p>UPI / QR Code</p></div>
                    ` : ''}
                </div>
                <div style="text-align: right; font-size: 9px;">
                    <p style="margin: 2px 0;">This is a computer generated invoice.</p>
                    <p style="margin: 2px 0;">CSC ID: ${profile.cscId || ''} | VLE: ${profile.vleName || ''}</p>
                    <p style="margin: 2px 0;">Generated by Pro CSC Tools</p>
                </div>
            </div>
        </div>
    `;
}

function printFromModal() {
    const printContent = document.getElementById('printBillContainer').innerHTML;
    const settings = appState.invoiceSettings;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Bill - ${lastGeneratedBill?.billNumber || 'CSC Bill'}</title>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; padding: 10px; background: white; margin: 0; }
                .print-header { text-align: center; margin-bottom: 15px; border-bottom: 2px dashed ${settings.primaryColor}; padding-bottom: 10px; }
                .print-header h1 { color: ${settings.primaryColor}; font-size: 24px; margin-bottom: 5px; }
                .print-details { background: ${settings.headerBg}; padding: 10px; border-radius: 8px; margin-bottom: 15px; }
                .print-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .print-table th { background: ${settings.primaryColor}; color: white; padding: 8px; }
                .print-table td { padding: 6px 8px; border: 1px solid #e2e8f0; }
                .print-total { text-align: right; font-size: 16px; font-weight: bold; color: ${settings.primaryColor}; margin-top: 15px; padding-top: 10px; border-top: 2px dashed ${settings.primaryColor}; }
                .print-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #64748b; }
            </style>
        </head>
        <body>
            <div style="max-width: 800px; margin: 0 auto;">${printContent}</div>
            <script>window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 500); }</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function downloadPDFFromModal() {
    const element = document.getElementById('printBillContainer');
    const billNumber = lastGeneratedBill?.billNumber || 'CSC-Bill';
    const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `bill_${billNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1.5, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
    showToast('PDF downloaded successfully!', 'success');
}

function shareWhatsAppFromModal() {
    const billNumber = lastGeneratedBill?.billNumber || 'CSC-Bill';
    const customerName = lastGeneratedBill?.customerName || 'Customer';
    const total = lastGeneratedBill?.total || 0;
    const text = `*Pro CSC Tools - Bill*\n\nBill No: ${billNumber}\nCustomer: ${customerName}\nTotal: ₹${total}\nPayment: ${lastGeneratedBill?.paymentMode || 'Cash'}\n\nVisit: https://procsctools.in`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyBillFromModal() {
    const billContent = document.getElementById('printBillContainer').innerText;
    navigator.clipboard.writeText(billContent).then(() => {
        showToast('Bill copied to clipboard', 'success');
    });
}

function newBillFromModal() {
    closePrintModal();
    newBill();
}

function printBillFromPreview() {
    if (currentBill.items.length === 0) {
        showToast('No items in bill', 'error');
        return;
    }
    const tempBill = {
        billNumber: 'CSC-' + String(appState.lastBillNumber + 1).padStart(4, '0'),
        date: new Date().toISOString(),
        customerName: document.getElementById('newCustomerName').value || currentBill.customerName || 'Customer',
        customerMobile: document.getElementById('billMobile').value || '',
        items: currentBill.items,
        discount: currentBill.discount || 0,
        gst: currentBill.gst || 0,
        subtotal: currentBill.subtotal,
        total: currentBill.total,
        paymentMode: currentBill.paymentMode || 'Cash',
        centerProfile: appState.centerProfile
    };
    lastGeneratedBill = tempBill;
    openPrintLayout(tempBill);
}

function downloadPDFFromPreview() {
    printBillFromPreview();
    setTimeout(() => { downloadPDFFromModal(); }, 500);
}

function copyBillFromPreview() {
    if (currentBill.items.length === 0) {
        showToast('No items in bill', 'error');
        return;
    }
    const billContent = document.getElementById('billPreview').innerText;
    navigator.clipboard.writeText(billContent).then(() => {
        showToast('Bill copied to clipboard', 'success');
    });
}

function shareWhatsAppFromPreview() {
    if (currentBill.items.length === 0) {
        showToast('No items in bill', 'error');
        return;
    }
    const customerName = document.getElementById('newCustomerName').value || currentBill.customerName || 'Customer';
    const total = currentBill.total || 0;
    const text = `*Pro CSC Tools - Bill*\n\nCustomer: ${customerName}\nTotal: ₹${total}\nPayment: ${currentBill.paymentMode}\n\nVisit: https://procsctools.in`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

// ==================== BILL HISTORY FUNCTIONS ====================

function renderBillsHistory(searchTerm = '') {
    const historyDiv = document.getElementById('billsHistoryList');
    if (appState.bills.length === 0) {
        historyDiv.innerHTML = '<p class="text-gray-500 text-center py-8">No bills generated yet</p>';
        return;
    }

    let filteredBills = appState.bills;
    if (searchTerm) {
        filteredBills = appState.bills.filter(bill =>
            bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bill.customerMobile && bill.customerMobile.includes(searchTerm))
        );
    }

    filteredBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    historyDiv.innerHTML = filteredBills.map(bill => `
        <div class="border rounded-lg p-4 card-hover">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="bg-[#f7d5de] text-[#8a0f2f] px-3 py-1 rounded-full text-sm font-semibold">${bill.billNumber}</span>
                        <span class="text-gray-500 text-sm">${new Date(bill.date).toLocaleDateString()}</span>
                    </div>
                    <h4 class="font-semibold">${bill.customerName}</h4>
                    <p class="text-sm text-gray-500">${bill.items.length} items | ${bill.paymentMode}</p>
                </div>
                <div class="mt-3 md:mt-0 flex items-center gap-3">
                    <p class="text-xl font-bold" style="color: ${appState.invoiceSettings.primaryColor};">₹${bill.total}</p>
                    <button onclick="viewBill('${bill.id}')" class="text-[#ab183d] hover:text-[#8a0f2f] p-2" title="View"><i class="fas fa-eye"></i></button>
                    <button onclick="printBillFromHistory('${bill.id}')" class="text-green-600 hover:text-green-800 p-2" title="Print"><i class="fas fa-print"></i></button>
                    <button onclick="deleteBill('${bill.id}')" class="text-red-600 hover:text-red-800 p-2" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewBill(billId) {
    const bill = appState.bills.find(b => b.id === billId);
    if (bill) {
        currentBill = {
            items: [...bill.items],
            customerName: bill.customerName,
            customerMobile: bill.customerMobile,
            discount: bill.discount || 0,
            gst: bill.gst || 0,
            paymentMode: bill.paymentMode || 'Cash',
            subtotal: bill.subtotal,
            total: bill.total
        };

        document.getElementById('billMobile').value = bill.customerMobile || '';
        document.getElementById('newCustomerName').value = bill.customerName;
        document.getElementById('billDiscount').value = bill.discount || 0;
        document.getElementById('billGst').value = bill.gst || 0;
        document.getElementById('billPaymentMode').value = bill.paymentMode || 'Cash';

        if (bill.customerMobile) {
            document.getElementById('customerInfo').classList.remove('hidden');
            document.getElementById('selectedCustomerName').textContent = bill.customerName;
            document.getElementById('selectedCustomerMobile').textContent = bill.customerMobile;
            document.getElementById('newCustomerForm').classList.add('hidden');
        }

        updateBillPreview();
        switchTab('billing');
    }
}

function printBillFromHistory(billId) {
    const bill = appState.bills.find(b => b.id === billId);
    if (bill) {
        lastGeneratedBill = bill;
        openPrintLayout(bill);
    }
}

function deleteBill(billId) {
    if (confirm('Are you sure you want to delete this bill?')) {
        appState.bills = appState.bills.filter(b => b.id !== billId);
        saveToLocalStorage();
        renderBillsHistory();
        updateStats();
        showToast('Bill deleted', 'success');
    }
}

// ==================== STATS FUNCTIONS ====================

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayBills = appState.bills.filter(bill => bill.date.split('T')[0] === today);
    const todayIncome = todayBills.reduce((sum, bill) => sum + bill.total, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyBills = appState.bills.filter(bill => {
        const billDate = new Date(bill.date);
        return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
    });
    const monthlyIncome = monthlyBills.reduce((sum, bill) => sum + bill.total, 0);

    const cashTotal = todayBills.filter(b => b.paymentMode === 'Cash').reduce((sum, b) => sum + b.total, 0);
    const upiTotal = todayBills.filter(b => b.paymentMode === 'UPI').reduce((sum, b) => sum + b.total, 0);
    const cardTotal = todayBills.filter(b => b.paymentMode === 'Card').reduce((sum, b) => sum + b.total, 0);

    document.getElementById('todayIncome').textContent = `₹${todayIncome}`;
    document.getElementById('todayBills').textContent = todayBills.length;
    document.getElementById('totalCustomers').textContent = appState.customers.length;
    document.getElementById('totalServices').textContent = appState.services.length;
    document.getElementById('monthlyIncome').textContent = `₹${monthlyIncome}`;

    document.getElementById('todayCash').textContent = `₹${cashTotal}`;
    document.getElementById('todayUPI').textContent = `₹${upiTotal}`;
    document.getElementById('todayCard').textContent = `₹${cardTotal}`;

    const recentBills = appState.bills.slice(-5).reverse();
    const recentDiv = document.getElementById('recentBillsList');
    if (recentBills.length === 0) {
        recentDiv.innerHTML = '<p class="text-gray-500 text-center py-8">No bills yet</p>';
    } else {
        recentDiv.innerHTML = recentBills.map(bill => `
            <div class="flex justify-between items-center border-b pb-2">
                <div>
                    <span class="font-semibold">${bill.billNumber}</span>
                    <p class="text-sm text-gray-500">${bill.customerName}</p>
                </div>
                <span class="font-bold" style="color: ${appState.invoiceSettings.primaryColor};">₹${bill.total}</span>
            </div>
        `).join('');
    }

    const serviceCount = {};
    appState.bills.forEach(bill => {
        bill.items.forEach(item => {
            serviceCount[item.name] = (serviceCount[item.name] || 0) + item.quantity;
        });
    });

    const topServices = Object.entries(serviceCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topDiv = document.getElementById('topServicesList');
    if (topServices.length === 0) {
        topDiv.innerHTML = '<p class="text-gray-500 text-sm">No data yet</p>';
    } else {
        topDiv.innerHTML = topServices.map(([name, count]) => `
            <div class="flex justify-between items-center">
                <span>${name}</span>
                <span class="font-semibold">${count} sold</span>
            </div>
        `).join('');
    }
}

function updateDashboard() {
    updateStats();
}

// ==================== REPORT FUNCTIONS ====================

function generateReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;

    if (!startDate || !endDate) {
        showToast('Please select date range', 'error');
        return;
    }

    const filteredBills = appState.bills.filter(bill => {
        const billDate = bill.date.split('T')[0];
        return billDate >= startDate && billDate <= endDate;
    });

    const serviceReport = {};
    filteredBills.forEach(bill => {
        bill.items.forEach(item => {
            if (!serviceReport[item.name]) {
                serviceReport[item.name] = { quantity: 0, revenue: 0 };
            }
            serviceReport[item.name].quantity += item.quantity;
            serviceReport[item.name].revenue += item.total;
        });
    });

    const serviceList = document.getElementById('serviceReportList');
    serviceList.innerHTML = Object.entries(serviceReport).sort((a, b) => b[1].revenue - a[1].revenue).map(([name, data]) => `
        <div class="flex justify-between items-center border-b pb-2">
            <span>${name}</span>
            <div>
                <span class="font-semibold">${data.quantity}</span>
                <span class="text-[#ab183d] ml-2">₹${data.revenue}</span>
            </div>
        </div>
    `).join('');

    const paymentModes = { Cash: 0, UPI: 0, Card: 0 };
    filteredBills.forEach(bill => {
        if (paymentModes[bill.paymentMode] !== undefined) {
            paymentModes[bill.paymentMode] += bill.total;
        }
    });

    const paymentDiv = document.getElementById('paymentModeReport');
    paymentDiv.innerHTML = Object.entries(paymentModes).map(([mode, amount]) => `
        <div class="flex justify-between items-center">
            <span>${mode}</span>
            <span class="font-semibold">₹${amount}</span>
        </div>
    `).join('');
}

// ==================== INVOICE SETTINGS FUNCTIONS ====================

function setInvoiceColor(color, type) {
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
    event.target.classList.add('selected');

    appState.invoiceSettings.primaryColor = color;
    applyInvoiceSettings();
    updateBillPreview();
}

function toggleInvoiceBorder() {
    const checkbox = document.getElementById('showBorder');
    appState.invoiceSettings.showBorder = checkbox.checked;
    applyInvoiceSettings();
    updateBillPreview();
}

function updateInvoiceBorder() {
    const width = document.getElementById('borderWidth').value;
    const radius = document.getElementById('borderRadius').value;

    appState.invoiceSettings.borderWidth = width;
    appState.invoiceSettings.borderRadius = radius;
    applyInvoiceSettings();
    updateBillPreview();
}

function updateInvoiceStyle() {
    const headerBg = document.getElementById('headerBg').value;
    appState.invoiceSettings.headerBg = headerBg;
    applyInvoiceSettings();
    updateBillPreview();
}

function updateInvoiceFontSize() {
    const fontSize = document.getElementById('fontSize').value;
    appState.invoiceSettings.fontSize = fontSize;
    applyInvoiceSettings();
    updateBillPreview();
}

function selectTemplate(templateId) {
    document.querySelectorAll('.template-preview').forEach(t => t.classList.remove('selected'));
    event.target.closest('.template-preview').classList.add('selected');

    switch (templateId) {
        case 1:
            appState.invoiceSettings = { ...appState.invoiceSettings, primaryColor: '#ab183d', showBorder: true, borderWidth: '2px', borderRadius: '12px', headerBg: '#f8fafc', fontSize: '14px' };
            break;
        case 2:
            appState.invoiceSettings = { ...appState.invoiceSettings, primaryColor: '#059669', showBorder: false, borderWidth: '2px', borderRadius: '8px', headerBg: '#ecfdf5', fontSize: '14px' };
            break;
        case 3:
            appState.invoiceSettings = { ...appState.invoiceSettings, primaryColor: '#7c3aed', showBorder: true, borderWidth: '2px', borderRadius: '16px', headerBg: '#faf5ff', fontSize: '14px' };
            break;
        case 4:
            appState.invoiceSettings = { ...appState.invoiceSettings, primaryColor: '#ea580c', showBorder: true, borderWidth: '3px', borderRadius: '4px', headerBg: '#fff7ed', fontSize: '14px' };
            break;
    }

    populateSettingsForm();
    applyInvoiceSettings();
    updateBillPreview();
}

function applyInvoiceSettings() {
    const settings = appState.invoiceSettings;
    document.documentElement.style.setProperty('--invoice-primary', settings.primaryColor);
    document.documentElement.style.setProperty('--invoice-border', settings.showBorder ? `${settings.borderWidth} solid ${settings.primaryColor}` : 'none');
    document.documentElement.style.setProperty('--invoice-border-radius', settings.borderRadius);
    document.documentElement.style.setProperty('--invoice-header-bg', settings.headerBg);
    document.documentElement.style.setProperty('--invoice-font-size', settings.fontSize);
}

function populateSettingsForm() {
    const settings = appState.invoiceSettings;
    document.getElementById('showBorder').checked = settings.showBorder;
    document.getElementById('borderWidth').value = settings.borderWidth;
    document.getElementById('borderRadius').value = settings.borderRadius;
    document.getElementById('headerBg').value = settings.headerBg;
    document.getElementById('fontSize').value = settings.fontSize;

    document.querySelectorAll('.color-option').forEach(opt => {
        if (opt.style.backgroundColor === settings.primaryColor) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });

    const preview = document.getElementById('settingsPreview');
    if (preview) {
        preview.style.border = settings.showBorder ? `${settings.borderWidth} solid ${settings.primaryColor}` : 'none';
        preview.style.borderRadius = settings.borderRadius;
    }
}

function saveInvoiceSettings() {
    saveToLocalStorage();
    updateBillPreview();
    showToast('Invoice settings saved successfully!', 'success');
}

// ==================== DATA MANAGEMENT FUNCTIONS ====================

function backupData() {
    const data = {
        centerProfile: appState.centerProfile,
        services: appState.services,
        customers: appState.customers,
        bills: appState.bills,
        lastBillNumber: appState.lastBillNumber,
        invoiceSettings: appState.invoiceSettings,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_csc_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Backup downloaded', 'success');
}

function restoreData() {
    const file = document.getElementById('restoreFile').files[0];
    if (!file) {
        showToast('Please select a file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.centerProfile) appState.centerProfile = data.centerProfile;
            if (data.services) appState.services = data.services;
            if (data.customers) appState.customers = data.customers;
            if (data.bills) appState.bills = data.bills;
            if (data.lastBillNumber) appState.lastBillNumber = data.lastBillNumber;
            if (data.invoiceSettings) appState.invoiceSettings = data.invoiceSettings;

            saveToLocalStorage();
            populateCenterProfile();
            populateQRCode();
            renderServices();
            renderCustomers();
            renderBillsHistory();
            updateStats();
            applyInvoiceSettings();
            showToast('Data restored successfully', 'success');
        } catch (error) {
            showToast('Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('⚠️ WARNING: This will delete ALL data permanently!\n\nAre you sure?')) {
        localStorage.clear();
        location.reload();
    }
}

// ==================== GOOGLE APPS SCRIPT CODE & MODAL ====================

const APPS_SCRIPT_RAW_CODE = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    
    // 4 अलग-अलग शीट्स (Tabs) तैयार करें
    var billsSheet = getOrCreateSheet(ss, "Bills_History", [
      "Bill No", "Date", "Customer Name", "Mobile", "Services / Items", 
      "Subtotal (₹)", "Discount (%)", "GST (%)", "Total (₹)", "Payment Mode", "Sync Time"
    ]);
    
    var customersSheet = getOrCreateSheet(ss, "Customers", [
      "Customer Name", "Mobile Number", "Registration Date", "Sync Time"
    ]);
    
    var servicesSheet = getOrCreateSheet(ss, "Services", [
      "Service Name", "Category", "Price (₹)", "Sync Time"
    ]);

    var backupSheet = getOrCreateSheet(ss, "Full_Backup", [
      "Backup Timestamp", "Center Profile (JSON)", "Invoice Settings (JSON)", "All Raw Data (JSON)"
    ]);

    // 1. टेस्ट कनेक्शन (चारों शीट्स में टेस्ट रो दर्ज होगी)
    if (data.action === "test_dummy") {
      billsSheet.appendRow(["TEST-0001", now, "Test Customer", "9876543210", "Aadhaar Card (x1), PAN Card (x1)", 100, 0, 0, 100, "Cash", now]);
      customersSheet.appendRow(["Test Customer", "9876543210", now, now]);
      servicesSheet.appendRow(["PAN Card Apply", "Government", 50, now]);
      backupSheet.appendRow([now, "{}", "{}", "{}"]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. ऑटो बिल सिंक
    if (data.action === "add_bill" && data.bill) {
      var b = data.bill;
      billsSheet.appendRow([
        b.billNumber, b.date, b.customerName, b.customerMobile || "N/A",
        b.items, b.subtotal, b.discount, b.gst, b.total, b.paymentMode, now
      ]);
      
      if (b.customerMobile && b.customerMobile !== "N/A") {
        customersSheet.appendRow([b.customerName, b.customerMobile, b.date, now]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. मास्टर सिंक (Bills, Customers, Services, Full Backup)
    if (data.action === "master_sync") {
      // (A) Bills
      if (data.bills && data.bills.length > 0) {
        var billRows = data.bills.map(function(b) {
          return [b.billNumber, b.date, b.customerName, b.customerMobile || "N/A", b.items, b.subtotal, b.discount, b.gst, b.total, b.paymentMode, now];
        });
        billsSheet.getRange(billsSheet.getLastRow() + 1, 1, billRows.length, 11).setValues(billRows);
      }
      
      // (B) Customers
      if (data.customers && data.customers.length > 0) {
        if (customersSheet.getLastRow() > 1) {
          customersSheet.getRange(2, 1, customersSheet.getLastRow() - 1, 4).clearContent();
        }
        var custRows = data.customers.map(function(c) {
          return [c.name, c.mobile, c.createdAt || now, now];
        });
        customersSheet.getRange(2, 1, custRows.length, 4).setValues(custRows);
      }
      
      // (C) Services
      if (data.services && data.services.length > 0) {
        if (servicesSheet.getLastRow() > 1) {
          servicesSheet.getRange(2, 1, servicesSheet.getLastRow() - 1, 4).clearContent();
        }
        var servRows = data.services.map(function(s) {
          return [s.name, s.category, s.price, now];
        });
        servicesSheet.getRange(2, 1, servRows.length, 4).setValues(servRows);
      }

      // (D) Full Backup
      if (data.backup) {
        backupSheet.appendRow([
          now,
          JSON.stringify(data.backup.centerProfile || {}),
          JSON.stringify(data.backup.invoiceSettings || {}),
          JSON.stringify(data.backup.rawData || {})
        ]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold").setBackground("#ab183d").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    for (var i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
  return sheet;
}`;

// Modal Controls
function openScriptModal() {
    const display = document.getElementById('scriptCodeDisplay');
    if (display) display.textContent = APPS_SCRIPT_RAW_CODE;
    document.getElementById('scriptCodeModal').classList.remove('hidden');
}

function closeScriptModal() {
    document.getElementById('scriptCodeModal').classList.add('hidden');
}

function copyAppsScriptCode() {
    navigator.clipboard.writeText(APPS_SCRIPT_RAW_CODE).then(() => {
        showToast('Apps Script कोड सफलतापूर्वक कॉपी हो गया!', 'success');
    }).catch(() => {
        showToast('कोड कॉपी करने में त्रुटि हुई', 'error');
    });
}

function saveGoogleSheetConfig() {
    const url = document.getElementById('googleSheetUrl').value.trim();
    if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
        showToast('कृपया सही Apps Script Web App URL पेस्ट करें', 'error');
        return;
    }
    appState.googleSheet.webAppUrl = url;
    saveToLocalStorage();
    updateSheetBadge();
    showToast('Google Sheet URL सेव हो गया! अब Test Connection पर क्लिक करें।', 'success');
}

function toggleAutoSyncSheet() {
    const checkbox = document.getElementById('autoSyncSheets');
    if (checkbox) {
        appState.googleSheet.autoSync = checkbox.checked;
        saveToLocalStorage();
        showToast(`Auto Sync ${appState.googleSheet.autoSync ? 'चालू' : 'बंद'} कर दिया गया`, 'info');
    }
}

function updateSheetBadge() {
    const badge = document.getElementById('sheetStatusBadge');
    const syncCount = document.getElementById('totalBillsCountForSync');
    if (syncCount) syncCount.textContent = appState.bills.length;

    if (!badge) return;
    if (appState.googleSheet.webAppUrl && appState.googleSheet.isConnected) {
        badge.className = 'text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold border border-green-300';
        badge.innerHTML = '<i class="fas fa-check-circle text-green-600 text-[11px] mr-1"></i> Connected & Active';
    } else if (appState.googleSheet.webAppUrl) {
        badge.className = 'text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold border border-yellow-300';
        badge.innerHTML = '<i class="fas fa-exclamation-circle text-yellow-600 text-[11px] mr-1"></i> URL Saved (Test Pending)';
    } else {
        badge.className = 'text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold border';
        badge.innerHTML = '<i class="fas fa-circle text-gray-400 text-[10px] mr-1"></i> Not Connected';
    }
}

async function testAndSendDummyData() {
    const url = document.getElementById('googleSheetUrl').value.trim() || appState.googleSheet.webAppUrl;
    if (!url) {
        showToast('कृपया पहले Google Sheet Web App URL पेस्ट करें', 'error');
        return;
    }

    const btn = document.getElementById('testSheetBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending Dummy Data...';
    btn.disabled = true;

    try {
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'test_dummy' })
        });

        appState.googleSheet.isConnected = true;
        appState.googleSheet.webAppUrl = url;
        saveToLocalStorage();
        updateSheetBadge();

        showToast('सफलता! चारों शीट्स में टेस्ट डेटा सेव हो गया है। अपनी Google Sheet चेक करें।', 'success');
    } catch (err) {
        console.error(err);
        showToast('कनेक्शन नहीं बन सका। कृपया Web App Deployment सेटिंग्स जांचें।', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function sendBillToGoogleSheet(bill) {
    if (!appState.googleSheet.webAppUrl) return;

    try {
        const payload = {
            action: 'add_bill',
            bill: {
                billNumber: bill.billNumber,
                date: new Date(bill.date).toLocaleString('en-IN'),
                customerName: bill.customerName,
                customerMobile: bill.customerMobile || 'N/A',
                items: bill.items.map(i => `${i.name} (x${i.quantity})`).join(', '),
                subtotal: bill.subtotal,
                discount: bill.discount,
                gst: bill.gst,
                total: bill.total,
                paymentMode: bill.paymentMode
            }
        };

        await fetch(appState.googleSheet.webAppUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log(`Bill ${bill.billNumber} auto-synced to Sheet`);
    } catch (err) {
        console.error('Auto sync failed:', err);
    }
}

async function syncCompleteDataToGoogleSheets() {
    if (!appState.googleSheet.webAppUrl) {
        showToast('कृपया पहले Web App URL सेव करें', 'error');
        return;
    }

    const btn = document.getElementById('syncSheetBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Syncing All 4 Sheets...';
    btn.disabled = true;

    try {
        const payload = {
            action: 'master_sync',
            bills: appState.bills.map(b => ({
                billNumber: b.billNumber,
                date: new Date(b.date).toLocaleDateString('en-IN'),
                customerName: b.customerName,
                customerMobile: b.customerMobile || 'N/A',
                items: b.items.map(i => `${i.name} (x${i.quantity})`).join(', '),
                subtotal: b.subtotal,
                discount: b.discount,
                gst: b.gst,
                total: b.total,
                paymentMode: b.paymentMode
            })),
            customers: appState.customers,
            services: appState.services,
            backup: {
                centerProfile: appState.centerProfile,
                invoiceSettings: appState.invoiceSettings,
                rawData: {
                    bills: appState.bills,
                    customers: appState.customers,
                    services: appState.services,
                    lastBillNumber: appState.lastBillNumber
                }
            }
        };

        await fetch(appState.googleSheet.webAppUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        showToast('सफलता! Bills, Customers, Services और Full Backup चारों शीट्स में सिंक हो गए!', 'success');
        updateSheetBadge();
    } catch (err) {
        console.error(err);
        showToast('सिंक करने में समस्या आई', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ==================== TOAST FUNCTION ====================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-[#d9304f]',
        warning: 'bg-yellow-500'
    };

    toast.className = `toast ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-3"></i>
        ${message}
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
