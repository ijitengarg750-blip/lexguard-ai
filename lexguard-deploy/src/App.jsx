import { useState, useRef, useCallback } from "react";

const MODEL = "claude-sonnet-4-20250514";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0d0d0d; --parchment: #f7f3ec; --cream: #faf8f4;
    --gold: #c9a84c; --gold-light: #e8c97a;
    --danger: #c0392b; --warn: #d4781a; --safe: #1a6b45;
    --danger-bg: #fdf0ee; --warn-bg: #fdf5ec; --safe-bg: #eef7f2;
    --border: #ddd6c8; --muted: #8a7f70; --shadow: 0 2px 16px rgba(0,0,0,0.08);
  }
  html, body, #root { height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); }
  .app { min-height: 100vh; display: grid; grid-template-rows: auto 1fr; }
  .header {
    background: var(--ink); padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px; border-bottom: 2px solid var(--gold);
    position: sticky; top: 0; z-index: 100;
  }
  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-icon { width: 36px; height: 36px; background: var(--gold); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .logo-text { font-family: 'Playfair Display', serif; color: white; font-size: 22px; font-weight: 700; }
  .logo-text span { color: var(--gold); }
  .hbadge { background: rgba(201,168,76,0.15); border: 1px solid var(--gold); color: var(--gold); font-family: 'DM Mono', monospace; font-size: 11px; padding: 4px 10px; border-radius: 4px; letter-spacing: 1px; }
  .main { display: grid; grid-template-columns: 320px 1fr; height: calc(100vh - 64px); }
  .sidebar { background: var(--parchment); border-right: 1px solid var(--border); padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
  .slabel { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; margin-bottom: 10px; }
  .upload-zone { border: 2px dashed var(--border); border-radius: 12px; padding: 24px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: white; }
  .upload-zone:hover, .upload-zone.drag { border-color: var(--gold); background: #fffdf8; }
  .mode-tabs { display: flex; background: white; border: 1px solid var(--border); border-radius: 8px; padding: 3px; gap: 3px; }
  .mtab { flex: 1; padding: 7px 4px; border-radius: 6px; border: none; background: none; font-size: 11px; font-weight: 500; cursor: pointer; color: var(--muted); font-family: 'DM Sans', sans-serif; }
  .mtab.on { background: var(--ink); color: white; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; border: 1px solid var(--border); background: white; cursor: pointer; color: var(--muted); }
  .chip.on { background: var(--ink); color: white; border-color: var(--ink); }
  .tinput { width: 100%; height: 140px; border: 1px solid var(--border); border-radius: 10px; padding: 12px; font-family: 'DM Mono', monospace; font-size: 11px; line-height: 1.6; resize: vertical; background: white; color: var(--ink); outline: none; }
  .tinput:focus { border-color: var(--gold); }
  .tinput::placeholder { color: var(--muted); }
  .tsmall { height: 90px; }
  .abtn { width: 100%; padding: 14px; background: var(--ink); color: white; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
  .abtn:hover:not(:disabled) { background: #222; transform: translateY(-1px); }
  .abtn:disabled { opacity: 0.5; cursor: not-allowed; }
  .spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .content { overflow-y: auto; padding: 32px 40px; display: flex; flex-direction: column; gap: 24px; }
  .welcome { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 40px; gap: 20px; }
  .wtitle { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; line-height: 1.2; }
  .wtitle span { color: var(--gold); }
  .wsub { font-size: 16px; color: var(--muted); max-width: 480px; line-height: 1.6; }
  .fpills { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .fpill { padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; border: 1px solid var(--border); background: white; }
  .rhead { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 24px 28px; display: flex; align-items: center; gap: 24px; box-shadow: var(--shadow); }
  .rring { width: 88px; height: 88px; flex-shrink: 0; position: relative; }
  .rring svg { transform: rotate(-90deg); }
  .rlabel { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .rnum { font-family: 'DM Mono', monospace; font-size: 24px; font-weight: 500; }
  .rtxt { font-size: 9px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }
  .rinfo { flex: 1; }
  .rtitle { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .rmeta { font-size: 13px; color: var(--muted); margin-bottom: 10px; }
  .rbadges { display: flex; gap: 8px; flex-wrap: wrap; }
  .rb { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .rbh { background: var(--danger-bg); color: var(--danger); }
  .rbm { background: var(--warn-bg); color: var(--warn); }
  .rbl { background: var(--safe-bg); color: var(--safe); }
  .stitle { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .cbadge { background: var(--ink); color: white; font-family: 'DM Mono', monospace; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
  .sgrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .scard { background: white; border: 1px solid var(--border); border-radius: 10px; padding: 16px; text-align: center; }
  .snum { font-family: 'DM Mono', monospace; font-size: 28px; font-weight: 500; }
  .slb { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .nr { color: var(--danger); } .no { color: var(--warn); } .ng { color: var(--safe); }
  .ccard { background: white; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); margin-bottom: 10px; }
  .ch { padding: 16px 20px; display: flex; align-items: flex-start; gap: 14px; cursor: pointer; }
  .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .dh { background: var(--danger); } .dm { background: var(--warn); } .dl { background: var(--safe); }
  .cn { font-weight: 600; font-size: 14px; flex: 1; line-height: 1.3; }
  .cl { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; font-family: 'DM Mono', monospace; }
  .clH { background: var(--danger-bg); color: var(--danger); }
  .clM { background: var(--warn-bg); color: var(--warn); }
  .clL { background: var(--safe-bg); color: var(--safe); }
  .cb { padding: 0 20px 18px; border-top: 1px solid var(--border); }
  .corig { background: #f8f8f8; border-left: 3px solid var(--border); padding: 10px 14px; border-radius: 0 6px 6px 0; font-family: 'DM Mono', monospace; font-size: 11px; line-height: 1.7; margin: 14px 0; color: #555; }
  .cexp { font-size: 13px; line-height: 1.7; color: #333; margin-bottom: 12px; }
  .sbox { background: #eef7f2; border: 1px solid #b8dece; border-radius: 8px; padding: 12px 14px; }
  .slbl { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1.5px; color: var(--safe); margin-bottom: 6px; }
  .stxt { font-size: 13px; line-height: 1.6; color: #1a4a30; font-style: italic; }
  .compgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .compcard { background: white; border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
  .compname { font-weight: 600; font-size: 13px; margin-bottom: 6px; }
  .compst { font-size: 12px; font-family: 'DM Mono', monospace; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
  .cok { background: var(--safe-bg); color: var(--safe); }
  .cwarn { background: var(--warn-bg); color: var(--warn); }
  .crisk { background: var(--danger-bg); color: var(--danger); }
  .compnote { font-size: 12px; color: var(--muted); line-height: 1.5; }
  .xbar { background: var(--ink); border-radius: 12px; padding: 16px 22px; display: flex; align-items: center; gap: 16px; }
  .xtxt { color: white; font-size: 14px; font-weight: 500; flex: 1; }
  .xsub { color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 2px; }
  .xbtn { padding: 10px 20px; background: var(--gold); color: var(--ink); border: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
  .xbtn:hover { background: var(--gold-light); }
  .errbox { background: var(--danger-bg); border: 1px solid #e8b0aa; border-radius: 12px; padding: 20px 24px; }
  .errbox strong { display: block; color: var(--danger); font-size: 15px; margin-bottom: 8px; }
  .errbox p { color: #a04040; font-size: 13px; line-height: 1.6; }
  .lstate { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 80px 40px; text-align: center; }
  .lring { width: 60px; height: 60px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 1s linear infinite; }
  .ltitle { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; }
  .lsteps { display: flex; flex-direction: column; gap: 8px; }
  .lstep { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
  .ldot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: pulse 1.5s ease-in-out infinite; }
  .lstep:nth-child(2) .ldot { animation-delay: 0.3s; }
  .lstep:nth-child(3) .ldot { animation-delay: 0.6s; }
  @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
  .apibox { background: #fffbf0; border: 1px solid var(--gold); border-radius: 10px; padding: 14px; }
  .apibox label { font-size: 11px; font-family: 'DM Mono', monospace; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 6px; }
  .apikey { width: 100%; border: 1px solid var(--border); border-radius: 6px; padding: 8px 10px; font-family: 'DM Mono', monospace; font-size: 11px; background: white; outline: none; color: var(--ink); }
  .apikey:focus { border-color: var(--gold); }
  .apinote { font-size: 11px; color: var(--muted); margin-top: 6px; line-height: 1.5; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .fu { animation: fadeUp 0.35s ease forwards; }
  @media(max-width:768px) { .main{grid-template-columns:1fr} .content{padding:20px} .compgrid{grid-template-columns:1fr} }
`;

const SAMPLE = `NON-DISCLOSURE AGREEMENT

This NDA is between TechCorp Pvt. Ltd. ("Disclosing Party") and the undersigned ("Receiving Party").

1. OBLIGATIONS: Receiving Party shall hold Confidential Information in strict confidence.

2. TERM: This Agreement shall remain in effect INDEFINITELY and survive any termination without limitation.

3. UNILATERAL MODIFICATION: Disclosing Party may modify or terminate this Agreement at any time WITHOUT PRIOR NOTICE to Receiving Party.

4. GOVERNING LAW: Disputes resolved through binding arbitration at a location SOLELY DETERMINED by the Disclosing Party.

5. IP ASSIGNMENT: Any work product conceived by Receiving Party shall AUTOMATICALLY vest in Disclosing Party without additional compensation.

6. LIQUIDATED DAMAGES: Breach results in $500,000 USD per incident plus ALL legal fees, regardless of actual damages.

7. DATA RETENTION: Disclosing Party may retain and use Receiving Party's information for UNLIMITED PERIOD for any business purpose.`;

const TYPES = ["NDA","Employment","Vendor","SaaS","IP License","Freelance"];
const MODES = ["Risk Scanner","Comparison","Compliance"];

function Ring({ score, level }) {
  const c = { HIGH:"#c0392b", MEDIUM:"#d4781a", LOW:"#1a6b45" }[level] || "#d4781a";
  const r=36, circ=2*Math.PI*r, dash=(score/100)*circ;
  return (
    <div className="rring">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#eee" strokeWidth="6"/>
        <circle cx="44" cy="44" r={r} fill="none" stroke={c} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div className="rlabel">
        <span className="rnum" style={{color:c}}>{score}</span>
        <span className="rtxt">/100</span>
      </div>
    </div>
  );
}

function ClauseCard({ c }) {
  const [open, setOpen] = useState(false);
  const lv = (c.riskLevel||"MEDIUM").toUpperCase();
  const dotCls = {HIGH:"dh",MEDIUM:"dm",LOW:"dl"}[lv]||"dm";
  const lvCls = {HIGH:"clH",MEDIUM:"clM",LOW:"clL"}[lv]||"clM";
  return (
    <div className="ccard fu">
      <div className="ch" onClick={()=>setOpen(o=>!o)}>
        <div className={`dot ${dotCls}`}/>
        <div className="cn">{c.clauseName}</div>
        <span className={`cl ${lvCls}`}>{lv}</span>
        <span style={{fontSize:11,color:"#bbb",marginLeft:4,display:"inline-block",transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▼</span>
      </div>
      {open && (
        <div className="cb">
          {c.originalText && <div className="corig">"{c.originalText}"</div>}
          <div className="cexp">{c.explanation}</div>
          {c.suggestion && (
            <div className="sbox">
              <div className="slbl">✦ SUGGESTED REDLINE</div>
              <div className="stxt">{c.suggestion}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [text, setText] = useState("");
  const [tmpl, setTmpl] = useState("");
  const [type, setType] = useState("NDA");
  const [mode, setMode] = useState("Risk Scanner");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [drag, setDrag] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("lg_key")||"");
  const fileRef = useRef();

  const saveKey = (v) => { setApiKey(v); localStorage.setItem("lg_key", v); };

  const onFile = useCallback(async f => { if(f) setText(await f.text()); },[]);

  const analyze = async () => {
    const key = apiKey.trim() || import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!key) { alert("Please enter your Anthropic API key first."); return; }
    if (!text.trim()) return;
    setLoading(true); setResult(null);

    const snip = text.slice(0,2500);
    let prompt;

    if (mode==="Risk Scanner") {
      prompt = `You are LexGuard AI, a legal risk analyzer for ${type} contracts under Indian law.
Return ONLY a raw JSON object. No markdown, no backticks, no text outside JSON.
Contract: """${snip}"""
JSON schema (ALL strings under 100 chars):
{"contractTitle":"","overallRiskScore":75,"overallRiskLevel":"HIGH","summary":"one sentence",
"clauses":[{"clauseName":"","riskLevel":"HIGH","originalText":"short quote","explanation":"why risky","suggestion":"safer wording"}],
"complianceFlags":[{"law":"Indian Contract Act 1872","status":"CONCERN","note":"brief"}],
"stats":{"highRisk":2,"mediumRisk":2,"lowRisk":1}}
Return exactly 4-5 clauses. Short strings only. Valid JSON only.`;
    } else if (mode==="Comparison") {
      const t = tmpl||"Standard NDA: mutual confidentiality, 2-year term, no unilateral modification, Delhi jurisdiction, no IP assignment, no liquidated damages.";
      prompt = `You are LexGuard AI. Compare contract vs template. Return ONLY raw JSON.
Contract: """${snip}"""
Template: """${t.slice(0,600)}"""
JSON (strings under 100 chars):
{"overallRiskScore":70,"overallRiskLevel":"HIGH","summary":"one sentence",
"deviations":[{"clauseName":"","riskLevel":"HIGH","originalText":"quote","explanation":"deviation","suggestion":"fix"}],
"missingProtections":["item1","item2"],
"stats":{"highRisk":2,"mediumRisk":1,"lowRisk":1}}
3-4 deviations max. Valid JSON only.`;
    } else {
      prompt = `You are LexGuard AI, India compliance specialist. Check this ${type} contract. Return ONLY raw JSON.
Contract: """${snip}"""
JSON (strings under 100 chars):
{"overallRiskScore":65,"overallRiskLevel":"MEDIUM","summary":"one sentence",
"clauses":[{"clauseName":"","riskLevel":"MEDIUM","originalText":"quote","explanation":"issue","suggestion":"fix"}],
"complianceFlags":[{"law":"Indian Contract Act 1872","status":"CONCERN","note":"brief"}],
"stats":{"highRisk":1,"mediumRisk":2,"lowRisk":2}}
3-4 clauses, 3-4 flags. Valid JSON only.`;
    }

    try {
      const res = await fetch("/api/analyze",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:MODEL,max_tokens:4000,messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const raw = data.content?.map(b=>b.text||"").join("")||"";
      const start = raw.indexOf("{");
      if (start===-1) throw new Error("No JSON in response");
      let depth=0, jsonStr="";
      for(let i=start;i<raw.length;i++){
        if(raw[i]==="{") depth++;
        else if(raw[i]==="}"){depth--;if(depth===0){jsonStr=raw.slice(start,i+1);break;}}
      }
      if(!jsonStr) throw new Error("Response was cut off, please try again.");
      setResult({...JSON.parse(jsonStr), mode});
    } catch(e) {
      console.error(e);
      setResult({error: e.message, mode});
    }
    setLoading(false);
  };

  const exportTxt = () => {
    if (!result) return;
    const items = result.clauses||result.deviations||[];
    const lines = [
      "═══════════════════════════════════════════════",
      "  LEXGUARD AI — CONTRACT ANALYSIS REPORT",
      "═══════════════════════════════════════════════",
      `  Date     : ${new Date().toLocaleString("en-IN")}`,
      `  Type     : ${type}  |  Mode: ${mode}`,
      `  Risk     : ${result.overallRiskScore}/100 (${result.overallRiskLevel})`,
      "═══════════════════════════════════════════════","",
      "SUMMARY","───────",result.summary||"","",
      `FLAGGED CLAUSES (${items.length})`, "───────",
      ...items.map((c,i)=>`${i+1}. [${c.riskLevel}] ${c.clauseName}\n   Issue: ${c.explanation}\n   Fix  : ${c.suggestion||"N/A"}\n`),
    ];
    if(result.missingProtections?.length){
      lines.push("MISSING PROTECTIONS","───────");
      result.missingProtections.forEach(p=>lines.push("  • "+p));
      lines.push("");
    }
    if(result.complianceFlags?.length){
      lines.push("INDIA COMPLIANCE","───────");
      result.complianceFlags.forEach(f=>lines.push(`  [${f.status}] ${f.law}: ${f.note}`));
    }
    lines.push("","═══════════════════════════════════════════════","  LexGuard AI | Powered by Anthropic Claude","═══════════════════════════════════════════════");
    const blob = new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download=`LexGuard_${type}_${Date.now()}.txt`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">⚖</div>
            <div className="logo-text">Lex<span>Guard</span> AI</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <span className="hbadge">INDIA EDITION</span>
            <span className="hbadge">v1.0</span>
          </div>
        </header>

        <div className="main">
          <aside className="sidebar">

            {/* API Key input — only shows if no env key */}
            <div className="apibox">
              <label>Anthropic API Key</label>
              <input className="apikey" type="password" placeholder="sk-ant-api03-..."
                value={apiKey} onChange={e=>saveKey(e.target.value)}/>
              <div className="apinote">
                Get free key at <strong>console.anthropic.com</strong><br/>
                Saved in your browser only.
              </div>
            </div>

            <div>
              <div className="slabel">Analysis Mode</div>
              <div className="mode-tabs">
                {MODES.map(m=>(
                  <button key={m} className={`mtab${mode===m?" on":""}`}
                    onClick={()=>{setMode(m);setResult(null);}}>
                    {m==="Risk Scanner"?"🔍 Scanner":m==="Comparison"?"⚖ Compare":"🇮🇳 Compliance"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="slabel">Contract Type</div>
              <div className="chips">
                {TYPES.map(t=>(
                  <button key={t} className={`chip${type===t?" on":""}`} onClick={()=>setType(t)}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <div className={`upload-zone${drag?" drag":""}`} style={{position:"relative"}}
                onDragOver={e=>{e.preventDefault();setDrag(true);}}
                onDragLeave={()=>setDrag(false)}
                onDrop={e=>{e.preventDefault();setDrag(false);onFile(e.dataTransfer.files[0]);}}
                onClick={()=>fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept=".txt,.docx"
                  style={{display:"none"}} onChange={e=>onFile(e.target.files[0])}/>
                <div style={{fontSize:28,marginBottom:8}}>📄</div>
                <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>Drop contract here</div>
                <div style={{fontSize:12,color:"var(--muted)"}}>or click to browse (.txt)</div>
              </div>
            </div>

            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div className="slabel" style={{marginBottom:0}}>Paste Contract Text</div>
                <button onClick={()=>setText(SAMPLE)}
                  style={{fontSize:11,color:"var(--gold)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>
                  Load Sample
                </button>
              </div>
              <textarea className="tinput" placeholder="Paste contract text here..."
                value={text} onChange={e=>setText(e.target.value)}/>
            </div>

            {mode==="Comparison"&&(
              <div>
                <div className="slabel">Your Standard Template</div>
                <textarea className="tinput tsmall"
                  placeholder="Paste your firm's standard template (or leave blank)..."
                  value={tmpl} onChange={e=>setTmpl(e.target.value)}/>
              </div>
            )}

            <button className="abtn" onClick={analyze} disabled={loading||!text.trim()}>
              {loading?<><div className="spin"/>Analyzing...</>:`⚡ Analyze ${type}`}
            </button>

          </aside>

          <main className="content">
            {!result&&!loading&&(
              <div className="welcome">
                <div style={{fontSize:56}}>⚖️</div>
                <div className="wtitle">Legal Intelligence<br/>at <span>Your Command</span></div>
                <div className="wsub">Upload any contract and LexGuard AI scans it for risk, compares templates, and checks Indian law compliance in seconds.</div>
                <div className="fpills">
                  <div className="fpill">🔴 Risk Scoring</div>
                  <div className="fpill">✏️ Redline Suggestions</div>
                  <div className="fpill">⚖️ Clause Comparison</div>
                  <div className="fpill">🇮🇳 India Compliance</div>
                </div>
              </div>
            )}

            {loading&&(
              <div className="lstate">
                <div className="lring"/>
                <div className="ltitle">Analyzing Contract...</div>
                <div className="lsteps">
                  <div className="lstep"><div className="ldot"/>Parsing clauses</div>
                  <div className="lstep"><div className="ldot"/>Scoring risk levels</div>
                  <div className="lstep"><div className="ldot"/>Generating redlines</div>
                </div>
              </div>
            )}

            {result?.error&&(
              <div className="errbox">
                <strong>⚠ Analysis Error</strong>
                <p>{result.error}</p>
                <p style={{marginTop:8}}>Tip: Try "Load Sample" to test, or check your API key is correct.</p>
              </div>
            )}

            {result&&!result.error&&(
              <>
                <div className="rhead fu">
                  <Ring score={result.overallRiskScore} level={result.overallRiskLevel}/>
                  <div className="rinfo">
                    <div className="rtitle">{result.contractTitle||type+" Analysis"}</div>
                    <div className="rmeta">{type} · {mode} · {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                    <div className="rbadges">
                      <span className="rb rbh">{result.stats?.highRisk??0} High</span>
                      <span className="rb rbm">{result.stats?.mediumRisk??0} Medium</span>
                      <span className="rb rbl">{result.stats?.lowRisk??0} Low</span>
                    </div>
                  </div>
                </div>

                {result.summary&&(
                  <div className="fu" style={{background:"white",border:"1px solid var(--border)",borderRadius:12,padding:"18px 22px",fontSize:14,lineHeight:1.7,color:"#333"}}>
                    <div className="slabel" style={{marginBottom:8}}>Executive Summary</div>
                    {result.summary}
                  </div>
                )}

                <div className="sgrid fu">
                  <div className="scard"><div className="snum nr">{result.stats?.highRisk??0}</div><div className="slb">High Risk</div></div>
                  <div className="scard"><div className="snum no">{result.stats?.mediumRisk??0}</div><div className="slb">Medium Risk</div></div>
                  <div className="scard"><div className="snum ng">{result.stats?.lowRisk??0}</div><div className="slb">Low Risk</div></div>
                </div>

                {(result.clauses||result.deviations||[]).length>0&&(
                  <div>
                    <div className="stitle">
                      {mode==="Comparison"?"⚖ Deviations":"🔍 Flagged Clauses"}
                      <span className="cbadge">{(result.clauses||result.deviations||[]).length}</span>
                    </div>
                    {(result.clauses||result.deviations||[])
                      .sort((a,b)=>({HIGH:0,MEDIUM:1,LOW:2}[a.riskLevel?.toUpperCase()]??1)-({HIGH:0,MEDIUM:1,LOW:2}[b.riskLevel?.toUpperCase()]??1))
                      .map((c,i)=><ClauseCard key={i} c={c}/>)}
                  </div>
                )}

                {result.missingProtections?.length>0&&(
                  <div className="fu">
                    <div className="stitle">🛡 Missing Protections</div>
                    {result.missingProtections.map((p,i)=>(
                      <div key={i} style={{background:"white",borderLeft:"4px solid var(--danger)",borderRadius:"0 10px 10px 0",padding:"12px 16px",marginBottom:8,fontSize:13}}>⚠ {p}</div>
                    ))}
                  </div>
                )}

                {result.complianceFlags?.length>0&&(
                  <div className="fu">
                    <div className="stitle">🇮🇳 India Compliance</div>
                    <div className="compgrid">
                      {result.complianceFlags.map((f,i)=>(
                        <div key={i} className="compcard">
                          <div className="compname">{f.law}</div>
                          <div className={`compst ${f.status==="OK"?"cok":f.status==="CONCERN"?"cwarn":"crisk"}`}>
                            {f.status==="OK"?"✓ OK":f.status==="CONCERN"?"⚠ CONCERN":"✗ VIOLATION"}
                          </div>
                          <div className="compnote">{f.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="xbar fu">
                  <div>
                    <div className="xtxt">📋 Full Report Ready</div>
                    <div className="xsub">Download structured analysis for your records</div>
                  </div>
                  <button className="xbtn" onClick={exportTxt}>⬇ Export .TXT</button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
