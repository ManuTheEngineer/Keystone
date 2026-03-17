import type { WARegion, WADistrict, WACity } from "./types";

/**
 * Benin administrative divisions.
 * Benin has 12 departments, subdivided into 77 communes.
 * Source: GADM / Institut National de la Statistique et de la Demographie (INStaD).
 */

export const BENIN_REGIONS: WARegion[] = [
  { name: "Littoral", country: "BENIN", capital: "Cotonou" },
  { name: "Atlantique", country: "BENIN", capital: "Ouidah" },
  { name: "Oueme", country: "BENIN", capital: "Porto-Novo" },
  { name: "Plateau", country: "BENIN", capital: "Sakete" },
  { name: "Mono", country: "BENIN", capital: "Lokossa" },
  { name: "Couffo", country: "BENIN", capital: "Aplahoue" },
  { name: "Zou", country: "BENIN", capital: "Abomey" },
  { name: "Collines", country: "BENIN", capital: "Dassa-Zoume" },
  { name: "Borgou", country: "BENIN", capital: "Parakou" },
  { name: "Alibori", country: "BENIN", capital: "Kandi" },
  { name: "Atacora", country: "BENIN", capital: "Natitingou" },
  { name: "Donga", country: "BENIN", capital: "Djougou" },
];

export const BENIN_DISTRICTS: WADistrict[] = [
  // Littoral
  { name: "Cotonou", regionName: "Littoral", country: "BENIN", capital: "Cotonou" },

  // Atlantique
  { name: "Abomey-Calavi", regionName: "Atlantique", country: "BENIN", capital: "Abomey-Calavi" },
  { name: "Allada", regionName: "Atlantique", country: "BENIN", capital: "Allada" },
  { name: "Ouidah", regionName: "Atlantique", country: "BENIN", capital: "Ouidah" },
  { name: "So-Ava", regionName: "Atlantique", country: "BENIN", capital: "So-Ava" },
  { name: "Toffo", regionName: "Atlantique", country: "BENIN", capital: "Toffo" },
  { name: "Tori-Bossito", regionName: "Atlantique", country: "BENIN", capital: "Tori-Bossito" },
  { name: "Ze", regionName: "Atlantique", country: "BENIN", capital: "Ze" },
  { name: "Kpomasse", regionName: "Atlantique", country: "BENIN", capital: "Kpomasse" },

  // Oueme
  { name: "Porto-Novo", regionName: "Oueme", country: "BENIN", capital: "Porto-Novo" },
  { name: "Seme-Podji", regionName: "Oueme", country: "BENIN", capital: "Seme-Podji" },
  { name: "Adjarra", regionName: "Oueme", country: "BENIN", capital: "Adjarra" },
  { name: "Avrankou", regionName: "Oueme", country: "BENIN", capital: "Avrankou" },
  { name: "Dangbo", regionName: "Oueme", country: "BENIN", capital: "Dangbo" },
  { name: "Aguegues", regionName: "Oueme", country: "BENIN", capital: "Aguegues" },
  { name: "Akpro-Misserete", regionName: "Oueme", country: "BENIN", capital: "Akpro-Misserete" },
  { name: "Bonou", regionName: "Oueme", country: "BENIN", capital: "Bonou" },

  // Plateau
  { name: "Sakete", regionName: "Plateau", country: "BENIN", capital: "Sakete" },
  { name: "Ifangni", regionName: "Plateau", country: "BENIN", capital: "Ifangni" },
  { name: "Adja-Ouere", regionName: "Plateau", country: "BENIN", capital: "Adja-Ouere" },
  { name: "Ketou", regionName: "Plateau", country: "BENIN", capital: "Ketou" },
  { name: "Pobe", regionName: "Plateau", country: "BENIN", capital: "Pobe" },

  // Mono
  { name: "Lokossa", regionName: "Mono", country: "BENIN", capital: "Lokossa" },
  { name: "Athieme", regionName: "Mono", country: "BENIN", capital: "Athieme" },
  { name: "Bopa", regionName: "Mono", country: "BENIN", capital: "Bopa" },
  { name: "Come", regionName: "Mono", country: "BENIN", capital: "Come" },
  { name: "Grand-Popo", regionName: "Mono", country: "BENIN", capital: "Grand-Popo" },
  { name: "Houeyogbe", regionName: "Mono", country: "BENIN", capital: "Houeyogbe" },

  // Couffo
  { name: "Aplahoue", regionName: "Couffo", country: "BENIN", capital: "Aplahoue" },
  { name: "Djakotomey", regionName: "Couffo", country: "BENIN", capital: "Djakotomey" },
  { name: "Dogbo", regionName: "Couffo", country: "BENIN", capital: "Dogbo" },
  { name: "Klouekanme", regionName: "Couffo", country: "BENIN", capital: "Klouekanme" },
  { name: "Lalo", regionName: "Couffo", country: "BENIN", capital: "Lalo" },
  { name: "Toviklin", regionName: "Couffo", country: "BENIN", capital: "Toviklin" },

  // Zou
  { name: "Abomey", regionName: "Zou", country: "BENIN", capital: "Abomey" },
  { name: "Bohicon", regionName: "Zou", country: "BENIN", capital: "Bohicon" },
  { name: "Agbangnizoun", regionName: "Zou", country: "BENIN", capital: "Agbangnizoun" },
  { name: "Covè", regionName: "Zou", country: "BENIN", capital: "Covè" },
  { name: "Djidja", regionName: "Zou", country: "BENIN", capital: "Djidja" },
  { name: "Ouinhi", regionName: "Zou", country: "BENIN", capital: "Ouinhi" },
  { name: "Za-Kpota", regionName: "Zou", country: "BENIN", capital: "Za-Kpota" },
  { name: "Zagnanado", regionName: "Zou", country: "BENIN", capital: "Zagnanado" },
  { name: "Zogbodomey", regionName: "Zou", country: "BENIN", capital: "Zogbodomey" },

  // Collines
  { name: "Dassa-Zoume", regionName: "Collines", country: "BENIN", capital: "Dassa-Zoume" },
  { name: "Glazoue", regionName: "Collines", country: "BENIN", capital: "Glazoue" },
  { name: "Savalou", regionName: "Collines", country: "BENIN", capital: "Savalou" },
  { name: "Save", regionName: "Collines", country: "BENIN", capital: "Save" },
  { name: "Bante", regionName: "Collines", country: "BENIN", capital: "Bante" },
  { name: "Ouesse", regionName: "Collines", country: "BENIN", capital: "Ouesse" },

  // Borgou
  { name: "Parakou", regionName: "Borgou", country: "BENIN", capital: "Parakou" },
  { name: "Tchaourou", regionName: "Borgou", country: "BENIN", capital: "Tchaourou" },
  { name: "N'Dali", regionName: "Borgou", country: "BENIN", capital: "N'Dali" },
  { name: "Nikki", regionName: "Borgou", country: "BENIN", capital: "Nikki" },
  { name: "Kalale", regionName: "Borgou", country: "BENIN", capital: "Kalale" },
  { name: "Perere", regionName: "Borgou", country: "BENIN", capital: "Perere" },
  { name: "Sinende", regionName: "Borgou", country: "BENIN", capital: "Sinende" },
  { name: "Bembereke", regionName: "Borgou", country: "BENIN", capital: "Bembereke" },

  // Alibori
  { name: "Kandi", regionName: "Alibori", country: "BENIN", capital: "Kandi" },
  { name: "Banikoara", regionName: "Alibori", country: "BENIN", capital: "Banikoara" },
  { name: "Gogounou", regionName: "Alibori", country: "BENIN", capital: "Gogounou" },
  { name: "Karimama", regionName: "Alibori", country: "BENIN", capital: "Karimama" },
  { name: "Malanville", regionName: "Alibori", country: "BENIN", capital: "Malanville" },
  { name: "Segbana", regionName: "Alibori", country: "BENIN", capital: "Segbana" },

  // Atacora
  { name: "Natitingou", regionName: "Atacora", country: "BENIN", capital: "Natitingou" },
  { name: "Boukoumbe", regionName: "Atacora", country: "BENIN", capital: "Boukoumbe" },
  { name: "Cobly", regionName: "Atacora", country: "BENIN", capital: "Cobly" },
  { name: "Kerou", regionName: "Atacora", country: "BENIN", capital: "Kerou" },
  { name: "Kouande", regionName: "Atacora", country: "BENIN", capital: "Kouande" },
  { name: "Materi", regionName: "Atacora", country: "BENIN", capital: "Materi" },
  { name: "Pehunco", regionName: "Atacora", country: "BENIN", capital: "Pehunco" },
  { name: "Tanguieta", regionName: "Atacora", country: "BENIN", capital: "Tanguieta" },
  { name: "Toucountouna", regionName: "Atacora", country: "BENIN", capital: "Toucountouna" },

  // Donga
  { name: "Djougou", regionName: "Donga", country: "BENIN", capital: "Djougou" },
  { name: "Bassila", regionName: "Donga", country: "BENIN", capital: "Bassila" },
  { name: "Copargo", regionName: "Donga", country: "BENIN", capital: "Copargo" },
  { name: "Ouake", regionName: "Donga", country: "BENIN", capital: "Ouake" },
];

