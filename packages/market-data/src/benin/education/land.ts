import type { EducationModule } from "../../types";

export const BENIN_EDUCATION_LAND: EducationModule = {
  phase: "LAND",
  title: "Acquerir un terrain",
  summary:
    "L'acquisition fonciere est l'etape la plus risquee. Le Certificat de Propriete Fonciere (CPF) delivre par l'ANDF est la seule preuve legale definitive de propriete.",
  content: `L'acquisition de terrain est l'etape la plus critique de la construction au Benin. Malgre la reforme fonciere de 2013 et la creation de l'ANDF, les litiges fonciers restent extremement frequents devant les tribunaux beninois. Ne prenez aucun raccourci sur cette etape.

Le Code Foncier et Domanial de 2013 (Loi No. 2013-01) a profondement reforme le systeme foncier beninois. Il a cree l'ANDF (Agence Nationale du Domaine et du Foncier) pour centraliser l'enregistrement foncier, introduit le Certificat de Propriete Fonciere (CPF) comme titre definitif, et etabli l'Attestation de Detention Coutumiere (ADC) pour formaliser les droits coutumiers. Seul le CPF offre une securite juridique definitive.

La procedure d'obtention du CPF passe par l'ANDF: depot du dossier au bureau communal, publication pour opposition (2 mois), visite de la commission de reconnaissance, resolution des oppositions eventuelles, puis delivrance du CPF. Cette procedure prend 6 a 18 mois et coute entre 6 et 10% de la valeur declaree du terrain.

Avant d'acheter, effectuez ces verifications: consultez le Registre Foncier Communal a l'ANDF, verifiez qu'il n'y a pas de CPF existant ou de litige en cours, confirmez l'identite du vendeur et son droit a vendre, et faites realiser un plan topographique par un geometre agree. A Cotonou, mefiez-vous des zones inondables (Fifadji, Vossa, certaines parties d'Akpakpa) et des terrains en bordure de lagune.

Pour la diaspora, ne JAMAIS acheter un terrain sans l'avoir vu personnellement ou par un mandataire de confiance. Les arnaques ciblent specifiquement les Beninois de l'etranger.`,
  keyDecisions: [
    "Zone d'acquisition: commune, accessibilite, viabilisation (SONEB, SBEE, route)",
    "Type de document foncier: CPF existant ou engagement a l'obtenir via ANDF",
    "Choix du notaire et du geometre agree",
    "Verification au bureau communal de l'ANDF avant tout versement",
    "Budget foncier complet: prix du terrain + notaire + ANDF + geometre + cloture",
  ],
  commonMistakes: [
    "Acheter sur la base d'une simple convention de vente sans verifier a l'ANDF",
    "Payer la totalite avant d'avoir verifie l'identite et les droits du vendeur",
    "Faire confiance a un intermediaire (demarcheur) sans mandat ecrit",
    "Ne pas faire realiser le plan topographique immediatement apres l'achat",
    "Ne pas cloturer le terrain rapidement (risque d'occupation illegale)",
    "Acheter en zone inondable sans etude prealable",
    "Ignorer les droits coutumiers des familles sur le terrain",
  ],
  proTips: [
    "Verifiez toujours au bureau communal de l'ANDF AVANT tout paiement",
    "Faites appel a un avocat specialise en droit foncier en complement du notaire",
    "Versez un acompte de 10% maximum avant verification complete",
    "Cloturez le terrain dans les 30 jours suivant l'achat",
    "Prenez des photos datees du terrain et des bornes comme preuve de possession",
    "Renseignez-vous aupres des voisins sur l'historique du terrain",
    "Pour la diaspora: nommez un mandataire par procuration notariee et exigez des photos a chaque etape",
  ],
  disclaimer:
    "L'acquisition fonciere au Benin comporte des risques juridiques significatifs. Les informations ici sont educatives et ne remplacent EN AUCUN CAS l'assistance d'un avocat specialise en droit foncier et d'un notaire agree. Verifiez systematiquement aupres du bureau communal de l'ANDF. Keystone ne peut etre tenu responsable de pertes liees a des transactions foncieres.",
};
