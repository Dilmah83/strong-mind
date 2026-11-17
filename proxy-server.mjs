// Optional USDA proxy. Deploy separately from the static app. Never publish USDA_API_KEY.
import http from 'node:http';
const origins=(process.env.ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean);
const requests=new Map();
export function createProxy({apiKey=process.env.USDA_API_KEY,allowedOrigins=origins,fetcher=fetch}={}) {
 return http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
  if(origin&&allowedOrigins.includes(origin))headers['Access-Control-Allow-Origin']=origin;
  function reply(status,value){res.writeHead(status,headers);res.end(JSON.stringify(value));}
  if(origin&&!allowedOrigins.includes(origin))return reply(403,{error:'Origin is not allowed'});
  if(req.method!=='GET')return reply(405,{error:'GET only'});
  const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/health')return reply(200,{ok:true});
  if(u.pathname!=='/api/usda')return reply(404,{error:'Not found'});
  if(!apiKey)return reply(503,{error:'USDA_API_KEY is not configured'});
  const query=u.searchParams.get('q')?.trim();if(!query||query.length<2||query.length>120)return reply(400,{error:'Food query must be 2–120 characters'});
  const now=Date.now(),ip=req.socket.remoteAddress||'unknown';
  for(const [k,v] of requests)if(now-v.time>3600000)requests.delete(k);
  const usage=requests.get(ip)||{time:now,count:0};if(usage.count>=120)return reply(429,{error:'Proxy rate limit exceeded'});usage.count++;requests.set(ip,usage);
  // Fixed upstream; only q is forwarded. No arbitrary URLs, client keys, journals or histories.
  const upstream=new URL('https://api.nal.usda.gov/fdc/v1/foods/search');upstream.searchParams.set('query',query);upstream.searchParams.set('pageSize','24');
  try{const response=await fetcher(upstream,{headers:{'X-Api-Key':apiKey},signal:AbortSignal.timeout(15000)});if(!response.ok)return reply(response.status===429?429:502,{error:'USDA temporarily unavailable'});const data=await response.json();reply(200,{foods:data.foods||[]});}
  catch{reply(502,{error:'USDA request failed'});}
 });
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href)createProxy().listen(Number(process.env.PORT)||3001,'0.0.0.0');
