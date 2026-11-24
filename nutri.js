const OFF = 'https://world.openfoodfacts.org';
const ZXING = 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/zxing-browser.min.js';
const MEALS_J = ['Petit-déjeuner','Déjeuner','Collation','Dîner'];
const COMMON = {
  ...FOODS,
  'Riz basmati cuit':[130,2.7,28,0.3],'Pâtes cuites':[150,5.5,30,0.9],'Patate douce':[86,1.6,20,0.1],'Blanc de dinde':[110,24,0,1.5],
  'Thon au naturel':[115,26,0,1],'Cabillaud':[82,18,0,0.7],'Bœuf 5 % cru':[125,21,0,5],'Fromage blanc 3 %':[75,7.5,3.8,3],
  'Pomme':[52,0.3,14,0.2],'Avocat':[160,2,9,15],'Beurre de cacahuète':[600,25,16,50],'Riz au lait':[120,3.3,20,3]
};
const norm = s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const r1 = x=>Math.round((+x||0)*10)/10;

/* ============ Calcul des besoins ============ */
const DIET_DEF = {sexe:'h',age:35,poids:80,taille:178,bf:null,metier:'assis',seances:4,duree:60,cardio:0,obj:'recompo',autoPoids:true,adj:1};
const METIERS = {assis:['Assis (taxi, bureau)',1.25],mixte:['Mixte (assis + marche)',1.4],debout:['Debout (commerce, atelier)',1.55],physique:['Physique (BTP, manutention)',1.7]};
const OBJS = {perte_poids:['Perte de poids',-0.5,'⚖️','Perdre ~0,5 kg/semaine'],perte_gras:['Perte de gras',-0.3,'🔥','Sécher en gardant le muscle'],muscle:['Prendre du muscle',0.25,'💪','Prise de masse propre'],recompo:['Recomposition',-0.15,'♻️','Muscle + gras en douceur'],maintien:['Maintien',0,'🎯','Garder ton poids']};
const OBJ_OLD = {seche:'perte_poids',seche_douce:'perte_gras',masse:'muscle'};
const lastWeight = ()=>{const w=DB.get('weights',[]);return w.length?+w[w.length-1].kg:null;};
function dietIn(){const d={...DIET_DEF,...DB.get('diet',{})}; if(!METIERS[d.metier])d.metier='assis'; if(OBJ_OLD[d.obj])d.obj=OBJ_OLD[d.obj]; if(!OBJS[d.obj])d.obj='recompo';
  const lw=lastWeight(); if(d.autoPoids&&lw)d.poids=lw; return d;}
function calc(din){
  const d={...DIET_DEF,...din}; if(!METIERS[d.metier])d.metier='assis'; if(OBJ_OLD[d.obj])d.obj=OBJ_OLD[d.obj]; if(!OBJS[d.obj])d.obj='recompo';
  const lbm = d.bf>3&&d.bf<60 ? d.poids*(1-d.bf/100) : null;
  const bmr = Math.round(lbm ? 370+21.6*lbm : 10*d.poids+6.25*d.taille-5*d.age+(d.sexe==='h'?5:-161));
  const adj = Math.min(1.25,Math.max(0.75,+d.adj||1));
  const base = bmr*METIERS[d.metier][1]*adj;
  const trainK = Math.round(5*d.poids*(+d.duree||0)/60*adj);
  const cardioK = 6*d.poids*(+d.cardio||0)/60*adj;
  const tdee = Math.round((base*7+trainK*(+d.seances||0)+cardioK)/7);
  const rate = OBJS[d.obj][1], delta = Math.round(rate*7700/7);
  const r10 = x=>Math.round(x/10)*10;
  const rest = Math.max(bmr, r10(base+cardioK/7+delta)), train = Math.max(bmr, r10(base+cardioK/7+trainK+delta));
  const seche = d.obj.startsWith('perte');
  const prot = Math.round(lbm ? (seche?2.6:2.3)*lbm : (seche?2.2:d.obj==='muscle'?1.8:2.0)*d.poids);
  const fat = Math.round(Math.max(0.8*d.poids, 0.25*rest/9));
  const carbs = c=>Math.max(50,Math.round((c-prot*4-fat*9)/4));
  return {bmr, base:Math.round(base), trainK, tdee, train, rest, prot, fat, cT:carbs(train), cR:carbs(rest),
    fib:Math.max(25,Math.round(rest/1000*14)), eau:(d.poids*0.035+(+d.duree||0)/60*0.5).toFixed(1), delta, rate, lbm:lbm&&Math.round(lbm), adj, poids:d.poids};
}
// Maintien réel = apport moyen − variation de poids × 7700 kcal/kg
function adaptive(){
  const J=DB.get('journal',{}); const d0=new Date(Date.now()-21*864e5).toISOString().slice(0,10);
  const days=Object.keys(J).filter(k=>k>=d0&&k<today()&&J[k].length>=2);
  const W=DB.get('weights',[]).filter(w=>w.d>=new Date(Date.now()-28*864e5).toISOString().slice(0,10));
  const span=W.length?(new Date(W[W.length-1].d)-new Date(W[0].d))/864e5:0;
  if(days.length<10||W.length<3||span<10) return {ok:false,days:days.length,w:W.length,span:Math.round(span)};
  const avg=days.reduce((a,k)=>a+sumDay(J[k])[0],0)/days.length;
  const xs=W.map(w=>(new Date(w.d)-new Date(W[0].d))/864e5), ys=W.map(w=>+w.kg);
  const mx=xs.reduce((a,b)=>a+b)/xs.length, my=ys.reduce((a,b)=>a+b)/ys.length;
  const slope=xs.reduce((a,x,i)=>a+(x-mx)*(ys[i]-my),0)/xs.reduce((a,x)=>a+(x-mx)**2,0);
  return {ok:true,avg:Math.round(avg),slope,week:r1(slope*7),obs:Math.round(avg-slope*7700),days:days.length};
}
function applyAdaptive(){const a=adaptive(); if(!a.ok)return; const d=dietIn(); const base=calc({...d,adj:1}).tdee;
  DB.set('diet',{...DB.get('diet',{}),adj:Math.min(1.25,Math.max(0.75,a.obs/base))}); toast('Calcul recalé sur ton maintien réel'); render();}
