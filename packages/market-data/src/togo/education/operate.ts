import type { EducationModule } from "../../types";

export const TOGO_EDUCATION_OPERATE: EducationModule = {
  phase: "OPERATE",
  title: "Apres la construction",
  summary:
    "Gerez votre bien: occupation personnelle, mise en location ou revente. Pour la diaspora, la gestion locative a distance necessite un gestionnaire de confiance.",
  content: `Une fois la construction terminee et la reception faite, votre batiment entre dans sa phase d'exploitation. Selon votre objectif initial (habitation, location ou revente), les demarches et les defis different considerablement.

Pour l'occupation personnelle, les premieres semaines sont consacrees a l'amenagement: installation des meubles, branchement definitif a la CEET et a la TdE, installation d'un compteur individuel si ce n'est pas deja fait. Prevoyez un budget d'amenagement: au Togo, les meubles sur mesure (realises par un menuisier local) sont souvent moins chers et mieux adaptes que les meubles importes. Souscrivez une assurance habitation aupres d'une compagnie locale (NSIA, Sunu Assurances, Allianz Togo).

Pour la mise en location, le marche locatif togolais a ses particularites. A Lome, les loyers sont generalement payes par avance: 6 mois, 12 mois, voire 24 mois de loyer d'avance sont la norme. Ce systeme protege le proprietaire mais limite le nombre de locataires potentiels. Fixez un loyer realiste en comparant avec les biens similaires du quartier. Un studio ou 2 pieces a Lome se loue entre 30 000 et 80 000 FCFA/mois selon le quartier et les finitions. Une villa 3 chambres entre 150 000 et 500 000 FCFA/mois.

Pour la diaspora, la gestion locative a distance est le principal defi. Vous avez trois options: confier la gestion a un membre de la famille (gratuit mais source de conflits), engager un gestionnaire immobilier professionnel (5 a 10% du loyer mensuel), ou passer par une agence immobiliere (10 a 15% du loyer). Quel que soit votre choix, formalisez l'accord par ecrit et exigez des rapports mensuels avec photos de l'etat du bien.

L'entretien regulier est essentiel sous le climat tropical. Prevoyez un budget annuel d'entretien de 2 a 5% de la valeur du bien. Les priorites: traitement anti-termites (tous les 3-5 ans), verification et nettoyage des gouttiers et caniveaux avant chaque saison des pluies, repeinture des facades tous les 3-5 ans, et entretien de la fosse septique (vidange tous les 2-3 ans). Les infiltrations d'eau et les termites sont les deux ennemis principaux des constructions au Togo.

Si vous envisagez la revente, sachez que le marche immobilier togolais est peu structure. Il n'existe pas de base de donnees centralisee des prix. Les transactions passent par des demarcheurs, des agences immobilieres, ou le bouche-a-oreille. Faites evaluer votre bien par au moins deux agents independants avant de fixer un prix.`,
  keyDecisions: [
    "Mode d'exploitation: occupation personnelle, location ou revente",
    "Pour la location: montant du loyer et nombre de mois d'avance exiges",
    "Gestionnaire du bien: famille, professionnel independant ou agence",
    "Budget d'entretien annuel (2-5% de la valeur du bien)",
    "Assurance habitation: couverture incendie, degats des eaux et vol",
    "Fiscalite: declaration des revenus locatifs aupres de l'OTR (Office Togolais des Recettes)",
  ],
  commonMistakes: [
    "Ne pas formaliser la gestion par un mandat ecrit quand on delegue a un tiers",
    "Fixer un loyer trop eleve et laisser le bien vide pendant des mois",
    "Negliger l'entretien preventif, surtout le traitement anti-termites",
    "Ne pas etablir de bail ecrit avec le locataire",
    "Oublier de declarer les revenus locatifs a l'OTR (risque de redressement fiscal)",
    "Ne pas prevoir de budget pour les reparations et remplacements",
    "Pour la diaspora: ne jamais visiter le bien et faire confiance aveuglrement au gestionnaire",
  ],
  proTips: [
    "Exigez au minimum 6 mois de loyer d'avance pour securiser vos revenus locatifs",
    "Faites un etat des lieux photo detaille avant l'entree de chaque locataire",
    "Pour la diaspora: faites une visite annuelle du bien ou mandatez quelqu'un pour une inspection photographique complete",
    "Traitez contre les termites tous les 3 ans: c'est moins cher que de reparer les degats",
    "Nettoyez les gouttiers et caniveaux en mars avant le debut de la saison des pluies",
    "Gardez un fonds de reserve equivalent a 3 mois de loyer pour les reparations urgentes",
    "Inscrivez le bail au service des impots pour lui donner une force executoire en cas de litige",
  ],
};
