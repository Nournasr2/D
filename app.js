const matchData=[
{id:"qara",word:"قَرَأَ",img:"https://images.pexels.com/photos/5303652/pexels-photo-5303652.jpeg?cs=srgb&dl=pexels-tima-miroshnichenko-5303652.jpg&fm=jpg"},
{id:"kataba",word:"كَتَبَ",img:"https://images.pexels.com/photos/8423070/pexels-photo-8423070.jpeg?cs=srgb&dl=pexels-pavel-danilyuk-8423070.jpg&fm=jpg"},
{id:"kharaja",word:"خَرَجَ",img:"https://images.pexels.com/photos/11427198/pexels-photo-11427198.jpeg?cs=srgb&dl=pexels-tkirkgoz-11427198.jpg&fm=jpg"}
];
const choiceData=[
{id:"visit",img:"https://images.pexels.com/photos/7642041/pexels-photo-7642041.jpeg?cs=srgb&dl=pexels-a-darmel-7642041.jpg&fm=jpg",answer:"زَارَ",opts:["زَارَ","رَكَعَ","أَكَلَ"]},
{id:"kneel",img:"https://images.pexels.com/photos/9127659/pexels-photo-9127659.jpeg?cs=srgb&dl=pexels-timur-weber-9127659.jpg&fm=jpg",answer:"رَكَعَ",opts:["أَكَلَ","زَارَ","رَكَعَ"]},
{id:"eat",img:"https://images.pexels.com/photos/4867895/pexels-photo-4867895.jpeg?cs=srgb&dl=pexels-ekaterina-bolovtsova-4867895.jpg&fm=jpg",answer:"أَكَلَ",opts:["رَكَعَ","أَكَلَ","زَارَ"]}
];

const state={connections:{},choices:{},dragging:null,finished:false};
const $=id=>document.getElementById(id);
const ar=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);

function renderMatch(){
 const words=[...matchData].sort(()=>Math.random()-.5);
 const pics=[...matchData].sort(()=>Math.random()-.5);
 $("words").innerHTML=words.map(x=>'<button class="word '+(state.connections[x.id]?"connected":"")+'" data-word="'+x.id+'" type="button">'+x.word+'</button>').join("");
 $("matchImages").innerHTML=pics.map(x=>'<button class="pic '+(Object.values(state.connections).includes(x.id)?"connected":"")+'" data-pic="'+x.id+'" type="button"><img src="'+x.img+'" alt="'+x.word+'"></button>').join("");
 attachDrag(); drawLines(); update();
}

function pointFromEvent(e){
 const r=$("matchBoard").getBoundingClientRect();
 return {x:e.clientX-r.left,y:e.clientY-r.top};
}
function centerOf(el){
 const r=el.getBoundingClientRect(),b=$("matchBoard").getBoundingClientRect();
 return {x:r.left+r.width/2-b.left,y:r.top+r.height/2-b.top};
}

function attachDrag(){
 document.querySelectorAll(".word").forEach(word=>{
  word.addEventListener("pointerdown",e=>{
   e.preventDefault();
   const p=pointFromEvent(e);
   state.dragging={id:word.dataset.word,x:p.x,y:p.y};
   word.classList.add("dragging");
   word.setPointerCapture?.(e.pointerId);
   document.body.style.userSelect="none";
  });
  word.addEventListener("pointermove",e=>{
   if(!state.dragging||state.dragging.id!==word.dataset.word)return;
   const p=pointFromEvent(e);state.dragging.x=p.x;state.dragging.y=p.y;drawLines();
   document.querySelectorAll(".pic").forEach(pic=>pic.classList.remove("drop-target"));
   const target=document.elementFromPoint(e.clientX,e.clientY)?.closest(".pic");
   if(target)target.classList.add("drop-target");
  });
  word.addEventListener("pointerup",e=>dropWord(e,word));
  word.addEventListener("pointercancel",e=>dropWord(e,word));
 });
}

