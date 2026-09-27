const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function announcementBanner(items,loaded){
 const slides=items.length?items:[{title:loaded?'You’re all caught up.':'Loading announcements…',body:loaded?'Updates from leadership will appear here.':''}];
 return `<section class="announcement-banner" aria-label="Alliance announcements" aria-roledescription="carousel"><div class="announcement-heading"><span class="eyebrow">PINNED FOR THE TEAM</span><span>ALLIANCE ANNOUNCEMENTS</span></div><div class="announcement-track" tabindex="0" aria-label="Scroll through announcements">${slides.map((item,i)=>`<article class="announcement-slide" role="group" aria-roledescription="slide" aria-label="${i+1} of ${slides.length}"><h1>${escape(item.title)}</h1><p>${escape(item.body)}</p></article>`).join('')}</div><div class="announcement-controls" ${slides.length<2?'hidden':''}><button type="button" data-announcement-step="-1" aria-label="Previous announcement">←</button><span data-announcement-count aria-live="polite">1 / ${slides.length}</span><button type="button" data-announcement-step="1" aria-label="Next announcement">→</button></div></section>`;
}
export function mountAnnouncementBanner(){
 const root=document.querySelector('.announcement-banner');if(!root)return;
 const track=root.querySelector('.announcement-track'),slides=[...track.children],count=root.querySelector('[data-announcement-count]');
 const index=()=>Math.round(track.scrollLeft/track.clientWidth);
 const update=()=>{const i=index();count.textContent=`${i+1} / ${slides.length}`;root.querySelector('[data-announcement-step="-1"]').disabled=i===0;root.querySelector('[data-announcement-step="1"]').disabled=i===slides.length-1;};
 const move=n=>track.scrollTo({left:Math.max(0,Math.min(slides.length-1,index()+n))*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 root.onclick=e=>{const button=e.target.closest('[data-announcement-step]');if(button)move(Number(button.dataset.announcementStep));};
 track.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}};
 track.addEventListener('scroll',update,{passive:true});update();
}
