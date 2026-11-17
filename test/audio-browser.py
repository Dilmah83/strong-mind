"""V3 browser QA using real Chromium Web Audio. No physical iPhone test implied."""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('TEST_BASE_URL','http://127.0.0.1:4173')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 context.add_init_script('''(()=>{const Native=window.AudioContext;window.audioQA={contexts:[],started:0,active:0,max:0};window.AudioContext=class extends Native{constructor(...args){super(...args);audioQA.contexts.push(this);}createBufferSource(){const s=super.createBufferSource(),start=s.start.bind(s),stop=s.stop.bind(s);let active=false;s.start=(...a)=>{start(...a);active=true;audioQA.started++;audioQA.active++;audioQA.max=Math.max(audioQA.max,audioQA.active);};s.stop=(...a)=>{stop(...a);if(active){active=false;audioQA.active--;}};return s;}};})();''')
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE);page.locator('#nature-entry[open]').wait_for();page.locator('#enter-strong-mind').click()
 page.wait_for_selector('#ambient[data-state="playing"]',timeout=20000)
 assert page.evaluate('audioQA.active')==1
 count=page.evaluate('audioQA.started');contexts=page.evaluate('audioQA.contexts.length')
 # Hash navigation and viewport/orientation changes do not recreate or restart audio.
 for route in ['nutrition','journal','programme','progress','settings','today']:
  page.goto(BASE+'/#'+route);page.locator('h1').wait_for()
 page.set_viewport_size({'width':844,'height':390});page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('audioQA.started')==count
 assert page.evaluate('audioQA.contexts.length')==contexts
 page.locator('#sound-float').click();assert page.locator('#sound-panel').is_visible()
 page.locator('#sound-volume').fill('31');page.locator('#sound-favourite').click();page.locator('#sound-timer').select_option('15')
 saved=page.evaluate("JSON.parse(localStorage.getItem('strong-mind-v1')).preferences.audio")
 assert saved['volume']==.31 and saved['favourite']=='forest-rain'
 assert 'Stops at' in page.locator('#sound-timer-status').inner_text()
 # Decode every bundled recording through the browser's real codec.
 result=page.evaluate('''async()=>{const {soundscapes}=await import('/src/soundscapes.js');const {circularLoop}=await import('/src/audio-engine.js');const ctx=new OfflineAudioContext(2,44100,44100);const rows=[];for(const s of soundscapes){const r=await fetch(s.url);const decoded=await ctx.decodeAudioData(await r.arrayBuffer());const loop=circularLoop(ctx,decoded);const a=loop.getChannelData(0),edge=Math.min(1000,a.length);let rms=0;for(let i=0;i<edge;i++)rms+=a[i]*a[i]+a[a.length-1-i]*a[a.length-1-i];rows.push({id:s.id,seconds:loop.duration,rms:Math.sqrt(rms/(2*edge)),join:Math.abs(a[0]-a[a.length-1])});}return rows;}''')
 assert len(result)==8 and all(r['seconds']>15 and r['rms']>.0001 and r['join']<.2 for r in result),result
 for id in ['heavy-rain','ocean-swells','thunderstorm','mountain-stream','waterfall','ancient-forest','night-rain','forest-rain']:
  page.locator('#sound-selection').select_option(id);page.wait_for_selector('#ambient[data-state="playing"]',timeout=20000)
  assert page.evaluate('audioQA.active')==1
 assert page.evaluate('audioQA.max')==1
 # Programme link hand-off pauses synchronously and stays paused on return/navigation.
 page.locator('#sound-close').click();page.route('https://www.calm.com/**',lambda route:route.abort())
 page.locator('.mission a').first.click();page.wait_for_selector('#ambient[data-state="paused"]')
 assert page.evaluate('audioQA.active')==0
 page.goto(BASE+'/#nutrition');assert page.locator('#ambient').get_attribute('data-state')=='paused'
 # Explicit mute survives reload; selecting a different sound while muted cannot play.
 page.locator('#sound-float').click();page.locator('#sound-enabled').uncheck()
 page.locator('#sound-selection').select_option('night-rain');page.reload()
 page.wait_for_selector('#sound-float');assert page.evaluate('audioQA.started')==0
 page.locator('#sound-float').click();assert not page.locator('#sound-enabled').is_checked()
 assert page.locator('#sound-selection').input_value()=='night-rain'
 assert page.locator('#sound-volume').input_value()=='31'
 # Default forest rain must be ready offline after initial install.
 page.wait_for_function('navigator.serviceWorker.controller !== null')
 context.set_offline(True);page.reload();page.wait_for_selector('#sound-float');page.locator('#sound-float').click()
 page.locator('#sound-selection').select_option('forest-rain');page.locator('#sound-enabled').check()
 page.wait_for_selector('#ambient[data-state="playing"]',timeout=20000)
 assert page.evaluate('audioQA.active')==1
 # Session pause does not silently become an explicit mute.
 page.locator('#sound-pause').click();page.wait_for_selector('#ambient[data-state="paused"]')
 assert page.locator('#sound-enabled').is_checked()
 context.set_offline(False)
 assert not errors,errors
 print('V3 browser audio passed: real decoding of all 8 tracks, PCM loop boundaries, single-source playback, persistent controls/mute, navigation/orientation, external pause, offline default rain.')
 print('Loop inspection:',result)
 # Native visibility event exercises inactive pause/resume; no OS/Safari claim.
 page.locator('#sound-play').click();page.wait_for_selector('#ambient[data-state="playing"]')
 page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))")
 page.wait_for_selector('#ambient[data-state="paused"]');assert page.evaluate('audioQA.active')==0
 page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
 page.wait_for_selector('#ambient[data-state="playing"]')
 print('V3 browser inactive lifecycle passed.')
 context.close();browser.close()
