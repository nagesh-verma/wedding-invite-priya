const opening=document.querySelector("#openingScreen");
const video=document.querySelector("#openingVideo");
const tap=document.querySelector("#tapHere");
const invitation=document.querySelector("#invitation");
const music=document.querySelector("#music");

if(video){ video.volume = 0.5; }

function startBackgroundMusic(){
  if(!music) return;
  music.volume = 0.55;
  music.loop = true;
  music.muted = false;
  const playPromise = music.play();
  if(playPromise && typeof playPromise.then === "function"){
    playPromise.then(()=>{
      const btn = document.querySelector("#musicBtn");
      if(btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2 h-5 w-5"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><path d="M16 9a5 5 0 0 1 0 6"></path><path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path></svg>';
    }).catch(()=>{
      setTimeout(()=>{
        music.play().catch(()=>{});
      }, 250);
    });
  }
}

function openInvitation(){
  opening.classList.add("fade-out");
  setTimeout(()=>{
    opening.style.display="none";
    invitation.classList.add("open");
    invitation.setAttribute("aria-hidden","false");
    // The card is hidden during the opening video. Size its canvas only once
    // it is visible so the gold scratch layer fills the real card dimensions.
    requestAnimationFrame(setupScratch);
    document.body.style.overflow="auto";
    window.scrollTo({top:0,behavior:"instant"});
    startBackgroundMusic();
    document.querySelectorAll(".reveal").forEach(el=>revealObserver.observe(el));
  },900);
}

tap.addEventListener("click",async(e)=>{
  e.stopPropagation();
  opening.classList.add("playing");
  if(video){ video.volume = 0.2; }
  video.muted=false;
  startBackgroundMusic();
  try{
    await video.play();
    // If the browser blocks unmuted playback, retry muted.
  }catch(err){
    video.muted=true;
    try{await video.play();}catch(e){}
  }
});

opening.addEventListener("click",()=>{
  if(!opening.classList.contains("playing")) tap.click();
});

video.addEventListener("ended",openInvitation);

startBackgroundMusic();
document.addEventListener("pointerdown", startBackgroundMusic, { once: true });
document.addEventListener("touchstart", startBackgroundMusic, { once: true });
document.addEventListener("keydown", startBackgroundMusic, { once: true });

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")});
},{threshold:.12});

// Keep the hero's scroll invitation visible even when its artwork is taller
// than the viewport, then remove it once guests begin exploring the details.
const hero=document.querySelector("#hero");
const scrollCue=document.querySelector(".scroll-cue");
function updateScrollCue(){
  if(!hero || !scrollCue) return;
  scrollCue.classList.toggle("is-hidden", window.scrollY > Math.max(80, hero.offsetHeight - window.innerHeight - 80));
}
updateScrollCue();
window.addEventListener("scroll", updateScrollCue, {passive:true});
const dateSection=document.querySelector("#date");
if(dateSection && scrollCue){
  const scrollCueObserver=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){
      scrollCue.classList.add("is-hidden");
      scrollCueObserver.disconnect();
    }
  },{threshold:.1});
  scrollCueObserver.observe(dateSection);
}

const petals=document.querySelector(".petals");
["🌸","🌼","🍃","✿","❀"].forEach((p,i)=>{
  for(let j=0;j<3;j++){
    const el=document.createElement("span");
    el.className="petal";el.textContent=p;
    el.style.left=(i*20+Math.random()*15)+"%";
    el.style.animationDuration=(13+Math.random()*12)+"s";
    el.style.animationDelay=(-Math.random()*15)+"s";
    el.style.fontSize=(13+Math.random()*13)+"px";
    petals.appendChild(el);
  }
});

const WEDDING=new Date("2026-11-24T00:00:00+05:30");
const pad=n=>String(Math.max(0,n)).padStart(2,"0");
function tick(){
  let diff=Math.max(0,WEDDING-Date.now());
  const s=Math.floor(diff/1000);
  document.querySelector("#days").textContent=pad(Math.floor(s/86400));
  document.querySelector("#hours").textContent=pad(Math.floor(s%86400/3600));
  document.querySelector("#minutes").textContent=pad(Math.floor(s%3600/60));
  document.querySelector("#seconds").textContent=pad(s%60);
}
tick();setInterval(tick,1000);

