import fs from 'node:fs';
// Optional browser verification: point PLAYWRIGHT_MODULE at an installed Playwright module.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const answers=JSON.parse(fs.readFileSync('/tmp/p5c-browser-answers.json','utf8')),errors=[],external=[],measurements=[];
const root='docs/screenshots/';
fs.mkdirSync(root,{recursive:true});
const measure=async(page,screen,width)=>{
 const layout=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,central:Math.round(document.querySelector('.phone-app').getBoundingClientRect().width),sidePanels:[...document.querySelectorAll('.desktop-panel')].filter(e=>getComputedStyle(e).display!=='none').length,question:document.querySelector('.question-card h1')?.getBoundingClientRect().toJSON(),input:document.querySelector('#answer')?.getBoundingClientRect().toJSON()}));
 if(layout.document>layout.viewport)throw new Error('Horizontal overflow '+width+' '+screen);
 measurements.push({screen,width,...layout});await page.screenshot({path:root+`phase5c-${width}-${screen}.png`,fullPage:true});
};
for(const width of [375,768,1280,1440,1920]){
 const context=await browser.newContext({viewport:{width,height:width===375?812:1000},timezoneId:'America/Los_Angeles',hasTouch:width===375}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173'))external.push(r.url());});
 await page.clock.install({time:new Date('2026-11-11T12:00:00Z')});
 const requests=[];page.on('request',r=>requests.push(r.url()));
 const t=performance.now();await page.goto('http://127.0.0.1:4173');await page.getByRole('button',{name:'PLAY TODAY'}).waitFor();
 const homeReadyMs=Math.round(performance.now()-t),catalogLoadedAtHome=requests.some(u=>/assets\/App-/.test(u));
 if(catalogLoadedAtHome)throw new Error('Catalog eagerly loaded at home');
 await measure(page,'home',width);
 const dropStart=performance.now();await page.getByRole('button',{name:'PLAY TODAY'}).click();await page.getByRole('button',{name:'START GAME',exact:true}).waitFor();const dropReadyMs=Math.round(performance.now()-dropStart);await page.getByRole('button',{name:'START GAME',exact:true}).click();
 const input=page.getByRole('textbox',{name:'YOUR ANSWER'});await input.waitFor();
 if(await page.locator('.question-card h1').innerText()!==answers[0].prompt)throw new Error('Determinism mismatch');
 await input.fill('not a Fortnite answer');await input.press('Enter');await page.getByRole('status').filter({hasText:'Try another'}).waitFor();
 if(!await input.isEditable())throw new Error('Invalid answer locked input');
 await input.fill(answers[0].answer.slice(0,2));if(await page.locator('.suggestions button').count())throw new Error('Two-character suggestions');
 const st=performance.now();await input.fill(answers[0].answer.slice(0,3));await page.locator('.suggestions button').first().waitFor();const suggestionsMs=Math.round(performance.now()-st);
 await measure(page,'game',width);
 if(width!==1440){
  await page.locator('.suggestions button').first().click();
  if(!(await input.inputValue()).length)throw new Error('Suggestion selection failed');
  await input.fill(answers[0].answer);await input.press('Enter');await page.clock.runFor(3700);await page.waitForTimeout(3800);
  await measure(page,'rarity',width);
  const visible=await page.locator('.rarity-banner').evaluate(e=>{const r=e.getBoundingClientRect(),p=document.querySelector('.phone-app').getBoundingClientRect();return r.left>=p.left&&r.right<=p.right&&r.top>=p.top&&r.bottom<=p.bottom;});
  if(!visible)throw new Error('Clipped rarity banner '+width);
  await context.close();continue;
 }
 for(let i=0;i<7;i++){
  if(await page.locator('.question-card h1').innerText()!==answers[i].prompt)throw new Error('Round order');
  await input.fill(answers[i].answer);await input.press('Enter');
  if(i===0){await page.clock.runFor(3700);await page.locator('.rarity-drop.is-revealed').waitFor();await page.waitForTimeout(3800);await measure(page,'rarity',width);}
  else await page.getByRole('button',{name:'Skip',exact:true}).click();
  await page.getByRole('button',{name:'NEXT QUESTION',exact:true}).click();
  if(i<6){await input.waitFor();if(!/00:20|00:19/.test(await page.locator('.clock').innerText()))throw new Error('Deadline reset');}
 }
 await page.getByRole('heading',{name:'YOUR DROP'}).waitFor();await measure(page,'results',width);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('deep-drop:stats:v2')));if(saved.totalAnswers!==7||saved.correctAnswers!==7||saved.gamesPlayed!==1)throw new Error('Saved scoring mismatch '+JSON.stringify(saved));
 await page.getByRole('button',{name:/Unlimited Fresh questions/}).click();await input.waitFor();
 const firstPractice=await page.locator('.question-card h1').innerText();await page.clock.runFor(20100);await page.getByRole('heading',{name:'TIME’S UP'}).waitFor();
 await page.getByRole('button',{name:'NEXT QUESTION',exact:true}).click();await input.waitFor();
 const practiceHistory=await page.evaluate(()=>JSON.parse(localStorage.getItem('deep-drop-practice-history-v1')));if(practiceHistory.length!==2)throw new Error('Practice history');
 measurements.push({homeReadyMs,dropReadyMs,suggestionsMs,catalogLoadedAtHome,sevenDailyRoundsScored:true,invalidRetry:true,twoCharacterSuggestionsSuppressed:true,unlimitedTimeout:true,practiceHistoryPersisted:true,firstPractice});
 await context.close();
}
const direct=await browser.newPage({viewport:{width:1440,height:1000}});
await direct.goto('http://127.0.0.1:4173');await direct.getByRole('button',{name:/Unlimited Fresh questions/}).click();await direct.getByRole('textbox',{name:'YOUR ANSWER'}).waitFor();
if(await direct.evaluate(()=>JSON.parse(localStorage.getItem('deep-drop-practice-history-v1')??'[]').length)!==1)throw new Error('Direct Unlimited route');
await direct.close();measurements.push({directUnlimitedFromHome:true});
await browser.close();const result={measurements,externalRequests:external,pageErrors:errors};fs.writeFileSync('docs/phase5c-browser-smoke.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(errors.length||external.length)process.exitCode=1;
