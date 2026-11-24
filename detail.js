/* Détail nutritionnel complet de chaque aliment : calories, protéines, glucides (dont sucres), lipides. */
const kpi5 = m=>`<div class="kpi" style="grid-template-columns:repeat(4,1fr)"><div><b>${Math.round(m[0])}</b><span>kcal</span></div><div><b>${r1(m[1])} g</b><span>Protéines</span></div><div><b>${r1(m[2])} g</b><span>Glucides</span></div><div><b>${r1(m[3])} g</b><span>Lipides</span></div></div><div class="mut sm" style="text-align:center;margin-top:4px">dont sucres ${r1(m[5]||0)} g · fibres ${r1(m[4]||0)} g</div>`;
const macroLine = m=>`<div class="mrow"><span><b>${Math.round(m[0])}</b> kcal</span><span>P <b>${r1(m[1])}</b> g</span><span>G <b>${r1(m[2])}</b> g</span><span>L <b>${r1(m[3])}</b> g</span></div>`;
(function(){const s=document.createElement('style');s.textContent=`.mrow{display:grid;grid-template-columns:1.1fr 1fr 1fr 1fr;gap:4px;margin-top:4px;font-size:12px;color:var(--mut)}.mrow b{color:var(--txt)}.mrow span:nth-child(2) b{color:#7aa2ff}.mrow span:nth-child(3) b{color:#e5b842}.mrow span:nth-child(4) b{color:#ff8a6e}.fitem{padding:10px 0;border-top:1px solid var(--line)}`;document.head.appendChild(s);})();

/* --- Photo : détail par aliment, mis à jour quand on change les grammes --- */
photoPanel = function(close){
  const P=_photo||{}; const img=P.preview?`<img src="${P.preview}" alt="Photo du repas" style="width:100%;max-height:220px;object-fit:cover;border-radius:14px;margin-top:10px">`:'';
  if(P.loading) return `<div class="card">${close}<b>📸 Analyse du repas…</b>${img}<div class="mut sm" style="margin-top:8px">Identification des aliments et des portions (quelques secondes).</div></div>`;
  if(P.error) return `<div class="card">${close}<b>📸 Analyse impossible</b>${img}<div class="note w">${esc(P.error)}</div><button class="btn ghost block" onclick="Photo.pick()">Réessayer</button></div>`;
  const its=P.items||[];
  return `<div class="card">${close}<b>📸 ${esc(P.plat||'Repas')}</b> <span class="tag ${P.confiance==='bonne'?'p':''}">confiance ${esc(P.confiance||'')}</span>${img}
   ${P.note?`<div class="mut sm" style="margin-top:6px">${esc(P.note)}</div>`:''}
   ${its.length?its.map((it,i)=>{const f=Photo.food(it);return `<div class="fitem"><div class="row sm"><b class="grow">${esc(it.name)}</b>
     <input class="f" style="width:74px;text-align:center;padding:7px" inputmode="decimal" value="${it.grams}" oninput="Photo.setG(${i},this.value)"><span class="mut">g</span>
     <button class="chip" style="padding:3px 9px" onclick="Photo.del(${i})">✕</button></div>
     <div id="pit_${i}">${macroLine(macro(f))}</div>
     <div class="mut" style="font-size:11px;margin-top:2px">Pour 100 g : ${Math.round(it.kcal_100)} kcal · P ${r1(it.protein_100)} · G ${r1(it.carbs_100)} (sucres ${r1(it.sugar_100)}) · L ${r1(it.fat_100)}</div></div>`;}).join('')
     :'<div class="mut sm" style="margin-top:8px">Aucun aliment reconnu.</div>'}
   ${its.length?`<h3>Total du repas</h3><div id="ptot">${kpi5(Photo.total())}</div>
    <label class="f">Repas</label><div class="chips" style="flex-wrap:wrap">${MEALS_J.map((x,i)=>`<button class="chip ${(state.jm??defMeal())===i?'on':''}" onclick="state.jm=${i};render()">${x}</button>`).join('')}</div>
    <p class="mut sm" style="margin:4px 0 8px">Estimation par IA : corrige les grammes si besoin avant d'ajouter.</p>
    <button class="btn block" onclick="Photo.addAll()">Tout ajouter au journal</button>`:''}</div>`;
};
Photo.setG = function(i,v){ _photo.items[i].grams=+String(v).replace(',','.')||0;
  const a=$('#pit_'+i); if(a) a.innerHTML=macroLine(macro(this.food(_photo.items[i])));
  const t=$('#ptot'); if(t) t.innerHTML=kpi5(this.total()); };

/* --- Fenêtre quantité : glucides affichés --- */
const _panelBase = panelHTML;
panelHTML = function(){
  if(state.jPanel==='qty'&&_pick){ const h=_panelBase();
    return h.replace(/<div class="kpi" id="qprev">(?:<div><b>[^<]*<\/b><span>[^<]*<\/span><\/div>){4}<\/div>/, `<div id="qprev">${kpi5(per5(_pick.per).map(v=>v*(state.jg||0)/100))}</div>`); }
  return _panelBase();
};
qtyPreview = function(){ const el=$('#qprev'); if(el&&_pick) el.innerHTML=kpi5(per5(_pick.per).map(v=>v*(state.jg||0)/100)); };

/* --- Journal : détail clair de chaque aliment + total par repas --- */
const _vJournalBase = vJournal;
vJournal = function(){
  const html=_vJournalBase(); const list=J.day();
  const wrap=document.createElement('div'); wrap.innerHTML=html;
  wrap.querySelectorAll('.card').forEach(card=>{
    const title=card.querySelector('.row > b.grow'); if(!title) return; const mi=MEALS_J.indexOf(title.textContent.trim()); if(mi<0) return;
    const items=list.map((x,i)=>({...x,i})).filter(x=>x.meal===mi); if(!items.length) return;
    const tot=items.reduce((a,x)=>macro(x).map((v,k)=>a[k]+v),[0,0,0,0,0,0]);
    card.innerHTML=`<div class="row"><b class="grow">${MEALS_J[mi]}</b><span class="sm"><b>${Math.round(tot[0])}</b> kcal</span></div>
      <div class="mut" style="font-size:11px">Total : P ${r1(tot[1])} g · G ${r1(tot[2])} g · L ${r1(tot[3])} g</div>
      ${items.map(x=>{const m=macro(x);return `<div class="fitem"><div class="row sm"><span class="grow">${esc(x.name)} <span class="mut">· ${x.g} g</span></span>
        <button class="chip" style="padding:3px 9px" onclick="J.del(${x.i})">✕</button></div>${macroLine(m)}
        <div class="mut" style="font-size:11px;margin-top:2px">dont sucres ${r1(m[5])} g · fibres ${r1(m[4])} g</div></div>`;}).join('')}`;
  });
  return wrap.innerHTML;
};
if(state.view==='diete') render();
{const s=document.createElement('script');s.src='hr.js';document.body.appendChild(s);}
