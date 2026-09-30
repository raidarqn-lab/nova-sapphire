import {loginMember} from './member-session.js?v=unified-login-20260929';
import {stagingAuth as config} from './staging-auth-config.js';
const $=s=>document.querySelector(s);
const enabled=config.enabled && typeof config.anonKey==='string' && config.anonKey.startsWith('eyJ') && /^[a-z]{20}$/.test(config.projectRef) && [config.origin,'https://nova.join1616.com'].includes(location.origin) && location.protocol==='https:';
let mode='login',token=''; // Deliberately memory-only; session credentials remain private.
const status=text=>{$('#status').textContent=text;};
status(enabled?'Sign in to open the full Nova Sapphire hub.':'Member sign-in is not connected yet.');
function lock(value){document.querySelectorAll('form input,form button,nav button').forEach(el=>el.disabled=value||!enabled);}
lock(false);
document.querySelector('[data-mode=register]').textContent='Set up account';
document.querySelector('[data-mode=recover]').textContent='Reset my password';
const recoveryHelp=document.createElement('div');recoveryHelp.hidden=true;recoveryHelp.innerHTML='<label>Which code do you have?<select id=code-kind><option value=register>Recovery code from leadership</option><option value=recover>My saved backup code</option></select></label><p>Leadership recovery codes expire after one hour and work once. If you do not have a valid code, ask leadership for a new one in Member Admin.</p>';$('#code-label').before(recoveryHelp);
const style=document.createElement('style');style.textContent='main{background:#082532;border:1px solid #28576a;border-radius:22px;color:#e3f4fa}input,select{box-sizing:border-box;background:#05202c;color:#e3f4fa;border:1px solid #487a8d;border-radius:10px;padding:12px;width:100%}nav button{border-radius:10px;padding:10px 14px}nav button[aria-pressed=true],#submit{background:#00ccdb;color:#00242c}#status{padding:12px;border-radius:10px;background:#103645}a{color:#6ce3e4}';document.head.append(style);
function setMode(value){recoveryHelp.hidden=value!=='recover';document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===value)));status(value==='recover'?'Reset your password using a leadership recovery code or your saved backup code.':value==='register'?'Enter your username, setup code and a new password (at least 12 characters).':'Sign in to open the full Nova Sapphire hub.');mode=value;$('#code-label').hidden=mode==='login';$('[name="code"]').required=mode!=='login';$('#submit').textContent=mode==='login'?'Sign in':mode==='register'?'Create password':'Reset password';$('[name="password"]').autocomplete=mode==='login'?'current-password':'new-password';$('#account-form').reset();}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
async function call(action,body={}){
 if(!enabled)throw new Error('Member login is not connected yet.');
 const response=await fetch(`https://${config.projectRef}.supabase.co/functions/v1/nova-auth`,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.anonKey,Authorization:`Bearer ${config.anonKey}`,...(token?{'X-Nova-Session':`Bearer ${token}`}:{})},body:JSON.stringify({action,...body}),signal:AbortSignal.timeout(20000)});
 const data=await response.json();if(!response.ok)throw new Error(data.error==='try_later'?'Too many attempts. Try again in ten minutes.':data.error==='forbidden'?'This website address is not enabled for sign-in. Please contact leadership.':data.error==='unavailable'?'The sign-in service is temporarily unavailable. Please try again shortly.':'The username or code could not be verified. Check the code type. Leadership codes expire after one hour; used or replaced codes no longer work. Ask leadership for a fresh code if needed.');return data;
}
$('#account-form').onsubmit=async event=>{
 event.preventDefault();const values=Object.fromEntries(new FormData(event.target));
 lock(true);status(mode==='login'?'Signing in…':'Saving your new password…');
 try{
  if(mode==='login'){await loginMember(values.username.trim(),values.password);event.target.reset();const requested=new URLSearchParams(location.search).get('returnTo');let target=new URL('./index.html',location.href);try{const next=new URL(requested||'./index.html',location.href);if(next.origin===location.origin&&/\/(index|events|shop|desert-storm|hall-of-fame|announcements|bounties|members)\.html$/.test(next.pathname))target=next;}catch{}location.replace(target.href);return;}
  const action=mode==='recover'?$('#code-kind').value:'register';
  const code=values.code.trim().toLowerCase();
  if(!/^[a-f0-9]{64}$/.test(code))throw Error('Paste the complete 64-character code. Do not include a link or surrounding text.');
  const data=await call(action,{username:values.username.trim(),password:values.password,invite:code,recoveryCode:code});
  event.target.reset();
  $('#codes code').textContent=data.recoveryCodes[0];$('#codes').hidden=false;$('#account-form').hidden=true;$('nav').hidden=true;status('Password saved. Save your backup code before continuing.');
 }catch(error){status(error.name==='TimeoutError'||error.name==='AbortError'?'Sign-in took too long. Please try again. If this continues, contact leadership.':error instanceof TypeError?'Unable to reach member sign-in. Check your connection and try again.':error.message);}finally{lock(false);}
};
$('#saved').onclick=()=>{$('#codes code').textContent='';$('#codes').hidden=true;$('#account-form').hidden=false;$('nav').hidden=false;setMode('login');status('Sign in with your new password.');};

if(enabled)setMode('login');
