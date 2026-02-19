'use client';
import { useState, useEffect, useRef } from 'react';
const POSTS = [
  { id:'1', type:'confession', text:'Lost job, family ghosted. RYVYNN saved my ass — still grinding daily.', author:'Anon Founder' },
  { id:'2', type:'miracle', text:'AI blessing nailed my pitch deck. Signed investor next day — $200k wired.', author:'Elite User' },
  { id:'3', type:'confession', text:'Was suicidal. RYVYNN pulled me back. Did not fix everything overnight.', author:'Anonymous' },
  { id:'4', type:'miracle', text:'One blessing at 3am. Deal closed by noon. First $50k month.', author:'Flame Member' },
];
export default function WallPage() {
  const [posts, setPosts] = useState(POSTS);
  const [showPopup, setShowPopup] = useState(false);
  const scrollCount = useRef(0);
  const shown = useRef(false);
  useEffect(() => {
    const fn = () => { if(shown.current) return; scrollCount.current++; if(scrollCount.current>=3){setShowPopup(true);shown.current=true;} };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <main style={{background:'#0a0a0a',minHeight:'100vh',padding:'40px 20px'}}>
      <h1 style={{textAlign:'center',color:'#fff',fontSize:'2rem',marginBottom:'8px'}}>🔥 The Wall</h1>
      <p style={{textAlign:'center',color:'#888',marginBottom:'40px'}}>Raw confessions. Real miracles. No filters.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'20px',maxWidth:'1200px',margin:'0 auto'}}>
        {posts.map(p=>(
          <div key={p.id} style={{background:p.type==='confession'?'rgba(255,0,0,0.08)':'rgba(255,215,0,0.08)',border:`1px solid ${p.type==='confession'?'#ff000066':'#ffd70066'}`,borderRadius:'12px',padding:'24px'}}>
            <span style={{fontSize:'10px',letterSpacing:'2px',color:p.type==='confession'?'#ff4444':'#ffd700',textTransform:'uppercase',display:'block',marginBottom:'12px'}}>{p.type==='confession'?'⚡ Confession':'✨ Miracle'}</span>
            <p style={{color:'#ddd',lineHeight:'1.6',marginBottom:'16px',fontStyle:'italic'}}>"{p.text}"</p>
            <span style={{color:'#666',fontSize:'13px'}}>— {p.author}</span>
          </div>
        ))}
      </div>
      {showPopup&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999}}>
          <div style={{background:'#111',border:'1px solid #ff4500',borderRadius:'16px',padding:'40px',maxWidth:'400px',textAlign:'center'}}>
            <p style={{fontSize:'2rem',marginBottom:'16px'}}>🔥</p>
            <h2 style={{color:'#fff',marginBottom:'12px'}}>Share Your Confession</h2>
            <p style={{color:'#aaa',marginBottom:'24px'}}>Unlock a free Soul Token trial.</p>
            <a href="/confess" style={{display:'block',background:'#ff4500',color:'#fff',padding:'14px',borderRadius:'8px',textDecoration:'none',fontWeight:'bold',marginBottom:'12px'}}>Confess & Unlock</a>
            <button onClick={()=>setShowPopup(false)} style={{background:'none',border:'none',color:'#666',cursor:'pointer'}}>Not now</button>
          </div>
        </div>
      )}
    </main>
  );
}
