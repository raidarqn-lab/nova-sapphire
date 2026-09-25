import {eventIcon} from './event-icons.js';
import {serverDate} from './train-clock.js';
// Leadership-confirmed daily server-clock schedule.
export const bloodNightHours=[2,10,18];
export function nextBloodNight(now=new Date()){
 const current=serverDate(now),target=new Date(current);let hour=bloodNightHours.find(h=>h*60+30>current.getUTCHours()*60+current.getUTCMinutes());
 if(hour===undefined){hour=bloodNightHours[0];target.setUTCDate(target.getUTCDate()+1);}
 target.setUTCHours(hour,30,0,0);
 let instant=new Date(now.getTime()+target.getTime()-current.getTime());
 for(let i=0;i<3;i++)instant=new Date(instant.getTime()+target.getTime()-serverDate(instant).getTime());
 instant.setUTCMilliseconds(0);return instant;
}
export function remaining(now=Date.now()){return Math.max(0,Math.ceil((nextBloodNight(new Date(now)).getTime()-now)/1000));}
const labels={en:['Blood Night','Starts in','Approximate start','Server','Your time','Scheduled start reached'],fr:['Nuit de sang','Début dans','Début approximatif','Serveur','Votre heure','Heure de début prévue atteinte'],es:['Noche de sangre','Comienza en','Inicio aproximado','Servidor','Tu hora','Hora de inicio prevista alcanzada'],pt:['Noite de Sangue','Começa em','Início aproximado','Servidor','Sua hora','Horário previsto de início alcançado'],vi:['Đêm Máu','Bắt đầu sau','Giờ bắt đầu dự kiến','Máy chủ','Giờ của bạn','Đã đến giờ bắt đầu dự kiến'],ko:['블러드 나이트','시작까지','예상 시작 시간','서버','내 시간','예정 시작 시간 도달'],de:['Blutnacht','Beginnt in','Ungefährer Beginn','Server','Deine Zeit','Geplanter Beginn erreicht']};
export function bloodNightVisible(){return true;}
function format(date,lang,zone){return new Intl.DateTimeFormat(lang,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',...(zone?{timeZone:zone}:{timeZoneName:'short'})}).format(date);}
export function bloodNightTicker(lang='en'){
 if(!bloodNightVisible())return '';const l=labels[lang]||labels.en;
 return `${eventIcon('bloodNight')}<strong>${l[0]}</strong><span>${l[1]} <b data-blood-count></b></span><span>${l[3]} · ${format(serverDate(nextBloodNight()),lang,'UTC')}</span>`;
}
export function updateBloodNightCounts(){const s=remaining(),value=[Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(n=>String(n).padStart(2,'0')).join(':');document.querySelectorAll('[data-blood-count]').forEach(el=>el.textContent=value);}
export function mountBloodNight(lang='en',show=true){
 document.querySelector('#blood-night')?.remove();if(!show||!bloodNightVisible())return;
 const l=labels[lang]||labels.en,card=document.createElement('div');card.id='blood-night';card.dataset.start=nextBloodNight().toISOString();card.className='operation-summary';card.style.cssText='border-bottom:1px solid #365065;padding:4px 0 18px;margin-bottom:18px';
 card.style.display='flex';card.style.alignItems='center';card.style.gap='16px';card.innerHTML=`${eventIcon('bloodNight')}<div style="display:grid;gap:7px"><strong>${l[0]}</strong><span class="badge" style="color:#86e8f3">${l[1]} <b data-blood-count style="font-variant-numeric:tabular-nums"></b></span><small>${l[3]} · ${format(serverDate(nextBloodNight()),lang,'UTC')}</small><small>${l[4]} · ${format(nextBloodNight(),lang)}</small></div>`;
 document.querySelector('[data-upcoming]')?.prepend(card);updateBloodNightCounts();
}
