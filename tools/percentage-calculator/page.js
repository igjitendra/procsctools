
let currentPercentageType='basic';
let savedCalculations=JSON.parse(localStorage.getItem('savedPercentages')||'[]');
const percentageBtns=document.querySelectorAll('.mode-btn');
const calculateBtn=document.getElementById('calculateBtn');
const resetBtn=document.getElementById('resetBtn');
const saveBtn=document.getElementById('saveCalculation');
const resultsDiv=document.getElementById('results');
const stepList=document.getElementById('stepList');
const resultsContainer=document.getElementById('resultsContainer');
const formulaList=document.getElementById('formulaList');
const examplesList=document.getElementById('examplesList');
const basicInputs=document.getElementById('basicInputs');
const increaseInputs=document.getElementById('increaseInputs');
const decreaseInputs=document.getElementById('decreaseInputs');
const percentageOfInputs=document.getElementById('percentageOfInputs');
const basicViz=document.getElementById('basicViz');
const increaseViz=document.getElementById('increaseViz');
const decreaseViz=document.getElementById('decreaseViz');
const percentageOfViz=document.getElementById('percentageOfViz');
const basicPercentage=document.getElementById('basicPercentage');
const basicNumber=document.getElementById('basicNumber');
const increaseFrom=document.getElementById('increaseFrom');
const increaseTo=document.getElementById('increaseTo');
const decreaseFrom=document.getElementById('decreaseFrom');
const decreaseTo=document.getElementById('decreaseTo');
const partValue=document.getElementById('partValue');
const wholeValue=document.getElementById('wholeValue');
const basicBar=document.getElementById('basicBar');
const basicPercentageLabel=document.getElementById('basicPercentageLabel');
const basicPercentageDisplay=document.getElementById('basicPercentageDisplay');
const basicValueDisplay=document.getElementById('basicValueDisplay');
const originalBar=document.getElementById('originalBar');
const increaseBar=document.getElementById('increaseBar');
const originalValueLabel=document.getElementById('originalValueLabel');
const newValueLabel=document.getElementById('newValueLabel');
const increasePercentageLabel=document.getElementById('increasePercentageLabel');
const originalValue=document.getElementById('originalValue');
const increaseValue=document.getElementById('increaseValue');
const newValue=document.getElementById('newValue');
const decreaseOriginalBar=document.getElementById('decreaseOriginalBar');
const decreaseBar=document.getElementById('decreaseBar');
const decreaseOriginalLabel=document.getElementById('decreaseOriginalLabel');
const decreaseNewLabel=document.getElementById('decreaseNewLabel');
const decreasePercentageLabel=document.getElementById('decreasePercentageLabel');
const decreaseOriginalValue=document.getElementById('decreaseOriginalValue');
const decreaseAmount=document.getElementById('decreaseAmount');
const decreaseNewValue=document.getElementById('decreaseNewValue');
const partBar=document.getElementById('partBar');
const partLabel=document.getElementById('partLabel');
const wholeLabel=document.getElementById('wholeLabel');
const percentageOfLabel=document.getElementById('percentageOfLabel');
const partDisplay=document.getElementById('partDisplay');
const percentageOfDisplay=document.getElementById('percentageOfDisplay');

document.addEventListener('DOMContentLoaded',function(){attachEventListeners();updateInputVisibility();calculate();checkForSavedCalculations();});

