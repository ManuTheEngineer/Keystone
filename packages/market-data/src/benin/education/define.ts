import type { EducationModule } from "../../types";

export const BENIN_EDUCATION_DEFINE: EducationModule = {
  phase: "DEFINE",
  title: "Definir votre projet",
  summary:
    "Clarifiez vos objectifs, votre budget approximatif et le type de construction avant de vous engager dans des depenses.",
  content: `Construire au Benin commence bien avant le premier parpaing. La phase de definition est le moment ou vous posez les fondations intellectuelles de votre projet. Que vous soyez un membre de la diaspora planifiant depuis l'etranger ou un resident de Cotonou, Porto-Novo ou Parakou, cette etape determine le succes ou l'echec de toute la construction.

Commencez par definir clairement l'objectif de votre construction. Allez-vous habiter la maison vous-meme? La destiner a la location pour generer des revenus? Ou la construire pour la revendre? Chaque objectif implique des choix architecturaux, des materiaux et un budget radicalement differents. Une maison destinee a la location dans un quartier populaire de Cotonou n'a pas les memes exigences qu'une residence personnelle a Fidjrosse ou Cocotiers.

Evaluez honnetement votre capacite financiere totale. Au Benin, la grande majorite des constructions se font par autofinancement progressif. Vous devez estimer non seulement le cout de la construction, mais aussi le terrain, les frais d'enregistrement ANDF pour le Certificat de Propriete Fonciere, les honoraires de l'architecte, les branchements SONEB (eau) et SBEE (electricite), et une reserve d'au moins 15% pour les imprevus.

Definissez le type de batiment: maison simple (2 ou 3 chambres), villa, duplex, immeuble locatif (R+1 ou R+2). Chaque type a un cout au metre carre different. Pour une maison de standing moyen a Cotonou, prevoyez entre 200 000 et 330 000 FCFA par metre carre. Un immeuble locatif R+1 peut atteindre 380 000 FCFA/m2 avec les finitions.

Prenez le temps de visiter des chantiers en cours et des constructions recentes dans votre zone cible. Parlez aux proprietaires pour comprendre les couts reels, les pieges et les delais.`,
  keyDecisions: [
    "Objectif du batiment: habitation personnelle, location ou revente",
    "Type de construction: maison simple, villa, duplex ou immeuble R+1/R+2",
    "Zone geographique: Cotonou, Abomey-Calavi, Porto-Novo, villes secondaires ou zone rurale",
    "Budget global estimatif incluant terrain et frais annexes",
    "Calendrier realiste: construction par phases ou d'un seul tenant",
  ],
  commonMistakes: [
    "Commencer a acheter un terrain sans avoir defini le type de batiment souhaite",
    "Sous-estimer le budget total en oubliant les frais ANDF, branchements et cloture",
    "Copier le plan d'un voisin sans l'adapter a ses propres besoins et a la taille du terrain",
    "Ne pas prevoir de reserve financiere pour les imprevus (minimum 15%)",
    "Lancer le projet sans avoir au moins 40% du budget total disponible",
  ],
  proTips: [
    "Visitez au moins 5 chantiers termines recemment dans votre zone pour avoir des couts reels",
    "Consultez un architecte agree AVANT d'acheter le terrain pour verifier la constructibilite",
    "Si vous etes en diaspora, identifiez une personne de confiance sur place des cette phase",
    "Prenez en compte les deux saisons des pluies (avril-juillet et septembre-novembre) dans votre planning",
    "Renseignez-vous sur le plan d'urbanisme de votre commune aupres de la mairie",
  ],
};