function dropWord(e,word){
 if(!state.dragging)return;
 const target=document.elementFromPoint(e.clientX,e.clientY)?.closest(".pic");
 document.querySelectorAll(".pic").forEach(pic=>pic.classList.remove("drop-target"));
 word.classList.remove("dragging");
 document.body.style.userSelect="";
 if(target){
  state.connections[word.dataset.word]=target.dataset.pic;
  $("matchHint").textContent="تَمَّ وَضْعُ الوَصْلَةِ. يُمْكِنُكَ سَحْبُ الكَلِمَةِ مَرَّةً أُخْرَى لِتَغْيِيرِهَا.";
 }else{
  $("matchHint").textContent="اِسْحَبِ الكَلِمَةَ حَتَّى تُصِلَهَا بِإِحْدَى الصُّوَرِ.";
 }
 state.dragging=null;renderMatch();finish();
}

function drawLines(){
 const svg=$("lines");if(!svg)return;
 const board=$("matchBoard").getBoundingClientRect();
 svg.setAttribute("viewBox","0 0 "+board.width+" "+board.height);svg.innerHTML="";
 Object.entries(state.connections).forEach(([wid,pid])=>{
  const w=document.querySelector('[data-word="'+wid+'"]'),p=document.querySelector('[data-pic="'+pid+'"]');
  if(!w||!p)return;
  const a=centerOf(w),b=centerOf(p),mid=(a.x+b.x)/2;
  const path=document.createElementNS("http://www.w3.org/2000/svg","path");
  path.setAttribute("class","connection-line");
  path.setAttribute("d","M "+a.x+" "+a.y+" C "+mid+" "+a.y+", "+mid+" "+b.y+", "+b.x+" "+b.y);
  svg.appendChild(path);
 });
 if(state.dragging){
  const w=document.querySelector('[data-word="'+state.dragging.id+'"]');
  if(w){
   const a=centerOf(w),b={x:state.dragging.x,y:state.dragging.y},mid=(a.x+b.x)/2;
   const path=document.createElementNS("http://www.w3.org/2000/svg","path");
   path.setAttribute("class","connection-line");
   path.setAttribute("stroke-dasharray","9 7");
   path.setAttribute("d","M "+a.x+" "+a.y+" C "+mid+" "+a.y+", "+mid+" "+b.y+", "+b.x+" "+b.y);
   svg.appendChild(path);
  }
 }
}

function renderChoices(){
 $("questions").innerHTML=choiceData.map((q,i)=>{
  return '<article class="question"><img src="'+q.img+'" alt="صورة السؤال '+ar(i+1)+'"><div class="qno">السُّؤَالُ '+ar(i+1)+'</div><div class="options">'+
  q.opts.map(o=>'<button class="option '+(state.choices[q.id]===o?"selected":"")+'" data-q="'+q.id+'" data-a="'+o+'" type="button">'+o+'</button>').join("")+
  '</div></article>';
 }).join("");
 document.querySelectorAll(".option").forEach(b=>b.onclick=()=>{
  state.choices[b.dataset.q]=b.dataset.a;
  document.querySelectorAll('[data-q="'+b.dataset.q+'"]').forEach(x=>x.classList.remove("selected"));
  b.classList.add("selected");update();finish();
 });
}
function update(){
 $("mcount").textContent=ar(Object.keys(state.connections).length);
 $("ccount").textContent=ar(Object.keys(state.choices).length);
}
function finish(){
 if(Object.keys(state.connections).length===3&&Object.keys(state.choices).length===3&&!state.finished){
  state.finished=true;$("done").classList.add("show");
  setTimeout(()=>$("done").scrollIntoView({behavior:"smooth",block:"center"}),120);
 }
}
function closeModal(){$("modal").classList.remove("show")}

document.querySelectorAll("[data-close]").forEach(x=>x.onclick=closeModal);

$("sendBtn").onclick=()=>{
  $("modal").classList.add("show");
  $("err").textContent="";
  setTimeout(()=>$("phone").focus(),80);
};

