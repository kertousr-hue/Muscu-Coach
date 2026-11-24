/* ============ Fréquence cardiaque et calories en direct (montre ou ceinture Bluetooth, service standard « Heart Rate ») ============ */
const HR = {
  dev:null, ch:null, bpm:0, last:0, rec:false, t0:0, samples:[], name:'',
  supported: !!(navigator.bluetooth && navigator.bluetooth.requestDevice),
  ZONES:[['Récup','#7aa2ff'],['Endurance','#3ecf8e'],['Aérobie','#e5b842'],['Seuil','#ffa63d'],['Max','#ff5a36']],
  prof(){ const d=DB.get('diet',{}); const w=DB.get('weights',[]); return {age:+d.age||35, kg:+(w.length?w[w.length-1].kg:d.poids)||80, h:(d.sexe||'h')==='h'}; },
  hrMax(){ return Math.round(208-0.7*this.prof().age); },
  zone(b){ const p=b/this.hrMax(); return p<.6?0:p<.7?1:p<.8?2:p<.9?3:4; },
  live(){ return !!(this.dev && this.bpm && Date.now()-this.last<6000); },
  async connect(){
    if(!this.supported){ toast('Bluetooth non disponible ici : utilise Chrome sur Android'); return; }
    try{
      const dev=await navigator.bluetooth.requestDevice({filters:[{services:['heart_rate']}]});
      this.dev=dev; dev.addEventListener('gattserverdisconnected',()=>this.lost());
      await this.attach(); if(state.view==='seance'&&state.day) this.start(); render();
    }catch(e){ if(e.name!=='NotFoundError') toast('Connexion impossible : '+e.message); }
  },
  async attach(){
    const srv=await this.dev.gatt.connect();
    const s=await srv.getPrimaryService('heart_rate');
    this.ch=await s.getCharacteristic('heart_rate_measurement');
    this.ch.addEventListener('characteristicvaluechanged',ev=>this.onData(ev.target.value));
    await this.ch.startNotifications();
    this.name=this.dev.name||'Capteur'; toast('❤️ '+this.name+' connecté'); this.ui();
  },
  onData(v){
    const f=v.getUint8(0); const b=(f&1)?v.getUint16(1,true):v.getUint8(1);
    if(!b||b<30||b>230) return;
    // Énergie dépensée envoyée par la montre (kJ cumulés), si elle la transmet
    if(f&8){ const o=(f&1)?3:2; if(v.byteLength>=o+2){ const ee=v.getUint16(o,true); if(this.rec){ if(this.ee0==null||ee<this.ee0) this.ee0=ee; this.eeKcal=(ee-this.ee0)/4.184; } } }
    this.bpm=b; this.last=Date.now();
    if(this.rec) this.samples.push([Math.round((this.last-this.t0)/1000),b]);
    this.ui();
  },
  async lost(){
    this.ui(); const d=this.dev;
    for(let i=0;i<5&&this.dev===d&&d;i++){
      await new Promise(r=>setTimeout(r,2000*(i+1)));
      try{ await this.attach(); return; }catch(e){}
    }
    if(this.dev===d){ toast('Montre déconnectée'); this.ui(); }
  },
  disconnect(){ const d=this.dev; this.dev=null; this.bpm=0; try{ d&&d.gatt.disconnect(); }catch(e){} this.ui(); render(); },
  start(){ if(this.rec) return; this.rec=true; this.t0=Date.now(); this.samples=[]; this.ee0=null; this.eeKcal=0; this.ui(); },
  // Résumé : moyenne, max, temps par zone et calories (formule de Keytel, basée sur le pouls, l'âge et le poids)
  summary(){
    const s=this.samples; if(s.length<20) return null;
    const p=this.prof(); const zones=[0,0,0,0,0]; let kcal=0, sum=0, dur=0;
    for(let i=1;i<s.length;i++){
      const dt=Math.min(10,s[i][0]-s[i-1][0]); if(dt<=0) continue; const b=s[i][1];
      zones[this.zone(b)]+=dt; sum+=b*dt; dur+=dt;
      const kmin=p.h?(-55.0969+0.6309*b+0.1988*p.kg+0.2017*p.age)/4.184:(-20.4022+0.4472*b-0.1263*p.kg+0.074*p.age)/4.184;
      kcal+=Math.max(0,kmin)*dt/60;
    }
    if(dur<60) return null;
    const dev=this.eeKcal>5?Math.round(this.eeKcal):0;
    const bs=s.map(x=>x[1]); const ds=[]; let nt=-1;
    s.forEach(x=>{ if(x[0]>=nt){ ds.push(x); nt=x[0]+10; } });
    return {minutes:Math.round(s[s.length-1][0]/6)/10, hr_avg:Math.round(sum/dur), hr_max:Math.max(...bs), hr_min:Math.min(...bs),
      kcal:dev||Math.round(kcal), src:dev?'montre':'pouls', zones:zones.map(z=>Math.round(z)), samples:ds, started_at:new Date(this.t0).toISOString()};
  },
  stop(label){
    const r=this.rec?this.summary():null; this.rec=false; this.samples=[];
    if(!r) return null;
    const row={id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())),done_on:today(),label,...r};
    const L=DB.get('heart',[]); L.push(row); DB.set('heart',L.slice(-200)); this.push(row);
    return row;
  },
  async push(row){
    if(typeof Sync==='undefined'||!Sync.user) return;
    const {synced,...data}=row;
    const {error}=await Sync.sb.from('muscu_heart').upsert({...data,user_id:Sync.user.id});
    if(error) console.warn(error); else { const L=DB.get('heart',[]); const x=L.find(y=>y.id===row.id); if(x){x.synced=true; DB.set('heart',L);} }
  },
  async pull(){
    if(typeof Sync==='undefined'||!Sync.user) return;
    DB.get('heart',[]).filter(x=>!x.synced).forEach(x=>this.push(x));
    const {data,error}=await Sync.sb.from('muscu_heart').select('id,done_on,label,started_at,minutes,hr_avg,hr_max,hr_min,kcal,src,zones').order('done_on').limit(200);
    if(error||!data) return;
    const L=DB.get('heart',[]); const ids=new Set(L.map(x=>x.id));
    data.forEach(r=>{ if(!ids.has(r.id)) L.push({...r,synced:true}); });
    L.sort((a,b)=>String(a.started_at||a.done_on).localeCompare(String(b.started_at||b.done_on)));
    DB.set('heart',L.slice(-200)); if(state.view==='suivi'||state.view==='diete') render();
  },
  ui(){
    let b=$('#hrBadge');
    if(!b){ b=document.createElement('span'); b.id='hrBadge'; const h=document.querySelector('header'); h&&h.insertBefore(b,$('#hdrSub')); }
    if(!this.dev){ b.style.display='none'; }
    else{
      const on=this.live(); const z=on?this.ZONES[this.zone(this.bpm)]:null;
      b.style.display='inline-flex';
      b.innerHTML=on?`<i class="hrh">❤</i><b>${this.bpm}</b>${this.rec?'<em>●</em>':''}`:'<i>❤</i><span class="mut">…</span>';
      b.style.borderColor=z?z[1]:'var(--line)';
    }
    const el=$('#hrLive'); if(el) el.innerHTML=this.liveHTML();
  },
  liveHTML(){
    if(!this.dev) return `<div class="row"><div class="grow"><b>❤️ Fréquence cardiaque en direct</b><div class="mut sm">Montre ou ceinture qui diffuse le pouls en Bluetooth.</div></div>
      <button class="btn" style="padding:9px 12px" onclick="HR.connect()">Connecter</button></div>`;
    const on=this.live(); const zi=on?this.zone(this.bpm):0; const z=this.ZONES[zi]; const pct=on?Math.min(100,Math.round(this.bpm/this.hrMax()*100)):0;
    const el=this.rec?Math.round((Date.now()-this.t0)/60000):0; const s=this.rec?this.summary():null; const kc=s?s.kcal:0;
    return `<div class="row"><div style="font-size:34px;font-weight:800;letter-spacing:-.03em;color:${on?z[1]:'var(--mut)'}">${on?this.bpm:'--'}<span class="mut sm"> bpm</span></div>
      <div class="grow" style="text-align:right"><div class="sm"><b style="color:${z[1]}">${on?'Zone '+(zi+1)+' · '+z[0]:'Signal perdu…'}</b></div>
      <div class="mut sm">${esc(this.name)} · ${pct}% FC max (${this.hrMax()})</div></div></div>
      ${this.rec?`<div class="row" style="margin-top:10px;gap:8px">
        <div class="hrk"><b>🔥 ${kc}</b><span>kcal séance</span></div>
        <div class="hrk"><b>${el}</b><span>min</span></div>
        <div class="hrk"><b>${s?s.hr_avg:'--'}</b><span>bpm moy</span></div></div>`:''}
      <div class="hrz">${this.ZONES.map((x,i)=>`<i style="background:${x[1]};opacity:${i===zi&&on?1:.25}"></i>`).join('')}</div>
      <div class="row sm" style="margin-top:8px"><span class="grow mut">${this.rec?`⏺ Enregistrement${s?` · calories ${s.src==='montre'?'de la montre':'calculées avec ton pouls'}`:' · calories dans 1 min'}`:'En attente d\'une séance'}</span>
      <button class="chip" style="padding:4px 10px" onclick="HR.disconnect()">Déconnecter</button></div>`;
  },
  zonesBar(z){ const t=z.reduce((a,b)=>a+b,0)||1; return `<div class="hrbar">${z.map((v,i)=>v?`<i style="width:${v/t*100}%;background:${this.ZONES[i][1]}" title="${this.ZONES[i][0]}"></i>`:'').join('')}</div>`; }
};
(function(){const s=document.createElement('style');s.textContent=`
#hrBadge{display:none;align-items:center;gap:4px;padding:4px 10px;border-radius:99px;border:1.5px solid var(--line);background:var(--card2);font-size:13px;margin-right:2px}
#hrBadge i{font-style:normal;color:#ff4d6d}#hrBadge .hrh{animation:hb 1s ease-in-out infinite}#hrBadge em{font-style:normal;color:#ff4d6d;font-size:9px}
@keyframes hb{0%,100%{transform:scale(1)}15%{transform:scale(1.25)}30%{transform:scale(1)}}
.hrz{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:10px}.hrz i{height:8px;border-radius:4px}
.hrk{flex:1;text-align:center;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:8px 4px}.hrk b{display:block;font-size:20px;font-weight:800}.hrk span{font-size:11px;color:var(--mut)}
.hrbar{display:flex;height:8px;border-radius:5px;overflow:hidden;margin-top:6px;background:var(--card2)}.hrbar i{display:block;height:100%}`;document.head.appendChild(s);})();
setInterval(()=>{ if(HR.dev) HR.ui(); },3000);