function resetAdj(){DB.set('diet',{...DB.get('diet',{}),adj:1}); render();}

function calcTab(){
  const d=dietIn(); const r=calc(d); const a=adaptive(); const lw=lastWeight();
  const opt=(o,v)=>Object.entries(o).map(([k,x])=>`<option value="${k}" ${k===v?'selected':''}>${x[0]}</option>`).join('');
  return `<div class="card"><b>Ton objectif</b>
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">${Object.entries(OBJS).map(([k,o])=>`<button class="objb ${k===d.obj?'on':''}" onclick="setObj('${k}')"><span style="font-size:22px">${o[2]}</span><b>${o[0]}</b><span class="mut sm">${o[3]}</span></button>`).join('')}</div></div>
   <div class="card"><b>Tes mesures</b><div class="grid2">
     <div><label class="f">Sexe</label><select class="f" id="d_sexe"><option value="h" ${d.sexe==='h'?'selected':''}>Homme</option><option value="f" ${d.sexe==='f'?'selected':''}>Femme</option></select></div>
     <div><label class="f">Âge</label><input class="f" id="d_age" inputmode="numeric" value="${d.age}"></div>
     <div><label class="f">Poids (kg)${lw&&d.autoPoids?' · suivi':''}</label><input class="f" id="d_poids" inputmode="decimal" value="${d.poids}"></div>
     <div><label class="f">Taille (cm)</label><input class="f" id="d_taille" inputmode="numeric" value="${d.taille}"></div>
     <div><label class="f">Masse grasse % (option)</label><input class="f" id="d_bf" inputmode="decimal" placeholder="ex. 18" value="${d.bf||''}"></div>
     <div><label class="f">Métier</label><select class="f" id="d_metier">${opt(METIERS,d.metier)}</select></div>
     <div><label class="f">Séances / semaine</label><input class="f" id="d_seances" inputmode="numeric" value="${d.seances}"></div>
     <div><label class="f">Durée séance (min)</label><input class="f" id="d_duree" inputmode="numeric" value="${d.duree}"></div>
     <div><label class="f">Cardio (min / sem.)</label><input class="f" id="d_cardio" inputmode="numeric" value="${d.cardio||0}"></div>
</div>
     ${lw?`<label class="sm mut" style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="d_auto" ${d.autoPoids?'checked':''}> Utiliser mon dernier poids du Suivi (${lw} kg)</label>`:''}
     <button class="btn block" style="margin-top:14px" onclick="saveDiet()">Calculer</button></div>
   <div class="card"><b>Détail du calcul</b>
     ${[['Métabolisme de base'+(r.lbm?' (masse maigre '+r.lbm+' kg)':''),r.bmr],['Vie quotidienne + digestion',r.base-r.bmr],['Musculation (par séance)',r.trainK],['Maintien moyen',r.tdee],['Objectif ('+(r.rate>0?'+':'')+r.rate+' kg/sem)',r.delta]]
       .map(([l,v],i)=>`<div class="row sm" style="padding:5px 0;${i?'border-top:1px solid var(--line)':''}"><span class="grow ${i===3?'':'mut'}">${l}</span><b>${v>0&&i===4?'+':''}${v} kcal</b></div>`).join('')}
     ${r.adj!==1?`<div class="hint">Recalé sur ton maintien réel (×${r.adj.toFixed(2)}) · <a href="#" onclick="resetAdj();return false" style="color:var(--mut)">annuler</a></div>`:''}</div>
   <div class="card"><h3 style="margin-top:0">Jour d'entraînement</h3>${kpi4(r.train,r.prot,r.cT,r.fat)}
     <h3>Jour de repos</h3>${kpi4(r.rest,r.prot,r.cR,r.fat)}
     <p class="mut sm" style="margin-bottom:0">Fibres ≥ ${r.fib} g · Eau ≈ ${r.eau} L · Projection 8 semaines : ${r1(r.poids+r.rate*8)} kg</p></div>
   <div class="card"><b>📈 Maintien réel</b>
     ${a.ok?`<div class="sm" style="margin-top:6px">Sur ${a.days} jours notés : tu manges ${a.avg} kcal/j et ton poids varie de ${a.week>0?'+':''}${a.week} kg/sem.</div>
       <div class="row" style="margin-top:6px"><span class="grow">Maintien mesuré</span><b style="font-size:20px">${a.obs} kcal</b></div>
       <div class="mut sm">Calcul théorique : ${calc({...d,adj:1}).tdee} kcal</div>
       <button class="btn ghost block" style="margin-top:10px" onclick="applyAdaptive()">Recaler mes objectifs sur ce chiffre</button>`
     :`<div class="mut sm" style="margin-top:6px">Note tes repas au moins 10 jours (sur 3 semaines) et pèse-toi 3 fois sur 10 jours ou plus : l'appli calculera ton vrai maintien. Pour l'instant : ${a.days}/10 jours, ${a.w}/3 pesées.</div>`}</div>`;
}
const kpi4=(k,p,c,f)=>`<div class="kpi"><div><b>${k}</b><span>kcal</span></div><div><b>${p} g</b><span>Protéines</span></div><div><b>${c} g</b><span>Glucides</span></div><div><b>${f} g</b><span>Lipides</span></div></div>`;
function setObj(k){DB.set('diet',{...DB.get('diet',{}),obj:k}); render();}
function saveDiet(){
  const n=id=>+String($('#'+id).value).replace(',','.')||0;
  const auto=$('#d_auto')?$('#d_auto').checked:false;
  DB.set('diet',{...DB.get('diet',{}),sexe:$('#d_sexe').value,age:n('d_age')||35,poids:n('d_poids')||80,taille:n('d_taille')||178,bf:n('d_bf')||null,
    metier:$('#d_metier').value,seances:n('d_seances'),duree:n('d_duree')||60,cardio:n('d_cardio'),autoPoids:auto});
  render(); toast('Besoins recalculés');
}
vDiete = function(){
  const t=state.dietTab; let body='';
  if(t==='journal') body=vJournal();
  else if(t==='calc') body=calcTab();
  else if(t==='plan'){ const r=calc(dietIn());
    body=`<div class="seg"><button class="${!state.rest?'on':''}" onclick="state.rest=false;render()">Jour training · ${r.train} kcal</button><button class="${state.rest?'on':''}" onclick="state.rest=true;render()">Jour repos · ${r.rest} kcal</button></div>
     <div class="card">${planHTML(state.rest?r.rest:r.train, r)}</div>
     <div class="card sm mut">Les quantités s'ajustent à tes besoins. Remplace librement : poulet ↔ dinde / poisson blanc, riz ↔ pâtes / patate douce, saumon ↔ thon / bœuf maigre.</div>`; }
  else body=`<div class="card"><h3 style="margin-top:0">Principes clés</h3><ul style="padding-left:18px;margin:0">
      <li><b>Protéines</b> réparties sur 4 repas (25-40 g chacun), la priorité en recomposition.</li>
      <li><b>Glucides</b> autour de l'entraînement (repas d'avant et d'après).</li>
      <li><b>Lipides</b> jamais trop bas (≥ 0,8 g/kg) pour l'équilibre hormonal.</li>
      <li><b>Fibres</b> : légumes à chaque repas, ~14 g pour 1 000 kcal.</li>
      <li><b>Ajuste</b> toutes les 2 semaines avec le « maintien réel » de l'onglet Mes besoins.</li></ul></div>
     <div class="card"><h3 style="margin-top:0">Compléments utiles (optionnels)</h3><ul style="padding-left:18px;margin:0">
      <li>Whey : pratique pour atteindre le quota de protéines.</li><li>Créatine monohydrate : 3-5 g/jour.</li><li>Vitamine D3 + K2 et magnésium : surtout en hiver.</li></ul>
      <p class="mut sm">En cas de traitement ou de problème de santé, demande l'avis de ton médecin.</p></div>`;
  $('#app').innerHTML=`<h2>Nutrition</h2>
   <div class="seg"><button class="${t==='journal'?'on':''}" onclick="state.dietTab='journal';render()">Journal</button><button class="${t==='calc'?'on':''}" onclick="state.dietTab='calc';render()">Mes besoins</button><button class="${t==='plan'?'on':''}" onclick="state.dietTab='plan';render()">Plan repas</button><button class="${t==='info'?'on':''}" onclick="state.dietTab='info';render()">Conseils</button></div>${body}`;
};

