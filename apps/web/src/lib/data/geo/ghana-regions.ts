import type { WARegion, WADistrict, WACity } from "./types";

/**
 * Ghana administrative divisions.
 * Ghana has 16 regions (post-2018 redistricting), subdivided into 261 districts.
 * Source: Ghana Statistical Service / GADM / acquahsamuel/ghana-cities-with-regions.
 */

export const GHANA_REGIONS: WARegion[] = [
  { name: "Greater Accra", country: "GHANA", capital: "Accra" },
  { name: "Ashanti", country: "GHANA", capital: "Kumasi" },
  { name: "Western", country: "GHANA", capital: "Sekondi-Takoradi" },
  { name: "Central", country: "GHANA", capital: "Cape Coast" },
  { name: "Eastern", country: "GHANA", capital: "Koforidua" },
  { name: "Volta", country: "GHANA", capital: "Ho" },
  { name: "Northern", country: "GHANA", capital: "Tamale" },
  { name: "Upper East", country: "GHANA", capital: "Bolgatanga" },
  { name: "Upper West", country: "GHANA", capital: "Wa" },
  { name: "Brong-Ahafo", country: "GHANA", capital: "Sunyani" },
  { name: "Western North", country: "GHANA", capital: "Sefwi Wiawso" },
  { name: "Ahafo", country: "GHANA", capital: "Goaso" },
  { name: "Bono East", country: "GHANA", capital: "Techiman" },
  { name: "Oti", country: "GHANA", capital: "Dambai" },
  { name: "North East", country: "GHANA", capital: "Nalerigu" },
  { name: "Savannah", country: "GHANA", capital: "Damongo" },
];

