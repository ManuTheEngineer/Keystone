import type { EducationModule } from "../../types";

export const BENIN_EDUCATION_FINANCE: EducationModule = {
  phase: "FINANCE",
  title: "Financer votre construction",
  summary:
    "Planifiez le financement par epargne personnelle, transferts diaspora et tontines (asusu). Le credit bancaire immobilier reste limite au Benin.",
  content: `Le financement de la construction au Benin repose essentiellement sur l'autofinancement. Les prets immobiliers bancaires existent (via Ecobank, BOA, BGFI, ou la Banque de l'Habitat du Benin) mais sont reserves aux salaries du secteur formel avec des garanties solides, et les taux d'interet oscillent entre 8 et 15%. Les institutions de microfinance (FECECAM, PADME, CLCAM) offrent des montants plus modestes avec des conditions strictes.

La strategie la plus courante est la construction par phases (construction evolutive). Vous construisez ce que vous pouvez payer, puis vous attendez d'avoir accumule suffisamment pour continuer. Un projet typique s'etale sur 2 a 5 ans: d'abord le terrain et l'enregistrement ANDF, puis les fondations et le gros oeuvre, ensuite la toiture, et enfin les finitions.

Pour les membres de la diaspora, les transferts d'argent (via Wave, MTN Mobile Money, MoneyGram, Western Union, ou virement bancaire) representent la source principale. Wave et MTN Mobile Money offrent generalement les meilleurs taux au Benin. Prevoyez un compte bancaire local dedie au projet.

La tontine (appelee asusu en fon) reste un mecanisme d'epargne puissant au Benin. Des tontines specifiquement orientees construction existent dans certaines communautes. C'est un complement utile mais imprevisible: ne basez pas votre calendrier uniquement sur la tontine.

L'essentiel est de ne jamais commencer une phase sans avoir la totalite du budget de cette phase. Lancer un coulage de dalle sans pouvoir le terminer est une erreur couteuse.`,
  keyDecisions: [
    "Strategie de financement: epargne unique, construction par phases, ou combinaison",
    "Source des fonds: salaire local, transferts diaspora, tontine/asusu, epargne",
    "Canal de transfert pour la diaspora: Wave, MTN Mobile Money, virement bancaire",
    "Compte bancaire dedie au projet: choix de la banque et signataires",
    "Budget par phase: repartition precise des fonds disponibles par etape",
  ],
  commonMistakes: [
    "Compter sur un credit bancaire qui ne sera jamais accorde",
    "Commencer une phase sans avoir la totalite du budget correspondant",
    "Envoyer de l'argent sans systeme de suivi des depenses",
    "Confier tout l'argent au chef de chantier sans controle regulier",
    "Ignorer les frais de transfert qui peuvent representer 3 a 8% du montant",
    "Baser le calendrier sur des promesses de tontine non encore recues",
  ],
  proTips: [
    "Ouvrez un compte bancaire local dedie exclusivement au projet de construction",
    "Utilisez Wave ou MTN Mobile Money pour les transferts diaspora: frais reduits et reception rapide",
    "Bloquez le budget de chaque phase avant de la demarrer, jamais pendant",
    "Gardez une reserve de 15-20% par phase pour les imprevus et hausses de prix",
    "Demandez des recus (quittances) pour CHAQUE achat et paiement",
    "Comparez les prix des materiaux entre Dantokpa, Ganhi et les depots de Godomey avant d'acheter",
  ],
  disclaimer:
    "Les informations financieres presentees sont indicatives. Les taux bancaires, frais de transfert et couts des materiaux fluctuent. Consultez un conseiller financier ou comptable local pour votre situation specifique.",
};
