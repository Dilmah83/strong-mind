import {quotes} from './quotes-data.js';
import {localDate} from './model.js';
export {quotes};
export function calendarIndex(date=localDate()) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date)))throw Error('Invalid calendar date');
 return Math.floor(Date.parse(date+'T00:00:00Z')/86400000);
}
export function dailyQuote(date=localDate()){return quotes[((calendarIndex(date)%quotes.length)+quotes.length)%quotes.length];}
export function dateBefore(date,offset){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-offset);return d.toISOString().slice(0,10);}
