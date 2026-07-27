
// ===== State =====
let photoFile=null, signatureFile=null;
let cropper=null, currentCropType=null;
let borderStyle='solid', borderWidth=3, borderColor='#ab183d', borderRadius=0;
let signatureHeightPercent=40;
let progressInterval=null;

// ===== DOM =====
const photoInput=document.getElementById('photoInput');
const signatureInput=document.getElementById('signatureInput');
const photoFileName=document.getElementById('photoFileName');
const signatureFileName=document.getElementById('signatureFileName');
const photoInfo=document.getElementById('photoInfo');
const signatureInfo=document.getElementById('signatureInfo');
const photoPreview=document.getElementById('photoPreview');
const signaturePreview=document.getElementById('signaturePreview');
const photoPreviewImg=document.getElementById('photoPreviewImg');
const signaturePreviewImg=document.getElementById('signaturePreviewImg');
const cropPhotoBtn=document.getElementById('cropPhotoBtn');
const cropSignatureBtn=document.getElementById('cropSignatureBtn');
const sizeSelect=document.getElementById('sizeSelect');
const sizeSearch=document.getElementById('sizeSearch');
const generateBtn=document.getElementById('generateBtn');
const resultSection=document.getElementById('resultSection');
const resultCanvas=document.getElementById('resultCanvas');
const downloadSection=document.getElementById('downloadSection');
const downloadBtn=document.getElementById('downloadBtn');
const resultEmpty=document.getElementById('resultEmpty');
const progressContainer=document.getElementById('progressContainer');
const progressBar=document.getElementById('progressBar');
const progressPercentage=document.getElementById('progressPercentage');
const cropModal=document.getElementById('cropModal');
const cropImage=document.getElementById('cropImage');
const cropBtn=document.getElementById('cropBtn');
const zoomSlider=document.getElementById('zoomSlider');
const sizeError=document.getElementById('sizeError');
const photoUploadArea=document.getElementById('photoUploadArea');
const signatureUploadArea=document.getElementById('signatureUploadArea');
const borderWidthSlider=document.getElementById('borderWidth');
const borderWidthValue=document.getElementById('borderWidthValue');
const borderColorInput=document.getElementById('borderColor');
const borderColorDisplay=document.getElementById('borderColorDisplay');
const borderRadiusSlider=document.getElementById('borderRadius');
const borderRadiusValue=document.getElementById('borderRadiusValue');
const signatureHeightSlider=document.getElementById('signatureHeight');
const signatureHeightValue=document.getElementById('signatureHeightValue');
const signatureGuide=document.getElementById('signatureGuide');

// ===== Listeners =====
photoInput.addEventListener('change',handlePhotoUpload);
signatureInput.addEventListener('change',handleSignatureUpload);
cropPhotoBtn.addEventListener('click',()=>openCropModal('photo'));
cropSignatureBtn.addEventListener('click',()=>openCropModal('signature'));
generateBtn.addEventListener('click',generateImage);
downloadBtn.addEventListener('click',downloadImage);
cropBtn.addEventListener('click',applyCrop);
zoomSlider.addEventListener('input',handleZoom);
sizeSearch.addEventListener('input',filterSizes);
sizeSelect.addEventListener('change',()=>sizeError.classList.add('hidden'));

