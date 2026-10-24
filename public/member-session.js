import {manualAuth as config} from './manual-auth-config.js?v=manual-20261023';
const storageKey='nova-member-session-v1';
export function getMemberSession(){try{const session=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(session?.expiresAt&&Date.parse(session.expiresAt)<=Date.now()){sessionStorage.removeItem(storageKey);return null;}return session;}catch{return null;}}
export const getMemberToken=()=>getMemberSession()?.token||'';
export async function memberAuth(action,body={},token=''){
 const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.anonKey,...(token?{'X-Nova-Session':'Bearer '+token}:{})},body:JSON.stringify({action,...body}),signal:AbortSignal.timeout(25000)});
 const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to sign in. Ask the owner to reset your login.');return result;
}
export async function loginMember(username,password){const data=await memberAuth('login',{username,password});if(!/^[a-f0-9]{64}$/.test(data.token||'')||!(Date.parse(data.expiresAt)>Date.now()))throw Error('Sign-in could not be verified.');const session={token:data.token,accountId:data.user.id,username:data.user.username,playerName:data.user.playerName,playerRef:data.user.playerRef,expiresAt:data.expiresAt,signedInAt:Date.now()};sessionStorage.setItem(storageKey,JSON.stringify(session));return session;}
export function logoutMember(){const current=getMemberSession();try{sessionStorage.removeItem(storageKey);}catch{}if(current?.token&&!current.token.startsWith('lm_'))memberAuth('logout',{},current.token).catch(()=>{});}
