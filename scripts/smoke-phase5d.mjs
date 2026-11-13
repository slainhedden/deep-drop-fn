import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const fixture=JSON.parse(fs.readFileSync('/tmp/p5d-browser-answers.json','utf8'))[0],results=[],errors=[],external=[];
try{
 for(const method of ['mouse','keyboard','touch','timeout']){
  const context=await browser.newContext({viewport:{width:method==='touch'?375:1440,height:900},hasTouch:method==='touch'}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173'))external.push(r.url());});
  await page.clock.install({time:new Date('2026-11-11T12:00:00Z')});await page.goto('http://127.0.0.1:4173');
  await page.getByRole('button',{name:'PLAY TODAY',exact:true}).click();await page.getByRole('button',{name:'START GAME',exact:true}).waitFor();await page.clock.pauseAt(await page.evaluate(()=>Date.now()+1000));await page.getByRole('button',{name:'START GAME',exact:true}).click();
  const input=page.getByRole('textbox',{name:'YOUR ANSWER'});await input.fill(fixture.answer.slice(0,-1));await input.press('Enter');
  const choices=page.getByRole('group',{name:'Answer clarification'});await choices.waitFor();
  await input.press('Escape');if(await choices.count())throw Error('Dismiss failed');await input.press('Enter');await choices.waitFor();
  await page.getByRole('button',{name:'Report missing answer',exact:true}).click();
  const report=JSON.parse(await page.getByRole('textbox',{name:'Missing answer report'}).inputValue());if(report.attemptedAnswer!==fixture.answer.slice(0,-1))throw Error('Wrong report attempt');
  await page.getByRole('textbox',{name:'Report explanation'}).fill('Local browser check');
  await context.grantPermissions(['clipboard-read','clipboard-write']);await page.getByRole('button',{name:'Copy report',exact:true}).click();await page.getByText('Copied locally.',{exact:true}).waitFor();const copied=JSON.parse(await page.evaluate(()=>navigator.clipboard.readText()));if(copied.questionId!==report.questionId||copied.explanation!=='Local browser check')throw Error('Clipboard mismatch');
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download report',exact:true}).click()]);
  const saved=JSON.parse(fs.readFileSync(await download.path(),'utf8'));if(saved.explanation!=='Local browser check')throw Error('Export mismatch');
  await page.getByRole('button',{name:'Close report',exact:true}).click();
  const clockVisible=await page.locator('.clock').evaluate(e=>{const r=e.getBoundingClientRect(),frame=document.querySelector('.screen').getBoundingClientRect();return r.top>=frame.top&&r.bottom<=frame.bottom&&r.bottom<=document.querySelector('.question-card').getBoundingClientRect().top;});if(!clockVisible)throw Error('Deadline scrolled out of view');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Overflow');
  await page.screenshot({path:`docs/screenshots/phase5d-${method}-clarification.png`,fullPage:true});
  if(method==='timeout'){
   await page.clock.fastForward(19000);await input.press('Enter');await page.clock.fastForward(1100);await page.getByText('TIME’S UP',{exact:true}).waitFor();
   if(await page.getByRole('group',{name:'Answer clarification'}).count())throw Error('Late confirmation remained');
  }else{
   const confirm=page.getByRole('button',{name:`Confirm ${fixture.answer}`,exact:true});
   if(method==='keyboard'){await input.focus();await input.press('Tab');if(!await confirm.evaluate(e=>e===document.activeElement))throw Error('Keyboard focus order');await page.keyboard.press('Enter');}else if(method==='touch')await confirm.tap();else await confirm.click();
   await page.getByRole('button',{name:'NEXT QUESTION',exact:true}).waitFor();
   if(await choices.count())throw Error('Confirmation remained after score');
   await page.clock.fastForward(4000);await page.waitForTimeout(3800);
   if(!((await page.locator('.banner-points').innerText()).includes(fixture.points.toLocaleString())))throw Error('Canonical score mismatch');
   await page.screenshot({path:`docs/screenshots/phase5d-${method}-confirmed.png`,fullPage:true});
  }
  results.push({method,reportExport:true,reportCopy:true,deadlinePreserved:true,overflow:false});await context.close();
 }
 fs.writeFileSync('docs/phase5d-browser-smoke.json',JSON.stringify({results,errors,external},null,2)+'\n');
 if(errors.length||external.length)throw Error('Browser errors or external requests');console.log(JSON.stringify(results));
}finally{await browser.close();}
