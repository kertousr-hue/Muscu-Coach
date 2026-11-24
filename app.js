const DB = {
  get(k, d){ try{ const v = localStorage.getItem('mc_'+k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('mc_'+k, JSON.stringify(v)); }catch(e){} }
};

const MUSCLES = {
  pecs:'Pectoraux', delt_a:'Deltoïde antérieur', delt_l:'Deltoïde latéral', delt_p:'Deltoïde postérieur',
  biceps:'Biceps / brachial', triceps:'Triceps', forearm:'Avant-bras', abs:'Grand droit (abdos)', obliques:'Obliques',
  traps:'Trapèzes', lats:'Grand dorsal', upback:'Rhomboïdes / milieu du dos', lowback:'Lombaires (érecteurs)',
  glutes:'Fessiers', quads:'Quadriceps', hams:'Ischio-jambiers', adduct:'Adducteurs', calves:'Mollets'
};

const EX = [
{id:'Barbell_Bench_Press_-_Medium_Grip',n:'Développé couché barre',g:'Pectoraux',eq:'Barre',p:['pecs'],s:['delt_a','triceps'],
 st:['Omoplates serrées et basses, pieds ancrés au sol','Prise un peu plus large que les épaules','Descendre au bas des pecs, coudes à ~45°','Pousser en gardant les fesses sur le banc'],
 tip:'Légère cambrure + omoplates collées = épaules protégées et plus de force.',
 an:'Le grand pectoral rapproche le bras du tronc. Plus la prise est large, plus il est sollicité ; plus elle est serrée, plus les triceps prennent le relais.',
 v:['Prise large : accent pecs','Prise serrée : accent triceps','Pieds sur le banc : moins de cambrure']},
{id:'Barbell_Incline_Bench_Press_-_Medium_Grip',n:'Développé incliné barre',g:'Pectoraux',eq:'Barre',p:['pecs'],s:['delt_a','triceps'],
 st:['Banc à 30-45°','Barre descendue sous les clavicules','Pousser à la verticale'],tip:'30° suffit : au-delà, ce sont surtout les épaules qui travaillent.',
 an:'L\'inclinaison oriente le travail vers le faisceau claviculaire (haut des pecs), dont les fibres montent vers l\'épaule.'},
{id:'Dumbbell_Bench_Press',n:'Développé couché haltères',g:'Pectoraux',eq:'Haltères',p:['pecs'],s:['delt_a','triceps'],
 st:['Paumes tournées vers les pieds','Descendre jusqu\'à l\'étirement des pecs','Remonter en rapprochant les haltères'],tip:'Plus d\'amplitude qu\'à la barre.',
 an:'Les haltères libèrent la trajectoire : l\'étirement en bas et le rapprochement en haut sollicitent davantage la fonction d\'adduction du pectoral.'},
{id:'Incline_Dumbbell_Press',n:'Développé incliné haltères',g:'Pectoraux',eq:'Haltères',p:['pecs'],s:['delt_a','triceps'],
 st:['Banc à 30°','Pousser en rapprochant les haltères','Descente en 2-3 s'],tip:'Contrôle la descente, c\'est là que le muscle s\'étire.',
 an:'Combine l\'accent sur le haut des pecs (inclinaison) et l\'amplitude des haltères.'},
{id:'Dumbbell_Flyes',n:'Écarté couché haltères',g:'Pectoraux',eq:'Haltères',p:['pecs'],s:['delt_a'],
 st:['Coudes légèrement fléchis et fixes','Ouvrir les bras en arc de cercle','Refermer comme pour enlacer un arbre'],tip:'Charge modérée : exercice d\'isolation.',
 an:'Mouvement d\'adduction horizontale pure : le triceps est quasi inactif, le pectoral travaille seul. L\'étirement en bas est intense, d\'où une charge raisonnable.'},
{id:'Cable_Crossover',n:'Écarté poulie vis-à-vis',g:'Pectoraux',eq:'Poulie',p:['pecs'],s:['delt_a'],
 st:['Un pas en avant, buste légèrement penché','Ramener les mains en arc devant soi','Serrer 1 s en fin de mouvement'],tip:'La poulie garde une tension constante.',
 an:'Poulies hautes : accent sur le bas des pecs. Poulies basses (mouvement vers le haut) : accent sur le haut des pecs.'},
{id:'Pushups',n:'Pompes',g:'Pectoraux',eq:'Poids du corps',p:['pecs'],s:['triceps','delt_a','abs'],
 st:['Corps gainé, aligné de la tête aux talons','Poitrine près du sol, coudes à ~45°','Pousser sans casser le bassin'],tip:'Pieds surélevés pour plus de difficulté.',
 an:'Même action que le développé couché, avec en plus un travail de gainage de la sangle abdominale.'},
{id:'Dips_-_Chest_Version',n:'Dips pectoraux',g:'Pectoraux',eq:'Barres parallèles',p:['pecs'],s:['triceps','delt_a'],
 st:['Buste penché vers l\'avant','Descendre jusqu\'à épaules sous les coudes','Remonter en poussant'],warn:'Stopper si gêne à l\'avant de l\'épaule.',
 an:'Buste penché = accent sur le bas des pecs. Buste droit = accent triceps.'},
{id:'Pullups',n:'Tractions pronation',g:'Dos',eq:'Barre fixe',p:['lats'],s:['biceps','upback','forearm'],
 st:['Prise large, paumes vers l\'avant','Tirer les coudes vers les hanches, menton au-dessus','Descente contrôlée bras tendus'],tip:'Pense « coudes dans les poches ».',
 an:'Le grand dorsal ramène le bras vers le bas et l\'arrière. La prise large réduit l\'aide des biceps et élargit le dos.'},
{id:'Chin-Up',n:'Tractions supination',g:'Dos',eq:'Barre fixe',p:['lats','biceps'],s:['upback'],
 st:['Prise largeur d\'épaules, paumes vers soi','Amener la poitrine vers la barre','Descendre complètement'],tip:'Excellent aussi pour les biceps.',
 an:'La supination place le biceps en position de force : il participe beaucoup plus qu\'en pronation.'},
{id:'Wide-Grip_Lat_Pulldown',n:'Tirage vertical prise large',g:'Dos',eq:'Poulie haute',p:['lats'],s:['biceps','upback'],
 st:['Poitrine sortie, léger recul du buste','Tirer la barre vers le haut de la poitrine','Remonter en contrôlant'],warn:'Jamais derrière la nuque.',
 an:'Version guidée des tractions : permet de doser la charge et de bien sentir l\'étirement du grand dorsal.'},
{id:'Bent_Over_Barbell_Row',n:'Rowing barre buste penché',g:'Dos',eq:'Barre',p:['upback','lats'],s:['delt_p','biceps','lowback'],
 st:['Buste à ~45°, dos plat','Tirer la barre vers le nombril','Serrer les omoplates en haut'],warn:'Dos qui s\'arrondit = baisser la charge.',
 an:'Développe l\'épaisseur du dos (rhomboïdes, trapèze moyen). Les lombaires travaillent en statique pour maintenir le buste.'},
{id:'One-Arm_Dumbbell_Row',n:'Rowing haltère un bras',g:'Dos',eq:'Haltère + banc',p:['lats'],s:['upback','biceps','delt_p'],
 st:['Main et genou en appui sur le banc','Tirer vers la hanche, coude près du corps','Étirer complètement en bas'],tip:'Trajectoire vers la hanche = grand dorsal.',
 an:'Le travail unilatéral permet une grande amplitude et corrige les déséquilibres gauche/droite.'},
{id:'Seated_Cable_Rows',n:'Tirage horizontal assis',g:'Dos',eq:'Poulie basse',p:['upback','lats'],s:['biceps','delt_p'],
 st:['Dos droit, genoux légèrement fléchis','Tirer vers le ventre','Revenir en laissant avancer les épaules'],tip:'Serre les omoplates 1 s en fin de tirage.',
 an:'Prise serrée : grand dorsal. Prise large, coudes écartés : arrière des épaules et milieu du dos.'},
{id:'Barbell_Deadlift',n:'Soulevé de terre',g:'Dos',eq:'Barre',p:['lowback','glutes','hams'],s:['quads','traps','forearm'],
 st:['Barre au-dessus du milieu du pied','Hanches basses, dos plat','Pousser dans le sol, barre collée aux jambes','Verrouiller hanches et genoux en haut'],warn:'Échauffement sérieux, dos toujours neutre.',
 an:'Mouvement global : extension de hanche (fessiers, ischios) et de genou (quadriceps), avec les érecteurs du rachis qui gainent la colonne.'},
{id:'Barbell_Shrug',n:'Shrugs barre',g:'Dos',eq:'Barre',p:['traps'],s:['forearm'],
 st:['Bras tendus, barre devant les cuisses','Hausser les épaules vers les oreilles','Tenir 1 s, redescendre'],tip:'Pas de rotation des épaules.',
 an:'Isole le faisceau supérieur du trapèze, qui élève l\'omoplate.'},
{id:'Face_Pull',n:'Face pull',g:'Épaules',eq:'Poulie + corde',p:['delt_p'],s:['upback','traps'],
 st:['Poulie à hauteur du visage','Tirer vers le front, mains écartées, coudes hauts','Serrer 1 s'],tip:'Excellent pour la santé des épaules.',
 an:'Travaille l\'arrière d\'épaule et les rotateurs externes, souvent sous-développés face aux pecs.'},
{id:'Standing_Military_Press',n:'Développé militaire debout',g:'Épaules',eq:'Barre',p:['delt_a'],s:['delt_l','triceps','traps','abs'],
 st:['Abdos et fessiers serrés','Pousser la barre au-dessus de la tête','Redescendre sous le menton'],tip:'Passe la tête « dans la fenêtre » en haut.',
 an:'Le deltoïde antérieur est moteur ; debout, toute la chaîne de gainage stabilise le mouvement.'},
{id:'Seated_Dumbbell_Press',n:'Développé épaules haltères assis',g:'Épaules',eq:'Haltères',p:['delt_a'],s:['delt_l','triceps'],
 st:['Dossier vertical','Haltères à hauteur des oreilles','Pousser sans cogner les haltères'],tip:'Assis = moins de triche lombaire.',
 an:'Les haltères laissent l\'épaule trouver sa trajectoire naturelle, souvent plus confortable que la barre.'},
{id:'Side_Lateral_Raise',n:'Élévations latérales',g:'Épaules',eq:'Haltères',p:['delt_l'],s:['traps'],
 st:['Coudes légèrement fléchis','Monter jusqu\'à hauteur d\'épaules','Redescendre lentement, sans élan'],tip:'LE mouvement pour des épaules larges.',
 an:'Le deltoïde latéral écarte le bras. Au-delà de l\'horizontale, le trapèze prend le relais : inutile de monter plus haut.'},
{id:'Front_Dumbbell_Raise',n:'Élévations frontales',g:'Épaules',eq:'Haltères',p:['delt_a'],s:['pecs'],
 st:['Bras quasi tendus','Monter à hauteur des yeux','Redescendre contrôlé'],tip:'Souvent déjà assez sollicité par les développés.',
 an:'Flexion de l\'épaule : deltoïde antérieur et faisceau claviculaire du pectoral.'},
{id:'Reverse_Flyes',n:'Oiseau',g:'Épaules',eq:'Haltères',p:['delt_p'],s:['upback','traps'],
 st:['Buste presque parallèle au sol','Écarter les bras en arc','Serrer les omoplates en haut'],tip:'Charge légère, mouvement propre.',
 an:'Abduction horizontale : cible l\'arrière de l\'épaule et équilibre la posture.'},
{id:'Barbell_Curl',n:'Curl barre',g:'Bras',eq:'Barre',p:['biceps'],s:['forearm'],
 st:['Coudes collés au corps','Monter sans balancer','Descente lente'],tip:'Pas de balancier du buste.',
 an:'Le biceps fléchit le coude et met l\'avant-bras en supination : la barre droite le garde en supination complète.'},
{id:'Dumbbell_Alternate_Bicep_Curl',n:'Curl haltères alterné',g:'Bras',eq:'Haltères',p:['biceps'],s:['forearm'],
 st:['Départ paumes face aux cuisses','Tourner la paume vers le haut en montant','Alterner les bras'],tip:'La rotation maximise la contraction.',
 an:'Combine les deux fonctions du biceps : flexion et supination.'},
{id:'Hammer_Curls',n:'Curl marteau',g:'Bras',eq:'Haltères',p:['biceps','forearm'],s:[],
 st:['Prise neutre, pouces vers le haut','Coudes fixes','Monter et descendre contrôlé'],tip:'Épaissit le bras vu de face.',
 an:'La prise neutre transfère le travail vers le brachial et le long supinateur (avant-bras).'},
{id:'Incline_Hammer_Curls',n:'Curl marteau incliné',g:'Bras',eq:'Haltères + banc',p:['biceps'],s:['forearm'],
 st:['Banc incliné, bras pendants','Fléchir sans avancer les coudes','Étirement complet en bas'],tip:'Gros étirement du biceps.',
 an:'Bras en arrière du corps = biceps pré-étiré, ce qui accentue le travail de sa longue portion.'},
{id:'Preacher_Curl',n:'Curl pupitre',g:'Bras',eq:'Barre EZ',p:['biceps'],s:['forearm'],
 st:['Coudes posés sur le pupitre','Monter la barre','Ne pas verrouiller les coudes en bas'],tip:'Zéro triche possible.',
 an:'Bras devant le corps : accent sur la courte portion du biceps et le brachial.'},
{id:'Triceps_Pushdown',n:'Extension triceps poulie',g:'Bras',eq:'Poulie haute',p:['triceps'],s:[],
 st:['Coudes collés au corps','Extension complète des bras','Remonter jusqu\'à 90°'],tip:'Seuls les avant-bras bougent.',
 an:'Bras le long du corps : vaste latéral et vaste médial du triceps très sollicités.'},
{id:'EZ-Bar_Skullcrusher',n:'Barre au front',g:'Bras',eq:'Barre EZ',p:['triceps'],s:[],
 st:['Allongé, bras verticaux','Fléchir uniquement les coudes vers le front','Remonter en extension'],warn:'Coudes fixes, charge maîtrisée.',
 an:'Bras au-dessus de la tête : la longue portion du triceps est étirée et travaille davantage.'},
{id:'Close-Grip_Barbell_Bench_Press',n:'Développé couché prise serrée',g:'Bras',eq:'Barre',p:['triceps'],s:['pecs','delt_a'],
 st:['Prise largeur d\'épaules','Coudes près du corps','Descendre au bas des pecs'],tip:'Permet de charger lourd pour les triceps.',
 an:'Rapprocher les mains réduit le rôle des pecs et augmente celui des triceps.'},
{id:'Bench_Dips',n:'Dips entre deux bancs',g:'Bras',eq:'Bancs',p:['triceps'],s:['pecs','delt_a'],
 st:['Mains sur le bord du banc','Descendre jusqu\'à 90° aux coudes','Remonter en poussant'],warn:'Ne descends pas trop bas si l\'épaule tire.',
 an:'Extension du coude au poids du corps ; pieds surélevés pour augmenter la charge.'},
{id:'Barbell_Full_Squat',n:'Squat barre',g:'Jambes',eq:'Barre + rack',p:['quads','glutes'],s:['hams','adduct','lowback'],
 st:['Pieds largeur d\'épaules','Gainer fort avant de descendre','Genoux dans l\'axe des pieds','Au moins cuisses parallèles, pousser dans tout le pied'],tip:'Regard devant, poitrine haute.',
 an:'Extension de genou (quadriceps) et de hanche (fessiers). Plus la descente est profonde, plus les fessiers et adducteurs travaillent.',
 v:['Barre basse : plus de fessiers','Pieds écartés : plus d\'adducteurs']},
{id:'Goblet_Squat',n:'Goblet squat',g:'Jambes',eq:'Kettlebell',p:['quads','glutes'],s:['adduct','abs'],
 st:['Poids tenu contre la poitrine','Descendre profond, buste droit','Remonter en poussant le sol'],tip:'Parfait pour s\'échauffer avant le squat.',
 an:'La charge devant le corps garde le buste droit et apprend un squat profond sans stress lombaire.'},
{id:'Hack_Squat',n:'Hack squat',g:'Jambes',eq:'Machine',p:['quads'],s:['glutes'],
 st:['Dos plaqué au dossier','Descendre profond','Ne pas verrouiller brutalement les genoux'],tip:'Pieds bas = plus de quadriceps.',
 an:'Trajectoire guidée qui isole les quadriceps sans contrainte d\'équilibre.'},
{id:'Leg_Press',n:'Presse à cuisses',g:'Jambes',eq:'Machine',p:['quads','glutes'],s:['hams','adduct'],
 st:['Bas du dos plaqué','Descendre jusqu\'à ~90°','Pousser sans verrouiller'],tip:'Pieds hauts = fessiers ; pieds bas = quadriceps.',
 an:'Permet de charger lourd les jambes sans charge sur la colonne.'},
{id:'Dumbbell_Lunges',n:'Fentes haltères',g:'Jambes',eq:'Haltères',p:['quads','glutes'],s:['hams','adduct'],
 st:['Grand pas en avant','Genou arrière frôle le sol','Revenir en poussant sur la jambe avant'],tip:'Grand pas = plus de fessiers.',
 an:'Travail unilatéral : équilibre, stabilité du bassin et forte sollicitation du grand fessier.'},
{id:'Split_Squat_with_Dumbbells',n:'Split squat haltères',g:'Jambes',eq:'Haltères',p:['quads','glutes'],s:['adduct'],
 st:['Position de fente fixe','Descente verticale','Remonter sans bouger les pieds'],tip:'Pied arrière sur un banc = fente bulgare.',
 an:'Version statique de la fente : plus stable, permet de se concentrer sur la jambe avant.'},
{id:'Romanian_Deadlift',n:'Soulevé de terre roumain',g:'Jambes',eq:'Barre',p:['hams','glutes'],s:['lowback'],
 st:['Genoux légèrement fléchis','Hanches en arrière, barre le long des cuisses','Dos plat, sentir l\'étirement','Remonter en poussant les hanches'],tip:'Ce sont les hanches qui bougent, pas le dos.',
 an:'Les ischios étendent la hanche : ils sont étirés en bas, d\'où un travail excentrique très efficace.'},
{id:'Stiff-Legged_Barbell_Deadlift',n:'Soulevé de terre jambes tendues',g:'Jambes',eq:'Barre',p:['hams','lowback'],s:['glutes'],
 st:['Jambes presque tendues','Descendre la barre en gardant le dos plat','Remonter'],warn:'Amplitude selon ta souplesse, jamais dos rond.',
 an:'Étirement maximal des ischios ; les lombaires sont davantage sollicitées qu\'au roumain.'},
{id:'Barbell_Hip_Thrust',n:'Hip thrust',g:'Jambes',eq:'Barre + banc',p:['glutes'],s:['hams'],
 st:['Haut du dos sur le banc, barre sur les hanches','Monter les hanches jusqu\'à l\'alignement','Serrer les fessiers 1 s'],tip:'Menton rentré, regard devant.',
 an:'Le grand fessier est en contraction maximale en haut du mouvement : c\'est l\'exercice le plus ciblé pour lui.'},
{id:'Leg_Extensions',n:'Leg extension',g:'Jambes',eq:'Machine',p:['quads'],s:[],
 st:['Genou aligné avec l\'axe de la machine','Tendre les jambes','Redescendre lentement'],tip:'Pause 1 s en haut.',
 an:'Isole les quadriceps, en particulier le droit fémoral si le dossier est incliné vers l\'arrière.'},
{id:'Lying_Leg_Curls',n:'Leg curl allongé',g:'Jambes',eq:'Machine',p:['hams'],s:['calves'],
 st:['Hanches plaquées au banc','Ramener les talons vers les fesses','Redescendre contrôlé'],tip:'Pieds fléchis pour plus d\'ischios.',
 an:'Flexion du genou : isole les ischio-jambiers (et un peu les mollets).'},
{id:'Standing_Calf_Raises',n:'Mollets debout',g:'Jambes',eq:'Machine / marche',p:['calves'],s:[],
 st:['Avant du pied sur le bord','Descendre talons bas (étirement)','Monter sur la pointe, pause'],tip:'Amplitude complète, pause 1 s en bas.',
 an:'Jambes tendues = gastrocnémiens (jumeaux). Assis genoux fléchis = soléaire.'},
{id:'Plank',n:'Gainage planche',g:'Abdos',eq:'Poids du corps',p:['abs'],s:['obliques','delt_a'],
 st:['Appui avant-bras et pointes de pieds','Corps aligné','Fessiers et abdos serrés, respirer'],tip:'Mieux vaut 30 s parfaites que 2 min cambré.',
 an:'Travail isométrique du transverse et du grand droit, qui protègent la colonne.'},
{id:'Crunches',n:'Crunch',g:'Abdos',eq:'Poids du corps',p:['abs'],s:['obliques'],
 st:['Allongé, genoux fléchis','Enrouler le haut du dos','Redescendre lentement'],tip:'Expire en montant.',
 an:'Enroulement de la colonne : partie haute du grand droit.'},
{id:'Cable_Crunch',n:'Crunch à la poulie',g:'Abdos',eq:'Poulie + corde',p:['abs'],s:['obliques'],
 st:['À genoux face à la poulie','Enrouler le buste vers le sol','Hanches fixes'],tip:'Pense « côtes vers le bassin ».',
 an:'Permet de charger le grand droit progressivement, comme n\'importe quel muscle.'},
{id:'Hanging_Leg_Raise',n:'Relevé de jambes suspendu',g:'Abdos',eq:'Barre fixe',p:['abs'],s:['obliques','forearm'],
 st:['Suspendu bras tendus','Monter les jambes à l\'horizontale','Sans balancer'],tip:'Enroule le bassin en haut.',
 an:'Les fléchisseurs de hanche lèvent les jambes ; l\'enroulement du bassin fait travailler le bas du grand droit.'},
{id:'Russian_Twist',n:'Russian twist',g:'Abdos',eq:'Poids / disque',p:['obliques'],s:['abs'],
 st:['Assis, buste incliné, dos droit','Tourner les épaules de chaque côté','Garder le bassin stable'],tip:'Pieds au sol pour débuter.',
 an:'Rotation du tronc : obliques internes et externes.'}
];
const EXI = Object.fromEntries(EX.map(e=>[e.n,e]));
const GROUPS = ['Pectoraux','Dos','Épaules','Bras','Jambes','Abdos'];

const P = (n,s,r,rest)=>({n,s,r,rest});
const PROGS = {
 ppl:{name:'Push / Pull / Legs',info:'3 à 6 séances / semaine',days:{
  'Push':[P('Développé couché barre',4,'6-8',150),P('Développé incliné haltères',3,'8-10',120),P('Développé militaire debout',3,'8',120),P('Élévations latérales',4,'12-15',60),P('Écarté poulie vis-à-vis',3,'12',60),P('Extension triceps poulie',3,'10-12',60),P('Barre au front',3,'10',60)],
  'Pull':[P('Tractions pronation',4,'6-10',120),P('Rowing barre buste penché',4,'8',120),P('Tirage vertical prise large',3,'10',90),P('Rowing haltère un bras',3,'10',90),P('Face pull',3,'15',60),P('Curl barre',3,'10',60),P('Curl marteau',3,'12',60)],
  'Legs':[P('Squat barre',4,'6-8',150),P('Soulevé de terre roumain',3,'8-10',120),P('Presse à cuisses',3,'10-12',90),P('Split squat haltères',3,'10',90),P('Leg curl allongé',3,'12',60),P('Mollets debout',4,'12-15',60),P('Relevé de jambes suspendu',3,'12',60)]}},
 ul:{name:'Upper / Lower',info:'4 séances / semaine',days:{
  'Haut force':[P('Développé couché barre',4,'5',150),P('Rowing barre buste penché',4,'6',120),P('Développé épaules haltères assis',3,'8',90),P('Tractions supination',3,'8',90),P('Développé couché prise serrée',3,'8',90),P('Curl haltères alterné',3,'10',60)],
  'Bas force':[P('Squat barre',4,'5',180),P('Soulevé de terre',3,'5',180),P('Presse à cuisses',3,'10',90),P('Leg curl allongé',3,'10',60),P('Mollets debout',4,'12',60),P('Gainage planche',3,'45 s',45)],
  'Haut volume':[P('Développé incliné haltères',4,'10',90),P('Tirage horizontal assis',4,'10',90),P('Écarté couché haltères',3,'12',60),P('Tirage vertical prise large',3,'12',60),P('Élévations latérales',4,'15',45),P('Oiseau',3,'15',45),P('Curl marteau incliné',3,'12',60),P('Extension triceps poulie',3,'12',60)],
  'Bas volume':[P('Hack squat',4,'10',120),P('Hip thrust',4,'10',90),P('Fentes haltères',3,'12',90),P('Leg extension',3,'15',60),P('Leg curl allongé',3,'12',60),P('Crunch à la poulie',3,'15',45)]}},
 av5:{name:'Avancé 5 jours',info:'5 séances / semaine — chaque muscle 1 à 2 fois',days:{
  'Pecs + Dos':[P('Développé incliné haltères',4,'6-8',150),P('Tractions pronation',4,'6-10',120),P('Développé couché barre',3,'8',120),P('Rowing haltère un bras',3,'10',90),P('Écarté couché haltères',3,'12',60),P('Tirage horizontal assis',3,'12',60)],
  'Jambes (quadriceps)':[P('Squat barre',4,'6-8',180),P('Presse à cuisses',3,'10-12',120),P('Split squat haltères',3,'10',90),P('Leg extension',3,'15',60),P('Mollets debout',4,'12-15',60)],
  'Épaules + Bras':[P('Développé épaules haltères assis',4,'8',120),P('Élévations latérales',4,'12-15',45),P('Oiseau',3,'15',45),P('Curl marteau incliné',3,'10',60),P('Barre au front',3,'10',60),P('Curl pupitre',2,'12',60),P('Extension triceps poulie',2,'12',60)],
  'Haut (rappel)':[P('Développé couché haltères',3,'10',90),P('Tirage vertical prise large',3,'10',90),P('Écarté poulie vis-à-vis',3,'15',60),P('Face pull',3,'15',60),P('Élévations latérales',3,'20',45)],
  'Jambes (ischios) + Abdos':[P('Soulevé de terre roumain',4,'8',150),P('Hip thrust',3,'10',90),P('Leg curl allongé',4,'12',60),P('Fentes haltères',2,'12',90),P('Relevé de jambes suspendu',3,'12',60),P('Crunch à la poulie',3,'15',45)]}},
 fb:{name:'Full Body',info:'2 à 3 séances / semaine (alterner A et B)',days:{
  'A':[P('Squat barre',4,'6-8',150),P('Développé couché barre',4,'6-8',150),P('Rowing barre buste penché',3,'8',120),P('Élévations latérales',3,'15',60),P('Curl barre',2,'12',60),P('Gainage planche',3,'45 s',45)],
  'B':[P('Soulevé de terre roumain',4,'8',120),P('Développé militaire debout',4,'8',120),P('Tractions pronation',3,'max',120),P('Fentes haltères',3,'10',90),P('Extension triceps poulie',2,'12',60),P('Relevé de jambes suspendu',3,'12',60)]}}
};
const LOWER = ['Jambes'];
const TYPE_ETIR = ['Dumbbell_Flyes','Incline_Hammer_Curls','Romanian_Deadlift','Stiff-Legged_Barbell_Deadlift','EZ-Bar_Skullcrusher','Dumbbell_Bench_Press','Pullups','Standing_Calf_Raises','Dips_-_Chest_Version','Incline_Dumbbell_Press','Split_Squat_with_Dumbbells'];
const TYPE_CONTR = ['Cable_Crossover','Leg_Extensions','Lying_Leg_Curls','Barbell_Hip_Thrust','Preacher_Curl','Side_Lateral_Raise','Triceps_Pushdown','Face_Pull','Barbell_Shrug','Cable_Crunch','Reverse_Flyes','Seated_Cable_Rows'];
const exType = e=>TYPE_ETIR.includes(e.id)?'etir':TYPE_CONTR.includes(e.id)?'contr':'base';
const TYPES = {
 base:{l:'Exercice de base',c:'#7aa2ff',t:'Polyarticulaire, charge lourde : c\'est la tension mécanique qui fait progresser. À placer en début de séance.'},
 etir:{l:'Travail en étirement',c:'#3ecf8e',t:'Le muscle est le plus chargé quand il est allongé. Descente lente (3 s) et courte pause en bas pour profiter de l\'étirement.'},
 contr:{l:'Travail en contraction',c:'#ffa63d',t:'Le muscle est le plus chargé quand il est raccourci. Serre 1 à 2 s en fin de mouvement ; idéal en fin de séance pour la congestion.'}
};
const LEVERS = [
 ['Tension en étirement','Charger le muscle quand il est allongé (écartés, roumain, curl incliné…).'],
 ['Tension en contraction','Charger le muscle quand il est raccourci et serrer en fin de course (poulies, machines).'],
 ['Temps sous tension','Contrôler le tempo, surtout la descente : une série de 8 reps dure 30 à 45 s.'],
 ['Brûlure','Séries longues ou techniques d\'intensification : acidité locale qui stimule le muscle.'],
 ['Congestion','Repos courts et séries rapprochées en fin de séance pour gonfler le muscle de sang.']
];
const TECHS = [
 {n:'Pré-fatigue',q:'Un exercice d\'isolation juste avant l\'exercice de base du même muscle.',w:'Quand un muscle secondaire lâche avant le muscle visé (ex. triceps au développé couché).',x:'Écarté poulie puis développé couché, sans repos.'},
 {n:'Série dégressive',q:'À l\'échec, baisse la charge de 20-30 % et repars sans repos, 1 à 2 fois.',w:'Dernière série d\'un exercice sur machine ou haltères.',x:'Élévations latérales 12 kg → 9 kg → 6 kg.'},
 {n:'Rest-pause',q:'À 1 rep de l\'échec, pose 15 s, puis refais quelques reps. 2 à 3 fois.',w:'Pour ajouter du volume lourd sans allonger la séance.',x:'Tractions : 8 + 3 + 2 reps.'},
 {n:'Négatives accentuées',q:'Monte normalement, descends en 4-5 s.',w:'Pour renforcer un point faible ou sortir d\'une stagnation.',x:'Barre au front, descente en 5 s.'},
 {n:'Tension continue',q:'Pas de pause en haut ni en bas, amplitude des ¾.',w:'Pour la brûlure et la congestion sur l\'isolation.',x:'Leg extension sans verrouiller ni redescendre complètement.'},
 {n:'Série longue',q:'Une série de 20 à 30 reps avec une charge légère.',w:'Mollets, épaules, abdos ; aussi pour récupérer.',x:'Mollets debout 1×25.'},
 {n:'Superset antagoniste',q:'Enchaîner deux muscles opposés sans repos.',w:'Gain de temps et meilleure récupération entre les séries.',x:'Curl barre + extension triceps poulie.'},
 {n:'Pause en étirement',q:'Tenir 2 s en position étirée à chaque rep.',w:'Sur les exercices « en étirement ».',x:'Écarté haltères, 2 s bras ouverts.'}
];
const techFor = e=>({etir:TECHS[7],contr:TECHS[1],base:TECHS[2]})[exType(e)];

const $ = s=>document.querySelector(s);
const esc = s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const img = (id,n)=>`https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${id}/${n}.jpg`;
const topReps = r=>{const m=String(r).match(/(\d+)(?!.*\d)/);return m?+m[1]:null};
const fmt = s=>`${Math.floor(s/60)}:${String(Math.max(0,s)%60).padStart(2,'0')}`;
const today = ()=>new Date().toISOString().slice(0,10);

const BODY_BASE = [
  'M100,60 L90,60 Q78,64 64,70 Q54,76 55,92 L58,122 Q62,152 65,176 Q66,196 62,214 L64,232 L100,238Z',
  'M57,76 Q44,80 41,100 L37,150 L33,170 L27,226 Q25,240 28,252 Q34,258 38,248 L42,232 L48,188 Q52,170 54,152 L58,120 Q59,98 57,80Z',
  'M64,226 Q57,250 59,282 L65,322 Q65,338 68,352 L72,396 Q66,404 63,411 L90,413 L88,396 Q85,370 89,350 Q92,336 90,322 L94,290 Q98,262 100,240 L100,236Z',
  'M90,46 L100,46 L100,64 L88,64Z'
];
const FOREARM = 'M46,170 Q38,188 36,210 L33,226 L40,229 Q46,210 50,190 Q52,178 50,170Z';
const BODY_M = {
 front:[
  ['traps','M90,58 L74,66 Q82,70 92,68Z'],
  ['delt_l','M54,74 Q42,80 40,98 Q41,108 45,114 Q46,96 55,82Z'],
  ['delt_a','M57,76 Q50,84 47,98 Q48,110 52,116 Q58,104 64,92 Q65,80 57,76Z'],
  ['pecs','M98,76 L72,76 Q62,82 60,96 Q63,112 76,117 Q90,119 98,112Z'],
  ['biceps','M50,118 Q44,130 44,146 Q46,160 51,165 Q57,150 57,134 Q56,122 50,118Z'],
  ['forearm',FOREARM],
  ['obliques','M64,120 Q69,150 67,176 Q71,190 80,198 L86,198 L86,126 Q76,118 64,120Z'],
  ['abs','M88,120 L98.5,120 L98.5,136 L88,136Z M88,139 L98.5,139 L98.5,155 L88,155Z M88,158 L98.5,158 L98.5,174 L88,174Z M88,177 L98.5,177 L98.5,206 Q92,204 88,196Z'],
  ['quads','M65,244 Q59,270 63,300 Q67,318 75,322 Q75,290 79,250Z M83,242 Q77,272 80,302 Q84,314 88,312 Q90,280 92,250Z M90,292 Q86,306 84,318 Q90,323 94,314 Q95,300 92,292Z'],
  ['adduct','M93,242 L99,240 Q98,264 94,288 Q90,268 93,242Z'],
  ['calves','M69,336 Q65,358 69,384 L75,384 Q76,360 76,340Z M80,340 Q84,360 82,384 L86,382 Q88,360 86,342Z']
 ],
 back:[
  ['traps','M100,56 L90,60 Q76,66 64,72 Q78,80 86,94 L100,140Z'],
  ['delt_p','M57,74 Q45,80 41,98 Q45,108 51,112 Q57,98 66,86 Q64,78 57,74Z'],
  ['delt_l','M44,84 Q39,94 40,104 L44,110 Q44,96 48,88Z'],
  ['upback','M66,86 Q72,98 84,104 L86,94 Q78,82 68,82Z M86,96 L98.5,104 L98.5,128 Q90,120 85,106Z'],
  ['lats','M61,106 Q59,140 69,176 Q79,190 92,198 L96,150 Q86,132 84,108Z'],
  ['lowback','M90,150 L98.5,148 L98.5,208 L87,208 Q86,180 90,150Z'],
  ['triceps','M51,110 Q43,124 43,144 Q45,158 51,165 Q57,148 57,130 Q57,118 51,110Z'],
  ['forearm',FOREARM],
  ['glutes','M65,212 Q60,232 65,250 Q80,260 98.5,256 L98.5,214 Q84,204 65,212Z'],
  ['hams','M63,258 Q61,288 69,320 L79,322 Q83,292 81,262Z M84,262 Q88,292 86,322 L92,320 Q96,292 96,262Z'],
  ['calves','M67,334 Q61,354 67,374 Q73,382 79,378 Q79,354 77,336Z M80,336 Q84,354 82,376 Q88,380 90,370 Q92,350 88,334Z']
 ]
};
const FIBERS = {
 front:'M96,82 L66,86 M96,92 L63,96 M96,102 L66,106 M94,110 L74,113 M52,82 L49,106 M56,82 L53,110 M48,126 L50,158 M70,256 L69,308 M86,252 L84,304 M68,130 L80,192',
 back:'M98,70 L70,74 M98,86 L80,90 M68,122 L90,186 M64,140 L86,192 M48,124 L50,160 M70,220 L94,250 M68,232 L92,254 M72,268 L74,316 M89,268 L89,316 M94,156 L94,204'
};
let _svgN = 0;
const lerpHex = (a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.substr(i,2),16)*(1-t)+parseInt(b.substr(i,2),16)*t).toString(16).padStart(2,'0')).join('');
function bodySVG(side, p, s, heat){
  const n = ++_svgN;
  const half = BODY_M[side].map(([k,d])=>{
    let cls='m', st='';
    if(heat){ const v=heat[k]||0; st=` style="fill:${lerpHex('#555d6c','#ff5a36',Math.min(1,v))}"`; }
    else cls += p.includes(k)?' p':s.includes(k)?' s':'';
    return `<path class="${cls}"${st} d="${d}"><title>${MUSCLES[k]}</title></path>`;
  }).join('');
  const base = BODY_BASE.map(d=>`<path d="${d}"/>`).join('');
  const mirror = x=>`${x}<g transform="matrix(-1 0 0 1 200 0)">${x}</g>`;
  return `<svg viewBox="20 4 160 420" role="img" aria-label="Planche anatomique ${side==='front'?'de face':'de dos'}">
   <defs><radialGradient id="sk${n}" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#454c59"/><stop offset="1" stop-color="#2b3039"/></radialGradient>
   <linearGradient id="lt${n}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
   <clipPath id="cl${n}">${mirror(base)}<ellipse cx="100" cy="30" rx="16" ry="20"/></clipPath></defs>
   <g fill="url(#sk${n})"><ellipse cx="100" cy="30" rx="16" ry="20"/>${mirror(base)}</g>
   ${mirror(half)}
   <g class="fib">${mirror(`<path d="${FIBERS[side]}"/>`)}</g>
   <rect x="20" y="0" width="160" height="420" fill="url(#lt${n})" clip-path="url(#cl${n})" pointer-events="none"/>
   <text x="100" y="418" text-anchor="middle" fill="#9aa1ad" font-size="11">${side==='front'?'Face':'Dos'}</text></svg>`;
}
function anatomy(p,s,heat){
  return `<div class="anat">${bodySVG('front',p,s,heat)}${bodySVG('back',p,s,heat)}</div>
   ${heat?`<div class="legend"><span><i style="background:#555d6c"></i>Peu</span><span><i style="background:#aa5c4c"></i>Moyen</span><span><i style="background:#ff5a36"></i>Beaucoup</span></div>`
   :`<div class="legend"><span><i style="background:var(--acc)"></i>Principal</span><span><i style="background:var(--acc2)"></i>Secondaire</span><span><i style="background:#555d6c"></i>Repos</span></div>`}`;
}

