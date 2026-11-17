import {audioDefaults,validateAudio} from './audio-preferences.js';
export const nutrients={calories:['Calories','kcal',2000],protein:['Protein','g',100],carbs:['Carbohydrates','g',250],fat:['Fat','g',65],fibre:['Fibre','g',30],saturatedFat:['Saturated fat (limit)','g',20],sugar:['Sugar','g',50],iodine:['Iodine','µg',150],vitaminA:['Vitamin A','µg',900],vitaminC:['Vitamin C','mg',90],vitaminD:['Vitamin D','µg',20],vitaminE:['Vitamin E','mg',15],vitaminK:['Vitamin K','µg',120],b1:['Thiamin (B1)','mg',1.2],b2:['Riboflavin (B2)','mg',1.3],b3:['Niacin (B3)','mg',16],b6:['Vitamin B6','mg',1.7],b12:['Vitamin B12','µg',2.4],folate:['Folate','µg',400],calcium:['Calcium','mg',1000],iron:['Iron','mg',18],magnesium:['Magnesium','mg',400],potassium:['Potassium','mg',3500],zinc:['Zinc','mg',11],selenium:['Selenium','µg',55],sodium:['Sodium (limit)','mg',2300]};
export const defaults=()=>({version:2,wisdom:{reflections:{},favourites:[]},foodFavourites:[],recipes:[],preferences:{units:'metric',usdaProxy:'',audio:audioDefaults()},start:localDate(),days:{},meals:[],foods:[],goals:Object.fromEntries(Object.entries(nutrients).map(([k,v])=>[k,v[2]]))});
export function localDate(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function currentDay(start,now=localDate()){return Math.max(1,Math.min(30,Math.round((Date.parse(now)-Date.parse(start))/86400000)+1));}
export function totals(meals,date){return Object.fromEntries(Object.keys(nutrients).map(k=>[k,meals.filter(m=>m.date===date).reduce((s,m)=>s+(m.nutrients[k]??0)*m.grams/100,0)]));}
export function validFood(f){return f&&typeof f.name==='string'&&f.name.trim().length>0&&f.name.length<=500&&f.nutrients&&Object.entries(f.nutrients).every(([k,v])=>k in nutrients&&Number.isFinite(v)&&v>=0&&v<=100000);}
export function validateState(s){if(!s||s.version!==2||!/^\d{4}-\d{2}-\d{2}$/.test(s.start)||!Number.isFinite(Date.parse(s.start))||!Array.isArray(s.meals)||!Array.isArray(s.foods)||!s.days||typeof s.days!=='object'||Array.isArray(s.days))throw Error('Invalid backup');
if(!s.foods.every(validFood)||!s.meals.every(m=>validFood(m)&&typeof m.id==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(m.date)&&Number.isFinite(m.grams)&&m.grams>0&&m.grams<=10000&&['Breakfast','Lunch','Dinner','Snack'].includes(m.meal)))throw Error('Invalid food or meal');
if(!s.goals||!Object.keys(nutrients).every(k=>Number.isFinite(s.goals[k])&&s.goals[k]>0&&s.goals[k]<=100000))throw Error('Invalid goals');
validateExtensions(s);
for(const [k,d] of Object.entries(s.days)){if(!/^([1-9]|[12]\d|30)$/.test(k)||!d||typeof d.journal!=='string'||d.journal.length>20000||!Number.isInteger(d.mood)||d.mood<1||d.mood>5||!['listen','calm','activity'].every(t=>typeof d[t]==='boolean')||!(d.signed===null||typeof d.signed==='string'))throw Error('Invalid journal');}return s;}
export function canSign(d){return d&&d.listen&&d.calm&&d.activity&&d.journal.trim().length>0;}

// Upgrade both this app's v1 saves and the original archive's device-local format.
export function migrateState(input) {
  if (!input || typeof input !== 'object') throw Error('Invalid saved data');
  const base = defaults();
  if (input.version === 1 || input.version === 2) {
    return validateState({...base, ...input, version:2, goals: {...base.goals, ...input.goals}, preferences:{...base.preferences,...input.preferences,audio:{...audioDefaults(),...input.preferences?.audio}}});
  }
  if (!input.signoffs || !input.journals || !Array.isArray(input.meals)) throw Error('Unknown saved data format');
  const aliases = {thiamin:'b1', riboflavin:'b2', niacin:'b3', vitaminB6:'b6', vitaminB12:'b12'};
  const mapKey = key => aliases[key] || key;
  base.start = input.start;
  for (const [key, value] of Object.entries(input.targets || {})) {
    const mapped = mapKey(key);
    if (mapped in nutrients && Number.isFinite(value) && value > 0) base.goals[mapped] = value;
  }
  const indexes = new Set([...Object.keys(input.signoffs), ...Object.keys(input.journals)]);
  for (const index of indexes) {
    if (!/^([0-9]|[12]\d)$/.test(index)) throw Error('Invalid original day');
    const checks = input.signoffs[index] || [];
    const d = {listen:checks.includes(1), calm:checks.includes(0), activity:checks.includes(2), journal:input.journals[index] || '', mood:3, signed:null};
    // Timestamp records migration, since the original app did not save completion times.
    if (checks.includes(3) && canSign(d)) d.signed = new Date().toISOString();
    base.days[Number(index)+1] = d;
  }
  base.meals = input.meals.map((m,index) => {
    const n = {};
    for (const [key,value] of Object.entries(m.values || {})) {
      if (value === null || value === undefined) continue;
      const mapped = mapKey(key);
      if (mapped in nutrients) n[mapped] = Number(value) * 100 / m.grams;
    }
    return {id:String(m.id || `imported-${index}`), name:m.name, meal:m.meal, grams:m.grams, date:m.date, nutrients:n, source:'Original diary'};
  });
  return validateState(base);
}

function validateExtensions(s) {
  if(!validateAudio(s.preferences?.audio))throw Error('Invalid sound preferences');
  if (!s.wisdom || !Array.isArray(s.wisdom.favourites) || !s.wisdom.favourites.every(x=>typeof x==='string') || !s.wisdom.reflections || typeof s.wisdom.reflections!=='object' || Array.isArray(s.wisdom.reflections)) throw Error('Invalid wisdom data');
  for (const [date,value] of Object.entries(s.wisdom.reflections)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof value!=='boolean') throw Error('Invalid reflection');
  }
  if (!Array.isArray(s.foodFavourites)||!s.foodFavourites.every(x=>typeof x==='string')||!Array.isArray(s.recipes)||!s.recipes.every(validFood)) throw Error('Invalid saved foods');
  if (!s.preferences || !['metric','imperial'].includes(s.preferences.units) || typeof s.preferences.usdaProxy!=='string')throw Error('Invalid preferences');
  for (const food of [...s.foods,...s.recipes,...s.meals]) {
    if(food.density!==undefined&&(!Number.isFinite(food.density)||food.density<=0||food.density>30))throw Error('Invalid food density');
    if(food.basis!==undefined&&!['g','mL'].includes(food.basis))throw Error('Invalid nutrient basis');
    if(food.partial!==undefined&&(!Array.isArray(food.partial)||!food.partial.every(k=>k in nutrients)))throw Error('Invalid nutrient coverage');
    if(food.portions!==undefined){if(!food.portions||typeof food.portions!=='object'||Array.isArray(food.portions))throw Error('Invalid portions');for(const p of Object.values(food.portions)){if(!p||!Number.isFinite(p.grams)||p.grams<=0||p.grams>10000)throw Error('Invalid portion weight');}}
  }
}
