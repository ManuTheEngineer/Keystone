import type { EducationModule } from "../../types";

export const TOGO_EDUCATION_DESIGN: EducationModule = {
  phase: "DESIGN",
  title: "Concevoir les plans",
  summary:
    "Choisissez entre un architecte agree et un dessinateur selon votre budget. Les plans doivent respecter les normes togolaises et etre adaptes au climat tropical.",
  content: `La conception des plans est une etape que beaucoup de constructeurs au Togo negligent ou baclent pour economiser. C'est une erreur majeure. Des plans bien faits vous feront economiser bien plus que les honoraires de l'architecte en evitant les erreurs de construction, les modifications couteuses en cours de chantier et les problemes a l'obtention du permis de construire.

Au Togo, deux types de professionnels peuvent dessiner vos plans. L'architecte agree (inscrit a l'Ordre des Architectes du Togo) est le seul habilite a signer les plans pour un permis de construire pour les batiments de plus de 150 m2 ou a etage (R+1 et plus). Ses honoraires representent generalement 5 a 10% du cout total de la construction. Le dessinateur (ou projeteur) peut realiser des plans pour les constructions simples de plain-pied de moins de 150 m2, a moindre cout, mais ses plans doivent parfois etre valides par un architecte pour le depot du permis.

Le systeme constructif standard au Togo est le poteau-poutre en beton arme avec remplissage en parpaings de ciment (agglos). Ce n'est pas la construction en ossature bois typique des Etats-Unis. Les plans doivent specifier: les dimensions et ferraillage des poteaux et poutres, l'epaisseur des murs (15 cm ou 20 cm d'agglos), le type de fondation (semelles filantes ou isolees selon le sol), et le type de toiture (charpente metallique ou bois avec couverture en toles bac aluminium).

Adaptez votre conception au climat tropical: prevoyez une ventilation naturelle croisee, des debords de toiture d'au moins 60 cm pour proteger les murs de la pluie, des ouvertures orientees pour capter les vents dominants, et un systeme d'evacuation des eaux pluviales dimensionne pour les fortes precipitations. A Lome, la nappe phreatique peut etre haute: verifiez la necessite d'un vide sanitaire ou d'un dallage sur remblai compacte.

Faites realiser une etude de sol avant de finaliser les plans de fondation. Cette etude coute entre 150 000 et 400 000 FCFA mais peut eviter des surcoutes de plusieurs millions si le sol s'avere mauvais.`,
  keyDecisions: [
    "Architecte agree ou dessinateur: selon la taille et la complexite du batiment",
    "Systeme constructif: poteau-poutre standard, murs porteurs, ou mixte",
    "Type de fondation: semelles filantes, isolees ou radier (selon etude de sol)",
    "Type de toiture: charpente metallique ou bois, toles bac aluminium ou tuiles",
    "Orientation du batiment: ventilation naturelle et protection solaire",
    "Niveau de finition: economique, moyen standing ou haut standing",
  ],
  commonMistakes: [
    "Construire sans plans detailles en se fiant a un croquis sur papier",
    "Copier un plan d'internet non adapte au climat tropical et aux normes togolaises",
    "Oublier l'etude de sol avant de finaliser les fondations",
    "Sous-dimensionner les poteaux et poutres pour economiser sur le fer a beton",
    "Ne pas prevoir les reservations pour la plomberie et l'electricite dans les plans",
    "Ignorer l'orientation par rapport au soleil et aux vents dominants",
    "Ne pas prevoir de plan d'evacuation des eaux pluviales",
  ],
  proTips: [
    "Investissez dans une etude de sol: 200 000 FCFA maintenant peut eviter 3 000 000 FCFA de reparations",
    "Demandez a l'architecte un plan de ferraillage detaille pour chaque poteau et poutre",
    "Prevoyez des debords de toiture de 80 cm minimum pour proteger les facades de la pluie",
    "Incluez des gaines techniques dans les murs pour faciliter le passage des cables et tuyaux",
    "Faites valider vos plans par un ingenieur en genie civil si votre batiment depasse le R+1",
    "Gardez une copie numerique et papier de tous les plans: ils serviront de reference tout au long du chantier",
  ],
};
