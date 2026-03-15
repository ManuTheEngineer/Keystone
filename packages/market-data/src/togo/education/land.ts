import type { EducationModule } from "../../types";

export const TOGO_EDUCATION_LAND: EducationModule = {
  phase: "LAND",
  title: "Acquerir un terrain",
  summary:
    "L'acquisition fonciere est l'etape la plus risquee de tout projet au Togo. Un terrain sans titre foncier valide peut vous etre retire meme apres construction.",
  content: `L'acquisition de terrain est de loin l'etape la plus critique et la plus dangereuse de la construction au Togo. Les litiges fonciers representent plus de 70% des affaires devant les tribunaux togolais. Des familles entieres ont perdu leurs economies en achetant des terrains litigieux. Ne prenez aucun raccourci sur cette etape.

Le systeme foncier togolais repose sur deux regimes paralleles: le droit coutumier (terres familiales transmises par heritage) et le droit moderne (titre foncier delivre par l'Etat). Seul le titre foncier offre une securite juridique reelle. Un terrain vendu avec un simple "acte de vente" notarie mais sans titre foncier reste vulnerable a des revendications ulterieures par d'autres membres de la famille du vendeur.

La procedure d'obtention du titre foncier passe par plusieurs etapes: la demande au service des domaines, le bornage par un geometre assermente, la publication au Journal Officiel, le delai d'opposition de 3 mois, puis la delivrance du titre. Cette procedure prend en moyenne 6 a 18 mois et coute entre 300 000 et 1 500 000 FCFA selon la taille et la localisation du terrain.

Avant d'acheter, effectuez ces verifications essentielles: demandez la consultation du livre foncier au service des domaines de votre region, verifiez qu'il n'y a pas d'hypotheque ou de saisie, confirmez l'identite du vendeur et son droit a vendre (acte d'heritage, decision de justice familiale), et faites realiser un bornage contradictoire. A Lome, mefiez-vous particulierement des zones de remblai (Avepozo, certaines zones de Baguida) ou le sol peut etre instable.

Pour la diaspora, ne JAMAIS acheter un terrain sans l'avoir vu personnellement ou par un mandataire de confiance muni d'une procuration notariee. Les arnaques ciblent specifiquement les Togolais de l'etranger: terrains vendus plusieurs fois, terrains en zone non constructible, ou terrains appartenant a des collectivites.`,
  keyDecisions: [
    "Zone d'acquisition: quartier, accessibilite, viabilisation (eau, electricite, route)",
    "Type de document foncier exige: titre foncier ou engagement a l'obtenir",
    "Choix du notaire et du geometre assermente",
    "Verification au service des domaines avant tout versement",
    "Budget foncier complet: prix du terrain + frais de notaire + titre foncier + bornage + cloture",
  ],
  commonMistakes: [
    "Acheter un terrain sur la base d'un simple acte de vente sans verifier au livre foncier",
    "Payer la totalite avant d'avoir verifie l'identite et les droits du vendeur",
    "Faire confiance a un intermediaire (demarcheur) sans mandat ecrit",
    "Ne pas borner le terrain immediatement apres l'achat",
    "Ne pas cloturer le terrain rapidement (risque d'occupation illegale)",
    "Acheter en zone inondable ou sur un terrain remblaye sans etude de sol",
    "Ignorer les droits coutumiers des familles d'origine sur le terrain",
  ],
  proTips: [
    "Exigez toujours une copie du titre foncier ou une attestation du service des domaines AVANT tout paiement",
    "Faites appel a un avocat specialise en droit foncier, pas seulement un notaire",
    "Versez un acompte de 10% maximum avant verification complete, le solde apres confirmation",
    "Cloturez le terrain dans les 30 jours suivant l'achat pour etablir votre possession visible",
    "Prenez des photos datees du terrain et des bornes comme preuve de possession",
    "Renseignez-vous aupres des voisins sur l'historique du terrain et les eventuels litiges passes",
    "Pour la diaspora: nommez un mandataire par procuration notariee et exigez des photos a chaque etape",
  ],
  disclaimer:
    "L'acquisition fonciere au Togo comporte des risques juridiques significatifs. Les informations presentees ici sont educatives et ne remplacent EN AUCUN CAS l'assistance d'un avocat specialise en droit foncier togolais et d'un notaire agree. Verifiez systematiquement aupres du service des domaines de votre prefecture. Keystone ne peut etre tenu responsable de pertes liees a des transactions foncieres.",
};
