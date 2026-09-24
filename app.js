(() => {
 'use strict';
 const $=id=>document.getElementById(id), E=SwipeTen;
 const KEY='swipe-ten.best.v1', FALL=5400, GAP=420;
 let goal=10,run,current,state='home',raf=0,last=0,elapsed=0,fall=0,gap=0,countdown=0,questionNumber=0,drag=null,offset=0,bests={},storageOK=true,sound=false,audio=null,returnState='playing';
 try{const data=JSON.parse(localStorage.getItem(KEY)||'{}');for(const n of [10,25])if(Number.isFinite(data?.[n])&&data[n]>0)bests[n]=data[n];}catch{storageOK=false;}
 function show(id){for(const name of ['home','game','result'])$(name).hidden=name!==id;}
 function bestLabel(){ $('best-home').replaceChildren(document.createTextNode('BEST TIME '));const span=document.createElement('span');span.textContent=bests[goal]?`${E.formatTime(bests[goal])} s`:'—';$('best-home').append(span); }
 function beep(ok){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(ok?660:180,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(ok?1000:100,audio.currentTime+.1);gain.gain.setValueAtTime(.08,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.14);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.15);}catch{} }
 function buttons(enabled){$('left').disabled=$('right').disabled=!enabled;}
 function paint(){const height=$('stage').clientHeight;const end=Math.max(45,height-$('card').offsetHeight-35);const y=-150+(end+150)*Math.min(fall/FALL,1);$('card').style.transform=`translate(calc(-50% + ${offset}px), ${y}px) rotate(${offset/18}deg)`;$('card').classList.toggle('to-left',offset < -20);$('card').classList.toggle('to-right',offset > 20);}
 function next(){const previous=current?.text;current=E.question(Math.random,previous);questionNumber++;fall=0;offset=0;drag=null;$('card').hidden=false;$('expression').textContent=current.text;$('question-label').textContent=`QUESTION ${String(questionNumber).padStart(2,'0')}`;$('feedback').textContent='';buttons(true);paint();}
 function start(){cancelAnimationFrame(raf);run=E.createRun(goal);current=null;elapsed=0;fall=0;gap=0;questionNumber=0;drag=null;offset=0;countdown=3000;state='countdown';show('game');$('correct').textContent='0';$('goal').textContent=`/ ${goal}`;$('timer').innerHTML='0.00<small>s</small>';$('progress').style.width='0%';$('feedback').textContent='';$('card').hidden=true;$('countdown').hidden=false;$('countdown').textContent='3';$('pause').disabled=false;buttons(false);last=performance.now();raf=requestAnimationFrame(tick);}
 function updateClock(dt){elapsed+=dt;$('timer').firstChild.textContent=E.formatTime(elapsed);}
 function tick(now){const dt=Math.max(0,now-last);last=now;
  if(state==='countdown'){countdown-=dt;$('countdown').textContent=Math.max(1,Math.ceil(countdown/1000));if(countdown<=0){$('countdown').hidden=true;state='playing';next();}}
  else if(state==='playing'){updateClock(dt);fall+=dt;paint();if(fall>=FALL)submit('miss',true);}
  else if(state==='gap'){updateClock(dt);gap-=dt;if(gap<=0){state='playing';next();}}
  if(['countdown','playing','gap'].includes(state))raf=requestAnimationFrame(tick);
 }
 function submit(direction,fromFrame=false){if(state!=='playing')return;if(!fromFrame){const now=performance.now(),dt=Math.max(0,now-last);updateClock(dt);fall+=dt;last=now;if(fall>=FALL)direction='miss';}
  const correct=E.answer(run,current,direction);drag=null;offset=0;buttons(false);$('card').hidden=true;$('correct').textContent=run.correct;$('progress').style.width=`${100*run.correct/run.goal}%`;$('feedback').classList.toggle('wrong',!correct);$('feedback').textContent=correct?'正解！':`${direction==='miss'?'見逃し':'おしい！'} ${current.text} = ${current.value}`;beep(correct);
  if(run.done){finish();return;}state='gap';gap=GAP;
 }
 function finish(){state='result';cancelAnimationFrame(raf);buttons(false);const record=!bests[goal]||elapsed<bests[goal];if(record){bests[goal]=elapsed;try{localStorage.setItem(KEY,JSON.stringify(bests));storageOK=true;}catch{storageOK=false;}}
  $('result-caption').textContent=`${goal}問、クリア！`;$('result-time').replaceChildren(document.createTextNode(E.formatTime(elapsed)));const small=document.createElement('small');small.textContent='秒';$('result-time').append(small);$('new-best').hidden=!record;$('result-correct').textContent=run.correct;$('result-miss').textContent=run.miss;$('result-rate').textContent=`${Math.round(100*run.correct/(run.correct+run.miss))}%`;$('result-best').textContent=`${goal}問 BEST TIME  ${E.formatTime(bests[goal])} s`;$('storage-note').textContent=storageOK?'ベストタイムはこのブラウザーに保存されます。':'ベストタイムを保存できませんでした。この画面では確認できます。';show('result');$('again').focus();
 }
 function pause(){if(!['playing','gap','countdown'].includes(state))return;const now=performance.now(),dt=Math.max(0,now-last);if(state==='playing'){updateClock(dt);fall+=dt;}else if(state==='gap'){updateClock(dt);gap-=dt;}else countdown-=dt;returnState=state;state='paused';cancelAnimationFrame(raf);drag=null;offset=0;buttons(false);$('pause-dialog').showModal();}
 function resume(){if(state!=='paused')return;$('pause-dialog').close();state=returnState;last=performance.now();buttons(state==='playing');raf=requestAnimationFrame(tick);}
 function home(){cancelAnimationFrame(raf);state='home';drag=null;$('pause-dialog').close();show('home');bestLabel();$('start').focus();}
 document.querySelectorAll('.mode').forEach(button=>button.addEventListener('click',()=>{goal=Number(button.dataset.goal);document.querySelectorAll('.mode').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});bestLabel();}));
 $('start').onclick=start;$('again').onclick=start;$('back').onclick=home;$('pause').onclick=pause;$('resume').onclick=resume;$('quit').onclick=home;$('left').onclick=()=>submit('left');$('right').onclick=()=>submit('right');$('pause-dialog').addEventListener('cancel',e=>{e.preventDefault();resume();});
 $('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'SOUND ON':'SOUND OFF';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'効果音をオフにする':'効果音をオンにする');if(sound)beep(true);};
 $('stage').addEventListener('pointerdown',e=>{if(state!=='playing'||drag||e.isPrimary===false||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};$('stage').setPointerCapture(e.pointerId);});
 $('stage').addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;offset=Math.max(-160,Math.min(160,e.clientX-drag.x));paint();});
 $('stage').addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag=null;offset=0;if(Math.abs(dx)>=44&&Math.abs(dx)>Math.abs(dy)*1.15)submit(dx>0?'right':'left');else paint();});
 for(const event of ['pointercancel','lostpointercapture'])$('stage').addEventListener(event,()=>{drag=null;offset=0;if(state==='playing')paint();});
 document.addEventListener('keydown',e=>{if(e.repeat)return;if(state==='playing'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();submit(e.key==='ArrowRight'?'right':'left');}else if(e.key==='Escape'&&['playing','gap','countdown'].includes(state)){e.preventDefault();pause();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('blur',pause);window.addEventListener('resize',()=>{if(state==='playing')paint();});bestLabel();
})();
