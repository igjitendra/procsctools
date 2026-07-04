
// ===== Mobile menu =====
(function(){var b=document.getElementById('menuBtn'),m=document.getElementById('mobileMenu');if(b&&m){b.addEventListener('click',function(){m.classList.toggle('hidden');});document.querySelectorAll('[data-close-mobile]').forEach(function(a){a.addEventListener('click',function(){m.classList.add('hidden');});});}})();
// ===== AdSense: push every ad unit on the page =====
window.addEventListener('load',function(){try{document.querySelectorAll('ins.adsbygoogle').forEach(function(){(window.adsbygoogle=window.adsbygoogle||[]).push({});});}catch(e){}});
// ===== Reading progress bar (article pages) =====
(function(){var bar=document.getElementById('progressBar');if(!bar)return;function upd(){var h=document.documentElement;var st=h.scrollTop||document.body.scrollTop;var sh=(h.scrollHeight||document.body.scrollHeight)-h.clientHeight;bar.style.width=(sh>0?(st/sh*100):0)+'%';}window.addEventListener('scroll',upd);upd();})();
// ===== Copy link =====
(function(){var c=document.getElementById('copyLink');if(!c)return;c.addEventListener('click',function(e){e.preventDefault();navigator.clipboard.writeText(window.location.href).then(function(){var t=c.innerHTML;c.innerHTML='<i class="fas fa-check"></i>';setTimeout(function(){c.innerHTML=t;},1500);});});})();
// ===== Article image fallback =====
document.querySelectorAll('img[data-fb]').forEach(function(im){im.addEventListener('error',function(){this.onerror=null;this.src='https://placehold.co/1200x630/ab183d/ffffff?text=Pro+CSC+Tools';});});
// ===== Blog posts (add a new object on top to publish a new article) =====
const blogPosts=[
  {
    "title": "How to Use the QR Code Generator Tool (Step-by-Step)",
    "excerpt": "Create URL, UPI, text, phone and Wi-Fi QR codes in seconds and download them in high quality - a complete beginner guide for CSC VLEs.",
    "img": "/images/qr.webp",
    "date": "Jun 28, 2026",
    "tag": "QR & Payments",
    "url": "/blog/how-to-use-qr-Generator-tool.html",
    "live": true
  },
  {
    "title": "QR Code Generator Online Free - Create UPI and Link QR Codes",
    "excerpt": "Generate QR codes online free for UPI payments, links, text and WhatsApp. Create custom QR codes for your CSC center and shop. Step-by-step guide.",
    "img": "/images/qr.webp",
    "date": "Jun 29, 2026",
    "tag": "QR & Payments",
    "url": "/blog/qr-code-generator-guide.html",
    "live": true
  },
  {
    "title": "Background Remover Online Free - Remove Photo Background in Seconds",
    "excerpt": "Remove the background from any photo online free and get a transparent or white background instantly. Perfect for passport photos, products and signatures for CSC VLEs.",
    "img": "/images/bg.webp",
    "date": "Jun 29, 2026",
    "tag": "Photo Tools",
    "url": "/blog/background-remover-guide.html",
    "live": true
  },
  {
    "title": "Image Compressor Online Free - Reduce Photo Size Without Losing Quality",
    "excerpt": "Compress images online free and reduce JPG and PNG file size without losing quality. Perfect for form uploads and faster websites. Guide for CSC VLEs.",
    "img": "/images/compress-image.webp",
    "date": "Jun 29, 2026",
    "tag": "Photo Tools",
    "url": "/blog/image-compressor-guide.html",
    "live": true
  },
  {
    "title": "Image Converter Online Free - Convert JPG, PNG, WEBP Easily",
    "excerpt": "Convert images between JPG, PNG, WEBP and more online free without losing quality. Quick image format converter guide for CSC VLEs and students.",
    "img": "/images/converter.webp",
    "date": "Jun 29, 2026",
    "tag": "Photo Tools",
    "url": "/blog/image-converter-guide.html",
    "live": true
  },
  {
    "title": "Image Cropper Online Free - Crop Photos to Any Size or Ratio",
    "excerpt": "Crop images online free to any size, ratio or shape. Crop photos for documents, social media and forms easily. Step-by-step cropper guide for CSC VLEs.",
    "img": "/images/crop.webp",
    "date": "Jun 29, 2026",
    "tag": "Photo Tools",
    "url": "/blog/image-cropper-guide.html",
    "live": true
  },
  {
    "title": "Image Resizer Online Free - Resize Photos to Any Pixel or KB",
    "excerpt": "Resize images online free to exact pixels or KB size without losing quality. Resize photos for forms, web and social media. Easy guide for CSC VLEs.",
    "img": "/images/image-resizer.webp",
    "date": "Jun 29, 2026",
    "tag": "Photo Tools",
    "url": "/blog/image-resizer-guide.html",
    "live": true
  },
  {
    "title": "Passport Size Photo Maker Online Free - Complete Guide (2026)",
    "excerpt": "Make passport size photos online free with the correct size, white background and DPI for passport, visa, exam and government forms. Step-by-step guide for CSC VLEs.",
    "img": "/images/passport.webp",
    "date": "Jun 29, 2026",
    "tag": "Photo Tools",
    "url": "/blog/passport-photo-maker-guide.html",
    "live": true
  },
  {
    "title": "Photo Quality Enhancer Online Free - Make Blurry Photos Clear",
    "excerpt": "Enhance photo quality online free and make blurry, low-resolution photos clear and sharp. AI photo enhancer guide for CSC VLEs and students.",
    "img": "/images/enhance-photo.webp",
    "date": "Jun 29, 2026",
    "tag": "Photo Tools",
    "url": "/blog/photo-quality-enhancer-guide.html",
    "live": true
  },
  {
    "title": "Photo and Signature Joiner Online Free - Combine into One Image",
    "excerpt": "Join photo and signature into one image online free, as required by many exam and government forms. Step-by-step joiner tool guide for CSC VLEs.",
    "img": "/images/photo-name-joiner.webp",
    "date": "Jun 29, 2026",
    "tag": "Photo Tools",
    "url": "/blog/photo-signature-joiner-guide.html",
    "live": true
  },
  {
    "title": "Photo and Signature Resizer for Exam Forms - Online Free Guide",
    "excerpt": "Resize photo and signature to the exact KB size and dimensions required by exam and government forms like SSC, UPSC, railway and banking. Free tool guide for CSC VLEs.",
    "img": "/images/photo-sign.webp",
    "date": "Jun 29, 2026",
    "tag": "Photo Tools",
    "url": "/blog/photo-signature-resizer-guide.html",
    "live": true
  },
  {
    "title": "Image to PDF Converter Online Free - Combine Photos into One PDF",
    "excerpt": "Convert JPG and PNG images to PDF online free. Combine multiple documents and photos into one PDF for government uploads. Step-by-step guide for CSC VLEs.",
    "img": "/images/image-to-pdf.webp",
    "date": "Jun 29, 2026",
    "tag": "PDF Tools",
    "url": "/blog/image-to-pdf-guide.html",
    "live": true
  },
  {
    "title": "Merge PDF Online Free - Combine Multiple PDF Files into One",
    "excerpt": "Merge PDF files online free and combine multiple PDFs into one document in the right order. Quick merge PDF guide for CSC VLEs, students and offices.",
    "img": "/images/merge-pdf.webp",
    "date": "Jun 29, 2026",
    "tag": "PDF Tools",
    "url": "/blog/merge-pdf-guide.html",
    "live": true
  },
  {
    "title": "Split PDF Online Free - Separate Pages from a PDF File",
    "excerpt": "Split PDF files online free and extract or separate specific pages from a PDF. Quick split PDF guide for CSC VLEs, students and offices.",
    "img": "/images/split.webp",
    "date": "Jun 29, 2026",
    "tag": "PDF Tools",
    "url": "/blog/split-pdf-guide.html",
    "live": true
  },
  {
    "title": "Word to PDF Converter Online Free - Convert DOC to PDF Easily",
    "excerpt": "Convert Word documents (DOC, DOCX) to PDF online free while keeping the exact formatting. Quick Word to PDF guide for CSC VLEs, students and offices.",
    "img": "/images/Word-to-PDF.webp",
    "date": "Jun 29, 2026",
    "tag": "PDF Tools",
    "url": "/blog/word-to-pdf-guide.html",
    "live": true
  },
  {
    "title": "Age Calculator Online Free - Calculate Exact Age by Date of Birth",
    "excerpt": "Calculate exact age in years, months and days from date of birth online free. Check age eligibility for exams and government forms. Easy guide for CSC VLEs.",
    "img": "/images/age-calculator.webp",
    "date": "Jun 29, 2026",
    "tag": "Calculators",
    "url": "/blog/age-calculator-guide.html",
    "live": true
  },
  {
    "title": "Date Difference Calculator Online Free - Days Between Two Dates",
    "excerpt": "Calculate the number of days, months and years between two dates online free. Useful for deadlines, interest and durations. Easy guide for CSC VLEs and students.",
    "img": "/images/date-difference.webp",
    "date": "Jun 29, 2026",
    "tag": "Calculators",
    "url": "/blog/date-difference-calculator-guide.html",
    "live": true
  },
  {
    "title": "GPA and CGPA Calculator Online Free - Calculate Your Grades",
    "excerpt": "Calculate GPA and CGPA online free and convert CGPA to percentage instantly. Easy grade calculator for students, with a step-by-step guide for CSC VLEs.",
    "img": "/images/gpa-cgpa-calculator.webp",
    "date": "Jun 29, 2026",
    "tag": "Calculators",
    "url": "/blog/gpa-cgpa-calculator-guide.html",
    "live": true
  },
  {
    "title": "GST Calculator Online Free - Calculate GST Amount Instantly",
    "excerpt": "Calculate GST online free with inclusive and exclusive options for 5%, 12%, 18% and 28% slabs. Easy GST calculation guide for shop owners and CSC VLEs.",
    "img": "/images/gst.webp",
    "date": "Jun 29, 2026",
    "tag": "Calculators",
    "url": "/blog/gst-calculator-guide.html",
    "live": true
  },
  {
    "title": "Loan EMI Calculator Online Free - Calculate Monthly EMI Easily",
    "excerpt": "Calculate your loan EMI online free for home, car, personal and business loans. See monthly EMI, total interest and payment breakdown. Easy guide for CSC VLEs.",
    "img": "/images/loan-emi.webp",
    "date": "Jun 29, 2026",
    "tag": "Calculators",
    "url": "/blog/loan-emi-calculator-guide.html",
    "live": true
  },
  {
    "title": "Percentage Calculator Online Free - Calculate Percentages Fast",
    "excerpt": "Calculate percentages online free - marks percentage, increase, decrease and percent of a number. Simple percentage calculator guide for students and CSC VLEs.",
    "img": "/images/percentage-cal.webp",
    "date": "Jun 29, 2026",
    "tag": "Calculators",
    "url": "/blog/percentage-calculator-guide.html",
    "live": true
  },
  {
    "title": "File Cover Maker Online Free - Create Professional File Covers",
    "excerpt": "Create professional file and project covers online free with title, name and details. Easy file cover page maker guide for students and CSC VLEs.",
    "img": "/images/cover.webp",
    "date": "Jun 29, 2026",
    "tag": "Documents",
    "url": "/blog/file-cover-maker-guide.html",
    "live": true
  },
  {
    "title": "Marriage Biodata Maker Online Free - Create a Biodata in Minutes",
    "excerpt": "Create a marriage biodata online free with beautiful templates, personal, family and contact details. Easy marriage biodata maker guide for CSC VLEs.",
    "img": "/images/marital-biodata-maker.webp",
    "date": "Jun 29, 2026",
    "tag": "Documents",
    "url": "/blog/marriage-biodata-maker-guide.html",
    "live": true
  },
  {
    "title": "Free Resume Builder Online - Create a Professional CV in Minutes",
    "excerpt": "Build a professional resume online free with ready templates. Create job-winning CVs for students and job seekers in minutes. Complete guide for CSC VLEs.",
    "img": "/images/resume-builder.webp",
    "date": "Jun 29, 2026",
    "tag": "Documents",
    "url": "/blog/resume-builder-guide.html",
    "live": true
  },
  {
    "title": "CSC Billing Software Online Free - Manage Center Billing Easily",
    "excerpt": "Free CSC billing software to create bills, track services and manage your Common Service Centre income online. Simple billing solution for VLEs in India.",
    "img": "/images/csc-billing-software.webp",
    "date": "Jun 29, 2026",
    "tag": "Business",
    "url": "/blog/csc-billing-software-guide.html",
    "live": true
  },
  {
    "title": "CSC Center Manager Online Free - Manage Your CSC Work Easily",
    "excerpt": "Manage your CSC center work, customers and services online free. A simple management tool for VLEs to stay organized and grow their Common Service Centre.",
    "img": "/images/csc-manager.webp",
    "date": "Jun 29, 2026",
    "tag": "Business",
    "url": "/blog/csc-center-manager-guide.html",
    "live": true
  },
  {
    "title": "Free Invoice and Bill Generator Online - Create GST Bills Fast",
    "excerpt": "Create professional invoices and bills online free with GST, logo and itemized details. Perfect billing tool for CSC VLEs and small shop owners in India.",
    "img": "/images/invoice-generator.webp",
    "date": "Jun 29, 2026",
    "tag": "Business",
    "url": "/blog/invoice-bill-generator-guide.html",
    "live": true
  }
];
function blogInit(){
  var grid=document.getElementById('blogGrid');if(!grid)return;
  var featured=document.getElementById('featured');var catWrap=document.getElementById('catFilter');var empty=document.getElementById('blogEmpty');
  var active='All';var query='';
  var cats=['All'];blogPosts.forEach(function(p){if(cats.indexOf(p.tag)<0)cats.push(p.tag);});
  function fb(){grid.querySelectorAll('img[data-fb]').forEach(function(im){im.onerror=function(){this.onerror=null;this.src='https://placehold.co/600x300/ab183d/ffffff?text=Pro+CSC+Tools';};});if(featured)featured.querySelectorAll('img[data-fb]').forEach(function(im){im.onerror=function(){this.onerror=null;this.src='https://placehold.co/600x300/ab183d/ffffff?text=Pro+CSC+Tools';};});}
  function card(p){var btn=p.live?'<a href="'+p.url+'" class="read-more">Read Full Article <i class="fas fa-arrow-right"></i></a>':'<span class="text-xs font-semibold text-gray-400">Coming soon</span>';var link=p.live?p.url:'#';return '<article class="blog-card bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 flex flex-col overflow-hidden"><a href="'+link+'" class="block overflow-hidden h-44"><img src="'+p.img+'" alt="'+p.title+'" loading="lazy" data-fb class="thumb w-full h-44 object-cover"></a><div class="p-5 flex flex-col flex-grow"><span class="text-xs font-bold text-[#ab183d] uppercase tracking-wide">'+p.tag+'</span><h3 class="text-base font-bold text-gray-900 mt-2 mb-2 leading-snug">'+p.title+'</h3><p class="text-sm text-gray-600 flex-grow">'+p.excerpt+'</p><div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100"><span class="text-xs text-gray-400"><i class="far fa-calendar"></i> '+p.date+'</span>'+btn+'</div></div></article>';}
  function featuredCard(p){var btn=p.live?'<a href="'+p.url+'" class="inline-flex items-center gap-2 mt-4 bg-[#ab183d] text-white px-5 py-2.5 rounded-full font-semibold hover:bg-red-700 transition w-max">Read Full Article <i class="fas fa-arrow-right"></i></a>':'<span class="text-xs font-semibold text-gray-400 mt-4">Coming soon</span>';var link=p.live?p.url:'#';return '<div class="blog-card grid md:grid-cols-2 bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden mb-8"><a href="'+link+'" class="block overflow-hidden h-56 md:h-auto"><img src="'+p.img+'" alt="'+p.title+'" data-fb class="thumb w-full h-full object-cover"></a><div class="p-6 flex flex-col justify-center"><span class="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#ab183d] px-2.5 py-1 rounded-full w-max mb-3"><i class="fas fa-star"></i> FEATURED</span><h2 class="text-2xl font-extrabold text-gray-900 leading-snug">'+p.title+'</h2><p class="text-gray-600 mt-3">'+p.excerpt+'</p><span class="text-xs text-gray-400 mt-3"><i class="far fa-calendar"></i> '+p.date+' &middot; '+p.tag+'</span>'+btn+'</div></div>';}
  function render(){var list=blogPosts.filter(function(p){var okc=(active==='All'||p.tag===active);var okq=(!query||p.title.toLowerCase().indexOf(query)>-1||p.excerpt.toLowerCase().indexOf(query)>-1);return okc&&okq;});var showFeatured=(active==='All'&&!query&&list.length>0);if(featured)featured.innerHTML=showFeatured?featuredCard(list[0]):'';var rest=showFeatured?list.slice(1):list;grid.innerHTML=rest.map(card).join('');if(empty)empty.classList.toggle('hidden',list.length>0);fb();}
  if(catWrap){catWrap.innerHTML=cats.map(function(c){return '<button data-cat="'+c+'" class="cat-pill px-4 py-1.5 rounded-full text-sm font-semibold transition">'+c+'</button>';}).join('');catWrap.querySelectorAll('[data-cat]').forEach(function(btn){btn.addEventListener('click',function(){active=btn.getAttribute('data-cat');catWrap.querySelectorAll('[data-cat]').forEach(function(b){b.classList.remove('cat-active');});btn.classList.add('cat-active');render();});});var f=catWrap.querySelector('[data-cat]');if(f)f.classList.add('cat-active');}
  var s=document.getElementById('blogSearch');if(s){s.addEventListener('input',function(){query=s.value.toLowerCase().trim();render();});}
  render();
}
blogInit();
