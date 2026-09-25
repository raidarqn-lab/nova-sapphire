import {eventIcon} from './event-icons.js';
import {serverDate} from './train-clock.js';
export const mgExampleStart=new Date('2026-09-25T02:15:00Z'); // Sep 25, 00:15 on the configured server clock.
const labels={en:['MG','Example event','Friday · Total Mobilization','Server','Your time','Stronghold Capture','Zombies','Schedule pending'],fr:['MG','Événement exemple','Vendredi · Mobilisation totale','Serveur','Votre heure','Capture de forteresse','Zombies','Horaire à confirmer'],es:['MG','Evento de ejemplo','Viernes · Movilización total','Servidor','Tu hora','Captura de fortaleza','Zombis','Horario pendiente'],pt:['MG','Evento de exemplo','Sexta · Mobilização total','Servidor','Sua hora','Captura de fortaleza','Zumbis','Horário pendente'],vi:['MG','Sự kiện mẫu','Thứ Sáu · Tổng động viên','Máy chủ','Giờ của bạn','Chiếm pháo đài','Thây ma','Chưa có lịch'],ko:['MG','예시 이벤트','금요일 · 총동원','서버','내 시간','요새 점령','좀비','일정 미정'],de:['MG','Beispieltermin','Freitag · Totale Mobilmachung','Server','Deine Zeit','Festungseroberung','Zombies','Termin noch offen']};
export function mountHorizonEvents(lang='en'){
 document.querySelectorAll('[data-horizon-extra]').forEach(el=>el.remove());const box=document.querySelector('[data-upcoming]');if(!box)return;
 const l=labels[lang]||labels.en,format=(d,zone)=>new Intl.DateTimeFormat(lang,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23',...(zone?{timeZone:zone}:{timeZoneName:'short'})}).format(d);
 const row=(kind,title,details)=>{const el=document.createElement('div');el.dataset.horizonExtra=kind;el.className='operation-summary';el.style.cssText='display:flex;align-items:center;gap:16px';el.innerHTML=`${eventIcon(kind)}<div style="display:grid;gap:7px"><strong>${title}</strong>${details}</div>`;return el;};
 const mg=row('mg',l[0],`<span class="badge">${l[1]}</span><small>${l[2]}</small><small>${l[3]} · ${format(serverDate(mgExampleStart),'UTC')}</small><small>${l[4]} · ${format(mgExampleStart)}</small>`);
 const wolf=box.querySelector('#blood-night');if(wolf)wolf.after(mg);else box.prepend(mg);
 box.append(row('stronghold',l[5],`<small>${l[7]}</small>`),row('zombies',l[6],`<small>${l[7]}</small>`));
}