function attachEventListeners(){
  percentageBtns.forEach(btn=>{btn.addEventListener('click',function(){switchPercentageType(this.dataset.percentage);});});
  calculateBtn.addEventListener('click',calculate);
  resetBtn.addEventListener('click',resetCalculator);
  saveBtn.addEventListener('click',saveCalculation);
  document.querySelectorAll('input').forEach(input=>input.addEventListener('input',calculate));
  document.addEventListener('keydown',function(e){if(e.ctrlKey&&e.key==='Enter'){calculate();showToast('Calculated!','success');}if(e.key==='Escape'){resetCalculator();}});
  document.getElementById('scrollToTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}

function switchPercentageType(type){
  percentageBtns.forEach(btn=>btn.classList.remove('active'));
  const activeBtn=Array.from(percentageBtns).find(btn=>btn.dataset.percentage===type);
  if(activeBtn)activeBtn.classList.add('active');
  currentPercentageType=type;updateInputVisibility();calculate();
}

function updateInputVisibility(){
  [basicInputs,increaseInputs,decreaseInputs,percentageOfInputs,basicViz,increaseViz,decreaseViz,percentageOfViz].forEach(el=>el.classList.add('hidden'));
  switch(currentPercentageType){
    case 'basic':basicInputs.classList.remove('hidden');basicViz.classList.remove('hidden');break;
    case 'increase':increaseInputs.classList.remove('hidden');increaseViz.classList.remove('hidden');break;
    case 'decrease':decreaseInputs.classList.remove('hidden');decreaseViz.classList.remove('hidden');break;
    case 'percentageOf':percentageOfInputs.classList.remove('hidden');percentageOfViz.classList.remove('hidden');break;
  }
}

function calculateBasic(percentage,number){
  const result=(percentage/100)*number;
  const percentageWidth=Math.min(percentage,100);
  basicBar.style.width=percentageWidth+'%';
  basicBar.querySelector('.bar-label').textContent=percentage+'%';
  basicPercentageLabel.textContent=percentage+'%';
  basicPercentageDisplay.textContent=percentage+'%';
  basicValueDisplay.textContent=result.toFixed(2);
  const steps=[
    'Step 1: Convert '+percentage+'% to decimal: '+percentage+' ÷ 100 = '+(percentage/100).toFixed(4),
    'Step 2: Multiply decimal by '+number+': '+(percentage/100).toFixed(4)+' × '+number+' = '+result.toFixed(2),
    'Result: '+percentage+'% of '+number+' = '+result.toFixed(2)
  ];
  return{results:[{label:'Percentage',value:percentage+'%',color:'text-indigo-600'},{label:'Number',value:number,color:'text-blue-600'},{label:'Result',value:result.toFixed(2),color:'text-green-600'},{label:'Decimal',value:(percentage/100).toFixed(4),color:'text-purple-600'}],steps,formulas:['Formula: X% of Y = (X/100) × Y','Step 1: Convert percentage to decimal: X ÷ 100','Step 2: Multiply decimal by Y'],examples:['💰 Discount: 20% off ₹1500 = ₹300 savings','🍽️ Tip: 15% tip on ₹800 bill = ₹120','📊 Tax: 18% GST on ₹2000 = ₹360','📈 Commission: 5% on ₹10,000 sale = ₹500']};
}

function calculateIncrease(from,to){
  const increase=to-from;const percentage=(increase/from)*100;
  const originalWidth=(from/to)*100;const increaseWidth=100-originalWidth;
  originalBar.style.width=originalWidth+'%';increaseBar.style.width=increaseWidth+'%';
  increaseBar.querySelector('.bar-label').textContent='+'+percentage.toFixed(1)+'%';
  originalValueLabel.textContent=from;newValueLabel.textContent=to;increasePercentageLabel.textContent='+'+percentage.toFixed(1)+'%';
  originalValue.textContent=from;increaseValue.textContent=increase.toFixed(2);newValue.textContent=to;
  const steps=[
    'Step 1: Calculate increase: '+to+' - '+from+' = '+increase.toFixed(2),
    'Step 2: Divide increase by original: '+increase.toFixed(2)+' ÷ '+from+' = '+(increase/from).toFixed(4),
    'Step 3: Convert to percentage: '+(increase/from).toFixed(4)+' × 100 = '+percentage.toFixed(2)+'%',
    'Result: '+percentage.toFixed(2)+'% increase from '+from+' to '+to
  ];
  return{results:[{label:'Original',value:from,color:'text-blue-600'},{label:'New',value:to,color:'text-purple-600'},{label:'Increase',value:increase.toFixed(2),color:'text-green-600'},{label:'Increase %',value:percentage.toFixed(2)+'%',color:'text-indigo-600'}],steps,formulas:['Formula: % Increase = [(New - Original) ÷ Original] × 100','Step 1: Find the difference (New - Original)','Step 2: Divide difference by Original','Step 3: Multiply by 100'],examples:['📈 Salary: ₹50,000 to ₹55,000 = 10% increase','👥 Population: 1,000 to 1,200 = 20% increase','📊 Sales: ₹10,000 to ₹12,500 = 25% increase','🏠 Rent: ₹15,000 to ₹16,500 = 10% increase']};
}

function calculateDecrease(from,to){
  const decrease=from-to;const percentage=(decrease/from)*100;
  const remainingWidth=(to/from)*100;const decreaseWidth=100-remainingWidth;
  decreaseOriginalBar.style.width=remainingWidth+'%';decreaseBar.style.width=decreaseWidth+'%';
  decreaseBar.querySelector('.bar-label').textContent='-'+percentage.toFixed(1)+'%';
  decreaseOriginalLabel.textContent=from;decreaseNewLabel.textContent=to;decreasePercentageLabel.textContent='-'+percentage.toFixed(1)+'%';
  decreaseOriginalValue.textContent=from;decreaseAmount.textContent=decrease.toFixed(2);decreaseNewValue.textContent=to;
  const steps=[
    'Step 1: Calculate decrease: '+from+' - '+to+' = '+decrease.toFixed(2),
    'Step 2: Divide decrease by original: '+decrease.toFixed(2)+' ÷ '+from+' = '+(decrease/from).toFixed(4),
    'Step 3: Convert to percentage: '+(decrease/from).toFixed(4)+' × 100 = '+percentage.toFixed(2)+'%',
    'Result: '+percentage.toFixed(2)+'% decrease from '+from+' to '+to
  ];
  return{results:[{label:'Original',value:from,color:'text-red-600'},{label:'New',value:to,color:'text-purple-600'},{label:'Decrease',value:decrease.toFixed(2),color:'text-gray-600'},{label:'Decrease %',value:percentage.toFixed(2)+'%',color:'text-indigo-600'}],steps,formulas:['Formula: % Decrease = [(Original - New) ÷ Original] × 100','Step 1: Find the decrease (Original - New)','Step 2: Divide decrease by Original','Step 3: Multiply by 100'],examples:['🏷️ Discount: ₹200 to ₹150 = 25% off','⚖️ Weight: 80kg to 72kg = 10% loss','📉 Stock: ₹500 to ₹400 = 20% drop','🌡️ Temperature: 30°C to 24°C = 20% decrease']};
}

function calculatePercentageOf(part,whole){
  const percentage=(part/whole)*100;
  const percentageWidth=Math.min(percentage,100);
  partBar.style.width=percentageWidth+'%';
  partBar.querySelector('.bar-label').textContent=percentage.toFixed(1)+'%';
  partLabel.textContent=part;wholeLabel.textContent=whole;percentageOfLabel.textContent=percentage.toFixed(1)+'%';
  partDisplay.textContent=part;percentageOfDisplay.textContent=percentage.toFixed(2)+'%';
  const steps=[
    'Step 1: Divide part by whole: '+part+' ÷ '+whole+' = '+(part/whole).toFixed(4),
    'Step 2: Convert to percentage: '+(part/whole).toFixed(4)+' × 100 = '+percentage.toFixed(2)+'%',
    'Result: '+part+' is '+percentage.toFixed(2)+'% of '+whole
  ];
  return{results:[{label:'Part',value:part,color:'text-indigo-600'},{label:'Whole',value:whole,color:'text-blue-600'},{label:'Percentage',value:percentage.toFixed(2)+'%',color:'text-green-600'},{label:'Decimal',value:(part/whole).toFixed(4),color:'text-purple-600'}],steps,formulas:['Formula: Percentage = (Part ÷ Whole) × 100','Step 1: Divide part by whole','Step 2: Multiply by 100'],examples:['📝 Test Score: 45 out of 50 = 90%','💰 Budget: ₹300 spent of ₹1000 = 30%','📚 Progress: 75 pages of 300 = 25% complete','👥 Attendance: 45 out of 60 students = 75%']};
}

function calculate(){
  let result;
  switch(currentPercentageType){
    case 'basic':{const perc=parseFloat(basicPercentage.value)||0;const num=parseFloat(basicNumber.value)||0;if(perc<0||num<0){showToast('Please enter positive numbers','error');return;}result=calculateBasic(perc,num);break;}
    case 'increase':{const fromInc=parseFloat(increaseFrom.value)||0;const toInc=parseFloat(increaseTo.value)||0;if(fromInc<=0){showToast('Original value must be greater than 0','error');return;}result=calculateIncrease(fromInc,toInc);break;}
    case 'decrease':{const fromDec=parseFloat(decreaseFrom.value)||0;const toDec=parseFloat(decreaseTo.value)||0;if(fromDec<=0){showToast('Original value must be greater than 0','error');return;}result=calculateDecrease(fromDec,toDec);break;}
    case 'percentageOf':{const part=parseFloat(partValue.value)||0;const whole=parseFloat(wholeValue.value)||0;if(whole<=0){showToast('Whole value must be greater than 0','error');return;}result=calculatePercentageOf(part,whole);break;}
  }
  displayResults(result);
}

function displayResults(result){
  resultsContainer.innerHTML='';
  result.results.forEach(item=>{const d=document.createElement('div');d.className='stat-card';d.innerHTML='<p>'+item.label+'</p><p class="mid '+item.color+'">'+item.value+'</p>';resultsContainer.appendChild(d);});
  stepList.innerHTML='';
  result.steps.forEach((step,i)=>{const d=document.createElement('div');d.className='step-row';d.innerHTML='<span class="step-num">'+(i+1)+'</span><p>'+step+'</p>';stepList.appendChild(d);});
  formulaList.innerHTML='';
  result.formulas.forEach(f=>{const d=document.createElement('div');d.className='formula-box';d.textContent=f;formulaList.appendChild(d);});
  examplesList.innerHTML='';
  result.examples.forEach(ex=>{const d=document.createElement('div');d.className='ex-row';d.innerHTML='<i class="fas fa-circle-check"></i><span>'+ex+'</span>';examplesList.appendChild(d);});
  resultsDiv.classList.remove('hidden');
}

function resetCalculator(){
  basicPercentage.value='20';basicNumber.value='150';increaseFrom.value='100';increaseTo.value='150';decreaseFrom.value='200';decreaseTo.value='150';partValue.value='30';wholeValue.value='150';
  switchPercentageType('basic');showToast('Calculator reset to default values','info');
}

function saveCalculation(){
  const calc={type:currentPercentageType,inputs:{},timestamp:new Date().toISOString(),id:Date.now()};
  switch(currentPercentageType){
    case 'basic':calc.inputs={percentage:basicPercentage.value,number:basicNumber.value};break;
    case 'increase':calc.inputs={from:increaseFrom.value,to:increaseTo.value};break;
    case 'decrease':calc.inputs={from:decreaseFrom.value,to:decreaseTo.value};break;
    case 'percentageOf':calc.inputs={part:partValue.value,whole:wholeValue.value};break;
  }
  savedCalculations.push(calc);
  if(savedCalculations.length>10)savedCalculations=savedCalculations.slice(-10);
  localStorage.setItem('savedPercentages',JSON.stringify(savedCalculations));
  showToast('Calculation saved!','success');
}

function checkForSavedCalculations(){if(savedCalculations.length>0)showToast('You have '+savedCalculations.length+' saved calculations','info');}

function showToast(message,type='info'){
  const c=document.getElementById('toast-container');
  const icons={success:'fa-circle-check',error:'fa-circle-exclamation',info:'fa-circle-info',warning:'fa-triangle-exclamation'};
  const t=document.createElement('div');t.className='pcs-toast '+type;
  t.innerHTML='<i class="fas '+(icons[type]||icons.info)+'"></i><span>'+message+'</span>';
  c.appendChild(t);setTimeout(()=>t.remove(),3000);
}

document.querySelectorAll('.faq-q').forEach(q=>q.addEventListener('click',()=>q.parentElement.classList.toggle('open')));
