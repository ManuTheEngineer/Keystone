import type { EducationModule } from "../../types";

export const BENIN_EDUCATION_BUILD: EducationModule = {
  phase: "BUILD",
  title: "La construction",
  summary:
    "La construction en poteau-poutre suit une sequence precise. Respectez les temps de sechage du beton, surveillez la qualite des materiaux et anticipez les deux saisons des pluies.",
  content: `La construction au Benin suit le systeme poteau-poutre (poteaux et poutres en beton arme avec remplissage en parpaings). La sequence est rigoureuse et chaque etape depend de la qualite de la precedente.

La sequence standard pour une maison de plain-pied est: implantation et fouilles, semelles de fondation (ferraillage + coulage beton), amorces de poteaux, soubassement en agglos de 20 cm, remblai et compactage, dallage, elevation des poteaux, montage des murs en agglos de 15 cm, linteaux et appuis de fenetre, ceinture haute (chainage), charpente et couverture. Pour un R+1, ajoutez le plancher en hourdis ou dalle pleine.

Le beton est le coeur de votre structure. Exigez un dosage correct: 350 kg de ciment par metre cube pour les elements structurels. Le sable doit etre propre (sable de riviere ou de carriere, pas de sable de mer). Le gravier doit etre concasse. Le fer a beton doit etre de haute adherence aux diametres specifies. Au Benin, le ciment est disponible aupres de NOCIBE, SCB et Dangote Cement Benin — comparez les prix qui fluctuent.

A Cotonou, le beton pret a l'emploi (ready-mix) est disponible aupres de centrales a beton pour les gros coulages (dalles), ce qui garantit un dosage plus regulier que le melange sur site.

Le temps de cure du beton est critique: arrosage pendant 7 jours minimum, decoffrage des poutres apres 21 jours minimum, resistance nominale a 28 jours. Le Benin a deux saisons des pluies (avril-juillet et septembre-novembre): planifiez le gros oeuvre pendant la grande saison seche (novembre-mars) si possible.

Surveillez la qualite des parpaings (agglos). Testez en laissant tomber un agglo de 1 metre: s'il s'emiette, c'est un mauvais agglo.

Tenez un journal de chantier quotidien: travaux effectues, materiaux utilises, nombre d'ouvriers, conditions meteo, et problemes rencontres.`,
  keyDecisions: [
    "Fournisseur de materiaux: cimenterie (NOCIBE, SCB, Dangote), depot de fer, carriere",
    "Fabrication des agglos: sur site ou achat aupres d'un fabricant de qualite",
    "Calendrier de coulage: eviter les saisons des pluies pour les etapes critiques",
    "Beton ready-mix ou melange sur site pour les gros coulages",
    "Controle qualite: visites de verification aux etapes cles",
  ],
  commonMistakes: [
    "Utiliser du sable de mer (sale) au lieu de sable propre pour le beton",
    "Sous-doser le ciment pour economiser",
    "Decoffrer les poutres trop tot (avant 21 jours)",
    "Ne pas arroser le beton pendant la cure (7 jours minimum)",
    "Acheter des agglos de mauvaise qualite",
    "Couler le beton juste avant une forte pluie sans protection",
    "Ne pas respecter les espacements des etriers dans le ferraillage",
    "Modifier les plans en cours de construction sans consulter l'architecte",
  ],
  proTips: [
    "Achetez le ciment directement aupres des distributeurs agrees pour de meilleurs prix",
    "Fabriquez vos propres agglos sur site avec une bonne presse vibrante pour controler la qualite",
    "Prevoyez le gros oeuvre en saison seche (novembre a mars) si possible",
    "Prenez des photos de chaque ferraillage AVANT le coulage du beton",
    "Pour les gros coulages (dalle), envisagez le beton ready-mix pour un dosage regulier",
    "Verifiez les livraisons de fer: barres de 12 metres exactes et bon diametre",
    "Prevoyez un gardien sur le chantier: le vol de materiaux est frequent",
  ],
};
