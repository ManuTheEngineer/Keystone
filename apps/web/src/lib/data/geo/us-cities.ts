import type { USCity } from "./types";

/**
 * Major US cities by state — top cities by population per state.
 * Source: SimpleMaps US Cities Database (free basic tier, CC BY 4.0).
 * Data attribution: simplemaps.com/data/us-cities
 *
 * This is a curated subset. For zip-code-level precision, the full
 * SimpleMaps dataset (30,000+ cities) can be loaded via dynamic import.
 */
export const US_CITIES: USCity[] = [
  // Alabama
  { name: "Birmingham", stateCode: "AL", county: "Jefferson", lat: 33.52, lng: -86.80, population: 197575, zips: ["35203", "35204", "35205"] },
  { name: "Montgomery", stateCode: "AL", county: "Montgomery", lat: 32.37, lng: -86.30, population: 200603, zips: ["36104", "36106", "36107"] },
  { name: "Huntsville", stateCode: "AL", county: "Madison", lat: 34.73, lng: -86.59, population: 215006, zips: ["35801", "35802", "35805"] },
  { name: "Mobile", stateCode: "AL", county: "Mobile", lat: 30.69, lng: -88.04, population: 187041, zips: ["36602", "36604", "36606"] },
  { name: "Tuscaloosa", stateCode: "AL", county: "Tuscaloosa", lat: 33.21, lng: -87.57, population: 101113, zips: ["35401", "35404", "35405"] },

  // Alaska
  { name: "Anchorage", stateCode: "AK", county: "Anchorage", lat: 61.22, lng: -149.90, population: 291247, zips: ["99501", "99502", "99503"] },
  { name: "Fairbanks", stateCode: "AK", county: "Fairbanks North Star", lat: 64.84, lng: -147.72, population: 32325, zips: ["99701", "99709"] },
  { name: "Juneau", stateCode: "AK", county: "Juneau", lat: 58.30, lng: -134.42, population: 32255, zips: ["99801", "99802"] },

  // Arizona
  { name: "Phoenix", stateCode: "AZ", county: "Maricopa", lat: 33.45, lng: -112.07, population: 1608139, zips: ["85003", "85004", "85006"] },
  { name: "Tucson", stateCode: "AZ", county: "Pima", lat: 32.22, lng: -110.97, population: 542629, zips: ["85701", "85710", "85711"] },
  { name: "Mesa", stateCode: "AZ", county: "Maricopa", lat: 33.42, lng: -111.83, population: 504258, zips: ["85201", "85202", "85204"] },
  { name: "Scottsdale", stateCode: "AZ", county: "Maricopa", lat: 33.49, lng: -111.93, population: 241361, zips: ["85251", "85254", "85260"] },
  { name: "Chandler", stateCode: "AZ", county: "Maricopa", lat: 33.31, lng: -111.84, population: 275987, zips: ["85224", "85225", "85226"] },

  // Arkansas
  { name: "Little Rock", stateCode: "AR", county: "Pulaski", lat: 34.75, lng: -92.29, population: 202591, zips: ["72201", "72202", "72204"] },
  { name: "Fort Smith", stateCode: "AR", county: "Sebastian", lat: 35.39, lng: -94.40, population: 89142, zips: ["72901", "72903", "72904"] },
  { name: "Fayetteville", stateCode: "AR", county: "Washington", lat: 36.06, lng: -94.16, population: 93949, zips: ["72701", "72703", "72704"] },

  // California
  { name: "Los Angeles", stateCode: "CA", county: "Los Angeles", lat: 34.05, lng: -118.24, population: 3898747, zips: ["90001", "90012", "90015"] },
  { name: "San Diego", stateCode: "CA", county: "San Diego", lat: 32.72, lng: -117.16, population: 1386932, zips: ["92101", "92102", "92103"] },
  { name: "San Jose", stateCode: "CA", county: "Santa Clara", lat: 37.34, lng: -121.89, population: 1013240, zips: ["95110", "95112", "95113"] },
  { name: "San Francisco", stateCode: "CA", county: "San Francisco", lat: 37.77, lng: -122.42, population: 873965, zips: ["94102", "94103", "94104"] },
  { name: "Sacramento", stateCode: "CA", county: "Sacramento", lat: 38.58, lng: -121.49, population: 524943, zips: ["95814", "95816", "95818"] },
  { name: "Fresno", stateCode: "CA", county: "Fresno", lat: 36.75, lng: -119.77, population: 542107, zips: ["93701", "93702", "93703"] },
  { name: "Oakland", stateCode: "CA", county: "Alameda", lat: 37.80, lng: -122.27, population: 433031, zips: ["94601", "94602", "94606"] },
  { name: "Bakersfield", stateCode: "CA", county: "Kern", lat: 35.37, lng: -119.02, population: 403455, zips: ["93301", "93304", "93305"] },
  { name: "Riverside", stateCode: "CA", county: "Riverside", lat: 33.95, lng: -117.40, population: 314998, zips: ["92501", "92503", "92504"] },
  { name: "Irvine", stateCode: "CA", county: "Orange", lat: 33.68, lng: -117.83, population: 307670, zips: ["92602", "92604", "92612"] },

  // Colorado
  { name: "Denver", stateCode: "CO", county: "Denver", lat: 39.74, lng: -104.99, population: 715522, zips: ["80202", "80203", "80204"] },
  { name: "Colorado Springs", stateCode: "CO", county: "El Paso", lat: 38.83, lng: -104.82, population: 478961, zips: ["80901", "80903", "80904"] },
  { name: "Aurora", stateCode: "CO", county: "Arapahoe", lat: 39.73, lng: -104.83, population: 386261, zips: ["80010", "80011", "80012"] },
  { name: "Fort Collins", stateCode: "CO", county: "Larimer", lat: 40.59, lng: -105.08, population: 169810, zips: ["80521", "80524", "80525"] },

  // Connecticut
  { name: "Bridgeport", stateCode: "CT", county: "Fairfield", lat: 41.19, lng: -73.20, population: 148529, zips: ["06601", "06604", "06606"] },
  { name: "New Haven", stateCode: "CT", county: "New Haven", lat: 41.31, lng: -72.92, population: 134023, zips: ["06510", "06511", "06513"] },
  { name: "Hartford", stateCode: "CT", county: "Hartford", lat: 41.76, lng: -72.68, population: 121054, zips: ["06101", "06103", "06105"] },
  { name: "Stamford", stateCode: "CT", county: "Fairfield", lat: 41.05, lng: -73.54, population: 135470, zips: ["06901", "06902", "06903"] },

  // Delaware
  { name: "Wilmington", stateCode: "DE", county: "New Castle", lat: 39.74, lng: -75.55, population: 70898, zips: ["19801", "19802", "19805"] },
  { name: "Dover", stateCode: "DE", county: "Kent", lat: 39.16, lng: -75.52, population: 39403, zips: ["19901", "19904"] },

  // Florida
  { name: "Jacksonville", stateCode: "FL", county: "Duval", lat: 30.33, lng: -81.66, population: 949611, zips: ["32099", "32202", "32204"] },
  { name: "Miami", stateCode: "FL", county: "Miami-Dade", lat: 25.76, lng: -80.19, population: 442241, zips: ["33101", "33125", "33130"] },
  { name: "Tampa", stateCode: "FL", county: "Hillsborough", lat: 27.95, lng: -82.46, population: 384959, zips: ["33601", "33602", "33604"] },
  { name: "Orlando", stateCode: "FL", county: "Orange", lat: 28.54, lng: -81.38, population: 307573, zips: ["32801", "32803", "32806"] },
  { name: "St. Petersburg", stateCode: "FL", county: "Pinellas", lat: 27.77, lng: -82.64, population: 258308, zips: ["33701", "33702", "33703"] },
  { name: "Fort Lauderdale", stateCode: "FL", county: "Broward", lat: 26.12, lng: -80.14, population: 182760, zips: ["33301", "33304", "33305"] },

  // Georgia
  { name: "Atlanta", stateCode: "GA", county: "Fulton", lat: 33.75, lng: -84.39, population: 498715, zips: ["30301", "30303", "30305"] },
  { name: "Augusta", stateCode: "GA", county: "Richmond", lat: 33.47, lng: -81.97, population: 202081, zips: ["30901", "30904", "30906"] },
  { name: "Columbus", stateCode: "GA", county: "Muscogee", lat: 32.46, lng: -84.99, population: 206922, zips: ["31901", "31903", "31904"] },
  { name: "Savannah", stateCode: "GA", county: "Chatham", lat: 32.08, lng: -81.09, population: 147780, zips: ["31401", "31404", "31405"] },

  // Hawaii
  { name: "Honolulu", stateCode: "HI", county: "Honolulu", lat: 21.31, lng: -157.86, population: 350964, zips: ["96801", "96813", "96814"] },
  { name: "Hilo", stateCode: "HI", county: "Hawaii", lat: 19.72, lng: -155.08, population: 45703, zips: ["96720", "96721"] },

  // Idaho
  { name: "Boise", stateCode: "ID", county: "Ada", lat: 43.62, lng: -116.21, population: 235684, zips: ["83701", "83702", "83704"] },
  { name: "Meridian", stateCode: "ID", county: "Ada", lat: 43.61, lng: -116.39, population: 117635, zips: ["83642", "83646"] },
  { name: "Nampa", stateCode: "ID", county: "Canyon", lat: 43.54, lng: -116.56, population: 100200, zips: ["83651", "83686", "83687"] },

  // Illinois
  { name: "Chicago", stateCode: "IL", county: "Cook", lat: 41.88, lng: -87.63, population: 2746388, zips: ["60601", "60602", "60603"] },
  { name: "Aurora", stateCode: "IL", county: "Kane", lat: 41.76, lng: -88.32, population: 180542, zips: ["60502", "60504", "60505"] },
  { name: "Rockford", stateCode: "IL", county: "Winnebago", lat: 42.27, lng: -89.09, population: 148655, zips: ["61101", "61103", "61104"] },
  { name: "Springfield", stateCode: "IL", county: "Sangamon", lat: 39.80, lng: -89.64, population: 114230, zips: ["62701", "62702", "62703"] },

  // Indiana
  { name: "Indianapolis", stateCode: "IN", county: "Marion", lat: 39.77, lng: -86.16, population: 887642, zips: ["46201", "46202", "46204"] },
  { name: "Fort Wayne", stateCode: "IN", county: "Allen", lat: 41.08, lng: -85.14, population: 263886, zips: ["46801", "46802", "46803"] },
  { name: "Evansville", stateCode: "IN", county: "Vanderburgh", lat: 37.97, lng: -87.56, population: 117298, zips: ["47701", "47708", "47710"] },

  // Iowa
  { name: "Des Moines", stateCode: "IA", county: "Polk", lat: 41.59, lng: -93.62, population: 214133, zips: ["50301", "50309", "50310"] },
  { name: "Cedar Rapids", stateCode: "IA", county: "Linn", lat: 41.98, lng: -91.67, population: 137710, zips: ["52401", "52402", "52403"] },
  { name: "Davenport", stateCode: "IA", county: "Scott", lat: 41.52, lng: -90.58, population: 101724, zips: ["52801", "52802", "52803"] },

  // Kansas
  { name: "Wichita", stateCode: "KS", county: "Sedgwick", lat: 37.69, lng: -97.34, population: 397532, zips: ["67201", "67202", "67203"] },
  { name: "Overland Park", stateCode: "KS", county: "Johnson", lat: 38.98, lng: -94.67, population: 197238, zips: ["66204", "66210", "66212"] },
  { name: "Kansas City", stateCode: "KS", county: "Wyandotte", lat: 39.11, lng: -94.63, population: 156607, zips: ["66101", "66102", "66103"] },

  // Kentucky
  { name: "Louisville", stateCode: "KY", county: "Jefferson", lat: 38.25, lng: -85.76, population: 633045, zips: ["40202", "40203", "40204"] },
  { name: "Lexington", stateCode: "KY", county: "Fayette", lat: 38.04, lng: -84.50, population: 322570, zips: ["40502", "40503", "40504"] },
  { name: "Bowling Green", stateCode: "KY", county: "Warren", lat: 36.99, lng: -86.44, population: 80545, zips: ["42101", "42103", "42104"] },

  // Louisiana
  { name: "New Orleans", stateCode: "LA", county: "Orleans", lat: 29.95, lng: -90.07, population: 383997, zips: ["70112", "70113", "70116"] },
  { name: "Baton Rouge", stateCode: "LA", county: "East Baton Rouge", lat: 30.45, lng: -91.19, population: 227470, zips: ["70801", "70802", "70805"] },
  { name: "Shreveport", stateCode: "LA", county: "Caddo", lat: 32.53, lng: -93.75, population: 188987, zips: ["71101", "71103", "71104"] },

  // Maine
  { name: "Portland", stateCode: "ME", county: "Cumberland", lat: 43.66, lng: -70.26, population: 68408, zips: ["04101", "04102", "04103"] },
  { name: "Lewiston", stateCode: "ME", county: "Androscoggin", lat: 44.10, lng: -70.21, population: 37121, zips: ["04240", "04241"] },

  // Maryland
  { name: "Baltimore", stateCode: "MD", county: "Baltimore City", lat: 39.29, lng: -76.61, population: 585708, zips: ["21201", "21202", "21205"] },
  { name: "Columbia", stateCode: "MD", county: "Howard", lat: 39.24, lng: -76.84, population: 104681, zips: ["21044", "21045", "21046"] },
  { name: "Silver Spring", stateCode: "MD", county: "Montgomery", lat: 38.99, lng: -77.03, population: 81015, zips: ["20901", "20902", "20903"] },

  // Massachusetts
  { name: "Boston", stateCode: "MA", county: "Suffolk", lat: 42.36, lng: -71.06, population: 675647, zips: ["02101", "02108", "02109"] },
  { name: "Worcester", stateCode: "MA", county: "Worcester", lat: 42.26, lng: -71.80, population: 206518, zips: ["01601", "01602", "01603"] },
  { name: "Springfield", stateCode: "MA", county: "Hampden", lat: 42.10, lng: -72.59, population: 155929, zips: ["01101", "01103", "01104"] },
  { name: "Cambridge", stateCode: "MA", county: "Middlesex", lat: 42.37, lng: -71.11, population: 118403, zips: ["02138", "02139", "02140"] },

  // Michigan
  { name: "Detroit", stateCode: "MI", county: "Wayne", lat: 42.33, lng: -83.05, population: 639111, zips: ["48201", "48202", "48204"] },
  { name: "Grand Rapids", stateCode: "MI", county: "Kent", lat: 42.96, lng: -85.66, population: 198917, zips: ["49501", "49503", "49504"] },
  { name: "Ann Arbor", stateCode: "MI", county: "Washtenaw", lat: 42.28, lng: -83.74, population: 123851, zips: ["48103", "48104", "48105"] },

  // Minnesota
  { name: "Minneapolis", stateCode: "MN", county: "Hennepin", lat: 44.98, lng: -93.27, population: 429954, zips: ["55401", "55402", "55403"] },
  { name: "Saint Paul", stateCode: "MN", county: "Ramsey", lat: 44.94, lng: -93.09, population: 311527, zips: ["55101", "55102", "55103"] },
  { name: "Rochester", stateCode: "MN", county: "Olmsted", lat: 44.02, lng: -92.47, population: 121395, zips: ["55901", "55902", "55904"] },

  // Mississippi
  { name: "Jackson", stateCode: "MS", county: "Hinds", lat: 32.30, lng: -90.18, population: 153701, zips: ["39201", "39202", "39203"] },
  { name: "Gulfport", stateCode: "MS", county: "Harrison", lat: 30.37, lng: -89.09, population: 72926, zips: ["39501", "39503", "39507"] },

  // Missouri
  { name: "Kansas City", stateCode: "MO", county: "Jackson", lat: 39.10, lng: -94.58, population: 508090, zips: ["64101", "64102", "64105"] },
  { name: "St. Louis", stateCode: "MO", county: "St. Louis City", lat: 38.63, lng: -90.20, population: 301578, zips: ["63101", "63102", "63103"] },
  { name: "Springfield", stateCode: "MO", county: "Greene", lat: 37.22, lng: -93.29, population: 169176, zips: ["65801", "65802", "65803"] },

  // Montana
  { name: "Billings", stateCode: "MT", county: "Yellowstone", lat: 45.78, lng: -108.50, population: 119538, zips: ["59101", "59102", "59105"] },
  { name: "Missoula", stateCode: "MT", county: "Missoula", lat: 46.87, lng: -114.00, population: 75516, zips: ["59801", "59802", "59803"] },

  // Nebraska
  { name: "Omaha", stateCode: "NE", county: "Douglas", lat: 41.26, lng: -95.94, population: 486051, zips: ["68101", "68102", "68104"] },
  { name: "Lincoln", stateCode: "NE", county: "Lancaster", lat: 40.81, lng: -96.68, population: 291082, zips: ["68501", "68502", "68503"] },

  // Nevada
  { name: "Las Vegas", stateCode: "NV", county: "Clark", lat: 36.17, lng: -115.14, population: 641903, zips: ["89101", "89102", "89104"] },
  { name: "Henderson", stateCode: "NV", county: "Clark", lat: 36.04, lng: -114.98, population: 320189, zips: ["89002", "89011", "89012"] },
  { name: "Reno", stateCode: "NV", county: "Washoe", lat: 39.53, lng: -119.81, population: 264165, zips: ["89501", "89502", "89503"] },

  // New Hampshire
  { name: "Manchester", stateCode: "NH", county: "Hillsborough", lat: 42.99, lng: -71.46, population: 115644, zips: ["03101", "03102", "03103"] },
  { name: "Nashua", stateCode: "NH", county: "Hillsborough", lat: 42.77, lng: -71.47, population: 91322, zips: ["03060", "03062", "03063"] },

  // New Jersey
  { name: "Newark", stateCode: "NJ", county: "Essex", lat: 40.74, lng: -74.17, population: 311549, zips: ["07101", "07102", "07103"] },
  { name: "Jersey City", stateCode: "NJ", county: "Hudson", lat: 40.73, lng: -74.08, population: 292449, zips: ["07302", "07304", "07305"] },
  { name: "Trenton", stateCode: "NJ", county: "Mercer", lat: 40.22, lng: -74.76, population: 90871, zips: ["08601", "08608", "08609"] },
  { name: "Edison", stateCode: "NJ", county: "Middlesex", lat: 40.52, lng: -74.41, population: 107588, zips: ["08817", "08818", "08820"] },

  // New Mexico
  { name: "Albuquerque", stateCode: "NM", county: "Bernalillo", lat: 35.08, lng: -106.65, population: 564559, zips: ["87101", "87102", "87104"] },
  { name: "Las Cruces", stateCode: "NM", county: "Dona Ana", lat: 32.35, lng: -106.76, population: 111385, zips: ["88001", "88005", "88007"] },
  { name: "Santa Fe", stateCode: "NM", county: "Santa Fe", lat: 35.69, lng: -105.94, population: 89177, zips: ["87501", "87505", "87507"] },

  // New York
  { name: "New York City", stateCode: "NY", county: "New York", lat: 40.71, lng: -74.01, population: 8336817, zips: ["10001", "10002", "10003"] },
  { name: "Buffalo", stateCode: "NY", county: "Erie", lat: 42.89, lng: -78.88, population: 278349, zips: ["14201", "14202", "14203"] },
  { name: "Rochester", stateCode: "NY", county: "Monroe", lat: 43.16, lng: -77.61, population: 211328, zips: ["14604", "14607", "14608"] },
  { name: "Syracuse", stateCode: "NY", county: "Onondaga", lat: 43.05, lng: -76.15, population: 148620, zips: ["13201", "13202", "13203"] },
  { name: "Albany", stateCode: "NY", county: "Albany", lat: 42.65, lng: -73.75, population: 99224, zips: ["12201", "12202", "12203"] },

  // North Carolina
  { name: "Charlotte", stateCode: "NC", county: "Mecklenburg", lat: 35.23, lng: -80.84, population: 874579, zips: ["28202", "28203", "28204"] },
  { name: "Raleigh", stateCode: "NC", county: "Wake", lat: 35.78, lng: -78.64, population: 467665, zips: ["27601", "27603", "27604"] },
  { name: "Greensboro", stateCode: "NC", county: "Guilford", lat: 36.07, lng: -79.79, population: 299035, zips: ["27401", "27403", "27405"] },
  { name: "Durham", stateCode: "NC", county: "Durham", lat: 35.99, lng: -78.90, population: 283506, zips: ["27701", "27703", "27704"] },

  // North Dakota
  { name: "Fargo", stateCode: "ND", county: "Cass", lat: 46.88, lng: -96.79, population: 125990, zips: ["58102", "58103", "58104"] },
  { name: "Bismarck", stateCode: "ND", county: "Burleigh", lat: 46.81, lng: -100.78, population: 74112, zips: ["58501", "58502", "58503"] },

  // Ohio
  { name: "Columbus", stateCode: "OH", county: "Franklin", lat: 39.96, lng: -83.00, population: 905748, zips: ["43201", "43202", "43204"] },
  { name: "Cleveland", stateCode: "OH", county: "Cuyahoga", lat: 41.50, lng: -81.69, population: 372624, zips: ["44101", "44102", "44103"] },
  { name: "Cincinnati", stateCode: "OH", county: "Hamilton", lat: 39.10, lng: -84.51, population: 309317, zips: ["45201", "45202", "45203"] },
  { name: "Dayton", stateCode: "OH", county: "Montgomery", lat: 39.76, lng: -84.19, population: 137644, zips: ["45401", "45402", "45403"] },

  // Oklahoma
  { name: "Oklahoma City", stateCode: "OK", county: "Oklahoma", lat: 35.47, lng: -97.52, population: 681054, zips: ["73101", "73102", "73104"] },
  { name: "Tulsa", stateCode: "OK", county: "Tulsa", lat: 36.15, lng: -95.99, population: 413066, zips: ["74101", "74103", "74104"] },
  { name: "Norman", stateCode: "OK", county: "Cleveland", lat: 35.22, lng: -97.44, population: 128026, zips: ["73069", "73071", "73072"] },

  // Oregon
  { name: "Portland", stateCode: "OR", county: "Multnomah", lat: 45.52, lng: -122.68, population: 652503, zips: ["97201", "97202", "97204"] },
  { name: "Salem", stateCode: "OR", county: "Marion", lat: 44.94, lng: -123.04, population: 175535, zips: ["97301", "97302", "97303"] },
  { name: "Eugene", stateCode: "OR", county: "Lane", lat: 44.05, lng: -123.09, population: 176654, zips: ["97401", "97402", "97403"] },

  // Pennsylvania
  { name: "Philadelphia", stateCode: "PA", county: "Philadelphia", lat: 39.95, lng: -75.17, population: 1603797, zips: ["19101", "19102", "19103"] },
  { name: "Pittsburgh", stateCode: "PA", county: "Allegheny", lat: 40.44, lng: -80.00, population: 302971, zips: ["15201", "15203", "15206"] },
  { name: "Allentown", stateCode: "PA", county: "Lehigh", lat: 40.60, lng: -75.47, population: 126092, zips: ["18101", "18102", "18103"] },

  // Rhode Island
  { name: "Providence", stateCode: "RI", county: "Providence", lat: 41.82, lng: -71.41, population: 190934, zips: ["02901", "02902", "02903"] },
  { name: "Warwick", stateCode: "RI", county: "Kent", lat: 41.70, lng: -71.42, population: 82823, zips: ["02886", "02887", "02888"] },

  // South Carolina
  { name: "Charleston", stateCode: "SC", county: "Charleston", lat: 32.78, lng: -79.93, population: 150227, zips: ["29401", "29403", "29405"] },
  { name: "Columbia", stateCode: "SC", county: "Richland", lat: 34.00, lng: -81.03, population: 131674, zips: ["29201", "29203", "29204"] },
  { name: "Greenville", stateCode: "SC", county: "Greenville", lat: 34.85, lng: -82.40, population: 72095, zips: ["29601", "29605", "29607"] },

  // South Dakota
  { name: "Sioux Falls", stateCode: "SD", county: "Minnehaha", lat: 43.55, lng: -96.73, population: 192517, zips: ["57101", "57103", "57104"] },
  { name: "Rapid City", stateCode: "SD", county: "Pennington", lat: 44.08, lng: -103.23, population: 79312, zips: ["57701", "57702", "57703"] },

  // Tennessee
  { name: "Nashville", stateCode: "TN", county: "Davidson", lat: 36.16, lng: -86.78, population: 689447, zips: ["37201", "37203", "37204"] },
  { name: "Memphis", stateCode: "TN", county: "Shelby", lat: 35.15, lng: -90.05, population: 633104, zips: ["38101", "38103", "38104"] },
  { name: "Knoxville", stateCode: "TN", county: "Knox", lat: 35.96, lng: -83.92, population: 190740, zips: ["37901", "37902", "37909"] },
  { name: "Chattanooga", stateCode: "TN", county: "Hamilton", lat: 35.05, lng: -85.31, population: 181099, zips: ["37401", "37402", "37403"] },

  // Texas
  { name: "Houston", stateCode: "TX", county: "Harris", lat: 29.76, lng: -95.37, population: 2304580, zips: ["77001", "77002", "77003"] },
  { name: "San Antonio", stateCode: "TX", county: "Bexar", lat: 29.42, lng: -98.49, population: 1547253, zips: ["78201", "78202", "78204"] },
  { name: "Dallas", stateCode: "TX", county: "Dallas", lat: 32.78, lng: -96.80, population: 1304379, zips: ["75201", "75202", "75203"] },
  { name: "Austin", stateCode: "TX", county: "Travis", lat: 30.27, lng: -97.74, population: 978908, zips: ["73301", "78701", "78702"] },
  { name: "Fort Worth", stateCode: "TX", county: "Tarrant", lat: 32.75, lng: -97.33, population: 918915, zips: ["76101", "76102", "76104"] },
  { name: "El Paso", stateCode: "TX", county: "El Paso", lat: 31.76, lng: -106.44, population: 681728, zips: ["79901", "79902", "79903"] },
  { name: "Arlington", stateCode: "TX", county: "Tarrant", lat: 32.74, lng: -97.11, population: 394266, zips: ["76001", "76002", "76006"] },
  { name: "Corpus Christi", stateCode: "TX", county: "Nueces", lat: 27.80, lng: -97.40, population: 317863, zips: ["78401", "78404", "78405"] },
  { name: "Plano", stateCode: "TX", county: "Collin", lat: 33.02, lng: -96.70, population: 285494, zips: ["75023", "75024", "75025"] },

  // Utah
  { name: "Salt Lake City", stateCode: "UT", county: "Salt Lake", lat: 40.76, lng: -111.89, population: 199723, zips: ["84101", "84102", "84103"] },
  { name: "West Valley City", stateCode: "UT", county: "Salt Lake", lat: 40.69, lng: -112.00, population: 140230, zips: ["84118", "84119", "84120"] },
  { name: "Provo", stateCode: "UT", county: "Utah", lat: 40.23, lng: -111.66, population: 115162, zips: ["84601", "84604", "84606"] },

  // Vermont
  { name: "Burlington", stateCode: "VT", county: "Chittenden", lat: 44.48, lng: -73.21, population: 44743, zips: ["05401", "05402", "05403"] },
  { name: "South Burlington", stateCode: "VT", county: "Chittenden", lat: 44.47, lng: -73.17, population: 20790, zips: ["05403"] },

  // Virginia
  { name: "Virginia Beach", stateCode: "VA", county: "Virginia Beach", lat: 36.85, lng: -75.98, population: 459470, zips: ["23450", "23451", "23452"] },
  { name: "Norfolk", stateCode: "VA", county: "Norfolk", lat: 36.85, lng: -76.29, population: 238005, zips: ["23501", "23502", "23503"] },
  { name: "Richmond", stateCode: "VA", county: "Richmond City", lat: 37.54, lng: -77.44, population: 226610, zips: ["23218", "23219", "23220"] },
  { name: "Arlington", stateCode: "VA", county: "Arlington", lat: 38.88, lng: -77.10, population: 238643, zips: ["22201", "22202", "22203"] },

  // Washington
  { name: "Seattle", stateCode: "WA", county: "King", lat: 47.61, lng: -122.33, population: 737015, zips: ["98101", "98102", "98103"] },
  { name: "Spokane", stateCode: "WA", county: "Spokane", lat: 47.66, lng: -117.43, population: 228989, zips: ["99201", "99202", "99203"] },
  { name: "Tacoma", stateCode: "WA", county: "Pierce", lat: 47.25, lng: -122.44, population: 219346, zips: ["98401", "98402", "98403"] },
  { name: "Vancouver", stateCode: "WA", county: "Clark", lat: 45.64, lng: -122.66, population: 190915, zips: ["98660", "98661", "98663"] },

  // West Virginia
  { name: "Charleston", stateCode: "WV", county: "Kanawha", lat: 38.35, lng: -81.63, population: 48006, zips: ["25301", "25302", "25304"] },
  { name: "Huntington", stateCode: "WV", county: "Cabell", lat: 38.42, lng: -82.45, population: 46842, zips: ["25701", "25703", "25704"] },

  // Wisconsin
  { name: "Milwaukee", stateCode: "WI", county: "Milwaukee", lat: 43.04, lng: -87.91, population: 577222, zips: ["53201", "53202", "53203"] },
  { name: "Madison", stateCode: "WI", county: "Dane", lat: 43.07, lng: -89.40, population: 269840, zips: ["53701", "53703", "53704"] },
  { name: "Green Bay", stateCode: "WI", county: "Brown", lat: 44.51, lng: -88.02, population: 107395, zips: ["54301", "54302", "54303"] },

  // Wyoming
  { name: "Cheyenne", stateCode: "WY", county: "Laramie", lat: 41.14, lng: -104.82, population: 65132, zips: ["82001", "82007", "82009"] },
  { name: "Casper", stateCode: "WY", county: "Natrona", lat: 42.87, lng: -106.31, population: 59324, zips: ["82601", "82604", "82609"] },

  // DC
  { name: "Washington", stateCode: "DC", county: "District of Columbia", lat: 38.91, lng: -77.04, population: 689545, zips: ["20001", "20002", "20003"] },

  // Puerto Rico
  { name: "San Juan", stateCode: "PR", county: "San Juan", lat: 18.47, lng: -66.11, population: 318441, zips: ["00901", "00907", "00909"] },
  { name: "Bayamon", stateCode: "PR", county: "Bayamon", lat: 18.40, lng: -66.16, population: 185996, zips: ["00956", "00957", "00959"] },
  { name: "Ponce", stateCode: "PR", county: "Ponce", lat: 18.01, lng: -66.61, population: 132502, zips: ["00716", "00717", "00730"] },

  // Guam
  { name: "Hagatna", stateCode: "GU", county: "Guam", lat: 13.47, lng: 144.75, population: 1051, zips: ["96910"] },
  { name: "Dededo", stateCode: "GU", county: "Guam", lat: 13.52, lng: 144.84, population: 46842, zips: ["96929"] },

  // US Virgin Islands
  { name: "Charlotte Amalie", stateCode: "VI", county: "St. Thomas", lat: 18.34, lng: -64.93, population: 18481, zips: ["00801", "00802"] },
  { name: "Christiansted", stateCode: "VI", county: "St. Croix", lat: 17.75, lng: -64.70, population: 2626, zips: ["00820", "00823"] },

  // American Samoa
  { name: "Pago Pago", stateCode: "AS", county: "American Samoa", lat: -14.28, lng: -170.70, population: 3656, zips: ["96799"] },

  // Northern Mariana Islands
  { name: "Saipan", stateCode: "MP", county: "Northern Mariana Islands", lat: 15.18, lng: 145.75, population: 48220, zips: ["96950"] },
];
