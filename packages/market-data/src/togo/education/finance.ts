import type { EducationModule } from "../../types";

export const TOGO_EDUCATION_FINANCE: EducationModule = {
  phase: "FINANCE",
  title: "Financer votre construction",
  summary:
    "Planifiez le financement de votre construction par epargne personnelle, transferts diaspora et tontines. Le credit bancaire immobilier est quasi inexistant au Togo.",
  content: `Le financement de la construction au Togo fonctionne de maniere fondamentalement differente des pays occidentaux. Il n'existe pratiquement pas de pret immobilier a la construction pour les particuliers. Les rares offres bancaires (Ecobank, UTB, BTCI) exigent des garanties salariales importantes, des taux d'interet de 8 a 14%, et sont reservees aux fonctionnaires ou employes du secteur formel. La grande majorite des Togolais construisent par autofinancement progressif.

La strategie la plus courante est la construction par phases (ou construction evolutive). Vous construisez ce que vous pouvez payer, puis vous attendez d'avoir accumule suffisamment pour la phase suivante. Un projet typique peut s'etaler sur 2 a 5 ans: d'abord le terrain et le titre foncier, puis les fondations et le gros oeuvre, ensuite la toiture, et enfin les finitions. Chaque phase necessite un budget bloque avant de commencer.

Pour les membres de la diaspora, les transferts d'argent (via Wave, MoneyGram, Western Union, ou transfert bancaire) representent la source principale de financement. Attention aux frais de transfert: Wave offre generalement les meilleurs taux. Prevoyez un compte bancaire local dedie au projet pour tracer chaque depense.

La tontine (ou nago) reste un mecanisme d'epargne puissant. Un groupe de personnes cotise regulierement et chacun recoit le pot a tour de role. C'est un complement utile mais imprevisible: vous ne controlez pas toujours le moment ou vous recevez les fonds. Ne basez pas votre calendrier de construction uniquement sur la tontine.

Certains constructeurs combinent ces sources: epargne personnelle pour le terrain, transferts diaspora pour le gros oeuvre, et tontine pour les finitions. L'essentiel est de ne jamais commencer une phase sans avoir la totalite du budget de cette phase disponible. Lancer le coulage d'une dalle sans pouvoir la terminer est une erreur couteuse: le beton mal cure ou expose trop longtemps se degrade.`,
  keyDecisions: [
    "Strategie de financement: epargne unique, construction par phases, ou combinaison",
    "Source des fonds: salaire local, transferts diaspora, tontine, epargne",
    "Canal de transfert pour la diaspora: Wave, Western Union, virement bancaire",
    "Compte bancaire dedie au projet: choix de la banque et signataires",
    "Budget par phase: repartition precise des fonds disponibles par etape",
  ],
  commonMistakes: [
    "Compter sur un credit bancaire qui ne sera jamais accorde",
    "Commencer une phase de construction sans avoir la totalite du budget de cette phase",
    "Envoyer de l'argent sans systeme de suivi des depenses",
    "Confier tout l'argent au chef de chantier sans controle regulier",
    "Ignorer les frais de transfert qui peuvent representer 3 a 8% du montant",
    "Baser le calendrier sur des promesses de tontine non encore recues",
  ],
  proTips: [
    "Ouvrez un compte bancaire local dedie exclusivement au projet de construction",
    "Utilisez Wave pour les transferts diaspora: frais les plus bas et reception instantanee",
    "Bloquez le budget de chaque phase avant de la demarrer, jamais pendant",
    "Gardez une reserve de 15-20% par phase pour les imprevus et hausses de prix des materiaux",
    "Demandez des recus pour CHAQUE achat de materiaux et paiement d'ouvrier",
    "Comparez les prix des materiaux entre Assigame, Adawlato et les depots de Kegue avant d'acheter",
  ],
  disclaimer:
    "Les informations financieres presentees sont indicatives et basees sur les pratiques courantes au Togo. Les taux bancaires, frais de transfert et couts des materiaux fluctuent. Consultez un conseiller financier ou un comptable local pour votre situation specifique.",
};
