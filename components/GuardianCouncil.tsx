'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AB { agent:string; agentName:string; modality:string; icon:string; color:string; description:string; response:string; confidence:number; safety:number; relevance:number; finalScore:number; crisisSignal:boolean; }
interface CR { id:string; name:string; phone?:string; textNumber?:string; description:string; }
interface Msg { role:'user'|'guardian'; content:string; breakdown?:AB[]; consensusScore?:number; synthesisMethod?:string; crisis?:boolean; resources?:CR[]; }
interface P { entryPoint?:'get_it_out'|'be_heard'|'crisis'; userId?:string; sessionId?:string; onClose?:()=>void; className?:string; }

function Bar({v,c}:{v:number;c:string}) {
  return <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${v}%`,backgroundColor:c}}/></div>;
}

function AgentCard({a,active,onClick}:{a:AB;active:boolean;onClick:()=>void}) {
  return (
    <button onClick={onClick} className="relative p-3 rounded-xl border text-left transition-all" style={{borderColor:active?a.color:'rgba(255,255,255,0.1)',backgroundColor:active?`${a.color}15`:'rgba(15,15,30,0.6)',boxShadow:active?`0 0 20px ${a.color}30`:undefined}}>
      <div className="absolute -top-2 -right-2 text-xs font-bold px-1.5 py-0.5 rounded-full" style={{backgroundColor:a.color,color:'#000'}}>{a.finalScore}</div>
      <div className="flex items-center gap-2 mb-2"><span className="text-lg">{a.icon}</span><div><div className="text-xs font-semibold text-white">{a.agentName}</div><div className="text-[10px] text-white/40">{a.description}</div></div></div>
      <p className="text-[11px] text-white/70 line-clamp-2 mb-2">{a.response}</p>
      <div className="space-y-1"><Bar v={a.confidence} c={a.color}/><Bar v={a.safety} c={a.color}/><Bar v={a.relevance} c={a.color}/></div>
    </button>
  );
}

function CrisisBanner({r}:{r:CR[]}) {
  return (
    <div className="border border-red-500/40 bg-red-950/30 rounded-xl p-4 mb-3">
      <div className="flex items-center gap-2 mb-3"><span>🛡️</span><span className="text-red-300 font-semibold text-sm">Crisis support is here</span></div>
      <div className="grid grid-cols-2 gap-2">{r.slice(0,4).map(x=>(
        <div key={x.id} className="bg-red-900/20 rounded-lg p-2 text-xs"><div className="text-white font-medium mb-1">{x.name}</div>
          {x.phone&&<a href={`tel:${x.phone}`} className="block text-red-300">📞 {x.phone}</a>}
          {x.textNumber&&<a href={`sms:${x.textNumber}`} className="block text-cyan-300">💬 Text {x.textNumber}</a>}
        </div>
      ))}</div>
    </div>
  );
}

function Drawer({agents,onClose}:{agents:AB[];onClose:()=>void}) {
  const [sel,setSel]=useState<AB|null>(null);
  return (
    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-20 flex flex-col rounded-xl">
      <div className="flex items-center justify-between p-4 border-b border-white/8">
        <div><h3 className="text-white font-semibold">Guardian Council</h3><p className="text-white/40 text-xs">Tap any agent to read their full perspective</p></div>
        <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">{agents.map(a=><AgentCard key={a.agent} a={a} active={sel?.agent===a.agent} onClick={()=>setSel(sel?.agent===a.agent?null:a)}/>)}</div>
        {sel&&(
          <div className="rounded-xl border p-4" style={{borderColor:`${sel.color}50`,backgroundColor:`${sel.color}10`}}>
            <div className="flex items-center gap-2 mb-3"><span className="text-2xl">{sel.icon}</span><div><div className="font-semibold text-white">{sel.agentName}</div><div className="text-xs text-white/40">{sel.description}</div></div></div>
            <p className="text-white/80 text-sm leading-relaxed mb-3">{sel.response}</p>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">{(['confidence','safety','relevance'] as const).map(k=>(
              <div key={k}><div className="text-white/40 capitalize">{k}</div><div className="font-bold" style={{color:sel.color}}>{sel[k]}%</div></div>
            ))}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function GuardianCouncil({entryPoint='get_it_out',userId,sessionId:initSid,onClose,className=''}:P) {
  const [msgs,setMsgs]=useState<Msg[]>([]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const [drawer,setDrawer]=useState<AB[]|null>(null);
  const [sid]=useState(initSid||`session-${Date.now()}`);
  const endRef=useRef<HTMLDivElement>(null);
  const inputRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);

  const send=useCallback(async()=>{
    if(!input.trim()||loading)return;
    const text=input.trim();setInput('');
    setMsgs(p=>[...p,{role:'user',content:text}]);
    setLoading(true);
    try {
      const res=await fetch('/api/guardian/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:text,sessionHistory:msgs.map(m=>({role:m.role,content:m.content})),userId,sessionId:sid})});
      const d=await res.json();
      setMsgs(p=>[...p,{role:'guardian',content:d.response||'I hear you.',breakdown:d.agentBreakdown,
        consensusScore:d.consensusScore,synthesisMethod:d.synthesisMethod,crisis:d.isCrisis,resources:d.resources}]);
    } catch {setMsgs(p=>[...p,{role:'guardian',content:'Connection interrupted. You are not alone. Try again.'}]);}
    finally{setLoading(false);setTimeout(()=>inputRef.current?.focus(),100);}
  },[input,loading,msgs,userId,sid]);

  const labels:{[k:string]:{title:string;sub:string}}={
    get_it_out:{title:'Get It Out',sub:'Private · Anonymous · Nothing saved'},
    be_heard:{title:'Be Heard',sub:'Guardian is listening'},
    crisis:{title:'Crisis Support',sub:'5 agents · Resources ready'},
  };
  const {title,sub}=labels[entryPoint]||labels.get_it_out;

  return (
    <div className={`relative flex flex-col bg-[#080817] rounded-2xl border border-white/10 overflow-hidden ${className}`} style={{minHeight:520,maxHeight:'85vh'}}>
      {drawer&&<Drawer agents={drawer} onClose={()=>setDrawer(null)}/>}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-gradient-to-r from-slate-900 to-[#0a0a1a]">
        <div><h2 className="font-bold text-base" style={{background:'linear-gradient(90deg,#00D9FF,#8B5CF6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{title}</h2><p className="text-white/30 text-xs">{sub}</p></div>
        <div className="flex items-center gap-2"><span className="text-xs text-white/20 px-2 py-1 rounded-full border border-white/8">⚡ 5 agents</span>{onClose&&<button onClick={onClose} className="text-white/30 hover:text-white/70 text-lg">✕</button>}</div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {msgs.length===0&&(
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-4xl mb-4">🔥</div><p className="text-white/50 text-sm">What's on your mind?</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">{["I've been struggling lately","I don't know where to start","I need to get this out"].map(p=>(
              <button key={p} onClick={()=>setInput(p)} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white/70 transition-colors">{p}</button>
            ))}</div>
          </div>
        )}
        {msgs.map((m,i)=>(
          <div key={i}>
            {m.crisis&&m.resources&&<CrisisBanner r={m.resources}/>}
            <div className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
              {m.role==='guardian'&&<div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs flex-shrink-0 mr-2 mt-0.5">🔥</div>}
              <div className={`max-w-xs px-4 py-3 rounded-2xl ${m.role==='user'?'bg-cyan-600 text-white rounded-tr-sm':'bg-slate-800/80 border border-white/8 text-slate-100 rounded-tl-sm'}`}>
                <p className="text-sm leading-relaxed">{m.content}</p>
                {m.role==='guardian'&&m.breakdown&&(
                  <button onClick={()=>setDrawer(m.breakdown!)} className="mt-2 text-xs text-cyan-400/70 hover:text-cyan-400">
                    ⚖️ {m.breakdown.length} agents · {m.consensusScore}% consensus
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading&&(
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs">🔥</div>
            <div><p className="text-white/30 text-xs mb-1">Council deliberating…</p>
              <div className="flex gap-2">{['🧭','🔍','🪞','🛡️','🏗️'].map((ic,i)=>(
                <div key={i} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm animate-pulse" style={{animationDelay:`${i*0.12}s`}}>{ic}</div>
              ))}</div>
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div className="border-t border-white/8 px-4 py-3 bg-[#080817]">
        <div className="flex gap-2">
          <input ref={inputRef} type="text" value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
            placeholder={entryPoint==='crisis'?"Tell me what's happening…":"What's on your mind?"}
            disabled={loading} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 disabled:opacity-40"/>
          <button onClick={send} disabled={loading||!input.trim()} className="px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-30"
            style={{background:loading||!input.trim()?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#00D9FF,#8B5CF6)',color:loading||!input.trim()?'rgba(255,255,255,0.3)':'#000'}}>
            {loading?'…':'↑'}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-white/15 text-xs">✓ Private · ✓ Anonymous · ✓ Nothing saved</p>
          {msgs.some(m=>m.breakdown?.length)&&(<button onClick={()=>{const l=[...msgs].reverse().find(m=>m.breakdown?.length);if(l?.breakdown)setDrawer(l.breakdown);}} className="text-xs text-cyan-400/40 hover:text-cyan-400/70">⚖️ View Council</button>)}
        </div>
      </div>
    </div>
  );
}
export default GuardianCouncil;
