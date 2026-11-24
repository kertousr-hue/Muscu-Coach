const SB_REF = 'yogsnuiaanowfppsesmy';
const SB_URL = 'https://'+SB_REF+'.supabase.co';
const SB_KEY = 'sb_publishable_cgE4qpDZUZbb1EkVkTdBfg_UyRzHiiG';
// Changement de projet Supabase : on renverra toutes les données du téléphone vers le nouveau projet
(function(){ try{ const prev=localStorage.getItem('mc_sbRef'); if(prev===JSON.stringify(SB_REF)) return;
  const raw=k=>{try{return JSON.parse(localStorage.getItem('mc_'+k));}catch(e){return null;}};
  const unsync=a=>(a||[]).map(x=>{const y={...x}; delete y.synced; return y;});
  localStorage.setItem('mc_hist',JSON.stringify(unsync(raw('hist'))));
  localStorage.setItem('mc_weights',JSON.stringify(unsync(raw('weights'))));
  if(raw('foodsDB')) localStorage.setItem('mc_oldFoods',localStorage.getItem('mc_foodsDB'));
  ['foodsDB','foodsDBts','lastSync'].forEach(k=>localStorage.removeItem('mc_'+k));
  localStorage.setItem('mc_migrate','true'); localStorage.setItem('mc_sbRef',JSON.stringify(SB_REF));
}catch(e){} })();
const SET_KEYS = ['prog','blockStart','morpho','weak','swaps','diet'];
const _rawSet = DB.set.bind(DB);
DB.set = function(k,v){ _rawSet(k,v); Sync.queue(k); };

