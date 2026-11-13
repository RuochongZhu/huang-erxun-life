// Optional telemetry: no request is awaited by the game, and all storage/network failures are isolated.
const ENDPOINT = 'https://jensen-another-life.almondacorn1024.chatgpt.site';
const ALLOWED = new Set(['https://play.socialai.buzz','https://ruochongzhu.github.io',ENDPOINT]);
const STORE = 'another-life-analytics-v1';
const RUN = 'another-life-analytics-run-v1';
const VISITOR = 'another-life-visitor-v1';
export function createAnalytics() {
  const noop={newGame(){},observeGame(){}};
  if(!ALLOWED.has(location.origin)||!globalThis.crypto?.randomUUID)return noop;
  try {
    const read=key=>{try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
    const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
    const validId=value=>typeof value==='string'&&/^[a-f0-9-]{36}$/i.test(value);
    let visitor=read(VISITOR);if(!validId(visitor)){visitor=crypto.randomUUID();write(VISITOR,visitor);}
    const visit=crypto.randomUUID();
    let queue=read(STORE);if(!Array.isArray(queue))queue=[];
    queue=queue.filter(item=>item&&['visit','game'].includes(item.kind)&&item.body&&validId(item.body.id)&&item.body.visitorId===visitor).slice(-40);
    let run=read(RUN),busy=false,total=0,last=performance.now();
    let visible=!document.hidden;
    const fingerprint=game=>JSON.stringify([game.seed,game.name,game.storyEdition]);
    const persist=()=>write(STORE,queue);
    const put=(kind,body)=>{
      const existing=queue.findIndex(item=>item.kind===kind&&item.body.id===body.id);
      const item={kind,body};if(existing>=0)queue[existing]=item;else queue.push(item);
      if(queue.length>40)queue.splice(0,queue.length-40);
      persist();
    };
    const tick=()=>{const now=performance.now();if(visible)total=Math.min(86400000,total+Math.max(0,now-last));last=now;};
    const recordVisit=()=>{
      tick();
      put('visit',{id:visit,visitorId:visitor,activeMs:Math.floor(total),path:location.pathname,referrer:document.referrer,device:/iPad|Tablet/i.test(navigator.userAgent)?'平板':/Mobi|Android/i.test(navigator.userAgent)?'手机':'电脑'});
    };
    async function flush(){
      if(busy||navigator.onLine===false)return;
      busy=true;
      try{
        // Bound work on each retry; the browser never waits for these requests to play.
        for(const item of queue.slice(0,4)){
          const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),3000);
          try{
            const response=await fetch(`${ENDPOINT}/api/analytics/${item.kind}`,{method:'POST',body:JSON.stringify(item.body),headers:{'Content-Type':'text/plain;charset=UTF-8'},credentials:'omit',redirect:'error',signal:controller.signal});
            if(response.ok||(response.status>=400&&response.status<500&&response.status!==429)){
              queue=queue.filter(current=>current!==item);persist();
            }else break;
          }catch{break;}finally{clearTimeout(timeout);}
        }
      }finally{busy=false;}
    }
    const safely=fn=>(...args)=>{try{return fn(...args);}catch{}};
    const newGame=safely(game=>{run={id:crypto.randomUUID(),key:fingerprint(game),resumed:false};write(RUN,run);});
    const observeGame=safely((game,result)=>{
      if(!game)return;
      if(!run||!validId(run.id)||run.key!==fingerprint(game)){run={id:crypto.randomUUID(),key:fingerprint(game),resumed:true};write(RUN,run);}
      if(run.completed)return;
      const complete=game.phase==='ended'&&!!result;
      const report=result?.report,summary=result?.summary;
      const body={id:run.id,visitorId:visitor,visitId:visit,status:complete?'completed':'in_progress',score:complete&&summary.scored?summary.score:null,maxScore:complete&&summary.scored?summary.maxScore:null,ending:complete?summary.title:'',careerEnding:report?.ending?.title||'',early:!!report?.early,tragedy:!!report?.ifEpilogue?.tragedy,steps:report?.completedSteps??game.step??0,decisions:report?.decisionCount??((game.journal?.length||0)+(game.lifeJournal?.length||0)+(game.preparationJournal?.length||0)+(game.supplementJournal?.length||0)),elapsedMs:Math.floor(game.elapsedMs||0),values:complete?summary.values.map(v=>({label:v.label,value:v.value})):[],edition:String(game.storyEdition||game.version||''),resumed:!!run.resumed};
      const first=!run.observed;run.observed=true;
      put('game',body);
      if(complete){run.completed=true;write(RUN,run);}
      if(first||complete)void flush();
    });
    const heartbeat=safely(()=>{if(!document.hidden){recordVisit();void flush();}});
    const onHide=safely(()=>{
      recordVisit();
      // Beacon is best effort; keep records until a later acknowledged request.
      for(const item of queue.slice(-3))navigator.sendBeacon?.(`${ENDPOINT}/api/analytics/${item.kind}`,new Blob([JSON.stringify(item.body)],{type:'text/plain;charset=UTF-8'}));
    });
    document.addEventListener('visibilitychange',safely(()=>{tick();visible=!document.hidden;if(document.hidden)onHide();else{recordVisit();void flush();}}));
    window.addEventListener('pagehide',onHide);
    window.addEventListener('pageshow',safely(()=>{last=performance.now();visible=!document.hidden;void flush();}));
    window.addEventListener('online',safely(()=>void flush()));
    setInterval(heartbeat,60000);
    recordVisit();void flush();
    return {newGame,observeGame};
  }catch{return noop;}
}