export const GHANA_DISTRICTS: WADistrict[] = [
  // Greater Accra
  { name: "Accra Metropolitan", regionName: "Greater Accra", country: "GHANA", capital: "Accra" },
  { name: "Tema Metropolitan", regionName: "Greater Accra", country: "GHANA", capital: "Tema" },
  { name: "Ga East", regionName: "Greater Accra", country: "GHANA", capital: "Abokobi" },
  { name: "Ga West", regionName: "Greater Accra", country: "GHANA", capital: "Amasaman" },
  { name: "Ga South", regionName: "Greater Accra", country: "GHANA", capital: "Weija" },
  { name: "Ga Central", regionName: "Greater Accra", country: "GHANA", capital: "Sowutuom" },
  { name: "Ledzokuku", regionName: "Greater Accra", country: "GHANA", capital: "Teshie" },
  { name: "La Nkwantanang-Madina", regionName: "Greater Accra", country: "GHANA", capital: "Madina" },
  { name: "La Dade-Kotopon", regionName: "Greater Accra", country: "GHANA", capital: "La" },
  { name: "Kpone Katamanso", regionName: "Greater Accra", country: "GHANA", capital: "Kpone" },
  { name: "Adentan", regionName: "Greater Accra", country: "GHANA", capital: "Adentan" },
  { name: "Ablekuma North", regionName: "Greater Accra", country: "GHANA", capital: "Ablekuma" },
  { name: "Ablekuma Central", regionName: "Greater Accra", country: "GHANA", capital: "Dansoman" },
  { name: "Ablekuma West", regionName: "Greater Accra", country: "GHANA", capital: "Gbawe" },
  { name: "Ayawaso East", regionName: "Greater Accra", country: "GHANA", capital: "Nima" },
  { name: "Ayawaso West", regionName: "Greater Accra", country: "GHANA", capital: "Abelenkpe" },
  { name: "Ayawaso North", regionName: "Greater Accra", country: "GHANA", capital: "Dome" },
  { name: "Ayawaso Central", regionName: "Greater Accra", country: "GHANA", capital: "Tesano" },
  { name: "Okaikwei North", regionName: "Greater Accra", country: "GHANA", capital: "Achimota" },
  { name: "Korle Klottey", regionName: "Greater Accra", country: "GHANA", capital: "Osu" },

  // Ashanti
  { name: "Kumasi Metropolitan", regionName: "Ashanti", country: "GHANA", capital: "Kumasi" },
  { name: "Obuasi Municipal", regionName: "Ashanti", country: "GHANA", capital: "Obuasi" },
  { name: "Ejisu Municipal", regionName: "Ashanti", country: "GHANA", capital: "Ejisu" },
  { name: "Mampong Municipal", regionName: "Ashanti", country: "GHANA", capital: "Mampong" },
  { name: "Bekwai Municipal", regionName: "Ashanti", country: "GHANA", capital: "Bekwai" },
  { name: "Asante Akim Central", regionName: "Ashanti", country: "GHANA", capital: "Konongo" },
  { name: "Offinso Municipal", regionName: "Ashanti", country: "GHANA", capital: "Offinso" },
  { name: "Atwima Nwabiagya", regionName: "Ashanti", country: "GHANA", capital: "Nkawie" },

  // Western
  { name: "Sekondi-Takoradi Metropolitan", regionName: "Western", country: "GHANA", capital: "Sekondi-Takoradi" },
  { name: "Effia-Kwesimintsim", regionName: "Western", country: "GHANA", capital: "Kwesimintsim" },
  { name: "Shama", regionName: "Western", country: "GHANA", capital: "Shama" },
  { name: "Ahanta West", regionName: "Western", country: "GHANA", capital: "Agona Nkwanta" },
  { name: "Tarkwa-Nsuaem", regionName: "Western", country: "GHANA", capital: "Tarkwa" },
  { name: "Prestea-Huni Valley", regionName: "Western", country: "GHANA", capital: "Bogoso" },

  // Central
  { name: "Cape Coast Metropolitan", regionName: "Central", country: "GHANA", capital: "Cape Coast" },
  { name: "Mfantsiman", regionName: "Central", country: "GHANA", capital: "Saltpond" },
  { name: "Komenda-Edina-Eguafo-Abirem", regionName: "Central", country: "GHANA", capital: "Elmina" },
  { name: "Awutu-Senya East", regionName: "Central", country: "GHANA", capital: "Kasoa" },

  // Eastern
  { name: "New Juaben South", regionName: "Eastern", country: "GHANA", capital: "Koforidua" },
  { name: "Suhum", regionName: "Eastern", country: "GHANA", capital: "Suhum" },
  { name: "Akuapem North", regionName: "Eastern", country: "GHANA", capital: "Akropong" },
  { name: "Akim Oda", regionName: "Eastern", country: "GHANA", capital: "Oda" },

  // Volta
  { name: "Ho Municipal", regionName: "Volta", country: "GHANA", capital: "Ho" },
  { name: "Keta Municipal", regionName: "Volta", country: "GHANA", capital: "Keta" },
  { name: "Kpando Municipal", regionName: "Volta", country: "GHANA", capital: "Kpando" },
  { name: "South Tongu", regionName: "Volta", country: "GHANA", capital: "Sogakope" },

  // Northern
  { name: "Tamale Metropolitan", regionName: "Northern", country: "GHANA", capital: "Tamale" },
  { name: "Sagnarigu", regionName: "Northern", country: "GHANA", capital: "Sagnarigu" },
  { name: "Yendi Municipal", regionName: "Northern", country: "GHANA", capital: "Yendi" },
  { name: "Tolon", regionName: "Northern", country: "GHANA", capital: "Tolon" },

  // Upper East
  { name: "Bolgatanga Municipal", regionName: "Upper East", country: "GHANA", capital: "Bolgatanga" },
  { name: "Navrongo", regionName: "Upper East", country: "GHANA", capital: "Navrongo" },
  { name: "Bawku Municipal", regionName: "Upper East", country: "GHANA", capital: "Bawku" },

  // Upper West
  { name: "Wa Municipal", regionName: "Upper West", country: "GHANA", capital: "Wa" },
  { name: "Lawra", regionName: "Upper West", country: "GHANA", capital: "Lawra" },

  // Brong-Ahafo
  { name: "Sunyani Municipal", regionName: "Brong-Ahafo", country: "GHANA", capital: "Sunyani" },
  { name: "Berekum Municipal", regionName: "Brong-Ahafo", country: "GHANA", capital: "Berekum" },

  // Bono East
  { name: "Techiman Municipal", regionName: "Bono East", country: "GHANA", capital: "Techiman" },
  { name: "Kintampo North", regionName: "Bono East", country: "GHANA", capital: "Kintampo" },

  // Ahafo
  { name: "Asunafo North", regionName: "Ahafo", country: "GHANA", capital: "Goaso" },

  // Western North
  { name: "Sefwi Wiawso", regionName: "Western North", country: "GHANA", capital: "Sefwi Wiawso" },

  // Oti
  { name: "Krachi East", regionName: "Oti", country: "GHANA", capital: "Dambai" },

  // North East
  { name: "Mamprugu-Moagduri", regionName: "North East", country: "GHANA", capital: "Nalerigu" },

  // Savannah
  { name: "West Gonja", regionName: "Savannah", country: "GHANA", capital: "Damongo" },
];