// Scratch card
const canvas=document.querySelector("#scratchCanvas"),card=document.querySelector("#scratchCard"),ctx=canvas.getContext("2d");
let scratching=false,erased=0,brushRadius=28;
let lastPoint=null, checkTimeout=null;
function setupScratch(){
  const r=card.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.max(1,Math.floor(r.width*d));canvas.height=Math.max(1,Math.floor(r.height*d));ctx.setTransform(d,0,0,d,0,0);
  // Adaptive brush size: larger for touch screens and small viewports
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints>0;
  brushRadius = isTouch ? Math.max(20, Math.round(Math.min(r.width,r.height)/12)) : 28;
  // draw the scratch overlay as a soft gradient to match the gold sheen
  const grad = ctx.createLinearGradient(0,0,r.width,0);
  grad.addColorStop(0,'#cfa670');
  grad.addColorStop(0.5,'#b88f59');
  grad.addColorStop(1,'#a87844');
  ctx.fillStyle = grad; ctx.fillRect(0,0,r.width,r.height);
  // subtle pattern overlay
  ctx.fillStyle="rgba(255,255,255,.06)";
  for(let x=0;x<r.width;x+=28)for(let y=0;y<r.height;y+=28)ctx.fillRect(x,y,10,10);
  ctx.font="600 15px Cinzel";ctx.textAlign="center";ctx.fillStyle="rgba(255,255,255,.92)";
  ctx.fillText("SCRATCH TO REVEAL",r.width/2,r.height/2);
  // disable default touch scrolling while interacting with the canvas
  canvas.style.touchAction = 'none';
}
setupScratch();addEventListener("resize",setupScratch);