/* --- Séance : carte cardio en haut, enregistrement automatique --- */
const _vSeanceHR = vSeance;
vSeance = function(){
  _vSeanceHR();
  if(!state.day) return;
  if(HR.dev) HR.start();
  const w=$('#app .card'); if(!w) return;
  const c=document.createElement('div'); c.className='card'; c.id='hrLive'; c.innerHTML=HR.liveHTML();
  w.before(c);
};
const _finishHR = finish;
finish = function(){
  const had=window._sess&&window._sess.ex.some(e=>e.sets.some(x=>x.done));
  const label=`${PROGS[state.prog]?.name||''} — ${state.day||''}`;
  _finishHR();
  if(!had) return;
  const r=HR.stop(label);
  if(r) setTimeout(()=>toast(`🔥 ${r.kcal} kcal brûlées · moy ${r.hr_avg} bpm · max ${r.hr_max}`),1600);
};

/* --- Calories de la montre dans la nutrition --- */
HR.todayKcal = function(){ let k=DB.get('heart',[]).filter(r=>r.done_on===today()).reduce((a,r)=>a+(+r.kcal||0),0);
  if(this.rec){ const s=this.summary(); if(s) k+=s.kcal; } return Math.round(k); };
const _calcHR = calc;
calc = function(d){ const r=_calcHR(d);
  if(HR._adj){ const k=HR.todayKcal(); if(k>0){ r.trainPlan=r.train; r.train=Math.round((r.rest+k)/10)*10; r.cT=Math.max(50,Math.round((r.train-r.prot*4-r.fat*9)/4)); r.watch=k; } }
  return r; };
