import {stagingAuth as config} from './staging-auth-config.js';
const $=s=>document.querySelector(s);
const enabled=config.enabled && typeof config.anonKey==='string' && config.anonKey.startsWith('eyJ') && /^[a-z]{20}$/.test(config.projectRef) && config.origin===location.origin && location.protocol==='https:';
let mode='login',token=''; // Deliberately memory-only; reloading signs this staging UI out.
const status=text=>{$('#status').textContent=text;};
status(enabled?'Staging account service configured.':'Staging login is not connected yet.');
function lock(value){document.querySelectorAll('form input,form button,nav button').forEach(el=>el.disabled=value||!enabled);}
lock(false);
function setMode(value){mode=value;$('#code-label').hidden=mode==='login';$('[name="code"]').required=mode!=='login';$('#submit').textContent=mode==='login'?'Sign in':mode==='register'?'Create password':'Reset password';$('[name="password"]').autocomplete=mode==='login'?'current-password':'new-password';$('#account-form').reset();}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
async function call(action,body={}){
 if(!enabled)throw new Error('Staging login is not connected yet.');
 const response=await fetch(`https://${config.projectRef}.supabase.co/functions/v1/nova-auth`,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.anonKey,Authorization:`Bearer ${config.anonKey}`,...(token?{'X-Nova-Session':`Bearer ${token}`}:{})},body:JSON.stringify({action,...body}),signal:AbortSignal.timeout(20000)});
 const data=await response.json();if(!response.ok)throw new Error(data.error==='try_later'?'Too many attempts. Try again in ten minutes.':'Unable to complete that request. Check your details or contact leadership.');return data;
}
$('#account-form').onsubmit=async event=>{
 event.preventDefault();const values=Object.fromEntries(new FormData(event.target));
 lock(true);status('Working…');
 try{
  const data=await call(mode,{username:values.username,password:values.password,invite:values.code,recoveryCode:values.code});
  event.target.reset();
  if(data.token){token=data.token;const {user}=await call('session');$('#identity').textContent=user.username;$('#player').textContent=`Linked staging player: ${user.playerRef}`;$('#member').hidden=false;$('#account-form').hidden=true;$('nav').hidden=true;status('Signed in to staging.');}
  else {$('#codes code').textContent=data.recoveryCodes[0];$('#codes').hidden=false;$('#account-form').hidden=true;$('nav').hidden=true;status('Password saved. Save your backup code before continuing.');}
 }catch(error){status(error.message);}finally{lock(false);}
};
$('#saved').onclick=()=>{$('#codes code').textContent='';$('#codes').hidden=true;$('#account-form').hidden=false;$('nav').hidden=false;setMode('login');status('Sign in with your new password.');};
$('#logout').onclick=async()=>{try{await call('logout');token='';$('#member').hidden=true;$('#identity').textContent='';$('#player').textContent='';$('#account-form').hidden=false;$('nav').hidden=false;status('Signed out.');}catch(error){status(error.message);}};
