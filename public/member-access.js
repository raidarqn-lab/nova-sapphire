import {bountyConnection} from './nova-bounty-config.js';
const nonce=location.hash.slice(1),portal='https://portal.join1616.com',source=window.opener;
history.replaceState(null,'',location.pathname);
const status=document.getElementById('status');let handled=false;
const fail=()=>status.textContent='Could not complete sign-in. Return to the Alliance Hub and choose Open Member Site again.';
const timeout=setTimeout(fail,30000);
if(!source||!nonce){clearTimeout(timeout);fail();}
else {
 window.addEventListener('message',async event=>{
  if(handled||event.origin!==portal||event.source!==source||event.data?.nonce!==nonce)return;
  if(event.data.type==='nova-member-error'){handled=true;clearTimeout(timeout);fail();return;}
  if(event.data.type!=='nova-member-handoff'||!/^[a-f0-9]{64}$/.test(event.data.ticket||''))return;
  handled=true;
  try{
   const response=await fetch(bountyConnection.endpoint+'?handoff=exchange',{method:'POST',headers:{'Content-Type':'application/json',apikey:bountyConnection.anonKey},body:JSON.stringify({ticket:event.data.ticket}),signal:AbortSignal.timeout(20000)});
   const data=await response.json();if(!response.ok||!/^lm_[a-f0-9]{64}$/.test(data.token||''))throw Error('handoff');
   sessionStorage.setItem('nova-member-session-v1',JSON.stringify({token:data.token,playerName:data.user.playerName,username:data.user.username,playerRef:data.user.playerRef||'',expiresAt:data.expiresAt,signedInAt:Date.now()}));
   window.opener=null;location.replace('./index.html#home');
  }catch{fail();}finally{clearTimeout(timeout);}
 });
 source.postMessage({type:'nova-member-ready',nonce},portal);
}
