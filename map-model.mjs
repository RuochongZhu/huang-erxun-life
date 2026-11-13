import * as Legacy from './engine.mjs';
import * as Life from './life-engine.mjs';
import { getScene as getCareerScene } from './content.mjs';

export const ROUTE_NAMES = Object.freeze({student:'求学',company:'创业',employee:'职业',studio:'工作室',researcher:'研究与教学',sold:'出售后的生活'});
export const ROUTE_ORDER = Object.freeze(['student','company','employee','studio','researcher','sold']);
export const PROJECTION_VERSION = 2;
const rules = state => state?.version?.startsWith('2.') ? Life : Legacy;
export const getMapScene = state => rules(state) === Life ? Life.getScene(state) : getCareerScene(state);
export const previewMapChoice = (state,id) => rules(state).previewChoice(state,id);
export const applyMapChoice = (state,id) => rules(state).commitChoice(state,id);
export const nextMapState = state => rules(state).continueGame(state);
export const getMapReport = state => rules(state).getReport(state);
export function validateMapSave(raw) {
  // Choose the reader without invoking any getters in an untrusted object.
  let value=raw;
  if(typeof value==='string'){
    if(value.length>768000)return {ok:false,reason:'存档大小异常'};
    try{value=JSON.parse(value);}catch{return {ok:false,reason:'存档格式不正确'};}
  }
  const version=value&&typeof value==='object'?Object.getOwnPropertyDescriptor(value,'version')?.value:null;
  return typeof version==='string'&&version.startsWith('1.')?Legacy.validateSave(value):Life.validateSave(value);
}

function careerKey(state){
  if(state.step>=3&&state.step<=4){
    if(state.flags.employer_research)return 'campus';
    if(state.flags.employer_lsi)return 'lsi';
    if(state.flags.employer_amd)return 'amd';
  }
  return state.route;
}
const CAREER_LABELS={amd:'AMD → LSI',lsi:'提前进入 LSI',campus:'校园研究'};
const shortLifeChoice=entry=>entry?.choiceTitle || entry?.title || '生活尚未决定';
function carriedLabel(entry,state){
  const life=state.life;
  if(entry.step===0)return {letter:'把难处写进家书',shared_table:'与哥哥互相照应',scheduled:'按约定与家里联系'}[life.familyPractice]||shortLifeChoice(entry);
  if(entry.step===1)return {table_tennis:'保留乒乓球时段',cooking:'与朋友做饭',none:'把余暇换成收入'}[life.hobby]||shortLifeChoice(entry);
  const person=life.partner==='lori'?'Lori':life.partner==='maya'?'麦雅':'';
  if(entry.step===2)return life.relationship==='dating'?`与${person}交往中`:'认真经营单身生活';
  if(entry.step===3){
    if(life.relationship==='separated')return '分开后，暂缓学业';
    if(life.relationship==='married')return `${person} · ${life.children==='parent'?'已婚育儿':'已婚不育儿'}`;
    if(life.relationship==='dating')return `${person} · 暂缓婚育`;
    return life.children==='childfree'?'单身 · 不育儿':'婚育未定 · 减少课程';
  }
  return shortLifeChoice(entry);
}

/** Semantic grouping is deliberately lossy; full state witnesses are never lost.
 * Early chapters retain their last personal decision. Later life events merge by
 * career; their new personal decisions immediately fan out again in prep.
 */