function animBlock(e, uid){
  return `<div class="anim" id="an_${uid}" style="--t:3.4s">
    <img src="${img(e.id,0)}" alt="Position de départ — ${esc(e.n)}" loading="lazy">
    <img class="b" src="${img(e.id,1)}" alt="Position d'arrivée — ${esc(e.n)}" loading="lazy">
    <span class="phase" id="ph_${uid}">Tempo normal</span></div>
    <div class="ctrl"><button class="btn ghost" onclick="Anim.speed('${uid}',2.2,'Rapide')">Rapide</button>
    <button class="btn ghost" onclick="Anim.speed('${uid}',3.4,'Tempo normal')">Normal</button>
    <button class="btn ghost" onclick="Anim.speed('${uid}',6,'Ralenti')">Ralenti</button>
    <button class="btn ghost" onclick="Anim.toggle('${uid}')">⏯</button></div>`;
}
const Anim = {
  speed(u,t,l){const a=$('#an_'+u); if(!a)return; a.style.setProperty('--t',t+'s'); a.classList.remove('paused'); $('#ph_'+u).textContent=l;
    const b=a.querySelector('.b'); b.style.animation='none'; b.offsetHeight; b.style.animation='';},
  toggle(u){const a=$('#an_'+u); a&&a.classList.toggle('paused');}
};

