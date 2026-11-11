'use strict';
const Core=WordTrailCore;
const TOPICS=WordTrailVocabulary.topics;
const $=selector=>document.querySelector(selector);
const COPY={
 en:{name:'Word Trail',topics:'Topics',menu:'Menu',help:'How to play',close:'Close',guesses:n=>`Guesses: ${n}`,history:'Guesses',order:'(A–Z)',distance:'Distance',input:'Guesses are arranged alphabetically',submit:'Submit',newGame:'New puzzle',giveUp:'Give up',answer:'Answer',gaveUp:w=>`The answer is ${w}.`,reveal:'Reveal Letter',space:'Space',wordList:'Word list',searchTopics:'Find a topic',searchWords:'Find a word',count:n=>`${n.toLocaleString('en')} words`,noResults:'No matches',more:'Show more',invalid:'Not in this topic. Try another word or open the word list.',empty:'Enter a word.',ambiguous:'Which word did you mean?',duplicate:w=>`You already guessed ${w}.`,corrected:(a,b)=>`Accepted “${a}” as “${b}”.`,won:(w,n)=>`You found it: ${w}! ${n} guesses.`,hint:mask=>`Revealed: ${mask}`,above:n=>`Target is ${n} places above`,below:n=>`Target is ${n} places below`,found:'Correct',switchLanguage:'Switch to Chinese',helpText:['Choose a topic and guess a word, name or title from its word list. You have unlimited guesses.','↑ means the answer comes earlier in A–Z order. ↓ means it comes later. The number is the difference between positions in this topic’s word list; adjacent words are 1 apart.','Guesses are sorted alphabetically. One missing, extra, wrong or swapped letter is accepted. If several words match, choose the one you meant.','Spaces, accents and punctuation are flexible. Use Word list to browse or Reveal Letter for a hint. Each language has its own puzzle. Grey keys indicate unavailable starting letters. All letter keys return to normal after you enter the first letter.']},
 zh:{name:'猜词游戏',topics:'选择话题',menu:'菜单',help:'玩法',close:'关闭',guesses:n=>`已猜 ${n} 次`,history:'猜测',order:'（拼音顺序）',distance:'距离',input:'猜测按拼音顺序排列',submit:'提交',newGame:'换一个词',giveUp:'放弃',answer:'答案',gaveUp:w=>`答案是“${w}”。`,reveal:'提示一个字',space:'空格',wordList:'话题词库',searchTopics:'搜索话题',searchWords:'搜索词语',count:n=>`${n.toLocaleString('zh')} 个词`,noResults:'没有匹配的词',more:'显示更多',invalid:'这个词不在当前话题中，换个词试试，或打开话题词库。',empty:'请输入词语。',ambiguous:'你想输入哪个词？',duplicate:w=>`你已经猜过“${w}”了。`,corrected:(a,b)=>`已将“${a}”识别为“${b}”。`,won:(w,n)=>`猜对了！答案是“${w}”，共猜了 ${n} 次。`,hint:mask=>`已提示：${mask}`,above:n=>`目标在上方 ${n} 位`,below:n=>`目标在下方 ${n} 位`,found:'猜对了',switchLanguage:'切换到英文版',helpText:['选择话题，从话题词库中猜一个词、人名或片名，猜测次数不限。','↑ 表示答案按拼音排序更靠前；↓ 表示更靠后。数字为两个词在当前话题词库中的位置差，相邻词相差一位。','猜测记录按拼音顺序排列。少一个、多一个、错一个或相邻两个字颠倒时，可以容错；匹配到多个词时由你选择。','中文版使用独立的中文词库，并非英文旁的翻译。可打开话题词库查词，或用提示功能揭示一个字。']}
};
let language='en';try{language=localStorage.getItem('word-trail-language')==='zh'?'zh':'en';}catch{}
let currentTopic='seasonings',game;
const games=new Map();
let revealed=0,notice='',noticeKind='';
const text=()=>COPY[language];
const finished=()=>game.won||game.givenUp;
const topic=()=>TOPICS.find(t=>t.id===currentTopic);
function node(tag,className,value){const el=document.createElement(tag);if(className)el.className=className;if(value!==undefined)el.textContent=value;return el;}
function message(value='',kind=''){notice=value;noticeKind=kind;$('#feedback').textContent=value;$('#feedback').className=kind;}
function start(id=currentTopic,force=false){
 currentTopic=id;const key=`${language}:${id}`,previous=games.get(key)?.target;
 if(force||!games.has(key)){games.set(key,Core.createGame(topic(),language,previous));}
 game=games.get(key);revealed=game.revealed||0;$('#guess').value='';$('#suggestions').replaceChildren();message();render();
}
function render(){
 const t=text();document.documentElement.lang=language==='en'?'en':'zh-CN';document.body.dataset.lang=language;document.title=t.name;
 $('.brand>span:last-child').innerHTML=language==='en'?'word<br>trail':'猜词<br>游戏';
 $('#category').textContent=topic().label[language];$('#attempt-count').textContent=t.guesses(game.guesses.length);
 $('#history-label').replaceChildren(document.createTextNode(t.history+' '),node('span','',t.order));$('#distance-label').textContent=t.distance;
 $('#input-label').textContent=t.input;$('#submit').textContent=finished()?t.newGame:t.submit;$('#guess').disabled=finished();$('#guess').setAttribute('aria-label',t.submit);
 $('#language').textContent=language==='en'?'中文':'English';$('#language').setAttribute('aria-label',t.switchLanguage);
 for(const [id,label]of [['topics-back',t.topics],['help',t.help],['menu',t.menu],['close-dialog',t.close]])$('#'+id).setAttribute('aria-label',label);
 $('#reveal span').textContent=t.reveal;$('#reveal').disabled=finished()||revealed>=Array.from(game.target).filter(c=>/[\p{L}\p{N}]/u.test(c)).length;$('#space').textContent=t.space;$('#space').disabled=finished();
 $('#give-up').textContent=t.giveUp;$('#give-up').disabled=finished();
 const blank=$('.guess-row.blank'),ordered=Core.orderedGuesses(game);
 if(game.givenUp){ordered.push({word:game.target,delta:0,answer:true});ordered.sort((a,b)=>Core.compare(a.word,b.word,language));}
 const rows=ordered.map(g=>{
  const row=node('div','guess-row'),word=node('span','word',g.word),distance=node('span','distance'+(g.delta<0?' above':g.answer?' revealed':g.delta===0?' won':''));
  if(g.answer)distance.textContent=t.answer;else if(g.delta===0)distance.textContent='✓';else distance.append(node('span','arrow',g.delta<0?'↑':'↓'),node('span','',Math.abs(g.delta).toLocaleString(language)));
  distance.setAttribute('aria-label',g.answer?t.answer:g.delta===0?t.found:(g.delta<0?t.above:t.below)(Math.abs(g.delta)));row.append(word,distance);return row;
 });
 // The unknown word belongs after all guesses below it and before all guesses above it.
 const upperIndex=ordered.findIndex(g=>g.delta<0);
 rows.splice(upperIndex<0?rows.length:upperIndex,0,blank);
 blank.hidden=finished();
 $('#history').replaceChildren(...rows);
 if(game.givenUp)message(t.gaveUp(game.target));
 else if(game.won)message(t.won(game.target,game.guesses.length),'success');
 renderKeyboard();
}
function insert(value){if(finished())return;const input=$('#guess');const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;input.setRangeText(value,start,end,'end');input.focus();updateKeyboardHints();}
function erase(){if(finished())return;const input=$('#guess');let start=input.selectionStart??input.value.length,end=input.selectionEnd??start;if(start===end&&start>0)start-=Array.from(input.value.slice(0,start)).at(-1).length;input.setRangeText('',start,end,'end');input.focus();updateKeyboardHints();}
function renderKeyboard(){
 const initials=Core.possibleInitials(game),showHints=!Core.normalize($('#guess').value);
 $('#keyboard').replaceChildren(...['QWERTYUIOP','ASDFGHJKL','ZXCVBNM⌫'].map(letters=>{const row=node('div','key-row');for(const letter of letters){const key=node('button','key'+(letter==='⌫'?' delete':showHints&&!initials.has(letter.toLowerCase())?' unavailable':''),letter);key.type='button';key.disabled=finished();key.setAttribute('aria-label',letter==='⌫'?(language==='en'?'Backspace':'退格'):letter);key.onclick=()=>letter==='⌫'?erase():insert(letter.toLowerCase());row.append(key);}return row;}));
}
function updateKeyboardHints(){
 const showHints=!Core.normalize($('#guess').value),initials=showHints?Core.possibleInitials(game):new Set();
 for(const key of document.querySelectorAll('#keyboard .key:not(.delete)'))key.classList.toggle('unavailable',showHints&&!initials.has(key.textContent.toLowerCase()));
}
$('#guess').addEventListener('input',updateKeyboardHints);
function guess(selected){
 if(finished()){start(currentTopic,true);$('#guess').focus();return;}
 const input=$('#guess').value.trim();if(!input){message(text().empty,'error');return;}
 const result=Core.submit(game,input,selected);$('#suggestions').replaceChildren();
 if(result.kind==='ambiguous'){
  message(text().ambiguous);for(const candidate of result.candidates){const button=node('button','',candidate);button.type='button';button.onclick=()=>guess(candidate);$('#suggestions').append(button);}return;
 }
 if(result.kind==='invalid'){message(text().invalid,'error');return;}
 if(result.kind==='duplicate'){message(text().duplicate(result.word),'error');return;}
 if(result.entry){$('#guess').value='';render();if(result.kind==='won')message(text().won(result.entry.word,game.guesses.length),'success');else if(result.entry.corrected)message(text().corrected(input,result.entry.word));else message();}
}
$('#guess-form').addEventListener('submit',e=>{e.preventDefault();guess();});
$('#space').onclick=()=>insert(' ');
$('#give-up').onclick=()=>{if(finished())return;Core.giveUp(game);$('#guess').value='';$('#suggestions').replaceChildren();render();};
$('#reveal').onclick=()=>{if(finished())return;revealed++;game.revealed=revealed;let n=0;const mask=Array.from(game.target).map(c=>/[\p{L}\p{N}]/u.test(c)?(++n<=revealed?c:'＿'):c).join(' ');render();message(text().hint(mask));};
$('#language').onclick=()=>{language=language==='en'?'zh':'en';try{localStorage.setItem('word-trail-language',language);}catch{}start();};
function openDialog(title){$('#dialog-title').textContent=title;$('#dialog-content').replaceChildren();if(!$('#dialog').open)$('#dialog').showModal();}
function closeDialog(){$('#dialog').close();if(!finished())$('#guess').focus();}
$('#close-dialog').onclick=closeDialog;
$('#dialog').addEventListener('click',e=>{if(e.target===$('#dialog')){const r=$('#dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
function showTopics(){
 openDialog(text().topics);const search=node('input','dialog-search');search.placeholder=text().searchTopics;search.setAttribute('aria-label',text().searchTopics);const list=node('div','topics');
 function update(){list.replaceChildren(...TOPICS.filter(t=>Core.normalize(t.label[language]).includes(Core.normalize(search.value))).map(t=>{const b=node('button','topic'+(t.id===currentTopic?' active':''),t.label[language]);b.append(node('span','',text().count(Core.unique(t.words[language],language).length)));b.onclick=()=>{start(t.id);closeDialog();};return b;}));}
 search.oninput=update;$('#dialog-content').append(search,list);update();
}
function showWordList(){
 openDialog(topic().label[language]);const count=node('p','word-count',text().count(game.words.length)),search=node('input','dialog-search');search.placeholder=text().searchWords;search.setAttribute('aria-label',text().searchWords);
 const list=node('div','word-list'),more=node('button','load-more',text().more);let limit=120;
 function update(){const q=Core.normalize(search.value),matches=game.words.filter(w=>Core.normalize(w).includes(q));list.replaceChildren(...matches.slice(0,limit).map(w=>{const b=node('button','',w);b.disabled=finished();b.onclick=()=>{closeDialog();$('#guess').value=w;updateKeyboardHints();$('#guess').focus();};return b;}));if(!matches.length)list.append(node('p','empty-list',text().noResults));more.hidden=matches.length<=limit;}
 search.oninput=()=>{limit=120;update();};more.onclick=()=>{limit+=120;update();};$('#dialog-content').append(count,search,list,more);update();
}
$('#topics-back').onclick=showTopics;
$('#help').onclick=()=>{openDialog(text().help);const copy=node('div','dialog-copy');for(const paragraph of text().helpText)copy.append(node('p','',paragraph));$('#dialog-content').append(copy);};
$('#menu').onclick=()=>{openDialog(text().menu);const actions=node('div','menu-actions');for(const [label,fn]of [[text().topics,showTopics],[text().wordList,showWordList],[text().newGame,()=>{start(currentTopic,true);closeDialog();}]]){const b=node('button','',label);b.onclick=fn;actions.append(b);}$('#dialog-content').append(actions);};
start();
