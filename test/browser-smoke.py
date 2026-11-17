"""Optional browser QA. Requires Python playwright and an installed Chromium.
Start `PORT=4173 npm start`, then run `python test/browser-smoke.py`.
No external accounts are used; API responses are stubbed for deterministic UI tests.
"""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('TEST_BASE_URL','http://127.0.0.1:4173')
BROWSER=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=BROWSER,headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
 page=context.new_page();errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 page.goto(BASE);page.wait_for_function("document.querySelector('.wisdom blockquote') && !document.querySelector('#connection').textContent.includes('loading')")
 page.wait_for_function("navigator.serviceWorker.controller !== null")
 page.goto(BASE+'/#nutrition');page.locator('#search').fill('Milk cow fluid regular')
 page.locator('[data-action="open-food"][data-id="afcd-F005634"]').wait_for()
 page.locator('[data-action="open-food"][data-id="afcd-F005634"]').click()
 page.locator('#quantity').fill('250');page.locator('#unit').select_option('mL')
 assert '257.5 g' in page.locator('#portion-preview').inner_text()
 page.locator('#portion-submit').click()
 saved=page.evaluate("JSON.parse(localStorage.getItem('strong-mind-v1'))")
 assert saved['meals'][-1]['grams']==257.5
 # Food-specific measured tablespoons, persisted for next use.
 page.locator('#search').fill('peanut butter')
 page.locator('[data-action="open-food"][data-id="afcd-F006579"]').click()
 page.locator('#unit').select_option('tbsp');page.locator('#quantity').fill('2');page.locator('#unit-grams').fill('16')
 assert '32 g' in page.locator('#portion-preview').inner_text()
 page.locator('#portion-submit').click()
 page.locator('[data-action="open-food"][data-id="afcd-F006579"]').click()
 page.locator('#unit').select_option('tbsp');page.locator('#quantity').fill('2')
 assert '32 g' in page.locator('#portion-preview').inner_text()
 # Add ingredient to workshop, retain recipe on reload.
 page.locator('#portion-purpose').select_option('recipe');page.locator('#portion-submit').click()
 page.wait_for_url('**/#recipes');page.locator('#recipe-name').fill('Browser test recipe')
 page.locator('[data-action="save-recipe"]').click()
 assert 'Browser test recipe' in page.locator('main').inner_text()
 page.reload();page.locator('text=Browser test recipe').first.wait_for()
 # Programme/journal/checklist and daily quote persistence.
 page.goto(BASE+'/#today');page.locator('#journal').fill('An intentional browser test reflection.')
 for task in ['listen','calm','activity']:page.locator('[data-task="'+task+'"]').check()
 page.locator('#sign').click();page.locator('#quote-reflected').check()
 page.locator('[data-action="quote-favourite"]').first.click()
 quote=page.locator('.wisdom blockquote').inner_text()
 page.reload();assert page.locator('#journal').input_value()=='An intentional browser test reflection.'
 assert page.locator('#sign').is_disabled();assert page.locator('#quote-reflected').is_checked()
 assert page.locator('.wisdom blockquote').inner_text()==quote
 page.locator('#journal').fill('Changed reflection clears the sign-off.')
 assert page.locator('#sign').is_enabled()
 # Sources/filters and every primary route at narrow widths.
 page.goto(BASE+'/#stories');assert page.locator('.day-card').count()==20
 page.locator('#story-filter').select_option('Happiness');assert page.locator('.day-card').count()>=1
 page.goto(BASE+'/#wisdom');page.locator('[data-filter="favourites"]').click();assert page.locator('.wisdom').count()==1
 for width in [320,375,390,430,1280]:
  page.set_viewport_size({'width':width,'height':844})
  for route in ['today','programme','nutrition','journal','progress','settings','recipes','more']:
   page.goto(BASE+'/#'+route)
   page.locator('h1').wait_for()
   assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'),f'Horizontal overflow at {width}: {route}'
 # Remote UI loading and API results, with synthetic response only.
 context.route('**/cgi/search.pl?**',lambda route:route.fulfill(json={'products':[{'code':'12345678','product_name':'Browser Label Product','brands':'Test AU','nutriments':{'energy-kcal_100g':100,'proteins_100g':10}}]}))
 page.goto(BASE+'/#nutrition');page.locator('#search').fill('Browser Label Product');page.locator('#provider').select_option('off');page.locator('#search-submit').click()
 page.locator('[data-id="off-12345678"][data-action="open-food"]').wait_for()
 assert 'provider results' in page.locator('#search-message').inner_text()
 # Offline cold navigation and logging with bundled data.
 context.set_offline(True);page.goto(BASE+'/#nutrition');page.reload();page.locator('#search').fill('Milk cow fluid regular')
 page.locator('[data-id="afcd-F005634"][data-action="open-food"]').wait_for()
 page.goto(BASE+'/#today');assert page.locator('.wisdom blockquote').inner_text()==quote
 page.locator('#journal').fill('Offline entry survives reload.');page.reload()
 assert page.locator('#journal').input_value()=='Offline entry survives reload.'
 page.goto(BASE+'/#stories');assert page.locator('.day-card').count()==20
 context.set_offline(False)
 page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'/#today')
 Path('/tmp/strong-mind-qa').mkdir(exist_ok=True)
 page.screenshot(path='/tmp/strong-mind-qa/home-390.png',full_page=True)
 page.goto(BASE+'/#nutrition');page.screenshot(path='/tmp/strong-mind-qa/nutrition-390.png',full_page=True)
 assert not errors,errors
 print('Browser smoke passed: mobile/desktop layouts, checklists, journal, quotes, recipes, food search, measured portions, offline cold loads. No page errors.')
 context.close()
 # Actual V1 data migration in a separate origin storage context.
 context=browser.new_context(viewport={'width':390,'height':844});page=context.new_page()
 page.goto(BASE)
 prior=page.evaluate("JSON.parse(localStorage.getItem('strong-mind-v1') || 'null')")
 # Fresh defaults are held in memory until saved; generate a valid state from the actual module.
 prior=page.evaluate("async()=>{const m=await import('/src/model.js');const s=m.defaults();s.version=1;delete s.wisdom;delete s.foodFavourites;delete s.recipes;delete s.preferences;s.days[1]={listen:true,calm:true,activity:true,journal:'V1 precious journal',mood:4,signed:'2026-11-16T12:00:00Z'};s.meals=[{id:'old-meal',name:'Old food',grams:150,date:s.start,meal:'Lunch',nutrients:{calories:200,protein:20}}];return s}")
 page.evaluate('(s)=>localStorage.setItem("strong-mind-v1",JSON.stringify(s))',prior);page.reload()
 page.goto(BASE+'/#day/1');assert page.locator('#journal').input_value()=='V1 precious journal'
 page.locator('#journal').fill('V1 precious journal, preserved and extended.')
 migrated=page.evaluate("JSON.parse(localStorage.getItem('strong-mind-v1'))")
 assert migrated['version']==2 and migrated['meals']==prior['meals']
 assert page.evaluate("JSON.parse(localStorage.getItem('strong-mind-v1-before-v2')).days['1'].journal")=='V1 precious journal'
 # Corrupt primary record stays intact and saving is blocked.
 page.evaluate("localStorage.setItem('strong-mind-v1','{broken')");page.reload()
 assert 'Saving is paused' in page.locator('main').inner_text()
 page.locator('#journal').fill('Must not overwrite corrupt data.')
 assert page.evaluate("localStorage.getItem('strong-mind-v1')")=='{broken'
 print('Browser migration/recovery passed: V1 history unchanged, original backup retained, corrupt data not overwritten.')
 browser.close()
