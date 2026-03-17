import type { EducationModule } from "../../types";

export const BENIN_EDUCATION_ASSEMBLE: EducationModule = {
  phase: "ASSEMBLE",
  title: "Constituer l'equipe",
  summary:
    "Recrutez un chef de chantier fiable, des macons qualifies et des artisans specialises. La qualite du chef de chantier determine la qualite de la construction.",
  content: `Au Benin, la construction residentielle fonctionne principalement par autoconstruction supervisee: le proprietaire gere directement le chantier ou delegue a un chef de chantier qui recrute et supervise les ouvriers au jour le jour. Les entreprises generales de construction existent a Cotonou mais sont plus couteuses.

Le chef de chantier est la personne la plus importante de votre projet. C'est lui qui embauche les macons, ferrailleurs et manoeuvres, supervise la qualite, gere l'approvisionnement et rend compte de l'avancement. Trouvez-le par le bouche-a-oreille: visitez des chantiers termines, demandez aux proprietaires satisfaits.

Les macons sont payes a la tache ou a la journee. Le tarif journalier varie de 3 000 a 7 000 FCFA pour un macon qualifie et de 1 500 a 3 000 FCFA pour un manoeuvre. Les ferrailleurs sont cruciaux pour la solidite de la structure: ne lesinez pas sur leur competence.

Les artisans specialises interviennent a des phases specifiques: le plombier (avant le dallage pour les canalisations encastrees), l'electricien (apres le gros oeuvre), le carreleur, le peintre et le menuisier pour les finitions.

Pour les materiaux, Cotonou offre un bon approvisionnement via le marche Dantokpa, les quincailleries de Ganhi, et les depots de materiaux le long de la route de l'aeroport et a Godomey. Les ciments NOCIBE, SCB et Dangote sont les principales marques disponibles. Comparez toujours les prix entre plusieurs fournisseurs.

Si vous etes en diaspora, etablissez un protocole de communication clair avec votre chef de chantier: rapport hebdomadaire avec photos par WhatsApp, validation avant chaque depense majeure. Envisagez un architecte pour des visites de controle periodiques.`,
  keyDecisions: [
    "Chef de chantier: recrutement sur recommandation avec verification des references",
    "Mode de gestion: autoconstruction directe ou delegation au chef de chantier",
    "Mode de remuneration: paiement a la tache, a la journee ou forfaitaire par phase",
    "Protocole de suivi pour la diaspora: frequence des rapports, photos, validation",
    "Bureau de controle independant: optionnel mais recommande",
  ],
  commonMistakes: [
    "Recruter un chef de chantier sans verifier ses realisations anterieures",
    "Donner des avances trop importantes sans echeancier lie a l'avancement",
    "Ne pas formaliser les accords par ecrit",
    "Changer de chef de chantier en cours de projet sans motif serieux",
    "Recruter les artisans specialises trop tard",
    "Ne pas prevoir de surveillance independante quand on est en diaspora",
  ],
  proTips: [
    "Visitez au moins 3 chantiers termines par votre chef de chantier potentiel",
    "Redigez un accord ecrit precisant taches, delais, prix et conditions de paiement",
    "Payez par phase achevee et verifiee, jamais en totalite a l'avance",
    "Pour la diaspora: engagez un architecte pour des visites de controle bimensuelles",
    "Demandez un carnet de chantier avec photos quotidiennes par WhatsApp",
    "Prevoyez un stock de materiaux sur site pour eviter les arrets de chantier",
  ],
};
