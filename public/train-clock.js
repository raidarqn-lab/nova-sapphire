// Reset follows Pacific wall time, including daylight saving changes.
export function serverDate(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone:'America/Los_Angeles', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
  return new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour+5,+parts.minute,+parts.second));
}
export function nextReset(now = new Date()) {
  const server = serverDate(now);
  const target = Date.UTC(server.getUTCFullYear(),server.getUTCMonth(),server.getUTCDate()+1);
  let instant = new Date(now.getTime() + target-server.getTime());
  for(let i=0;i<3;i++) instant = new Date(instant.getTime()+target-serverDate(instant).getTime());
  return instant;
}

export function weekKey(now=new Date()){
 const date=serverDate(now);date.setUTCHours(0,0,0,0);date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);return date.toISOString().slice(0,10);
}
export function weekLabel(lang,now=new Date()){
 const start=new Date(weekKey(now)+'T00:00:00Z'),end=new Date(start);end.setUTCDate(end.getUTCDate()+6);
 return new Intl.DateTimeFormat(lang,{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).formatRange(start,end);
}
export const awaiting={en:'Awaiting this week’s update',fr:'En attente de la mise à jour de la semaine',es:'Pendiente de la actualización de esta semana',pt:'Aguardando a atualização desta semana',vi:'Đang chờ cập nhật tuần này',ko:'이번 주 업데이트 대기 중',de:'Aktualisierung für diese Woche ausstehend'};
const weeklyReset={en:'Week resets Sunday, 7:00 p.m. Pacific',fr:'La semaine commence dimanche à 19 h, heure du Pacifique',es:'La semana se reinicia el domingo a las 19:00 del Pacífico',pt:'A semana reinicia domingo às 19h do Pacífico',vi:'Tuần đặt lại lúc 19:00 Chủ nhật, giờ Thái Bình Dương',ko:'주간 초기화: 태평양 시간 일요일 오후 7시',de:'Wochenreset: Sonntag um 19 Uhr Pazifikzeit'};

export const conductors=['D B Z','HappyJann','RaidARQN',null,'미스터MM','Extragenity · R4','COL Geo222 · R4'];
export const conductorWeeks={'2026-09-21':conductors};
let rosterWeek=null;
const rosterNavigation={en:['Previous week','Next week','This week','No saved roster for this week'],fr:['Semaine précédente','Semaine suivante','Cette semaine','Aucun planning enregistré pour cette semaine'],es:['Semana anterior','Semana siguiente','Esta semana','No hay lista guardada para esta semana'],pt:['Semana anterior','Próxima semana','Esta semana','Nenhuma escala salva para esta semana'],vi:['Tuần trước','Tuần sau','Tuần này','Chưa lưu lịch cho tuần này'],ko:['이전 주','다음 주','이번 주','이 주에 저장된 명단이 없습니다'],de:['Vorherige Woche','Nächste Woche','Diese Woche','Kein gespeicherter Plan für diese Woche']};
const copy={
 en:['This week’s conductors','Day','Conductor','Dice competition at reset','Alliance schedule · 21–27 September 2026','Server time','Your time','Next reset · 00:00 server','Reset stays at 7:00 p.m. Pacific.','Trains go to eligible members outside the 14-day cooldown. Contact NikkiH86 about schedule conflicts.'],
 fr:['Les conducteurs de la semaine','Jour','Conducteur','Concours de dés à la réinitialisation','Programme de l’alliance · 21–27 septembre 2026','Heure du serveur','Votre heure','Prochaine réinitialisation · 00:00 serveur','Réinitialisation à 19 h, heure du Pacifique.','Les trains sont attribués aux membres admissibles hors du délai de 14 jours. Contactez NikkiH86 en cas de conflit d’horaire.'],
 es:['Conductores de esta semana','Día','Conductor','Competición de dados al reiniciar','Calendario de la alianza · 21–27 de septiembre de 2026','Hora del servidor','Tu hora','Próximo reinicio · 00:00 del servidor','El reinicio siempre es a las 19:00 del Pacífico.','Los trenes se asignan a miembros elegibles sin el período de espera de 14 días. Contacta con NikkiH86 si tienes conflictos de horario.'],
 pt:['Condutores desta semana','Dia','Condutor','Competição de dados na reinicialização','Agenda da aliança · 21–27 de setembro de 2026','Hora do servidor','Sua hora','Próxima reinicialização · 00:00 do servidor','A reinicialização ocorre sempre às 19h do Pacífico.','Os trens são atribuídos a membros elegíveis fora do intervalo de 14 dias. Fale com NikkiH86 sobre conflitos de horário.'],
 vi:['Người lái tàu tuần này','Ngày','Người lái tàu','Thi xúc xắc khi đặt lại','Lịch liên minh · 21–27 tháng 9 năm 2026','Giờ máy chủ','Giờ của bạn','Lần đặt lại tiếp theo · 00:00 máy chủ','Luôn đặt lại lúc 19:00 theo giờ Thái Bình Dương.','Tàu được trao cho thành viên đủ điều kiện ngoài thời gian chờ 14 ngày. Liên hệ NikkiH86 nếu lịch bị trùng.'],
 ko:['이번 주 열차 차장','요일','차장','초기화 시 주사위 대회','연맹 일정 · 2026년 9월 21–27일','서버 시간','내 시간','다음 초기화 · 서버 00:00','초기화는 항상 태평양 시간 오후 7시입니다.','14일 대기 기간이 지난 자격 있는 멤버에게 열차가 배정됩니다. 일정이 겹치면 NikkiH86에게 문의하세요.'],
 de:['Die Zugführer dieser Woche','Tag','Zugführer','Würfelwettbewerb zum Reset','Allianzplan · 21.–27. September 2026','Serverzeit','Deine Zeit','Nächster Reset · 00:00 Serverzeit','Der Reset ist immer um 19 Uhr Pazifikzeit.','Züge gehen an berechtigte Mitglieder außerhalb der 14-tägigen Wartezeit. Bei Terminkonflikten kontaktiere NikkiH86.']
};
const css=`.world-clock{display:flex;flex-wrap:wrap;gap:18px 32px;padding:16px 20px;margin-bottom:20px;border:1px solid #24455f;border-radius:12px;background:#0c2032}.world-clock small{display:block;color:#a8bfd1;font-size:11px;margin-bottom:3px}.world-clock time{font-variant-numeric:tabular-nums;color:#86f0d0;font-size:20px;font-weight:700}.world-clock .local-zone{font-size:11px;color:#a8bfd1}.reset-clock{margin-left:auto}.reset-clock time{font-size:14px;color:#f4f8fc}.reset-clock p{font-size:11px;color:#a8bfd1;margin:4px 0 0}.roster-controls{display:flex;gap:8px;margin:9px 0}.roster-controls button{border:1px solid #31506a;background:#102437;color:#c8d9e7;border-radius:7px;padding:6px 10px;cursor:pointer}.roster-controls button:disabled{opacity:.35;cursor:default}[data-roster-view=table]{padding:12px}.train-card h2{margin-top:12px;font-size:25px}.conductor-list{list-style:none;padding:0;margin:15px 0 0}.conductor-list li{display:flex;justify-content:space-between;gap:14px;padding:9px 0;border-bottom:1px solid #234053;font-size:12px}.conductor-list li span{color:#a8bfd1}.conductor-list li strong{text-align:right;font-weight:600;overflow-wrap:anywhere}.conductor-list li.today strong{color:#b5dd4a}.roster-date{color:#a8bfd1;font-size:11px;line-height:1.6;margin:12px 0}.train-card .text-link{margin-top:16px}.conductor-table{width:100%;border-collapse:collapse}.conductor-table th,.conductor-table td{text-align:left;padding:15px 20px;border-bottom:1px solid #234053}.conductor-table th{color:#a8bfd1;font-size:12px}.conductor-table td{overflow-wrap:anywhere}@media(max-width:650px){.train-card{display:block!important}.world-clock{gap:14px 24px;padding:14px}.reset-clock{margin-left:0;width:100%}.conductor-table th,.conductor-table td{padding:12px}.conductor-list li{font-size:14px}}`;
let currentLanguage='en';
function moveWeek(key,delta){const d=new Date(key+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+delta*7);return d.toISOString().slice(0,10)}
function rosterContent(lang,table=false){const s=copy[lang],nav=rosterNavigation[lang],current=weekKey(),key=rosterWeek||current,stored=conductorWeeks[key],start=new Date(key+'T00:00:00Z'),end=new Date(start);end.setUTCDate(end.getUTCDate()+6);const label=new Intl.DateTimeFormat(lang,{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).formatRange(start,end);const controls=`<div class="roster-controls"><button data-roster="prev" aria-label="${nav[0]}" ${key<=Object.keys(conductorWeeks).sort()[0]?'disabled':''}>←</button><button data-roster="today">${nav[2]}</button><button data-roster="next" aria-label="${nav[1]}" ${key>=current?'disabled':''}>→</button></div>`;const rows=(stored||[]).map((name,i)=>{const d=new Date(start);d.setUTCDate(d.getUTCDate()+i);return {name:name||s[3],day:new Intl.DateTimeFormat(lang,{weekday:'long',timeZone:'UTC'}).format(d)}});return `<p class="roster-date">${label}</p>${controls}`+(table?`<table class="conductor-table"><thead><tr><th>${s[1]}</th><th>${s[2]}</th></tr></thead><tbody>${rows.length?rows.map(d=>`<tr><td>${d.day}</td><td>${d.name}</td></tr>`).join(''):`<tr><td colspan="2">${nav[3]}</td></tr>`}</tbody></table>`:`<ul class="conductor-list">${rows.length?rows.map(d=>`<li><span>${d.day}</span><strong>${d.name}</strong></li>`).join(''):`<li>${nav[3]}</li>`}</ul>`)}

function tick(){
 const bar=document.querySelector('.world-clock');if(!bar)return;
 const now=new Date(),lang=currentLanguage,zone=Intl.DateTimeFormat().resolvedOptions().timeZone;
 const format=(date,opts)=>new Intl.DateTimeFormat(lang,opts).format(date);
 bar.querySelector('[data-server]').textContent=format(serverDate(now),{timeZone:'UTC',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const local=bar.querySelector('[data-local]');local.textContent=format(now,{hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});local.dateTime=now.toISOString();
 bar.querySelector('.local-zone').textContent=zone.replaceAll('_',' ')+' · '+format(now,{month:'short',day:'numeric'});
 const reset=bar.querySelector('[data-reset]'),next=nextReset(now);reset.textContent=format(next,{weekday:'short',hour:'numeric',minute:'2-digit',timeZoneName:'short'});reset.dateTime=next.toISOString();
}
export function mountTrainClock(lang){
 currentLanguage=lang;const s=copy[lang]||copy.en;
 if(!document.querySelector('#train-clock-styles')){const style=document.createElement('style');style.id='train-clock-styles';style.textContent=css;document.head.append(style)}
 const main=document.querySelector('main');
 main.insertAdjacentHTML('afterbegin',`<section class="world-clock" aria-label="${s[5]}"><div><small>${s[5]}</small><time data-server></time></div><div><small>${s[6]}</small><time data-local></time><div class="local-zone"></div></div><div class="reset-clock"><small>${s[7]}</small><time data-reset></time><p>${s[8]}</p></div></section>`);
 const card=document.querySelector('.train-card');
 if(card){const icon=card.querySelector('svg').outerHTML,eyebrow=card.querySelector('.eyebrow').outerHTML,link=card.querySelector('.text-link').outerHTML;card.innerHTML=icon+eyebrow+`<h2>${s[0]}</h2><div data-roster-view>${rosterContent(lang)}</div>`+link;}
 const table=document.querySelector('.schedule-table');
 if(table){const wrapper=document.createElement('div');wrapper.dataset.rosterView='table';wrapper.innerHTML=rosterContent(lang,true);const panel=table.parentElement;table.replaceWith(wrapper);document.querySelector('.page-heading p').textContent=weekLabel(lang);const note=panel.nextElementSibling;if(note)note.textContent=s[9];}
 // The roster is real; the remainder of the hub still contains clearly labelled examples.
 const detail=main.querySelector(':scope > .preview-detail');if(detail)detail.textContent=s[4]+'. '+detail.textContent;
 const weekly=document.createElement('p');weekly.className='operation-note';weekly.textContent=weeklyReset[lang];document.querySelector('.world-clock').after(weekly);
 tick();
}
if(typeof document!=='undefined'){document.addEventListener('click',e=>{const b=e.target.closest('[data-roster]');if(!b)return;rosterWeek=b.dataset.roster==='today'?null:moveWeek(rosterWeek||weekKey(),b.dataset.roster==='prev'?-1:1);for(const view of document.querySelectorAll('[data-roster-view]'))view.innerHTML=rosterContent(currentLanguage,view.dataset.rosterView==='table');});let lastWeek=weekKey();setInterval(()=>{tick();const week=weekKey();if(week!==lastWeek){lastWeek=week;document.dispatchEvent(new Event('nova:weekchange'));}},1000);}