/* ============ Base d'aliments (Supabase + Open Food Facts) ============ */
const FoodDB = {
  list:DB.get('foodsDB',[]), ts:DB.get('foodsDBts',0),
  async load(force){
    if(typeof Sync==='undefined'||!Sync.sb) return;
    if(!force&&this.list.length&&Date.now()-this.ts<864e5) return;
    const {data,error}=await Sync.sb.from('foods').select('id,owner,name,category,barcode,portion_g,kcal,protein,carbs,fat,fiber,sugar').order('name').limit(3000);
    if(error||!data) return;
    this.list=data.map(f=>({id:f.id,own:!!f.owner,name:f.name,cat:f.category||'Divers',bc:f.barcode||null,serv:+f.portion_g||100,per:[+f.kcal,+f.protein,+f.carbs,+f.fat,+f.fiber,+f.sugar]}));
    this.ts=Date.now(); _rawSet('foodsDB',this.list); _rawSet('foodsDBts',this.ts);
    if(state.view==='diete'&&state.jPanel) render();
  },
  all(){ const names=new Set(this.list.map(f=>norm(f.name)));
    return [...this.list, ...Object.entries(COMMON).filter(([n])=>!names.has(norm(n))).map(([n,v])=>({name:n,cat:'Courants',serv:100,per:[...v.slice(0,4),0,0]}))]; },
  search(q){ const t=norm(q).split(/\s+/).filter(Boolean); if(!t.length) return [];
    return this.all().map(f=>{const n=norm(f.name); if(!t.every(x=>n.includes(x)))return null; return {f,s:(n.startsWith(t[0])?0:1)+(f.own?-0.5:0)+n.length/100};})
      .filter(Boolean).sort((a,b)=>a.s-b.s).slice(0,15).map(x=>x.f); },
  cats(){ return [...new Set(this.all().map(f=>f.cat))]; },
  byBarcode(c){ return this.list.find(f=>f.bc===c); },
  async save(f,cat){
    if(typeof Sync==='undefined'||!Sync.user) return false;
    const row={owner:Sync.user.id,name:String(f.name).slice(0,120),category:cat,barcode:f.code||null,portion_g:f.serv||100,
      kcal:f.per[0]||0,protein:f.per[1]||0,carbs:f.per[2]||0,fat:f.per[3]||0,fiber:f.per[4]||0,sugar:f.per[5]||0};
    const {data,error}=await Sync.sb.from('foods').insert(row).select('id').single();
    if(error){console.warn(error);return false;}
    this.list.push({id:data.id,own:true,name:row.name,cat,bc:row.barcode,serv:row.portion_g,per:[row.kcal,row.protein,row.carbs,row.fat,row.fiber,row.sugar]});
    _rawSet('foodsDB',this.list); return true;
  }
};

