import {makeRecipe} from './nutrition.js';
// Explicit example ingredient weights, not restaurant claims or measured finished products.
const examples=[
 ['Chicken, brown rice & broccoli',[['F002590',150],['F007641',150],['F001900',100]]],
 ['Salmon, sweet potato & green beans',[['F007826',150],['F009033',200],['F000430',100]]],
 ['Three-egg vegetable omelette',[['F003729',150],['F002247',50],['F005946',50]]],
 ['Chicken burrito bowl',[['F002590',150],['F007641',100],['F000448',80],['F002247',50]]],
 ['Yoghurt protein smoothie',[['F005634',200],['F009694',170],['F000262',100]]],
 ['Chicken & vegetable stir-fry',[['F002593',150],['F001900',100],['F002247',70],['F006177',10]]]
];
export function exampleRecipes(foods) {
 return examples.map(([name,items],i)=>{
  const ingredients=items.map(([id,grams])=>({food:foods.find(f=>f.id==='afcd-'+id),grams}));
  if(ingredients.some(i=>!i.food))return null;
  const r=makeRecipe(name,ingredients);return {...r,id:'example-'+i,source:'Example recipe · FSANZ ingredients',confidence:'Calculated example; edit ingredients and finished weight',description:'Example quantities only. Omelette assumes 150 g edible egg (three 50 g eggs); weigh yours. No unlisted oil, sauces or cooking losses included.'};
 }).filter(Boolean);
}
