import React, { useState } from 'react';
import { ArrowRight, Check, ChevronLeft, Gift, Heart, Sparkles, Star, Trophy } from 'lucide-react';

const rounds = [
  { title: 'Birinchi sir', question: 'Bugungi kun nimasi bilan boshqalardan farq qiladi?', options: ['Oddiy kun', 'Yangi bir xotira boshlanadi', 'Dushanba bo‘lgani uchun'], answer: 1, note: 'To‘g‘ri! Bugun sen uchun alohida sahifa ochiladi.' },
  { title: 'Kichik xotira', question: 'Eng yaxshi sovg‘a qaysi?', options: ['Qimmat buyum', 'Samimiy e’tibor', 'Faqat shirinlik'], answer: 1, note: 'Aynan shunday. Eng chiroyli sovg‘a — chin dildan berilgan e’tibor.' },
  { title: 'Oxirgi kalit', question: 'Syurprizni ochishga tayyormisan?', options: ['Hali emas', 'Albatta, ochamiz!'], answer: 1, note: 'Barcha kalitlar topildi. Endi eng yoqimli qismiga o‘tamiz!' }
];

export default function App() {
  const [step, setStep] = useState(-1);
  const [choice, setChoice] = useState(null);
  const [won, setWon] = useState(false);
  const [name, setName] = useState('Aziz inson');
  const [editing, setEditing] = useState(false);
  const [party, setParty] = useState(false);
  const current = rounds[Math.max(0, step)];
  const next = () => {
    if (choice === null || choice !== current.answer) return;
    if (step === rounds.length - 1) { setWon(true); setParty(true); }
    else { setStep(step + 1); setChoice(null); }
  };
  return <main className="app-shell">
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <div className="stars">{Array.from({length:32},(_,i)=><i key={i} style={{left:((i*29)%100)+'%',top:((i*43)%100)+'%',animationDelay:((i%8)*-.7)+'s'}}/>)}</div>
    <div className="float-layer">{Array.from({length:16},(_,i)=><span key={i} style={{left:((i*37+9)%100)+'%',animationDelay:((i%7)*-1.8)+'s'}}>{i%3===0?'✦':i%3===1?'♡':'·'}</span>)}</div>
    {party && <div className="confetti" onAnimationEnd={()=>setParty(false)}>{Array.from({length:55},(_,i)=><b key={i} style={{left:((i*17)%100)+'%',animationDelay:((i%9)*.04)+'s'}}/>)}</div>}
    <header className="topbar"><a className="brand" href="#" onClick={e=>{e.preventDefault();setStep(-1);setWon(false);setChoice(null);}}><span className="brand-mark"><Sparkles size={17}/></span> little<span>moments</span></a><div className="top-tag"><i/> MADE WITH CARE</div></header>
    <section className="content">
      {!won && step === -1 && <div className="panel welcome-panel">
        <div className="eyebrow"><Sparkles size={14}/> BUGUN SENING KUNING</div>
        <div className="hero-orbit"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="gift-emoji">🎁</div><span className="orbit-star star-a">✦</span><span className="orbit-star star-b">✧</span></div>
        <p className="overline">BIR OZ VAQT AJRAT</p><h1>Senga atalgan<br/><em>kichik mo‘jiza.</em></h1>
        <p className="intro">Bu sahifada bir nechta sir yashiringan. Ularni birgalikda ochamizmi?</p>
        <div className="name-row">{editing?<input value={name} onChange={e=>setName(e.target.value)} maxLength={28}/>:<span>{name}</span>}<button className="text-button" onClick={()=>setEditing(!editing)}>{editing?'Tayyor':'Ismni o‘zgartirish'}</button></div>
        <button className="primary-button" onClick={()=>setStep(0)}>Sayohatni boshlash <ArrowRight size={18}/></button>
        <div className="micro-note"><Heart size={12}/> Faqat sen uchun tayyorlangan</div>
      </div>}
      {!won && step >= 0 && <div className="panel quiz-panel">
        <div className="quiz-top"><button className="back-button" onClick={()=>{setStep(step-1);setChoice(null);}}><ChevronLeft size={17}/> Orqaga</button><span>MAXFIY SAYOHAT <Sparkles size={13}/></span></div>
        <div className="progress-meta"><span>0{step+1} <small>/ 0{rounds.length}</small></span><span>{Math.round(((step+1)/rounds.length)*100)}%</span></div>
        <div className="progress-track"><div style={{width:(((step+1)/rounds.length)*100)+'%'}}/></div>
        <div className="step-icon">{step===0?'🌙':step===1?'💜':'🗝️'}</div><p className="overline">{current.title.toUpperCase()}</p>
        <h2>{current.question}</h2><p className="quiz-hint">Javobni tanla va keyingi sirga yo‘l och.</p>
        <div className="options">{current.options.map((option,i)=><button key={option} className={'option '+(choice===i?'selected':'')} onClick={()=>setChoice(i)}><span className="option-letter">{String.fromCharCode(65+i)}</span><span>{option}</span>{choice===i&&<Check size={17}/>}</button>)}</div>
        {choice!==null&&<div className="feedback"><Sparkles size={15}/>{choice===current.answer?current.note:'Yana bir o‘ylab ko‘r. Senga ishonaman!'}</div>}
        <button className="primary-button full" disabled={choice===null||choice!==current.answer} onClick={next}>{step===rounds.length-1?'Syurprizni ochish':'Davom etish'} <ArrowRight size={18}/></button>
        <div className="micro-note"><Heart size={12}/> Har bir javob seni syurprizga yaqinlashtiradi</div>
      </div>}
      {won && <div className="panel victory-panel">
        <div className="victory-badge"><Trophy size={27}/></div><div className="eyebrow"><Star size={14}/> BARCHA SIRLAR OCHILDI <Star size={14}/></div>
        <h1 className="victory-title">VICTORY<span>!</span></h1><p className="victory-sub">Tabriklaymiz, {name}!</p>
        <div className="message-card"><div className="message-spark">✦</div><p>Hayoting quvonchli lahzalar, kutilmagan go‘zal uchrashuvlar va unutilmas xotiralarga to‘la bo‘lsin.</p><strong>Sen eng yaxshisiga loyiqsan. 💜</strong></div>
        <div className="wish-grid"><div><span>✧</span><b>Baxt</b><small>Har kuni</small></div><div><span>♡</span><b>Mehr</b><small>Cheksiz</small></div><div><span>✦</span><b>Orzular</b><small>Ushalsin</small></div></div>
        <button className="primary-button" onClick={()=>setParty(true)}>Yana bir bor bayram qil <Sparkles size={17}/></button>
        <button className="restart-button" onClick={()=>{setStep(-1);setChoice(null);setWon(false);}}>Boshidan ko‘rish</button>
        <div className="micro-note"><Heart size={12}/> Ushbu sahifa yaxshi kayfiyat uchun yaratildi</div>
      </div>}
    </section>
    <footer className="footer"><span>✦</span> A LITTLE JOY, MADE JUST FOR YOU <span>✦</span></footer>
  </main>;
}