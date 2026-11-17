import {AmbientEngine} from './audio-engine.js';
import {soundscapes} from './soundscapes.js';
import {dailyLandscape} from './landscapes.js';
import {dailyQuote} from './wisdom.js';
import {localDate} from './model.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function mountAmbient({preferences,onPreferences,readOnly=false}){
 const host=document.createElement('aside');host.id='ambient';host.setAttribute('aria-label','Nature sound controls');
 host.innerHTML=`<button id="sound-float" class="sound-float" aria-expanded="false" aria-controls="sound-panel"><span aria-hidden="true">◉</span> <span id="sound-label">Rain & nature</span></button><section id="sound-panel" class="sound-panel" aria-label="Soundscape settings" hidden><div class="section-top"><h2>Your quiet place.</h2><button id="sound-close" class="icon-button" aria-label="Close sound settings">×</button></div><p id="audio-status" role="status"></p><label class="check"><input type="checkbox" id="sound-enabled">Ambient sound enabled</label><div class="actions"><button id="sound-play" class="secondary">Play sound</button><button id="sound-pause" class="secondary">Pause</button></div><label>Soundscape<select id="sound-selection">${soundscapes.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select></label><p id="sound-description" class="caption"></p><label>Volume <output id="sound-volume-value"></output><input id="sound-volume" type="range" min="0" max="100" step="1" aria-label="Ambient volume"></label><div class="actions"><button id="sound-favourite" class="ghost" aria-pressed="false">☆ Favourite</button><button id="sound-use-favourite" class="ghost">Use favourite</button></div><label>Sleep timer<select id="sound-timer"><option value="0">Off</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select></label><p id="sound-timer-status" class="caption"></p><p class="caption">Pauses when hidden or when opening programme audio. If another app starts independently, pause here manually. Hardware volume and silent-mode behaviour are controlled by iOS.</p><p class="caption"><a id="sound-source" target="_blank" rel="noopener noreferrer"></a> · <a href="/media-credits.html">All media credits</a></p></section>`;
 document.body.append(host);
 const entry=document.createElement('dialog');entry.id='nature-entry';entry.setAttribute('aria-label','Daily nature reveal');document.body.append(entry);
 let date=localDate(),lastPrefs='',openedToday=false;
 const engine=new AmbientEngine({preferences:{...preferences,enabled:readOnly?false:preferences.enabled},onPreferences:p=>{lastPrefs=JSON.stringify(p);onPreferences(p);},onChange:update});
 function update(snapshot=engine.snapshot()){
  const p=snapshot.preferences,s=soundscapes.find(s=>s.id===p.soundscape);
  host.dataset.state=snapshot.state;
  document.querySelector('#sound-label').textContent=snapshot.playing?s.name:snapshot.state==='blocked'&&p.enabled?'Enter Strong Mind':p.enabled?'Nature · paused':'Sound off';
  document.querySelector('#sound-enabled').checked=p.enabled;
  document.querySelector('#sound-selection').value=p.soundscape;
  document.querySelector('#sound-volume').value=Math.round(p.volume*100);
  document.querySelector('#sound-volume-value').textContent=Math.round(p.volume*100)+'%';
  document.querySelector('#audio-status').textContent=snapshot.error||(snapshot.playing?'Playing · '+s.name:snapshot.reason==='external'?'Paused for programme audio. Tap Play when you are ready.':snapshot.reason==='timer'?'Sleep timer finished. Tap Play to start again.':snapshot.state==='loading'?'Preparing your soundscape…':!p.enabled?'Sound is off. Your mute preference is remembered.':'Tap Play to start or resume your soundscape.');
  document.querySelector('#sound-play').disabled=!p.enabled||snapshot.playing;
  document.querySelector('#sound-pause').disabled=!snapshot.playing&&snapshot.state!=='loading';
  document.querySelector('#sound-description').textContent=s.description;
  const isFavourite=p.favourite===s.id;document.querySelector('#sound-favourite').textContent=isFavourite?'★ Favourite saved':'☆ Favourite';document.querySelector('#sound-favourite').setAttribute('aria-pressed',String(isFavourite));document.querySelector('#sound-use-favourite').disabled=!p.favourite;
  const source=document.querySelector('#sound-source');source.textContent=s.author+' · CC0 recording';source.href=s.source;
  document.querySelector('#sound-timer-status').textContent=snapshot.deadline?'Stops at '+new Date(snapshot.deadline).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+'. Timer is session-only.':'No timer active.';
  if(!snapshot.deadline)document.querySelector('#sound-timer').value='0';
  const entryStatus=entry.querySelector('[data-entry-status]');if(entryStatus)entryStatus.textContent=snapshot.error||(!p.enabled?'Your saved sound-off preference is respected.':snapshot.playing?'Listen. Breathe. Begin.':'Tap Enter Strong Mind to begin with your selected sound.');
 }
 function panel(open){const p=document.querySelector('#sound-panel');p.hidden=!open;document.querySelector('#sound-float').setAttribute('aria-expanded',String(open));if(open)document.querySelector('#sound-close').focus();else document.querySelector('#sound-float').focus();}
 function reveal(){
  const photo=dailyLandscape(date),quote=dailyQuote(date),recommendation=soundscapes.find(s=>s.id===photo.recommended);
  entry.innerHTML=`<img class="entry-photo" src="${photo.url}" alt="${esc(photo.alt)}"><div class="entry-shade"></div><div class="entry-content"><p class="eyebrow">STRONG MIND · YOUR DAILY ARRIVAL</p><p class="entry-landscape">${esc(photo.title)}</p><blockquote class="entry-quote">“${esc(quote.text)}”</blockquote><p class="entry-author">— ${esc(quote.author)}<br><small>${esc(quote.work)} · ${esc(quote.translation)}</small></p><p data-entry-status role="status"></p><button id="enter-strong-mind">Enter Strong Mind</button><button id="enter-quietly" class="ghost">Enter quietly · keep sound off</button><p class="entry-recommendation">Landscape pairing: ${recommendation.name}. Your chosen sound and mute preference take priority.</p><a class="photo-credit" href="${photo.source}" target="_blank" rel="noopener noreferrer">Photo: ${esc(photo.author)} · ${esc(photo.license)} ↗</a></div>`;
  entry.querySelector('#enter-strong-mind').onclick=()=>{if(engine.preferences.enabled)void engine.play({gesture:true});closeEntry();beginProgramme();};
  entry.querySelector('#enter-quietly').onclick=()=>{void engine.toggleEnabled(false);closeEntry();beginProgramme();};
  entry.showModal();update();
 }
 function closeEntry(){entry.close();openedToday=true;try{sessionStorage.setItem('strong-mind-arrival',date);}catch{}}
 function beginProgramme(){if(location.hash&&location.hash!=='#today')location.hash='today';setTimeout(()=>{document.querySelector('#begin-programme')?.focus({preventScroll:true});},0);}
 host.querySelector('#sound-float').onclick=()=>{if(engine.state==='blocked'&&engine.preferences.enabled){void engine.play({gesture:true});return;}panel(host.querySelector('#sound-panel').hidden);};
 host.querySelector('#sound-close').onclick=()=>panel(false);
 host.querySelector('#sound-enabled').onchange=e=>void engine.toggleEnabled(e.target.checked);
 host.querySelector('#sound-play').onclick=()=>void engine.play({gesture:true});
 host.querySelector('#sound-pause').onclick=()=>void engine.pause('manual');
 host.querySelector('#sound-selection').onchange=e=>void engine.select(e.target.value);
 host.querySelector('#sound-volume').oninput=e=>engine.setVolume(Number(e.target.value)/100);
 host.querySelector('#sound-favourite').onclick=()=>engine.favourite(engine.preferences.soundscape);
 host.querySelector('#sound-use-favourite').onclick=()=>{if(engine.preferences.favourite)void engine.select(engine.preferences.favourite);};
 host.querySelector('#sound-timer').onchange=e=>engine.setTimer(Number(e.target.value));
 host.addEventListener('keydown',e=>{if(e.key==='Escape')panel(false);});
 entry.addEventListener('cancel',()=>{closeEntry();});
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(a?.closest('.mission')&&/^https?:/.test(a.href))void engine.pause('external');const begin=e.target.closest('#begin-programme');if(begin){document.querySelector('.mission')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}const match=e.target.closest('[data-match-landscape]');if(match)void engine.select(dailyLandscape(localDate()).recommended);});
 document.addEventListener('visibilitychange',()=>{void engine.visibility(document.hidden);});
 window.addEventListener('pagehide',()=>{void engine.visibility(true);});window.addEventListener('pageshow',()=>{void engine.visibility(document.hidden);});
 window.addEventListener('freeze',()=>{void engine.visibility(true);});
 window.addEventListener('hashchange',()=>{if(entry.open)closeEntry();});
 window.addEventListener('strong-mind-render',e=>{
  const incoming=e.detail.audio;if(incoming&&JSON.stringify(incoming)!==lastPrefs&&JSON.stringify(incoming)!==JSON.stringify(engine.preferences)){lastPrefs=JSON.stringify(incoming);void engine.applyPreferences(incoming);}
  if(e.detail.date!==date){date=e.detail.date;openedToday=false;if(!document.hidden&&(!location.hash||location.hash==='#today'))reveal();}
 });
 update();
 try{openedToday=sessionStorage.getItem('strong-mind-arrival')===date;}catch{}
 if(!openedToday&&(!location.hash||location.hash==='#today'))reveal();
 if(engine.preferences.enabled&&!document.hidden)void engine.play();
 return engine;
}
