import type { EducationModule } from "../../types";

export const BENIN_EDUCATION_DESIGN: EducationModule = {
  phase: "DESIGN",
  title: "Concevoir les plans",
  summary:
    "Choisissez entre un architecte agree et un dessinateur. Les plans doivent respecter les normes beninoise et etre adaptes au climat tropical.",
  content: `La conception des plans est une etape que beaucoup de constructeurs au Benin negligent pour economiser. C'est une erreur majeure. Des plans bien faits vous feront economiser bien plus que les honoraires de l'architecte en evitant les erreurs et modifications couteuses en cours de chantier.

Au Benin, deux types de professionnels peuvent dessiner vos plans. L'architecte agree (inscrit a l'Ordre des Architectes du Benin) est habilite a signer les plans pour le permis de construire. Ses honoraires representent 5 a 10% du cout total. Le dessinateur peut realiser des plans pour les constructions simples de plain-pied, a moindre cout, mais ses plans doivent etre valides par un architecte pour le depot du permis dans certains cas.

Le systeme constructif standard au Benin est le poteau-poutre en beton arme avec remplissage en parpaings. Les plans doivent specifier: dimensions et ferraillage des poteaux et poutres, epaisseur des murs, type de fondation (adapte au sol — la terre de barre du plateau offre d'excellentes conditions), et type de toiture.

Adaptez votre conception au climat tropical beninois: ventilation naturelle croisee, debords de toiture d'au moins 60 cm, ouvertures orientees pour les vents dominants, et systeme d'evacuation des eaux pluviales dimensionne pour les fortes precipitations des deux saisons des pluies. A Cotonou, la nappe phreatique peut etre tres haute en zone cotiere.

Faites realiser une etude de sol avant de finaliser les fondations. Cette etude coute entre 150 000 et 450 000 FCFA mais peut eviter des surcoutes considerables.`,
  keyDecisions: [
    "Architecte agree ou dessinateur: selon la taille et la complexite du batiment",
    "Systeme constructif: poteau-poutre standard, murs porteurs, ou mixte",
    "Type de fondation: semelles filantes, isolees ou radier (selon etude de sol)",
    "Type de toiture: charpente metallique ou bois, toles bac aluminium ou tuiles",
    "Orientation du batiment: ventilation naturelle et protection solaire",
    "Niveau de finition: economique, moyen standing ou haut standing",
  ],
  commonMistakes: [
    "Construire sans plans detailles en se fiant a un croquis",
    "Copier un plan non adapte au climat tropical et aux normes beninoise",
    "Oublier l'etude de sol avant de finaliser les fondations",
    "Sous-dimensionner les poteaux et poutres pour economiser sur le fer",
    "Ne pas prevoir les reservations pour plomberie et electricite dans les plans",
    "Ignorer l'orientation par rapport au soleil et aux vents dominants",
    "Ne pas prevoir de plan d'evacuation des eaux pluviales",
  ],
  proTips: [
    "Investissez dans une etude de sol: 200 000 FCFA maintenant peut eviter des millions de reparations",
    "Demandez un plan de ferraillage detaille pour chaque poteau et poutre",
    "Prevoyez des debords de toiture de 80 cm minimum pour proteger les facades",
    "Incluez des gaines techniques dans les murs pour cables et tuyaux",
    "Faites valider vos plans par un ingenieur en genie civil si le batiment depasse le R+1",
    "Gardez des copies numeriques et papier de tous les plans",
  ],
};
