type Locale = "en" | "fr";

const translations: Record<string, Record<Locale, string>> = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", fr: "Tableau de bord" },
  "nav.newProject": { en: "New project", fr: "Nouveau projet" },
  "nav.learn": { en: "Learn", fr: "Apprendre" },
  "nav.overview": { en: "Overview", fr: "Vue d'ensemble" },
  "nav.budget": { en: "Budget", fr: "Budget" },
  "nav.schedule": { en: "Schedule", fr: "Calendrier" },
  "nav.financials": { en: "Financials", fr: "Finances" },
  "nav.team": { en: "Team", fr: "Equipe" },
  "nav.documents": { en: "Documents", fr: "Documents" },
  "nav.photos": { en: "Photos", fr: "Photos" },
  "nav.dailyLog": { en: "Daily log", fr: "Journal de chantier" },
  "nav.inspections": { en: "Inspections", fr: "Inspections" },
  "nav.punchList": { en: "Punch list", fr: "Liste de reserves" },
  "nav.aiAssistant": { en: "AI assistant", fr: "Assistant IA" },

  // Common actions
  "action.save": { en: "Save", fr: "Enregistrer" },
  "action.cancel": { en: "Cancel", fr: "Annuler" },
  "action.add": { en: "Add", fr: "Ajouter" },
  "action.edit": { en: "Edit", fr: "Modifier" },
  "action.delete": { en: "Delete", fr: "Supprimer" },
  "action.close": { en: "Close", fr: "Fermer" },
  "action.generate": { en: "Generate", fr: "Generer" },
  "action.print": { en: "Print", fr: "Imprimer" },
  "action.upload": { en: "Upload", fr: "Telecharger" },

  // Status
  "status.active": { en: "Active", fr: "Actif" },
  "status.completed": { en: "Completed", fr: "Termine" },
  "status.onTrack": { en: "On track", fr: "En bonne voie" },
  "status.overBudget": { en: "Over budget", fr: "Depassement" },
  "status.open": { en: "Open", fr: "Ouvert" },
  "status.resolved": { en: "Resolved", fr: "Resolu" },
  "status.inProgress": { en: "In progress", fr: "En cours" },

  // Phases
  "phase.define": { en: "Define", fr: "Definir" },
  "phase.finance": { en: "Finance", fr: "Financer" },
  "phase.land": { en: "Land", fr: "Terrain" },
  "phase.design": { en: "Design", fr: "Conception" },
  "phase.approve": { en: "Approve", fr: "Autorisation" },
  "phase.assemble": { en: "Assemble", fr: "Equipe" },
  "phase.build": { en: "Build", fr: "Construction" },
  "phase.verify": { en: "Verify", fr: "Verification" },
  "phase.operate": { en: "Operate", fr: "Exploitation" },

  // Budget
  "budget.totalBudget": { en: "Total budget", fr: "Budget total" },
  "budget.spent": { en: "Spent to date", fr: "Depense a ce jour" },
  "budget.remaining": { en: "Remaining", fr: "Restant" },
  "budget.variance": { en: "Variance", fr: "Ecart" },

  // Common labels
  "label.progress": { en: "Progress", fr: "Progression" },
  "label.loading": { en: "Loading...", fr: "Chargement..." },
  "label.noData": { en: "No data yet", fr: "Pas encore de donnees" },
  "label.week": { en: "Week", fr: "Semaine" },
  "label.day": { en: "Day", fr: "Jour" },

  // Weather
  "weather.sunny": { en: "Sunny", fr: "Ensoleille" },
  "weather.partlyCloudy": { en: "Partly cloudy", fr: "Partiellement nuageux" },
  "weather.cloudy": { en: "Cloudy", fr: "Nuageux" },
  "weather.rain": { en: "Rain", fr: "Pluie" },
  "weather.storm": { en: "Storm", fr: "Orage" },
};

export function t(key: string, locale: Locale = "en"): string {
  return translations[key]?.[locale] ?? translations[key]?.en ?? key;
}

export function getLocaleForMarket(market: string): Locale {
  if (market === "TOGO" || market === "BENIN") return "fr";
  return "en";
}

export type { Locale };
