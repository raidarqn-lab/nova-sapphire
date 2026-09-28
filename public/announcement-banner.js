import {announcementCopy} from './announcement-copy.js?v=bounty-launch-20260928';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fallbackImage=new URL('./assets/nova-transparent.png',import.meta.url).href;
export const announcementImage=value=>{try{const url=new URL(value);return url.protocol==='https:'?url.href:'';}catch{return '';}};
export function announcementBanner(items,loaded,lang='en'){
 const c=announcementCopy[lang]||announcementCopy.en;
 const slides=items.length?items:[{title:c.welcome,body:c.intro}];
 return `<section class="announcement-banner" aria-label="${escape(c.announcements)}" aria-roledescription="carousel"><div class="announcement-heading"><span class="eyebrow">${escape(c.pinned)}</span><span>${escape(c.announcements)}</span></div><div class="announcement-track" tabindex="0" aria-label="${escape(c.scroll)}">${slides.map((item,i)=>`<article class="announcement-slide ${announcementImage(item.payload?.imageUrl)?'has-artwork':'nova-artwork'}" role="group" aria-roledescription="slide" aria-label="${i+1} of ${slides.length}"><img class="announcement-image" src="${escape(announcementImage(item.payload?.imageUrl)||fallbackImage)}" alt="${escape(item.title?.toLowerCase()==='bounty hunter is here'?c.alt:item.payload?.translations?.[lang]?.imageAlt||item.payload?.imageAlt||'')}" ${i?'loading="lazy"':'fetchpriority="high"'}><div class="announcement-caption"><h1>${escape(item.title?.toLowerCase()==='bounty hunter is here'?c.title:item.payload?.translations?.[lang]?.title||item.title)}</h1><p>${escape(item.title?.toLowerCase()==='bounty hunter is here'?c.body:item.payload?.translations?.[lang]?.body||item.body)}</p>${item.title?.toLowerCase()==='bounty hunter is here'?`<a class="button" href="#bounties" style="margin-top:14px;background:#00cdd9;color:#06242e;padding:11px 18px;display:inline-flex;border-radius:8px;font-weight:700">${escape(c.cta)}</a>`:''}</div></article>`).join('')}</div><div class="announcement-controls" ${slides.length<2?'hidden':''}><button type="button" data-announcement-step="-1" aria-label="${escape(c.previous)}">←</button><span data-announcement-count aria-live="polite">1 / ${slides.length}</span><button type="button" data-announcement-step="1" aria-label="${escape(c.next)}">→</button></div></section>`;
}
export function mountAnnouncementBanner(){
 const root=document.querySelector('.announcement-banner');if(!root)return;
 root.querySelectorAll('.announcement-image').forEach(img=>{img.onerror=()=>{img.onerror=null;img.src=fallbackImage;img.closest('article').classList.remove('has-artwork');img.closest('article').classList.add('nova-artwork');};});
 const track=root.querySelector('.announcement-track'),slides=[...track.children],count=root.querySelector('[data-announcement-count]');
 const index=()=>Math.round(track.scrollLeft/track.clientWidth);
 const update=()=>{const i=index();count.textContent=`${i+1} / ${slides.length}`;root.querySelector('[data-announcement-step="-1"]').disabled=i===0;root.querySelector('[data-announcement-step="1"]').disabled=i===slides.length-1;};
 const move=n=>track.scrollTo({left:Math.max(0,Math.min(slides.length-1,index()+n))*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 root.onclick=e=>{const button=e.target.closest('[data-announcement-step]');if(button)move(Number(button.dataset.announcementStep));};
 track.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}};
 track.addEventListener('scroll',update,{passive:true});update();
}
