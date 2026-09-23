import {randomBytes,scrypt as scryptCallback,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
export const token=()=>randomBytes(32).toString('base64url');
export const digest=value=>createHash('sha256').update(value).digest('hex');
export function validUsername(value){return typeof value==='string'&&/^[a-zA-Z0-9_]{3,32}$/.test(value)}
export function validPassword(value){return typeof value==='string'&&value.length>=12&&value.length<=128}
export async function passwordHash(password){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});return `${salt}:${key.toString('hex')}`}
export async function verifyPassword(password,hash){const [salt,expected]=hash.split(':');const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});const match=Buffer.from(expected,'hex');return key.length===match.length&&timingSafeEqual(key,match)}
export function generateCodes(){return Array.from({length:8},()=>randomBytes(10).toString('hex').match(/.{1,5}/g).join('-'))}
export const normalizeCode=code=>String(code||'').toLowerCase().replace(/[^a-f0-9]/g,'');
