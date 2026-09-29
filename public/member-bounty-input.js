import {receiptText} from './bounty-receipt-copy.js?v=receipt-20260928';
import {bountyText} from './bounty-live-copy.js?v=translation-fix-20260928';
// Uses the signed-in account's memory-only token; identity never comes from form fields.
export function mountMemberBountyInput(root,{endpoint,anonKey,getSession,bounty='VSDMON-20260921',gameDate='2026-09-21',bountyTitle='Radar Training',lang='en'}) {
 const tr=s=>receiptText(bountyText(s,lang),lang);
 let files=[],manifest=[],requestId='',batchId='',busy=false,completed=false,disposed=false,urls=[];
 const dateLabel=new Date(gameDate+'T12:00:00Z').toLocaleDateString(lang,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
 root.innerHTML=`<section data-confirmation hidden tabindex="-1" role="status" aria-live="polite" class="bh-submission-confirmation"></section><section class="bh-upload-workspace"><div class="bh-upload-title"><span class="bh-step-number">1</span><div><h3>${tr("Add your screenshots")}</h3><p>${tr("Choose all pages together. PNG or JPG \u00b7 up to 40 images.")}</p></div></div><label class="bh-file-picker"><span class="bh-upload-symbol" aria-hidden="true">↑</span><strong>${tr("Choose screenshots")}</strong><span>${tr("Up to 10 MB each \u00b7 60 MB total")}</span><input aria-label="${tr('Choose leaderboard screenshots')}" type="file" accept="image/png,image/jpeg" multiple></label><p class="bh-selection" data-selection>${tr("No screenshots selected yet.")}</p><div class="bh-upload-previews" data-previews></div></section><footer class="bh-submit-footer"><div class="bh-upload-title"><span class="bh-step-number">2</span><div><h3>${tr("Send to leadership")}</h3><p>${tr("Your account is attached automatically. Points follow approval.")}</p></div></div><p data-status role="status" aria-live="polite"></p><div class="bh-upload-actions"><button class="button" data-send disabled>${tr('Submit for review')} <span aria-hidden="true">→</span></button><button class="button secondary" data-history>${tr("My submissions")}</button></div><small class="bh-private-note">${tr("Screenshots are private and reviewed by your R4s.")}</small></footer><div class="bh-live-receipts" data-receipts></div>`;
 const $=s=>root.querySelector(s),status=s=>{if(disposed)return;const target=completed?$('[data-confirmation-status]'):$('[data-status]');if(target)target.textContent=tr(s);};
 async function call(body){const token=getSession();if(!token)throw Error('Sign in again.');const multipart=body instanceof FormData;const r=await fetch(endpoint,{method:'POST',headers:{apikey:anonKey,'X-Nova-Session':'Bearer '+token,...(!multipart?{'Content-Type':'application/json'}:{})},body:multipart?body:JSON.stringify(body),signal:AbortSignal.timeout(60000)});const data=await r.json();if(!r.ok)throw Error(data.error||'Request failed. Retry with the same selected files.');return data;}
 $('input').onchange=async event=>{
  urls.forEach(URL.revokeObjectURL);urls=[];files=[...event.target.files].sort((a,b)=>a.name.localeCompare(b.name));manifest=[];requestId=crypto.randomUUID();batchId='';$('[data-previews]').replaceChildren();$('[data-send]').disabled=true;
  if(!files.length||files.length>40||files.some(f=>!f.size||f.size>10485760)||files.reduce((n,f)=>n+f.size,0)>62914560){status('Choose 1–40 PNG or JPEG screenshots, under 10 MB each and 60 MB total.');return;}
  $('input').disabled=true;status('Preparing screenshots…');
  try{for(const file of files){const bytes=await file.arrayBuffer();const digest=await crypto.subtle.digest('SHA-256',bytes);manifest.push({name:file.name,bytes:file.size,sha256:[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('')});const img=document.createElement('img');img.src=URL.createObjectURL(file);urls.push(img.src);img.alt=file.name;img.style.cssText='width:100%;height:120px;object-fit:contain';$('[data-previews]').append(img);}$('[data-selection]').textContent=`${files.length} screenshots selected · ${(files.reduce((n,f)=>n+f.size,0)/1048576).toFixed(1)} MB`;status(`Ready to submit for ${dateLabel}.`);$('[data-send]').disabled=false;}catch{status('Could not read your screenshots. Please select them again.');}finally{$('input').disabled=false;}
 };
 function confirmed(receipt,count){
  if(!receipt?.id||!['pending_review','approved'].includes(receipt.state))throw Error('Submission could not be confirmed. Retry with the same selected files.');
  if(disposed)return;completed=true;batchId=receipt.id;
  const panel=$('[data-confirmation]');panel.hidden=false;panel.replaceChildren();
  const mark=document.createElement('span');mark.className='bh-receipt-check';mark.textContent='✓';mark.setAttribute('aria-hidden','true');
  const title=document.createElement('h3');title.textContent=tr('Screenshots submitted');
  const badge=document.createElement('strong');badge.className='bh-receipt-badge';badge.textContent=tr(receipt.state==='approved'?'Approved':'Awaiting R4 review');
  const detail=document.createElement('p');detail.textContent=bountyTitle+' · '+count+' '+tr('screenshots');
  const note=document.createElement('p');note.textContent=tr(receipt.state==='approved'?'Approved':'Your screenshots have been received and saved. Your R4s will review them next.');
  const next=document.createElement('p');next.className='bh-receipt-next';next.textContent=tr('You do not need to submit these screenshots again.');
  const points=document.createElement('small');points.textContent=tr('Bounty points are awarded after approval.');
  const actions=document.createElement('div');actions.className='bh-upload-actions';const done=document.createElement('button');done.type='button';done.className='button';done.textContent=tr('Done');done.onclick=()=>root.closest('dialog')?.close();
  const view=document.createElement('button');view.type='button';view.className='button secondary';view.textContent=tr('My submissions');view.onclick=()=>history().catch(()=>status('Your submission is saved, but the history could not be loaded. You do not need to resubmit.'));
  const feedback=document.createElement('p');feedback.dataset.confirmationStatus='';feedback.setAttribute('role','status');actions.append(done,view);panel.append(mark,title,badge,detail,note,next,points,actions,feedback);
  $('.bh-upload-workspace').hidden=true;$('.bh-submit-footer').hidden=true;panel.focus();panel.scrollIntoView({block:'nearest',behavior:'smooth'});
 }
 $('[data-send]').onclick=async()=>{if(busy||completed)return;busy=true;$('[data-send]').disabled=true;$('input').disabled=true;try{
  const r=await call({action:'reserve',requestId,bounty,files:manifest});batchId=r.id;
  if(['pending_review','approved'].includes(r.state)){confirmed(r,files.length);return;}
  for(let i=0;i<files.length;i++){status(`Uploading screenshot ${i+1} of ${files.length}…`);const form=new FormData();form.set('batchId',batchId);form.set('sequence',String(i+1));form.set('file',files[i]);await call(form);}
  const receipt=await call({action:'commit',batchId});confirmed(receipt,files.length);
 }catch(e){if(!disposed)status(e.message+' Your batch can be retried without creating another receipt.');}finally{busy=false;if(!disposed){$('[data-send]').disabled=completed;$('input').disabled=completed;}}};
 async function history(){const rows=await call({action:'list'});if(disposed)return;const holder=$('[data-receipts]');holder.replaceChildren();if(!rows.length)holder.textContent=tr('No submissions yet.');for(const r of rows){const section=document.createElement('section'),title=document.createElement('h3'),p=document.createElement('p'),stamp=document.createElement('small');const label={pending_review:'Awaiting R4 review',approved:'Approved',rejected:'Not approved',uploading:'Upload in progress',reserved:'Upload in progress'}[r.state]||'Review status';title.textContent=`${r.gameDate} · ${tr(label)}`;p.textContent=`${r.fileCount} ${tr('screenshots')} · ${r.points??0} ${tr('points')}`;stamp.textContent=r.submittedAt?tr('Submitted')+' · '+new Date(r.submittedAt).toLocaleString(lang):'';section.append(title,p,stamp);holder.append(section);}holder.scrollIntoView({block:'nearest',behavior:'smooth'});}
 $('[data-history]').onclick=()=>history().catch(e=>status(e.message));
 return ()=>{disposed=true;urls.forEach(URL.revokeObjectURL);root.replaceChildren();};
}