[[photoUploadArea,'photo'],[signatureUploadArea,'signature']].forEach(([area,type])=>{
  area.addEventListener('dragover',e=>{e.preventDefault();area.classList.add('dragover');});
  area.addEventListener('dragleave',()=>area.classList.remove('dragover'));
  area.addEventListener('drop',e=>{e.preventDefault();area.classList.remove('dragover');const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/'))handleFile(f,type);});
});

// ===== Border =====
window.selectBorderStyle=function(style){
  borderStyle=style;
  document.querySelectorAll('.border-option').forEach(o=>o.classList.remove('selected'));
  const map={none:'borderNone',solid:'borderSolid',dashed:'borderDashed',dotted:'borderDotted'};
  if(map[style])document.getElementById(map[style]).classList.add('selected');
  const controls=[borderWidthSlider,borderColorInput,borderRadiusSlider];
  controls.forEach(c=>c.disabled=(style==='none'));
};
window.updateBorderPreview=function(){
  borderWidth=borderWidthSlider.value;borderWidthValue.textContent=borderWidth+'px';
  borderColor=borderColorInput.value;borderColorDisplay.style.backgroundColor=borderColor;
  borderRadius=borderRadiusSlider.value;borderRadiusValue.textContent=borderRadius+'px';
};
window.updateSignatureHeight=function(){
  signatureHeightPercent=signatureHeightSlider.value;
  signatureHeightValue.textContent=signatureHeightPercent+'%';
  signatureGuide.style.height=signatureHeightPercent+'%';
};

// ===== Upload =====
function handlePhotoUpload(e){const f=e.target.files[0];if(f)handleFile(f,'photo');}
function handleSignatureUpload(e){const f=e.target.files[0];if(f)handleFile(f,'signature');}
function handleFile(file,type){
  if(!file.type.startsWith('image/')){showToast('Please upload an image file','error');return;}
  if(file.size>5*1024*1024){showToast('File size should be less than 5MB','error');return;}
  const reader=new FileReader();
  reader.onload=ev=>{
    if(type==='photo'){
      photoFile=ev.target.result;photoFileName.textContent=file.name;
      photoInfo.classList.remove('hidden');photoPreview.classList.remove('hidden');
      photoPreviewImg.src=photoFile;cropPhotoBtn.classList.remove('hidden');photoUploadArea.classList.add('hidden');
    }else{
      signatureFile=ev.target.result;signatureFileName.textContent=file.name;
      signatureInfo.classList.remove('hidden');signaturePreview.classList.remove('hidden');
      signaturePreviewImg.src=signatureFile;cropSignatureBtn.classList.remove('hidden');signatureUploadArea.classList.add('hidden');
    }
    showToast((type==='photo'?'Photo':'Signature')+' uploaded successfully','success');
  };
  reader.readAsDataURL(file);
}
window.removePhoto=function(){photoFile=null;photoInfo.classList.add('hidden');photoPreview.classList.add('hidden');cropPhotoBtn.classList.add('hidden');photoUploadArea.classList.remove('hidden');photoInput.value='';showToast('Photo removed','info');};
window.removeSignature=function(){signatureFile=null;signatureInfo.classList.add('hidden');signaturePreview.classList.add('hidden');cropSignatureBtn.classList.add('hidden');signatureUploadArea.classList.remove('hidden');signatureInput.value='';showToast('Signature removed','info');};

// ===== Size search =====
function filterSizes(){
  const q=sizeSearch.value.toLowerCase();
  for(let o of sizeSelect.options){o.style.display=(o.text.toLowerCase().includes(q)||q==='')?'':'none';}
}

// ===== Crop =====
function openCropModal(type){
  currentCropType=type;
  const data=type==='photo'?photoFile:signatureFile;
  if(!data)return;
  cropImage.src=data;
  cropModal.classList.remove('hidden');cropModal.classList.add('flex');
  document.body.style.overflow='hidden';
  setTimeout(()=>{
    if(cropper)cropper.destroy();
    cropper=new Cropper(cropImage,{viewMode:1,dragMode:'move',aspectRatio:NaN,autoCropArea:1,restore:false,guides:true,center:true,highlight:false,cropBoxMovable:true,cropBoxResizable:true,toggleDragModeOnDblclick:false});
    zoomSlider.value=0;
  },100);
}
window.closeCropModal=function(){cropModal.classList.add('hidden');cropModal.classList.remove('flex');document.body.style.overflow='auto';if(cropper){cropper.destroy();cropper=null;}};
function handleZoom(e){if(cropper)cropper.zoomTo(parseFloat(e.target.value));}
function applyCrop(){
  if(!cropper)return;
  const canvas=cropper.getCroppedCanvas({maxWidth:1000,maxHeight:1000,fillColor:'#fff'});
  const img=canvas.toDataURL('image/png');
  if(currentCropType==='photo'){photoFile=img;photoPreviewImg.src=img;}else{signatureFile=img;signaturePreviewImg.src=img;}
  closeCropModal();showToast('Image cropped successfully','success');
}

// ===== Generate =====
function generateImage(){
  if(!photoFile||!signatureFile){showToast('Please upload both photo and signature','error');return;}
  const selected=sizeSelect.value;
  if(!selected){sizeError.classList.remove('hidden');showToast('Please select a size','error');return;}
  sizeError.classList.add('hidden');
  resultEmpty.classList.add('hidden');
  progressContainer.classList.remove('hidden');progressBar.style.width='0%';progressPercentage.textContent='0%';
  const [width,height]=selected.split('x').map(Number);
  const photoImg=new Image(),signatureImg=new Image();let loaded=0;
  function check(){loaded++;if(loaded===2)createCombinedImageWithBorder(photoImg,signatureImg,width,height);}
  photoImg.onload=check;signatureImg.onload=check;
  photoImg.src=photoFile;signatureImg.src=signatureFile;
  let p=0;progressInterval=setInterval(()=>{p+=10;if(p<=90){progressBar.style.width=p+'%';progressPercentage.textContent=p+'%';}},80);
}
function createCombinedImageWithBorder(photoImg,signatureImg,width,height){
  const signatureHeight=Math.floor(height*(signatureHeightPercent/100));
  const photoHeight=height-signatureHeight;
  resultCanvas.width=width;resultCanvas.height=height;
  const ctx=resultCanvas.getContext('2d');
  ctx.fillStyle='white';ctx.fillRect(0,0,width,height);
  ctx.drawImage(photoImg,0,0,width,photoHeight);
  ctx.drawImage(signatureImg,0,photoHeight,width,signatureHeight);
  if(borderStyle!=='none'){
    ctx.save();ctx.strokeStyle=borderColor;ctx.lineWidth=borderWidth;
    if(borderStyle==='dashed')ctx.setLineDash([10,5]);else if(borderStyle==='dotted')ctx.setLineDash([2,4]);
    if(borderRadius>0){
      const r=parseInt(borderRadius);ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(width-r,0);ctx.quadraticCurveTo(width,0,width,r);ctx.lineTo(width,height-r);ctx.quadraticCurveTo(width,height,width-r,height);ctx.lineTo(r,height);ctx.quadraticCurveTo(0,height,0,height-r);ctx.lineTo(0,r);ctx.quadraticCurveTo(0,0,r,0);ctx.closePath();
    }else{ctx.strokeRect(0,0,width,height);}
    ctx.stroke();ctx.restore();
  }
  ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(0,photoHeight);ctx.lineTo(width,photoHeight);ctx.stroke();
  if(progressInterval){clearInterval(progressInterval);progressInterval=null;}
  progressBar.style.width='100%';progressPercentage.textContent='100%';
  setTimeout(()=>progressContainer.classList.add('hidden'),300);
  resultSection.classList.remove('hidden');downloadSection.classList.remove('hidden');
  setTimeout(()=>resultSection.scrollIntoView({behavior:'smooth',block:'nearest'}),120);
  showToast('Joined image generated successfully!','success');
}

// ===== Download =====
function downloadImage(){
  const link=document.createElement('a');
  const ts=new Date().toISOString().slice(0,10);
  const bt=borderStyle!=='none'?('-border-'+borderWidth+'px'):'';
  link.download='photo-signature'+bt+'-'+ts+'.png';
  link.href=resultCanvas.toDataURL('image/png');
  link.click();
  showToast('Download started!','success');
}

// ===== Toast =====
function showToast(message,type='info'){
  const c=document.getElementById('toastContainer');
  const icons={success:'fa-circle-check',error:'fa-circle-exclamation',info:'fa-circle-info',warning:'fa-triangle-exclamation'};
  const t=document.createElement('div');
  t.className='pcs-toast '+type;
  t.innerHTML='<i class="fas '+(icons[type]||icons.info)+'"></i>'+message;
  c.appendChild(t);
  setTimeout(()=>t.remove(),3000);
}

// ===== FAQ accordion =====
document.querySelectorAll('.faq-q').forEach(q=>{q.addEventListener('click',()=>q.parentElement.classList.toggle('open'));});

// ===== Init =====
document.addEventListener('DOMContentLoaded',function(){
  sizeSelect.value='295x360';
  selectBorderStyle('solid');
  updateBorderPreview();
  updateSignatureHeight();
});
