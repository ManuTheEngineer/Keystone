import type { WARegion, WADistrict, WACity } from "./types";

/**
 * Togo administrative divisions.
 * Togo has 5 regions, subdivided into 39 prefectures.
 * Source: GADM / Institut National de la Statistique et des Etudes Economiques du Togo (INSEED).
 */

export const TOGO_REGIONS: WARegion[] = [
  { name: "Maritime", country: "TOGO", capital: "Lome" },
  { name: "Plateaux", country: "TOGO", capital: "Atakpame" },
  { name: "Centrale", country: "TOGO", capital: "Sokode" },
  { name: "Kara", country: "TOGO", capital: "Kara" },
  { name: "Savanes", country: "TOGO", capital: "Dapaong" },
];

export const TOGO_DISTRICTS: WADistrict[] = [
  // Maritime
  { name: "Golfe", regionName: "Maritime", country: "TOGO", capital: "Lome" },
  { name: "Lacs", regionName: "Maritime", country: "TOGO", capital: "Aneho" },
  { name: "Vo", regionName: "Maritime", country: "TOGO", capital: "Vogan" },
  { name: "Yoto", regionName: "Maritime", country: "TOGO", capital: "Tabligbo" },
  { name: "Zio", regionName: "Maritime", country: "TOGO", capital: "Tsevie" },
  { name: "Bas-Mono", regionName: "Maritime", country: "TOGO", capital: "Afagnan" },
  { name: "Ave", regionName: "Maritime", country: "TOGO", capital: "Keve" },
  // Plateaux
  { name: "Agou", regionName: "Plateaux", country: "TOGO", capital: "Agou-Gare" },
  { name: "Amou", regionName: "Plateaux", country: "TOGO", capital: "Amlamé" },
  { name: "Danyi", regionName: "Plateaux", country: "TOGO", capital: "Danyi" },
  { name: "Est-Mono", regionName: "Plateaux", country: "TOGO", capital: "Elavagnon" },
  { name: "Haho", regionName: "Plateaux", country: "TOGO", capital: "Notsé" },
  { name: "Kloto", regionName: "Plateaux", country: "TOGO", capital: "Kpalimé" },
  { name: "Moyen-Mono", regionName: "Plateaux", country: "TOGO", capital: "Tohoun" },
  { name: "Ogou", regionName: "Plateaux", country: "TOGO", capital: "Atakpamé" },
  { name: "Wawa", regionName: "Plateaux", country: "TOGO", capital: "Badou" },
  // Centrale
  { name: "Blitta", regionName: "Centrale", country: "TOGO", capital: "Blitta" },
  { name: "Sotouboua", regionName: "Centrale", country: "TOGO", capital: "Sotouboua" },
  { name: "Tchaoudjo", regionName: "Centrale", country: "TOGO", capital: "Sokodé" },
  { name: "Tchamba", regionName: "Centrale", country: "TOGO", capital: "Tchamba" },
  { name: "Mo", regionName: "Centrale", country: "TOGO", capital: "Djarkpanga" },
  // Kara
  { name: "Assoli", regionName: "Kara", country: "TOGO", capital: "Bafilo" },
  { name: "Bassar", regionName: "Kara", country: "TOGO", capital: "Bassar" },
  { name: "Binah", regionName: "Kara", country: "TOGO", capital: "Pagouda" },
  { name: "Dankpen", regionName: "Kara", country: "TOGO", capital: "Guérin-Kouka" },
  { name: "Doufelgou", regionName: "Kara", country: "TOGO", capital: "Niamtougou" },
  { name: "Keran", regionName: "Kara", country: "TOGO", capital: "Kandé" },
  { name: "Kozah", regionName: "Kara", country: "TOGO", capital: "Kara" },
  // Savanes
  { name: "Cinkasse", regionName: "Savanes", country: "TOGO", capital: "Cinkassé" },
  { name: "Kpendjal", regionName: "Savanes", country: "TOGO", capital: "Mandouri" },
  { name: "Kpendjal-Ouest", regionName: "Savanes", country: "TOGO", capital: "Naki-Ouest" },
  { name: "Oti", regionName: "Savanes", country: "TOGO", capital: "Mango" },
  { name: "Oti-Sud", regionName: "Savanes", country: "TOGO", capital: "Gando" },
  { name: "Tandjoare", regionName: "Savanes", country: "TOGO", capital: "Tandjouaré" },
  { name: "Tone", regionName: "Savanes", country: "TOGO", capital: "Dapaong" },
];

