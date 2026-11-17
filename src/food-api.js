import {nutrients,validFood} from './model.js';
import {normaliseQuery} from './nutrition.js';
export const OFF_FIELDS='code,product_name,brands,nutriments,nutrition_data_per,serving_size,serving_quantity,serving_quantity_unit,product_quantity,product_quantity_unit,quantity,url';
const OFF_MAP={calories:['energy-kcal',1],protein:['proteins',1],carbs:['carbohydrates',1],fat:['fat',1],fibre:['fiber',1],saturatedFat:['saturated-fat',1],sugar:['sugars',1],sodium:['sodium',1000],potassium:['potassium',1000],calcium:['calcium',1000],magnesium:['magnesium',1000],iron:['iron',1000],zinc:['zinc',1000],iodine:['iodine',1e6],selenium:['selenium',1e6],vitaminA:['vitamin-a',1e6],vitaminC:['vitamin-c',1000],vitaminD:['vitamin-d',1e6],vitaminE:['vitamin-e',1000],vitaminK:['vitamin-k',1e6],b1:['vitamin-b1',1000],b2:['vitamin-b2',1000],b3:['vitamin-pp',1000],b6:['vitamin-b6',1000],b12:['vitamin-b12',1e6],folate:['folates',1e6]};
const finite=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
export function normaliseOff(p) {
 if(!p?.product_name||!p.code)return null;
 const n={};for(const [k,[source,factor]] of Object.entries(OFF_MAP)) {
  const value=p.nutriments?.[source+'_100g'];if(finite(value))n[k]=value*factor;
 }
 if(n.calories===undefined&&finite(p.nutriments?.['energy-kj_100g']))n.calories=p.nutriments['energy-kj_100g']/4.184;
 if(n.folate===undefined&&finite(p.nutriments?.['vitamin-b9_100g']))n.folate=p.nutriments['vitamin-b9_100g']*1e6;
 // OFF normalises mass nutrients to grams, independent of the label's *_unit.
 const liquid=/ml|\bl\b/i.test([p.product_quantity_unit,p.serving_quantity_unit,p.nutrition_data_per].join(' '));
 const food={id:'off-'+p.code,barcode:String(p.code),name:p.product_name.slice(0,500),brand:p.brands||'',nutrients:n,basis:liquid?'mL':'g',source:'Open Food Facts',sourceId:String(p.code),sourceUrl:`https://world.openfoodfacts.org/product/${encodeURIComponent(p.code)}`,confidence:'Community label data · verify against packaging',portions:{},labelServing:p.serving_size||''};
 if(!liquid&&finite(p.serving_quantity)&&p.serving_quantity>0&&p.serving_quantity<=10000)food.portions.serving={grams:p.serving_quantity,label:p.serving_size||'Label serving'};
 if(!liquid&&finite(p.product_quantity)&&p.product_quantity>0&&p.product_quantity<=10000)food.portions.packet={grams:p.product_quantity,label:p.quantity||'Whole pack'};
 return validFood(food)&&Object.keys(n).length?food:null;
}
const USDA_IDS={1008:'calories',1003:'protein',1005:'carbs',1004:'fat',1079:'fibre',2000:'sugar',1063:'sugar',1258:'saturatedFat',1093:'sodium',1092:'potassium',1087:'calcium',1090:'magnesium',1089:'iron',1095:'zinc',1100:'iodine',1103:'selenium',1106:'vitaminA',1162:'vitaminC',1114:'vitaminD',1109:'vitaminE',1185:'vitaminK',1165:'b1',1166:'b2',1167:'b3',1175:'b6',1178:'b12',1177:'folate'};
export function normaliseUsda(p) {
 if(!p?.description||!p.fdcId)return null;
 const n={};
 for(const item of p.foodNutrients||[]) {
  const id=item.nutrientId??item.nutrient?.id,key=USDA_IDS[id],amount=item.value??item.amount;
  if(!key||!finite(amount))continue;
  const unit=(item.unitName||item.nutrient?.unitName||'').toLowerCase().replace('μ','µ');
  const expected=nutrients[key][1];let factor;
  if(expected==='kcal'&&unit==='kcal')factor=1;
  else if(['g','mg','ug','µg'].includes(unit)) {
   const grams={g:1,mg:.001,ug:.000001,'µg':.000001}[unit];factor=grams/{g:1,mg:.001,'µg':.000001}[expected];
  }
  if(factor!==undefined)n[key]=amount*factor;
 }
 const liquid=p.dataType==='Branded'&&/^ml$/i.test(p.servingSizeUnit);
 const f={id:'usda-'+p.fdcId,sourceId:String(p.fdcId),name:p.description.slice(0,500),brand:p.brandName||p.brandOwner||'',barcode:p.gtinUpc||'',nutrients:n,basis:liquid?'mL':'g',source:'USDA FoodData Central',sourceUrl:`https://fdc.nal.usda.gov/food-details/${p.fdcId}/nutrients`,confidence:p.dataType||'USDA reference',portions:{}};
 if(!liquid&&/^g$/i.test(p.servingSizeUnit)&&finite(p.servingSize)&&p.servingSize>0&&p.servingSize<=10000)f.portions.serving={grams:p.servingSize,label:p.householdServingFullText||'Label serving'};
 return validFood(f)&&Object.keys(n).length?f:null;
}
export class FoodCache {
 constructor(storage){this.storage=storage;this.key='strong-mind-food-cache-v2';}
 entries(){try{const rows=JSON.parse(this.storage.getItem(this.key)||'[]');return Array.isArray(rows)?rows.filter(e=>e&&typeof e.key==='string'&&Number.isFinite(e.time)&&Array.isArray(e.foods)).map(e=>({...e,foods:e.foods.filter(validFood)})):[];}catch{return [];}}
 get(key){return this.entries().find(e=>e.key===key);}
 put(key,foods){try{const entries=this.entries().filter(e=>e.key!==key);entries.unshift({key,foods,time:Date.now()});this.storage.setItem(this.key,JSON.stringify(entries.slice(0,15)));}catch{/* cache is disposable; private application state is never evicted */}}
 foods(){return this.entries().flatMap(e=>e.foods).filter(validFood);}
}
export async function remoteSearch(query,provider,{cache,proxy='',online=true,fetcher=fetch,signal}={}) {
 const q=String(query).trim().slice(0,120);if(q.length<2)throw Error('Enter at least two characters.');
 const key=provider+':'+normaliseQuery(q),cached=cache?.get(key);
 if(!online){if(cached)return {...cached,cached:true,stale:true};throw Error('Offline. Search the Australian library, saved foods or cached results.');}
 if(cached&&Date.now()-cached.time<86400000)return {...cached,cached:true};
 let url;
 if(provider==='off'){
  if(/^\d{8,14}$/.test(q))url=`https://world.openfoodfacts.org/api/v2/product/${q}.json?fields=${OFF_FIELDS}`;
  else {const u=new URL('https://world.openfoodfacts.org/cgi/search.pl');Object.entries({search_terms:q,search_simple:'1',action:'process',json:'1',page_size:'24',tagtype_0:'countries',tag_contains_0:'contains',tag_0:'australia',fields:OFF_FIELDS}).forEach(([k,v])=>u.searchParams.set(k,v));url=u.href;}
 }else if(provider==='usda'){
  if(proxy){const u=new URL(proxy);if(u.protocol!=='https:'&&u.hostname!=='localhost')throw Error('The proxy must use HTTPS.');u.searchParams.set('q',q);url=u.href;}
  else{const u=new URL('https://api.nal.usda.gov/fdc/v1/foods/search');u.searchParams.set('api_key','DEMO_KEY');u.searchParams.set('query',q);u.searchParams.set('pageSize','24');url=u.href;}
 }else throw Error('Unknown food provider');
 try {
  const response=await fetcher(url,{signal:signal||AbortSignal.timeout(15000),credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error(response.status===429?'Food provider rate limit reached. Use offline foods or try later.':`Food provider returned ${response.status}.`);
  const data=await response.json();let items=provider==='off'?(data.products||(data.product?[data.product]:[])):(data.foods||[]);
  if(!Array.isArray(items))throw Error('Unexpected food response.');
  const foods=items.map(provider==='off'?normaliseOff:normaliseUsda).filter(Boolean);cache?.put(key,foods);
  return {foods,time:Date.now(),cached:false};
 }catch(error){if(cached)return {...cached,cached:true,stale:true};throw error;}
}
