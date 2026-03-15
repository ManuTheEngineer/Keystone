import type { EducationModule } from "../../types";

export const TOGO_EDUCATION_VERIFY: EducationModule = {
  phase: "VERIFY",
  title: "Verification et reception",
  summary:
    "Inspectez methodiquement chaque aspect de la construction avant de payer le solde final. Le proces-verbal de reception formalise l'achevement des travaux.",
  content: `La phase de verification est le moment ou vous inspectez la construction terminee avant d'accepter officiellement les travaux et de payer le solde final. Au Togo, cette etape est souvent negligee par les proprietaires presses d'emmenager, ce qui les laisse sans recours face aux malfacons decouvertes plus tard.

La reception des travaux se fait idealement en presence du proprietaire (ou son mandataire), du chef de chantier, et si possible de l'architecte. L'inspection doit etre methodique et couvrir tous les corps de metier. Etablissez un proces-verbal (PV) de reception qui liste les travaux realises, les eventuelles reserves (defauts a corriger) et les delais pour la levee de ces reserves.

Pour le gros oeuvre, verifiez: l'aplomb des murs (avec un fil a plomb ou un niveau), l'absence de fissures dans les poteaux et poutres, la planeite de la dalle, l'etancheite de la toiture (idealement apres une pluie). Pour les finitions, controlez: la qualite de l'enduit (pas de bulles ni de fissures), la pose du carrelage (adherence, alignement, joints reguliers), le fonctionnement de toutes les menuiseries (portes, fenetres, grilles), et la qualite de la peinture.

Pour la plomberie, faites une mise en eau complete: ouvrez tous les robinets, tirez toutes les chasses d'eau, verifiez l'absence de fuites sous les lavabos et dans les regards. Pour l'electricite, testez chaque prise, chaque interrupteur, chaque point lumineux. Verifiez le tableau electrique et la mise a la terre. Si possible, faites intervenir un electricien independant pour un diagnostic.

Verifiez egalement les travaux exterieurs: cloture, portail, caniveaux d'evacuation des eaux pluviales, fosse septique (ou raccordement au tout-a-l'egout si disponible), et branchements CEET et TdE. Les caniveaux mal dimensionnes sont une cause frequente d'inondation de la cour pendant la saison des pluies.

Listez toutes les reserves (defauts) dans le PV de reception. Le chef de chantier dispose generalement de 15 a 30 jours pour les corriger. Retenez 5 a 10% du solde final jusqu'a la levee complete des reserves. Ne signez la reception definitive qu'apres verification de toutes les corrections.`,
  keyDecisions: [
    "Engagement d'un expert independant (architecte ou bureau de controle) pour la reception",
    "Liste des points de controle par corps de metier",
    "Montant retenu sur le solde final en attendant la levee des reserves (5-10%)",
    "Delai accorde au chef de chantier pour corriger les reserves",
    "Archivage des documents: PV de reception, plans definitifs, factures",
  ],
  commonMistakes: [
    "Accepter les travaux sans inspection detaillee par hate d'emmenager",
    "Payer la totalite du solde avant la levee des reserves",
    "Ne pas rediger de proces-verbal de reception ecrit",
    "Inspecter par temps sec sans avoir verifie l'etancheite apres une pluie",
    "Oublier de tester la plomberie et l'electricite systematiquement",
    "Ne pas verifier le systeme d'evacuation des eaux pluviales",
    "Accepter des finitions mediocres sous pretexte que c'est comme ca au Togo",
  ],
  proTips: [
    "Faites l'inspection de la toiture pendant ou juste apres une forte pluie pour detecter les fuites",
    "Prenez des photos de chaque defaut constate avec un commentaire ecrit",
    "Si vous etes en diaspora, mandatez un architecte independant pour la reception (150 000-250 000 FCFA)",
    "Testez l'electricite avec un testeur de prise (disponible a Assigame pour 5 000 FCFA)",
    "Verifiez que les caniveaux evacuent bien l'eau vers l'exterieur de la parcelle",
    "Conservez le PV de reception signe par toutes les parties: c'est votre document legal en cas de litige",
    "Demandez les garanties sur les travaux: 1 an pour les finitions, 10 ans pour le gros oeuvre (theorie, rare en pratique au Togo)",
  ],
};
