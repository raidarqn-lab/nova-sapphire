const copy={
 en:['Good people.','Excellent company.','THE GOOD CREW'],
 fr:['Des gens formidables.','Une excellente compagnie.','UNE BELLE ÉQUIPE'],
 es:['Buena gente.','Excelente compañía.','UN GRAN EQUIPO'],
 pt:['Gente boa.','Excelente companhia.','UMA ÓTIMA EQUIPE'],
 vi:['Những đồng đội tuyệt vời.','Một tập thể đáng quý.','ĐỒNG ĐỘI TUYỆT VỜI'],
 ko:['좋은 사람들.','함께라서 더 좋은 곳.','멋진 우리 팀'],
 de:['Tolle Menschen.','Beste Gesellschaft.','EIN STARKES TEAM']
};
export function clubhouseWelcome(lang){const c=copy[lang]||copy.en;return `<section class="club-welcome"><div class="club-greeting"><div data-club-season></div><h1>${c[0]}<br><em>${c[1]}</em></h1></div><div class="club-clock" data-club-clock></div></section>`;}
export function mountClubhouse(lang){
 const home=document.querySelector('.clubhouse-home');if(!home)return;
 const c=copy[lang]||copy.en,season=document.querySelector('.season-banner'),clock=document.querySelector('.world-clock'),note=document.querySelector('main > .operation-note');
 if(season)home.querySelector('[data-club-season]').append(season);
 if(clock)home.querySelector('[data-club-clock]').append(clock);
 if(note)home.querySelector('[data-club-clock]').append(note);
 const train=home.querySelector('.train-card');if(train)train.dataset.crewLabel=c[2];
}
