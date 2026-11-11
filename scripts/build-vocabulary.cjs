'use strict';
const fs=require('node:fs'),path=require('node:path');
const dataRoot=path.resolve(__dirname,'../../.local-data');
const synsets=new Map(),index=new Map(),children=new Map();
for(const line of fs.readFileSync(path.join(dataRoot,'wordnet/data.noun'),'utf8').split('\n')){
 if(!/^\d/.test(line))continue;
 const [meta,gloss]=line.split(' | '),t=meta.trim().split(/\s+/),count=parseInt(t[3],16);let p=4;const words=[];
 for(let i=0;i<count;i++){words.push(t[p]);p+=2;}
 const pointers=Number(t[p++]),parents=[];for(let i=0;i<pointers;i++){const type=t[p],offset=t[p+1],pos=t[p+2];p+=4;if((type==='@'||type==='@i')&&pos==='n')parents.push(offset);}
 synsets.set(t[0],{id:t[0],domain:Number(t[1]),words,parents,gloss});
 for(const parent of parents){if(!children.has(parent))children.set(parent,[]);children.get(parent).push(t[0]);}
}
for(const line of fs.readFileSync(path.join(dataRoot,'wordnet/index.noun'),'utf8').split('\n')){
 if(!line||/^\s/.test(line))continue;const t=line.trim().split(/\s+/),n=Number(t[2]);index.set(t[0],t.slice(-n));
}
const chinese=new Map();for(const line of fs.readFileSync(path.join(dataRoot,'omw-1.4/cow/wn-data-cmn.tab'),'utf8').split('\n')){
 const [key,type,word]=line.trim().split('\t');if(!key?.endsWith('-n')||type!=='cmn:lemma'||!word||!/^\p{Script=Han}{2,12}$/u.test(word))continue;
 const id=key.slice(0,8);if(!chinese.has(id))chinese.set(id,[]);chinese.get(id).push(word);
}
function descendants(seeds){const seen=new Set(),stack=seeds.flatMap(w=>{const [lemma,sense]=w.split('#');const ids=index.get(lemma);if(!ids){console.warn(`Missing seed ${w}`);return [];}return [ids[Number(sense||1)-1]];});while(stack.length){const id=stack.pop();if(seen.has(id))continue;seen.add(id);stack.push(...(children.get(id)||[]));}return seen;}
const specs=[
 ['animals','Animals','动物',[5],[]],
 ['food','Food & Drinks','食物与饮料',[13],[]],
 ['seasonings','Seasonings, Herbs & Spices','调味料与香料',[],['condiment','spice#2','herb#2']],
 ['travel','Travel & Holidays','旅行与度假',[],['travel','journey','tourism','hotel','luggage','tourist','passport','transportation']],
 ['nature','Nature & Weather','自然与天气',[17,19],[]],
 ['home','Home & Garden','家居与园艺',[],['furniture','dwelling','kitchen_utensil','home_appliance','garden_tool','room','bedclothes','tableware']],
 ['sports','Sports & Games','体育与游戏',[],['sport','athletic_game','sports_equipment','game']],
 ['space','Space & Astronomy','宇宙与天文',[],['celestial_body','astronomy','spacecraft','cosmos','galaxy','orbit','astronaut']],
 ['tech','Technology','科技',[],['computer','computing','computer_science','software','electronic_equipment','telecommunication','robot']],
 ['art','Art & Design','艺术与设计',[],['art','fine_arts','painting','sculpture','drawing','architecture','design']],
 ['jobs','Jobs & Professions','职业',[],['worker','professional','occupation']],
 ['fashion','Clothes & Accessories','服饰与配饰',[],['clothing','jewelry','footwear','fabric','headdress','bag#4']],
 ['feelings','Feelings & Emotions','情绪与感受',[12],[]],
 ['plants','Plants & Flowers','植物与花卉',[20],[]],
 ['body','Body & Anatomy','人体',[8],[]],
 ['health','Health & Medicine','健康与医学',[],['medicine','disease','symptom','therapy','medical_instrument','drug']],
 ['music','Music & Instruments','音乐与乐器',[],['musical_instrument','music','musical_composition','musician','musical_notation']],
 ['science','Science','科学',[],['natural_science','scientific_instrument','chemical_element','chemical_compound','scientist']],
 ['geography','Places & Geography','地点与地理',[15],[]],
 ['vehicles','Vehicles & Transport','交通工具',[],['vehicle','vessel','aircraft','public_transport','road']],
 ['books','Books & Literature','书籍与文学',[],['literary_composition','literary_genre','book','writer','poetry']],
 ['mythology','Mythology & Folklore','神话与传说',[],['mythology','mythical_being','deity','legend']],
 ['celebrities','Celebrities','明星',[],[]],
 ['movies','Movies','电影',[],[]]
];
const original=require('./seeds.cjs'),curated=require('./curated.cjs');
const collators={en:new Intl.Collator('en',{sensitivity:'base'}),zh:new Intl.Collator('zh-Hans-u-co-pinyin',{sensitivity:'base'})};
const clean=w=>w.replace(/_/g,' ').replace(/\s+/g,' ').trim();
const topics=specs.map(([id,en,zh,domains,seeds])=>{
 const ids=descendants(seeds);for(const [key,s]of synsets)if(domains.includes(s.domain))ids.add(key);
 const english=new Set(original.find(t=>t.id===id)?.words||[]),mandarin=new Set();
 for(const key of ids){for(const raw of synsets.get(key).words){const word=clean(raw);if((/^[a-z][a-z '-]*[a-z]$/.test(word)||(id==='geography'||id==='mythology')&&/^[A-Za-z][A-Za-z '-]*[A-Za-z]$/.test(word))&&word.length<=48&&word.split(' ').length<=5)english.add(word);}
 for(const word of chinese.get(key)||[])mandarin.add(word);}
 for(const w of curated[id]?.en||[])english.add(w);for(const w of curated[id]?.zh||[])mandarin.add(w);
 // Standard spelling of familiar multiword terms.
 const fixes={icecream:'ice cream',blackhole:'black hole',lightyear:'light year',tshirt:'T-shirt'};
 for(const [a,b]of Object.entries(fixes))if(english.delete(a))english.add(b);
 const words={en:[...english].sort(collators.en.compare),zh:[...mandarin].sort(collators.zh.compare)};
 const easy={en:original.find(t=>t.id===id)?.words.map(w=>fixes[w]||w)||[],zh:[]};
 for(const lang of ['en','zh'])easy[lang]=[...new Set([...easy[lang],...(curated[id]?.[lang]||[])])].filter(w=>words[lang].includes(w));
 return {id,label:{en,zh},words,easy};
});
const output={version:2,source:'Princeton WordNet 3.0 + Chinese Open Wordnet + curated seed lists; NOT Oxford dictionary data',topics};
fs.writeFileSync(path.join(__dirname,'../vocabulary.js'),'/* WordNet and Chinese Open Wordnet: see licenses/ and SOURCES.md. */\n(function(root){ const data = '+JSON.stringify(output)+'; if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.WordTrailVocabulary=data;})(typeof globalThis!=="undefined"?globalThis:this);\n');
console.table(topics.map(t=>({topic:t.id,en:t.words.en.length,zh:t.words.zh.length})));
console.log('Totals:',topics.reduce((v,t)=>v+t.words.en.length,0),'English;',topics.reduce((v,t)=>v+t.words.zh.length,0),'Chinese');
