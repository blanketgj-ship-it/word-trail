(function(root){
 'use strict';
 const comparators={en:new Intl.Collator('en',{sensitivity:'base'}),zh:new Intl.Collator('zh-Hans-u-co-pinyin',{sensitivity:'base'})};
 function normalize(value){return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');}
 function compare(a,b,lang='en'){return comparators[lang].compare(a,b)||a.localeCompare(b);}
 function unique(words,lang='en'){const result=new Map();for(const word of words){const key=normalize(word);if(key&&!result.has(key))result.set(key,word);}return [...result.values()].sort((a,b)=>compare(a,b,lang));}
 // One insertion, deletion, substitution or adjacent-letter transposition.
 function oneEdit(a,b){
  a=Array.from(a);b=Array.from(b);if(Math.abs(a.length-b.length)>1)return false;
  if(a.length===b.length){const bad=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])bad.push(i);return bad.length===1||bad.length===2&&bad[1]===bad[0]+1&&a[bad[0]]===b[bad[1]]&&a[bad[1]]===b[bad[0]];}
  if(a.length>b.length)[a,b]=[b,a];let i=0,j=0,skipped=false;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;}else{if(skipped)return false;skipped=true;j++;}}return true;
 }
 function resolve(input,words){
  const key=normalize(input),exact=words.filter(w=>normalize(w)===key);if(exact.length)return {kind:'exact',word:exact[0]};
  if(Array.from(key).length<2)return {kind:'invalid',candidates:[]};
  const candidates=words.filter(w=>oneEdit(key,normalize(w)));
  return candidates.length===1?{kind:'corrected',word:candidates[0]}:candidates.length?{kind:'ambiguous',candidates}:{kind:'invalid',candidates:[]};
 }
 function createGame(topic,lang='en',previous=null,rng=Math.random){
  const words=unique(topic.words[lang],lang);if(words.length<2)throw Error('A topic needs at least two entries');
  const pool=words.filter(w=>w!==previous),target=pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];
  return {topicId:topic.id,lang,words,target,guesses:[],lo:0,hi:words.length-1,won:false,givenUp:false};
 }
 function submit(game,input,selected){
  if(game.won||game.givenUp)return {kind:'finished'};
  const resolved=selected?{kind:'exact',word:game.words.find(w=>w===selected)}:resolve(input,game.words);
  if(!resolved.word)return resolved;
  if(game.guesses.some(g=>g.word===resolved.word))return {kind:'duplicate',word:resolved.word};
  const index=game.words.indexOf(resolved.word),targetIndex=game.words.indexOf(game.target),delta=targetIndex-index;
  const entry={word:resolved.word,input:String(input).trim(),delta,corrected:normalize(input)!==normalize(resolved.word)};
  game.guesses.push(entry);
  if(!delta){game.won=true;game.lo=index;game.hi=index;}
  else if(delta>0)game.lo=Math.max(game.lo,index+1);else game.hi=Math.min(game.hi,index-1);
  return {kind:game.won?'won':'accepted',entry};
 }
 function giveUp(game){
  if(game.won||game.givenUp)return {kind:'finished'};
  game.givenUp=true;
  return {kind:'given-up',word:game.target};
 }
 function possibleInitials(game){
  return new Set(game.words.slice(game.lo,game.hi+1).map(word=>normalize(word).charAt(0)).filter(letter=>/^[a-z]$/.test(letter)));
 }
 function orderedGuesses(game){return [...game.guesses].sort((a,b)=>compare(a.word,b.word,game.lang));}
 const api={normalize,compare,unique,oneEdit,resolve,createGame,submit,giveUp,possibleInitials,orderedGuesses};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WordTrailCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