function exDetail(e, uid){
  return `${animBlock(e,uid)}
   <div class="note" style="border-color:${TYPES[exType(e)].c}"><b style="color:${TYPES[exType(e)].c}">${TYPES[exType(e)].l}</b> — ${TYPES[exType(e)].t}</div>
   <h3>Muscles sollicités</h3>${anatomy(e.p,e.s)}
   <div style="margin-top:8px">${e.p.map(m=>`<span class="tag p">${MUSCLES[m]}</span>`).join('')}${e.s.map(m=>`<span class="tag s">${MUSCLES[m]}</span>`).join('')}</div>
   <h3>Exécution</h3><ol class="steps">${e.st.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
   ${e.tip?`<div class="note">💡 ${esc(e.tip)}</div>`:''}${e.warn?`<div class="note w">⚠️ ${esc(e.warn)}</div>`:''}
   ${morphoTips(e.n).map(t=>`<div class="note">🧬 ${esc(t)}</div>`).join('')}${morphoAvoid(e.n)?`<div class="note w">⚠️ Peu adapté à la morphologie que tu as cochée.</div>`:''}
   <h3>Anatomie & biomécanique</h3><p style="margin:0">${esc(e.an)}</p>
   ${e.v?`<h3>Variantes</h3><ul style="margin:0;padding-left:18px">${e.v.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
   <p class="mut sm">Matériel : ${esc(e.eq)}</p>`;
}

const Timer = {
  end:0,total:0,iv:null,
  start(sec){this.total=sec;this.end=Date.now()+sec*1000;$('#timer').classList.add('on');clearInterval(this.iv);this.iv=setInterval(()=>this.tick(),250);this.tick();},
  add(d){this.end+=d*1000;this.total=Math.max(1,this.total+d);this.tick();},
  stop(){clearInterval(this.iv);$('#timer').classList.remove('on');},
  tick(){const left=Math.ceil((this.end-Date.now())/1000);$('#tVal').textContent=fmt(left);
    $('#tBar').style.width=Math.min(100,100*(1-left/this.total))+'%';
    if(left<=0){this.stop();beep();try{navigator.vibrate&&navigator.vibrate([200,100,200]);}catch(e){}}}
};
let actx;
function beep(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();[0,.25].forEach(d=>{const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=880;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(.25,actx.currentTime+d);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+d+.2);o.start(actx.currentTime+d);o.stop(actx.currentTime+d+.22);});}catch(e){}}

let state = {view:'seance', prog:DB.get('prog','ppl'), day:null, exGroup:'Pectoraux', exOpen:null, dietTab:'journal'};

function render(){
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===state.view));
  $('#hdrSub').textContent = {seance:'Programme',exos:'Méthode anatomique',diete:'Nutrition',suivi:'Progression'}[state.view];
  ({seance:vSeance,exos:vExos,diete:vDiete,suivi:vSuivi})[state.view]();
  window.scrollTo(0,0);
}

const BLOCK = [
 {n:'Reprise',rir:'3',mul:.7,txt:'Charges légères : on retrouve la technique et les sensations.'},
 {n:'Accumulation',rir:'2-3',mul:1,txt:'Volume normal, garde 2 à 3 reps en réserve.'},
 {n:'Accumulation',rir:'2',mul:1,txt:'Ajoute des reps avant d\'ajouter du poids.'},
 {n:'Surcharge',rir:'1-2',mul:1.25,txt:'+1 série sur la plupart des exercices.'},
 {n:'Surcharge',rir:'1-2',mul:1.25,txt:'Volume maximal du bloc, sommeil et protéines au top.'},
 {n:'Intensification',rir:'1',mul:1,txt:'Charges plus lourdes, dernière série à 1 rep de l\'échec.'},
 {n:'Intensification',rir:'0-1',mul:1,txt:'Dernière série à l\'échec technique (isolation seulement).'},
 {n:'Décharge',rir:'4',mul:.5,txt:'Moitié des séries, charges −10 % : on récupère pour repartir plus fort.'}
];
const FREQ = {ppl:2, ul:1, av5:1, fb:1.5};
function curWeek(){
  const o=DB.get('weekOverride',null); if(o) return o;
  let st=DB.get('blockStart',null); if(!st){st=today();DB.set('blockStart',st);}
  return Math.floor((Date.now()-new Date(st))/6048e5)%8+1;
}
function setWeek(w){DB.set('weekOverride',w);DB.set('blockStart',new Date(Date.now()-(w-1)*6048e5).toISOString().slice(0,10));DB.set('weekOverride',null);render();}
const nSets = (x,w)=>Math.max(1,Math.round(x.s*BLOCK[w-1].mul));
const isCompound = x=>x.rest>=120;
const tempoOf = x=>isCompound(x)?'3-0-1 : descente 3 s, montée explosive':'2-1-2 : contrôle, 1 s de contraction';

const MORPHO = {
 femurs:{l:'Fémurs longs',tips:{'Squat barre':'Écarte un peu plus les pieds et surélève les talons : tu descendras plus bas en gardant le buste droit.','Hack squat':'Très adapté pour toi : la machine compense la bascule du buste.','Presse à cuisses':'Bon substitut si le squat te fait trop pencher vers l\'avant.'},avoid:[]},
 bras:{l:'Bras longs',tips:{'Développé couché barre':'Grande amplitude pour toi : privilégie aussi les haltères et une prise un peu plus large.','Soulevé de terre':'Gros levier favorable : c\'est un de tes points forts.','Dips pectoraux':'Limite la descente pour épargner l\'avant de l\'épaule.'},avoid:[]},
 epaules:{l:'Épaules fragiles',tips:{'Développé couché barre':'Prise un peu plus serrée, coudes à 45°, omoplates bien serrées.','Développé militaire debout':'Préfère les haltères en prise neutre.','Élévations latérales':'Pouces légèrement vers le haut, ne dépasse pas l\'horizontale.'},avoid:['Dips pectoraux','Barre au front','Dips entre deux bancs']},
 lombaires:{l:'Lombaires sensibles',tips:{'Squat barre':'Gainage maximal ; une ceinture aide sur les séries lourdes.','Soulevé de terre roumain':'Charge modérée, descends jusqu\'à mi-tibia seulement.'},avoid:['Soulevé de terre','Rowing barre buste penché','Soulevé de terre jambes tendues']},
 genoux:{l:'Genoux sensibles',tips:{'Leg extension':'Amplitude partielle (de 90° à 30°) et charge modérée.','Fentes haltères':'Petit pas, genou avant au-dessus de la cheville.','Squat barre':'Descends jusqu\'aux cuisses parallèles, pas plus bas.'},avoid:['Hack squat']}
};
const myMorpho = ()=>DB.get('morpho',[]);
function morphoTips(n){return myMorpho().map(k=>MORPHO[k].tips[n]).filter(Boolean);}
function morphoAvoid(n){return myMorpho().some(k=>MORPHO[k].avoid.includes(n));}
function alternatives(n){const e=EXI[n];return EX.filter(x=>x.n!==n&&x.g===e.g&&x.p.some(m=>e.p.includes(m))).sort((a,b)=>morphoAvoid(a.n)-morphoAvoid(b.n));}
function toggleWeak(g){let w=DB.get('weak',[]);w=w.includes(g)?w.filter(x=>x!==g):[...w,g].slice(-2);DB.set('weak',w);DB.set('draft',null);render();}
function toggleMorpho(k){const m=myMorpho();DB.set('morpho',m.includes(k)?m.filter(x=>x!==k):[...m,k]);render();}

function dayList(prog,day){
  const sw=DB.get('swaps',{});
  const pf=DB.get('weak',[]);
  const l=PROGS[prog].days[day].map((x,i)=>({...x,n:sw[`${prog}|${day}|${i}`]||x.n,orig:x.n,k:i}));
  l.forEach(x=>{if(pf.includes(EXI[x.n].g)){x.s+=1;x.prio=true;}});
  return [...l.filter(x=>x.prio),...l.filter(x=>!x.prio)];
}
function weeklyVolume(prog,w){
  const v={}; const f=FREQ[prog]*BLOCK[w-1].mul;
  Object.keys(PROGS[prog].days).forEach(d=>dayList(prog,d).forEach(x=>{const e=EXI[x.n];
    e.p.forEach(m=>v[m]=(v[m]||0)+x.s*f); e.s.forEach(m=>v[m]=(v[m]||0)+x.s*f*.5);}));
  return v;
}
function warmup(list,hist){
  const groups=new Set(list.map(x=>EXI[x.n].g));
  const mob=[];
  if(groups.has('Pectoraux')||groups.has('Épaules'))mob.push('Rotations d\'épaules + face pull léger 2×15');
  if(groups.has('Dos'))mob.push('Suspension à la barre 2×20 s + tirage élastique');
  if(groups.has('Jambes'))mob.push('Goblet squat léger 2×8 + fentes sans charge 1×10');
  const first=list[0]; const prev=lastPerf(hist,first.n);
  const top=prev?Math.max(...prev.sets.filter(s=>s.done).map(s=>+s.kg||0)):0;
  const r=p=>Math.round(top*p/2.5)*2.5;
  const ramp= top ? `${r(.4)} kg × 8 · ${r(.6)} kg × 5 · ${r(.8)} kg × 3` : 'Barre à vide × 10, puis 2 à 3 séries en montant progressivement';
  return `<div class="card"><b>🔥 Échauffement (8-10 min)</b><ul class="sm" style="margin:6px 0 0;padding-left:18px">
   <li>5 min de cardio léger (vélo, rameur)</li>${mob.map(m=>`<li>${m}</li>`).join('')}
   <li><b>${esc(first.n)}</b> — montée : ${ramp}</li></ul></div>`;
}

function vSeance(){
  const pr = PROGS[state.prog]; const w=curWeek(); const B=BLOCK[w-1];
  if(!state.day){
    const vol=weeklyVolume(state.prog,w);
    const heat=Object.fromEntries(Object.entries(vol).map(([k,v])=>[k,v/20]));
    const rows=Object.entries(vol).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{const z=v<8?['faible','#e5b842']:v>22?['élevé','#ff8a6e']:['optimal','var(--ok)'];
      return `<div class="row sm" style="padding:3px 0"><span class="grow">${MUSCLES[k]}</span><b>${Math.round(v)}</b><span style="color:${z[1]};width:58px;text-align:right">${z[0]}</span></div>`;}).join('');
    $('#app').innerHTML = `<h2>Ton programme</h2>
     <div class="seg">${Object.entries(PROGS).map(([k,v])=>`<button class="${k===state.prog?'on':''}" onclick="setProg('${k}')">${v.name.replace(/ \/ /g,'/')}</button>`).join('')}</div>
     <p class="mut sm" style="margin-top:-4px">${pr.info}</p>
     <div class="card"><div class="row"><div class="grow"><b>Semaine ${w}/8 · ${B.n}</b><div class="mut sm">${B.txt}</div></div><span class="tag p">RIR ${B.rir}</span></div>
      <div class="weeks">${BLOCK.map((b,i)=>`<button class="${i+1===w?'on':''} ${b.n==='Décharge'?'dl':''}" onclick="setWeek(${i+1})" title="${b.n}">S${i+1}</button>`).join('')}</div>
      <p class="mut sm" style="margin:6px 0 0">RIR = reps en réserve : le nombre de répétitions que tu pourrais encore faire à la fin de la série.</p></div>
     ${Object.keys(pr.days).map(d=>{const list=dayList(state.prog,d);
       const last = (DB.get('hist',[]).filter(h=>h.prog===state.prog&&h.day===d).pop()||{}).date;
       const groups=[...new Set(list.map(x=>EXI[x.n]?.g))].join(' · ');
       const sets=list.reduce((a,x)=>a+nSets(x,w),0);
       return `<div class="card" onclick="openDay('${esc(d)}')" style="cursor:pointer"><div class="row"><div class="grow"><b style="font-size:16px">${esc(d)}</b>
        <div class="mut sm">${list.length} exercices · ${sets} séries · ~${Math.round(sets*2.6+10)} min</div><div class="mut sm">${groups}</div>${last?`<div class="mut sm">Dernière : ${last}</div>`:''}</div><span style="color:var(--acc);font-size:22px">›</span></div></div>`;}).join('')}
     <h3>Volume hebdo par muscle</h3>
     <div class="card">${anatomy([],[],heat)}<div style="margin-top:10px">${rows}</div>
      <p class="mut sm" style="margin-bottom:0">Séries par semaine (secondaire = ½). Zone utile : 8 à 20 séries.</p></div>
     <h3>Ma morphologie</h3>
     <div class="card"><p class="mut sm" style="margin-top:0">Coche ce qui te correspond : les conseils et les remplacements d'exercices s'adaptent.</p>
      <div class="chips" style="flex-wrap:wrap">${Object.entries(MORPHO).map(([k,v])=>`<button class="chip ${myMorpho().includes(k)?'on':''}" onclick="toggleMorpho('${k}')">${v.l}</button>`).join('')}</div></div>
     <h3>Points faibles à rattraper</h3>
     <div class="card"><p class="mut sm" style="margin-top:0">Choisis 1 ou 2 groupes : leurs exercices passent en début de séance (muscles frais) avec 1 série de plus.</p>
      <div class="chips" style="flex-wrap:wrap">${GROUPS.map(g=>`<button class="chip ${DB.get('weak',[]).includes(g)?'on':''}" onclick="toggleWeak('${g}')">${g}</button>`).join('')}</div></div>
     <div class="card sm mut">Progression : quand toutes tes séries atteignent le haut de la fourchette de reps au RIR demandé, l'appli te propose d'augmenter la charge (+2,5 kg haut du corps, +5 kg jambes).</div>`;
    return;
  }
  const list = dayList(state.prog,state.day);
  const draft = DB.get('draft',null);
  const fresh = ()=>({prog:state.prog,day:state.day,week:w,ex:list.map(x=>({n:x.n,sets:Array.from({length:nSets(x,w)},()=>({kg:'',reps:'',done:false}))}))});
  let sess = (draft && draft.prog===state.prog && draft.day===state.day) ? draft : fresh();
  list.forEach((x,i)=>{if(!sess.ex[i]||sess.ex[i].n!==x.n)sess.ex[i]={n:x.n,sets:Array.from({length:nSets(x,w)},()=>({kg:'',reps:'',done:false}))};});
  window._sess = sess;
  const hist = DB.get('hist',[]);
  $('#app').innerHTML = `<button class="back" onclick="state.day=null;render()">‹ Programme</button>
   <h2>${esc(pr.name)} — ${esc(state.day)}</h2>
   <div class="mut sm" style="margin:-6px 0 10px">Semaine ${w} · ${B.n} · effort RIR ${B.rir}</div>
   ${warmup(list,hist)}
   ${list.map((x,i)=>{
     const e=EXI[x.n]; const prev=lastPerf(hist,x.n); const sug=suggest(x,e,prev);
     const tips=morphoTips(x.n); const bad=morphoAvoid(x.n); const alt=bad?alternatives(x.n).find(a=>!morphoAvoid(a.n)):null;
     return `<div class="card"><div class="row"><img class="thumb" src="${img(e.id,0)}" alt="" loading="lazy">
      <div class="grow"><b>${esc(x.n)}</b><div class="mut sm">${nSets(x,w)} × ${x.r} · RIR ${B.rir} · repos ${x.rest} s</div>
      <div class="mut sm">Tempo ${tempoOf(x)}</div></div>
      <div style="display:flex;flex-direction:column;gap:6px"><button class="btn ghost" style="padding:6px 10px" onclick="toggleInfo(${i})">Voir</button>
      <button class="btn ghost" style="padding:6px 10px" onclick="openSwap(${i})" title="Remplacer">⇄</button></div></div>
      <div id="swap_${i}" class="hide"></div>
      <div id="info_${i}" class="hide" style="margin-top:10px"></div>
      ${bad?`<div class="note w">⚠️ Peu adapté à ta morphologie${alt?` — essaie plutôt <a href="#" onclick="doSwap(${i},'${esc(alt.n).replace(/'/g,"\\'")}');return false" style="color:var(--acc2)">${esc(alt.n)}</a>`:''}.</div>`:''}
      ${tips.map(t=>`<div class="note">🧬 ${esc(t)}</div>`).join('')}
      ${prev?`<div class="mut sm" style="margin-top:8px">Dernière fois : ${prev.sets.filter(s=>s.done).map(s=>`${s.kg||0}×${s.reps||0}`).join(' · ')}</div>`:''}
      ${sug?`<div class="hint">↑ ${sug}</div>`:''}
      ${x.prio?`<div class="hint" style="color:var(--acc2)">★ Point faible : placé en début de séance, +1 série</div>`:''}
      ${B.n==='Intensification'&&!isCompound(x)?`<div class="note">⚡ Dernière série : <b>${techFor(e).n}</b> — ${esc(techFor(e).q)}</div>`:''}
      ${sess.ex[i].sets.map((s,j)=>`<div class="set"><span class="n">${j+1}</span>
        <input inputmode="decimal" placeholder="kg" value="${s.kg}" oninput="upd(${i},${j},'kg',this.value)">
        <input inputmode="numeric" placeholder="reps ${esc(x.r)}" value="${s.reps}" oninput="upd(${i},${j},'reps',this.value)">
        <button class="ck ${s.done?'done':''}" onclick="doneSet(${i},${j},${x.rest},this)">✓</button></div>`).join('')}
      </div>`;}).join('')}
   <div class="card sm"><b>🧘 Retour au calme (5 min)</b><div class="mut">Étire 30 s chaque muscle travaillé, en position d'allongement (comme sur la planche anatomique de l'exercice).</div></div>
   <button class="btn block" onclick="finish()">Terminer la séance</button>`;
}
function openSwap(i){const el=$('#swap_'+i);const x=dayList(state.prog,state.day)[i];
  if(el.classList.contains('hide')){el.innerHTML=`<div class="mut sm" style="margin:8px 0 4px">Remplacer par :</div><div class="chips" style="flex-wrap:wrap">${
    alternatives(x.n).map(a=>`<button class="chip" onclick="doSwap(${i},'${esc(a.n).replace(/'/g,"\\'")}')">${esc(a.n)}${morphoAvoid(a.n)?' ⚠️':''}</button>`).join('')}
    ${x.n!==x.orig?`<button class="chip on" onclick="doSwap(${i},null)">↺ ${esc(x.orig)}</button>`:''}</div>`;}
  el.classList.toggle('hide');}
function doSwap(i,n){const sw=DB.get('swaps',{});const k=`${state.prog}|${state.day}|${dayList(state.prog,state.day)[i].k}`;if(n)sw[k]=n;else delete sw[k];DB.set('swaps',sw);render();}
function setProg(k){state.prog=k;DB.set('prog',k);render();}
function openDay(d){state.day=d;render();}
function toggleInfo(i){const el=$('#info_'+i);if(el.classList.contains('hide')){const x=dayList(state.prog,state.day)[i];el.innerHTML=exDetail(EXI[x.n],'s'+i);}el.classList.toggle('hide');}
function upd(i,j,k,v){_sess.ex[i].sets[j][k]=v;DB.set('draft',_sess);}
function doneSet(i,j,rest,btn){const s=_sess.ex[i].sets[j];s.done=!s.done;btn.classList.toggle('done',s.done);DB.set('draft',_sess);if(s.done)Timer.start(rest);}
function lastPerf(hist,n){for(let k=hist.length-1;k>=0;k--){const e=hist[k].ex.find(x=>x.n===n&&x.sets.some(s=>s.done));if(e)return e;}return null;}
function suggest(x,e,prev){
  if(!prev)return ''; const top=topReps(x.r); if(!top)return '';
  const done=prev.sets.filter(s=>s.done); if(!done.length)return '';
  const w=curWeek(); if(BLOCK[w-1].n==='Décharge')return 'Semaine de décharge : charges −10 %';
  if(done.every(s=>+s.reps>=top)){const kg=Math.max(...done.map(s=>+s.kg||0));if(!kg)return '';
    const inc=LOWER.includes(e.g)||e.n.includes('Soulevé de terre')?5:2.5; return `Objectif atteint : passe à ${kg+inc} kg`;}
  return '';
}
function finish(){
  const s=_sess; if(!s.ex.some(e=>e.sets.some(x=>x.done))){toast('Valide au moins une série');return;}
  const h=DB.get('hist',[]); h.push({...s,date:today()}); DB.set('hist',h); DB.set('draft',null); Timer.stop();
  state.day=null; toast('Séance enregistrée 💪'); render();
}

function vExos(){
  if(state.exOpen){const e=EX.find(x=>x.id===state.exOpen);
    $('#app').innerHTML=`<button class="back" onclick="state.exOpen=null;render()">‹ ${esc(e.g)}</button><h2>${esc(e.n)}</h2>${exDetail(e,'x')}`;return;}
  const g=state.exGroup;
  const tabs=`<div class="chips">${[...GROUPS,'Principes','Techniques'].map(x=>`<button class="chip ${x===g?'on':''}" onclick="state.exGroup='${x}';render()">${x}</button>`).join('')}</div>`;
  if(g==='Principes'){$('#app').innerHTML=`<h2>Les leviers de la croissance</h2>${tabs}
    ${LEVERS.map(([t,d],i)=>`<div class="card"><b>${i+1}. ${t}</b><div class="mut sm">${d}</div></div>`).join('')}
    <h3>Trois familles d'exercices</h3>${Object.values(TYPES).map(t=>`<div class="note" style="border-color:${t.c}"><b style="color:${t.c}">${t.l}</b> — ${t.t}</div>`).join('')}
    <div class="card sm mut">Pour chaque muscle, combine idéalement un exercice de base, un exercice en étirement et un exercice en contraction. Les fiches indiquent le type de chaque mouvement.</div>`;return;}
  if(g==='Techniques'){$('#app').innerHTML=`<h2>Techniques d'intensification</h2>${tabs}
    <p class="mut sm">À réserver aux semaines d'intensification (S6-S7), sur la dernière série, de préférence en isolation.</p>
    ${TECHS.map(t=>`<div class="card"><b>${t.n}</b><div class="sm" style="margin-top:4px">${t.q}</div><div class="mut sm">Quand : ${t.w}</div><div class="mut sm">Exemple : ${t.x}</div></div>`).join('')}`;return;}
  const list=EX.filter(e=>e.g===g);
  const allP=[...new Set(list.flatMap(e=>e.p))];
  $('#app').innerHTML=`<h2>Exercices par muscle</h2>
   ${tabs}
   <div class="card">${anatomy(allP,[])}<p class="mut sm" style="margin:8px 0 0;text-align:center">Zones ciblées par le groupe « ${g} »</p></div>
   <div class="list">${list.map(e=>`<div class="item" onclick="state.exOpen='${e.id}';render()" style="cursor:pointer">
     <img class="thumb" src="${img(e.id,1)}" alt="" loading="lazy"><div class="grow"><b>${esc(e.n)}</b><div><span class="tag" style="color:${TYPES[exType(e)].c}">${TYPES[exType(e)].l}</span>${e.p.map(m=>`<span class="tag p">${MUSCLES[m]}</span>`).join('')}</div></div>
     <span style="color:var(--acc)">›</span></div>`).join('')}</div>`;
}

const FOODS = {
  'Flocons d\'avoine':[370,13,60,7],'Lait demi-écrémé':[46,3.3,4.8,1.6],'Œufs':[145,12.5,0.7,10],'Skyr / fromage blanc 0 %':[60,10.5,4,0.2],
  'Blanc de poulet':[120,23,0,2.5],'Riz basmati (cru)':[355,8,78,0.8],'Pâtes complètes (crues)':[350,13,64,2.5],'Saumon':[200,20,0,13],
  'Steak haché 5 %':[125,21,0,5],'Pomme de terre':[80,2,17,0.1],'Légumes verts':[30,2,4,0.3],'Huile d\'olive':[900,0,0,100],
  'Banane':[90,1.2,20,0.3],'Amandes':[600,21,9,52],'Pain complet':[245,9,43,3.5],'Whey':[380,78,7,5]
};
const MEALS = [
  {n:'Petit-déjeuner',pct:.25,items:[['Flocons d\'avoine',60],['Lait demi-écrémé',250],['Œufs',120],['Banane',100]]},
  {n:'Déjeuner',pct:.32,items:[['Blanc de poulet',150],['Riz basmati (cru)',80],['Légumes verts',200],['Huile d\'olive',10]]},
  {n:'Collation (pré/post-training)',pct:.15,items:[['Skyr / fromage blanc 0 %',200],['Pain complet',50],['Amandes',15]]},
  {n:'Dîner',pct:.28,items:[['Saumon',150],['Pomme de terre',250],['Légumes verts',200],['Huile d\'olive',5]]}
];
function vDiete(){
  const d=DB.get('diet',{sexe:'h',age:35,poids:80,taille:178,act:1.55,obj:'recompo'});
  const t=state.dietTab;
  let body='';
  if(t==='journal'){ body=vJournal(); }
  else if(t==='calc'){
    body=`<div class="card"><div class="grid2">
     <div><label class="f">Sexe</label><select class="f" id="d_sexe"><option value="h">Homme</option><option value="f">Femme</option></select></div>
     <div><label class="f">Âge</label><input class="f" id="d_age" inputmode="numeric" value="${d.age}"></div>
     <div><label class="f">Poids (kg)</label><input class="f" id="d_poids" inputmode="decimal" value="${d.poids}"></div>
     <div><label class="f">Taille (cm)</label><input class="f" id="d_taille" inputmode="numeric" value="${d.taille}"></div></div>
     <label class="f">Activité (hors musculation comprise)</label><select class="f" id="d_act">
      <option value="1.375">Légère — 2-3 séances, métier assis</option><option value="1.55">Modérée — 3-5 séances</option><option value="1.725">Élevée — 6 séances ou métier physique</option></select>
     <label class="f">Objectif</label><select class="f" id="d_obj"><option value="recompo">Recomposition (perdre du gras, garder/prendre du muscle)</option><option value="seche">Sèche</option><option value="masse">Prise de masse propre</option></select>
     <button class="btn block" style="margin-top:14px" onclick="saveDiet()">Calculer mon plan</button></div>
     ${dietResult(d)}`;
  } else if(t==='plan'){
    const r=calc(d);
    body=`<div class="seg"><button class="${!state.rest?'on':''}" onclick="state.rest=false;render()">Jour training · ${r.train} kcal</button><button class="${state.rest?'on':''}" onclick="state.rest=true;render()">Jour repos · ${r.rest} kcal</button></div>
     <div class="card">${planHTML(state.rest?r.rest:r.train, r)}</div>
     <div class="card sm mut">Les quantités sont ajustées automatiquement à tes besoins. Remplace librement : poulet ↔ dinde / poisson blanc, riz ↔ pâtes / patate douce, saumon ↔ thon / bœuf maigre.</div>`;
  } else {
    body=`<div class="card"><h3 style="margin-top:0">Principes clés</h3><ul style="padding-left:18px;margin:0">
      <li><b>Protéines</b> réparties sur 4 repas (25-40 g chacun), c'est la priorité en recomposition.</li>
      <li><b>Glucides</b> concentrés autour de l'entraînement (repas d'avant et d'après).</li>
      <li><b>Lipides</b> jamais trop bas (≥ 0,8 g/kg) pour l'équilibre hormonal.</li>
      <li><b>Hydratation</b> : ~35 ml/kg/jour, plus les jours d'entraînement.</li>
      <li><b>Fibres</b> : légumes à chaque repas principal.</li>
      <li><b>Ajuster</b> toutes les 2 semaines selon la balance et le tour de taille (±100-150 kcal).</li></ul></div>
     <div class="card"><h3 style="margin-top:0">Compléments utiles (optionnels)</h3><ul style="padding-left:18px;margin:0">
      <li>Whey : pratique pour atteindre le quota de protéines.</li><li>Créatine monohydrate : 3-5 g/jour, tous les jours.</li>
      <li>Vitamine D3 + K2 et magnésium : surtout en hiver.</li></ul>
      <p class="mut sm">En cas de traitement ou de problème de santé, demande l'avis de ton médecin.</p></div>`;
  }
  $('#app').innerHTML=`<h2>Nutrition</h2>
   <div class="seg"><button class="${t==='journal'?'on':''}" onclick="state.dietTab='journal';render()">Journal</button><button class="${t==='calc'?'on':''}" onclick="state.dietTab='calc';render()">Mes besoins</button><button class="${t==='plan'?'on':''}" onclick="state.dietTab='plan';render()">Plan repas</button><button class="${t==='info'?'on':''}" onclick="state.dietTab='info';render()">Conseils</button></div>${body}`;
  if(t==='calc'){$('#d_sexe').value=d.sexe;$('#d_act').value=String(d.act);$('#d_obj').value=d.obj;}
}
function calc(d){
  const bmr = 10*d.poids + 6.25*d.taille - 5*d.age + (d.sexe==='h'?5:-161);
  const tdee = bmr*d.act;
  const k = {recompo:[1.0,0.85],seche:[0.85,0.78],masse:[1.12,1.05]}[d.obj];
  const train=Math.round(tdee*k[0]/10)*10, rest=Math.round(tdee*k[1]/10)*10;
  const prot=Math.round(d.poids*(d.obj==='masse'?1.8:2.1)), fat=Math.round(d.poids*0.9);
  const carbs=c=>Math.max(50,Math.round((c-prot*4-fat*9)/4));
  return {bmr:Math.round(bmr),tdee:Math.round(tdee),train,rest,prot,fat,cT:carbs(train),cR:carbs(rest),eau:(d.poids*0.035).toFixed(1)};
}
function dietResult(d){
  const r=calc(d);
  return `<div class="card"><div class="mut sm">Métabolisme de base ${r.bmr} kcal · Maintien ${r.tdee} kcal</div>
   <h3>Jour d'entraînement</h3><div class="kpi"><div><b>${r.train}</b><span>kcal</span></div><div><b>${r.prot} g</b><span>Protéines</span></div><div><b>${r.cT} g</b><span>Glucides</span></div><div><b>${r.fat} g</b><span>Lipides</span></div></div>
   <h3>Jour de repos</h3><div class="kpi"><div><b>${r.rest}</b><span>kcal</span></div><div><b>${r.prot} g</b><span>Protéines</span></div><div><b>${r.cR} g</b><span>Glucides</span></div><div><b>${r.fat} g</b><span>Lipides</span></div></div>
   <p class="mut sm" style="margin-bottom:0">Eau : ~${r.eau} L/jour. Les glucides varient selon le jour (cyclage) ; protéines et lipides restent stables.</p></div>`;
}
function saveDiet(){
  const d={sexe:$('#d_sexe').value,age:+$('#d_age').value||35,poids:+$('#d_poids').value.replace(',','.')||80,taille:+$('#d_taille').value||178,act:+$('#d_act').value,obj:$('#d_obj').value};
  DB.set('diet',d); render(); toast('Plan mis à jour');
}
function planHTML(kcal, r){
  let tot=[0,0,0,0];
  const html=MEALS.map(m=>{
    const base=m.items.reduce((a,[f,g])=>a+FOODS[f][0]*g/100,0);
    const f=(kcal*m.pct)/base;
    const items=m.items.map(([n,g])=>{const q=Math.round(g*f/5)*5;const v=FOODS[n];tot=tot.map((t,i)=>t+v[i]*q/100);return `<li>${esc(n)} — ${q} g</li>`;}).join('');
    return `<div class="meal"><div class="h"><span>${m.n}</span><span class="mut">${Math.round(kcal*m.pct)} kcal</span></div><ul>${items}</ul></div>`;
  }).join('');
  const gapP=Math.round(r.prot-tot[1]);
  return html+`<div class="meal"><div class="kpi"><div><b>${Math.round(tot[0])}</b><span>kcal</span></div><div><b>${Math.round(tot[1])} g</b><span>P</span></div><div><b>${Math.round(tot[2])} g</b><span>G</span></div><div><b>${Math.round(tot[3])} g</b><span>L</span></div></div>
   ${gapP>8?`<p class="hint">Il manque ~${gapP} g de protéines : ajoute ${Math.round(gapP/0.78/5)*5} g de whey (ou un skyr) à la collation.</p>`:''}</div>`;
}

