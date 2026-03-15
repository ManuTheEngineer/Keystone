import type { EducationModule } from "../../types";

export const TOGO_EDUCATION_APPROVE: EducationModule = {
  phase: "APPROVE",
  title: "Obtenir les autorisations",
  summary:
    "Le permis de construire est delivre par la mairie. Sans lui, votre construction est illegale et peut etre demolie.",
  content: `Au Togo, toute construction doit etre precedee d'un permis de construire delivre par la mairie de la commune ou se situe le terrain. Construire sans permis expose a des amendes, a l'arret du chantier par les autorites, et dans les cas extremes a la demolition. Meme si beaucoup de constructions demarrent sans permis dans les zones periurbaines, c'est un risque que vous ne devez pas prendre, surtout si vous investissez des sommes importantes.

La demande de permis de construire se depose a la mairie de votre commune (Commune de Golfe, Commune d'Agoenyive, Commune de Lome, etc.). Le dossier comprend: une demande adressee au maire, le titre foncier ou l'attestation de propriete, les plans architecturaux signes par un architecte agree (obligatoire pour les batiments de plus de 150 m2), un plan de situation, un plan de masse, et le reglement des frais de permis.

Les frais de permis de construire varient selon la surface et le type de construction. Pour une maison individuelle, comptez entre 50 000 et 300 000 FCFA. Pour un immeuble, les frais sont plus eleves et calcules au metre carre. Le delai legal de delivrance est de 2 mois, mais en pratique il faut souvent compter 3 a 6 mois. Des suivis reguliers a la mairie sont necessaires.

En plus du permis de construire, vous devrez obtenir un alignement aupres de la direction de l'urbanisme pour verifier que votre construction respecte les limites d'emprise de la voie publique. Dans certaines zones, un certificat d'urbanisme prealable peut etre exige pour confirmer que le terrain est en zone constructible.

Pour la diaspora, votre mandataire local peut deposer et suivre le dossier. Demandez des copies de tous les recus et du numero d'enregistrement du dossier. Suivez l'avancement a distance en contactant directement le service technique de la mairie.

N'oubliez pas les autorisations de branchement aupres de la CEET (electricite) et de la TdE (eau). Ces demandes peuvent etre faites pendant la construction mais doivent etre anticipees car les delais sont souvent longs, surtout en zone periurbaine.`,
  keyDecisions: [
    "Choix de la mairie de depot (selon la localisation du terrain)",
    "Recours a un facilitateur ou depot direct du dossier",
    "Budget pour les frais de permis et les frais connexes",
    "Planning du depot pour ne pas retarder le debut du chantier",
    "Demandes anticipees de branchement CEET et TdE",
  ],
  commonMistakes: [
    "Commencer la construction avant d'avoir le permis en main",
    "Deposer un dossier incomplet qui sera rejete et retardera le projet de plusieurs mois",
    "Ne pas faire signer les plans par un architecte agree quand c'est requis",
    "Oublier de verifier l'alignement et les servitudes d'urbanisme",
    "Ne pas garder les originaux des recus de depot et du permis delivre",
    "Ignorer les reglements specifiques a certaines zones (proximite du littoral, zones protegees)",
  ],
  proTips: [
    "Deposez le dossier de permis des que vos plans sont finalises pour gagner du temps",
    "Faites des copies certifiees conformes de tous les documents du dossier avant le depot",
    "Rendez-vous en personne au service technique de la mairie pour suivre l'avancement",
    "Affichez le permis de construire sur le terrain des le debut du chantier (obligation legale)",
    "Demandez les branchements CEET et TdE au moins 3 mois avant d'en avoir besoin",
    "Conservez le permis original en lieu sur: il sera requis pour le certificat de conformite",
  ],
};
