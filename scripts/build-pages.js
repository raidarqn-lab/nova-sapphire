import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),out=new URL('dist/',root);
await mkdir(out,{recursive:true});
await cp(new URL('public/',root),out,{recursive:true});
const indexPath=new URL('index.html',out);
await writeFile(indexPath,(await readFile(indexPath,'utf8')).replaceAll('href="/','href="./').replaceAll('src="/','src="./'));
const appPath=new URL('app.js',out);
let app=(await readFile(appPath,'utf8')).replaceAll('src="/assets/','src="./assets/');
// Password sign-in is provided by the deployed Supabase service.
// Keep auth() navigation intact; only the unused local-server session is disabled.
app=app.replace('async function session(){',"async function session(){return {user:null,csrf:''};");
await writeFile(appPath,app);
await writeFile(new URL('.nojekyll',out),'');
console.log('GitHub Pages site prepared at '+fileURLToPath(out));

