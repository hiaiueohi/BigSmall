(function(root){
 'use strict';
 const randomInt=(min,max,random)=>min+Math.floor(random()*(max-min+1));
 function question(random=Math.random,previous=''){
  let result;
  for(let tries=0;tries<30;tries++){
   const op=randomInt(0,2,random),high=random()<.5;
   let a,b,value;
   if(op===0){a=randomInt(high?1:0,high?12:9,random);b=randomInt(high?Math.max(0,10-a):0,high?12:9-a,random);value=a+b;}
   else if(op===1){a=randomInt(high?10:0,20,random);b=randomInt(high?0:Math.max(0,a-9),high?a-10:a,random);value=a-b;}
   else{a=randomInt(high?2:0,high?9:9,random);b=randomInt(high?Math.ceil(10/a):0,high?9:(a===0?9:Math.floor(9/a)),random);value=a*b;}
   result={a,b,op:['+','−','×'][op],value};result.text=`${a} ${result.op} ${b}`;
   if(result.text!==previous)break;
  }
  return result;
 }
 function isCorrect(question,direction){return direction===(question.value>=10?'right':'left');}
 function createRun(goal){if(![10,25].includes(goal))throw new Error('Invalid goal');return {goal,correct:0,miss:0,done:false};}
 function answer(run,question,direction){if(run.done)return false;const correct=isCorrect(question,direction);if(correct)run.correct++;else run.miss++;run.done=run.correct===run.goal;return correct;}
 function formatTime(ms){return (Math.max(0,ms)/1000).toFixed(2);}
 root.SwipeTen={question,isCorrect,createRun,answer,formatTime};
})(globalThis);
