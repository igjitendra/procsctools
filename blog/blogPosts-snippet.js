// Paste these objects at the TOP of the blogPosts array in blog/app.js
const newBlogPosts = [
  {
    "title": "Age Calculator Online Free - Calculate Exact Age by Date of Birth",
    "excerpt": "Calculate exact age in years, months and days from date of birth online free. Check age eligibility for exams and government forms. Easy guide for CSC VLEs.",
    "img": "/images/age-calculator.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/age-calculator-guide.html",
    "live": true
  },
  {
    "title": "Background Remover Online Free - Remove Photo Background in Seconds",
    "excerpt": "Remove the background from any photo online free and get a transparent or white background instantly. Perfect for passport photos, products and signatures for CSC VLEs.",
    "img": "/images/bg.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/background-remover-guide.html",
    "live": true
  },
  {
    "title": "CSC Billing Software Online Free - Manage Center Billing Easily",
    "excerpt": "Free CSC billing software to create bills, track services and manage your Common Service Centre income online. Simple billing solution for VLEs in India.",
    "img": "/images/csc-billing-software.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/csc-billing-software-guide.html",
    "live": true
  },
  {
    "title": "CSC Center Manager Online Free - Manage Your CSC Work Easily",
    "excerpt": "Manage your CSC center work, customers and services online free. A simple management tool for VLEs to stay organized and grow their Common Service Centre.",
    "img": "/images/csc-manager.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/csc-center-manager-guide.html",
    "live": true
  },
  {
    "title": "Date Difference Calculator Online Free - Days Between Two Dates",
    "excerpt": "Calculate the number of days, months and years between two dates online free. Useful for deadlines, interest and durations. Easy guide for CSC VLEs and students.",
    "img": "/images/date-difference.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/date-difference-calculator-guide.html",
    "live": true
  },
  {
    "title": "File Cover Maker Online Free - Create Professional File Covers",
    "excerpt": "Create professional file and project covers online free with title, name and details. Easy file cover page maker guide for students and CSC VLEs.",
    "img": "/images/cover.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/file-cover-maker-guide.html",
    "live": true
  },
  {
    "title": "GPA and CGPA Calculator Online Free - Calculate Your Grades",
    "excerpt": "Calculate GPA and CGPA online free and convert CGPA to percentage instantly. Easy grade calculator for students, with a step-by-step guide for CSC VLEs.",
    "img": "/images/gpa-cgpa-calculator.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/gpa-cgpa-calculator-guide.html",
    "live": true
  },
  {
    "title": "GST Calculator Online Free - Calculate GST Amount Instantly",
    "excerpt": "Calculate GST online free with inclusive and exclusive options for 5%, 12%, 18% and 28% slabs. Easy GST calculation guide for shop owners and CSC VLEs.",
    "img": "/images/gst.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/gst-calculator-guide.html",
    "live": true
  },
  {
    "title": "Image Compressor Online Free - Reduce Photo Size Without Losing Quality",
    "excerpt": "Compress images online free and reduce JPG and PNG file size without losing quality. Perfect for form uploads and faster websites. Guide for CSC VLEs.",
    "img": "/images/compress-image.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/image-compressor-guide.html",
    "live": true
  },
  {
    "title": "Image Converter Online Free - Convert JPG, PNG, WEBP Easily",
    "excerpt": "Convert images between JPG, PNG, WEBP and more online free without losing quality. Quick image format converter guide for CSC VLEs and students.",
    "img": "/images/converter.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/image-converter-guide.html",
    "live": true
  },
  {
    "title": "Image Cropper Online Free - Crop Photos to Any Size or Ratio",
    "excerpt": "Crop images online free to any size, ratio or shape. Crop photos for documents, social media and forms easily. Step-by-step cropper guide for CSC VLEs.",
    "img": "/images/crop.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/image-cropper-guide.html",
    "live": true
  },
  {
    "title": "Image Resizer Online Free - Resize Photos to Any Pixel or KB",
    "excerpt": "Resize images online free to exact pixels or KB size without losing quality. Resize photos for forms, web and social media. Easy guide for CSC VLEs.",
    "img": "/images/image-resizer.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/image-resizer-guide.html",
    "live": true
  },
  {
    "title": "Image to PDF Converter Online Free - Combine Photos into One PDF",
    "excerpt": "Convert JPG and PNG images to PDF online free. Combine multiple documents and photos into one PDF for government uploads. Step-by-step guide for CSC VLEs.",
    "img": "/images/image-to-pdf.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/image-to-pdf-guide.html",
    "live": true
  },
  {
    "title": "Free Invoice and Bill Generator Online - Create GST Bills Fast",
    "excerpt": "Create professional invoices and bills online free with GST, logo and itemized details. Perfect billing tool for CSC VLEs and small shop owners in India.",
    "img": "/images/invoice-generator.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/invoice-bill-generator-guide.html",
    "live": true
  },
  {
    "title": "Loan EMI Calculator Online Free - Calculate Monthly EMI Easily",
    "excerpt": "Calculate your loan EMI online free for home, car, personal and business loans. See monthly EMI, total interest and payment breakdown. Easy guide for CSC VLEs.",
    "img": "/images/loan-emi.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/loan-emi-calculator-guide.html",
    "live": true
  },
  {
    "title": "Marriage Biodata Maker Online Free - Create a Biodata in Minutes",
    "excerpt": "Create a marriage biodata online free with beautiful templates, personal, family and contact details. Easy marriage biodata maker guide for CSC VLEs.",
    "img": "/images/marital-biodata-maker.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/marriage-biodata-maker-guide.html",
    "live": true
  },
  {
    "title": "Merge PDF Online Free - Combine Multiple PDF Files into One",
    "excerpt": "Merge PDF files online free and combine multiple PDFs into one document in the right order. Quick merge PDF guide for CSC VLEs, students and offices.",
    "img": "/images/merge-pdf.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/merge-pdf-guide.html",
    "live": true
  },
  {
    "title": "Passport Size Photo Maker Online Free - Complete Guide (2026)",
    "excerpt": "Make passport size photos online free with the correct size, white background and DPI for passport, visa, exam and government forms. Step-by-step guide for CSC VLEs.",
    "img": "/images/passport.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/passport-photo-maker-guide.html",
    "live": true
  },
  {
    "title": "Percentage Calculator Online Free - Calculate Percentages Fast",
    "excerpt": "Calculate percentages online free - marks percentage, increase, decrease and percent of a number. Simple percentage calculator guide for students and CSC VLEs.",
    "img": "/images/percentage-cal.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/percentage-calculator-guide.html",
    "live": true
  },
  {
    "title": "Photo Quality Enhancer Online Free - Make Blurry Photos Clear",
    "excerpt": "Enhance photo quality online free and make blurry, low-resolution photos clear and sharp. AI photo enhancer guide for CSC VLEs and students.",
    "img": "/images/enhance-photo.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/photo-quality-enhancer-guide.html",
    "live": true
  },
  {
    "title": "Photo and Signature Joiner Online Free - Combine into One Image",
    "excerpt": "Join photo and signature into one image online free, as required by many exam and government forms. Step-by-step joiner tool guide for CSC VLEs.",
    "img": "/images/photo-name-joiner.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/photo-signature-joiner-guide.html",
    "live": true
  },
  {
    "title": "Photo and Signature Resizer for Exam Forms - Online Free Guide",
    "excerpt": "Resize photo and signature to the exact KB size and dimensions required by exam and government forms like SSC, UPSC, railway and banking. Free tool guide for CSC VLEs.",
    "img": "/images/photo-sign.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/photo-signature-resizer-guide.html",
    "live": true
  },
  {
    "title": "QR Code Generator Online Free - Create UPI and Link QR Codes",
    "excerpt": "Generate QR codes online free for UPI payments, links, text and WhatsApp. Create custom QR codes for your CSC center and shop. Step-by-step guide.",
    "img": "/images/qr.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/qr-code-generator-guide.html",
    "live": true
  },
  {
    "title": "Free Resume Builder Online - Create a Professional CV in Minutes",
    "excerpt": "Build a professional resume online free with ready templates. Create job-winning CVs for students and job seekers in minutes. Complete guide for CSC VLEs.",
    "img": "/images/resume-builder.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/resume-builder-guide.html",
    "live": true
  },
  {
    "title": "Split PDF Online Free - Separate Pages from a PDF File",
    "excerpt": "Split PDF files online free and extract or separate specific pages from a PDF. Quick split PDF guide for CSC VLEs, students and offices.",
    "img": "/images/split.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/split-pdf-guide.html",
    "live": true
  },
  {
    "title": "Word to PDF Converter Online Free - Convert DOC to PDF Easily",
    "excerpt": "Convert Word documents (DOC, DOCX) to PDF online free while keeping the exact formatting. Quick Word to PDF guide for CSC VLEs, students and offices.",
    "img": "/images/Word-to-PDF.webp",
    "date": "Jun 29, 2026",
    "tag": "Tool Guide",
    "url": "/blog/word-to-pdf-guide.html",
    "live": true
  }
];
