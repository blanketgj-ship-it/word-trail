'use strict';
const TOPICS = [
['animals','🐾','动物世界','Animals','ant bear bee bird butterfly camel cat cheetah chicken cow crab crocodile deer dog dolphin duck eagle elephant fish flamingo fox frog giraffe goat goose gorilla hamster hedgehog hippo horse jellyfish kangaroo koala leopard lion lizard lobster monkey mosquito mouse octopus otter owl panda parrot peacock penguin pig rabbit raccoon rhino seal shark sheep snake spider squirrel swan tiger turtle whale wolf zebra'],
['food','🥑','美食时刻','Food','almond apple avocado bacon banana bean beef biscuit blueberry bread broccoli burger butter cabbage cake candy carrot cheese cherry chicken chocolate coconut coffee cookie corn cucumber donut egg garlic grape honey icecream juice kiwi lemon lettuce mango melon milk mushroom noodle nut olive onion orange pancake pasta peach peanut pear pepper pineapple pizza plum potato pumpkin rice salad salmon sandwich sausage soup spinach steak strawberry sugar tea tomato tuna waffle watermelon yogurt'],
['travel','🧳','环游世界','Travel','adventure airport backpack beach bicycle boat border bridge bus cabin camera campsite canal capital castle city coast compass country cruise desert destination ferry flight forest guide harbor highway hill hostel hotel island journey lake landmark luggage map mountain museum ocean palace park passport path pilot plane port railway resort river road route safari sea ship station street suitcase taxi temple tent ticket tourist town train tram trip tunnel valley village visa waterfall'],
['nature','🌿','自然万物','Nature','acorn bamboo bark blossom branch breeze bush cactus canyon cave cliff cloud coast coral creek dawn desert dew drought dusk earth fern field flame flood flower fog forest frost glacier grass hail hill iceberg jungle lake leaf lightning meadow moon moss mountain mud ocean pebble petal pine pond rain rainbow reef river rock root sand seed sky snow soil spring star steam stone storm stream sunlight thunder tide tree valley volcano water wave wind wood'],
['home','🛋️','居家日常','Home','alarm armchair attic balcony basement basket bathroom bathtub bed bedroom blanket blender bookshelf bottle bowl broom bucket cabinet candle carpet ceiling chair chimney clock closet couch counter curtain cushion desk dishwasher door drawer dresser fan faucet fence fireplace floor fork fridge garage garden gate glass hallway hanger heater kettle key kitchen knife lamp laundry mirror mug oven pan pillow plate porch roof rug shelf shower sink soap sofa spoon staircase stove table towel tray vacuum vase wall wardrobe window'],
['sports','🏸','运动玩家','Sports','archery badminton baseball basketball bat bicycle bowling boxing canoe champion climbing coach cricket cycling dance diving exercise fencing fitness football frisbee goal golf gymnastics handball helmet hiking hockey hurdle javelin jogging judo karate kayak marathon medal net paddle player polo race racket referee relay rowing rugby running sailing score skating skiing soccer softball sprint stadium surfing swimming target team tennis tournament track training triathlon volleyball walking weight wrestling yoga'],
['space','🪐','漫游宇宙','Space','alien asteroid astronaut astronomy atmosphere atom aurora axis blackhole capsule comet constellation cosmos crater crescent debris dwarf eclipse energy equator explorer flare galaxy gas gravity helium hydrogen ice infinity jupiter launch lightyear lunar mars mercury meteor meteorite moon nebula neptune observatory orbit oxygen planet plasma probe pulsar quasar radar radiation rocket rover satellite saturn shuttle sky solar spaceship spectrum star station sun supernova telescope universe uranus vacuum venus void'],
['tech','💻','科技未来','Technology','adapter algorithm antenna app audio backup battery binary bit bluetooth browser cable cache camera charger chip circuit click cloud code computer console cookie cursor data database desktop device digital display download drone email engine file firewall flash folder font gadget hardware icon input internet keyboard laptop laser link memory microphone mobile monitor mouse network notification online output password pixel platform printer processor program robot router scanner screen script sensor server signal simulation smartphone software speaker storage tablet terminal update upload username video virtual virus webcam website wifi window wireless'],
['art','🎨','艺术灵感','Art','abstract actor album animation architecture artist audience author ballet band bass beat brush camera canvas cartoon cello ceramic choir cinema clay collage color comedy concert costume craft dance design director drama drawing drum easel exhibit film flute gallery guitar harmony illustration ink instrument jazz landscape lyric melody mosaic museum music note novel opera orchestra paint painting palette paper pencil performance photo piano pigment poem poetry portrait poster pottery rhythm sculpture sketch song stage studio symphony theater tune violin watercolor'],
['jobs','🧑‍🚀','职业图鉴','Jobs','accountant actor architect artist astronaut athlete author baker barber biologist builder butcher captain carpenter cashier chef chemist cleaner coach coder consultant cook dancer dentist designer detective developer director doctor driver editor electrician engineer farmer firefighter florist gardener guard guide hairdresser journalist judge lawyer librarian lifeguard manager mechanic musician nurse painter pharmacist photographer pilot plumber poet police professor programmer receptionist reporter researcher sailor scientist secretary singer soldier surgeon tailor teacher technician therapist translator vet waiter writer'],
['fashion','🧢','穿搭衣橱','Fashion','apron backpack bag belt beret blazer blouse boot bracelet brooch button cap cardigan chain cloak coat collar cotton crown denim diamond dress earring fabric fleece glove gown handbag hat headband heel helmet hoodie jacket jeans jewel kimono lace leather linen loafer mitten necklace outfit pajamas pants pearl pendant pocket poncho purse raincoat ribbon ring robe sandal scarf shawl shirt shoe shorts silk skirt sleeve slipper sneaker sock suit sunglasses sweater swimsuit tie tights top trousers tshirt tunic uniform veil vest wallet watch wool zipper'],
['feelings','☀️','情绪色彩','Feelings','admiration affection amusement anger anxiety awe boredom bravery calm care cheer comfort compassion confidence confusion courage curiosity delight desire despair disappointment disgust doubt eagerness embarrassment empathy enthusiasm envy excitement fear fondness frustration gratitude grief guilt happiness hate hope horror humility insecurity inspiration interest jealousy joy kindness loneliness longing love melancholy misery nostalgia optimism panic passion patience peace pity pleasure pride rage regret relief resentment respect sadness satisfaction shame shock sorrow stress surprise sympathy tenderness terror thrill trust uncertainty wonder worry']
].map(([id,icon,name,en,words])=>({id,icon,name,en,words:[...new Set(words.split(' '))].sort()}));
const $=s=>document.querySelector(s);
let state;
function pick(words,previous){const choices=words.filter(w=>w!==previous);return choices[Math.floor(Math.random()*choices.length)];}
function start(id=state?.topic.id||'animals'){
 const topic=TOPICS.find(t=>t.id===id), previous=state?.topic.id===id?state.target:null;
 state={topic,target:pick(topic.words,previous),guesses:[],lo:0,hi:topic.words.length-1,won:false};
 $('#topics').replaceChildren(...TOPICS.map(t=>{const b=document.createElement('button');b.className='topic'+(t.id===id?' active':'');b.setAttribute('aria-pressed',String(t.id===id));b.innerHTML=`<span class="icon">${t.icon}</span><strong>${t.name}</strong><small>${t.en}</small>`;b.onclick=()=>start(t.id);return b;}));
 $('#category').textContent=`${topic.icon} ${topic.en.toUpperCase()} / ${topic.name}`;
 $('#subtitle').textContent=`答案藏在 ${topic.words.length} 个${topic.name}单词中 · 不限猜测次数`;
 $('#guess').value='';$('#guess').disabled=false;$('#submit').disabled=false;
 message('小提示：单词按 A–Z 排列，箭头告诉你往哪里找。');render();
}
function message(text,kind=''){$('#feedback').textContent=text;$('#feedback').className=kind;}
function render(){
 const {topic,lo,hi,guesses,won}=state,n=topic.words.length;
 $('#remaining').textContent=`${hi-lo+1} / ${n} 个候选词`;
 $('#range-fill').style.left=`${lo/n*100}%`;$('#range-fill').style.right=`${(n-1-hi)/n*100}%`;
 $('#lower').textContent=lo===0?'从 A 开始':`在 ${topic.words[lo-1]} 之后`;
 $('#upper').textContent=hi===n-1?'到 Z 结束':`在 ${topic.words[hi+1]} 之前`;
 $('#attempt-count').textContent=`${guesses.length} 次猜测`;
 if(!guesses.length){$('#history').innerHTML='<div class="empty"><span>⌁</span><h4>每段旅程，从一个词开始</h4><p>输入一个词，第一条线索就在这里。</p></div>';return;}
 $('#history').replaceChildren(...[...guesses].reverse().map((g,i)=>{const row=document.createElement('div');row.className='guess-row';const delta=topic.words.indexOf(state.target)-topic.words.indexOf(g);row.innerHTML=`<span class="number">${String(guesses.length-i).padStart(2,'0')}</span><strong>${g}</strong><span class="direction ${delta<0?'above':delta===0?'won':''}">${delta===0?'✓ 就是这个词！':`${delta<0?'↑ 上方':'↓ 下方'} ${Math.abs(delta)} 位`}</span>`;return row;}));
 if(won){$('#guess').disabled=true;$('#submit').disabled=true;}
}
$('#guess-form').addEventListener('submit',e=>{
 e.preventDefault();if(state.won)return;
 const word=$('#guess').value.trim().toLowerCase(),words=state.topic.words;
 if(!/^[a-z]+$/.test(word)){message('请输入一个英文单词，仅使用 A–Z 字母。','error');return;}
 const index=words.indexOf(word);
 if(index<0){message(`“${word}” 不在当前话题词库中。点击「查看话题词库」选择一个词，不计次数。`,'error');return;}
 if(state.guesses.includes(word)){message(`你已经猜过 “${word}” 了，试试另一个词吧。`,'error');return;}
 state.guesses.push(word);const targetIndex=words.indexOf(state.target),delta=targetIndex-index;
 if(delta===0){state.won=true;state.lo=index;state.hi=index;message(`🎉 找到了！答案是 ${word}，你用了 ${state.guesses.length} 次猜测。点击「换一个词」再玩一局。`,'success');}
 else{if(delta>0)state.lo=Math.max(state.lo,index+1);else state.hi=Math.min(state.hi,index-1);message(`目标在 ${word} 的${delta<0?'上方':'下方'} ${Math.abs(delta)} 位（当前话题 A–Z 词库中的位置差）。`);}
 $('#guess').value='';render();
});
$('#restart').onclick=()=>{start();$('#guess').focus();};
function openDialog(title){$('#dialog-title').textContent=title;$('#dialog-content').replaceChildren();$('#dialog').showModal();}
$('#help').onclick=()=>{openDialog('跟着字母，找到答案');$('#dialog-content').innerHTML='<p>① 选一个话题，系统会从该话题词库随机选取一个答案。</p><p>② 输入词库里的英文单词，大小写均可。词库按 A–Z 字母顺序排列。</p><p>③ <b>↑ 上方</b>：目标单词字母更靠前；<b>↓ 下方</b>：目标单词字母更靠后。数字是两个词在当前词库中的位置差，相邻为 1 位。</p><p>④ 例如词库为 apple、banana、cherry：猜 apple，答案为 cherry，就会提示「↓ 下方 2 位」。</p><p>不认识单词？打开话题词库，点击单词填入输入框。猜测次数不限，切换话题或换词将开始新的一局。</p>';};
$('#wordbook').onclick=()=>{openDialog(`${state.topic.icon} ${state.topic.name} · A–Z 词库`);const p=document.createElement('p');p.textContent=`共 ${state.topic.words.length} 个词。点击填入，随后点击「猜一下」。`;const list=document.createElement('div');list.className='word-list';state.topic.words.forEach(w=>{const b=document.createElement('button');b.textContent=w;b.onclick=()=>{if(!state.won){$('#guess').value=w;$('#dialog').close();$('#guess').focus();}};list.append(b);});$('#dialog-content').append(p,list);};
$('#close-dialog').onclick=()=>$('#dialog').close();
start();
