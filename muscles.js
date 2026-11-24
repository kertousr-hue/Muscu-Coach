/* Programme par groupe musculaire : 10 groupes, 113 mouvements, split « un muscle par jour ». */
(function(){
const RG={'Biceps':['Barbell_Curl','Dumbbell_Alternate_Bicep_Curl','Hammer_Curls','Incline_Hammer_Curls','Preacher_Curl'],
 'Triceps':['Triceps_Pushdown','EZ-Bar_Skullcrusher','Close-Grip_Barbell_Bench_Press','Bench_Dips'],
 'Quadriceps':['Barbell_Full_Squat','Goblet_Squat','Hack_Squat','Leg_Press','Dumbbell_Lunges','Split_Squat_with_Dumbbells','Leg_Extensions'],
 'Ischios & fessiers':['Romanian_Deadlift','Stiff-Legged_Barbell_Deadlift','Barbell_Hip_Thrust','Lying_Leg_Curls'],
 'Mollets':['Standing_Calf_Raises']};
Object.entries(RG).forEach(([g,ids])=>ids.forEach(id=>{const e=EX.find(x=>x.id===id); if(e) e.g=g;}));
EX.push(
// --- Pectoraux ---
{id:'Decline_Barbell_Bench_Press',n:'Développé décliné barre',g:'Pectoraux',eq:'Barre + banc décliné',p:['pecs'],s:['triceps','delt_a'],
 st:['Jambes bloquées, banc décliné de 15 à 30°','Descendre la barre au bas des pecs','Pousser en gardant les omoplates serrées'],tip:'Moins de stress sur les épaules qu\'à plat.',
 an:'Cible surtout la partie basse (sternale) du grand pectoral.'},
{id:'Machine_Bench_Press',n:'Développé machine',g:'Pectoraux',eq:'Machine',p:['pecs'],s:['triceps','delt_a'],
 st:['Poignées à hauteur du milieu des pecs','Pousser sans verrouiller les coudes','Revenir lentement jusqu\'à l\'étirement'],tip:'Idéal pour aller près de l\'échec en sécurité.',
 an:'Trajectoire guidée : toute l\'énergie va dans les pectoraux, sans stabilisation.'},
{id:'Smith_Machine_Incline_Bench_Press',n:'Développé incliné Smith machine',g:'Pectoraux',eq:'Smith machine',p:['pecs'],s:['delt_a','triceps'],
 st:['Banc à 30° sous la barre','Descendre sous les clavicules','Pousser verticalement'],tip:'Pratique sans partenaire grâce aux sécurités.',
 an:'Accent sur le faisceau claviculaire (haut des pecs).'},
{id:'Incline_Dumbbell_Flyes',n:'Écarté incliné haltères',g:'Pectoraux',eq:'Haltères + banc',p:['pecs'],s:['delt_a'],
 st:['Banc à 30°, coudes légèrement fléchis','Ouvrir en arc jusqu\'à l\'étirement','Refermer au-dessus du haut des pecs'],tip:'Descente lente, charge modérée.',
 an:'Étirement maximal du haut des pectoraux.'},
{id:'Decline_Dumbbell_Flyes',n:'Écarté décliné haltères',g:'Pectoraux',eq:'Haltères + banc décliné',p:['pecs'],s:[],
 st:['Banc décliné, jambes bloquées','Ouvrir en arc','Refermer en serrant les pecs'],tip:'Garde les coudes fixes.',
 an:'Isole la partie basse du grand pectoral.'},
{id:'Butterfly',n:'Pec deck (butterfly)',g:'Pectoraux',eq:'Machine',p:['pecs'],s:['delt_a'],
 st:['Dos plaqué, poignées à hauteur des épaules','Rapprocher les bras devant soi','Serrer 1 s, revenir lentement'],tip:'Parfait en fin de séance pour la congestion.',
 an:'Adduction pure du bras : isolation des pectoraux en contraction.'},
{id:'Low_Cable_Crossover',n:'Écarté poulie basse',g:'Pectoraux',eq:'Poulie',p:['pecs'],s:['delt_a'],
 st:['Poulies en bas, un pas en avant','Monter les mains en arc vers le menton','Serrer en haut'],tip:'Mains qui se touchent presque en haut.',
 an:'Trajectoire du bas vers le haut : vise le haut des pectoraux.'},
// --- Dos ---
{id:'T-Bar_Row_with_Handle',n:'Rowing T-bar',g:'Dos',eq:'Barre T',p:['upback','lats'],s:['biceps','delt_p','lowback'],
 st:['Buste penché à ~45°, dos plat','Tirer la poignée vers le bas du sternum','Serrer les omoplates, redescendre contrôlé'],warn:'Dos qui s\'arrondit = charge trop lourde.',
 an:'Épaisseur du dos : rhomboïdes, trapèzes moyens et grand dorsal.'},
{id:'Close-Grip_Front_Lat_Pulldown',n:'Tirage vertical prise serrée',g:'Dos',eq:'Poulie haute',p:['lats'],s:['biceps','upback'],
 st:['Prise serrée, buste légèrement incliné','Tirer vers le haut de la poitrine','Remonter jusqu\'à l\'étirement complet'],tip:'Coudes vers les hanches.',
 an:'Plus grande amplitude qu\'en prise large : bon étirement du grand dorsal.'},
{id:'Underhand_Cable_Pulldowns',n:'Tirage vertical supination',g:'Dos',eq:'Poulie haute',p:['lats'],s:['biceps'],
 st:['Paumes vers soi, largeur d\'épaules','Tirer la barre au haut de la poitrine','Remonter lentement'],tip:'Bonne alternative aux tractions supination.',
 an:'Le bras descend le long du corps : grand dorsal (partie basse) et biceps.'},
{id:'Straight-Arm_Pulldown',n:'Pull-over poulie bras tendus',g:'Dos',eq:'Poulie haute',p:['lats'],s:['triceps'],
 st:['Debout, bras presque tendus','Descendre la barre jusqu\'aux cuisses en arc','Remonter jusqu\'à l\'étirement'],tip:'Pré-fatigue parfaite avant les tractions.',
 an:'Isolation du grand dorsal, sans les biceps.'},
{id:'Seated_One-arm_Cable_Pulley_Rows',n:'Rowing poulie un bras',g:'Dos',eq:'Poulie basse',p:['lats','upback'],s:['biceps','delt_p'],
 st:['Assis, une poignée','Tirer vers la hanche en tournant légèrement','Étirer complètement vers l\'avant'],tip:'Travaille chaque côté séparément.',
 an:'Amplitude maximale du grand dorsal grâce à la rotation du tronc.'},
{id:'Inverted_Row',n:'Rowing inversé',g:'Dos',eq:'Barre basse / Smith',p:['upback','lats'],s:['biceps','delt_p'],
 st:['Suspendu sous une barre, corps gainé','Tirer la poitrine vers la barre','Redescendre contrôlé'],tip:'Pieds surélevés pour plus de difficulté.',
 an:'Version poids du corps du rowing : milieu du dos.'},
{id:'Hyperextensions_Back_Extensions',n:'Extensions lombaires (banc 45°)',g:'Dos',eq:'Banc à lombaires',p:['lowback'],s:['glutes','hams'],
 st:['Hanches calées sur le coussin','Descendre le buste dos plat','Remonter jusqu\'à l\'alignement, pas plus'],warn:'Ne pas hyper-cambrer en haut.',
 an:'Renforce les érecteurs du rachis, protège le dos au squat et au soulevé.'},
{id:'Dumbbell_Shrug',n:'Shrugs haltères',g:'Dos',eq:'Haltères',p:['traps'],s:['forearm'],
 st:['Debout, haltères le long du corps','Monter les épaules vers les oreilles','Tenir 1 s, redescendre lentement'],tip:'Ne roule pas les épaules.',
 an:'Trapèzes supérieurs.'},
// --- Épaules ---
{id:'Arnold_Dumbbell_Press',n:'Développé Arnold',g:'Épaules',eq:'Haltères',p:['delt_a'],s:['delt_l','triceps'],
 st:['Haltères devant le visage, paumes vers soi','Pousser en tournant les paumes vers l\'avant','Redescendre en refaisant la rotation'],tip:'Mouvement fluide, charge modérée.',
 an:'La rotation sollicite les faisceaux antérieur et latéral.'},
{id:'Machine_Shoulder_Military_Press',n:'Développé épaules machine',g:'Épaules',eq:'Machine',p:['delt_a'],s:['delt_l','triceps'],
 st:['Poignées à hauteur des épaules','Pousser au-dessus de la tête','Redescendre lentement'],tip:'Sûr pour pousser près de l\'échec.',
 an:'Deltoïdes antérieurs et triceps, trajectoire guidée.'},
{id:'Cable_Seated_Lateral_Raise',n:'Élévations latérales poulie',g:'Épaules',eq:'Poulie basse',p:['delt_l'],s:['traps'],
 st:['Poignée dans la main opposée à la poulie','Monter le bras sur le côté jusqu\'à l\'horizontale','Redescendre lentement'],tip:'Tension constante, même en bas.',
 an:'Deltoïde latéral chargé sur toute l\'amplitude, y compris en bas.'},
{id:'One-Arm_Incline_Lateral_Raise',n:'Élévation latérale couché incliné',g:'Épaules',eq:'Haltère + banc',p:['delt_l'],s:[],
 st:['Couché sur le côté sur un banc incliné','Monter le bras jusqu\'à la verticale','Redescendre contrôlé'],tip:'Charge légère.',
 an:'Charge le deltoïde latéral en position étirée.'},
{id:'Upright_Barbell_Row',n:'Rowing menton',g:'Épaules',eq:'Barre / barre EZ',p:['delt_l','traps'],s:['biceps'],
 st:['Prise largeur d\'épaules ou un peu plus','Monter la barre en menant avec les coudes','S\'arrêter à hauteur de la poitrine'],warn:'Prise large et pas au-dessus de la poitrine pour épargner les épaules.',
 an:'Deltoïdes latéraux et trapèzes.'},
{id:'Reverse_Machine_Flyes',n:'Oiseau machine (reverse pec deck)',g:'Épaules',eq:'Machine',p:['delt_p'],s:['upback'],
 st:['Face à la machine, bras tendus devant','Écarter les bras vers l\'arrière','Serrer 1 s, revenir lentement'],tip:'Ne tire pas avec le dos.',
 an:'Isolation du deltoïde postérieur.'},
{id:'Seated_Bent-Over_Rear_Delt_Raise',n:'Oiseau assis',g:'Épaules',eq:'Haltères',p:['delt_p'],s:['upback','traps'],
 st:['Assis au bout du banc, buste sur les cuisses','Écarter les bras sur les côtés','Redescendre lentement'],tip:'Pouces légèrement vers le bas.',
 an:'Arrière d\'épaule, sans tricher avec le bas du dos.'},
// --- Biceps ---
{id:'EZ-Bar_Curl',n:'Curl barre EZ',g:'Biceps',eq:'Barre EZ',p:['biceps'],s:['forearm'],
 st:['Prise sur les parties inclinées','Monter sans bouger les coudes','Descendre en 2-3 s'],tip:'Plus confortable pour les poignets que la barre droite.',
 an:'Biceps et brachial, poignets en position semi-neutre.'},
{id:'Incline_Dumbbell_Curl',n:'Curl incliné haltères',g:'Biceps',eq:'Haltères + banc',p:['biceps'],s:['forearm'],
 st:['Banc à 45-60°, bras pendants','Monter en supination','Redescendre jusqu\'à l\'étirement complet'],tip:'Charge plus légère qu\'au curl debout.',
 an:'Bras en arrière : longue portion du biceps en étirement.'},
{id:'Concentration_Curls',n:'Curl concentré',g:'Biceps',eq:'Haltère',p:['biceps'],s:[],
 st:['Assis, coude calé contre l\'intérieur de la cuisse','Monter en serrant le biceps','Redescendre lentement'],tip:'Pause 1 s en haut.',
 an:'Isolation maximale du biceps en contraction.'},
{id:'Spider_Curl',n:'Spider curl',g:'Biceps',eq:'Barre EZ / haltères + banc',p:['biceps'],s:[],
 st:['Ventre sur un banc incliné, bras verticaux','Monter sans bouger les coudes','Serrer en haut'],tip:'Aucune triche possible.',
 an:'Biceps en contraction maximale en haut du mouvement.'},
{id:'Standing_Biceps_Cable_Curl',n:'Curl poulie basse',g:'Biceps',eq:'Poulie basse',p:['biceps'],s:['forearm'],
 st:['Face à la poulie, coudes collés','Monter la barre','Redescendre en résistant'],tip:'Tension constante.',
 an:'La poulie garde le biceps chargé sur toute l\'amplitude.'},
{id:'High_Cable_Curls',n:'Curl poulie haute (double biceps)',g:'Biceps',eq:'Poulie haute ×2',p:['biceps'],s:[],
 st:['Entre deux poulies hautes, bras à l\'horizontale','Ramener les poignées vers les oreilles','Revenir lentement'],tip:'Coudes fixes à hauteur des épaules.',
 an:'Pic de contraction du biceps (courte portion).'},
{id:'Cable_Hammer_Curls_-_Rope_Attachment',n:'Curl marteau corde',g:'Biceps',eq:'Poulie + corde',p:['biceps','forearm'],s:[],
 st:['Corde à la poulie basse, prise neutre','Monter sans bouger les coudes','Redescendre contrôlé'],tip:'Écarte la corde en haut.',
 an:'Brachial et brachio-radial : épaisseur du bras.'},
// --- Triceps ---
{id:'Triceps_Pushdown_-_Rope_Attachment',n:'Extension triceps corde',g:'Triceps',eq:'Poulie + corde',p:['triceps'],s:[],
 st:['Coudes collés au corps','Pousser vers le bas en écartant la corde','Remonter jusqu\'à 90°'],tip:'Serre 1 s en bas.',
 an:'Isolation du triceps, accent sur le chef latéral.'},
{id:'Cable_Rope_Overhead_Triceps_Extension',n:'Extension triceps au-dessus de la tête (poulie)',g:'Triceps',eq:'Poulie + corde',p:['triceps'],s:[],
 st:['Dos à la poulie, corde derrière la tête','Tendre les bras vers l\'avant et le haut','Revenir jusqu\'à l\'étirement'],tip:'Coudes fixes, près de la tête.',
 an:'Bras au-dessus de la tête : longue portion du triceps étirée.'},
{id:'Standing_Dumbbell_Triceps_Extension',n:'Extension triceps haltère au-dessus de la tête',g:'Triceps',eq:'Haltère',p:['triceps'],s:[],
 st:['Haltère tenu à deux mains au-dessus de la tête','Descendre derrière la nuque','Tendre les bras'],tip:'Gainage, ne cambre pas.',
 an:'Étirement de la longue portion du triceps.'},
{id:'Seated_Triceps_Press',n:'Extension triceps assis',g:'Triceps',eq:'Haltère + banc',p:['triceps'],s:[],
 st:['Assis dos calé, haltère au-dessus de la tête','Fléchir les coudes derrière la tête','Remonter'],tip:'Plus stable que debout.',
 an:'Longue portion du triceps en étirement.'},
{id:'Dips_-_Triceps_Version',n:'Dips triceps',g:'Triceps',eq:'Barres parallèles',p:['triceps'],s:['pecs','delt_a'],
 st:['Buste droit, coudes près du corps','Descendre jusqu\'à 90°','Pousser jusqu\'à l\'extension'],warn:'Pas trop bas si gêne à l\'épaule.',
 an:'Exercice de base du triceps, lourd et efficace.'},
{id:'Tricep_Dumbbell_Kickback',n:'Kickback haltère',g:'Triceps',eq:'Haltère + banc',p:['triceps'],s:[],
 st:['Buste penché, bras collé au corps','Tendre l\'avant-bras vers l\'arrière','Serrer 1 s'],tip:'Charge légère, contraction parfaite.',
 an:'Triceps en contraction maximale.'},
// --- Avant-bras ---
{id:'Palms-Up_Barbell_Wrist_Curl_Over_A_Bench',n:'Curl poignets (paumes vers le haut)',g:'Avant-bras',eq:'Barre + banc',p:['forearm'],s:[],
 st:['Avant-bras sur le banc, poignets dans le vide','Laisser la barre rouler vers les doigts','Fléchir les poignets vers le haut'],tip:'Séries longues de 15 à 20.',
 an:'Fléchisseurs des doigts et du poignet.'},
{id:'Palms-Down_Wrist_Curl_Over_A_Bench',n:'Extension poignets (paumes vers le bas)',g:'Avant-bras',eq:'Barre + banc',p:['forearm'],s:[],
 st:['Avant-bras sur le banc, paumes vers le sol','Monter le dos de la main','Redescendre lentement'],tip:'Charge légère.',
 an:'Extenseurs du poignet : équilibre et prévention du tennis-elbow.'},
{id:'Reverse_Barbell_Curl',n:'Curl inversé',g:'Avant-bras',eq:'Barre / barre EZ',p:['forearm','biceps'],s:[],
 st:['Prise en pronation, paumes vers le sol','Monter sans bouger les coudes','Redescendre lentement'],tip:'Poignets alignés.',
 an:'Brachio-radial et brachial.'},
{id:'Farmers_Walk',n:'Marche du fermier',g:'Avant-bras',eq:'Haltères lourds',p:['forearm','traps'],s:['abs','glutes'],
 st:['Un haltère lourd dans chaque main','Marcher à petits pas, buste droit','30 à 40 m ou 30 s'],tip:'Excellent pour la poigne.',
 an:'Grip, trapèzes et gainage de tout le tronc.'},
// --- Quadriceps ---
{id:'Front_Barbell_Squat',n:'Squat avant (front squat)',g:'Quadriceps',eq:'Barre + rack',p:['quads'],s:['glutes','abs'],
 st:['Barre sur l\'avant des épaules, coudes hauts','Descendre buste droit','Pousser dans le milieu du pied'],tip:'Coudes hauts tout le long.',
 an:'Buste plus vertical : accent sur les quadriceps, moins de stress lombaire.'},
{id:'Smith_Machine_Squat',n:'Squat Smith machine',g:'Quadriceps',eq:'Smith machine',p:['quads','glutes'],s:['hams'],
 st:['Pieds légèrement en avant de la barre','Descendre cuisses parallèles','Remonter sans verrouiller'],tip:'Pieds avancés = moins de stress sur les genoux.',
 an:'Squat guidé : quadriceps et fessiers.'},
{id:'Barbell_Walking_Lunge',n:'Fentes marchées barre',g:'Quadriceps',eq:'Barre',p:['quads','glutes'],s:['hams','adduct'],
 st:['Barre sur le haut du dos','Grand pas, genou arrière près du sol','Enchaîner en avançant'],tip:'Buste droit, regard devant.',
 an:'Quadriceps, fessiers et équilibre.'},
{id:'Dumbbell_Step_Ups',n:'Step-up haltères',g:'Quadriceps',eq:'Haltères + banc / box',p:['quads','glutes'],s:['hams'],
 st:['Un pied sur le banc','Monter en poussant sur la jambe d\'appui','Redescendre lentement'],tip:'Ne pousse pas avec la jambe du bas.',
 an:'Travail unilatéral des quadriceps et fessiers.'},
{id:'Narrow_Stance_Leg_Press',n:'Presse pieds serrés',g:'Quadriceps',eq:'Machine',p:['quads'],s:['glutes'],
 st:['Pieds serrés, bas sur la plateforme','Descendre jusqu\'à 90°','Pousser sans verrouiller'],tip:'Bas du dos plaqué.',
 an:'Pieds bas et serrés : accent sur les quadriceps (vaste externe).'},
// --- Ischios & fessiers ---
{id:'Seated_Leg_Curl',n:'Leg curl assis',g:'Ischios & fessiers',eq:'Machine',p:['hams'],s:['calves'],
 st:['Genoux alignés avec l\'axe','Ramener les talons sous le siège','Remonter lentement'],tip:'Buste penché en avant = plus d\'étirement.',
 an:'Hanches fléchies : les ischios travaillent en position plus étirée qu\'allongé.'},
{id:'Glute_Ham_Raise',n:'Glute ham raise',g:'Ischios & fessiers',eq:'Banc GHR',p:['hams'],s:['glutes','calves'],
 st:['Genoux sur le coussin, pieds bloqués','Descendre le buste en contrôlant','Remonter avec les ischios'],tip:'Aide-toi des mains au début.',
 an:'Un des exercices les plus complets pour les ischios.'},
{id:'Good_Morning',n:'Good morning',g:'Ischios & fessiers',eq:'Barre',p:['hams','lowback'],s:['glutes'],
 st:['Barre sur le haut du dos, genoux souples','Pencher le buste hanches en arrière, dos plat','Remonter en poussant les hanches'],warn:'Charge légère, dos toujours plat.',
 an:'Ischios et érecteurs en étirement.'},
{id:'Sumo_Deadlift',n:'Soulevé de terre sumo',g:'Ischios & fessiers',eq:'Barre',p:['glutes','quads'],s:['hams','adduct','lowback'],
 st:['Pieds très écartés, pointes vers l\'extérieur','Prise entre les jambes, dos plat','Pousser le sol en écartant les genoux'],warn:'Échauffement sérieux.',
 an:'Fessiers, adducteurs et quadriceps, buste plus droit qu\'au classique.'},
{id:'Barbell_Glute_Bridge',n:'Pont fessier barre',g:'Ischios & fessiers',eq:'Barre',p:['glutes'],s:['hams'],
 st:['Allongé au sol, barre sur les hanches','Monter les hanches en serrant les fessiers','Tenir 1 s en haut'],tip:'Plus simple à installer que le hip thrust.',
 an:'Grand fessier en contraction.'},
{id:'Glute_Kickback',n:'Kickback fessier',g:'Ischios & fessiers',eq:'Poulie / machine',p:['glutes'],s:['hams'],
 st:['Appui stable, buste penché','Tendre la jambe vers l\'arrière','Serrer le fessier 1 s'],tip:'Ne cambre pas le bas du dos.',
 an:'Isolation du grand fessier.'},
{id:'Thigh_Abductor',n:'Machine abducteurs',g:'Ischios & fessiers',eq:'Machine',p:['glutes'],s:[],
 st:['Assis, dos calé','Écarter les jambes','Revenir lentement'],tip:'Buste penché en avant = plus de moyen fessier.',
 an:'Moyen et petit fessier : stabilité du bassin.'},
{id:'Thigh_Adductor',n:'Machine adducteurs',g:'Ischios & fessiers',eq:'Machine',p:['adduct'],s:[],
 st:['Assis, jambes écartées','Rapprocher les jambes','Revenir lentement jusqu\'à l\'étirement'],tip:'Amplitude progressive.',
 an:'Adducteurs : intérieur des cuisses.'},
// --- Mollets ---
{id:'Seated_Calf_Raise',n:'Mollets assis',g:'Mollets',eq:'Machine',p:['calves'],s:[],
 st:['Assis, genoux sous le coussin','Descendre talons bas','Monter sur la pointe, pause'],tip:'Séries de 15 à 20.',
 an:'Genoux fléchis : cible le soléaire.'},
{id:'Calf_Press_On_The_Leg_Press_Machine',n:'Mollets à la presse',g:'Mollets',eq:'Presse à cuisses',p:['calves'],s:[],
 st:['Pointes de pieds en bas de la plateforme','Laisser descendre les talons','Pousser sur la pointe'],tip:'Ne déverrouille jamais les sécurités.',
 an:'Jambes tendues : gastrocnémiens (jumeaux).'},
{id:'Donkey_Calf_Raises',n:'Mollets à l\'âne',g:'Mollets',eq:'Machine / partenaire',p:['calves'],s:[],
 st:['Buste penché, hanches fléchies','Descendre talons bas','Monter haut'],tip:'Grand étirement.',
 an:'Hanches fléchies : étirement maximal des jumeaux.'},
{id:'Standing_Dumbbell_Calf_Raise',n:'Mollets debout haltère',g:'Mollets',eq:'Haltère + marche',p:['calves'],s:[],
 st:['Sur une marche, un haltère en main','Descendre le talon','Monter sur la pointe, pause'],tip:'Une jambe à la fois à la maison.',
 an:'Gastrocnémiens, unilatéral.'},
// --- Abdos ---
{id:'Ab_Roller',n:'Roue abdominale',g:'Abdos',eq:'Roue',p:['abs'],s:['obliques','lats'],
 st:['À genoux, mains sur la roue','Rouler vers l\'avant, dos neutre','Revenir en contractant les abdos'],warn:'Ne pas creuser le bas du dos.',
 an:'Anti-extension : grand droit et transverse très sollicités.'},
{id:'Decline_Crunch',n:'Crunch décliné',g:'Abdos',eq:'Banc décliné',p:['abs'],s:['obliques'],
 st:['Pieds bloqués, banc décliné','Enrouler le buste','Redescendre lentement'],tip:'Ajoute un disque pour progresser.',
 an:'Grand droit sur une plus grande amplitude.'},
{id:'Hanging_Pike',n:'Relevé de jambes tendues (pike)',g:'Abdos',eq:'Barre fixe',p:['abs'],s:['obliques','forearm'],
 st:['Suspendu bras tendus','Monter les pieds vers la barre jambes tendues','Redescendre lentement'],tip:'Version avancée du relevé de jambes.',
 an:'Bas du grand droit et fléchisseurs de hanche.'},
{id:'Pallof_Press',n:'Pallof press',g:'Abdos',eq:'Poulie / élastique',p:['obliques','abs'],s:[],
 st:['De profil à la poulie, poignée contre la poitrine','Tendre les bras sans tourner','Revenir lentement'],tip:'Excellent pour le dos.',
 an:'Anti-rotation : obliques et transverse.'},
{id:'Side_Bridge',n:'Gainage latéral',g:'Abdos',eq:'Poids du corps',p:['obliques'],s:['abs','glutes'],
 st:['Appui sur un avant-bras, de côté','Corps aligné, hanches hautes','Tenir puis changer de côté'],tip:'30 à 45 s par côté.',
 an:'Obliques et carré des lombes.'},
{id:'Cable_Russian_Twists',n:'Rotation du buste à la poulie',g:'Abdos',eq:'Poulie',p:['obliques'],s:['abs'],
 st:['De profil, bras tendus','Tourner le buste en gardant le bassin fixe','Revenir lentement'],tip:'Mouvement contrôlé.',
 an:'Rotation chargée : obliques.'},
{id:'Dead_Bug',n:'Dead bug',g:'Abdos',eq:'Poids du corps',p:['abs'],s:['obliques'],
 st:['Sur le dos, bras et genoux à 90°','Tendre bras et jambe opposés','Revenir, alterner'],tip:'Bas du dos collé au sol.',
 an:'Gainage profond (transverse), idéal en échauffement.'},
{id:'Mountain_Climbers',n:'Mountain climbers',g:'Abdos',eq:'Poids du corps',p:['abs'],s:['delt_a','quads'],
 st:['Position de pompe','Ramener les genoux vers la poitrine en alternance','Rythme rapide, bassin stable'],tip:'Bon finisher cardio.',
 an:'Gainage dynamique + dépense calorique.'},
{id:'Air_Bike',n:'Crunch bicyclette',g:'Abdos',eq:'Poids du corps',p:['obliques','abs'],s:[],
 st:['Sur le dos, mains derrière la tête','Coude vers le genou opposé','Alterner lentement'],tip:'Ne tire pas sur la nuque.',
 an:'Obliques et grand droit.'}
);
EX.forEach(e=>EXI[e.n]=e);
GROUPS.splice(0,GROUPS.length,'Pectoraux','Dos','Épaules','Biceps','Triceps','Avant-bras','Quadriceps','Ischios & fessiers','Mollets','Abdos');
LOWER.splice(0,LOWER.length,'Quadriceps','Ischios & fessiers','Mollets');
TYPE_ETIR.push('Incline_Dumbbell_Flyes','Decline_Dumbbell_Flyes','Close-Grip_Front_Lat_Pulldown','Seated_One-arm_Cable_Pulley_Rows','One-Arm_Incline_Lateral_Raise','Incline_Dumbbell_Curl','Cable_Rope_Overhead_Triceps_Extension','Standing_Dumbbell_Triceps_Extension','Seated_Triceps_Press','Seated_Leg_Curl','Good_Morning','Donkey_Calf_Raises','Barbell_Walking_Lunge','Glute_Ham_Raise');
TYPE_CONTR.push('Butterfly','Low_Cable_Crossover','Straight-Arm_Pulldown','Dumbbell_Shrug','Cable_Seated_Lateral_Raise','Reverse_Machine_Flyes','Seated_Bent-Over_Rear_Delt_Raise','Concentration_Curls','Spider_Curl','High_Cable_Curls','Standing_Biceps_Cable_Curl','Triceps_Pushdown_-_Rope_Attachment','Tricep_Dumbbell_Kickback','Palms-Up_Barbell_Wrist_Curl_Over_A_Bench','Palms-Down_Wrist_Curl_Over_A_Bench','Barbell_Glute_Bridge','Glute_Kickback','Thigh_Abductor','Thigh_Adductor','Seated_Calf_Raise','Calf_Press_On_The_Leg_Press_Machine','Standing_Dumbbell_Calf_Raise','Decline_Crunch','Cable_Russian_Twists','Air_Bike');
FREQ.split=1;
const old={...PROGS}; Object.keys(PROGS).forEach(k=>delete PROGS[k]);
Object.assign(PROGS,{
 split:{name:'Split par muscle',info:'5 à 6 séances / semaine — un groupe musculaire par jour, tous ses mouvements',days:{
  'Pectoraux':[P('Développé couché barre',4,'6-8',150),P('Développé incliné haltères',3,'8-10',120),P('Développé décliné barre',3,'8-10',120),P('Dips pectoraux',3,'8-12',90),P('Écarté incliné haltères',3,'10-12',60),P('Pec deck (butterfly)',3,'12-15',60),P('Écarté poulie basse',2,'15',45)],
  'Dos':[P('Tractions pronation',4,'6-10',120),P('Rowing barre buste penché',4,'8',120),P('Tirage vertical prise serrée',3,'10',90),P('Rowing haltère un bras',3,'10',90),P('Pull-over poulie bras tendus',3,'12-15',60),P('Extensions lombaires (banc 45°)',3,'12-15',60),P('Shrugs haltères',3,'12',60)],
  'Épaules':[P('Développé militaire debout',4,'6-8',150),P('Développé Arnold',3,'10',90),P('Élévations latérales',4,'12-15',60),P('Élévations latérales poulie',3,'15',45),P('Rowing menton',3,'12',60),P('Oiseau machine (reverse pec deck)',3,'15',45),P('Face pull',3,'15',45)],
  'Bras':[P('Curl barre EZ',4,'8-10',90),P('Dips triceps',4,'8-10',90),P('Curl incliné haltères',3,'10-12',60),P('Extension triceps au-dessus de la tête (poulie)',3,'10-12',60),P('Curl marteau',3,'12',60),P('Extension triceps corde',3,'12-15',45),P('Curl concentré',2,'12',45),P('Curl poignets (paumes vers le haut)',2,'15-20',45)],
  'Jambes':[P('Squat barre',4,'6-8',180),P('Presse à cuisses',3,'10-12',120),P('Soulevé de terre roumain',3,'8-10',120),P('Fentes marchées barre',3,'10/jambe',90),P('Leg extension',3,'12-15',60),P('Leg curl assis',3,'12',60),P('Hip thrust',3,'10',90),P('Mollets debout',4,'12-15',60),P('Mollets assis',3,'15-20',45)],
  'Abdos (à ajouter 2-3×/sem.)':[P('Relevé de jambes suspendu',3,'12',60),P('Crunch à la poulie',3,'15',45),P('Roue abdominale',3,'10',60),P('Pallof press',3,'12/côté',45),P('Gainage latéral',2,'40 s/côté',30)]}}
},old);
})();
const GICON = {'Pectoraux':'🫁','Dos':'🔙','Épaules':'🎯','Biceps':'💪','Triceps':'🦾','Avant-bras':'✊','Quadriceps':'🦵','Ischios & fessiers':'🍑','Mollets':'🦶','Abdos':'🧱'};
const PARENT = {'Biceps':'Bras','Triceps':'Bras','Avant-bras':'Bras','Quadriceps':'Jambes','Ischios & fessiers':'Jambes','Mollets':'Jambes'};
dayList = function(prog,day){
  const sw=DB.get('swaps',{});
  const pf=DB.get('weak',[]);
  const l=PROGS[prog].days[day].map((x,i)=>({...x,n:sw[`${prog}|${day}|${i}`]||x.n,orig:x.n,k:i}));
  l.forEach(x=>{const g=EXI[x.n].g;if(pf.includes(g)||pf.includes(PARENT[g])){x.s+=1;x.prio=true;}});
  const first={}; l.forEach((x,i)=>{const g=EXI[x.n].g; if(!(g in first))first[g]=i;});
  const byGrp=a=>a.map((x,i)=>[x,i]).sort((A,B)=>first[EXI[A[0].n].g]-first[EXI[B[0].n].g]||A[1]-B[1]).map(z=>z[0]);
  return [...byGrp(l.filter(x=>x.prio)),...byGrp(l.filter(x=>!x.prio))];
};
warmup = function(list,hist){
  const groups=new Set(list.map(x=>EXI[x.n].g));
  const mob=[];
  if(groups.has('Pectoraux')||groups.has('Épaules'))mob.push('Rotations d\'épaules + face pull léger 2×15');
  if(groups.has('Dos'))mob.push('Suspension à la barre 2×20 s + tirage élastique');
  if(['Quadriceps','Ischios & fessiers','Mollets'].some(g=>groups.has(g)))mob.push('Goblet squat léger 2×8 + fentes sans charge 1×10');
  const first=list[0]; const prev=lastPerf(hist,first.n);
  const top=prev?Math.max(...prev.sets.filter(s=>s.done).map(s=>+s.kg||0)):0;
  const r=p=>Math.round(top*p/2.5)*2.5;
  const ramp= top ? `${r(.4)} kg × 8 · ${r(.6)} kg × 5 · ${r(.8)} kg × 3` : 'Barre à vide × 10, puis 2 à 3 séries en montant progressivement';
  return `<div class="card"><b>🔥 Échauffement (8-10 min)</b><ul class="sm" style="margin:6px 0 0;padding-left:18px">
   <li>5 min de cardio léger (vélo, rameur)</li>${mob.map(m=>`<li>${m}</li>`).join('')}
   <li><b>${esc(first.n)}</b> — montée : ${ramp}</li></ul></div>`;
};
vExos = function(){
  if(state.exOpen){const e=EX.find(x=>x.id===state.exOpen);
    $('#app').innerHTML=`<button class="back" onclick="state.exOpen=null;render()">‹ ${esc(e.g)}</button><h2>${esc(e.n)}</h2>${exDetail(e,'x')}`;return;}
  const g=state.exGroup;
  const tabs=`<div class="chips">${[...GROUPS,'Principes','Techniques'].map(x=>`<button class="chip ${x===g?'on':''}" onclick="state.exGroup='${x}';render()">${GICON[x]?GICON[x]+' ':''}${x}</button>`).join('')}</div>`;
  if(g==='Principes'){$('#app').innerHTML=`<h2>Les leviers de la croissance</h2>${tabs}
    ${LEVERS.map(([t,d],i)=>`<div class="card"><b>${i+1}. ${t}</b><div class="mut sm">${d}</div></div>`).join('')}
    <h3>Trois familles d'exercices</h3>${Object.values(TYPES).map(t=>`<div class="note" style="border-color:${t.c}"><b style="color:${t.c}">${t.l}</b> — ${t.t}</div>`).join('')}
    <div class="card sm mut">Pour chaque muscle, combine idéalement un exercice de base, un exercice en étirement et un exercice en contraction. Les fiches indiquent le type de chaque mouvement.</div>`;return;}
  if(g==='Techniques'){$('#app').innerHTML=`<h2>Techniques d'intensification</h2>${tabs}
    <p class="mut sm">À réserver aux semaines d'intensification (S6-S7), sur la dernière série, de préférence en isolation.</p>
    ${TECHS.map(t=>`<div class="card"><b>${t.n}</b><div class="sm" style="margin-top:4px">${t.q}</div><div class="mut sm">Quand : ${t.w}</div><div class="mut sm">Exemple : ${t.x}</div></div>`).join('')}`;return;}
  const list=EX.filter(e=>e.g===g);
  const allP=[...new Set(list.flatMap(e=>e.p))];
  $('#app').innerHTML=`<h2>Exercices par muscle <span class="mut sm">· ${EX.length} au total</span></h2>
   ${tabs}
   <div class="card">${anatomy(allP,[])}<p class="mut sm" style="margin:8px 0 0;text-align:center">Zones ciblées par le groupe « ${g} »</p></div>
   <p class="mut sm" style="margin:-4px 0 8px">${GICON[g]||''} <b>${list.length} mouvements</b> pour ce groupe, classés du plus lourd au plus ciblé. Combine 1 de base + 1 en étirement + 1 en contraction.</p>
   ${['base','etir','contr'].map(t=>{const L=list.filter(e=>exType(e)===t); if(!L.length) return '';
     return `<h3 class="grph" style="color:${TYPES[t].c}">${TYPES[t].l} <span class="mut sm">· ${L.length}</span></h3><div class="list">${L.map(e=>`<div class="item" onclick="state.exOpen='${e.id}';render()" style="cursor:pointer">
     <img class="thumb" src="${img(e.id,1)}" alt="" loading="lazy"><div class="grow"><b>${esc(e.n)}</b><div class="mut sm">${esc(e.eq)}</div><div>${e.p.map(m=>`<span class="tag p">${MUSCLES[m]}</span>`).join('')}</div></div>
     <span style="color:var(--acc)">›</span></div>`).join('')}</div>`;}).join('')}`;
};
// En-têtes par groupe musculaire dans la séance
const _vSeanceBase = vSeance;
vSeance = function(){
  _vSeanceBase();
  if(!state.day) return;
  const list=dayList(state.prog,state.day);
  list.forEach((x,i)=>{const e=EXI[x.n]; const prev=list[i-1];
    if(i&&EXI[prev.n].g===e.g&&!!prev.prio===!!x.prio) return;
    const card=$('#info_'+i)?.closest('.card'); if(!card) return;
    const h=document.createElement('h3'); h.className='grph';
    h.innerHTML=`${GICON[e.g]||''} ${esc(e.g)}<span class="mut sm"> · ${list.filter(y=>EXI[y.n].g===e.g).length} exercice(s)</span>`;
    card.before(h);});
};
(function(){const s=document.createElement('style');s.textContent='.grph{margin:18px 2px 8px;font-size:15px;display:flex;align-items:baseline;gap:6px}';document.head.appendChild(s);})();
if(!PROGS[state.prog]) state.prog='split';
