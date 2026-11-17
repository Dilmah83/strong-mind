import {nutrients,validFood} from './model.js';
import {per100g} from './units.js';
export function nutrientSummary(meals,date) {
  const rows=meals.filter(m=>m.date===date);
  return Object.fromEntries(Object.keys(nutrients).map(key=>{
    const known=rows.filter(m=>Number.isFinite(m.nutrients[key]));
    const missing=rows.filter(m=>!Number.isFinite(m.nutrients[key])||m.partial?.includes(key)).length;
    return [key,{value:known.length?known.reduce((s,m)=>s+m.nutrients[key]*m.grams/100,0):rows.length?null:0,missing,partial:missing>0}];
  }));
}
export function makeRecipe(name,ingredients,yieldGrams) {
  if (!name.trim()||!ingredients.length) throw Error('Name your recipe and add at least one ingredient.');
  const totalWeight=ingredients.reduce((s,i)=>s+i.grams,0);
  const weight=Number(yieldGrams)||totalWeight;
  if (!(weight>0)||weight>10000) throw Error('Recipe yield must be greater than 0 and at most 10,000 g.');
  const sums={},partial=[];
  for (const key of Object.keys(nutrients)) {
    let known=0,missing=0;
    for (const i of ingredients) {
      if(!validFood(i.food)||!Number.isFinite(i.grams)||i.grams<=0||i.grams>10000)throw Error('Invalid recipe ingredient.');
      const n=per100g(i.food);
      if (Number.isFinite(n[key])) {sums[key]=(sums[key]||0)+n[key]*i.grams/weight;known++;}
      if(!Number.isFinite(n[key])||i.food.partial?.includes(key))missing++;
    }
    if(known&&missing)partial.push(key);
  }
  return {id:crypto.randomUUID(),name:name.trim(),nutrients:sums,partial,basis:'g',source:'Recipe calculated from ingredients',confidence:'Calculated; partial values marked',yieldGrams:weight,ingredients:structuredClone(ingredients),portions:{serving:{grams:weight,label:'Whole recipe'}}};
}
const aliases=[[/yogurt/g,'yoghurt'],[/capsicum/g,'pepper'],[/scallions/g,'spring onion'],[/garbanzo/g,'chickpea'],[/aubergine/g,'eggplant'],[/zucchini/g,'courgette'],[/nand[o’']?s/g,'nandos'],[/woolies/g,'woolworths']];
export function normaliseQuery(q) {
 let s=String(q).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'');
 for(const [regex,replacement] of aliases)s=s.replace(regex,replacement);
 return s.replace(/[^a-z0-9]+/g,' ').trim();
}
export function searchFoods(foods,query) {
 const terms=normaliseQuery(query).split(' ').filter(Boolean);
 return foods.filter(f=>{const text=normaliseQuery([f.name,f.brand,f.barcode,f.description].join(' '));return terms.every(t=>text.includes(t));});
}
export function dedupeFoods(foods) {
 const seen=new Set();return foods.filter(f=>{const k=f.barcode?`code:${f.barcode}`:f.sourceId?`${f.source}:${f.sourceId}`:f.id||normaliseQuery(f.name);if(seen.has(k))return false;seen.add(k);return true;});
}
