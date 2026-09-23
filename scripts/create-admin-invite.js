import {openDatabase} from '../server/db.js';
import {token,digest} from '../server/auth.js';
const db=openDatabase();
if(db.prepare("SELECT id FROM users WHERE role='admin' AND active=1").get()){console.error('An active admin already exists. Use their member page to invite members.');db.close();process.exit(1)}
// Re-running bootstrap invalidates previous, unused admin invitations.
db.prepare("DELETE FROM invitations WHERE role='admin' AND used_at IS NULL").run();
const raw=token();db.prepare('INSERT INTO invitations(hash,role,expires_at) VALUES(?,?,?)').run(digest(raw),'admin',Date.now()+3600000);
console.log(`One-time admin invitation (expires in one hour):\n${process.env.APP_ORIGIN||'http://localhost:4173'}/?invite=${raw}#members`);db.close();
