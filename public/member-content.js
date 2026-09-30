import {getMemberToken} from './member-session.js';
import {bountyConnection} from './nova-bounty-config.js';

const contentRequests=new Map();
export function loadPublishedAllianceContent(){
 const token=getMemberToken();if(!token)return Promise.resolve([]);
 if(contentRequests.has(token))return contentRequests.get(token);
 const request=fetchPublishedContent().finally(()=>contentRequests.delete(token));contentRequests.set(token,request);return request;
}
async function fetchPublishedContent(){
 const token=getMemberToken();if(!token)return [];
 const response=await fetch(bountyConnection.endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:bountyConnection.anonKey,'X-Nova-Session':`Bearer ${token}`},body:JSON.stringify({action:'member-content'}),signal:AbortSignal.timeout(60000)});
 const data=await response.json().catch(()=>({}));if(!response.ok)throw Error(data.error||'Alliance content is unavailable.');return Array.isArray(data)?data:[];
}

export async function loadMemberLeaderboards(){
 const token=getMemberToken();if(!token)return {alliance:'NvSP',periods:[]};
 const response=await fetch(bountyConnection.endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:bountyConnection.anonKey,'X-Nova-Session':`Bearer ${token}`},body:JSON.stringify({action:'member-leaderboards'}),signal:AbortSignal.timeout(60000)});
 const data=await response.json().catch(()=>({}));if(!response.ok)throw Error(data.error||'Alliance scores are unavailable.');return {alliance:'NvSP',periods:Array.isArray(data.periods)?data.periods:[]};
}

