import {stagingAuth} from './staging-auth-config.js';

const storageKey='nova-member-session-v1';

export function getMemberSession(){
 try{const session=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(session?.expiresAt&&Date.parse(session.expiresAt)<=Date.now()){sessionStorage.removeItem(storageKey);return null;}return session;}catch{return null;}
}

export const getMemberToken=()=>getMemberSession()?.token||'';

export async function loginMember(username,password){
 if(!stagingAuth.enabled)throw Error('Member sign-in is not available.');
 const response=await fetch(`https://${stagingAuth.projectRef}.supabase.co/functions/v1/nova-auth`,{
  method:'POST',
  headers:{'Content-Type':'application/json',apikey:stagingAuth.anonKey,Authorization:`Bearer ${stagingAuth.anonKey}`},
  body:JSON.stringify({action:'login',username,password}),
  signal:AbortSignal.timeout(12000)
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok||!data.token)throw Error(response.status===429?'Too many sign-in attempts. Wait ten minutes before trying again.':response.status>=500?'Member sign-in is temporarily unavailable. Please try again shortly.':'Unable to sign in. Check your username and password, or use Reset my password.');
 const session={token:data.token,accountId:data.user?.id||'',username:data.user?.username||data.username||username,playerName:data.user?.playerName||data.playerName||data.player_name||'',playerRef:data.user?.playerRef||'',signedInAt:Date.now()};
 try{sessionStorage.setItem(storageKey,JSON.stringify(session));}catch{throw Error('Your browser could not save the sign-in session. Allow website storage, then try again.');}
 return session;
}

export function logoutMember(){
 try{sessionStorage.removeItem(storageKey);}catch{}
}