const Sync = {
  sb:null, user:null, pulling:false, timers:{}, last:DB.get('lastSync',null), err:'',
  init(){
    try{ if(!window.supabase) return; this.sb = supabase.createClient(SB_URL, SB_KEY); }catch(e){ return; }
    this.sb.auth.getSession().then(({data})=>{ this.user=data.session?.user||null; if(this.user) this.pull(); });
    this.sb.auth.onAuthStateChange((ev,s)=>{ const was=this.user; this.user=s?.user||null;
      if(ev==='SIGNED_IN'&&!was) this.pull(); if(state.view==='suivi') render(); });
  },
  queue(k){
    if(!this.user||this.pulling) return;
    const g = k==='hist'?'hist':k==='weights'?'weights':k==='journal'?'journal':SET_KEYS.includes(k)?'settings':null;
    if(!g) return;
    clearTimeout(this.timers[g]); this.timers[g]=setTimeout(()=>this.push(g),800);
  },
  async push(g){
    if(!this.user) return;
    try{
      if(g==='hist') await this.pushSessions();
      else if(g==='weights') await this.pushWeights();
      else if(g==='journal') await this.pushJournal();
      else await this.pushSettings();
      this.ok();
    }catch(e){ this.fail(e); }
  },
  ok(){ this.err=''; this.last=new Date().toISOString(); _rawSet('lastSync',this.last); },
  fail(e){ this.err=(e&&e.message)||String(e); console.warn('Sync',e); },
  chk(r){ if(r&&r.error) throw r.error; return r?r.data:null; },
  uid(){ return (crypto.randomUUID&&crypto.randomUUID())||'10000000-1000-4000-8000-100000000000'.replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16)); },

  async pushSessions(){
    const h=DB.get('hist',[]); let changed=false;
    h.forEach(s=>{ if(!s.sid){ s.sid=this.uid(); changed=true; } });
    const todo=h.filter(s=>!s.synced);
    if(todo.length){
      this.chk(await this.sb.from('muscu_sessions').upsert(todo.map(s=>({id:s.sid,user_id:this.user.id,done_on:s.date,prog:s.prog,day:s.day,week:s.week||null,exercises:s.ex}))));
      todo.forEach(s=>s.synced=true); changed=true;
    }
    if(changed) _rawSet('hist',h);
  },
  async pushWeights(){
    const w=DB.get('weights',[]); const todo=w.filter(x=>!x.synced);
    if(!todo.length) return;
    todo.forEach(x=>{ if(!x.id) x.id=this.uid(); });
    this.chk(await this.sb.from('weights').upsert(todo.map(x=>({id:x.id,user_id:this.user.id,measured_on:x.d,kg:x.kg}))));
    todo.forEach(x=>x.synced=true); _rawSet('weights',w);
  },
  async pushJournal(d=today()){
    const items=(DB.get('journal',{})[d])||[];
    this.chk(await this.sb.from('muscu_food_log').delete().eq('user_id',this.user.id).eq('eaten_on',d));
    if(items.length) this.chk(await this.sb.from('muscu_food_log').insert(items.map(x=>({user_id:this.user.id,eaten_on:d,meal:x.meal,name:x.name,grams:x.g,kcal_100:x.per[0]||0,protein_100:x.per[1]||0,carbs_100:x.per[2]||0,fat_100:x.per[3]||0,fiber_100:x.per[4]||0,sugar_100:x.per[5]||0}))));
  },
  async pushSettings(){
    this.chk(await this.sb.from('muscu_settings').upsert({user_id:this.user.id,prog:DB.get('prog','ppl'),block_start:DB.get('blockStart',null),
      morpho:DB.get('morpho',[]),weak:DB.get('weak',[]),swaps:DB.get('swaps',{}),diet:DB.get('diet',null),updated_at:new Date().toISOString()}));
  },

  // Récupère tout depuis Supabase et fusionne avec les données du téléphone
  async pull(){
    if(!this.user||this.pulling) return; this.pulling=true;
    try{
      const uid=this.user.id;
      const since=new Date(Date.now()-60*864e5).toISOString().slice(0,10);
      const [st,ses,wt,fl]=await Promise.all([
        this.sb.from('muscu_settings').select('*').eq('user_id',uid).maybeSingle(),
        this.sb.from('muscu_sessions').select('*').eq('user_id',uid).order('done_on'),
        this.sb.from('weights').select('*').eq('user_id',uid).order('measured_on'),
        this.sb.from('muscu_food_log').select('*').eq('user_id',uid).gte('eaten_on',since).order('created_at')
      ]);
      const S=this.chk(st), SE=this.chk(ses)||[], W=this.chk(wt)||[], F=this.chk(fl)||[];
      // Séances : union serveur + séances locales jamais envoyées
      const remote=SE.map(r=>({sid:r.id,synced:true,prog:r.prog,day:r.day,week:r.week,date:r.done_on,ex:r.exercises}));
      const ids=new Set(remote.map(r=>r.sid));
      const localOnly=DB.get('hist',[]).filter(s=>!s.synced&&!ids.has(s.sid));
      _rawSet('hist',[...remote,...localOnly].sort((a,b)=>a.date<b.date?-1:1));
      // Poids
      const wr=W.map(r=>({id:r.id,d:r.measured_on,kg:+r.kg,synced:true}));
      const wl=DB.get('weights',[]).filter(x=>!x.synced);
      _rawSet('weights',[...wr,...wl].sort((a,b)=>a.d<b.d?-1:1));
      // Journal alimentaire
      const jr={}; F.forEach(r=>{(jr[r.eaten_on]=jr[r.eaten_on]||[]).push({name:r.name,g:+r.grams,meal:r.meal,per:[+r.kcal_100,+r.protein_100,+r.carbs_100,+r.fat_100,+r.fiber_100||0,+r.sugar_100||0]});});
      const jl=DB.get('journal',{}); let pushToday=false;
      if(!jr[today()]&&(jl[today()]||[]).length){ jr[today()]=jl[today()]; pushToday=true; }
      _rawSet('journal',jr);
      // Réglages
      if(S){ _rawSet('prog',S.prog); if(S.block_start)_rawSet('blockStart',S.block_start); _rawSet('morpho',S.morpho||[]); _rawSet('weak',S.weak||[]);
        _rawSet('swaps',S.swaps||{}); if(S.diet)_rawSet('diet',S.diet); state.prog=S.prog; }
      this.pulling=false;
      if(localOnly.length) await this.pushSessions();
      if(wl.length) await this.pushWeights();
      if(pushToday) await this.pushJournal();
      if(!S) await this.pushSettings();
      if(DB.get('migrate',false)) await this.migrate(jl);
      this.ok(); render(); if(typeof FoodDB!=='undefined') FoodDB.load(true);
    }catch(e){ this.fail(e); toast('Synchro impossible : '+this.err); }
    this.pulling=false;
  },

  // Première connexion au nouveau projet : envoie tout le journal et tes aliments perso
  async migrate(jl){
    for(const d of Object.keys(jl||{})) if((jl[d]||[]).length&&d!==today()) { const all=DB.get('journal',{}); if(!(all[d]||[]).length){all[d]=jl[d];_rawSet('journal',all);} await this.pushJournal(d); }
    const old=DB.get('oldFoods',[]);
    if(old.length){
      const {data}=await this.sb.from('foods').select('name').is('owner',null);
      const have=new Set((data||[]).map(f=>norm(f.name)));
      const rows=old.filter(f=>f.own||!have.has(norm(f.name))).map(f=>({owner:this.user.id,name:String(f.name).slice(0,120),category:f.cat||'Mes aliments',barcode:f.bc||null,portion_g:f.serv||100,
        kcal:f.per[0]||0,protein:f.per[1]||0,carbs:f.per[2]||0,fat:f.per[3]||0,fiber:f.per[4]||0,sugar:f.per[5]||0}));
      for(let i=0;i<rows.length;i+=200) this.chk(await this.sb.from('foods').insert(rows.slice(i,i+200)));
      _rawSet('oldFoods',[]);
    }
    _rawSet('migrate',false); toast('Données transférées vers le nouveau projet ✔');
  },
  async signIn(f){
    if(!this.sb) return toast('Supabase indisponible (hors ligne ?)');
    const {error}=await this.sb.auth.signInWithPassword({email:f.email.value.trim(),password:f.pw.value});
    if(error) toast(error.message==='Invalid login credentials'?'E-mail ou mot de passe incorrect':error.message); else toast('Connecté ✔');
  },
  async signUp(f){
    if(!this.sb) return;
    if(f.pw.value.length<8) return toast('Mot de passe : 8 caractères minimum');
    const {data,error}=await this.sb.auth.signUp({email:f.email.value.trim(),password:f.pw.value});
    if(error) return toast(error.message);
    toast(data.session?'Compte créé ✔':'Compte créé : confirme ton e-mail puis connecte-toi');
  },
  async signOut(){ await this.sb.auth.signOut(); this.user=null; toast('Déconnecté'); render(); },

  cardHTML(){
    if(!this.sb) return `<b>☁️ Sauvegarde en ligne</b><div class="mut sm">Indisponible pour le moment (pas de connexion).</div>`;
    if(this.user) return `<div class="row"><div class="grow"><b>☁️ Synchronisé</b><div class="mut sm">${esc(this.user.email||'')}</div>
      <div class="mut sm">${this.err?`<span style="color:#e5b842">Erreur : ${esc(this.err)}</span>`:this.last?'Dernière synchro : '+new Date(this.last).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}):''}</div></div></div>
      <div class="row" style="margin-top:10px;gap:8px"><button class="btn ghost grow" onclick="Sync.pull()">↻ Synchroniser</button><button class="btn ghost grow" onclick="Sync.signOut()">Se déconnecter</button></div>`;
    return `<b>☁️ Sauvegarde en ligne (Supabase)</b><div class="mut sm">Connecte-toi pour retrouver tes séances, ton poids et ton journal sur tous tes appareils.</div>
      <form onsubmit="event.preventDefault();Sync.signIn(this)" style="margin-top:8px">
       <input class="f" name="email" type="email" autocomplete="email" placeholder="E-mail" required>
       <input class="f" name="pw" type="password" autocomplete="current-password" placeholder="Mot de passe" required style="margin-top:6px">
       <div class="row" style="margin-top:8px;gap:8px"><button class="btn grow">Se connecter</button><button type="button" class="btn ghost grow" onclick="Sync.signUp(this.form)">Créer un compte</button></div></form>`;
  }
};

// Carte « compte » en haut de l'onglet Suivi
const _vSuiviBase = vSuivi;
vSuivi = function(){ _vSuiviBase(); const c=document.createElement('div'); c.className='card'; c.innerHTML=Sync.cardHTML();
  const app=$('#app'); app.insertBefore(c, app.children[1]||null); };
Sync.init();
