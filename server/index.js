import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {openDatabase,transaction} from './db.js';
import {token,digest,passwordHash,verifyPassword,validUsername,validPassword,generateCodes,normalizeCode} from './auth.js';
const production=process.env.NODE_ENV==='production';
const port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
const origin=process.env.APP_ORIGIN||`http://localhost:${port}`;
if(production&&(!process.env.APP_ORIGIN||!origin.startsWith('https://')))throw new Error('Production APP_ORIGIN must use HTTPS');
const db=openDatabase();
const publicDir=fileURLToPath(new URL('../public',import.meta.url));
const dummyHash=await passwordHash(token());
const cookieName=production?'__Host-nova':'nova-session';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
function headers(res){res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");if(production)res.setHeader('Strict-Transport-Security','max-age=31536000')}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
function fail(code='invalid',status=400){throw Object.assign(new Error(code),{status})}
function session(req){const cookies=Object.fromEntries((req.headers.cookie||'').split(';').filter(v=>v.includes('=')).map(v=>{const i=v.indexOf('=');return[v.slice(0,i).trim(),v.slice(i+1)]}));const raw=cookies[cookieName];if(!raw)return null;return db.prepare('SELECT s.*,u.username,u.role,u.active FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.hash=? AND s.expires_at>? AND u.active=1').get(digest(raw),Date.now())}
function issueSession(res,id){const raw=token(),csrf=token();db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(digest(raw),id,csrf,Date.now()+7*86400000);res.setHeader('Set-Cookie',`${cookieName}=${raw}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${production?'; Secure':''}`);return csrf}
function replaceCodes(id){const codes=generateCodes();db.prepare('DELETE FROM recovery_codes WHERE user_id=?').run(id);const insert=db.prepare('INSERT INTO recovery_codes VALUES(?,?)');for(const code of codes)insert.run(digest(normalizeCode(code)),id);return codes}
function limited(key,max=12){const now=Date.now();db.prepare('DELETE FROM rate_limits WHERE expires_at < ?').run(now);const current=db.prepare('SELECT * FROM rate_limits WHERE key=?').get(key);if(current?.attempts>=max)fail('rate_limit',429);db.prepare('INSERT INTO rate_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1').run(key,now+15*60000)}
async function body(req){let bytes=0;const chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>8192)fail('invalid',413);chunks.push(chunk)}try{const b=JSON.parse(Buffer.concat(chunks).toString());if(!b||typeof b!=='object'||Array.isArray(b))fail();return b}catch{fail()}}
const server=http.createServer(async(req,res)=>{headers(res);try{
 const url=new URL(req.url,origin);let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{fail()}
 if(pathname.startsWith('/api/')){
  const route=pathname.slice(5),current=session(req);
  if(req.method==='GET'&&route==='session')return json(res,200,{user:current?{username:current.username,role:current.role}:null,csrf:current?.csrf||''});
  if(req.method==='GET'&&route==='health')return json(res,200,{ok:true});
  if(req.method!=='POST')return json(res,405,{error:'method'});
  if(req.headers.origin!==origin)fail('origin',403);
  if(!req.headers['content-type']?.startsWith('application/json'))fail('invalid',415);
  if(req.headers['sec-fetch-site']==='cross-site')fail('origin',403);
  const ip=process.env.TRUST_PROXY==='1'?String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',')[0].trim():req.socket.remoteAddress;
  limited(`ip:${ip}`,80);
  const values=await body(req);
  if(['register','login','recover'].includes(route)){
   if(!validUsername(values.username)||typeof values.password!=='string'||values.password.length>128)fail();
   limited(`auth:${route}:${digest(values.username.toLowerCase())}`,12);
  }
  if(route==='register'){
   if(!validPassword(values.password)||typeof values.invite!=='string'||values.invite.length>128)fail();
   const invitation=db.prepare('SELECT * FROM invitations WHERE hash=? AND used_at IS NULL AND expires_at>?').get(digest(values.invite),Date.now());
   if(!invitation||db.prepare('SELECT id FROM users WHERE username=?').get(values.username))fail();
   const hash=await passwordHash(values.password);
   const result=transaction(db,()=>{const updated=db.prepare('UPDATE invitations SET used_at=? WHERE hash=? AND used_at IS NULL AND expires_at>?').run(Date.now(),invitation.hash,Date.now());if(updated.changes!==1)fail();const id=Number(db.prepare('INSERT INTO users(username,password_hash,role,created_at) VALUES(?,?,?,?)').run(values.username,hash,invitation.role,Date.now()).lastInsertRowid);return{id,codes:replaceCodes(id)}});
   issueSession(res,result.id);return json(res,201,{recoveryCodes:result.codes});
  }
  if(route==='login'){
   const u=db.prepare('SELECT * FROM users WHERE username=?').get(values.username);const ok=await verifyPassword(values.password,u?.password_hash||dummyHash);if(!ok||!u?.active)fail('invalid',401);
   if(current)db.prepare('DELETE FROM sessions WHERE hash=?').run(current.hash);issueSession(res,u.id);return json(res,200,{ok:true});
  }
  if(route==='recover'){
   if(!validPassword(values.password)||typeof values.recoveryCode!=='string'||values.recoveryCode.length>64)fail();
   const u=db.prepare('SELECT * FROM users WHERE username=? AND active=1').get(values.username);const codeHash=digest(normalizeCode(values.recoveryCode));
   if(!u||!db.prepare('SELECT hash FROM recovery_codes WHERE user_id=? AND hash=?').get(u.id,codeHash))fail('invalid',401);
   const hash=await passwordHash(values.password);
   const codes=transaction(db,()=>{if(db.prepare('DELETE FROM recovery_codes WHERE user_id=? AND hash=?').run(u.id,codeHash).changes!==1)fail();db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash,u.id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(u.id);return replaceCodes(u.id)});
   issueSession(res,u.id);return json(res,200,{recoveryCodes:codes});
  }
  if(!current)fail('unauthorized',401);if(req.headers['x-csrf-token']!==current.csrf)fail('csrf',403);
  if(route==='logout'){db.prepare('DELETE FROM sessions WHERE hash=?').run(current.hash);res.setHeader('Set-Cookie',`${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${production?'; Secure':''}`);return json(res,200,{ok:true})}
  if(route==='invitations'){
   if(!['admin','officer'].includes(current.role))fail('forbidden',403);
   limited(`invite:${current.user_id}`,20);const raw=token();db.prepare('INSERT INTO invitations(hash,role,expires_at,created_by) VALUES(?,?,?,?)').run(digest(raw),'member',Date.now()+48*3600000,current.user_id);return json(res,201,{url:`${origin}/?invite=${raw}#members`});
  }
  return json(res,404,{error:'not_found'});
 }
 if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'method'});
 const file=resolve(publicDir,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(publicDir+'/')||!mime[extname(file)])return json(res,404,{error:'not_found'});
 const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)],'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
 }catch(error){if(error.code==='ENOENT')return json(res,404,{error:'not_found'});if(!res.headersSent)json(res,error.status||500,{error:error.status?error.message:'server_error'});else res.end();}});
server.listen(port,host,()=>console.log(`Nova Sapphire running at ${origin}`));
const cleanup=setInterval(()=>db.prepare('DELETE FROM sessions WHERE expires_at<?').run(Date.now()),3600000);cleanup.unref();
function shutdown(){clearInterval(cleanup);server.close(()=>{db.close();process.exit(0)})}process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
