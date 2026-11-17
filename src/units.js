// Canonical diary quantity is grams. Foods may declare a native per-100 mL basis.
export const MASS = {g:1, kg:1000, oz:28.349523125};
export const VOLUME = {mL:1, L:1000, 'fl oz':29.5735295625, cup:250, tbsp:20, tsp:5};
export const UNIT_NAMES={g:'Grams',kg:'Kilograms',mL:'Millilitres',L:'Litres',oz:'Ounces','fl oz':'US fluid ounces',cup:'Australian cups (250 mL)',tbsp:'Australian tablespoons (20 mL)',tsp:'Teaspoons (5 mL)',piece:'Pieces',slice:'Slices',scoop:'Scoops',serving:'Servings',packet:'Packets',container:'Containers',bottle:'Bottles',custom:'Custom portion'};
export function quantityNumber(input) {
  const text=String(input).trim();
  const match=text.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  const value=match ? Number(match[1]||0)+Number(match[2])/Number(match[3]) : Number(text);
  if (!text || !Number.isFinite(value) || value<=0 || value>100000) throw Error('Enter a positive quantity, such as 1.5 or 1/2.');
  return value;
}
export function toGrams(food,quantity,unit,customGrams) {
  const q=quantityNumber(quantity); let factor;
  if (unit in MASS) factor=MASS[unit];
  else if (food.portions?.[unit]?.grams>0) factor=food.portions[unit].grams;
  else if (unit in VOLUME) {
    if (!(food.density>0)) {
      if(Number(customGrams)>0)factor=Number(customGrams);
      else throw Error('Volume needs a food-specific density. Use grams or enter grams per chosen unit.');
    } else factor=VOLUME[unit]*food.density;
  } else if (unit==='custom') factor=Number(customGrams);
  else factor=food.portions?.[unit]?.grams;
  if (!(factor>0) || !Number.isFinite(factor)) {
    factor=Number(customGrams);
    if (!(factor>0) || !Number.isFinite(factor)) throw Error('Enter the measured grams per unit from your label or scales.');
  }
  const grams=q*factor;
  if (!Number.isFinite(grams)||grams<=0||grams>10000) throw Error('This portion must weigh between 0 and 10,000 grams.');
  return grams;
}
export function scaleFood(food,grams) {
  const divisor=food.basis==='mL' ? food.density : 1;
  if (!(divisor>0)) throw Error('This liquid needs its measured density before logging.');
  return Object.fromEntries(Object.entries(food.nutrients).map(([k,v])=>[k,v*grams/(100*divisor)]));
}
export function per100g(food) {
  if (food.basis!=='mL') return {...food.nutrients};
  if (!(food.density>0)) throw Error('Enter density in g/mL from a reliable source, or use a per-100-g custom food.');
  return Object.fromEntries(Object.entries(food.nutrients).map(([k,v])=>[k,v/food.density]));
}
