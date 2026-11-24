/* ============ Montre (OnePlus et autres) via Health Connect : OHealth → Health Connect → « Health Connect Webhook » → Muscu Coach ============ */
const Watch = {
  key:null, last:null, loaded:false, busy:false,
  url(){ return this.key?`https://yogsnuiaanowfppsesmy.supabase.co/functions/v1/montre?k=${this.key}`:''; },
  async load(){
    if(typeof Sync==='undefined'||!Sync.user) return;
    const {data}=await Sync.sb.from('muscu_watch_key').select('token,last_push').maybeSingle();
    this.key=data?.token||null; this.last=data?.last_push||null; this.loaded=true; this.ui();
  },
  async create(){
    if(typeof Sync==='undefined'||!Sync.user){ toast('Connecte-toi d\'abord (en haut de Suivi)'); return; }
    this.busy=true; this.ui();
    if(this.key) await Sync.sb.from('muscu_watch_key').delete().eq('user_id',Sync.user.id);
    const {data,error}=await Sync.sb.from('muscu_watch_key').insert({}).select('token,last_push').single();
    this.busy=false; if(error){ toast('Erreur : '+error.message); this.ui(); return; }
    this.key=data.token; this.last=null; this.ui(); toast('Lien créé ✔');
  },
  async copy(){ try{ await navigator.clipboard.writeText(this.url()); toast('Lien copié ✔'); }catch(e){ const i=$('#wurl'); i&&i.select(); toast('Appuie longuement pour copier'); } },
  async refresh(){ await this.load(); await HR.pull(); toast('Actualisé'); },
  card(){
    const head=`<b>⌚ Montre OnePlus (via Health Connect)</b>`;
    if(typeof Sync==='undefined'||!Sync.user) return `${head}<div class="mut sm">Connecte-toi en haut de cette page pour relier ta montre.</div>`;
    if(!this.loaded) return `${head}<div class="mut sm">Chargement…</div>`;
    if(!this.key) return `<div class="row"><div class="grow">${head}<div class="mut sm">Tes séances de la montre arrivent toutes seules ici (pouls moyen/max, calories). Gratuit.</div></div>
      <button class="btn" style="padding:9px 12px" onclick="Watch.create()">${this.busy?'…':'Activer'}</button></div>`;
    const t=this.last?new Date(this.last).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'pas encore reçu';
    return `<div class="row"><div class="grow">${head}<div class="mut sm">Dernières données reçues : <b>${t}</b></div></div>
      <button class="btn ghost" style="padding:8px 12px" onclick="Watch.refresh()">↻</button></div>
      <label class="f">Ton lien personnel (à coller dans Health Connect Webhook)</label>
      <div class="row"><input class="f grow" id="wurl" readonly value="${this.url()}" style="font-size:12px"><button class="btn" style="padding:9px 12px" onclick="Watch.copy()">Copier</button></div>
      <details style="margin-top:10px"><summary class="sm" style="cursor:pointer"><b>Comment configurer (5 min, une seule fois)</b></summary>
      <ol class="sm" style="padding-left:18px;margin:8px 0 0">
       <li><b>OHealth</b> → Moi → Partage de données → <b>Health Connect</b> → autoriser l'écriture (exercices, fréquence cardiaque, calories).</li>
       <li>Installe <b>Health Connect Webhook</b> (Play Store, ou gratuit sur GitHub : mcnaveen/health-connect-webhook).</li>
       <li>Dans cette appli : autorise <b>Exercice</b>, <b>Fréquence cardiaque</b> et <b>Calories actives</b>.</li>
       <li>Ajoute un webhook, colle le lien ci-dessus, format <b>JSON</b>, synchro automatique (ex. toutes les 15 min).</li>
       <li>Fais une séance avec l'appli Exercice de la montre, ouvre OHealth : elle arrive ici toute seule.</li></ol>
      <div class="mut sm" style="margin-top:6px">⚠️ Ne partage pas ce lien : il permet d'envoyer des données sur ton compte. <a href="#" onclick="if(confirm('Créer un nouveau lien ? L\\'ancien ne marchera plus.'))Watch.create();return false" style="color:var(--mut)">Changer de lien</a></div></details>`;
  },
  ui(){ const el=$('#watchCard'); if(el) el.innerHTML=this.card(); }
};
const _vSuiviW = vSuivi;
vSuivi = function(){
  _vSuiviW();
  const h=[...document.querySelectorAll('#app h3')].find(x=>x.textContent.includes('Cardio des séances'));
  const c=document.createElement('div'); c.className='card'; c.id='watchCard'; c.innerHTML=Watch.card();
  if(h) h.after(c); else $('#app').appendChild(c);
  if(!Watch.loaded) Watch.load();
};
(async function(){ for(let i=0;i<30&&!(typeof Sync!=='undefined'&&Sync.user);i++) await new Promise(r=>setTimeout(r,500)); await Watch.load(); })();
document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&typeof Sync!=='undefined'&&Sync.user) HR.pull(); });
if(state.view==='suivi') render();