/* ============ Journal ============ */
const defMeal = ()=>{const h=new Date().getHours();return h<10?0:h<15?1:h<18?2:3;};
const per5 = p=>[...(p||[]),0,0,0,0,0,0].slice(0,6).map(v=>+v||0);
const J = {
  day(d=today()){return (DB.get('journal',{})[d])||[];},
  add(it){const all=DB.get('journal',{});(all[today()]=all[today()]||[]).push(it);DB.set('journal',all);
    const rec=DB.get('recentFoods',[]).filter(r=>r.name!==it.name);rec.unshift({name:it.name,per:it.per,serv:it.g});DB.set('recentFoods',rec.slice(0,20));},
  del(i){const all=DB.get('journal',{});(all[today()]||[]).splice(i,1);DB.set('journal',all);render();}
};
const macro = x=>per5(x.per).map(v=>v*x.g/100);
const sumDay = l=>l.reduce((a,x)=>macro(x).map((v,i)=>a[i]+v),[0,0,0,0,0,0]);
const isTrainDay = ()=>DB.get('hist',[]).some(h=>h.date===today())||!!DB.get('draft',null);
function bar(lbl,v,t,u){const p=Math.min(100,v/t*100),over=v>t*1.05;
  return `<div style="margin:8px 0"><div class="row sm"><span class="grow">${lbl}</span><b>${Math.round(v)}</b><span class="mut">/ ${t} ${u}</span></div>
   <div class="bar" style="margin-top:4px"><i style="width:${p}%;${over?'background:#e5b842':''}"></i></div></div>`;}

