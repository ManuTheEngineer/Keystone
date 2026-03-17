import type { EducationModule } from "../../types";

export const BENIN_EDUCATION_APPROVE: EducationModule = {
  phase: "APPROVE",
  title: "Obtenir les autorisations",
  summary:
    "Le permis de construire est delivre par la mairie de votre commune. Sans lui, votre construction est illegale et peut etre demolie.",
  content: `Au Benin, toute construction en zone urbaine doit etre precedee d'un permis de construire delivre par la mairie. Le pays compte 77 communes, chacune avec sa propre mairie traitant les demandes de permis. Construire sans permis expose a des amendes, a l'arret du chantier, et dans les cas extremes a la demolition.

La demande de permis de construire se depose a la mairie de votre commune. Le dossier comprend: une demande adressee au maire, le Certificat de Propriete Fonciere (CPF) ou le recepisse d'enregistrement ANDF, les plans architecturaux signes par un architecte agree (selon les seuils), le plan topographique, et le reglement des frais.

Les frais varient selon la surface et le type de construction. Le delai legal de delivrance est de 2 mois, mais en pratique il faut souvent 3 a 8 semaines a Cotonou et plus longtemps dans les communes secondaires. La Direction departementale du Cadre de Vie et du Developpement Durable examine les plans pour la conformite urbanistique.

Dans la zone du Grand Nokoue (Cotonou, Abomey-Calavi, Porto-Novo, Seme-Podji, Ouidah), l'agence d'amenagement coordonne la planification urbaine et peut imposer des contraintes supplementaires. En zone cotiere, des restrictions speciales liees a l'erosion et aux inondations s'appliquent.

N'oubliez pas les demandes de branchement SONEB (eau) et SBEE (electricite). Ces demarches prennent du temps et doivent etre anticipees.`,
  keyDecisions: [
    "Choix de la mairie de depot (selon la localisation du terrain)",
    "Recours a un facilitateur ou depot direct du dossier",
    "Budget pour les frais de permis et frais connexes",
    "Planning du depot pour ne pas retarder le debut du chantier",
    "Demandes anticipees de branchement SBEE et SONEB",
  ],
  commonMistakes: [
    "Commencer la construction avant d'avoir le permis en main",
    "Deposer un dossier incomplet qui sera rejete",
    "Ne pas faire signer les plans par un architecte agree quand c'est requis",
    "Oublier de verifier les contraintes urbanistiques specifiques a la zone",
    "Ne pas garder les originaux des recus et du permis delivre",
    "Ignorer les reglements en zone cotiere ou lacustre",
  ],
  proTips: [
    "Deposez le dossier de permis des que vos plans sont finalises",
    "Faites des copies certifiees conformes de tous les documents avant le depot",
    "Rendez-vous en personne a la mairie pour suivre l'avancement",
    "Affichez le permis de construire sur le terrain des le debut du chantier",
    "Demandez les branchements SBEE et SONEB au moins 3 mois a l'avance",
    "Conservez le permis original: il sera requis pour le certificat de conformite",
  ],
};
