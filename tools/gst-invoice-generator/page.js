
// ---- mobile menu ----
var mb=document.getElementById('menuBtn'),mm=document.getElementById('mobileMenu');
if(mb){mb.addEventListener('click',function(){mm.style.display=mm.style.display==='flex'?'none':'flex';});}
document.querySelectorAll('.mobile-menu a').forEach(function(a){a.addEventListener('click',function(){mm.style.display='none';});});

// ---- helpers ----
var $=function(id){return document.getElementById(id);};
function fmt(n,sym){sym=sym||'₹';return sym+' '+(Number(n)||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function fmtDate(v){if(!v)return '—';var d=new Date(v);if(isNaN(d))return '—';return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}

// ---- items state ----
var items=[];
function addItem(desc,qty,rate){items.push({desc:desc||'',qty:qty==null?1:qty,rate:rate==null?0:rate});renderItems();render();}
function renderItems(){
  var w=$('itemsWrap');w.innerHTML='';
  items.forEach(function(it,i){
    var row=document.createElement('div');row.className='item-row';
    var amt=(Number(it.qty)||0)*(Number(it.rate)||0);
    row.innerHTML='<input data-i="'+i+'" data-k="desc" placeholder="Item / service" value="'+esc(it.desc)+'">'+
      '<input data-i="'+i+'" data-k="qty" type="number" min="0" value="'+it.qty+'">'+
      '<input data-i="'+i+'" data-k="rate" type="number" min="0" value="'+it.rate+'">'+
      '<div class="item-amt">'+fmt(amt,$('curSym').value)+'</div>'+
      '<button class="del-item" data-del="'+i+'" aria-label="Remove"><i class="fas fa-xmark"></i></button>';
    w.appendChild(row);
  });
  w.querySelectorAll('input').forEach(function(inp){
    inp.addEventListener('input',function(){
      var i=+inp.getAttribute('data-i'),k=inp.getAttribute('data-k');
      items[i][k]=(k==='desc')?inp.value:parseFloat(inp.value||0);
      var amtEl=inp.parentElement.querySelector('.item-amt');
      if(amtEl)amtEl.textContent=fmt((Number(items[i].qty)||0)*(Number(items[i].rate)||0),$('curSym').value);
      render();
    });
  });
  w.querySelectorAll('[data-del]').forEach(function(b){
    b.addEventListener('click',function(){items.splice(+b.getAttribute('data-del'),1);renderItems();render();});
  });
}

// ---- render invoice preview ----
function render(){
  var sym=$('curSym').value||'₹';
  $('pName').textContent=$('bizName').value||'Your Business';
  var biz=[];if($('bizAddr').value)biz.push($('bizAddr').value);
  if($('bizGst').value)biz.push('GSTIN: '+$('bizGst').value);
  if($('bizPhone').value)biz.push('Ph: '+$('bizPhone').value);
  $('pBiz').textContent=biz.join('\n');
  $('pCustName').textContent=$('custName').value||'Customer';
  var cust=[];if($('custAddr').value)cust.push($('custAddr').value);
  if($('custGst').value)cust.push('GSTIN: '+$('custGst').value);
  if($('custPhone').value)cust.push('Ph: '+$('custPhone').value);
  $('pCust').textContent=cust.join('\n');
  $('pInvNo').textContent=$('invNo').value||'—';
  $('pDate').textContent=fmtDate($('invDate').value);
  $('pDue').textContent=fmtDate($('dueDate').value);
  $('pNotes').textContent=$('invNotes').value||'';

  var tb=$('pItems');tb.innerHTML='';var sub=0;
  items.forEach(function(it,i){
    var amt=(Number(it.qty)||0)*(Number(it.rate)||0);sub+=amt;
    var tr=document.createElement('tr');
    tr.innerHTML='<td>'+(i+1)+'</td><td>'+(esc(it.desc)||'—')+'</td><td class="r">'+(Number(it.qty)||0)+'</td><td class="r">'+fmt(it.rate,sym)+'</td><td class="r">'+fmt(amt,sym)+'</td>';
    tb.appendChild(tr);
  });
  if(!items.length){tb.innerHTML='<tr><td colspan="5" style="text-align:center;color:#aaa;padding:18px">No items added</td></tr>';}

  var disc=parseFloat($('discount').value||0);
  var taxable=Math.max(0,sub-disc);
  var rate=parseFloat($('gstRate').value||0);
  var type=$('gstType').value;
  var taxAmt=taxable*rate/100;
  var grand=taxable+taxAmt;
  $('pTaxBadge').textContent=rate>0?('GST Invoice · '+rate+'%'):'Bill / Cash Memo';

  var t=$('pTotals');var h='';
  h+='<div class="t-row"><span>Subtotal</span><span>'+fmt(sub,sym)+'</span></div>';
  if(disc>0)h+='<div class="t-row"><span>Discount</span><span>- '+fmt(disc,sym)+'</span></div>';
  if(rate>0){
    if(type==='intra'){
      h+='<div class="t-row"><span>CGST @ '+(rate/2)+'%</span><span>'+fmt(taxAmt/2,sym)+'</span></div>';
      h+='<div class="t-row"><span>SGST @ '+(rate/2)+'%</span><span>'+fmt(taxAmt/2,sym)+'</span></div>';
    }else{
      h+='<div class="t-row"><span>IGST @ '+rate+'%</span><span>'+fmt(taxAmt,sym)+'</span></div>';
    }
  }
  h+='<div class="t-row grand"><span>Total</span><span>'+fmt(grand,sym)+'</span></div>';
  t.innerHTML=h;
}

// ---- logo upload ----
$('logoInput').addEventListener('change',function(e){
  var f=e.target.files[0];if(!f)return;
  if(f.size>2*1024*1024){alert('Please upload an image under 2MB.');return;}
  var r=new FileReader();r.onload=function(ev){var img=$('invLogo');img.src=ev.target.result;img.style.display='block';$('logoText').textContent=f.name;};r.readAsDataURL(f);
});

// ---- live bindings ----
['bizName','bizAddr','bizGst','bizPhone','custName','custAddr','custGst','custPhone','invNo','invDate','dueDate','gstRate','gstType','discount','curSym','invNotes'].forEach(function(id){
  var el=$(id);if(el){el.addEventListener('input',function(){if(id==='curSym')renderItems();render();});el.addEventListener('change',render);}
});
$('addItem').addEventListener('click',function(){addItem('',1,0);});

// ---- actions ----
$('printBtn').addEventListener('click',function(){window.print();});
$('pdfBtn').addEventListener('click',function(){
  var el=$('invoice');var prev=el.style.transform;el.style.transform='none';
  var opt={margin:0,filename:($('invNo').value||'invoice')+'.pdf',image:{type:'jpeg',quality:.98},html2canvas:{scale:2,useCORS:true},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}};
  html2pdf().set(opt).from(el).save().then(function(){el.style.transform=prev;}).catch(function(){el.style.transform=prev;});
});
$('resetBtn').addEventListener('click',function(){if(confirm('Reset all fields and items?'))location.reload();});

// ---- init ----
(function(){
  var today=new Date();var due=new Date();due.setDate(due.getDate()+7);
  $('invDate').value=today.toISOString().slice(0,10);
  $('dueDate').value=due.toISOString().slice(0,10);
  addItem('Aadhaar Print & Lamination',2,50);
  addItem('PAN Card Application',1,200);
  addItem('Passport Size Photo (8 copies)',1,80);
})();
