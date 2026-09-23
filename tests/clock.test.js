import test from 'node:test';
import assert from 'node:assert/strict';
import {serverDate,nextReset,conductors} from '../public/train-clock.js';
test('reset is 19:00 Pacific in summer and winter',()=>{
 for(const [instant,expected] of [['2026-09-24T02:00:00Z','2026-09-24T00:00:00.000Z'],['2026-12-24T03:00:00Z','2026-12-24T00:00:00.000Z']])assert.equal(serverDate(new Date(instant)).toISOString(),expected);
});
test('next reset handles both daylight saving transitions',()=>{
 for(const [instant,expected] of [['2026-03-08T03:00:00Z','2026-03-09T02:00:00.000Z'],['2026-11-01T02:00:00Z','2026-11-02T03:00:00.000Z'],['2026-09-24T01:59:59Z','2026-09-24T02:00:00.000Z']])assert.equal(nextReset(new Date(instant)).toISOString(),expected);
});
test('same reset instant converts to each visitor timezone',()=>{
 const reset=nextReset(new Date('2026-09-23T12:00:00Z'));
 const hour=zone=>new Intl.DateTimeFormat('en',{timeZone:zone,hour:'2-digit',hourCycle:'h23'}).format(reset);
 assert.equal(hour('America/Los_Angeles'),'19');assert.equal(hour('Asia/Seoul'),'11');assert.equal(hour('Europe/Berlin'),'04');
});
test('all seven conductors preserve names and pending Thursday',()=>{assert.equal(conductors.length,7);assert.equal(conductors[3],null);assert.equal(conductors[4],'미스터MM');});
import {seasonDay,actionInstant,actions,pickups} from '../public/season-plan.js';
test('Day 17 anchor advances at Pacific reset, independent of viewer timezone',()=>{
 assert.equal(seasonDay(new Date('2026-09-23T18:00:00Z')),17);
 assert.equal(seasonDay(new Date('2026-09-24T01:59:59Z')),17);
 assert.equal(seasonDay(new Date('2026-09-24T02:00:00Z')),18);
 assert.equal(actionInstant(17,'12:00').toISOString(),'2026-09-23T14:00:00.000Z');
});
test('PDF upcoming captures match six coordinates, levels and days',()=>{
 assert.deepEqual(actions.filter(a=>a.kind==='capture').map(a=>[a.day,a.x,a.y,a.level]),[[17,337,412,5],[17,662,412,5],[18,662,587,5],[20,412,500,6],[20,587,500,6],[21,500,412,6]]);
});
test('previous-evening releases are on their actual action day and precede pickups',()=>{
 assert.equal(actions.find(a=>a.x===812&&a.y===737).day,17);
 assert.equal(actions.find(a=>a.kind==='handoff').day,19);
 for(const a of actions.filter(a=>a.kind!=='capture')){
  const pickup=pickups.find(p=>p[2]===a.x&&p[3]===a.y&&p[0]===a.dependency);
  assert.ok(pickup);if(pickup[1])assert.ok(actionInstant(pickup[0],pickup[1])-actionInstant(a.day,a.time)>=3600000);
 }
});
import {weekKey} from '../public/train-clock.js';
test('weekly rollover is Sunday 19:00 Pacific in summer and winter',()=>{
 assert.equal(weekKey(new Date('2026-09-28T01:59:59Z')),'2026-09-21');
 assert.equal(weekKey(new Date('2026-09-28T02:00:00Z')),'2026-09-28');
 assert.equal(weekKey(new Date('2026-12-28T02:59:59Z')),'2026-12-21');
 assert.equal(weekKey(new Date('2026-12-28T03:00:00Z')),'2026-12-28');
});
import {conductorWeeks} from '../public/train-clock.js';
test('conductor history keeps the supplied roster under its original week',()=>{
 assert.deepEqual(conductorWeeks['2026-09-21'],conductors);
 assert.equal(conductorWeeks['2026-09-28'],undefined);
});