export const GHANA_CITIES: WACity[] = [
  // Greater Accra
  { name: "Accra", district: "Accra Metropolitan", region: "Greater Accra", country: "GHANA", lat: 5.56, lng: -0.19, population: 2291352 },
  { name: "Tema", district: "Tema Metropolitan", region: "Greater Accra", country: "GHANA", lat: 5.67, lng: -0.02, population: 292773 },
  { name: "Madina", district: "La Nkwantanang-Madina", region: "Greater Accra", country: "GHANA", lat: 5.68, lng: -0.17, population: 137162 },
  { name: "Teshie", district: "Ledzokuku", region: "Greater Accra", country: "GHANA", lat: 5.58, lng: -0.10, population: 171875 },
  { name: "Ashaiman", district: "Kpone Katamanso", region: "Greater Accra", country: "GHANA", lat: 5.69, lng: -0.03, population: 190972 },
  { name: "Dansoman", district: "Ablekuma Central", region: "Greater Accra", country: "GHANA", lat: 5.54, lng: -0.26, population: 89000 },
  { name: "Achimota", district: "Okaikwei North", region: "Greater Accra", country: "GHANA", lat: 5.61, lng: -0.23, population: 78000 },
  { name: "Kasoa", district: "Awutu-Senya East", region: "Greater Accra", country: "GHANA", lat: 5.53, lng: -0.42, population: 69384 },
  { name: "East Legon", district: "Ayawaso West", region: "Greater Accra", country: "GHANA", lat: 5.63, lng: -0.15, population: 45000 },
  { name: "Spintex", district: "Ledzokuku", region: "Greater Accra", country: "GHANA", lat: 5.63, lng: -0.08, population: 55000 },
  { name: "Adenta", district: "Adentan", region: "Greater Accra", country: "GHANA", lat: 5.70, lng: -0.15, population: 78215 },
  { name: "Weija", district: "Ga South", region: "Greater Accra", country: "GHANA", lat: 5.56, lng: -0.33, population: 35000 },

  // Ashanti
  { name: "Kumasi", district: "Kumasi Metropolitan", region: "Ashanti", country: "GHANA", lat: 6.69, lng: -1.62, population: 3348000 },
  { name: "Obuasi", district: "Obuasi Municipal", region: "Ashanti", country: "GHANA", lat: 6.20, lng: -1.66, population: 175043 },
  { name: "Ejisu", district: "Ejisu Municipal", region: "Ashanti", country: "GHANA", lat: 6.70, lng: -1.47, population: 63502 },
  { name: "Mampong", district: "Mampong Municipal", region: "Ashanti", country: "GHANA", lat: 7.06, lng: -1.40, population: 49079 },
  { name: "Konongo", district: "Asante Akim Central", region: "Ashanti", country: "GHANA", lat: 6.62, lng: -1.22, population: 41238 },
  { name: "Bekwai", district: "Bekwai Municipal", region: "Ashanti", country: "GHANA", lat: 6.46, lng: -1.57, population: 38520 },

  // Western
  { name: "Sekondi-Takoradi", district: "Sekondi-Takoradi Metropolitan", region: "Western", country: "GHANA", lat: 4.93, lng: -1.75, population: 559548 },
  { name: "Tarkwa", district: "Tarkwa-Nsuaem", region: "Western", country: "GHANA", lat: 5.30, lng: -1.99, population: 90477 },
  { name: "Bogoso", district: "Prestea-Huni Valley", region: "Western", country: "GHANA", lat: 5.54, lng: -2.00, population: 15000 },

  // Central
  { name: "Cape Coast", district: "Cape Coast Metropolitan", region: "Central", country: "GHANA", lat: 5.10, lng: -1.25, population: 169894 },
  { name: "Elmina", district: "Komenda-Edina-Eguafo-Abirem", region: "Central", country: "GHANA", lat: 5.08, lng: -1.35, population: 33576 },
  { name: "Saltpond", district: "Mfantsiman", region: "Central", country: "GHANA", lat: 5.21, lng: -1.06, population: 24689 },

  // Eastern
  { name: "Koforidua", district: "New Juaben South", region: "Eastern", country: "GHANA", lat: 6.09, lng: -0.26, population: 183727 },
  { name: "Suhum", district: "Suhum", region: "Eastern", country: "GHANA", lat: 6.04, lng: -0.45, population: 43865 },
  { name: "Oda", district: "Akim Oda", region: "Eastern", country: "GHANA", lat: 5.93, lng: -0.98, population: 60604 },

  // Volta
  { name: "Ho", district: "Ho Municipal", region: "Volta", country: "GHANA", lat: 6.60, lng: 0.47, population: 177281 },
  { name: "Keta", district: "Keta Municipal", region: "Volta", country: "GHANA", lat: 5.92, lng: 0.99, population: 18564 },
  { name: "Kpando", district: "Kpando Municipal", region: "Volta", country: "GHANA", lat: 6.98, lng: 0.30, population: 27000 },
  { name: "Sogakope", district: "South Tongu", region: "Volta", country: "GHANA", lat: 6.00, lng: 0.60, population: 15000 },

  // Northern
  { name: "Tamale", district: "Tamale Metropolitan", region: "Northern", country: "GHANA", lat: 9.40, lng: -0.84, population: 562919 },
  { name: "Yendi", district: "Yendi Municipal", region: "Northern", country: "GHANA", lat: 9.44, lng: -0.01, population: 51248 },

  // Upper East
  { name: "Bolgatanga", district: "Bolgatanga Municipal", region: "Upper East", country: "GHANA", lat: 10.79, lng: -0.85, population: 131550 },
  { name: "Navrongo", district: "Navrongo", region: "Upper East", country: "GHANA", lat: 10.90, lng: -1.09, population: 27905 },
  { name: "Bawku", district: "Bawku Municipal", region: "Upper East", country: "GHANA", lat: 11.06, lng: -0.24, population: 62600 },

  // Upper West
  { name: "Wa", district: "Wa Municipal", region: "Upper West", country: "GHANA", lat: 10.06, lng: -2.50, population: 107214 },
  { name: "Lawra", district: "Lawra", region: "Upper West", country: "GHANA", lat: 10.63, lng: -2.90, population: 15000 },

  // Brong-Ahafo
  { name: "Sunyani", district: "Sunyani Municipal", region: "Brong-Ahafo", country: "GHANA", lat: 7.34, lng: -2.33, population: 248046 },
  { name: "Berekum", district: "Berekum Municipal", region: "Brong-Ahafo", country: "GHANA", lat: 7.45, lng: -2.59, population: 67627 },

  // Bono East
  { name: "Techiman", district: "Techiman Municipal", region: "Bono East", country: "GHANA", lat: 7.59, lng: -1.94, population: 147788 },
  { name: "Kintampo", district: "Kintampo North", region: "Bono East", country: "GHANA", lat: 8.06, lng: -1.73, population: 46200 },

  // Ahafo
  { name: "Goaso", district: "Asunafo North", region: "Ahafo", country: "GHANA", lat: 6.80, lng: -2.52, population: 28800 },

  // Western North
  { name: "Sefwi Wiawso", district: "Sefwi Wiawso", region: "Western North", country: "GHANA", lat: 6.21, lng: -2.49, population: 37451 },

  // Oti
  { name: "Dambai", district: "Krachi East", region: "Oti", country: "GHANA", lat: 8.07, lng: 0.18, population: 16000 },

  // North East
  { name: "Nalerigu", district: "Mamprugu-Moagduri", region: "North East", country: "GHANA", lat: 10.53, lng: -0.37, population: 9500 },

  // Savannah
  { name: "Damongo", district: "West Gonja", region: "Savannah", country: "GHANA", lat: 9.08, lng: -1.82, population: 28803 },
];
