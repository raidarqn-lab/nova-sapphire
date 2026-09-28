const pages={home:'index.html',events:'events.html',shop:'shop.html',rankings:'hall-of-fame.html',announcements:'announcements.html',bounties:'bounties.html',members:'members.html'};
const aliases={guides:'announcements',captures:'events'};
export function currentSection(){const hash=location.hash.slice(1);if(pages[hash]||aliases[hash])return aliases[hash]||hash;return Object.entries(pages).find(([,file])=>file===location.pathname.split('/').pop())?.[0]||'home';}
export function sectionUrl(section){return new URL(pages[aliases[section]||section]||pages.home,new URL('.',location.href));}
export function linkMemberPages(){document.querySelectorAll('a[href^="#"]').forEach(a=>{const key=a.getAttribute('href').slice(1);if(pages[key]||aliases[key])a.href=sectionUrl(key).href;});}
export function mountMemberRoutes(navigate){
 document.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target||a.hasAttribute('download'))return;const u=new URL(a.href),section=Object.entries(pages).find(([,file])=>u.pathname===new URL(file,new URL('.',location.href)).pathname)?.[0];if(u.origin!==location.origin||!section||u.hash)return;event.preventDefault();history.pushState(null,'',u);navigate(section);});
 window.addEventListener('popstate',()=>navigate(currentSection()));
}
