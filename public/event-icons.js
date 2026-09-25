const icons=Object.freeze({bloodNight:'wolf',city:'city',stronghold:'stronghold',zombies:'zombies',mg:'mg'});
export function eventIcon(kind){
 const name=icons[kind];if(!name)return '';
 const url=new URL(`./event-icons/${name}-lineart.png`,import.meta.url).href;
 return `<img src="${url}" alt="" aria-hidden="true" width="75" height="75" style="width:75px;height:75px;object-fit:contain;flex:0 0 75px;display:block">`;
}
