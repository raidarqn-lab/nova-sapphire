import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),out=new URL('dist/',root);
await mkdir(out,{recursive:true});
await cp(new URL('public/',root),out,{recursive:true});
const indexPath=new URL('index.html',out);
await writeFile(indexPath,(await readFile(indexPath,'utf8')).replaceAll('href="/','href="./').replaceAll('src="/','src="./'));
const appPath=new URL('app.js',out);
let app=(await readFile(appPath,'utf8')).replaceAll('src="/assets/','src="./assets/');
const notices={
 en:'Member sign-in is not available on this public website yet. It needs a separate secure server.',
 fr:'La connexion des membres n’est pas encore disponible sur ce site public. Un serveur sécurisé distinct est nécessaire.',
 es:'El acceso de miembros aún no está disponible en este sitio público. Requiere un servidor seguro independiente.',
 pt:'O acesso de membros ainda não está disponível neste site público. É necessário um servidor seguro separado.',
 vi:'Đăng nhập thành viên chưa có trên trang công khai này. Cần một máy chủ bảo mật riêng.',
 ko:'이 공개 웹사이트에서는 아직 회원 로그인을 사용할 수 없습니다. 별도의 보안 서버가 필요합니다.',
 de:'Die Mitgliederanmeldung ist auf dieser öffentlichen Website noch nicht verfügbar. Dafür ist ein separater sicherer Server erforderlich.'
};
if(!app.includes('function auth(){')||!app.includes('async function session(){'))throw new Error('Authentication entry points changed; review the Pages build.');
app='const pagesNotices='+JSON.stringify(notices)+';
'+app;
app=app.replace('function auth(){',`function auth(){showModal(t('memberArea'),'<p class="modal-copy">'+pagesNotices[lang]+'</p>');return;`);
app=app.replace('async function session(){',"async function session(){return {user:null,csrf:''};");
await writeFile(appPath,app);
await writeFile(new URL('.nojekyll',out),'');
console.log('GitHub Pages site prepared at '+fileURLToPath(out));
