import React, { useState } from 'react';
import { ArrowDown, ArrowRight, Heart, Music2 } from 'lucide-react';

export default function App() {
  const [opened, setOpened] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return <main className="birthday">
    <div className="night-sky" aria-hidden="true">
      {Array.from({length:54},(_,i)=><i key={i} style={{left:((i*41+7)%100)+'%',top:((i*67+3)%100)+'%',animationDelay:((i%9)*-.6)+'s'}} />)}
      <div className="moon-glow"/><div className="shooting-star"/>
    </div>
    <header className="nav"><a className="wordmark" href="#top">X<span>.</span></a><div className="nav-note">A LETTER FOR XUSHNUD <span>✦</span></div><div className="sound"><Music2 size={16}/> A PERSONAL NOTE</div></header>
    <section className="intro" id="top">
      <div className="date-line"><span/> A SPECIAL DAY <span/></div>
      <h1>Bugun osmon ham<br/><em>boshqacha porlaydi.</em></h1>
      <p className="intro-copy">Chunki bugun yaxshi insonlardan biri — Xushnudning tug‘ilgan kuni.</p>
      <div className="scroll-cue">PASTGA TUSH <ArrowDown size={14}/></div>
    </section>
    <section className="letter-section">
      <div className="section-kicker">01 / A LITTLE SURPRISE</div>
      <h2>Senga bir xat bor.</h2>
      <p className="section-copy">Shoshilma. Bu xat aynan sen uchun yozilgan.</p>
      <button className={'envelope-wrap '+(opened?'opened':'')} onClick={()=>setOpened(true)} aria-label="Xatni ochish">
        <div className="envelope-shadow"/>
        <div className="envelope">
          <div className="letter"><span>DEAR XUSHNUD</span><Heart size={22}/><small>Open when you're ready</small></div>
          <div className="envelope-back"/>
          <div className="envelope-front"/>
          <div className="envelope-flap"/>
          <div className="wax"><Heart size={20}/></div>
        </div>
      </button>
      <div className="tap-hint">{opened?'XAT OCHILDI':'XATNI OCHISH UCHUN BOS'}</div>
      {opened&&<div className="letter-reveal"><div className="gold-rule"/><p>Ba’zi insonlar bor — ular borligi bilan kunlarni yorug‘roq qiladi. Sen ham shunday insonlardan birisan.</p><span>— Senga atalgan samimiy tilak</span><button className="outline-button" onClick={()=>setRevealed(true)}>Tilaklarni ko‘rish <ArrowRight size={16}/></button></div>}
    </section>
    {revealed&&<section className="wishes" id="wishes">
      <div className="section-kicker">02 / FROM THE HEART</div>
      <div className="wish-symbol"><Sparkles size={28}/></div>
      <h2>Yangi yoshing<br/><em>go‘zal boshlansin.</em></h2>
      <div className="wish-list">
        <div><span>01</span><p>Har bir yangi kuning yaxshi xabar va quvonch olib kelsin.</p></div>
        <div><span>02</span><p>Ko‘nglingdagi katta orzularing birin-ketin amalga oshsin.</p></div>
        <div><span>03</span><p>Atrofingda doim samimiy insonlar, qalbingda esa xotirjamlik bo‘lsin.</p></div>
      </div>
      <div className="final-card"><div className="sparkler">✦</div><p className="final-small">HAPPY BIRTHDAY</p><h3>Xushnud</h3><p>Yaxshi kunlaring hali oldinda. Tug‘ilgan kuning muborak bo‘lsin!</p><div className="final-heart">♥</div></div>
      <button className="again" onClick={()=>{setOpened(false);setRevealed(false);window.scrollTo({top:0,behavior:'smooth'});}}>Boshidan ko‘rish <ArrowRight size={14}/></button>
    </section>}
    <footer><span>MADE WITH SINCERITY</span><Heart size={13}/><span>FOR XUSHNUD</span></footer>
  </main>;
}