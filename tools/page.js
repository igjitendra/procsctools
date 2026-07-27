
// ===== SECURITY SYSTEM =====
(function() {
  // 1. Disable Right Click
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showSecurityAlert();
    return false;
  });

  // 2. Disable Text Selection
  document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
  });

  // 3. Disable Copy (Ctrl+C)
  document.addEventListener('copy', function(e) {
    e.preventDefault();
    showSecurityAlert();
    return false;
  });

  // 4. Disable Cut
  document.addEventListener('cut', function(e) {
    e.preventDefault();
    return false;
  });

  // 5. Disable keyboard shortcuts: Ctrl+U (View Source), Ctrl+S (Save), Ctrl+A (Select All)
  document.addEventListener('keydown', function(e) {
    // Ctrl+U / Cmd+U — View Source
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      showSecurityAlert();
      return false;
    }
    // Ctrl+S / Cmd+S — Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      showSecurityAlert();
      return false;
    }
    // Ctrl+A — Select All
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I or F12 — DevTools
    if ((e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        e.key === 'F12') {
      e.preventDefault();
      showSecurityAlert();
      return false;
    }
    // Ctrl+P — Print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      showSecurityAlert();
      return false;
    }
  });

  // 6. Disable drag
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  });

  // 7. CSS-level protection
  var style = document.createElement('style');
  style.innerHTML = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
    }
    input, textarea {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      user-select: text !important;
    }
    img {
      pointer-events: none !important;
      -webkit-user-drag: none !important;
    }
  `;
  document.head.appendChild(style);

  // Security Alert Toast
  var alertShown = false;
  function showSecurityAlert() {
    if (alertShown) return;
    alertShown = true;
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#1e1e2e;color:#fff;padding:14px 24px;border-radius:12px;z-index:99999;font-size:14px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,0.3);display:flex;align-items:center;gap:10px;max-width:90vw;';
    toast.innerHTML = '<span style="font-size:18px;">🔒</span> Content is protected. Copying is not allowed.';
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.transition = 'opacity 0.5s';
      toast.style.opacity = '0';
      setTimeout(function() { toast.remove(); alertShown = false; }, 600);
    }, 3000);
  }
})();

// ===== FAKE NOTIFICATION SYSTEM =====
const notifData = [
  { name: "Rahul Sharma",    tool: "Resume Maker",       city: "Lucknow, UP",      avatar: "https://procsctools.in/images/male-avatar.png" },
  { name: "Priya Singh",     tool: "Age Calculator",     city: "Patna, Bihar",     avatar: "https://procsctools.in/images/female-avatar.png" },
  { name: "Amit Kumar",      tool: "PDF Converter",      city: "Delhi",            avatar: "https://procsctools.in/images/male-avatar.png" },
  { name: "Sunita Devi",     tool: "Image Resizer",      city: "Jaipur, Raj.",     avatar: "https://procsctools.in/images/female-avatar.png" },
  { name: "Vikas Yadav",     tool: "QR Code Generator",  city: "Bhopal, MP",       avatar: "https://procsctools.in/images/male-avatar.png" },
  { name: "Neha Gupta",      tool: "CGPA Calculator",    city: "Kanpur, UP",       avatar: "https://procsctools.in/images/female-avatar.png" },
  { name: "Ravi Mishra",     tool: "Loan EMI Calculator",city: "Varanasi, UP",     avatar: "https://procsctools.in/images/male-avatar.png" },
  { name: "Pooja Verma",     tool: "Signature Maker",    city: "Allahabad, UP",    avatar: "https://procsctools.in/images/female-avatar.png" },
  { name: "Sanjay Tiwari",   tool: "Admit Card Manager", city: "Agra, UP",         avatar: "https://procsctools.in/images/male-avatar.png" },
  { name: "Kavita Patel",    tool: "Image Compressor",   city: "Ahmedabad, Guj.",  avatar: "https://procsctools.in/images/female-avatar.png" },
  { name: "Deepak Nagar",    tool: "PDF Merger",         city: "Indore, MP",       avatar: "https://procsctools.in/images/male-avatar.png" },
  { name: "Anita Kumari",    tool: "Date Calculator",    city: "Ranchi, Jharkhand",avatar: "https://procsctools.in/images/female-avatar.png" },
  { name: "Mohit Saxena",    tool: "GST Calculator",     city: "Meerut, UP",       avatar: "https://procsctools.in/images/male-avatar.png" },
  { name: "Rekha Sharma",    tool: "Percentage Calculator",city:"Gorakhpur, UP",   avatar: "https://procsctools.in/images/female-avatar.png" },
  { name: "Suresh Pal",      tool: "Background Remover", city: "Nagpur, Mah.",     avatar: "https://procsctools.in/images/male-avatar.png" }
];

let notifIndex = 0;
let notifTimer = null;

function showNotif() {
  const data = notifData[notifIndex % notifData.length];
  notifIndex++;

  const box = document.getElementById('fakeNotification');
  document.getElementById('notifName').textContent = data.name;
  document.getElementById('notifTool').textContent = data.tool;
  document.getElementById('notifLocation').textContent = '📍 ' + data.city;
  document.getElementById('notifAvatar').src = data.avatar;

  // Reset progress bar
  const prog = document.getElementById('notifProgress');
  prog.style.transition = 'none';
  prog.style.width = '100%';

  // Show
  box.style.transform = 'translateY(0)';
  box.style.opacity = '1';

  // Start progress drain
  setTimeout(() => {
    prog.style.transition = 'width 4000ms linear';
    prog.style.width = '0%';
  }, 50);

  // Auto hide after 4.5s
  clearTimeout(notifTimer);
  notifTimer = setTimeout(hideNotif, 4500);
}

function hideNotif() {
  const box = document.getElementById('fakeNotification');
  box.style.transform = 'translateY(20px)';
  box.style.opacity = '0';

  // Schedule next after random 5–12 seconds
  setTimeout(showNotif, 5000 + Math.random() * 7000);
}

function closeNotif() {
  clearTimeout(notifTimer);
  hideNotif();
}

// Start first notification after 3 seconds
setTimeout(showNotif, 3000);

// ===== YOUTUBE PLAYLIST CLICK HANDLER =====
document.querySelectorAll('.video-card').forEach(function(card) {
  card.addEventListener('click', function() {
    const videoId = this.getAttribute('data-videoid');
    const title = this.getAttribute('data-title');
    const iframe = document.getElementById('mainYoutubeVideo');
    const titleEl = document.getElementById('mainVideoTitle');
    iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1';
    titleEl.textContent = title;
    document.getElementById('videos').scrollIntoView({ behavior: 'smooth' });
  });
});