export const TOGO_CITIES: WACity[] = [
  // Maritime - Major cities
  { name: "Lomé", district: "Golfe", region: "Maritime", country: "TOGO", lat: 6.14, lng: 1.21, population: 837437 },
  { name: "Adidogomé", district: "Golfe", region: "Maritime", country: "TOGO", lat: 6.17, lng: 1.17, population: 45000 },
  { name: "Baguida", district: "Golfe", region: "Maritime", country: "TOGO", lat: 6.16, lng: 1.32, population: 22000 },
  { name: "Aného", district: "Lacs", region: "Maritime", country: "TOGO", lat: 6.23, lng: 1.59, population: 47579 },
  { name: "Vogan", district: "Vo", region: "Maritime", country: "TOGO", lat: 6.33, lng: 1.53, population: 20100 },
  { name: "Tabligbo", district: "Yoto", region: "Maritime", country: "TOGO", lat: 6.58, lng: 1.50, population: 22500 },
  { name: "Tsévié", district: "Zio", region: "Maritime", country: "TOGO", lat: 6.43, lng: 1.21, population: 54474 },
  { name: "Kévé", district: "Ave", region: "Maritime", country: "TOGO", lat: 6.40, lng: 1.10, population: 12000 },
  { name: "Akatsi", district: "Vo", region: "Maritime", country: "TOGO", lat: 6.13, lng: 0.80, population: 9000 },
  { name: "Aflao-Sagbado", district: "Golfe", region: "Maritime", country: "TOGO", lat: 6.17, lng: 1.25, population: 35000 },

  // Plateaux
  { name: "Atakpamé", district: "Ogou", region: "Plateaux", country: "TOGO", lat: 7.53, lng: 1.13, population: 80683 },
  { name: "Kpalimé", district: "Kloto", region: "Plateaux", country: "TOGO", lat: 6.90, lng: 0.63, population: 75084 },
  { name: "Notsé", district: "Haho", region: "Plateaux", country: "TOGO", lat: 6.95, lng: 1.17, population: 22017 },
  { name: "Badou", district: "Wawa", region: "Plateaux", country: "TOGO", lat: 7.58, lng: 0.60, population: 24000 },
  { name: "Amlamé", district: "Amou", region: "Plateaux", country: "TOGO", lat: 7.47, lng: 0.87, population: 18000 },
  { name: "Agou-Gare", district: "Agou", region: "Plateaux", country: "TOGO", lat: 6.85, lng: 0.73, population: 9500 },

  // Centrale
  { name: "Sokodé", district: "Tchaoudjo", region: "Centrale", country: "TOGO", lat: 8.98, lng: 1.13, population: 117811 },
  { name: "Sotouboua", district: "Sotouboua", region: "Centrale", country: "TOGO", lat: 8.57, lng: 0.98, population: 21000 },
  { name: "Blitta", district: "Blitta", region: "Centrale", country: "TOGO", lat: 8.32, lng: 0.98, population: 15000 },
  { name: "Tchamba", district: "Tchamba", region: "Centrale", country: "TOGO", lat: 9.03, lng: 1.42, population: 25000 },

  // Kara
  { name: "Kara", district: "Kozah", region: "Kara", country: "TOGO", lat: 9.55, lng: 1.19, population: 104207 },
  { name: "Bassar", district: "Bassar", region: "Kara", country: "TOGO", lat: 9.25, lng: 0.78, population: 61845 },
  { name: "Niamtougou", district: "Doufelgou", region: "Kara", country: "TOGO", lat: 9.77, lng: 1.10, population: 16000 },
  { name: "Bafilo", district: "Assoli", region: "Kara", country: "TOGO", lat: 9.35, lng: 1.27, population: 23000 },
  { name: "Kandé", district: "Keran", region: "Kara", country: "TOGO", lat: 9.96, lng: 1.07, population: 19000 },

  // Savanes
  { name: "Dapaong", district: "Tone", region: "Savanes", country: "TOGO", lat: 10.86, lng: 0.20, population: 58071 },
  { name: "Mango", district: "Oti", region: "Savanes", country: "TOGO", lat: 10.36, lng: 0.47, population: 37748 },
  { name: "Mandouri", district: "Kpendjal", region: "Savanes", country: "TOGO", lat: 10.87, lng: 0.52, population: 12000 },
  { name: "Tandjouaré", district: "Tandjoare", region: "Savanes", country: "TOGO", lat: 10.62, lng: 0.05, population: 8000 },
  { name: "Cinkassé", district: "Cinkasse", region: "Savanes", country: "TOGO", lat: 11.10, lng: 0.01, population: 15000 },
];
