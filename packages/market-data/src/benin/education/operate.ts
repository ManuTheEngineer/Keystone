import type { EducationModule } from "../../types";

export const BENIN_EDUCATION_OPERATE: EducationModule = {
  phase: "OPERATE",
  title: "Apres la construction",
  summary:
    "Gerez votre bien: occupation personnelle, mise en location ou revente. Pour la diaspora, la gestion locative a distance necessite un gestionnaire de confiance.",
  content: `Une fois la construction terminee et la reception faite, votre batiment entre dans sa phase d'exploitation. Selon votre objectif (habitation, location ou revente), les demarches different.

Pour l'occupation personnelle: amenagement (meubles sur mesure par un menuisier local), branchement definitif SBEE et SONEB, installation du compteur. Souscrivez une assurance habitation (NSIA, Sunu Assurances, Allianz, Fedas).

Pour la mise en location, le marche beninois a ses specificites. A Cotonou, les loyers sont generalement payes par avance: 3 mois, 6 mois, voire 12 mois d'avance sont courants. Fixez un loyer realiste en comparant avec les biens similaires. Un studio ou 2 pieces a Cotonou se loue entre 25 000 et 70 000 FCFA/mois selon le quartier. Une villa 3 chambres entre 120 000 et 450 000 FCFA/mois.

Pour la diaspora, la gestion locative a distance est le principal defi. Options: confier a un membre de la famille (gratuit mais source de conflits), engager un gestionnaire professionnel (5-10% du loyer), ou passer par une agence immobiliere (10-15%). Formalisez toujours par ecrit.

L'entretien regulier est essentiel sous le climat tropical. Budget annuel de 2-5% de la valeur du bien. Priorites: traitement anti-termites (tous les 3-5 ans), nettoyage des gouttiers avant les saisons des pluies, repeinture des facades tous les 3-5 ans, vidange de la fosse septique (tous les 2-3 ans). Les infiltrations d'eau et les termites sont les deux ennemis principaux.

N'oubliez pas la Taxe Fonciere Unique (TFU) collectee annuellement par la DGI. Les revenus locatifs doivent egalement etre declares. Le Benin a modernise sa fiscalite avec des plateformes numeriques facilitant le paiement.

Suivez l'avancement de votre demande de CPF aupres de l'ANDF si le titre n'est pas encore delivre. Le CPF est votre protection juridique definitive.`,
  keyDecisions: [
    "Mode d'exploitation: occupation personnelle, location ou revente",
    "Pour la location: montant du loyer et nombre de mois d'avance",
    "Gestionnaire du bien: famille, professionnel ou agence",
    "Budget d'entretien annuel (2-5% de la valeur du bien)",
    "Assurance habitation: couverture incendie, degats des eaux et vol",
    "Fiscalite: declaration des revenus locatifs et paiement de la TFU",
  ],
  commonMistakes: [
    "Ne pas formaliser la gestion par un mandat ecrit",
    "Fixer un loyer trop eleve et laisser le bien vide",
    "Negliger l'entretien preventif, surtout le traitement anti-termites",
    "Ne pas etablir de bail ecrit avec le locataire",
    "Oublier de declarer les revenus locatifs a la DGI",
    "Ne pas prevoir de budget pour les reparations",
    "Pour la diaspora: ne jamais visiter le bien et faire confiance aveuglrement",
  ],
  proTips: [
    "Exigez au minimum 3-6 mois de loyer d'avance pour securiser vos revenus",
    "Faites un etat des lieux photo detaille avant l'entree de chaque locataire",
    "Pour la diaspora: faites une visite annuelle ou mandatez une inspection photo complete",
    "Traitez contre les termites tous les 3 ans",
    "Nettoyez les gouttiers et caniveaux en mars avant la grande saison des pluies",
    "Gardez un fonds de reserve equivalent a 3 mois de loyer pour les reparations urgentes",
    "Payez la TFU regulierement via les plateformes numeriques de la DGI",
  ],
};