export const BENIN_CITIES: WACity[] = [
  // Littoral
  { name: "Cotonou", district: "Cotonou", region: "Littoral", country: "BENIN", lat: 6.37, lng: 2.39, population: 679012 },

  // Atlantique
  { name: "Abomey-Calavi", district: "Abomey-Calavi", region: "Atlantique", country: "BENIN", lat: 6.45, lng: 2.35, population: 655965 },
  { name: "Ouidah", district: "Ouidah", region: "Atlantique", country: "BENIN", lat: 6.37, lng: 2.09, population: 164830 },
  { name: "Allada", district: "Allada", region: "Atlantique", country: "BENIN", lat: 6.66, lng: 2.15, population: 127512 },
  { name: "Godomey", district: "Abomey-Calavi", region: "Atlantique", country: "BENIN", lat: 6.41, lng: 2.33, population: 120000 },
  { name: "Toffo", district: "Toffo", region: "Atlantique", country: "BENIN", lat: 6.85, lng: 2.10, population: 95000 },
  { name: "Ze", district: "Ze", region: "Atlantique", country: "BENIN", lat: 6.60, lng: 2.28, population: 88000 },

  // Oueme
  { name: "Porto-Novo", district: "Porto-Novo", region: "Oueme", country: "BENIN", lat: 6.50, lng: 2.60, population: 264320 },
  { name: "Seme-Podji", district: "Seme-Podji", region: "Oueme", country: "BENIN", lat: 6.38, lng: 2.60, population: 222322 },
  { name: "Adjarra", district: "Adjarra", region: "Oueme", country: "BENIN", lat: 6.53, lng: 2.65, population: 100520 },
  { name: "Avrankou", district: "Avrankou", region: "Oueme", country: "BENIN", lat: 6.55, lng: 2.65, population: 128000 },
  { name: "Dangbo", district: "Dangbo", region: "Oueme", country: "BENIN", lat: 6.60, lng: 2.54, population: 95000 },

  // Plateau
  { name: "Sakete", district: "Sakete", region: "Plateau", country: "BENIN", lat: 6.74, lng: 2.66, population: 114088 },
  { name: "Ketou", district: "Ketou", region: "Plateau", country: "BENIN", lat: 7.36, lng: 2.60, population: 100800 },
  { name: "Pobe", district: "Pobe", region: "Plateau", country: "BENIN", lat: 6.98, lng: 2.67, population: 107000 },

  // Mono
  { name: "Lokossa", district: "Lokossa", region: "Mono", country: "BENIN", lat: 6.64, lng: 1.72, population: 104157 },
  { name: "Come", district: "Come", region: "Mono", country: "BENIN", lat: 6.41, lng: 1.87, population: 95000 },
  { name: "Grand-Popo", district: "Grand-Popo", region: "Mono", country: "BENIN", lat: 6.28, lng: 1.82, population: 55000 },

  // Couffo
  { name: "Aplahoue", district: "Aplahoue", region: "Couffo", country: "BENIN", lat: 6.93, lng: 1.68, population: 171109 },
  { name: "Dogbo", district: "Dogbo", region: "Couffo", country: "BENIN", lat: 6.79, lng: 1.78, population: 100000 },
  { name: "Djakotomey", district: "Djakotomey", region: "Couffo", country: "BENIN", lat: 6.90, lng: 1.72, population: 94000 },

  // Zou
  { name: "Abomey", district: "Abomey", region: "Zou", country: "BENIN", lat: 7.18, lng: 1.99, population: 82154 },
  { name: "Bohicon", district: "Bohicon", region: "Zou", country: "BENIN", lat: 7.18, lng: 2.07, population: 149271 },
  { name: "Covè", district: "Covè", region: "Zou", country: "BENIN", lat: 7.22, lng: 2.33, population: 60000 },
  { name: "Djidja", district: "Djidja", region: "Zou", country: "BENIN", lat: 7.34, lng: 1.94, population: 120000 },

  // Collines
  { name: "Dassa-Zoume", district: "Dassa-Zoume", region: "Collines", country: "BENIN", lat: 7.75, lng: 2.18, population: 112123 },
  { name: "Savalou", district: "Savalou", region: "Collines", country: "BENIN", lat: 7.93, lng: 1.98, population: 104749 },
  { name: "Save", district: "Save", region: "Collines", country: "BENIN", lat: 8.03, lng: 2.49, population: 87413 },
  { name: "Glazoue", district: "Glazoue", region: "Collines", country: "BENIN", lat: 7.97, lng: 2.24, population: 105000 },

  // Borgou
  { name: "Parakou", district: "Parakou", region: "Borgou", country: "BENIN", lat: 9.34, lng: 2.63, population: 255478 },
  { name: "Tchaourou", district: "Tchaourou", region: "Borgou", country: "BENIN", lat: 8.89, lng: 2.60, population: 200000 },
  { name: "Nikki", district: "Nikki", region: "Borgou", country: "BENIN", lat: 9.94, lng: 3.21, population: 148773 },
  { name: "N'Dali", district: "N'Dali", region: "Borgou", country: "BENIN", lat: 9.86, lng: 2.72, population: 94000 },

  // Alibori
  { name: "Kandi", district: "Kandi", region: "Alibori", country: "BENIN", lat: 11.13, lng: 2.94, population: 179290 },
  { name: "Banikoara", district: "Banikoara", region: "Alibori", country: "BENIN", lat: 11.30, lng: 2.44, population: 248621 },
  { name: "Malanville", district: "Malanville", region: "Alibori", country: "BENIN", lat: 11.87, lng: 3.39, population: 168006 },

  // Atacora
  { name: "Natitingou", district: "Natitingou", region: "Atacora", country: "BENIN", lat: 10.31, lng: 1.38, population: 103000 },
  { name: "Boukoumbe", district: "Boukoumbe", region: "Atacora", country: "BENIN", lat: 10.18, lng: 1.10, population: 82000 },
  { name: "Tanguieta", district: "Tanguieta", region: "Atacora", country: "BENIN", lat: 10.62, lng: 1.27, population: 75000 },
  { name: "Kouande", district: "Kouande", region: "Atacora", country: "BENIN", lat: 10.33, lng: 1.69, population: 93000 },

  // Donga
  { name: "Djougou", district: "Djougou", region: "Donga", country: "BENIN", lat: 9.70, lng: 1.67, population: 266522 },
  { name: "Bassila", district: "Bassila", region: "Donga", country: "BENIN", lat: 9.01, lng: 1.67, population: 100000 },
  { name: "Copargo", district: "Copargo", region: "Donga", country: "BENIN", lat: 9.85, lng: 1.53, population: 58000 },
];
