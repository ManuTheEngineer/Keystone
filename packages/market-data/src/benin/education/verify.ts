import type { EducationModule } from "../../types";

export const BENIN_EDUCATION_VERIFY: EducationModule = {
  phase: "VERIFY",
  title: "Verification et reception",
  summary:
    "Inspectez methodiquement chaque aspect de la construction avant de payer le solde final. Le proces-verbal de reception formalise l'achevement des travaux.",
  content: `La phase de verification est le moment ou vous inspectez la construction terminee avant d'accepter officiellement les travaux et de payer le solde final. Au Benin, cette etape est souvent negligee par les proprietaires presses d'emmenager.

La reception se fait idealement en presence du proprietaire (ou mandataire), du chef de chantier, et si possible de l'architecte. L'inspection doit etre methodique et couvrir tous les corps de metier. Etablissez un proces-verbal (PV) listant les travaux realises, les reserves (defauts a corriger) et les delais de correction.

Pour le gros oeuvre: verifiez l'aplomb des murs, l'absence de fissures dans les poteaux et poutres, la planeite de la dalle, l'etancheite de la toiture (idealement apres une pluie). Pour les finitions: qualite de l'enduit, pose du carrelage, fonctionnement des menuiseries, qualite de la peinture.

Pour la plomberie: mise en eau complete, test de chaque robinet et chasse d'eau, verification de l'absence de fuites. Pour l'electricite: test de chaque prise, interrupteur et point lumineux, verification du tableau et de la mise a la terre.

Verifiez les travaux exterieurs: cloture, portail, caniveaux, fosse septique et branchements SBEE et SONEB. Les caniveaux mal dimensionnes sont une cause frequente d'inondation de la cour lors des saisons des pluies.

Retenez 5 a 10% du solde final en retenue de garantie jusqu'a la correction complete des reserves. Ne signez la reception definitive qu'apres verification de toutes les corrections.`,
  keyDecisions: [
    "Engagement d'un expert independant pour la reception",
    "Liste des points de controle par corps de metier",
    "Montant retenu en attente de la levee des reserves (5-10%)",
    "Delai accorde pour corriger les reserves",
    "Archivage des documents: PV de reception, plans definitifs, factures",
  ],
  commonMistakes: [
    "Accepter les travaux sans inspection detaillee par hate d'emmenager",
    "Payer la totalite du solde avant la levee des reserves",
    "Ne pas rediger de proces-verbal de reception ecrit",
    "Inspecter par temps sec sans tester l'etancheite apres une pluie",
    "Oublier de tester la plomberie et l'electricite systematiquement",
    "Ne pas verifier le systeme d'evacuation des eaux pluviales",
    "Accepter des finitions mediocres",
  ],
  proTips: [
    "Faites l'inspection de la toiture pendant ou apres une forte pluie pour detecter les fuites",
    "Prenez des photos de chaque defaut avec un commentaire ecrit",
    "Si vous etes en diaspora, mandatez un architecte independant pour la reception",
    "Testez l'electricite avec un testeur de prise",
    "Verifiez que les caniveaux evacuent l'eau vers l'exterieur de la parcelle",
    "Conservez le PV signe par toutes les parties: c'est votre document legal en cas de litige",
    "Demandez les garanties: 1 an pour les finitions, 10 ans pour le gros oeuvre (garantie decennale)",
  ],
};
