export const SOUND_IDS=['forest-rain','heavy-rain','ocean-swells','thunderstorm','mountain-stream','waterfall','ancient-forest','night-rain'];
export const audioDefaults=()=>({enabled:true,volume:0.22,soundscape:'forest-rain',favourite:null,chosen:false});
export function validateAudio(p){return p&&typeof p.enabled==='boolean'&&Number.isFinite(p.volume)&&p.volume>=0&&p.volume<=1&&SOUND_IDS.includes(p.soundscape)&&(p.favourite===null||SOUND_IDS.includes(p.favourite))&&typeof p.chosen==='boolean';}