function vSuivi(){
  const w=DB.get('weights',[]), h=DB.get('hist',[]);
  const names=[...new Set(h.flatMap(s=>s.ex.filter(e=>e.sets.some(x=>x.done)).map(e=>e.n)))];
  const sel=state.track||names[0];
  $('#app').innerHTML=`<h2>Suivi</h2>
   <div class="card"><b>Poids de corps</b><div class="row" style="margin-top:8px"><input class="f grow" id="w_in" inputmode="decimal" placeholder="kg">
    <button class="btn" onclick="addW()">Ajouter</button></div>${chart(w.map(x=>x.kg),w.map(x=>x.d))}</div>
   <div class="card"><b>Charges</b>${names.length?`<div class="seg" style="margin-top:8px"><button class="${!state.e1rm?'on':''}" onclick="state.e1rm=false;render()">Charge max</button><button class="${state.e1rm?'on':''}" onclick="state.e1rm=true;render()">1RM estimé</button></div><select class="f" style="margin-top:8px" onchange="state.track=this.value;render()">${names.map(n=>`<option ${n===sel?'selected':''}>${esc(n)}</option>`).join('')}</select>
    ${(()=>{const pts=h.filter(s=>s.ex.some(e=>e.n===sel)).map(s=>{const e=s.ex.find(e=>e.n===sel);const ds=e.sets.filter(x=>x.done);return {d:s.date,v:state.e1rm?Math.round(Math.max(0,...ds.map(x=>(+x.kg||0)*(1+(+x.reps||0)/30)))):Math.max(0,...ds.map(x=>+x.kg||0))}});return chart(pts.map(p=>p.v),pts.map(p=>p.d));})()}`
    :'<div class="empty">Termine une séance pour voir tes courbes.</div>'}</div>
   <div class="card"><b>Historique</b>${h.length?h.slice().reverse().slice(0,15).map(s=>`<div class="meal"><div class="h"><span>${esc(PROGS[s.prog]?.name||'')} — ${esc(s.day)}</span><span class="mut">${s.date}</span></div>
     <div class="mut sm">${s.ex.filter(e=>e.sets.some(x=>x.done)).length} exercices · ${s.ex.reduce((a,e)=>a+e.sets.filter(x=>x.done).length,0)} séries</div></div>`).join(''):'<div class="empty">Aucune séance pour l\'instant.</div>'}</div>
   <button class="btn ghost block" onclick="exportData()">Copier une sauvegarde de mes données</button>`;
}
function addW(){const v=parseFloat($('#w_in').value.replace(',','.'));if(!v)return;const w=DB.get('weights',[]);w.push({d:today(),kg:v});DB.set('weights',w);render();}
function chart(vals,labels){
  if(vals.length<2)return `<div class="empty sm">${vals.length?'Encore une mesure pour afficher la courbe.':'Pas encore de données.'}</div>`;
  const mn=Math.min(...vals),mx=Math.max(...vals),rg=(mx-mn)||1,W=300,H=120;
  const pts=vals.map((v,i)=>[10+i*(W-20)/(vals.length-1),H-15-(v-mn)/rg*(H-35)]);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><polyline fill="none" stroke="var(--acc)" stroke-width="2.5" points="${pts.map(p=>p.join(',')).join(' ')}"/>
   ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="var(--acc)"/>`).join('')}
   <text x="10" y="${H-2}" fill="#9aa1ad" font-size="10">${labels[0]}</text><text x="${W-10}" y="${H-2}" fill="#9aa1ad" font-size="10" text-anchor="end">${labels.at(-1)}</text>
   <text x="${W-10}" y="12" fill="#eef0f4" font-size="11" text-anchor="end">${vals.at(-1)} kg</text></svg>`;
}
function exportData(){const data=JSON.stringify({hist:DB.get('hist',[]),weights:DB.get('weights',[]),diet:DB.get('diet',null)});
  navigator.clipboard?.writeText(data).then(()=>toast('Sauvegarde copiée'),()=>toast('Copie impossible ici'));}

function toast(m){const t=document.createElement('div');t.textContent=m;t.style.cssText='position:fixed;top:calc(env(safe-area-inset-top) + 60px);left:50%;transform:translateX(-50%);background:#2a2f3a;color:#fff;padding:10px 16px;border-radius:99px;z-index:9;font-size:14px';document.body.appendChild(t);setTimeout(()=>t.remove(),1800);}