function vJournal(){
  const r=calc(dietIn()); const train=state.jTrain ?? isTrainDay();
  const T={k:train?r.train:r.rest,p:r.prot,c:train?r.cT:r.cR,f:r.fat,fi:r.fib}; T.su=Math.round(T.k*0.1/4);
  const list=J.day(); const s=sumDay(list); const left=Math.round(T.k-s[0]);
  return `<div class="seg"><button class="${train?'on':''}" onclick="state.jTrain=true;render()">Jour training</button><button class="${!train?'on':''}" onclick="state.jTrain=false;render()">Jour repos</button></div>
   <div class="card"><div class="row"><div class="grow"><div class="mut sm">Reste aujourd'hui</div><b style="font-size:28px;letter-spacing:-.03em;color:${left<0?'#e5b842':'var(--txt)'}">${left} kcal</b></div>
    <div class="mut sm" style="text-align:right">Objectif ${T.k}<br>Mangé ${Math.round(s[0])}</div></div>
    ${bar('Protéines',s[1],T.p,'g')}${bar('Glucides',s[2],T.c,'g')}${bar('Lipides',s[3],T.f,'g')}${bar('Sucres (max)',s[5],T.su,'g')}${bar('Fibres',s[4],T.fi,'g')}</div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
    <button class="btn" onclick="Photo.pick()">📸 Photo du repas</button>
    <button class="btn ghost" onclick="Scan.open()">▥ Code-barres</button>
    <button class="btn ghost" onclick="state.jPanel='search';render()">🔎 Chercher</button>
    <button class="btn ghost" onclick="state.jPanel='common';render()">⭐ Aliments</button></div>
   ${panelHTML()}
   ${MEALS_J.map((m,mi)=>{const items=list.map((x,i)=>({...x,i})).filter(x=>x.meal===mi); const k=items.reduce((a,x)=>a+macro(x)[0],0);
     return `<div class="card"><div class="row"><b class="grow">${m}</b><span class="mut sm">${Math.round(k)} kcal</span></div>
      ${items.length?items.map(x=>{const mm=macro(x);return `<div class="row sm" style="padding:6px 0;border-top:1px solid var(--line)"><div class="grow">${esc(x.name)}<div class="mut">${x.g} g · P ${Math.round(mm[1])} · G ${Math.round(mm[2])} (sucres ${Math.round(mm[5])}) · L ${Math.round(mm[3])}</div></div><b>${Math.round(mm[0])}</b><button class="chip" style="padding:3px 9px" onclick="J.del(${x.i})">✕</button></div>`;}).join(''):'<div class="mut sm">Rien pour l\'instant.</div>'}</div>`;}).join('')}
   <p class="mut sm">Aliments : ta base Supabase (${FoodDB.list.length}) + Open Food Facts. Vérifie l'emballage en cas de doute.</p>`;
}

/* ---- Panneaux d'ajout ---- */
let _pick=null, _results=[], _local=[], _st=0;
const foodRow=(f,arr,i)=>`<div class="row sm" style="padding:8px 0;border-top:1px solid var(--line);cursor:pointer" onclick="openQty(${arr}[${i}])">
   <div class="grow">${esc(f.name)}${f.own?' <span class="tag p">perso</span>':''}<div class="mut">${esc(f.brand||f.cat||'')}${f.serv&&f.serv!==100?' · portion '+f.serv+' g':''}</div></div><b>${Math.round(f.per[0])}</b><span class="mut">kcal/100 g</span></div>`;
