import { getScene,createGame,commitChoice,continueGame,previewChoice } from './life-engine.mjs';
import { getLifePortrait } from './life-content.mjs';
import { STORY_YEARS } from './story-timeline.mjs';
import { formatProtagonistText } from './protagonist-copy.mjs';
import { cleanStoryCopy } from './display-story-copy.mjs';

const $=s=>document.querySelector(s);
const esc=v=>formatProtagonistText(cleanStoryCopy(v)).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={energy:'精力',stress:'压力',bonds:'合作支持',money:'资金',engineering:'工程',communication:'沟通',leadership:'组织',ecosystem:'生态',reputation:'声誉',control:'控制权'};
const effects=obj=>Object.entries(obj??{}).filter(([,v])=>v).map(([k,v])=>`${names[k]??k} ${v>0?'+':''}${v}`).join(' · ')||'资源不变';
const routes={student:'求学',company:'创业',employee:'企业工程',studio:'工作室',sold:'交接之后',researcher:'研究'};
let samples=Array.from({length:STORY_YEARS.length},()=>[]),step=0,selected=0;

function setTab(tab){
  for(const el of document.querySelectorAll('[data-tab]'))el.setAttribute('aria-selected',String(el.dataset.tab===tab));
  for(const name of ['tree','mechanics'])$(`#${name}-panel`).hidden=name!==tab;
}
function sampleKey(state){
  return [state.route,state.life.partner,state.life.relationship,state.life.children,state.life.hobby,state.life.familyPractice,state.life.studyPace].join('|');
}
function sampleLabel(state){
  const p=getLifePortrait(state);
  const facets=p.facets??[];
  return [routes[state.route],...facets.slice(0,3).map(n=>n.status)].join(' · ');
}
function buildSamples(){
  // Real, reproducible paths only. These illustrative states never touch saves.
  for(let run=0;run<36;run++){
    let state=createGame('图鉴示例',`life-atlas-${run}`);
    let randomState=(run+1)*7919;
    const random=()=>{randomState^=randomState<<13;randomState^=randomState>>>17;randomState^=randomState<<5;return(randomState>>>0)/4294967296;};
    while(state.phase!=='ended'){
      if(['result','life-result'].includes(state.phase)){state=continueGame(state);continue;}
      const scene=getScene(state);
      if(state.phase==='life'&&!samples[state.step].some(s=>sampleKey(s)===sampleKey(state)))samples[state.step].push(state);
      const options=(state.phase==='life'?scene.options:state.phase==='prep'?scene.prep:scene.choices).filter(o=>previewChoice(state,o.id).available);
      const fixed=run<3&&state.phase==='life'?{
        2:['life-1984-lori','life-1984-maya','life-1984-single'],
        3:['life-1992-marry-parent','life-1992-marry-childfree','life-1992-single-childfree'],
        7:['life-1999-partner-first','life-1999-parallel','life-1999-friend-circle'],
      }[state.step]?.[run]:null;
      const choice=options.find(option=>option.id===fixed)??options[run<3?run%options.length:Math.floor(random()*options.length)];
      state=commitChoice(state,choice.id);
    }
  }
}
function syncControls(){
  $('#step-select').value=String(step);
  selected=Math.min(selected,samples[step].length-1);
  $('#route-select').innerHTML=samples[step].map((state,i)=>`<option value="${i}"${i===selected?' selected':''}>${esc(sampleLabel(state))}</option>`).join('');
}
function renderTree(){
  const base=samples[step][selected];
  const scene=getScene(base);
  const p=getLifePortrait(base);
  $('#tree-content').innerHTML=`<section class="scene-heading"><p class="crumb">${esc(scene.date)} · 黄二勋 ${esc(scene.age)} 岁 · 可达生活样本</p><h2>${esc(scene.title)}</h2><div class="scene-brief"><p><b>${esc(scene.place)}</b></p><p>相关人物 · ${scene.people.map(p=>esc(p.name)).join('；')}</p></div><p class="scene-prose">${esc(scene.story)}</p><p class="note">${(p.commitments??[]).map(n=>`${esc(n.label)} · ${esc(n.value)}`).join('　／　')}</p>${scene.echo?`<div class="echo">往事回响 · ${esc(scene.echo)}</div>`:''}</section><div class="options-grid">${scene.options.map(option=>{
    const preview=previewChoice(base,option.id);
    return `<article class="option"><h3>${esc(option.title)}</h3><p>${esc(option.description)}</p><p class="note">取舍 · ${esc(option.tradeoff)}</p><p class="echo">延续到后来 · ${esc(option.consequence)}</p><details><summary>展开这条生活安排的结果</summary><p>${esc(option.text)}</p><p class="effect">${esc(effects(preview.effects))}</p>${!preview.available?`<p>${esc(preview.reason)}</p>`:''}</details></article>`;
  }).join('')}</div><p><a href="./map.html">在决策地图里沿着这些选择继续走 →</a></p>`;
}

document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>setTab(button.dataset.tab)));
$('#step-select').addEventListener('change',()=>{step=Number($('#step-select').value);selected=0;syncControls();renderTree();});
$('#route-select').addEventListener('change',()=>{selected=Number($('#route-select').value);renderTree();});
$('#reset-path').addEventListener('click',()=>{step=0;selected=0;syncControls();renderTree();});
try{
  buildSamples();
  $('#step-select').innerHTML=samples.map((states,i)=>{const scene=getScene(states[0]);return`<option value="${i}">${String(i+1).padStart(2,'0')} · ${esc(scene.year)} · ${esc(scene.title)}</option>`;}).join('');
  syncControls();renderTree();
}catch(error){$('#tree-content').innerHTML='<p>生活样本暂时未能载入。可以刷新本页，或前往决策地图继续查看。</p>';$('#step-select').disabled=true;$('#route-select').disabled=true;$('#reset-path').disabled=true;}
