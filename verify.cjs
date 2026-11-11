const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map();function element(){return {style:{},value:'',disabled:false,children:[],setAttribute(){},append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},addEventListener(k,fn){this[k]=fn},focus(){},showModal(){},close(){}}}
const document={querySelector(s){if(!nodes.has(s))nodes.set(s,element());return nodes.get(s)},createElement:element};
const ctx=vm.createContext({document,console});vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'app.js'),'utf8'),ctx);
vm.runInContext(`
for(const t of TOPICS){
 start(t.id);state.target=t.words[Math.floor(t.words.length/2)];
 const submit=w=>{$('#guess').value=w;$('#guess-form').submit({preventDefault(){}})};
 submit(t.words[0]);if(state.lo!==1)throw Error('lower bound');
 submit(t.words[t.words.length-1]);if(state.hi!==t.words.length-2)throw Error('upper bound');
 const before=state.guesses.length;submit(t.words[0]);submit('notaword');submit('<script>');if(state.guesses.length!==before)throw Error('validation');
 submit(state.target);if(!state.won||state.lo!==state.hi||!$('#guess').disabled)throw Error('win');
 const previous=state.target;start(t.id);if(state.target===previous||state.guesses.length)throw Error('reset');
}
console.log('PASS: 12 topics; bounds, validation, duplicate guesses, win and reset.');
console.log('Vocabulary:',TOPICS.reduce((n,t)=>n+t.words.length,0),'topic entries.');
`,ctx);