function liveSearch(q){state.jq=q; clearTimeout(_st); _st=setTimeout(()=>{_local=FoodDB.search(q); const el=$('#sres'); if(el) el.innerHTML=resultsHTML();},120);}
function panelHTML(){
  const p=state.jPanel; if(!p) return '';
  const close=`<button class="chip" style="float:right" onclick="state.jPanel=null;render()">✕</button>`;
  if(p==='search') return `<div class="card">${close}<b>Rechercher un aliment</b>
    <form class="row" style="margin-top:10px" onsubmit="event.preventDefault();offSearch(this.q.value)"><input class="f grow" name="q" autocomplete="off" placeholder="ex. skyr, riz, pain de mie…" value="${esc(state.jq||'')}" oninput="liveSearch(this.value)"><button class="btn">Web</button></form>
    <div id="sres">${resultsHTML()}</div></div>`;
  if(p==='common'){const rec=DB.get('recentFoods',[]); const cats=FoodDB.cats(); const cat=state.jcat||cats[0];
    const inCat=FoodDB.all().filter(f=>f.cat===cat); window._cat=inCat;
    return `<div class="card">${close}<b>Aliments</b>
    ${rec.length?`<h3>Récents</h3>${rec.slice(0,10).map((x,i)=>`<button class="chip" style="margin:3px" onclick="pickRecent(${i})">${esc(x.name)}</button>`).join('')}`:''}
    <h3>Par catégorie</h3><div class="chips">${cats.map(c=>`<button class="chip ${c===cat?'on':''}" onclick="state.jcat='${esc(c).replace(/'/g,"\\'")}';render()">${esc(c)}</button>`).join('')}</div>
    <div style="max-height:320px;overflow:auto">${inCat.map((f,i)=>foodRow(f,'_cat',i)).join('')}</div>
    <h3>Créer un aliment</h3><form onsubmit="event.preventDefault();pickManual(this)"><input class="f" name="n" placeholder="Nom" required>
     <div class="grid2"><input class="f" name="k" inputmode="decimal" placeholder="kcal /100 g" required style="margin-top:6px"><input class="f" name="p" inputmode="decimal" placeholder="Protéines /100 g" style="margin-top:6px">
     <input class="f" name="c" inputmode="decimal" placeholder="Glucides /100 g" style="margin-top:6px"><input class="f" name="f" inputmode="decimal" placeholder="Lipides /100 g" style="margin-top:6px">
     <input class="f" name="su" inputmode="decimal" placeholder="dont sucres /100 g" style="margin-top:6px"><input class="f" name="fi" inputmode="decimal" placeholder="Fibres /100 g" style="margin-top:6px">
     <input class="f" name="s" inputmode="decimal" placeholder="Portion (g)" style="margin-top:6px"></div>
     ${typeof Sync!=='undefined'&&Sync.user?`<label class="sm mut" style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" name="save" checked> L'enregistrer dans ma base</label>`:''}
     <button class="btn ghost block" style="margin-top:8px">Continuer</button></form></div>`;}
  if(p==='qty'&&_pick){const g=state.jg||_pick.serv||100;const sv=_pick.serv&&_pick.serv!==100?_pick.serv:null;
    return `<div class="card">${close}<b>${esc(_pick.name)}</b>${_pick.brand?`<div class="mut sm">${esc(_pick.brand)}</div>`:''}
     <div class="mut sm">Pour 100 g : ${Math.round(_pick.per[0])} kcal · P ${r1(_pick.per[1])} · G ${r1(_pick.per[2])} · L ${r1(_pick.per[3])}${_pick.per[5]?' · sucres '+r1(_pick.per[5]):''}${_pick.per[4]?' · fibres '+r1(_pick.per[4]):''}</div>
     <label class="f">Quantité (g)</label><input class="f" id="jg" inputmode="decimal" value="${g}" oninput="state.jg=+this.value.replace(',','.')||0;qtyPreview()">
     <div class="chips" style="flex-wrap:wrap;margin-top:8px">${(sv?[[sv/2,'½ portion'],[sv,'1 portion · '+sv+' g'],[sv*2,'2 portions']]:[]).concat([[50,'50 g'],[100,'100 g'],[150,'150 g'],[200,'200 g']]).map(([v,l])=>`<button class="chip ${Math.round(v)===Math.round(g)?'on':''}" onclick="state.jg=${Math.round(v)};render()">${l}</button>`).join('')}</div>
     <label class="f">Repas</label><div class="chips" style="flex-wrap:wrap">${MEALS_J.map((x,i)=>`<button class="chip ${(state.jm??defMeal())===i?'on':''}" onclick="state.jm=${i};render()">${x}</button>`).join('')}</div>
     <div class="kpi" id="qprev">${kpiHTML(per5(_pick.per).map(v=>v*g/100))}</div>
     <button class="btn block" style="margin-top:10px" onclick="addPicked()">Ajouter au journal</button></div>`;}
  if(p==='photo') return photoPanel(close);
  return '';
}
const kpiHTML = m=>`<div><b>${Math.round(m[0])}</b><span>kcal</span></div><div><b>${Math.round(m[1])} g</b><span>Protéines</span></div><div><b>${Math.round(m[5]||0)} g</b><span>Sucres</span></div><div><b>${Math.round(m[3])} g</b><span>Lipides</span></div>`;
function qtyPreview(){const g=state.jg||0;const el=$('#qprev');if(el&&_pick)el.innerHTML=kpiHTML(per5(_pick.per).map(v=>v*g/100));}
function openQty(food){_pick={...food,per:per5(food.per)};state.jg=food.serv||100;state.jPanel='qty';render();}
function addPicked(){const g=state.jg||0;if(!g){toast('Indique une quantité');return;}
  J.add({name:_pick.name,per:per5(_pick.per),g,meal:state.jm??defMeal()});state.jPanel=null;state.jm=null;_pick=null;toast('Ajouté ✔');render();}
function pickRecent(i){const r=DB.get('recentFoods',[])[i];openQty({name:r.name,per:r.per,serv:r.serv});}
async function pickManual(f){const v=k=>+String(f[k].value).replace(',','.')||0;
  const food={name:f.n.value.trim(),per:[v('k'),v('p'),v('c'),v('f'),v('fi'),v('su')],serv:v('s')||100};
  if(f.save&&f.save.checked){ if(await FoodDB.save(food,'Mes aliments')) toast('Enregistré dans ta base'); }
  openQty(food);}


/* ---- Reconnaissance d'un repas par photo (IA via la fonction Supabase « analyse-repas ») ---- */
let _photo=null;
const Photo = {
  pick(){
    if(typeof Sync==='undefined'||!Sync.user){toast('Connecte-toi dans l\'onglet Suivi pour utiliser la photo');return;}
    const i=document.createElement('input'); i.type='file'; i.accept='image/*'; i.setAttribute('capture','environment');
    i.onchange=()=>{ if(i.files&&i.files[0]) this.analyse(i.files[0]); }; i.click();
  },
  resize(file){ return new Promise((ok,ko)=>{ const u=URL.createObjectURL(file); const im=new Image();
    im.onload=()=>{ const s=Math.min(1,1024/Math.max(im.width,im.height)); const c=document.createElement('canvas');
      c.width=Math.round(im.width*s); c.height=Math.round(im.height*s); c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg',0.82)); };
    im.onerror=ko; im.src=u; }); },
  async analyse(file){
    state.jPanel='photo'; state.jm=state.jm??defMeal(); _photo={loading:true}; render();
    try{
      const url=await this.resize(file); _photo.preview=url; render();
      const {data,error}=await Sync.sb.functions.invoke('analyse-repas',{body:{image:url.split(',')[1],media_type:'image/jpeg'}});
      if(error){ let msg=error.message; try{ const b=await error.context.json(); msg=b.error==='NO_KEY'?'NO_KEY':(b.detail||b.error||msg); }catch(e){} throw new Error(msg); }
      _photo={...data,preview:url,loading:false};
    }catch(e){ _photo={error:e.message,preview:_photo&&_photo.preview,loading:false}; }
    render();
  },
  setG(i,v){ _photo.items[i].grams=+String(v).replace(',','.')||0; const el=$('#ptot'); if(el) el.innerHTML=kpiHTML(this.total()); },
  del(i){ _photo.items.splice(i,1); render(); },
  total(){ return (_photo.items||[]).reduce((a,it)=>macro(this.food(it)).map((v,k)=>a[k]+v),[0,0,0,0,0,0]); },
  food(it){ return {name:it.name,g:it.grams,per:[it.kcal_100,it.protein_100,it.carbs_100,it.fat_100,it.fiber_100,it.sugar_100]}; },
  addAll(){ const its=(_photo.items||[]).filter(it=>it.grams>0); if(!its.length) return;
    its.forEach(it=>J.add({...this.food(it),meal:state.jm??defMeal()}));
    toast(its.length+' aliment(s) ajouté(s) ✔'); _photo=null; state.jPanel=null; state.jm=null; render(); }
};
function photoPanel(close){
  const P=_photo||{}; const img=P.preview?`<img src="${P.preview}" alt="Photo du repas" style="width:100%;max-height:220px;object-fit:cover;border-radius:14px;margin-top:10px">`:'';
  if(P.loading) return `<div class="card">${close}<b>📸 Analyse du repas…</b>${img}<div class="mut sm" style="margin-top:8px">Identification des aliments et des portions (quelques secondes).</div></div>`;
  if(P.error) return `<div class="card">${close}<b>📸 Analyse impossible</b>${img}<div class="note w">${esc(P.error)}</div>
    <button class="btn ghost block" onclick="Photo.pick()">Réessayer</button></div>`;
  const its=P.items||[];
  return `<div class="card">${close}<b>📸 ${esc(P.plat||'Repas')}</b> <span class="tag ${P.confiance==='bonne'?'p':''}">confiance ${esc(P.confiance||'')}</span>${img}
   ${P.note?`<div class="mut sm" style="margin-top:6px">${esc(P.note)}</div>`:''}
   ${its.length?its.map((it,i)=>`<div class="row sm" style="padding:8px 0;border-top:1px solid var(--line)"><div class="grow">${esc(it.name)}
     <div class="mut">${Math.round(it.kcal_100)} kcal · P ${r1(it.protein_100)} · sucres ${r1(it.sugar_100)} /100 g</div></div>
     <input class="f" style="width:74px;text-align:center" inputmode="decimal" value="${it.grams}" oninput="Photo.setG(${i},this.value)"><span class="mut">g</span>
     <button class="chip" style="padding:3px 9px" onclick="Photo.del(${i})">✕</button></div>`).join(''):'<div class="mut sm" style="margin-top:8px">Aucun aliment reconnu.</div>'}
   ${its.length?`<div class="kpi" id="ptot" style="margin-top:10px">${kpiHTML(Photo.total())}</div>
    <label class="f">Repas</label><div class="chips" style="flex-wrap:wrap">${MEALS_J.map((x,i)=>`<button class="chip ${(state.jm??defMeal())===i?'on':''}" onclick="state.jm=${i};render()">${x}</button>`).join('')}</div>
    <p class="mut sm" style="margin:4px 0 8px">Estimation par IA : corrige les grammes si besoin avant d'ajouter.</p>
    <button class="btn block" onclick="Photo.addAll()">Tout ajouter au journal</button>`:''}</div>`;
}

/* ---- Open Food Facts ---- */
function offFood(p){const n=p.nutriments||{};
  let k=n['energy-kcal_100g']; if(k==null&&n.energy_100g!=null)k=n.energy_100g/4.184; if(k==null)return null;
  return {name:p.product_name||p.generic_name||'Produit',brand:p.brands||'',per:[r1(k),r1(n.proteins_100g),r1(n.carbohydrates_100g),r1(n.fat_100g),r1(n.fiber_100g),r1(n.sugars_100g)],serv:Math.round(+p.serving_quantity)||100,code:p.code};}
async function offProduct(code){
  const known=FoodDB.byBarcode(code); if(known){openQty(known);return;}
  toast('Recherche du produit…');
  try{const res=await fetch(`${OFF}/api/v2/product/${encodeURIComponent(code)}.json?fields=code,product_name,generic_name,brands,nutriments,serving_quantity`);
    const j=await res.json(); const f=j.status===1&&offFood(j.product);
    if(f){ f.code=code; openQty(f); FoodDB.save(f,'Produits scannés'); }
    else {toast('Produit inconnu : crée-le à la main');state.jPanel='common';render();}
  }catch(e){toast('Pas de connexion');}
}
function resultsHTML(){
  const loc=_local.length?_local:FoodDB.search(state.jq||''); window._loc=loc;
  let h=loc.length?`<h3>Ta base</h3>${loc.map((f,i)=>foodRow(f,'_loc',i)).join('')}`:'';
  if(state.jLoading) h+='<div class="mut sm" style="padding:10px 0">Recherche sur Open Food Facts…</div>';
  else if(_results.length) h+=`<h3>Open Food Facts</h3>${_results.map((f,i)=>foodRow(f,'_results',i)).join('')}`;
  else if(state.jq&&!loc.length) h+='<div class="mut sm" style="padding:10px 0">Rien dans ta base : appuie sur « Web » pour chercher sur Open Food Facts.</div>';
  return h;
}
async function offSearch(q){
  q=q.trim(); if(!q)return; state.jq=q; _local=FoodDB.search(q); state.jLoading=true; render();
  try{const res=await fetch(`${OFF}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&lc=fr&fields=code,product_name,generic_name,brands,nutriments,serving_quantity`);
    const j=await res.json(); _results=(j.products||[]).map(offFood).filter(Boolean);
    if(!_results.length)toast('Aucun résultat');
  }catch(e){toast('Pas de connexion');_results=[];}
  state.jLoading=false; render();
}

/* ---- Scanner de code-barres ---- */
const Scan = {
  stream:null, reader:null, raf:0, done:false,
  async open(){
    this.done=false;
    const ov=document.createElement('div'); ov.id='scanov';
    ov.innerHTML=`<video id="scanv" playsinline muted></video><div class="scanbox"></div>
     <div class="scanbar"><div class="mut sm" style="color:#fff">Vise le code-barres du produit</div>
     <form class="row" style="margin-top:8px" onsubmit="event.preventDefault();Scan.found(this.c.value)"><input class="f grow" name="c" inputmode="numeric" placeholder="ou tape le code"><button class="btn">OK</button></form>
     <button class="btn ghost block" style="margin-top:8px" onclick="Scan.close()">Annuler</button></div>`;
    document.body.appendChild(ov);
    const v=$('#scanv');
    try{
      this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false});
      v.srcObject=this.stream; await v.play();
    }catch(e){toast('Caméra refusée ou indisponible : tape le code');return;}
    if('BarcodeDetector' in window){
      const det=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e']});
      const loop=async()=>{if(this.done)return;try{const c=await det.detect(v);if(c.length){this.found(c[0].rawValue);return;}}catch(e){}this.raf=requestAnimationFrame(loop);};
      loop();
    } else {
      try{ await loadScript(ZXING);
        this.reader=new ZXingBrowser.BrowserMultiFormatReader();
        this.ctrl=await this.reader.decodeFromVideoElement(v,(res)=>{if(res&&!this.done)this.found(res.getText());});
      }catch(e){toast('Scanner indisponible : tape le code');}
    }
  },
  found(code){code=String(code||'').trim(); if(!code||this.done)return; this.done=true;
    try{navigator.vibrate&&navigator.vibrate(80);}catch(e){} this.close(); offProduct(code);},
  close(){this.done=true;cancelAnimationFrame(this.raf);try{this.ctrl&&this.ctrl.stop();}catch(e){}
    if(this.stream)this.stream.getTracks().forEach(t=>t.stop()); this.stream=null; const o=$('#scanov'); o&&o.remove();}
};
function loadScript(src){return new Promise((ok,ko)=>{if(window.ZXingBrowser)return ok();const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s);});}

/* ============ Démarrage ============ */
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{state.view=b.dataset.v;state.exOpen=null;render();});
if(DB.get('draft',null)){const d=DB.get('draft');state.prog=d.prog;state.day=d.day;}
render();
FoodDB.load();
if('serviceWorker' in navigator){ try{ navigator.serviceWorker.register('sw.js').catch(()=>{}); }catch(e){} }