export function describeNode(state){
  const scene=getMapScene(state);
  const stage=state.phase==='life'?'life':'prep';
  const last=(state.lifeJournal||[]).at(-1);
  const sameStep=last?.step===state.step;
  const key=careerKey(state);
  const careerLabel=state.route==='sold'&&state.flags?.if_2026_layoff?'离职后的过渡期':CAREER_LABELS[key]||ROUTE_NAMES[state.route];
  let variantKey='shared',label=careerLabel;
  if(state.life){
    if(stage==='prep'&&sameStep){variantKey=last.optionId;label=carriedLabel(last,state);}
    else if(stage==='life'&&state.step>0&&state.step<=4&&last){variantKey=last.optionId;label=carriedLabel(last,state);}
    else if(stage==='life'){label=state.step===0?'初到美国':careerLabel+' · 新的取舍';}
  }
  if(last?.step===3&&['lori','maya'].includes(state.life?.partner)&&variantKey!=='shared')variantKey+=':'+state.life.partner;
  const id=`v${PROJECTION_VERSION}:${state.step}:${stage}:${key}:${variantKey}`;
  return {id,step:state.step,stage,route:state.route,careerKey:key,careerLabel,variantKey,label,
    year:scene.year,title:scene.title,legacy:!state.life};
}
export const mapNodeId = state => describeNode(state).id;
export function memoryEntries(state){
  return (state.lifeJournal||[]).map(entry=>({
    step:entry.step,year:entry.year,title:entry.choiceTitle,text:entry.consequence||entry.resultText,
    tradeoff:entry.tradeoff||'',set:entry.set||{},
  }));
}

function expandChoices(base,prepared,scene,options){
  return options.map(option=>{
    const preview=previewMapChoice(prepared,option.id),branches=[];
    if(!preview.available)return {option,preview,branches};
    const pending=new Set(preview.probabilities.flatMap((p,i)=>p>0?[i]:[]));
    for(let attempt=0;pending.size&&attempt<=10000;attempt++){
      const candidate=attempt===0?prepared:{...prepared,seed:`decision-map-${prepared.step}-${attempt}`};
      const result=applyMapChoice(candidate,option.id);
      const index=result.lastResult.outcomeIndex;
      if(!pending.delete(index))continue;
      const next=nextMapState(result),ended=next.phase==='ended';
      branches.push({index,probability:preview.probabilities[index],result,next,
        nextScene:ended?null:getMapScene(next),ending:ended?getMapReport(next).ending:null});
    }
    if(pending.size)throw new Error(`无法重现选项 ${option.id} 的正概率结果`);
    branches.sort((a,b)=>a.index-b.index);
    return {option,preview,branches};
  });
}
export function enumerateBranches(base,prepId){
  if(base?.phase!=='prep')throw new TypeError('职业分支展开需要准备阶段的状态');
  const prep=getMapScene(base).prep.find(option=>option.id===prepId);
  const preview=previewMapChoice(base,prepId);
  if(!preview.available)throw new Error(preview.reason);
  const prepared=applyMapChoice(base,prepId),scene=getMapScene(prepared);
  return {base,prepared,scene,prep,choices:expandChoices(base,prepared,scene,scene.choices)};
}
export function enumerateLifeBranches(base){
  if(base?.phase!=='life')throw new TypeError('生活分支展开需要生活选择阶段');
  const scene=getMapScene(base);
  return {base,prepared:base,scene,prep:null,choices:expandChoices(base,base,scene,scene.options)};
}
export function enumerateDecisions(base,prepId){
  return base.phase==='life'?enumerateLifeBranches(base):enumerateBranches(base,prepId);
}
export function flattenSamples(samples){
  if(!Array.isArray(samples))throw new TypeError('路线样本必须是数组');
  return samples.flatMap(group=>group?.phase?[group]:Object.values(group));
}
const compareNodes=(a,b)=>a.step-b.step||(a.stage==='life'?0:1)-(b.stage==='life'?0:1)
  ||ROUTE_ORDER.indexOf(a.route)-ROUTE_ORDER.indexOf(b.route)||a.id.localeCompare(b.id);

