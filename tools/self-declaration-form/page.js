
  const $=id=>document.getElementById(id);
  const LS_KEY='swaghoshna_pro_v2';
  let LANG='hi';

  /* ---- language ---- */
  function setLang(l){
    LANG=l;
    document.documentElement.lang=l;
    document.querySelectorAll('[data-hi]').forEach(el=>{
      const v=el.getAttribute('data-'+l);
      if(v!==null) el.innerHTML=v;
    });
    $('langHi').classList.toggle('active',l==='hi');
    $('langEn').classList.toggle('active',l==='en');
    $('doc').classList.toggle('en',l==='en');
    // english: hide the '/ करती' & '/ होऊँगी' separators+alt (english has single word)
    document.querySelectorAll('[data-decl="sep"],[data-liab="sep"]').forEach(e=>e.style.display=(l==='en')?'none':'inline');
    document.querySelectorAll('[data-g="f"][data-decl],[data-g="f"][data-liab]').forEach(e=>e.style.display=(l==='en')?'none':'inline');
    // english decl word (करता/करती) not needed -> hide male decl word too in english (verb folded into sentence)
    document.querySelectorAll('[data-g="m"][data-decl]').forEach(e=>e.style.display=(l==='en')?'none':'inline');
    refreshGender();
    save();
  }

  /* ---- live text ---- */
  function bind(inputId,outId){
    const inp=$(inputId),out=$(outId);
    const upd=()=>{out.textContent=inp.value.trim();hand(out);};
    inp.addEventListener('input',upd);upd();
  }
  bind('name','o_name');bind('guardian','o_guardian');bind('age','o_age');
  bind('occupation','o_occupation');bind('address','o_address');bind('place','o_place');
  $('name').addEventListener('input',()=>{$('o_name2').textContent=$('name').value.trim();hand($('o_name2'));});
  $('date').addEventListener('input',()=>{const v=$('date').value,o=$('o_date');if(v){const[y,m,d]=v.split('-');o.textContent=d+'/'+m+'/'+y;}else o.textContent='';hand(o);});

  /* ---- relation circle ---- */
  function refreshRel(){
    const val=document.querySelector('input[name=rel]:checked').value;
    document.querySelectorAll('.opt[data-rel]').forEach(o=>o.classList.toggle('sel',o.dataset.rel===val));
  }
  document.querySelectorAll('input[name=rel]').forEach(r=>r.addEventListener('change',()=>{refreshRel();save();}));
  document.querySelectorAll('.opt[data-rel]').forEach(o=>o.addEventListener('click',()=>{document.querySelector('input[name=rel][value="'+o.dataset.rel+'"]').checked=true;refreshRel();save();}));

  /* ---- gender circle (decl + liability) ---- */
  function refreshGender(){
    const g=document.querySelector('input[name=gender]:checked').value;
    document.querySelectorAll('.opt[data-g]').forEach(o=>o.classList.toggle('sel',o.dataset.g===g));
  }
  document.querySelectorAll('input[name=gender]').forEach(r=>r.addEventListener('change',()=>{refreshGender();save();}));
  document.querySelectorAll('.opt[data-g]').forEach(o=>o.addEventListener('click',()=>{document.querySelector('input[name=gender][value="'+o.dataset.g+'"]').checked=true;refreshGender();save();}));

  /* ---- handwriting jitter ---- */
  function hand(el){
    if(!el.textContent){el.style.transform='none';return;}
    if(!el.dataset.rot){el.dataset.rot=(Math.random()*2.6-1.3).toFixed(2);}
    el.style.transform='rotate('+el.dataset.rot+'deg)';
  }

  /* ---- tabs ---- */
  document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');$('pane-'+b.dataset.tab).classList.add('active');
  }));

  /* ---- signature draw ---- */
  const canvas=$('sigCanvas'),ctx=canvas.getContext('2d');
  let drawing=false,hasInk=false,last=null;
  function fit(){const r=canvas.getBoundingClientRect();const dpr=window.devicePixelRatio||1;const d=hasInk?canvas.toDataURL():null;canvas.width=r.width*dpr;canvas.height=r.height*dpr;ctx.scale(dpr,dpr);ctx.lineWidth=2.2;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#0b1e3a';if(d){const i=new Image();i.onload=()=>ctx.drawImage(i,0,0,r.width,r.height);i.src=d;}}
  setTimeout(fit,60);window.addEventListener('resize',()=>setTimeout(fit,120));
  function pos(e){const r=canvas.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top};}
  function st(e){e.preventDefault();drawing=true;last=pos(e);$('sigHint').style.display='none';}
  function mv(e){if(!drawing)return;e.preventDefault();const p=pos(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;hasInk=true;}
  function en(){drawing=false;}
  canvas.addEventListener('mousedown',st);canvas.addEventListener('mousemove',mv);window.addEventListener('mouseup',en);
  canvas.addEventListener('touchstart',st,{passive:false});canvas.addEventListener('touchmove',mv,{passive:false});canvas.addEventListener('touchend',en);
  $('sigClear').addEventListener('click',()=>{ctx.clearRect(0,0,canvas.width,canvas.height);hasInk=false;$('sigHint').style.display='block';});
  $('sigUse').addEventListener('click',()=>{if(!hasInk){alert(LANG==='hi'?'पहले signature बनाएं।':'Please draw a signature first.');return;}setSig(canvas.toDataURL('image/png'));});

  /* ---- signature upload ---- */
  $('sigFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=ev=>{$('sigThumbImg').src=ev.target.result;$('sigThumb').style.display='flex';setSig(ev.target.result);};rd.readAsDataURL(f);});
  $('sigThumbRemove').addEventListener('click',()=>{$('sigFile').value='';$('sigThumb').style.display='none';$('o_sign_slot').innerHTML='';save();});
  function setSig(u){$('o_sign_slot').innerHTML='<img src="'+u+'" alt="sign"/>';save();}

  /* ---- photo ---- */
  $('photoFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=ev=>{$('photoThumbImg').src=ev.target.result;$('photoThumb').style.display='flex';$('o_photo').src=ev.target.result;$('photoBox').style.display='flex';save();};rd.readAsDataURL(f);});
  $('photoRemove').addEventListener('click',()=>{$('photoFile').value='';$('photoThumb').style.display='none';$('o_photo').src='';$('photoBox').style.display='none';save();});

  /* ---- validate + print ---- */
  const req=[['name','नाम / Name'],['guardian','पिता/पति का नाम / Father-Husband'],['age','उम्र / Age'],['address','निवासी / Address'],['place','स्थान / Place'],['date','दिनांक / Date']];
  $('downloadBtn').addEventListener('click',()=>{
    let miss=[];req.forEach(([id,lbl])=>{const el=$(id);if(!el.value.trim()){miss.push(lbl);el.classList.add('invalid');}else el.classList.remove('invalid');});
    const b=$('errBanner');
    if(miss.length){b.textContent=(LANG==='hi'?'⚠ कृपया भरें: ':'⚠ Please fill: ')+miss.join(', ');b.style.display='block';b.scrollIntoView({behavior:'smooth',block:'center'});return;}
    b.style.display='none';window.print();
  });

  /* ---- reset ---- */
  $('resetBtn').addEventListener('click',()=>{if(!confirm(LANG==='hi'?'सारा data साफ़ करें?':'Clear all data?'))return;localStorage.removeItem(LS_KEY);location.reload();});

  /* ---- autosave ---- */
  const ids=['name','guardian','age','occupation','address','place','date'];
  function save(){const d={lang:LANG};ids.forEach(i=>d[i]=$(i).value);d.rel=document.querySelector('input[name=rel]:checked').value;d.gender=document.querySelector('input[name=gender]:checked').value;const s=$('o_sign_slot').querySelector('img');d.sign=s?s.src:'';d.photo=$('o_photo').src||'';try{localStorage.setItem(LS_KEY,JSON.stringify(d));}catch(e){}}
  ids.forEach(i=>$(i).addEventListener('input',save));
  function load(){let r;try{r=localStorage.getItem(LS_KEY);}catch(e){return;}if(!r)return;let d;try{d=JSON.parse(r);}catch(e){return;}
    ids.forEach(i=>{if(d[i]!=null){$(i).value=d[i];$(i).dispatchEvent(new Event('input'));}});
    if(d.rel){const e=document.querySelector('input[name=rel][value="'+d.rel+'"]');if(e)e.checked=true;}
    if(d.gender){const e=document.querySelector('input[name=gender][value="'+d.gender+'"]');if(e)e.checked=true;}
    if(d.sign){$('o_sign_slot').innerHTML='<img src="'+d.sign+'" alt="sign"/>';$('sigThumbImg').src=d.sign;$('sigThumb').style.display='flex';}
    if(d.photo){$('o_photo').src=d.photo;$('photoBox').style.display='flex';$('photoThumbImg').src=d.photo;$('photoThumb').style.display='flex';}
    if(d.lang)LANG=d.lang;
  }

  /* ---- init ---- */
  load();
  setLang(LANG);
  refreshRel();refreshGender();
  ['o_name','o_guardian','o_age','o_occupation','o_address','o_place','o_date','o_name2'].forEach(id=>hand($(id)));