function roundRect(ctx,x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
}

function drawArabic(ctx,text,x,y,size,weight="700",align="right"){
  ctx.save();
  ctx.font=`${weight} ${size}px Cairo, Arial, sans-serif`;
  ctx.fillStyle="#18364f";
  ctx.textAlign=align;
  ctx.direction="rtl";
  ctx.fillText(text,x,y);
  ctx.restore();
}

function loadCanvasImage(src){
  return new Promise(resolve=>{
    const img=new Image();
    img.crossOrigin="anonymous";
    img.onload=()=>resolve(img);
    img.onerror=()=>resolve(null);
    img.src=src;
  });
}

function drawPhotoCard(ctx,img,x,y,w,h,label){
  ctx.save();
  roundRect(ctx,x,y,w,h,22);
  ctx.fillStyle="#f4f8fa";ctx.fill();
  ctx.strokeStyle="#dce7ee";ctx.lineWidth=3;ctx.stroke();
  if(img){
    ctx.save();roundRect(ctx,x+7,y+7,w-14,h-14,17);ctx.clip();
    const scale=Math.max((w-14)/img.width,(h-14)/img.height);
    const iw=img.width*scale, ih=img.height*scale;
    ctx.drawImage(img,x+7+(w-14-iw)/2,y+7+(h-14-ih)/2,iw,ih);
    ctx.restore();
  }else{
    drawArabic(ctx,"الصُّورَةُ",x+w/2,y+h/2+9,22,"700","center");
  }
  if(label)drawArabic(ctx,label,x+w-18,y+h-16,18,"800");
  ctx.restore();
}

async function drawAnswerImage(){
  const canvas=$("answerCanvas");
  const W=1400,H=2050;
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext("2d");

  const allImages={};
  await Promise.all([...matchData,...choiceData].map(async item=>{
    allImages[item.id]=await loadCanvasImage(item.img);
  }));

  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,"#f5fbff");bg.addColorStop(1,"#fff7eb");
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

  ctx.fillStyle="#18364f";roundRect(ctx,70,55,W-140,195,35);ctx.fill();
  drawArabic(ctx,"نَشَاطُ كَلِمَاتٍ بِحَرَكَةِ الفَتْحَةِ",W-120,135,48,"800");
  ctx.save();ctx.font="700 24px Cairo,Arial";ctx.fillStyle="#bcd9ea";ctx.textAlign="right";ctx.direction="rtl";
  ctx.fillText("صُورَةُ إِجَابَاتِ الطَّالِبِ",W-120,184);ctx.restore();

  drawArabic(ctx,"١ — التَّوْصِيلُ",W-100,325,34,"800");
  let y=365;
  matchData.forEach((item,i)=>{
    roundRect(ctx,90,y,W-180,245,24);ctx.fillStyle="#fff";ctx.fill();
    ctx.strokeStyle="#dce7ee";ctx.lineWidth=3;ctx.stroke();
    drawArabic(ctx,item.word,W-120,y+62,31,"800");
    const target=state.connections[item.id];
    const targetItem=matchData.find(x=>x.id===target);
    if(targetItem){
      drawPhotoCard(ctx,allImages[targetItem.id],120,y+24,270,195,targetItem.word);
      drawArabic(ctx,"⬅",430,y+135,28,"800","center");
      drawArabic(ctx,"تَوْصِيلَةُ الطَّالِبِ",W-120,y+120,18,"600");
      drawArabic(ctx,targetItem.word,W-120,y+166,28,"800");
    }else{
      drawArabic(ctx,"لَمْ تُحَدَّدْ صُورَةٌ",W-120,y+145,22,"600");
    }
    y+=270;
  });

  drawArabic(ctx,"٢ — اخْتِيَارُ الكَلِمَةِ",W-100,1215,34,"800");
  y=1255;
  choiceData.forEach((q,i)=>{
    roundRect(ctx,90,y,W-180,220,24);ctx.fillStyle="#fff";ctx.fill();
    ctx.strokeStyle="#dce7ee";ctx.lineWidth=3;ctx.stroke();
    drawPhotoCard(ctx,allImages[q.id],120,y+20,255,180,"السُّؤَالُ "+ar(i+1));
    drawArabic(ctx,"السُّؤَالُ "+ar(i+1),W-120,y+55,21,"800");
    drawArabic(ctx,"الاِخْتِيَارُ الَّذِي حَدَّدَهُ الطَّالِبُ",W-120,y+103,18,"600");
    drawArabic(ctx,state.choices[q.id]||"دُونَ إِجَابَة",W-120,y+157,35,"800");
    y+=245;
  });

  ctx.fillStyle="#dce7ee";ctx.fillRect(100,1930,W-200,2);
  drawArabic(ctx,"تَمَّ إِعْدَادُ صُورَةِ الإِجَابَاتِ مِنَ المَوْقِعِ",W/2,1980,20,"600","center");
  return canvas;
}

