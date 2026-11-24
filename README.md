# 💪 Muscu Coach

Application web (PWA) personnelle de musculation et de nutrition, installable sur le téléphone.

**En ligne :** https://muscu-coach-chi.vercel.app

## Fonctions
- **Programmes** : Split par muscle, Push/Pull/Legs, Upper/Lower, Avancé 5 jours, Full Body — cycle de 8 semaines avec RIR, échauffement, remplacements et points faibles.
- **113 exercices** classés en 10 groupes musculaires (base / étirement / contraction), planches anatomiques, photos (Free Exercise DB) et vidéos ExerciseBank.
- **Nutrition** : calcul des besoins (Mifflin-St Jeor / Katch-McArdle, métier, séances, objectif), maintien réel adaptatif, journal détaillé (kcal, protéines, glucides, lipides, sucres, fibres), scan code-barres (Open Food Facts), photo du repas analysée par IA gratuite (Groq / Gemini).
- **Cardio** : pouls en direct par Bluetooth (ceinture ou montre qui diffuse la FC), calories de séance, et import automatique des séances de la montre OnePlus via Health Connect.
- **Sauvegarde en ligne** avec Supabase (compte, synchro multi-appareils).

## Structure
| Fichier | Rôle |
|---|---|
| `index.html` | Coque de l'appli, styles, navigation |
| `app.js` | Programmes, exercices, anatomie, séance, suivi |
| `muscles.js` | Groupes musculaires détaillés + split par muscle |
| `nutri.js` | Besoins, journal, base d'aliments, scan, photo IA |
| `detail.js` | Détail nutritionnel par aliment |
| `hr.js` | Fréquence cardiaque Bluetooth + calories |
| `montre.js` | Lien montre via Health Connect Webhook |
| `bank.js` | Vidéos ExerciseBank |
| `sync.js` | Connexion et synchronisation Supabase |
| `sw.js`, `manifest.json` | Hors-ligne et installation (PWA) |
| `supabase/schema.sql` | Schéma de la base |

## Backend (Supabase)
Fonctions Edge (les clés API restent côté serveur, dans les secrets Supabase) :
- `analyse-repas` — photo du repas → aliments, grammes, macros (`GROQ_API_KEY`, `GEMINI_API_KEY`)
- `exercices` — relais ExerciseBank (`EXERCISEBANK_API_KEY`)
- `montre` — reçoit les séances de Health Connect Webhook (clé personnelle générée dans l'appli)

Aucune clé secrète n'est stockée dans ce dépôt (seule la clé publique « publishable » Supabase est dans `sync.js`, c'est prévu pour).

## Lancer en local
```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```
