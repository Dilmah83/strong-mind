// Optional research check. No private application data is read or transmitted.
import {readFile} from 'node:fs/promises';
import {quotes} from '../src/quotes-data.js';
const normal=s=>s.replace(/\s+/g,' ').trim();
const get=async(env,url)=>process.env[env]?readFile(process.env[env],'utf8'):fetch(url).then(r=>{if(!r.ok)throw Error('Source unavailable: '+url);return r.text();});
const marcus=await get('MARCUS_SOURCE','https://classics.mit.edu/Antoninus/meditations.mb.txt');
const epictetus=await get('EPICTETUS_SOURCE','https://raw.githubusercontent.com/jtauber/enchiridion/master/text/EN_long.txt');
const books=marcus.split(/BOOK ([A-Z]+)\s*\n/),names=['ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','ELEVEN','TWELVE'];
for(const q of quotes){
 let source;
 if(q.author==='Marcus Aurelius'){
  const number=Number(q.work.match(/Book (\d+)/)[1]);source=books[books.indexOf(names[number-1])+1];
 }else{const ref=q.work.split(', ')[1];source=epictetus.split('\n').find(l=>l.startsWith(ref+' '));}
 if(!source||!normal(source).includes(normal(q.text)))throw Error('Quote did not match its reference: '+q.id);
}
console.log('All 100 excerpts match the cited work/book or section, with whitespace normalisation only.');