const _vJournalHR = vJournal;
vJournal = function(){
  HR._adj=true; let html; try{ html=_vJournalHR(); } finally { HR._adj=false; }
  const k=HR.todayKcal(); const r=calc(dietIn());
  const card=k>0?`<div class="card"><div class="row"><div class="grow"><b>🔥 Dépensé avec la montre</b><div class="mut sm">Aujourd'hui · objectif du jour = repos ${r.rest} + ${k} kcal</div></div><b style="font-size:24px">${k}<span class="mut sm"> kcal</span></b></div>
     <div class="mut sm" style="margin-top:6px">L'estimation de séance (${r.trainK} kcal) est remplacée par la vraie dépense mesurée. Sélectionne « Jour training » pour l'appliquer.</div></div>`
   :`<div class="card sm mut">⌚ Montre connectée (Health Connect ou Bluetooth) : les calories dépensées s'ajoutent automatiquement à ton objectif du jour.</div>`;
  return card+html;
};

/* --- Suivi : historique cardio --- */
const _vSuiviHR = vSuivi;
vSuivi = function(){
  _vSuiviHR();
  const L=DB.get('heart',[]).slice(-10).reverse();
  const c=document.createElement('div');
  const d7=new Date(Date.now()-6*864e5).toISOString().slice(0,10); const W=DB.get('heart',[]).filter(r=>r.done_on>=d7);
  const wk=W.reduce((a,r)=>a+(+r.kcal||0),0);
  c.innerHTML=`<h3>❤️ Cardio des séances</h3>
   ${W.length?`<div class="card"><div class="row"><div class="grow"><b>🔥 Calories brûlées · 7 jours</b><div class="mut sm">${W.length} séance(s) · aujourd'hui ${HR.todayKcal()} kcal</div></div><b style="font-size:24px">${wk}<span class="mut sm"> kcal</span></b></div></div>`:''}<div class="card" id="hrLive">${HR.liveHTML()}</div>
   ${L.length?`<div class="card">${L.map((r,i)=>`<div style="${i?'border-top:1px solid var(--line);padding-top:10px;margin-top:10px':''}">
     <div class="row sm"><b class="grow">${esc(r.label||'Séance')}</b><span class="mut">${r.done_on}</span></div>
     <div class="row sm" style="margin-top:4px;gap:14px"><span>🔥 <b>${r.kcal??'–'}</b> kcal</span><span>Moy <b>${r.hr_avg??'–'}</b></span><span>Max <b>${r.hr_max??'–'}</b></span><span><b>${r.minutes}</b> min</span>${r.src==='health'?'<span class="tag">montre</span>':''}</div>
     ${r.zones?HR.zonesBar(r.zones):''}</div>`).join('')}
     <div class="row sm mut" style="margin-top:10px;flex-wrap:wrap;gap:8px">${HR.ZONES.map(z=>`<span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:${z[1]}"></i> ${z[0]}</span>`).join('')}</div></div>`
   :`<div class="card sm mut">Aucune séance enregistrée avec le cardio pour l'instant.</div>`}`;
  $('#app').appendChild(c);
};
HR.ui();
if(typeof Sync!=='undefined'&&Sync.user) HR.pull(); else setTimeout(()=>HR.pull(),4000);
if(state.view==='seance'||state.view==='suivi'||state.view==='diete') render();
{const s=document.createElement('script');s.src='montre.js';document.body.appendChild(s);}
