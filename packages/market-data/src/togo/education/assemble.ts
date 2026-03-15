import type { EducationModule } from "../../types";

export const TOGO_EDUCATION_ASSEMBLE: EducationModule = {
  phase: "ASSEMBLE",
  title: "Constituer l'equipe",
  summary:
    "Recrutez un chef de chantier fiable, des macons qualifies et des artisans specialises. Au Togo, la qualite du chef de chantier determine la qualite de la construction.",
  content: `Au Togo, la construction residentielle ne fonctionne pas avec des entreprises generales comme en Occident. Le modele le plus courant est l'autoconstruction supervisee: le proprietaire gere directement le chantier ou delegue a un chef de chantier (aussi appele conducteur de travaux ou maitre d'oeuvre) qui recrute et supervise les ouvriers au jour le jour.

Le chef de chantier est la personne la plus importante de votre projet. C'est lui qui embauche les macons, ferrailleurs, menuisiers et manoeuvres, supervise la qualite du travail, gere l'approvisionnement en materiaux et rend compte de l'avancement. Un bon chef de chantier a de l'experience, des references verifiables, et une reputation a proteger. Trouvez-le par le bouche-a-oreille: visitez des chantiers termines dans votre quartier, demandez aux proprietaires satisfaits qui a dirige les travaux.

Les macons (maceons ou bosseurs) sont generalement payes a la tache ou a la journee. Le tarif journalier varie de 3 000 a 7 000 FCFA pour un macon qualifie et de 1 500 a 3 000 FCFA pour un manoeuvre. Les ferrailleurs (specialistes du ferraillage des poteaux et poutres) sont cruciaux pour la solidite de la structure: ne lesinez pas sur leur competence. Un ferraillage mal fait compromet toute la structure.

Les artisans specialises interviennent a des phases specifiques: le plombier pour les canalisations (avant le coulage de la dalle si encastrees), l'electricien pour le cablage (apres le gros oeuvre), le carreleur, le peintre et le menuisier (bois ou aluminium) pour les finitions. Au Togo, ces corps de metier n'ont generalement pas de certification formelle: fiez-vous aux realisations anterieures et aux recommandations.

Si vous etes dans la diaspora, le chef de chantier est votre principal interlocuteur. Etablissez un protocole de communication clair: rapport d'avancement hebdomadaire avec photos, validation avant chaque depense majeure, et acces a un journal de chantier. La confiance est essentielle mais le controle l'est tout autant. Envisagez de mandater un architecte ou un bureau de controle independant pour des visites periodiques de verification.`,
  keyDecisions: [
    "Chef de chantier: recrutement sur recommandation avec verification des references",
    "Mode de gestion: autoconstruction directe, delegation au chef de chantier, ou maitrise d'oeuvre par un architecte",
    "Mode de remuneration: paiement a la tache, a la journee ou forfaitaire par phase",
    "Protocole de suivi pour la diaspora: frequence des rapports, photos, validation des depenses",
    "Bureau de controle independant: engagement optionnel mais fortement recommande",
  ],
  commonMistakes: [
    "Recruter un chef de chantier sans verifier ses realisations anterieures",
    "Donner des avances trop importantes sans echeancier lie a l'avancement reel",
    "Ne pas formaliser les accords par ecrit (meme un accord simple sur papier libre)",
    "Changer de chef de chantier en cours de projet sans motif serieux",
    "Recruter les artisans specialises trop tard et devoir attendre leur disponibilite",
    "Ne pas prevoir de surveillance independante quand on est en diaspora",
    "Payer les ouvriers sans verifier la qualite du travail effectue",
  ],
  proTips: [
    "Visitez au moins 3 chantiers termines par votre chef de chantier potentiel",
    "Redigez un accord ecrit precisant: taches, delais, prix, conditions de paiement et penalites de retard",
    "Payez par phase achevee et verifiee, jamais en totalite a l'avance",
    "Pour la diaspora: engagez un architecte pour des visites de controle bimensuelles (100 000-200 000 FCFA/visite)",
    "Demandez au chef de chantier un carnet de chantier avec photos quotidiennes envoyees par WhatsApp",
    "Prevoyez un stock de materiaux sur site pour eviter les arrets de chantier lies aux ruptures d'approvisionnement",
  ],
};
