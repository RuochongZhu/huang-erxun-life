import { getStepCount } from './story-timeline.mjs';
import { formatProtagonistText } from './protagonist-copy.mjs';
import { cleanStoryCopy } from './display-story-copy.mjs';
import { getChoiceCopy } from './choice-copy.mjs';
import { LIFE_VALUES } from './life-dynamics.mjs';
import { previewChoices as previewPlanChoices } from './life-engine.mjs';
import { ROUTE_NAMES, ROUTE_ORDER, enumerateDecisions, buildOverview, replaySavedPath,
  getMapScene as getScene,previewMapChoice as previewChoice,validateMapSave as validateSave,
  getMapReport as getReport,mapNodeId,describeNode,memoryEntries } from './map-model.mjs';

// CATALOG is embedded by build-map.mjs, so this page also works from file://.
const SITE = 'https://play.socialai.buzz/';
const $ = s => document.querySelector(s);
const esc = v => formatProtagonistText(cleanStoryCopy(v)).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct = n => `${(n*100).toFixed(1).replace(/\.0$/,'')}%`;
const cardCopy=(option,state,scene,recorded=false)=>recorded?option:{...option,...getChoiceCopy(state,scene,option)};
const statNames = {money:'资金',energy:'精力',stress:'压力',bonds:'关系',engineering:'工程',communication:'沟通',leadership:'组织',ecosystem:'生态',reputation:'声誉',control:'控制权'};
const effectText = obj => Object.entries(obj??{}).filter(([,v])=>v).map(([k,v])=>`${statNames[k]??k} ${v>0?'+':''}${Math.round(v*10)/10}`).join(' · ') || '没有数值变化';
function impactHTML(impact) {
  if (!impact) return '';
  const values = LIFE_VALUES.filter(item => impact.values?.[item.key]).map(item =>
    `${item.label} ${impact.values[item.key] > 0 ? '+' : ''}${impact.values[item.key]}`).join(' · ');
  return `${impact.environment ? `<p>${esc(impact.environment)}</p>` : ''}
    ${(impact.reactions || []).map(reaction => `<p><strong>${esc(reaction.speaker)}</strong> · ${esc(reaction.text)}</p>`).join('')}
    ${(impact.events || []).map(event => `<section><h4>${event.tone === 'crisis' ? '危机' : '转机'} · ${esc(event.title)}</h4><p>${esc(event.text)}</p><details><summary>触发缘由与属性变化</summary><p>${esc(event.cause)}</p><p>${esc(effectText(event.statChanges))}</p></details></section>`).join('')}
    ${values ? `<p class="result-effect">人生积累 · ${esc(values)}</p>` : ''}`;
}
const hasRecordedPlan=frame=>frame?.choiceIds?.length>1&&frame.result.lastResult.plan?.items?.length>1;
const isActualChoice=(frame,choice)=>Boolean(frame&&(choice.recordedPlan||!hasRecordedPlan(frame)&&frame.choiceId===choice.option.id));
function recordedPlanHTML(plan){
  if(!plan?.items?.length)return '';
  return `<section class="recorded-plan" aria-label="当时整组安排"><h4>当时一起完成的安排</h4><ol>${plan.items.map(item=>`<li><strong>${esc(item.title)}</strong>${item.kind==='primary'&&Number.isFinite(item.weight)?`<span> · 投入 ${Math.round(item.weight*100)}%</span>`:''}<p>${esc(item.text||'')}</p>${item.kind==='extra'&&item.effects?`<p class="result-effect">${esc(effectText(item.effects))}</p>`:''}</li>`).join('')}</ol></section>`;
}
const clone = value => structuredClone(value);
const readStore = key => {try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
const writeStore = (key,value) => {try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{notify('浏览器未允许保存；可以下载 HTML 保留本次记录。');return false;}};
const nodeId = mapNodeId;
const sameState=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
let period='early',routeFilter='all',lastMapActive=null;
const periods={early:[0,2],fork:[2,5],middle:[5,8],late:[9,11],future:[12,15],all:[0,15]};
let portable = {};
try { portable=JSON.parse($('#portable-data').textContent); } catch { /* empty portable context */ }
const storageKey='jensen-map-workspace-v2'+(typeof portable.exportId==='string'?'-'+portable.exportId.replace(/[^a-z0-9-]/gi,'').slice(0,64):'');
const cached=readStore(storageKey);
const initial=cached&&typeof cached==='object'?cached:(portable.exportId?portable:{notes:readStore('jensen-map-notes-v1'),plan:readStore('jensen-map-plan-v1'),save:readStore('jensen-map-import-v1')});
const samples = CATALOG.states;
const overview = CATALOG.overview ?? buildOverview(samples);
let notes = {};
for(const [key,value] of Object.entries(initial.notes??{})) {
  if(typeof value==='string'&&key.length<180&&Object.keys(notes).length<600)notes[key]=value.slice(0,2000);
}
let imported = initial.save??null;
let saved = {ok:false,reason:'还没有试玩存档'};
let mode='structure',base=clone(samples[0]),expanded,prepId='',choiceId='',outcomeIndex=0,recordIndex=0;
let plan = null, walkFrames=[];
let selectedIsWalk=false;
let structureSelection=null;
function persist(){return writeStore(storageKey,{notes,plan,save:imported});}

function notify(message){$('#notice').hidden=false;$('#notice').textContent=message;}
function hideNotice(){$('#notice').hidden=true;}
function download(name,text,type){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function prepareScene(wantedPrep,wantedChoice,wantedOutcome=0){
  const scene=getScene(base);
  if(base.phase==='life'){prepId=null;expanded=enumerateDecisions(base);}
  else {
    const available=scene.prep.filter(p=>previewChoice(base,p.id).available);
    prepId=available.some(p=>p.id===wantedPrep)?wantedPrep:available[0].id;
    expanded=enumerateDecisions(base,prepId);
  }
  const choices=expanded.choices;
  choiceId=choices.some(c=>c.option.id===wantedChoice&&c.preview.available)?wantedChoice:choices.find(c=>c.preview.available).option.id;
  const selected=choices.find(c=>c.option.id===choiceId);
  outcomeIndex=selected.branches.some(b=>b.index===wantedOutcome)?wantedOutcome:selected.branches[0].index;
}
function refreshSaved(){
  const raw=imported??readStore('jensen-game-save');
  saved=raw?replaySavedPath(raw):{ok:false,reason:'此浏览器还没有试玩存档。'};
  $('#record-count').textContent=saved.ok?saved.frames.length:0;
}
function restorePlan(raw){
  if(!raw)return;
  if(!Array.isArray(raw.steps)||raw.steps.length>32)throw new Error('推演记录格式不正确');
  const checked=validateSave(raw.origin);
  if(!checked.ok||!['life','prep'].includes(checked.state.phase))throw new Error('推演起点无法验证：'+(checked.reason||'起点阶段不受支持'));
  let cursor=checked.state;
  const frames=[];
  for(const step of raw.steps){
    const e=enumerateDecisions(cursor,step.prepId);
    const c=e.choices.find(c=>c.option.id===step.choiceId&&c.preview.available);
    const b=c?.branches.find(b=>b.index===step.outcomeIndex);
    if(!b)throw new Error('推演分支无法验证');
    frames.push({base:cursor,expanded:e,choice:c,branch:b});cursor=b.next;
  }
  plan={origin:checked.state,steps:clone(raw.steps)};walkFrames=frames;
  if(!frames.length){base=clone(checked.state);selectedIsWalk=true;ensureVisible(base);}
}
function setMode(next){
  if(next!==mode&&next==='record')structureSelection={base:clone(base),prepId,choiceId,outcomeIndex,selectedIsWalk};
  if(next!==mode&&next==='structure'&&structureSelection){
    ({base,selectedIsWalk}=structureSelection);
    prepareScene(structureSelection.prepId,structureSelection.choiceId,structureSelection.outcomeIndex);
    structureSelection=null;
  }
  mode=next;
  $('#structure-tab').setAttribute('aria-selected',String(mode==='structure'));
  $('#record-tab').setAttribute('aria-selected',String(mode==='record'));
  $('#workspace').setAttribute('aria-labelledby',mode==='record'?'record-tab':'structure-tab');
  $('#legend-selected').textContent=mode==='record'?'实际走过的路线':'当前处境与准备下的去向';
  $('#overview-note').textContent=mode==='record'?'实线与着色节点来自真实存档；未做出的选择不会补入记录。':'每年先过生活，再作事业选择；早期分流，后面可以带着不同经历合流。';
  if(mode==='record'){
    refreshSaved();selectedIsWalk=false;
    if(saved.ok&&saved.frames.length){recordIndex=Math.min(recordIndex,saved.frames.length-1);selectRecord(recordIndex);return;}
  }
  render();
}
function selectSample(id,index){
  const node=overview.nodes.find(n=>n.id===id);
  const sampleId=index===undefined?node?.sampleIds[0]:Number(index);
  if(!node||sampleId===undefined||!node.sampleIds.includes(sampleId))return;
  base=clone(samples[sampleId]);selectedIsWalk=false;
  prepareScene();ensureVisible(base);render();
}
function ensureVisible(state){
  const [from,to]=periods[period];
  if(state.step<from||state.step>to)period=state.step<=2?'early':state.step<=5?'fork':state.step<=8?'middle':'late';
  if(routeFilter!=='all'&&routeFilter!==state.route)routeFilter='all';
  $('#period-filter').value=period;$('#route-filter').value=routeFilter;
}
function selectRecord(index){
  const f=saved.frames[index];if(!f)return;
  recordIndex=index;base=clone(f.base);
  const receipt=f.stage==='life'?null:f.prepared.evidence.at(-1);
  prepareScene(receipt?.optionId,f.choiceId,f.outcomeIndex);
  if(hasRecordedPlan(f)){
    const result=f.result.lastResult,preview=previewPlanChoices(f.prepared,f.choiceIds);
    const id=`recorded-plan-${f.stage}-${f.base.step}`;
    const nextScene=f.next.phase==='ended'?null:getScene(f.next);
    const option={id,title:result.title,description:'这是当时整组安排的实际结果；下方单项只作为另一种选择的对照。'};
    const recorded={option,preview,recordedPlan:true,branches:[{index:f.outcomeIndex,
      probability:preview.probabilities[f.outcomeIndex]??1,result:f.result,next:f.next,nextScene,
      ending:f.next.phase==='ended'?getReport(f.next).ending:null}]};
    expanded={...expanded,prepared:f.prepared,choices:[recorded,...expanded.choices]};
    choiceId=id;outcomeIndex=f.outcomeIndex;
  }
  ensureVisible(base);render();
}

function drawMap(){
  const host=$('#map'),nodeMap=new Map(overview.nodes.map(n=>[n.id,n])),edgeMap=new Map(overview.edges.map(e=>[`${e.from}>${e.to}`,e]));
  const active=mode==='record'?(saved.ok&&saved.frames.length?nodeId(saved.frames[recordIndex].base):null):nodeId(base);
  const visited=new Set(),traveled=new Set();
  if(mode==='record'&&saved.ok){
    for(const f of saved.frames){
      const from=nodeId(f.base);visited.add(from);
      if(!nodeMap.has(from))nodeMap.set(from,{...describeNode(f.base),sampleIds:[]});
      if(f.next.phase!=='ended'&&f.advanced){
        const to=nodeId(f.next),key=`${from}>${to}`;traveled.add(key);
        if(!nodeMap.has(to))nodeMap.set(to,{...describeNode(f.next),sampleIds:[]});
        if(!edgeMap.has(key))edgeMap.set(key,{from,to,choices:[],witnesses:[]});
      }
    }
  }
  if(mode==='structure'&&!nodeMap.has(nodeId(base)))nodeMap.set(nodeId(base),{...describeNode(base),sampleIds:[]});
  const [from,to]=periods[period],stages=[];
  for(let step=from;step<=to;step++)for(const stage of ['life','prep'])stages.push({step,stage});
  const nodes=[...nodeMap.values()].filter(n=>n.step>=from&&n.step<=to&&(routeFilter==='all'||n.route===routeFilter));
  const positions=new Map(),columnWidth=138,width=Math.max(host.parentElement.clientWidth,stages.length*columnWidth+40);
  const gap=(width-40)/stages.length;
  let maxRows=1;
  stages.forEach((stage,col)=>{
    const group=nodes.filter(n=>n.step===stage.step&&n.stage===stage.stage).sort((a,b)=>ROUTE_ORDER.indexOf(a.route)-ROUTE_ORDER.indexOf(b.route)||a.id.localeCompare(b.id));
    maxRows=Math.max(maxRows,group.length);
    group.forEach((n,row)=>positions.set(n.id,{x:20+gap*(col+.5),y:102+row*72}));
  });
  const height=Math.max(365,132+maxRows*72);
  host.style.width=`${width}px`;host.style.height=`${height}px`;
  const possible=new Set();
  if(mode==='structure'&&expanded)for(const choice of expanded.choices)for(const branch of choice.branches){
    if(branch.next.phase!=='ended')possible.add(`${nodeId(base)}>${nodeId(branch.next)}`);
  }
  const current=mode==='record'&&saved.ok&&['life','prep','choice'].includes(saved.state.phase)?nodeId(saved.state):null;
  let markup=stages.map((stage,i)=>{
    const n=nodes.find(n=>n.step===stage.step),label=n?.year??CATALOG.years[stage.step];
    return `<div class="stage-heading" style="left:${20+gap*i}px;width:${gap}px"><b>${esc(label)}</b><span>${stage.stage==='life'?'生活取舍':'事业行动'}</span></div>`;
  }).join('');
  markup+=`<svg class="map-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">${[...edgeMap.values()].filter(e=>positions.has(e.from)&&positions.has(e.to)).map(e=>{
    const a=positions.get(e.from),b=positions.get(e.to),strong=mode==='record'?traveled.has(`${e.from}>${e.to}`):possible.has(`${e.from}>${e.to}`);
    return `<path d="M ${a.x+52} ${a.y} C ${a.x+gap*.57} ${a.y} ${b.x-gap*.57} ${b.y} ${b.x-52} ${b.y}" fill="none" stroke="${strong?'#205543':'#b7c1b2'}" stroke-width="${strong?2.6:1.1}" opacity="${strong?1:mode==='record'?.18:.55}"/>`;
  }).join('')}</svg>`;
  markup+=nodes.map(n=>{
    const p=positions.get(n.id),recorded=visited.has(n.id),chosen=n.id===active;
    const disabled=mode==='record'?!recorded:!n.sampleIds.length&&n.id!==nodeId(base);
    const incoming=new Set([...edgeMap.values()].filter(e=>e.to===n.id).map(e=>e.from)).size;
    return `<button class="map-node ${chosen?'current':''} ${recorded?'visited':''} ${disabled?'faded':''} ${current===n.id?'record-current':''}" data-node="${esc(n.id)}" style="left:${p.x}px;top:${p.y}px" aria-label="${esc(n.year+' · '+(n.stage==='life'?'生活':'事业')+' · '+n.label+' · '+ROUTE_NAMES[n.route])}" aria-pressed="${chosen}" title="${esc(n.label+' · '+n.title)}" ${disabled?'disabled':''}><span class="node-label">${esc(n.label)}</span><span class="node-step">${esc(n.careerLabel??ROUTE_NAMES[n.route])}${incoming>1?' · 合流':''}${current===n.id?' · 当前':''}</span></button>`;
  }).join('');
  host.innerHTML=markup;
  host.querySelectorAll('[data-node]').forEach(button=>button.onclick=()=>{
    if(mode==='record'){const index=saved.frames.findIndex(f=>nodeId(f.base)===button.dataset.node);if(index>=0)selectRecord(index);}
    else selectSample(button.dataset.node);
  });
  const options=mode==='record'?[...nodeMap.values()].filter(n=>visited.has(n.id)):overview.nodes.filter(n=>n.sampleIds.length);
  $('#jump-node').innerHTML=options.map(n=>`<option value="${esc(n.id)}" ${n.id===active?'selected':''}>${esc(n.year)} · ${n.stage==='life'?'生活':'事业'} · ${esc(n.label)} · ${esc(n.careerLabel??ROUTE_NAMES[n.route])}</option>`).join('');
  $('#jump-node').disabled=!options.length;
  if(active&&active!==lastMapActive&&positions.has(active)){
    const point=positions.get(active),scroll=host.parentElement;
    if(point.x<scroll.scrollLeft+65||point.x>scroll.scrollLeft+scroll.clientWidth-65)scroll.scrollLeft=Math.max(0,point.x-scroll.clientWidth/2);
    if(point.y<scroll.scrollTop+65||point.y>scroll.scrollTop+scroll.clientHeight-65)scroll.scrollTop=Math.max(0,point.y-scroll.clientHeight/2);
  }
  lastMapActive=active;
  $('#sample-count').textContent=`当前 ${nodes.length} 个节点 / 全部 ${overview.nodes.length} 个 · ${overview.edges.length} 条可能连线`;
}

function renderRecord(){
  const host=$('#record-list');host.hidden=mode!=='record';
  if(mode!=='record')return;
  if(!saved.ok||!saved.frames.length){
    host.innerHTML=`<div class="empty"><h2>${saved.ok?'这一局还没有完成重大决策':'还没有可展示的记录'}</h2><p>${esc(saved.ok?'准备已保存在试玩中；等一项重大决策结算后，它就会出现在这里。':saved.reason)} 可在同一浏览器游玩后回来，或导入从本页导出的 JSON 存档。</p><a href="${SITE}">进入试玩 →</a> <button id="read-browser">重新读取本浏览器</button></div>`;
  }else{
    host.innerHTML=`<div class="record-head"><div><h2>${esc(saved.state.name)}的选择记录</h2><p>${imported?'来自导入文件':'来自本浏览器试玩'} · 已记录 ${saved.frames.length} 次决定 · ${saved.state.journal.length} / ${getStepCount(saved.state)} 站已完成 · ${saved.state.phase==='ended'?'本局已结束':'仍在进行，后续没有补写'}</p></div><button id="export-save">导出存档 JSON ↓</button></div><div class="record-strip" aria-label="已发生的决策">${saved.frames.map((f,i)=>`<button data-record="${i}" aria-pressed="${i===recordIndex}"><strong>${esc(f.result.lastResult.year)} · ${f.stage==='life'?'生活':'事业'}</strong><span>${esc(f.result.lastResult.title)}</span><span>→ ${esc(f.result.lastResult.label)}</span></button>`).join('')}</div><p class="record-hint">显示当时的准备、概率和已发生结果。你也可以点开未选分支作对照。 <button id="read-browser">重新读取本浏览器</button></p>`;
    $('#export-save').onclick=()=>download('再活一次-试玩存档.json',JSON.stringify(saved.state,null,2),'application/json');
    host.querySelectorAll('[data-record]').forEach(b=>b.onclick=()=>selectRecord(Number(b.dataset.record)));
  }
  $('#read-browser').onclick=()=>{imported=null;persist();setMode('record');};
}

function memoryHTML(){
  const memories=memoryEntries(base),node=overview.nodes.find(n=>n.id===nodeId(base));
  const incoming=new Set(overview.edges.filter(edge=>edge.to===nodeId(base)).map(edge=>edge.from)).size;
  const entries=list=>list.map(entry=>`<li><strong>${esc(entry.year)} · ${esc(entry.title)}</strong><p>${esc(entry.text)}</p></li>`).join('');
  const oldNote=notes[`${base.step}:${base.route}`];
  return `<section class="memory-panel"><div class="memory-heading"><h3>${incoming>1?'到了合流点，经历仍然跟着你':'带到这一站的经历'}</h3><span>${memories.length} 项生活选择已留下记录</span></div>${memories.length?`<ol class="memory-list">${entries(memories.slice(-3))}</ol>${memories.length>3?`<details><summary>更早的 ${memories.length-3} 项经历</summary><ol class="memory-list">${entries(memories.slice(0,-3))}</ol></details>`:''}`:`<p>${base.life?.historyKnown===false||!base.life?'旧版未记录的生活不会补写；这里仅还原实际存下来的职业决定。':'这是人生起点。做出的生活选择会在这里留下记录，带入后续叙事。'}</p>`}${mode==='structure'&&node?.sampleIds.length>1?`<label class="sample-picker">查看同一节点的不同来路<select id="context-sample">${node.sampleIds.some(index=>sameState(samples[index],base))?'':'<option value="" selected>当前推演路径 · 保留这份经历</option>'}${node.sampleIds.map(index=>{const state=samples[index],summary=(state.lifeJournal??[]).slice(-2).map(entry=>entry.choiceTitle).join(' → ')||'初始处境';return `<option value="${index}" ${sameState(state,base)?'selected':''}>${esc(summary)} · 资金 ${state.stats.money} / 精力 ${state.stats.energy}</option>`;}).join('')}</select></label><p class="notes-help">切换来路会查看另一份完整样本。沿下方结果继续，始终保留当前这份经历。</p>`:''}${oldNote?`<details><summary>原版职业组批注（已保留）</summary><p>${esc(oldNote)}</p></details>`:''}</section>`;
}
function bindSamplePicker(){if($('#context-sample'))$('#context-sample').onchange=event=>{if(event.target.value!=='')selectSample(nodeId(base),Number(event.target.value));};}
function renderLifeDetail(){
  const host=$('#detail'),scene=expanded.scene,choice=expanded.choices.find(item=>item.option.id===choiceId),branch=choice.branches[0];
  const result=branch.result.lastResult,frame=mode==='record'?saved.frames[recordIndex]:null;
  const actual=isActualChoice(frame,choice);
  const noteKey=nodeId(base);
  host.innerHTML=`<div class="scene-top"><div><p class="mode-label">${mode==='record'?'真实选择记录':selectedIsWalk?'沿已选经历推演':'可达样本预览'} · 第 ${base.step+1} / ${getStepCount(base)} 站 · 生活取舍</p><h2 id="scene-title" tabindex="-1">${esc(scene.year)} · ${esc(scene.title)}</h2></div><div class="actions">${walkFrames.length&&mode==='structure'?'<button id="resume-plan">继续上次推演</button>':''}${selectedIsWalk&&plan?.steps.length?'<button id="undo-step">回退一步</button>':''}</div></div>
    <div class="scene-context"><p>${esc(scene.date??scene.year)}${scene.age!==undefined?' · '+esc(scene.age)+' 岁':''}</p><p>${esc(scene.place??'')}</p>${scene.people?.length?`<p>相关人物 · ${scene.people.map(person=>typeof person==='string'?esc(person):esc(person.name)).join('；')}</p>`:''}</div>
    <div class="scene-body life-intro"><p class="scene-prose">${esc(scene.story)}</p>${scene.mission?`<section class="scene-mission"><h3>这次要办成的事 · ${esc(scene.mission.deadline)}</h3><p>${esc(scene.mission.objective)}</p><p>留下什么 · ${esc(scene.mission.deliverable)}</p></section>`:''}${scene.echo?`<p class="echo">${esc(scene.echo)}</p>`:''}</div>
    ${memoryHTML()}
    <div class="life-branch-grid"><section><div class="column-title"><b>1</b> 生活选择 · 这些决定不会靠抽签发生</div>${expanded.choices.map((item,index)=>`<button class="option-button" data-life-choice="${esc(item.option.id)}" aria-pressed="${item.option.id===choiceId}" ${item.preview.available?'':'disabled'}><strong>${String.fromCharCode(65+index)} · ${esc(cardCopy(item.option,base,scene,item.recordedPlan).title)}${isActualChoice(frame,item)?'<span class="actual-badge">已选择</span>':hasRecordedPlan(frame)?'<span> · 单项对照</span>':''}</strong><small>${esc(cardCopy(item.option,base,scene,item.recordedPlan).description)}</small><span class="option-prob">${esc(item.preview.available?cardCopy(item.option,base,scene,item.recordedPlan).tradeoff||effectText(item.preview.effects):item.preview.reason)}</span></button>`).join('')}</section>
    <section class="result-column"><div class="column-title"><b>2</b> 具体后果与下一步</div><div class="result-box"><p class="eyebrow">${actual?'本局已发生':frame?'另一条可能的人生':'设计推演 · 确定行动'}</p><h3>${esc(result.label)}</h3><p class="result-story">${esc(result.text)}</p>${impactHTML(result.impact)}${actual&&choice.recordedPlan?recordedPlanHTML(result.plan):''}${choice.option.consequence&&choice.option.consequence!==result.text?`<p class="life-consequence">会延续下去 · ${esc(choice.option.consequence)}</p>`:''}<p class="result-effect">资源与时间的代价<br>${esc(effectText(result.effects))}</p><div class="next-box"><p class="eyebrow">同一年 · 带着这份生活安排进入事业选择</p><h4>${esc(branch.nextScene?.title??branch.ending?.title)}</h4><details><summary>阅读下一幕如何承接</summary><p>${esc(branch.nextScene?.story??branch.ending?.text)}</p></details></div><button class="primary" id="follow-result">${mode==='record'?'从这里另走一条路':'沿这份生活安排继续 →'}</button></div></section></div>
    <div class="bottom-grid"><section><label class="note-label" for="node-note">节点批注<span id="note-state">本机保存</span></label><textarea id="node-note" maxlength="2000" placeholder="记下这个分支还缺少的后续、合流或人物线索…">${esc(notes[noteKey]??'')}</textarea><p class="notes-help">下载 HTML 会带走批注、推演和已读取的试玩记录。</p></section></div>`;
  host.querySelectorAll('[data-life-choice]').forEach(button=>button.onclick=()=>{prepareScene(null,button.dataset.lifeChoice);renderDetail();drawMap();$(`[data-life-choice="${choiceId}"]`).focus();});
  $('#node-note').oninput=event=>{notes[noteKey]=event.target.value;$('#note-state').textContent=persist()?'已保存到本浏览器':'请下载 HTML 保留';};
  $('#follow-result').onclick=followResult;
  if($('#resume-plan'))$('#resume-plan').onclick=resumePlan;
  if($('#undo-step'))$('#undo-step').onclick=undoStep;
  bindSamplePicker();
}

function renderDetail(){
  const host=$('#detail');
  host.hidden=mode==='record'&&(!saved.ok||!saved.frames.length);
  if(host.hidden)return;
  if(base.phase==='life'){renderLifeDetail();return;}
  const scene=expanded.scene;
  const currentChoice=expanded.choices.find(c=>c.option.id===choiceId);
  const currentBranch=currentChoice.branches.find(b=>b.index===outcomeIndex);
  const frame=mode==='record'?saved.frames[recordIndex]:null;
  const actual=isActualChoice(frame,currentChoice)&&frame.outcomeIndex===outcomeIndex;
  const next=currentBranch.nextScene;
  const ending=currentBranch.ending;
  const result=currentBranch.result.lastResult;
  host.innerHTML=`<div class="scene-top"><div><p class="mode-label">${mode==='record'?'真实选择记录':selectedIsWalk?'沿已选结果推演':'可达样本预览'} · 第 ${base.step+1} / ${getStepCount(base)} 站 · ${esc(ROUTE_NAMES[base.route])}</p><h2 id="scene-title" tabindex="-1">${esc(scene.year)} · ${esc(scene.title)}</h2></div><div class="actions">${walkFrames.length&&mode==='structure'?'<button id="resume-plan">继续上次推演</button>':''}${selectedIsWalk&&plan?.steps.length?'<button id="undo-step">回退一步</button>':''}</div></div>
    <div class="scene-context"><p><strong>${esc(scene.date)} · 黄二勋 ${scene.age} 岁</strong></p><p>${esc(scene.place)}</p><p>相关人物 · ${scene.people.map(p=>esc(p.name)).join('；')}</p></div>
    <div class="scene-body"><p class="scene-prose">${esc(scene.story)}</p><section class="scene-mission"><h3>这次要办成的事 · ${esc(scene.mission.deadline)}</h3><p>${esc(scene.mission.objective)}</p><p>留下什么 · ${esc(scene.mission.deliverable)}</p></section><p class="echo">${scene.echo?`此前选择留下的回响：${esc(scene.echo)}`:'这是这一段人生的起点。后续节点会读取之前留下的资源、承诺与经历。'}</p></div>
    ${memoryHTML()}<div class="stats" aria-label="准备后的当前状态">${Object.keys(statNames).map(k=>`<span>${statNames[k]}<b>${expanded.prepared.stats[k]}</b></span>`).join('')}</div>
    <div class="flow-caption"><h3>先做准备</h3><p>${frame?'这一项是你当时的准备，保持不变以还原概率。':'切换准备，观察下面的概率与代价怎样变化。'}</p></div>
    <div class="prep-grid">${getScene(base).prep.map(p=>{const v=previewChoice(base,p.id);return `<button class="prep-button" data-prep="${esc(p.id)}" aria-pressed="${p.id===prepId}" ${!v.available||frame?'disabled':''}><b>${p.id===prepId?'✓ ':''}${esc(cardCopy(p,base,getScene(base)).title)}</b><small>${esc(cardCopy(p,base,getScene(base)).description)}</small><small>${esc(v.available?effectText(v.effects):v.reason)}</small></button>`;}).join('')}</div>
    <div class="branch-grid"><div><div class="column-title"><b>1</b> 决策 · 选择一项查看 →</div>${expanded.choices.map((c,i)=>`<button class="option-button" data-choice="${esc(c.option.id)}" aria-pressed="${c.option.id===choiceId}" ${c.preview.available?'':'disabled'}><strong>${String.fromCharCode(65+i)} · ${esc(cardCopy(c.option,expanded.prepared,scene,c.recordedPlan).title)}${isActualChoice(frame,c)?'<span class="actual-badge">已选择</span>':hasRecordedPlan(frame)?'<span> · 单项对照</span>':''}</strong><small>${esc(cardCopy(c.option,expanded.prepared,scene,c.recordedPlan).description)}</small><span class="option-prob">${c.preview.available?(c.preview.probabilities.length===1?'确定行动':`顺利 ${pct(c.preview.probabilities[0])} · 其余有代价`):esc(c.preview.reason)}</span></button>`).join('')}</div>
    <div><div class="column-title"><b>2</b> 结果 · 点击展开后续 →</div><p class="decision-info">确定成本与变化：${esc(effectText(currentChoice.preview.effects))}</p>${currentChoice.recordedPlan&&currentChoice.preview.probabilities.length>1?`<p class="joint-probabilities">整组概率：顺利 ${pct(currentChoice.preview.probabilities[0])} · 勉强 ${pct(currentChoice.preview.probabilities[1])} · 失利 ${pct(currentChoice.preview.probabilities[2])}。下方保留本局实际抽到的结果。</p>`:""}${currentChoice.branches.map(b=>`<button class="outcome-button" data-outcome="${b.index}" aria-pressed="${b.index===outcomeIndex}"><span><strong>${esc(b.result.lastResult.label)}</strong><b>${pct(b.probability)}</b></span><span class="quality">${currentChoice.preview.probabilities.length===1?'确定发生':['顺利','勉强','失利'][b.index]}${isActualChoice(frame,currentChoice)&&frame.outcomeIndex===b.index?' · 本局已发生':''}</span><small>${esc(effectText(b.result.lastResult.effects))}</small></button>`).join('')}<details class="prob-details"><summary>展开概率计算依据</summary><p>${currentChoice.preview.modifiers.map(esc).join('<br>')}</p><p>结果卡显示包含确定成本在内的最终净变化。</p></details></div>
    <div class="result-column"><div class="column-title"><b>3</b> 后果 · 这一项会留下什么</div><div class="result-box"><p class="eyebrow">${actual?'本局实际结果':mode==='record'?'未发生的对照分支':'设计推演 · 可发生的结果'}</p><h3>${esc(result.label)}</h3><p class="result-story">${esc(result.text)}</p>${impactHTML(result.impact)}${actual&&currentChoice.recordedPlan?recordedPlanHTML(result.plan):''}<p class="result-effect">本节点最终净变化<br>${esc(effectText(result.effects))}</p><div class="next-box"><p class="eyebrow">${next?'下一幕 · '+esc(next.year)+' · '+esc(ROUTE_NAMES[currentBranch.next.route]):'通向结局'}</p><h4>${esc(next?.title??ending?.title)}</h4><p>${esc(next?.echo??next?.story??ending?.text)}</p>${next?`<details><summary>阅读下一幕的完整处境</summary><p>${esc(next.story)}</p></details>`:''}</div><button class="primary" id="follow-result" ${currentChoice.recordedPlan&&!next?'disabled':''}>${currentChoice.recordedPlan?next?'从这组实际结果继续推演':'这组选择已经走到结局':mode==='record'?'从这里另走一条路':next?'沿此结果推演 →':'记入推演，查看结局'}</button></div></div></div>
    <div class="bottom-grid"><section><label class="note-label" for="node-note">节点批注<span id="note-state">本机保存</span></label><textarea id="node-note" maxlength="2000" placeholder="记下想调整的选项、缺少的分支，或这一站的设计问题…">${esc(notes[nodeId(base)]??'')}</textarea><p class="notes-help">每个生活或事业分支独立记录。下载 HTML 会一起带走批注、当前推演与已读取的试玩记录。</p></section></div>`;
  host.querySelectorAll('[data-prep]').forEach(b=>b.onclick=()=>{prepareScene(b.dataset.prep,choiceId);renderDetail();$(`[data-prep="${prepId}"]`).focus();});
  host.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{choiceId=b.dataset.choice;outcomeIndex=expanded.choices.find(c=>c.option.id===choiceId).branches[0].index;renderDetail();$(`[data-choice="${choiceId}"]`).focus();});
  host.querySelectorAll('[data-outcome]').forEach(b=>b.onclick=()=>{outcomeIndex=Number(b.dataset.outcome);renderDetail();$(`[data-outcome="${outcomeIndex}"]`).focus();});
  bindSamplePicker();
  $('#node-note').oninput=e=>{notes[nodeId(base)]=e.target.value;const ok=persist();$('#note-state').textContent=ok?'已保存到本浏览器':'本次会话中 · 请下载 HTML';};
  $('#follow-result').onclick=followResult;
  if($('#resume-plan'))$('#resume-plan').onclick=resumePlan;
  if($('#undo-step'))$('#undo-step').onclick=undoStep;
}

function renderWalk(){
  const host=$('#walk-log');host.hidden=!walkFrames.length;
  if(!walkFrames.length)return;
  const last=walkFrames.at(-1).branch;
  host.innerHTML=`<div class="walk-section"><h2>当前推演记录${last.ending?' · 已到结局':''}</h2><p class="record-hint">由你逐项指定的假设结果组成，不是试玩抽签记录。起点为第 ${plan.origin.step+1} 站的可达处境。</p><ol>${walkFrames.map((f,i)=>`<li><strong>${esc(f.expanded.scene.year)} · ${esc(ROUTE_NAMES[f.base.route])}</strong><br>${f.expanded.prep?'准备：'+esc(f.expanded.prep.title)+'<br>':'生活取舍 · '}${esc(f.choice.option.title)} → <strong>${esc(f.branch.result.lastResult.label)}</strong>（当时 ${pct(f.branch.probability)}）<br>${esc(f.branch.result.lastResult.text)}<br>去向：${esc(f.branch.ending?.title??f.branch.nextScene?.title)}</li>`).join('')}</ol>${last.ending?`<div class="empty"><h3>${esc(last.ending.title)}</h3><p>${esc(last.ending.text)}</p></div>`:''}<div class="log-actions"><button id="log-resume">继续／查看这条推演</button><button id="export-plan">导出推演记录 JSON ↓</button></div></div>`;
  $('#log-resume').onclick=()=>{resumePlan();$('#detail').scrollIntoView({block:'start'});};
  $('#export-plan').onclick=()=>download('再活一次-推演记录.json',JSON.stringify({kind:'design-simulation',version:1,plan,notes,log:walkFrames.map(f=>({year:f.expanded.scene.year,route:ROUTE_NAMES[f.base.route],prep:f.expanded.prep?.title??null,choice:f.choice.option.title,probability:f.branch.probability,result:f.branch.result.lastResult.text,next:f.branch.nextScene?.title??f.branch.ending?.title}))},null,2),'application/json');
}
function followResult(){
  const c=expanded.choices.find(c=>c.option.id===choiceId),b=c.branches.find(b=>b.index===outcomeIndex);
  if(mode==='record'&&c.recordedPlan){
    if(b.next.phase==='ended')return;
    plan={origin:clone(b.next),steps:[]};walkFrames=[];
    base=clone(b.next);selectedIsWalk=true;structureSelection=null;
    prepareScene();ensureVisible(base);persist();setMode('structure');
    $('#detail').scrollIntoView({block:'start'});$('#scene-title').focus({preventScroll:true});
    return;
  }
  const replacingEnding=mode==='structure'&&selectedIsWalk&&walkFrames.at(-1)?.branch.ending&&sameState(walkFrames.at(-1).base,base);
  const continues=replacingEnding||(mode==='structure'&&selectedIsWalk&&['prep','life'].includes(walkFrames.at(-1)?.branch.next.phase)&&sameState(walkFrames.at(-1).branch.next,base));
  if(!continues){plan={origin:clone(base),steps:[]};walkFrames=[];}
  if(replacingEnding){plan.steps.pop();walkFrames.pop();}
  plan.steps.push({prepId,choiceId,outcomeIndex});walkFrames.push({base:clone(base),expanded,choice:c,branch:b});
  persist();selectedIsWalk=true;structureSelection=null;
  if(b.next.phase!=='ended'){base=clone(b.next);prepareScene();ensureVisible(base);}
  setMode('structure');
  if(b.ending){$('#walk-log').scrollIntoView({block:'start'});notify(`这条推演到达「${b.ending.title}」，记录已保存。`);}
  else {$('#detail').scrollIntoView({block:'start'});$('#scene-title').focus({preventScroll:true});}
}
function resumePlan(){
  if(!walkFrames.length)return;
  const last=walkFrames.at(-1);
  mode='structure';selectedIsWalk=true;structureSelection=null;
  if(['life','prep'].includes(last.branch.next.phase)){base=clone(last.branch.next);prepareScene();}
  else {base=clone(last.base);prepareScene(last.expanded.prep?.id,last.choice.option.id,last.branch.index);}
  ensureVisible(base);setMode('structure');
}
function undoStep(){
  if(!walkFrames.length)return;
  const removed=walkFrames.at(-1);plan.steps.pop();walkFrames.pop();persist();
  base=clone(removed.base);prepareScene(removed.expanded.prep?.id,removed.choice.option.id,removed.branch.index);
  selectedIsWalk=true;ensureVisible(base);render();
}
function render(){drawMap();renderRecord();renderDetail();renderWalk();}

document.querySelectorAll('[data-site]').forEach(a=>a.href=location.protocol==='file:'?SITE+a.dataset.site:'./'+a.dataset.site);
$('#structure-tab').onclick=()=>setMode('structure');
$('#record-tab').onclick=()=>setMode('record');
$('#period-filter').onchange=e=>{period=e.target.value;drawMap();};
$('#route-filter').onchange=e=>{routeFilter=e.target.value;drawMap();};
$('#jump-node').onchange=e=>{if(mode==='record'){const i=saved.frames.findIndex(f=>nodeId(f.base)===e.target.value);selectRecord(i);}else selectSample(e.target.value);};
$('#import-save').onclick=()=>$('#save-file').click();
$('#save-file').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    if(file.size>768000)throw new Error('存档文件过大');
    const checked=validateSave(await file.text());if(!checked.ok)throw new Error(checked.reason);
    imported=checked.state;persist();setMode('record');notify('存档已读入地图，试玩存档没有被改动。');
  }catch(error){notify(`没有导入：${error.message}。请选择从「我的记录」导出的试玩存档 JSON；推演记录不是试玩存档。`);}
  e.target.value='';
};
$('#download-html').onclick=()=>{
  const doc=document.documentElement.cloneNode(true);
  doc.querySelector('#portable-data').textContent=JSON.stringify({exportId:crypto.randomUUID(),notes,plan,save:saved.ok?saved.state:null}).replace(/</g,'\\u003c');
  download('再活一次-决策分叉地图.html','<!doctype html>\n'+doc.outerHTML,'text/html;charset=utf-8');
  notify('已准备可离线打开的 HTML，包含当前批注、推演和已读取的试玩记录。');
};
try{restorePlan(initial.plan);}catch(error){notify(`上次推演未能恢复：${error.message}。仍可从任意节点开始新推演。`);}
refreshSaved();prepareScene();setMode('structure');
new ResizeObserver(()=>drawMap()).observe($('.map-scroll'));
window.addEventListener('storage',e=>{if(e.key==='jensen-game-save'&&!imported){refreshSaved();if(mode==='record')setMode('record');}});
