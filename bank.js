/* ============ Vidéos réelles ExerciseBank (via la fonction Supabase « exercices ») ============ */
// On mémorise seulement l'identifiant ExerciseBank de chaque exercice ; les liens vidéo sont redemandés à chaque fois (ils expirent).
const Bank = {
  map: DB.get('ebMap', {}),
  async call(body){
    if(typeof Sync==='undefined'||!Sync.sb) throw new Error('Pas de connexion');
    if(!Sync.user) throw new Error('Connecte-toi dans l\'onglet Suivi pour voir les vidéos');
    const {data,error}=await Sync.sb.functions.invoke('exercices',{body});
    if(error){ let msg=error.message; try{ const b=await error.context.json(); msg=b.detail||b.error||msg; }catch(e){} throw new Error(msg); }
    return data;
  },
  async findId(e){
    if(this.map[e.id]) return this.map[e.id];
    const queries=[e.n, e.id.replace(/_-_/g,' ').replace(/_/g,' ')];
    for(const q of queries){
      const r=await this.call({action:'search',q,limit:5});
      const hit=(r.data||[]).find(x=>x.media&&x.media.mp4)||(r.data||[])[0];
      if(hit){ this.map[e.id]=hit.id; this.info=this.info||{}; this.info[hit.id]=hit; _rawSet('ebMap',this.map); return hit.id; }
    }
    return null;
  },
  async play(exId, uid, auto){
    const e=EX.find(x=>x.id===exId); const box=$('#eb_'+uid); if(!e||!box) return;
    box.innerHTML='<div class="mut sm" style="padding:8px 0">Chargement de la vidéo…</div>';
    try{
      const id=await this.findId(e);
      if(!id) throw new Error('Exercice introuvable dans ExerciseBank');
      const m=await this.call({action:'media',ids:[id]});
      const v=(m.data||{})[id]||{};
      if(!v.mp4) throw new Error(v.sandbox?'Vidéo réservée à l\'offre payante (la clé d\'essai couvre 50 exercices)':'Pas de vidéo pour cet exercice');
      const info=(this.info||{})[id];
      const an=$('#an_'+uid);
      const vid=`<video src="${v.mp4}" ${v.still?`poster="${v.still}"`:''} autoplay loop muted playsinline controls style="width:100%;border-radius:16px;background:#000;display:block"></video>`;
      if(an){ an.outerHTML=`<div id="an_${uid}">${vid}</div>`; }
      const ctrl=$('#an_'+uid)?.nextElementSibling; if(ctrl&&ctrl.classList.contains('ctrl')) ctrl.remove();
      box.innerHTML=`<div class="mut sm" style="margin:6px 0">🎬 Vidéo ExerciseBank${info&&info.nameFr?' · '+esc(info.nameFr):''}</div>
        ${info&&info.cuesFr&&info.cuesFr.length?`<div class="note">${info.cuesFr.slice(0,4).map(c=>'• '+esc(c)).join('<br>')}</div>`:''}`;
    }catch(err){
      const soft=/réservée|Pas de vidéo|introuvable/.test(err.message);
      box.innerHTML=soft?`<div class="mut sm" style="margin:0 0 6px">ℹ️ ${esc(err.message)} — animation photo affichée.</div>`
        :`<div class="note w">${esc(err.message)}</div><button class="btn ghost block" style="margin-bottom:8px" onclick="Bank.play('${exId}','${uid}')">Réessayer la vidéo</button>`;
    }
  }
};
// Chaque fiche charge automatiquement la vraie vidéo ExerciseBank (repli sur l'animation photo)
const _exDetailBase = exDetail;
exDetail = function(e, uid){
  const logged = typeof Sync!=='undefined' && Sync.user;
  if(logged) setTimeout(()=>Bank.play(e.id, uid, true), 30);
  return `<div id="eb_${uid}">${logged?'<div class="mut sm" style="padding:0 0 6px">🎬 Chargement de la vidéo…</div>'
    :`<div class="mut sm" style="padding:0 0 6px">🎬 Connecte-toi (onglet Suivi) pour voir les vraies vidéos des mouvements.</div>`}</div>` + _exDetailBase(e, uid);
};

/* Modules ajoutés : programme par groupe musculaire (avant le premier affichage) et détail nutritionnel (après nutri.js) */
document.write('<script src="muscles.js"><\/script>');
document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('script');s.src='detail.js';document.body.appendChild(s);});