async function prepareAnswerImage(){
  const phone=$("phone").value.replace(/\D/g,"");
  if(phone.length<8){
    $("err").textContent="اكتب رقم واتساب صحيحًا بصيغة دولية.";
    return;
  }

  const canvas=await drawAnswerImage();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png",0.96));
  const url=URL.createObjectURL(blob);

  const a=document.createElement("a");
  a.href=url;
  a.download="اجابات-النشاط.png";
  a.className="download-image";
  a.textContent="حَفْظُ صُورَةِ الإِجَابَاتِ";
  a.style.display="block";
  a.style.textAlign="center";
  a.style.padding="11px";
  a.style.background="#eef8ff";
  a.style.color="#18364f";
  a.style.fontWeight="800";
  a.style.textDecoration="none";
  a.style.borderRadius="13px";

  const box=$("previewBox");
  const old=box.querySelectorAll(".generated-preview,.download-image,.share-generated");
  old.forEach(x=>x.remove());
  const preview=document.createElement("img");
  preview.className="generated-preview";
  preview.src=url;
  preview.alt="صورة إجابات النشاط";
  preview.style.cssText="display:block;width:100%;max-height:360px;object-fit:contain;margin-top:10px;border-radius:13px;border:1px solid #dce7ed;background:#fff";
  box.appendChild(preview);
  box.appendChild(a);

  $("go").textContent="حَفْظُ الصُّورَةِ ثُمَّ فَتْحُ وَاتْسَاب";
  $("err").innerHTML="تَمَّ تَجْهِيزُ الصُّورَةِ. احْفَظْهَا أَوَّلًا، ثُمَّ افْتَحْ وَاتْسَاب وَأَرْسِلْهَا لِلرَّقْمِ <b dir='ltr'>"+phone+"</b>.";
  $("err").className="share-help";

  // Native share if the browser supports sharing files. Otherwise download and open WhatsApp.
  try{
    const file=new File([blob],"اجابات-النشاط.png",{type:"image/png"});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      const shareButton=document.createElement("button");
      shareButton.textContent="مُشَارَكَةُ الصُّورَةِ";
      shareButton.className="share-generated";shareButton.style.cssText="width:100%;margin-top:8px;border:0;border-radius:13px;padding:12px;background:#18364f;color:#fff;font-weight:800;cursor:pointer";
      shareButton.onclick=async()=>{
        await navigator.share({files:[file],title:"إجابات النشاط"});
      };
      box.appendChild(shareButton);
    }
  }catch(e){}

  // Open WhatsApp chat with the chosen number, but do NOT put the old text answers in the message.
  window.open("https://wa.me/"+phone,"_blank","noopener,noreferrer");
  $("go").textContent="تَمَّ تَجْهِيزُ الصُّورَةِ";
  $("go").disabled=true;
}

$("go").onclick=prepareAnswerImage;
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
window.addEventListener("resize",drawLines);
renderMatch();renderChoices();
