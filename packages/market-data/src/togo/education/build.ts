import type { EducationModule } from "../../types";

export const TOGO_EDUCATION_BUILD: EducationModule = {
  phase: "BUILD",
  title: "La construction",
  summary:
    "La construction en poteau-poutre suit une sequence precise. Respectez les temps de sechage du beton, surveillez la qualite des materiaux et anticipez la saison des pluies.",
  content: `La construction au Togo suit le systeme poteau-poutre (poteaux et poutres en beton arme avec remplissage en parpaings). La sequence de travaux est rigoureuse et chaque etape depend de la qualite de la precedente. Ne laissez personne vous convaincre de sauter ou brusquer une etape.

La sequence standard pour une maison de plain-pied est: implantation et fouilles, semelles de fondation (ferraillage + coulage beton), amorces de poteaux, soubassement en agglos de 20 cm, remblai et compactage, dallage (dalle basse), elevation des poteaux (ferraillage + coffrage + coulage), montage des murs en agglos de 15 cm, linteaux et appuis de fenetre, ceinture haute (chainage), charpente et couverture en toles. Pour un R+1, ajoutez: plancher en hourdis ou dalle pleine, puis repetez l'elevation pour l'etage.

Le beton est le coeur de votre structure. Exigez un dosage correct: 350 kg de ciment par metre cube de beton pour les elements structurels (poteaux, poutres, dalle). Le sable doit etre propre (sable de riviere, pas de sable de mer qui contient du sel corrosif pour le fer). Le gravier doit etre concasse et de calibre 5/15 ou 15/25 selon l'utilisation. Le fer a beton doit etre de haute adherence (HA) et aux diametres specifies par les plans: generalement du 8, 10, 12 ou 14 mm.

Le temps de sechage (cure) du beton est critique. Les poteaux et poutres doivent etre arroses pendant au moins 7 jours apres le coulage pour eviter la fissuration. Ne decoffrez pas les poutres avant 21 jours minimum. Le beton atteint sa resistance nominale a 28 jours. Pendant la saison des pluies (avril a juillet et septembre a octobre), protegez le beton fraichement coule avec des baches et evitez de couler juste avant une averse.

Surveillez la qualite des parpaings (agglos). Les agglos de bonne qualite sont vibres, lisses et denses. Testez en laissant tomber un agglo de 1 metre de hauteur: s'il se casse en deux morceaux nets c'est acceptable, s'il s'emiette c'est un mauvais agglo. Les agglos artisanaux de mauvaise qualite sont un fleau au Togo et compromettent la solidite des murs.

Tenez un journal de chantier quotidien: travaux effectues, materiaux utilises, nombre d'ouvriers presents, conditions meteo, et problemes rencontres. Ce journal est votre historique et votre protection en cas de litige.`,
  keyDecisions: [
    "Fournisseur de materiaux: cimenterie (CIMTOGO/Fortia/Diamond), depot de fer, carriere de gravier",
    "Fabrication des agglos: sur site ou achat aupres d'un fabricant de qualite",
    "Calendrier de coulage: eviter la pleine saison des pluies pour les etapes critiques",
    "Stockage des materiaux: prevoir un espace securise sur le chantier",
    "Controle qualite: visites de verification aux etapes cles (fondation, poteaux, dalle, charpente)",
  ],
  commonMistakes: [
    "Utiliser du sable de mer (sale) au lieu de sable de riviere pour le beton",
    "Sous-doser le ciment pour economiser (compromet la resistance structurelle)",
    "Decoffrer les poutres et linteaux trop tot (avant 21 jours)",
    "Ne pas arroser le beton pendant la cure (7 jours minimum)",
    "Acheter des agglos de mauvaise qualite qui s'effritent",
    "Couler le beton juste avant une forte pluie sans protection",
    "Ne pas respecter les espacements des etriers dans le ferraillage des poteaux",
    "Modifier les plans en cours de construction sans consulter l'architecte",
  ],
  proTips: [
    "Achetez le ciment en gros directement aupres des distributeurs agrees (CIMTOGO, Fortia, Diamond Cement) pour de meilleurs prix",
    "Fabriquez vos propres agglos sur site avec une bonne presse vibrante pour controler la qualite",
    "Prevoyez le gros oeuvre (fondation a toiture) en saison seche (novembre a mars) si possible",
    "Prenez des photos de chaque ferraillage AVANT le coulage du beton: une fois coule, on ne voit plus rien",
    "Gardez des echantillons de beton (eprouvettes) pour tester la resistance si vous avez des doutes",
    "Verifiez les livraisons de fer: les barres doivent faire exactement 12 metres et avoir le bon diametre",
    "Prevoyez un gardien sur le chantier: le vol de materiaux (surtout le fer et le ciment) est frequent",
  ],
};
