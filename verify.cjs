'use strict';
const assert=require('node:assert/strict');
const Core=require('./core.js'),data=require('./vocabulary.js');
function topic(words){return {id:'test',words:{en:words,zh:words}};}
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS',name);}
check('One-letter mistakes: substitution, missing, extra, transposition',()=>{
 for(const [a,b]of [['applf','apple'],['aple','apple'],['appple','apple'],['appel','apple'],['ct','cat']])assert.equal(Core.oneEdit(a,b),true,`${a} -> ${b}`);
 for(const [a,b]of [['apple','apple'],['apzz','apple'],['applezz','apple'],['dog','cat']])assert.equal(Core.oneEdit(a,b),false,`${a} -> ${b}`);
});
check('Exact matches take precedence; ambiguous mistakes do not guess the answer',()=>{
 assert.equal(Core.resolve('cat',['cat','bat']).kind,'exact');assert.equal(Core.resolve('cot',['cat','cut']).kind,'ambiguous');
 const g=Core.createGame(topic(['cat','cut','dog']),'en',null,()=>0);assert.equal(Core.submit(g,'cot').kind,'ambiguous');assert.equal(g.guesses.length,0);assert.equal(Core.submit(g,'cot','cut').entry.word,'cut');
});
check('Names, titles, punctuation, accents and spaces',()=>{
 assert.equal(Core.resolve('beyonce',['Beyoncé']).kind,'exact');assert.equal(Core.resolve('spiderman',['Spider-Man']).kind,'exact');
 assert.equal(Core.resolve('  TOM   HANKS ',['Tom Hanks']).kind,'exact');assert.equal(Core.resolve('schindlers list',["Schindler’s List"]).kind,'exact');
 assert.equal(Core.resolve('Taylor Swfit',['Taylor Swift']).word,'Taylor Swift');
});
check('Alphabetic history, exact distance and monotonic bounds',()=>{
 const g=Core.createGame(topic(['apple','banana','cherry','date','elderberry']),'en',null,()=>.5);
 Core.submit(g,'elderberry');Core.submit(g,'apple');Core.submit(g,'banana');
 assert.deepEqual(Core.orderedGuesses(g).map(g=>g.word),['apple','banana','elderberry']);
 assert.deepEqual(g.guesses.map(g=>g.delta),[-2,2,1]);assert.equal(g.lo,2);assert.equal(g.hi,3);
 assert.equal(Core.submit(g,'banana').kind,'duplicate');assert.equal(Core.submit(g,'zzzzzz').kind,'invalid');assert.equal(g.guesses.length,3);
 assert.equal(Core.submit(g,'cherry').kind,'won');assert.equal(g.lo,g.hi);assert.equal(Core.submit(g,'date').kind,'finished');
});
check('Chinese independent vocabulary, pinyin order and character typo',()=>{
 const g=Core.createGame(topic(['西瓜','苹果','香蕉']),'zh',null,()=>0);assert.deepEqual(g.words,['苹果','西瓜','香蕉']);
 assert.equal(Core.resolve('苹国',g.words).word,'苹果');assert.equal(Core.submit(g,'苹国').kind,'won');
});
check('Vocabulary integrity and both languages of all 24 topics',()=>{
 assert.equal(data.topics.length,24);assert.equal(new Set(data.topics.map(t=>t.id)).size,24);
 for(const t of data.topics)for(const lang of ['en','zh']){
  assert.ok(t.words[lang].length>=80,`${t.id}/${lang}`);const g=Core.createGame(t,lang,null,()=>.5);
  assert.ok(g.words.length>1);assert.equal(new Set(g.words.map(Core.normalize)).size,g.words.length);
  assert.equal(Core.submit(g,g.target).kind,'won');
  const next=Core.createGame(t,lang,g.target,()=>.5);assert.notEqual(next.target,g.target);assert.equal(next.guesses.length,0);
 }
});
check('Common expected topic entries are present',()=>{
 for(const [id,lang,word]of [['seasonings','en','ketchup'],['animals','en','capybara'],['food','en','ice cream'],['space','en','black hole'],['celebrities','en','Taylor Swift'],['movies','en','Interstellar'],['celebrities','zh','周杰伦'],['movies','zh','霸王别姬']])assert.ok(data.topics.find(t=>t.id===id).words[lang].includes(word),word);
});
check('Give up reveals the answer without a win or extra guess',()=>{
 const g=Core.createGame(topic(['apple','mango','zebra']),'en',null,()=>.5);
 Core.submit(g,'apple');const n=g.guesses.length;
 assert.deepEqual(Core.giveUp(g),{kind:'given-up',word:'mango'});assert.equal(g.won,false);assert.equal(g.givenUp,true);assert.equal(g.guesses.length,n);
 assert.equal(Core.submit(g,'mango').kind,'finished');assert.equal(Core.giveUp(g).kind,'finished');
 const next=Core.createGame(topic(['apple','mango','zebra']));assert.equal(next.givenUp,false);
});
check('Keyboard initials use remaining words, independent of the secret target',()=>{
 const g=Core.createGame(topic(['apple','delta','mango','xenon','zebra']),'en',null,()=>.5);
 Core.submit(g,'apple');Core.submit(g,'zebra');assert.deepEqual([...Core.possibleInitials(g)],['d','m','x']);
 g.target='xenon';assert.deepEqual([...Core.possibleInitials(g)],['d','m','x']);
});
console.log(`${checks} checks passed.`);
for(const lang of ['en','zh'])console.log(lang,data.topics.reduce((sum,t)=>sum+Core.unique(t.words[lang],lang).length,0),'topic entries');
