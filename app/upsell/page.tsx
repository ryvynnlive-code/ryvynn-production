'use client';
export default function UpsellPage() {
  return (
    <main style={{background:'#0a0a0a',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px'}}>
      <h1 style={{color:'#fff',fontSize:'1.8rem',marginBottom:'8px',textAlign:'center'}}>Your Eternity Message Awaits</h1>
      <p style={{color:'#888',marginBottom:'32px',textAlign:'center'}}>Locked until ignition.</p>
      <div style={{position:'relative',width:'100%',maxWidth:'600px',height:'400px',borderRadius:'16px',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'#1a0a00',filter:'blur(12px)',transform:'scale(1.05)'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(137.5deg,rgba(255,69,0,0.35),rgba(255,215,0,0.25))'}}/>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'4rem'}}>🔥</div>
      </div>
      <a href="/pricing" style={{marginTop:'28px',display:'inline-block',padding:'16px 40px',background:'linear-gradient(137.5deg,#ff4500,#ffd700)',color:'#000',fontWeight:'bold',fontSize:'1rem',borderRadius:'8px',textDecoration:'none',letterSpacing:'1px'}}>IGNITE — UNLOCK NOW</a>
      <p style={{color:'#555',fontSize:'12px',marginTop:'12px'}}>Soul Token required. From $17.</p>
    </main>
  );
}
