import {stagingAuth} from './staging-auth-config.js';

const storageKey='nova-member-session-v1';

export function getMemberSession(){
 try{return JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch{return null;}
}

export const getMemberToken=()=>getMemberSession()?.token||'';

export async function loginMember(username,password){
 if(!stagingAuth.enabled)throw Error('Member sign-in is not available.');
 const response=await fetch(`https://${stagingAuth.projectRef}.supabase.co/functions/v1/nova-auth`,{
  method:'POST',
  headers:{'Content-Type':'application/json',apikey:stagingAuth.anonKey,Authorization:`Bearer ${stagingAuth.anonKey}`},
  body:JSON.stringify({action:'login',username,password}),
  signal:AbortSignal.timeout(20000)
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok||!data.token)throw Error('Unable to sign in. Check your username and password.');
 const session={token:data.token,username:data.username||username,playerName:data.playerName||data.player_name||'',signedInAt:Date.now()};
 try{sessionStorage.setItem(storageKey,JSON.stringify(session));}catch{}
 return session;
}

export function logoutMember(){
 try{sessionStorage.removeItem(storageKey);}catch{}
}
