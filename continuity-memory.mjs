// Reconstruct only witnessed events; no score threshold invents a shared past.
const EDITION='2026.11.bonds';
const paired=life=>['dating','married'].includes(life?.relationship)&&['lori','maya'].includes(life?.partner);
const name=id=>id==='lori'?'Lori':id==='maya'?'麦雅':id==='jeff'?'Jeff':'老朋友';
const receipt=(entry,actor)=>({year:Number(entry.year),step:entry.step,optionId:entry.optionId||'',title:entry.choiceTitle||entry.title||entry.label,text:entry.resultText||entry.text||'',actor});
export function getContinuityMemory(state) {
  const enabled=state?.continuityEdition===EDITION;
  const life=state?.life||{},id=paired(life)?life.partner:null;
  const rows=enabled?(state.lifeJournal||[]).filter(e=>e.step<=state.step):[];
  let sinceStep=0;
  for(const e of rows){const set=e.set||{};if(Object.hasOwn(set,'partner')&&set.partner!==id)sinceStep=e.step+1;}
  const current=rows.filter(e=>id&&e.step>=sinceStep&&(e.lifeBefore?.partner===id||e.set?.partner===id));
  const partner={id,name:id?name(id):null,sinceStep,receipts:[],missed:[],repairs:[],sharedTime:[],careerSupport:[],privacy:[],riskPacts:[]};
  const family={receipts:[],support:[],care:[],riskPacts:[],reserve:[],privacy:[]};
  for(const e of rows){
    const s=e.set||{};
    const recordedPartner=['lori','maya'].includes(s.partner)?s.partner:['lori','maya'].includes(e.lifeBefore?.partner)?e.lifeBefore.partner:null;
    const actor=recordedPartner?name(recordedPartner):s.carePlan||e.step===0||e.step===5?'Jeff':'老朋友';
    const ongoing=!recordedPartner||current.includes(e);
    const r=receipt(e,actor); family.receipts.push(r);
    if(ongoing&&(['help_network','shared_table'].includes(s.familyPractice)||['open_table','close_circle'].includes(s.socialPractice)||s.carePlan==='shared'))family.support.push(r);
    if(s.carePlan)family.care.push(r);
    if(ongoing&&(s.familyPact||s.familyExposure))family.riskPacts.push(r);
    if(ongoing&&(['guardrail','limited_stake'].includes(s.familyPact)||s.familyExposure==='separate'))family.reserve.push(r);
    if(ongoing&&s.publicBoundary)family.privacy.push(r);
    if(!current.includes(e))continue;
    partner.receipts.push(r);
    if(s.relationshipRepair==='unrepaired'||/life-1996-(?:story-)?postpone-again/.test(e.optionId))partner.missed.push(r);
    if(['repair_done','agreed'].includes(s.relationshipRepair)||s.bondPact==='kept')partner.repairs.push(r);
    if(s.workBoundary==='protected'&&e.effects?.bonds>0)partner.sharedTime.push(r);
    if(s.partnerCareer==='protected'||s.bondSupport==='bounded')partner.careerSupport.push(r);
    if(s.publicBoundary)partner.privacy.push(r);
    if(s.familyPact||s.familyExposure)partner.riskPacts.push(r);
  }
  const records=enabled?(state.journal||[]).filter(e=>e.step<state.step):[];
  const career={receipts:records.map(e=>receipt(e,'工作伙伴')),crises:[],breakthroughs:[],rebuild:{plans:[],attempts:[],delivered:[],stalled:[]}};
  for(const e of records){const r=receipt(e,'工作伙伴');if(e.outcomeIndex===2)career.crises.push(r);
    for(const event of e.impact?.events||[]){if(event.tone==='crisis'&&event.values?.career<0)career.crises.push({...r,title:event.title,text:event.text});if(event.tone==='breakthrough')career.breakthroughs.push({...r,title:event.title,text:event.text});}
    if(e.year===2028&&state.flags?.future_restart_plan)career.rebuild.plans.push(r);
    if(e.year>=2032&&state.flags?.future_restart_attempt){career.rebuild.attempts.push(r);if(e.outcomeIndex===2)career.rebuild.stalled.push(r);else if(state.flags?.future_rebuilt_product||state.flags?.future_rebuild_small)career.rebuild.delivered.push(r);}
  }
  // A promise carries its author and relationship; a new partner never inherits it.
  const agreement=rows.filter(e=>e.set?.bondSupport).at(-1);
  const support=agreement&&(!agreement.set.bondPartner||agreement.set.bondPartner===id)
    ?{...receipt(agreement,agreement.set.bondActor||'老朋友'),kind:agreement.set.bondSupport}:null;
  const pact=rows.filter(e=>e.set?.bondPact&&(!e.set.bondPartner||e.set.bondPartner===id)).at(-1);
  return {enabled,partner,family,career,support,pact:pact?{...receipt(pact,pact.set.bondActor||'家人'),kind:pact.set.bondPact}:null};
}
