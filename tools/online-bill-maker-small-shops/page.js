
      (function () {
        // ----- state -----
        const defaultItems = [
          { name: "Organic Apples (1kg)", price: 120, qty: 2 },
          { name: "Whole Wheat Bread", price: 45, qty: 1 },
          { name: "Milk (1L)", price: 56, qty: 3 },
          { name: "Cheddar Cheese 200g", price: 180, qty: 1 },
        ];

        let items = JSON.parse(JSON.stringify(defaultItems));
        let currentTemplate = "simple";
        let logoDataURL = null;
        let sigDataURL = null;

        // DOM refs
        const container = document.getElementById("itemsContainer");
        const previewItemsList = document.getElementById("previewItemsList");
        const previewTotal = document.getElementById("previewTotal");
        const previewStore = document.getElementById("previewStore");
        const previewBillNo = document.getElementById("previewBillNo");
        const previewDate = document.getElementById("previewDate");
        const previewCustomer = document.getElementById("previewCustomer");
        const previewLogoImg = document.getElementById("previewLogoImg");
        const previewSigImg = document.getElementById("previewSigImg");
        const sigPlaceholder = document.getElementById("sigPlaceholder");

        const storeInput = document.getElementById("storeName");
        const billNumberInput = document.getElementById("billNumber");
        const dateInput = document.getElementById("billDate");
        const customerInput = document.getElementById("customerName");

        const templateOptions = document.querySelectorAll(".template-option");
        const logoInput = document.getElementById("logoInput");
        const sigInput = document.getElementById("sigInput");
        const logoPreview = document.getElementById("logoPreview");
        const sigPreview = document.getElementById("sigPreview");

        // ----- helpers -----
        function formatDate(dateStr) {
          if (!dateStr) return "18 Jun 2026";
          const d = new Date(dateStr + "T00:00:00");
          if (isNaN(d)) return dateStr;
          return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        }

        function escapeHtml(text) {
          const div = document.createElement("div");
          div.textContent = text;
          return div.innerHTML;
        }

        // ----- render items rows -----
        function renderItems() {
          container.innerHTML = "";
          items.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "item-row fade-in";
            row.dataset.index = index;
            row.innerHTML = `
          <input type="text" class="form-control item-name" value="${escapeHtml(
            item.name
          )}" placeholder="Item name" />
          <input type="number" class="form-control item-price" value="${
            item.price
          }" placeholder="₹" min="0" step="0.5" />
          <input type="number" class="form-control item-qty" value="${
            item.qty
          }" placeholder="Qty" min="1" step="1" />
          <button class="btn-icon remove" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
        `;
            container.appendChild(row);
          });

          document.querySelectorAll(".item-row .remove").forEach((btn) => {
            btn.addEventListener("click", function (e) {
              const idx = parseInt(this.dataset.index);
              if (items.length <= 1) return;
              items.splice(idx, 1);
              renderItems();
              updatePreview();
            });
          });

          container
            .querySelectorAll(".item-name, .item-price, .item-qty")
            .forEach((el, i) => {
              el.addEventListener("input", function () {
                const row = this.closest(".item-row");
                const idx = parseInt(row.dataset.index);
                const name =
                  row.querySelector(".item-name").value.trim() || "Item";
                const price =
                  parseFloat(row.querySelector(".item-price").value) || 0;
                const qty = parseInt(row.querySelector(".item-qty").value) || 1;
                items[idx] = { name, price, qty };
                updatePreview();
              });
            });
        }

        // ----- update preview -----
        function updatePreview() {
          const store = storeInput.value.trim() || "Your Store";
          const billNo = billNumberInput.value.trim() || "INV-0001";
          const dateRaw = dateInput.value;
          const dateFormatted = formatDate(dateRaw);
          const customer = customerInput.value.trim() || "Customer";

          previewStore.innerHTML = `<span>${escapeHtml(store)}</span>`;
          if (logoDataURL) {
            const img = document.createElement("img");
            img.src = logoDataURL;
            img.style.height = "28px";
            img.style.width = "28px";
            img.style.objectFit = "contain";
            img.style.borderRadius = "6px";
            previewStore.appendChild(img);
            previewLogoImg.style.display = "inline-block";
            previewLogoImg.src = logoDataURL;
          } else {
            previewLogoImg.style.display = "none";
          }

          previewBillNo.textContent = billNo;
          previewDate.textContent = dateFormatted;
          previewCustomer.textContent = customer;

          if (sigDataURL) {
            previewSigImg.style.display = "inline-block";
            previewSigImg.src = sigDataURL;
            sigPlaceholder.style.display = "none";
          } else {
            previewSigImg.style.display = "none";
            sigPlaceholder.style.display = "inline";
          }

          let subtotal = 0;
          let itemsHtml = "";
          items.forEach((it) => {
            const name = it.name || "Item";
            const price = it.price || 0;
            const qty = it.qty || 1;
            const lineTotal = price * qty;
            subtotal += lineTotal;
            itemsHtml += `
          <div class="bill-item">
            <span>${escapeHtml(
              name
            )} <span style="font-weight:300; font-size:0.7rem; color:#5a7a6d;">×${qty}</span></span>
            <span>₹${lineTotal.toFixed(2)}</span>
          </div>
        `;
          });

          let gstRate = 0.05;
          let showGst = true;
          let showTaxBreakdown = false;

          if (currentTemplate === "simple") {
            showGst = false;
          } else if (currentTemplate === "professional") {
            showGst = true;
            showTaxBreakdown = true;
          } else if (currentTemplate === "thermal") {
            showGst = true;
            showTaxBreakdown = false;
          }

          const gstAmount = subtotal * gstRate;
          const grandTotal = subtotal + gstAmount;

          let gstHtml = "";
          if (showGst) {
            if (showTaxBreakdown) {
              const cgst = gstAmount / 2;
              const sgst = gstAmount / 2;
              gstHtml = `
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#2d5a4c; padding-top:0.2rem; border-top:1px dashed #d6e4de;">
              <span>CGST (2.5%)</span>
              <span>₹${cgst.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#2d5a4c;">
              <span>SGST (2.5%)</span>
              <span>₹${sgst.toFixed(2)}</span>
            </div>
          `;
            } else {
              gstHtml = `
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#2d5a4c; padding-top:0.2rem; border-top:1px dashed #d6e4de;">
              <span>GST (5%)</span>
              <span>₹${gstAmount.toFixed(2)}</span>
            </div>
          `;
            }
          }

          previewItemsList.innerHTML = itemsHtml + gstHtml;
          previewTotal.textContent = `₹${grandTotal.toFixed(2)}`;
        }

        // ----- Download PDF (using html2canvas) -----
        function downloadBill() {
          const card = document.getElementById("billPreviewCard");
          const origShadow = card.style.boxShadow;
          card.style.boxShadow = "none";

          html2canvas(card, {
            scale: 2,
            backgroundColor: "#ffffff",
            allowTaint: false,
            useCORS: true,
            logging: false,
          })
            .then((canvas) => {
              const link = document.createElement("a");
              link.download = `bill-${
                billNumberInput.value.trim() || "invoice"
              }.png`;
              link.href = canvas.toDataURL("image/png");
              link.click();
              card.style.boxShadow = origShadow;
            })
            .catch(() => {
              card.style.boxShadow = origShadow;
              alert("Could not generate image. Please use Print option.");
            });
        }

        // ----- Print bill -----
        function printBill() {
          const content = document.getElementById("billPreviewContent");
          const win = window.open("", "_blank");
          if (!win) {
            alert("Please allow popups for printing.");
            return;
          }
          const styles = document.querySelector("style").innerHTML;
          win.document.write(`
        <html>
          <head><title>Print Bill</title>
          <style>${styles}</style>
          <style>
            body { padding: 2rem; background: white; }
            .bill-card { box-shadow: none !important; border: 1px solid #ddd; }
            .preview-actions, .preview-header .badge-gst { display: none; }
          </style>
          </head>
          <body>
            <div class="bill-card" style="max-width:500px; margin:0 auto;">
              ${content.innerHTML}
            </div>
            <script>
              window.onload = function() { window.print(); }
            <\/script>
          </body>
        </html>
      `);
          win.document.close();
        }

        // ----- event listeners -----
        document
          .getElementById("addItemBtn")
          .addEventListener("click", function () {
            items.push({ name: "New item", price: 50, qty: 1 });
            renderItems();
            updatePreview();
          });

        document
          .getElementById("resetDemoBtn")
          .addEventListener("click", function () {
            items = JSON.parse(JSON.stringify(defaultItems));
            storeInput.value = "FreshMart Superstore";
            billNumberInput.value = "INV-2406-12";
            dateInput.value = "2026-06-18";
            customerInput.value = "Pro CSC Tools";
            logoDataURL = null;
            sigDataURL = null;
            logoPreview.classList.remove("show");
            logoPreview.src = "";
            sigPreview.classList.remove("show");
            sigPreview.src = "";
            currentTemplate = "simple";
            templateOptions.forEach((opt) => {
              opt.classList.toggle("active", opt.dataset.template === "simple");
            });
            renderItems();
            updatePreview();
          });

        document
          .getElementById("generateBillBtn")
          .addEventListener("click", function () {
            updatePreview();
            const card = document.getElementById("billPreviewCard");
            card.style.transition = "all 0.15s";
            card.style.boxShadow = "0 0 0 4px rgba(30, 90, 74, 0.15)";
            setTimeout(() => {
              card.style.boxShadow = "0 8px 20px -10px rgba(0,0,0,0.04)";
            }, 300);
          });

        // Download & Print buttons
        document
          .getElementById("downloadPdfBtn")
          .addEventListener("click", downloadBill);
        document
          .getElementById("printBillBtn")
          .addEventListener("click", printBill);

        // template switching
        templateOptions.forEach((opt) => {
          opt.addEventListener("click", function () {
            templateOptions.forEach((o) => o.classList.remove("active"));
            this.classList.add("active");
            currentTemplate = this.dataset.template;
            updatePreview();
          });
        });

        // upload logo
        document
          .getElementById("logoUploadBtn")
          .addEventListener("click", function (e) {
            if (e.target.tagName !== "INPUT") logoInput.click();
          });
        logoInput.addEventListener("change", function (e) {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function (ev) {
            logoDataURL = ev.target.result;
            logoPreview.src = logoDataURL;
            logoPreview.classList.add("show");
            updatePreview();
          };
          reader.readAsDataURL(file);
        });

        // upload signature
        document
          .getElementById("sigUploadBtn")
          .addEventListener("click", function (e) {
            if (e.target.tagName !== "INPUT") sigInput.click();
          });
        sigInput.addEventListener("change", function (e) {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function (ev) {
            sigDataURL = ev.target.result;
            sigPreview.src = sigDataURL;
            sigPreview.classList.add("show");
            updatePreview();
          };
          reader.readAsDataURL(file);
        });

        // sync form fields
        storeInput.addEventListener("input", updatePreview);
        billNumberInput.addEventListener("input", updatePreview);
        dateInput.addEventListener("input", updatePreview);
        customerInput.addEventListener("input", updatePreview);

        // initial render
        renderItems();
        if (!dateInput.value) {
          dateInput.value = new Date().toISOString().split("T")[0];
        }
        updatePreview();

        document.querySelectorAll(".form-control").forEach((el) => {
          el.addEventListener("blur", updatePreview);
        });
      })();
    