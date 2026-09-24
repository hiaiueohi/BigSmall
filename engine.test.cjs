const {test}=require('node:test');
const assert=require('node:assert/strict');
require('./engine.js');
const E=globalThis.SwipeTen;
test('10 is right; 9 is left; mistakes do not increase correct count',()=>{assert.equal(E.isCorrect({value:10},'right'),true);assert.equal(E.isCorrect({value:9},'left'),true);assert.equal(E.isCorrect({value:10},'left'),false);const r=E.createRun(10);E.answer(r,{value:10},'left');E.answer(r,{value:10},'miss');assert.equal(r.correct,0);assert.equal(r.miss,2);});
test('both goals finish on the required correct answer and stop accepting answers',()=>{for(const goal of [10,25]){const r=E.createRun(goal);for(let n=1;n<=goal;n++){E.answer(r,{value:10},'right');assert.equal(r.done,n===goal);}E.answer(r,{value:1},'right');assert.equal(r.correct,goal);assert.equal(r.miss,0);}});
test('generated expressions have correct nonnegative integer answers and include all operations and directions',()=>{let seed=42;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);const ops=new Set(),sides=new Set();for(let i=0;i<10000;i++){const q=E.question(random);const value=q.op==='+'?q.a+q.b:q.op==='−'?q.a-q.b:q.a*q.b;assert.equal(q.value,value);assert.ok(Number.isInteger(value)&&value>=0);ops.add(q.op);sides.add(value>=10);}assert.equal(ops.size,3);assert.equal(sides.size,2);});
test('time is displayed in hundredths of a second and invalid goals are rejected',()=>{assert.equal(E.formatTime(12345),'12.35');assert.equal(E.formatTime(-1),'0.00');assert.throws(()=>E.createRun(0));});