export function buildOverview(samples){
  const bases=flattenSamples(samples),nodes=new Map(),edges=new Map();
  const addNode=(state,index)=>{
    const node=describeNode(state);
    if(!nodes.has(node.id))nodes.set(node.id,{...node,sampleIds:[]});
    const existing=nodes.get(node.id);
    if(index!==undefined&&!existing.sampleIds.includes(index))existing.sampleIds.push(index);
    return node.id;
  };
  bases.forEach((base,index)=>{
    if(!['life','prep'].includes(base.phase))throw new TypeError('路线样本需要生活或准备阶段');
    addNode(base,index);
  });
  bases.forEach((base,sourceSampleId)=>{
    const preparations=base.phase==='life'?[null]:getMapScene(base).prep
      .filter(option=>previewMapChoice(base,option.id).available).map(option=>option.id);
    for(const prepId of preparations){
      const expanded=enumerateDecisions(base,prepId);
      for(const {option,branches} of expanded.choices){
        for(const {next,index} of branches){
          if(next.phase==='ended')continue;
          const from=mapNodeId(base),to=addNode(next),key=`${from}>${to}`;
          if(!edges.has(key))edges.set(key,{from,to,choices:new Set(),witnesses:[]});
          const edge=edges.get(key);edge.choices.add(option.title);
          edge.witnesses.push({sourceSampleId,prepId,choiceId:option.id,outcomeIndex:index,kind:'enumerated'});
        }
      }
    }
  });
  return {nodes:[...nodes.values()].sort(compareNodes),edges:[...edges.values()].map(edge=>({...edge,choices:[...edge.choices]}))};
}

function replayLegacy(state){
  const frames=[];let cursor=Legacy.createGame(state.name,state.seed),base=cursor,prepared=null;
  for(const receipt of state.evidence){
    if(cursor.phase==='prep'){base=cursor;prepared=Legacy.commitChoice(cursor,receipt.optionId);cursor=prepared;}
    else {
      const result=Legacy.commitChoice(cursor,receipt.optionId),next=Legacy.continueGame(result);
      const advanced=state.step>base.step||state.phase==='ended'&&base.step===11;
      frames.push({stage:'prep',base,prepared,choiceId:receipt.optionId,outcomeIndex:result.lastResult.outcomeIndex,result,next,advanced});
      cursor=next;
    }
  }
  return {frames,cursor,base,prepared};
}

/** Replays explicit actions. A result is a recorded decision, but its destination
 * is not marked visited until a recorded continue action actually reaches it. */
export function replaySavedPath(raw){
  const checked=validateMapSave(raw);
  if(!checked.ok)return {ok:false,reason:checked.reason};
  const state=checked.state;
  if(!state.version.startsWith('2.'))return {ok:true,state,frames:replayLegacy(state).frames};
  const inherited=state.legacyBase?replayLegacy(state.legacyBase):null;
  const frames=inherited?inherited.frames:[];
  let cursor=state.legacyBase?Life.validateSave(state.legacyBase).state:Life.createGame(state.name,state.seed,{storyEdition:state.storyEdition??null,dynamicsEdition:state.dynamicsEdition??null,continuityEdition:state.continuityEdition??null,choicePlanEdition:state.choicePlanEdition??null});
  let base=inherited?.base??cursor,prepared=cursor.phase==='choice'?cursor:null;
  for(const action of state.actions){
    cursor={...cursor,elapsedMs:action.elapsedMs};
    if(action.type==='enable-combinations'){
      cursor=Life.enableCombinationChoices(cursor);
      if(cursor.phase==='choice')prepared=cursor;
    }else if(action.type==='choice'){
      const commit=()=>action.optionIds?Life.commitChoices(cursor,action.optionIds):Life.commitChoice(cursor,action.optionId);
      if(cursor.phase==='prep'){base=cursor;prepared=commit();cursor=prepared;continue;}
      const stage=cursor.phase==='life'?'life':'prep';
      if(stage==='life'){base=cursor;prepared=cursor;}
      const result=commit();
      const next=Life.continueGame(result);
      frames.push({stage,base,prepared,choiceId:action.optionId,...(action.optionIds?{choiceIds:[...action.optionIds]}:{}),outcomeIndex:result.lastResult.outcomeIndex,result,next,advanced:false});
      cursor=result;
    }else if(action.type==='continue'){
      if(frames.length&&['life-result','result'].includes(cursor.phase))frames.at(-1).advanced=true;
      cursor=Life.continueGame(cursor);
    }else if(action.type==='end'){cursor=Life.endEarly(cursor,action.reason);}
  }
  return {ok:true,state,frames};
}
