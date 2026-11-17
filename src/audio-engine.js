import {audioDefaults,validateAudio} from './audio-preferences.js';
import {soundscapes} from './soundscapes.js';

// Join tail to head once at decode time; the native AudioBufferSource loop has no JS scheduling gap.
export function circularLoop(context,input,seconds=2){
 const overlap=Math.min(Math.round(input.sampleRate*seconds),Math.floor(input.length/4));
 if(overlap<2)throw Error('Recording is too short to loop.');
 const output=context.createBuffer(input.numberOfChannels,input.length-overlap,input.sampleRate);
 for(let c=0;c<input.numberOfChannels;c++){
  const src=input.getChannelData(c),dst=output.getChannelData(c),middle=input.length-2*overlap;
  dst.set(src.subarray(overlap,input.length-overlap));
  for(let i=0;i<overlap;i++){const angle=(i/(overlap-1))*Math.PI/2;dst[middle+i]=src[input.length-overlap+i]*Math.cos(angle)+src[i]*Math.sin(angle);}
 }
 return output;
}
export class AmbientEngine {
 constructor({preferences=audioDefaults(),createContext=()=>new (window.AudioContext||window.webkitAudioContext)({latencyHint:'playback'}),fetcher=(...args)=>fetch(...args),onChange=()=>{},onPreferences=()=>{},clock=()=>Date.now()}={}){
  this.preferences={...preferences};this.createContext=createContext;this.fetcher=fetcher;this.onChange=onChange;this.onPreferences=onPreferences;this.clock=clock;
  this.context=null;this.source=null;this.gain=null;this.buffer=null;this.bufferId=null;this.sequence=0;this.state='idle';this.reason='';this.error='';this.hidden=false;this.destroyed=false;this.deadline=null;this.timer=null;this.abort=null;
 }
 notify(){this.onChange(this.snapshot());}
 snapshot(){return {state:this.state,reason:this.reason,error:this.error,playing:this.state==='playing',deadline:this.deadline,preferences:{...this.preferences}};}
 save(patch){const next={...this.preferences,...patch};if(!validateAudio(next))throw Error('Invalid sound preferences');this.preferences=next;this.onPreferences({...next});this.notify();}
 ensureContext(){if(!this.context){
  // Where implemented (notably Safari), request an ambient session rather than exclusive playback.
  try{if(globalThis.navigator?.audioSession)globalThis.navigator.audioSession.type='ambient';}catch{}
  this.context=this.createContext();this.gain=this.context.createGain();this.gain.gain.value=this.preferences.volume;this.gain.connect(this.context.destination);this.context.addEventListener?.('statechange',()=>{if(['interrupted','suspended'].includes(this.context.state)&&this.source&&this.state==='playing'){this.stopSource();this.state='paused';this.reason='interrupted';this.notify();}});}return this.context;}
 stopSource(){if(this.source){try{this.source.stop();}catch{}this.source.disconnect();this.source=null;}}
 async play({gesture=false}={}){
  if(this.destroyed||this.hidden||!this.preferences.enabled)return false;
  if(this.state==='playing'&&this.context?.state==='running')return true;
  const token=++this.sequence;this.abort?.abort();this.abort=new AbortController();
  this.stopSource();this.state='loading';this.reason='';this.error='';this.notify();
  let policyTimer;
  try{
   const context=this.ensureContext();
   // resume is invoked before any fetch/await, while a user gesture is still active on Safari.
   const resume=context.resume();
   await Promise.race([resume,new Promise((_,reject)=>{policyTimer=setTimeout(()=>{const e=new Error('Tap Enter Strong Mind to allow sound.');e.name='NotAllowedError';reject(e);},1500);})]);
   clearTimeout(policyTimer);
   if(context.state!=='running'){const e=new Error('Tap to allow audio playback.');e.name='NotAllowedError';throw e;}
   if(token!==this.sequence||!this.preferences.enabled||this.hidden)return false;
   const id=this.preferences.soundscape,entry=soundscapes.find(s=>s.id===id);
   if(this.bufferId!==id){
    this.buffer=null;this.bufferId=null;
    const response=await this.fetcher(entry.url,{signal:this.abort.signal});if(!response.ok)throw Error('This sound is not available offline yet. Connect and try again.');
    const decoded=await context.decodeAudioData(await response.arrayBuffer());
    if(token!==this.sequence||!this.preferences.enabled||this.hidden)return false;
    this.buffer=circularLoop(context,decoded);this.bufferId=id;
   }
   if(token!==this.sequence||!this.preferences.enabled||this.hidden)return false;
   const source=context.createBufferSource();source.buffer=this.buffer;source.loop=true;source.connect(this.gain);
   this.gain.gain.cancelScheduledValues(context.currentTime);this.gain.gain.setValueAtTime(0,context.currentTime);this.gain.gain.linearRampToValueAtTime(this.preferences.volume,context.currentTime+.35);
   this.source=source;source.start();this.state='playing';this.reason='';this.notify();return true;
  }catch(error){
   clearTimeout(policyTimer);if(token!==this.sequence)return false;
   this.stopSource();this.state=error.name==='NotAllowedError'?'blocked':'error';this.error=error.name==='NotAllowedError'?'One tap lets Safari start your soundscape.':error.message;this.notify();return false;
  }
 }
 async pause(reason='manual'){
  ++this.sequence;this.abort?.abort();this.stopSource();this.state='paused';this.reason=reason;
  // suspend is optional: it releases the audio hardware while idle/hidden without recreating it.
  try{await this.context?.suspend();}catch{}this.notify();
 }
 async toggleEnabled(enabled){this.save({enabled});if(enabled)return this.play({gesture:true});await this.pause('muted');return false;}
 async select(id,{explicit=true}={}){const playing=this.state==='playing';this.save({soundscape:id,...(explicit?{chosen:true}:{})});if(playing){await this.pause('selection');return this.play({gesture:true});}this.buffer=null;this.bufferId=null;this.notify();}
 setVolume(value){this.save({volume:Math.max(0,Math.min(1,Number(value)))});if(this.context&&this.gain){const t=this.context.currentTime;this.gain.gain.cancelScheduledValues(t);this.gain.gain.setTargetAtTime(this.preferences.volume,t,.05);}}
 favourite(id){this.save({favourite:this.preferences.favourite===id?null:id});}
 setTimer(minutes){if(![0,15,30,60].includes(minutes))throw Error('Unsupported sleep timer');clearTimeout(this.timer);this.deadline=minutes?this.clock()+minutes*60000:null;if(this.deadline)this.timer=setTimeout(()=>this.expireTimer(),minutes*60000);this.notify();}
 expireTimer(){if(this.deadline&&this.clock()>=this.deadline){clearTimeout(this.timer);this.deadline=null;void this.pause('timer');this.notify();return true;}return false;}
 async visibility(hidden){this.hidden=hidden;if(hidden){if(this.state==='playing'||this.state==='loading')await this.pause('inactive');}else{if(this.expireTimer())return;if(this.reason==='inactive'&&this.preferences.enabled)await this.play();}}
 async applyPreferences(p){if(!validateAudio(p))return;const changed=p.soundscape!==this.preferences.soundscape||!p.enabled;this.preferences={...p};if(changed)await this.pause(p.enabled?'preferences':'muted');else if(this.gain&&this.context)this.gain.gain.setTargetAtTime(p.volume,this.context.currentTime,.05);this.notify();}
 async destroy(){this.destroyed=true;clearTimeout(this.timer);await this.pause('closed');this.buffer=null;try{await this.context?.close();}catch{}}
}