function drawLine(x,y){
  if(lastPoint==null){
    lastPoint={x,y};
  }
  ctx.save();
  ctx.globalCompositeOperation='destination-out';
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.strokeStyle='rgba(0,0,0,1)';
  ctx.lineWidth = brushRadius*2;
  ctx.beginPath();
  ctx.moveTo(lastPoint.x,lastPoint.y);
  ctx.lineTo(x,y);
  ctx.stroke();
  // draw end circle to ensure no gaps
  ctx.beginPath();
  ctx.arc(x,y,brushRadius,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
  lastPoint = {x,y};
  // occasionally check reveal progress (throttle)
  if(checkTimeout) clearTimeout(checkTimeout);
  checkTimeout = setTimeout(checkReveal, 250);
}

function checkReveal(){
  try{
    const w = canvas.width, h = canvas.height;
    const img = ctx.getImageData(0,0,w,h).data;
    let transparent=0, total=0, step=4;
    for(let i=3;i<img.length;i+=4*step){ // sample every `step`th pixel
      total++;
      if(img[i]===0) transparent++;
    }
    const pct = transparent/total;
    // A third of the surface feels satisfying on touch devices without making
    // guests tediously clear every corner of the card.
    if(pct>0.32){
      revealCard();
    }
  }catch(e){
    // fallback: if getImageData fails, use erased counter
    if(erased>150) revealCard();
  }
}

function revealCard(){
  if(card.classList.contains('revealed')) return;
  card.classList.add('revealed');
  celebrateReveal();
  canvas.style.transition='opacity .6s ease, transform .6s ease';
  canvas.style.opacity='0';
  canvas.style.transform='scale(1.02)';
  setTimeout(()=>{try{canvas.remove()}catch(e){}},700);
  const overlay = card.querySelector('.pointer-overlay');
  if(overlay) overlay.style.transition='opacity .4s ease';
  setTimeout(()=>{if(overlay) overlay.remove()},800);
}

function celebrateReveal(){
  const burst = card.querySelector('.celebration-burst');
  if(!burst) return;
  const colors = ['#c69c52', '#f6d98d', '#a64b5f', '#fff8e7', '#6d805f'];
  burst.replaceChildren();
  for(let i=0; i<22; i++){
    const piece = document.createElement('i');
    const angle = (360 / 22) * i + (Math.random() * 12 - 6);
    const distance = 72 + Math.random() * 90;
    piece.style.setProperty('--angle', `${angle}deg`);
    piece.style.setProperty('--distance', `${distance}px`);
    piece.style.setProperty('--delay', `${Math.random() * .16}s`);
    piece.style.setProperty('--color', colors[i % colors.length]);
    burst.appendChild(piece);
  }
  burst.classList.remove('is-celebrating');
  void burst.offsetWidth;
  burst.classList.add('is-celebrating');
  setTimeout(()=>burst.replaceChildren(), 1500);

  const screenBurst = document.createElement('div');
  screenBurst.className = 'screen-celebration';
  screenBurst.setAttribute('aria-hidden', 'true');
  for(let i=0; i<68; i++){
    const piece = document.createElement('i');
    const angle = Math.random() * Math.PI * 2;
    const distance = 180 + Math.random() * Math.max(innerWidth, innerHeight) * .42;
    piece.style.setProperty('--start-x', `${25 + Math.random() * 50}vw`);
    piece.style.setProperty('--start-y', `${34 + Math.random() * 28}vh`);
    piece.style.setProperty('--travel-x', `${Math.cos(angle) * distance}px`);
    piece.style.setProperty('--travel-y', `${Math.sin(angle) * distance - 100}px`);
    piece.style.setProperty('--spin', `${180 + Math.random() * 540}deg`);
    piece.style.setProperty('--delay', `${Math.random() * .32}s`);
    piece.style.setProperty('--color', colors[i % colors.length]);
    piece.classList.add(i % 4 === 0 ? 'celebration-flower' : 'celebration-confetti');
    screenBurst.appendChild(piece);
  }
  document.body.appendChild(screenBurst);
  requestAnimationFrame(()=>screenBurst.classList.add('is-celebrating'));
  setTimeout(()=>screenBurst.remove(), 2400);
}

function pos(e){const r=canvas.getBoundingClientRect();
  const clientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
  const clientY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
  return [clientX - r.left, clientY - r.top];
}

canvas.addEventListener('pointerdown', e=>{
  scratching=true; canvas.setPointerCapture(e.pointerId);
  const [x,y]=pos(e); lastPoint=null; drawLine(x,y);
});
canvas.addEventListener('pointermove', e=>{ if(scratching){ const [x,y]=pos(e); drawLine(x,y); } });
canvas.addEventListener('pointerup', ()=>{ scratching=false; lastPoint=null; checkReveal(); });
canvas.addEventListener('pointercancel', ()=>{ scratching=false; lastPoint=null; });

// Music toggle
document.querySelector("#musicBtn").addEventListener("click",async()=>{
  const btn = document.querySelector("#musicBtn");
  try{
    if(music.paused){
      await music.play();
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2 h-5 w-5"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><path d="M16 9a5 5 0 0 1 0 6"></path><path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path></svg>';
    }
    else{
      music.pause();
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-x h-5 w-5"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><line x1="22" x2="16" y1="9" y2="15"></line><line x1="16" x2="22" y1="9" y2="15"></line></svg>';
    }
  }catch(e){}
});

startBackgroundMusic();

// Gallery zoom lightbox
const galleryContainer = document.querySelector("#galleryScroll");
const galleryCards = galleryContainer ? [...galleryContainer.querySelectorAll(".gallery-card")] : [];
const galleryLightbox = document.querySelector("#galleryLightbox");
const galleryZoomImg = document.querySelector("#galleryZoomImg");
const galleryClose = document.querySelector("#galleryClose");

function updateActiveGalleryCard(){
  if(!galleryContainer || !galleryCards.length) return;

  const containerCenter = galleryContainer.getBoundingClientRect().left + galleryContainer.clientWidth / 2;
  let closestCard = galleryCards[0];
  let closestDistance = Number.POSITIVE_INFINITY;

  galleryCards.forEach(card => {
    const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
    const distance = Math.abs(cardCenter - containerCenter);

    if(distance < closestDistance){
      closestDistance = distance;
      closestCard = card;
    }
  });

  galleryCards.forEach(card => {
    card.classList.toggle("is-active", card === closestCard);
  });
}

function openGallery(imageSrc, altText){
  if(!galleryLightbox || !galleryZoomImg) return;
  galleryZoomImg.src = imageSrc;
  galleryZoomImg.alt = altText;
  galleryLightbox.classList.add("is-open");
  galleryLightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeGallery(){
  if(!galleryLightbox) return;
  galleryLightbox.classList.remove("is-open");
  galleryLightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

galleryCards.forEach(card => {
  card.addEventListener("click", () => {
    const imageSrc = card.dataset.image;
    const altText = card.dataset.alt || "Wedding memory";
    openGallery(imageSrc, altText);
    galleryCards.forEach(item => item.classList.toggle("is-active", item === card));
  });
});

galleryClose?.addEventListener("click", closeGallery);
galleryLightbox?.addEventListener("click", e => {
  if(e.target === galleryLightbox) closeGallery();
});
document.addEventListener("keydown", e => {
  if(e.key === "Escape" && galleryLightbox?.classList.contains("is-open")) closeGallery();
});

if(galleryContainer){
  galleryContainer.addEventListener("scroll", updateActiveGalleryCard, { passive: true });
  window.addEventListener("resize", updateActiveGalleryCard);
  requestAnimationFrame(updateActiveGalleryCard);
}

// Wishes are intentionally kept in the page only; connecting this form to a
// database or email service can be added later without changing the layout.
const wishForm = document.querySelector("#wishForm");
if(wishForm){
  wishForm.addEventListener("submit", event => {
    event.preventDefault();
    const name = new FormData(wishForm).get("name");
    const note = document.querySelector("#wishNote");
    if(note) note.textContent = `Thank you, ${name}. Your lovely wish is ready to share!`;
    wishForm.reset();
  });
}

// RSVP demo
const rsvpForm = document.querySelector("#rsvpForm");
if(rsvpForm){
  rsvpForm.addEventListener("submit",e=>{
    e.preventDefault();
    const data=new FormData(e.currentTarget);
    const note = document.querySelector("#rsvpNote");
    if(note) note.textContent=`Thank you, ${data.get("name")}! Your RSVP is ready.`;
  });
}
