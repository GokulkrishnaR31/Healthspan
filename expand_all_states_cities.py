import os

aqi_context_code = """import { createContext, useContext, useState, useEffect } from 'react'

const AQIContext = createContext(null)

// ── MASTER COMPREHENSIVE CITY DATABASE (All 28 States + 8 UTs Covered) ─────
export const MASTER_CITY_DATA = {
  // ── 1. ANDHRA PRADESH
  'Visakhapatnam':      { state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, aqi: 112, status: 'Moderate',     pm25: 48.0,  pm10: 108.0, nox: 31.2, so2: 14.0, co: 1.05, o3: 26.5, station: 'GVMCAir CAAQMS (APPCB)', temp: '28.8°C', wind: '10.5 km/h ➔ E', hum: '78%', mix: '850m (Good)', cat: 'Moderate', delta: '+0.8%' },
  'Amaravati':          { state: 'Andhra Pradesh', lat: 16.5131, lng: 80.5165, aqi: 98,  status: 'Satisfactory', pm25: 38.4,  pm10: 88.0,  nox: 24.5, so2: 11.2, co: 0.95, o3: 24.0, station: 'Secretariat CAAQMS (APPCB)',  temp: '29.2°C', wind: '8.4 km/h ↘ SE', hum: '72%', mix: '880m (Good)', cat: 'Satisfactory', delta: '-1.5%' },
  'Vijayawada':         { state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480, aqi: 118, status: 'Moderate',     pm25: 52.0,  pm10: 114.0, nox: 34.0, so2: 13.5, co: 1.10, o3: 27.0, station: 'Benz Circle (APPCB)',         temp: '30.1°C', wind: '9.0 km/h ➔ E',  hum: '70%', mix: '820m (Good)', cat: 'Moderate', delta: '+1.8%' },

  // ── 2. ARUNACHAL PRADESH
  'Itanagar':           { state: 'Arunachal Pradesh', lat: 27.0844, lng: 93.6053, aqi: 54, status: 'Satisfactory', pm25: 19.5, pm10: 52.0, nox: 14.0, so2: 4.8, co: 0.52, o3: 16.0, station: 'Civil Secretariat (APSPCB)', temp: '17.5°C', wind: '6.4 km/h ↗ NE', hum: '68%', mix: '1150m (High)', cat: 'Satisfactory', delta: '-2.0%' },

  // ── 3. ASSAM
  'Guwahati':           { state: 'Assam',           lat: 26.1445, lng: 91.7362, aqi: 114, status: 'Moderate',     pm25: 52.0,  pm10: 112.0, nox: 29.5, so2: 11.0, co: 1.08, o3: 25.0, station: 'Panbazar CAAQMS (PCBA)',     temp: '24.8°C', wind: '5.6 km/h ↗ NE', hum: '74%', mix: '720m (Good)', cat: 'Moderate', delta: '+1.5%' },
  'Dispur':             { state: 'Assam',           lat: 26.1408, lng: 91.7907, aqi: 108, status: 'Moderate',     pm25: 46.0,  pm10: 102.0, nox: 27.0, so2: 10.2, co: 1.02, o3: 23.5, station: 'Capital Complex (PCBA)',     temp: '24.5°C', wind: '5.2 km/h ↗ NE', hum: '75%', mix: '740m (Good)', cat: 'Moderate', delta: '+0.5%' },

  // ── 4. BIHAR
  'Patna':              { state: 'Bihar',          lat: 25.5941, lng: 85.1376, aqi: 258, status: 'Poor',         pm25: 195.0, pm10: 288.0, nox: 62.0, so2: 18.5, co: 1.92, o3: 39.0, station: 'Muradpur CAAQMS (BSPCB)',    temp: '26.0°C', wind: '4.2 km/h ↖ NW', hum: '70%', mix: '430m (Low)', cat: 'Poor', delta: '+11.5%' },
  'Gaya':               { state: 'Bihar',          lat: 24.7914, lng: 85.0002, aqi: 235, status: 'Poor',         pm25: 172.0, pm10: 262.0, nox: 54.5, so2: 16.0, co: 1.75, o3: 36.0, station: 'Collectorate CAAQMS (BSPCB)', temp: '25.8°C', wind: '4.5 km/h ↖ NW', hum: '66%', mix: '460m (Low)', cat: 'Poor', delta: '+8.4%' },

  // ── 5. CHHATTISGARH
  'Raipur':             { state: 'Chhattisgarh',   lat: 21.2514, lng: 81.6296, aqi: 168, status: 'Moderate',     pm25: 78.4,  pm10: 162.0, nox: 39.0, so2: 16.5, co: 1.42, o3: 32.0, station: 'AIIMS CAAQMS (CECB)',        temp: '28.5°C', wind: '6.8 km/h ➔ E',  hum: '58%', mix: '680m (Mod)', cat: 'Moderate', delta: '+2.8%' },
  'Bhilai':             { state: 'Chhattisgarh',   lat: 21.1938, lng: 81.3509, aqi: 182, status: 'Moderate',     pm25: 86.0,  pm10: 174.0, nox: 44.0, so2: 21.0, co: 1.55, o3: 34.5, station: 'Steel City CAAQMS (CECB)',   temp: '28.8°C', wind: '6.2 km/h ➔ E',  hum: '56%', mix: '650m (Mod)', cat: 'Moderate', delta: '+4.0%' },

  // ── 6. GOA
  'Panaji':             { state: 'Goa',            lat: 15.4909, lng: 73.8278, aqi: 62,  status: 'Satisfactory', pm25: 24.0,  pm10: 61.0,  nox: 18.2, so2: 7.5,  co: 0.72, o3: 21.0, station: 'Altinho CAAQMS (GSPCB)',      temp: '28.2°C', wind: '11.8 km/h ➔ W', hum: '82%', mix: '920m (High)', cat: 'Satisfactory', delta: '-3.2%' },

  // ── 7. GUJARAT
  'Gandhinagar':        { state: 'Gujarat',        lat: 23.2156, lng: 72.6369, aqi: 158, status: 'Moderate',     pm25: 72.0,  pm10: 152.0, nox: 36.5, so2: 12.8, co: 1.25, o3: 32.5, station: 'Sector 10 CAAQMS (GPCB)',     temp: '30.8°C', wind: '7.5 km/h ↗ NE', hum: '54%', mix: '710m (Good)', cat: 'Moderate', delta: '+1.5%' },
  'Ahmedabad':          { state: 'Gujarat',        lat: 23.0225, lng: 72.5714, aqi: 184, status: 'Moderate',     pm25: 88.5,  pm10: 176.0, nox: 42.1, so2: 14.5, co: 1.45, o3: 36.2, station: 'Maninagar CAAQMS (GPCB)',    temp: '31.2°C', wind: '7.8 km/h ↗ NE', hum: '52%', mix: '680m (Mod)', cat: 'Moderate', delta: '+4.2%' },
  'Surat':              { state: 'Gujarat',        lat: 21.1702, lng: 72.8311, aqi: 162, status: 'Moderate',     pm25: 74.0,  pm10: 155.0, nox: 36.8, so2: 18.2, co: 1.30, o3: 31.0, station: 'Athwa CAAQMS (GPCB)',        temp: '30.5°C', wind: '9.4 km/h ➔ W',  hum: '68%', mix: '750m (Good)', cat: 'Moderate', delta: '-2.1%' },

  // ── 8. HARYANA
  'Gurgaon':            { state: 'Haryana',        lat: 28.4595, lng: 77.0266, aqi: 295, status: 'Very Poor',    pm25: 232.0, pm10: 342.0, nox: 67.0, so2: 22.5, co: 2.05, o3: 43.5, station: 'Vikas Sadan CAAQMS (HSPCB)',  temp: '27.4°C', wind: '4.5 km/h ↖ NW', hum: '62%', mix: '410m (Low)', cat: 'Very Poor', delta: '+16.2%' },
  'Faridabad':          { state: 'Haryana',        lat: 28.4089, lng: 77.3178, aqi: 288, status: 'Very Poor',    pm25: 224.0, pm10: 335.0, nox: 65.2, so2: 21.0, co: 1.98, o3: 42.0, station: 'Sector 16A CAAQMS (HSPCB)',  temp: '27.2°C', wind: '4.2 km/h ↖ NW', hum: '63%', mix: '420m (Low)', cat: 'Very Poor', delta: '+14.5%' },

  // ── 9. HIMACHAL PRADESH
  'Shimla':             { state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, aqi: 58, status: 'Satisfactory', pm25: 22.0, pm10: 56.0, nox: 16.5, so2: 5.2, co: 0.62, o3: 19.0, station: 'Ridge CAAQMS (HPSPCB)',       temp: '14.2°C', wind: '7.5 km/h ↗ NE', hum: '55%', mix: '1300m (High)', cat: 'Satisfactory', delta: '-1.8%' },
  'Dharamshala':        { state: 'Himachal Pradesh', lat: 32.2190, lng: 76.3234, aqi: 46, status: 'Good',         pm25: 16.0, pm10: 44.0, nox: 12.0, so2: 4.1, co: 0.48, o3: 16.5, station: 'Kotwali Bazar (HPSPCB)',     temp: '16.5°C', wind: '8.0 km/h ↗ NE', hum: '58%', mix: '1400m (High)', cat: 'Good', delta: '-2.5%' },

  // ── 10. JHARKHAND
  'Ranchi':             { state: 'Jharkhand',      lat: 23.3441, lng: 85.3096, aqi: 188, status: 'Moderate',     pm25: 96.0,  pm10: 192.0, nox: 46.0, so2: 17.5, co: 1.58, o3: 35.0, station: 'Albert Ekka Chowk (JSPCB)',   temp: '25.4°C', wind: '5.8 km/h ➔ E',  hum: '62%', mix: '620m (Mod)', cat: 'Moderate', delta: '+5.4%' },
  'Jamshedpur':         { state: 'Jharkhand',      lat: 22.8046, lng: 86.2029, aqi: 214, status: 'Poor',         pm25: 148.0, pm10: 228.0, nox: 56.0, so2: 24.5, co: 1.88, o3: 38.5, station: 'Bistupur CAAQMS (JSPCB)',    temp: '26.8°C', wind: '5.2 km/h ➔ E',  hum: '65%', mix: '540m (Mod)', cat: 'Poor', delta: '+8.8%' },

  // ── 11. KARNATAKA
  'Bengaluru':          { state: 'Karnataka',      lat: 12.9716, lng: 77.5946, aqi: 63,  status: 'Satisfactory', pm25: 24.5,  pm10: 62.0,  nox: 22.4, so2: 8.5,  co: 0.85, o3: 24.2, station: 'BTM Layout CAAQMS (KSPCB)',  temp: '24.5°C', wind: '9.8 km/h ↘ SE', hum: '62%', mix: '950m (High)', cat: 'Satisfactory', delta: '-5.2%' },
  'Mysuru':             { state: 'Karnataka',      lat: 12.2958, lng: 76.6394, aqi: 52,  status: 'Satisfactory', pm25: 19.0,  pm10: 51.0,  nox: 18.0, so2: 6.8,  co: 0.68, o3: 20.5, station: 'Hebbal CAAQMS (KSPCB)',      temp: '25.1°C', wind: '8.4 km/h ↘ SE', hum: '64%', mix: '980m (High)', cat: 'Satisfactory', delta: '-3.8%' },

  // ── 12. KERALA
  'Thiruvananthapuram': { state: 'Kerala',         lat:  8.5241, lng: 76.9366, aqi: 54,  status: 'Satisfactory', pm25: 20.0,  pm10: 52.0,  nox: 16.5, so2: 6.2,  co: 0.70, o3: 18.5, station: 'Plammoodu CAAQMS (KSPCB)',   temp: '28.0°C', wind: '12.0 km/h ➔ W', hum: '86%', mix: '940m (High)', cat: 'Satisfactory', delta: '-2.0%' },
  'Kochi':              { state: 'Kerala',         lat:  9.9312, lng: 76.2673, aqi: 58,  status: 'Satisfactory', pm25: 22.0,  pm10: 56.0,  nox: 18.5, so2: 6.8,  co: 0.76, o3: 19.5, station: 'Vyttila CAAQMS (KSPCB)',      temp: '27.5°C', wind: '11.0 km/h ➔ W', hum: '84%', mix: '910m (High)', cat: 'Satisfactory', delta: '-2.8%' },

  // ── 13. MADHYA PRADESH
  'Bhopal':             { state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, aqi: 196, status: 'Moderate',     pm25: 104.0, pm10: 204.0, nox: 48.0, so2: 17.0, co: 1.62, o3: 36.5, station: 'TT Nagar CAAQMS (MPPCB)',     temp: '27.4°C', wind: '6.2 km/h ↗ NE', hum: '54%', mix: '620m (Mod)', cat: 'Moderate', delta: '+4.5%' },
  'Indore':             { state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, aqi: 168, status: 'Moderate',     pm25: 79.5,  pm10: 165.0, nox: 41.2, so2: 15.0, co: 1.44, o3: 33.0, station: 'Chhoti Gwaltoli (MPPCB)',    temp: '28.1°C', wind: '7.0 km/h ↗ NE', hum: '50%', mix: '680m (Mod)', cat: 'Moderate', delta: '+2.1%' },

  // ── 14. MAHARASHTRA
  'Mumbai':             { state: 'Maharashtra',    lat: 19.0760, lng: 72.8777, aqi: 172, status: 'Moderate',     pm25: 79.2,  pm10: 164.5, nox: 48.6, so2: 15.2, co: 1.52, o3: 28.4, station: 'Bandra CAAQMS (MPCB)',       temp: '29.4°C', wind: '11.2 km/h ➔ W', hum: '76%', mix: '820m (Good)', cat: 'Moderate', delta: '-1.4%' },
  'Pune':               { state: 'Maharashtra',    lat: 18.5204, lng: 73.8567, aqi: 138, status: 'Moderate',     pm25: 58.4,  pm10: 132.0, nox: 35.1, so2: 11.8, co: 1.22, o3: 32.1, station: 'Shivajinagar (MPCB)',       temp: '26.8°C', wind: '8.5 km/h ↗ NE', hum: '58%', mix: '780m (Good)', cat: 'Moderate', delta: '+2.0%' },
  'Nagpur':             { state: 'Maharashtra',    lat: 21.1458, lng: 79.0882, aqi: 152, status: 'Moderate',     pm25: 68.0,  pm10: 148.0, nox: 38.0, so2: 14.2, co: 1.35, o3: 31.0, station: 'Civil Lines CAAQMS (MPCB)',  temp: '29.2°C', wind: '6.5 km/h ➔ E',  hum: '52%', mix: '720m (Good)', cat: 'Moderate', delta: '+1.6%' },

  // ── 15. MANIPUR
  'Imphal':             { state: 'Manipur',        lat: 24.8170, lng: 93.9368, aqi: 55,  status: 'Satisfactory', pm25: 20.2,  pm10: 53.0,  nox: 14.5, so2: 4.9,  co: 0.54, o3: 16.8, station: 'Kangla Fort (MSPCB)',         temp: '18.4°C', wind: '5.8 km/h ↗ NE', hum: '70%', mix: '1180m (High)', cat: 'Satisfactory', delta: '-1.4%' },

  // ── 16. MEGHALAYA
  'Shillong':           { state: 'Meghalaya',      lat: 25.5788, lng: 91.8933, aqi: 62,  status: 'Satisfactory', pm25: 23.0,  pm10: 59.0,  nox: 16.0, so2: 5.5,  co: 0.65, o3: 18.0, station: 'Laban CAAQMS (MSPCB)',        temp: '18.2°C', wind: '6.5 km/h ↗ NE', hum: '72%', mix: '1100m (High)', cat: 'Satisfactory', delta: '-3.8%' },

  // ── 17. MIZORAM
  'Aizawl':             { state: 'Mizoram',        lat: 23.7271, lng: 92.7176, aqi: 24,  status: 'Good',         pm25: 8.5,   pm10: 22.0,  nox: 8.2,  so2: 3.1,  co: 0.32, o3: 14.5, station: 'Bawngkawn CAAQMS (MPCB)',    temp: '19.5°C', wind: '8.5 km/h ↗ NE', hum: '65%', mix: '1200m (High)', cat: 'Good', delta: '-1.5%' },

  // ── 18. NAGALAND
  'Kohima':             { state: 'Nagaland',       lat: 25.6701, lng: 94.1077, aqi: 48,  status: 'Good',         pm25: 17.0,  pm10: 46.0,  nox: 12.5, so2: 4.2,  co: 0.48, o3: 15.0, station: 'Secretariat CAAQMS (NPCB)',   temp: '17.8°C', wind: '6.2 km/h ↗ NE', hum: '71%', mix: '1220m (High)', cat: 'Good', delta: '-2.2%' },
  'Dimapur':            { state: 'Nagaland',       lat: 25.9091, lng: 93.7265, aqi: 65,  status: 'Satisfactory', pm25: 25.0,  pm10: 64.0,  nox: 18.0, so2: 6.0,  co: 0.72, o3: 19.2, station: 'City Centre CAAQMS (NPCB)',   temp: '22.4°C', wind: '5.5 km/h ↗ NE', hum: '74%', mix: '980m (High)', cat: 'Satisfactory', delta: '-1.0%' },

  // ── 19. ODISHA
  'Bhubaneswar':        { state: 'Odisha',         lat: 20.2961, lng: 85.8245, aqi: 158, status: 'Moderate',     pm25: 72.0,  pm10: 152.0, nox: 36.5, so2: 13.8, co: 1.30, o3: 31.5, station: 'Patia CAAQMS (OSPCB)',        temp: '28.6°C', wind: '9.2 km/h ➔ E',  hum: '76%', mix: '760m (Good)', cat: 'Moderate', delta: '+1.5%' },
  'Cuttack':            { state: 'Odisha',         lat: 20.4625, lng: 85.8828, aqi: 164, status: 'Moderate',     pm25: 76.5,  pm10: 158.0, nox: 38.0, so2: 14.5, co: 1.38, o3: 32.0, station: 'Badambadi CAAQMS (OSPCB)',    temp: '28.4°C', wind: '8.8 km/h ➔ E',  hum: '78%', mix: '740m (Good)', cat: 'Moderate', delta: '+2.1%' },

  // ── 20. PUNJAB
  'Amritsar':           { state: 'Punjab',         lat: 31.6340, lng: 74.8723, aqi: 242, status: 'Poor',         pm25: 178.0, pm10: 268.0, nox: 58.0, so2: 17.0, co: 1.88, o3: 38.5, station: 'Golden Temple Area (PPCB)',  temp: '24.2°C', wind: '4.8 km/h ↖ NW', hum: '60%', mix: '450m (Low)', cat: 'Poor', delta: '+8.2%' },
  'Ludhiana':           { state: 'Punjab',         lat: 30.9010, lng: 75.8573, aqi: 256, status: 'Poor',         pm25: 192.0, pm10: 284.0, nox: 62.5, so2: 19.5, co: 1.95, o3: 40.0, station: 'PAU CAAQMS (PPCB)',          temp: '24.5°C', wind: '4.5 km/h ↖ NW', hum: '62%', mix: '430m (Low)', cat: 'Poor', delta: '+10.4%' },

  // ── 21. RAJASTHAN
  'Jaipur':             { state: 'Rajasthan',      lat: 26.9124, lng: 75.7873, aqi: 228, status: 'Poor',         pm25: 168.0, pm10: 252.0, nox: 61.2, so2: 21.0, co: 1.95, o3: 41.0, station: 'Adarsh Nagar (RSPCB)',       temp: '26.5°C', wind: '5.1 km/h ↖ NW', hum: '44%', mix: '480m (Low)', cat: 'Poor', delta: '+9.4%' },
  'Jodhpur':            { state: 'Rajasthan',      lat: 26.2389, lng: 73.0243, aqi: 215, status: 'Poor',         pm25: 154.0, pm10: 238.0, nox: 52.0, so2: 18.0, co: 1.78, o3: 37.5, station: 'Collectorate CAAQMS (RSPCB)', temp: '28.0°C', wind: '6.4 km/h ↖ NW', hum: '38%', mix: '520m (Mod)', cat: 'Poor', delta: '+6.5%' },

  // ── 22. SIKKIM
  'Gangtok':            { state: 'Sikkim',         lat: 27.3314, lng: 88.6138, aqi: 53,  status: 'Satisfactory', pm25: 19.0,  pm10: 51.0,  nox: 14.2, so2: 4.8,  co: 0.55, o3: 16.5, station: 'Deorali CAAQMS (SPCB)',       temp: '16.8°C', wind: '7.2 km/h ↗ NE', hum: '68%', mix: '1150m (High)', cat: 'Satisfactory', delta: '-2.0%' },

  // ── 23. TAMIL NADU
  'Chennai':            { state: 'Tamil Nadu',     lat: 13.0827, lng: 80.2707, aqi: 78,  status: 'Satisfactory', pm25: 32.1,  pm10: 74.5,  nox: 26.2, so2: 9.8,  co: 0.94, o3: 22.0, station: 'Alandur CAAQMS (TNPCB)',     temp: '28.6°C', wind: '12.4 km/h ➔ E', hum: '81%', mix: '880m (Good)', cat: 'Satisfactory', delta: '-3.1%' },
  'Coimbatore':         { state: 'Tamil Nadu',     lat: 11.0168, lng: 76.9558, aqi: 68,  status: 'Satisfactory', pm25: 28.0,  pm10: 66.0,  nox: 24.0, so2: 8.0,  co: 0.88, o3: 21.0, station: 'SIDCO CAAQMS (TNPCB)',       temp: '26.2°C', wind: '8.8 km/h ↘ SE', hum: '65%', mix: '920m (High)', cat: 'Satisfactory', delta: '-4.2%' },
  'Madurai':            { state: 'Tamil Nadu',     lat:  9.9252, lng: 78.1198, aqi: 72,  status: 'Satisfactory', pm25: 29.5,  pm10: 70.0,  nox: 25.0, so2: 8.5,  co: 0.90, o3: 21.5, station: 'Periyar Bus Stand (TNPCB)',   temp: '29.5°C', wind: '9.0 km/h ➔ E',  hum: '68%', mix: '860m (Good)', cat: 'Satisfactory', delta: '-2.5%' },

  // ── 24. TELANGANA
  'Hyderabad':          { state: 'Telangana',      lat: 17.3850, lng: 78.4867, aqi: 146, status: 'Moderate',     pm25: 64.2,  pm10: 138.0, nox: 38.0, so2: 13.2, co: 1.28, o3: 31.5, station: 'Sanathnagar (TSPCB)',        temp: '28.1°C', wind: '7.5 km/h ➔ E',  hum: '59%', mix: '760m (Good)', cat: 'Moderate', delta: '+1.2%' },
  'Warangal':           { state: 'Telangana',      lat: 17.9689, lng: 79.5941, aqi: 128, status: 'Moderate',     pm25: 56.0,  pm10: 122.0, nox: 32.0, so2: 11.5, co: 1.15, o3: 28.0, station: 'NIT Warangal CAAQMS (TSPCB)', temp: '28.8°C', wind: '7.0 km/h ➔ E',  hum: '62%', mix: '790m (Good)', cat: 'Moderate', delta: '-0.5%' },

  // ── 25. TRIPURA
  'Agartala':           { state: 'Tripura',        lat: 23.8315, lng: 91.2868, aqi: 72,  status: 'Satisfactory', pm25: 28.5,  pm10: 71.0,  nox: 20.0, so2: 7.2,  co: 0.82, o3: 22.0, station: 'Kunjaban CAAQMS (TSPCB)',     temp: '23.5°C', wind: '6.0 km/h ↗ NE', hum: '76%', mix: '920m (High)', cat: 'Satisfactory', delta: '-1.2%' },

  // ── 26. UTTAR PRADESH
  'Lucknow':            { state: 'Uttar Pradesh',  lat: 26.8467, lng: 80.9462, aqi: 298, status: 'Very Poor',    pm25: 235.0, pm10: 345.0, nox: 68.5, so2: 24.1, co: 2.10, o3: 44.2, station: 'Talkatora CAAQMS (UPPCB)',   temp: '25.4°C', wind: '3.8 km/h ↖ NW', hum: '68%', mix: '390m (Low)', cat: 'Very Poor', delta: '+14.2%' },
  'Kanpur':             { state: 'Uttar Pradesh',  lat: 26.4499, lng: 80.3319, aqi: 285, status: 'Very Poor',    pm25: 218.0, pm10: 320.0, nox: 64.0, so2: 22.0, co: 1.98, o3: 41.5, station: 'Nehru Nagar (UPPCB)',         temp: '25.6°C', wind: '4.0 km/h ↖ NW', hum: '66%', mix: '410m (Low)', cat: 'Very Poor', delta: '+12.5%' },
  'Varanasi':           { state: 'Uttar Pradesh',  lat: 25.3176, lng: 82.9739, aqi: 275, status: 'Very Poor',    pm25: 208.0, pm10: 310.0, nox: 61.5, so2: 20.5, co: 1.92, o3: 39.8, station: 'BHU Campus (UPPCB)',          temp: '26.2°C', wind: '4.2 km/h ↖ NW', hum: '67%', mix: '420m (Low)', cat: 'Very Poor', delta: '+11.0%' },
  'Noida':              { state: 'Uttar Pradesh',  lat: 28.5355, lng: 77.3910, aqi: 305, status: 'Severe',       pm25: 252.0, pm10: 368.0, nox: 72.0, so2: 25.0, co: 2.12, o3: 44.0, station: 'Sector 62 CAAQMS (UPPCB)',   temp: '27.5°C', wind: '4.2 km/h ↖ NW', hum: '64%', mix: '400m (Low)', cat: 'Severe', delta: '+17.4%' },

  // ── 27. UTTARAKHAND
  'Dehradun':           { state: 'Uttarakhand',    lat: 30.3165, lng: 78.0322, aqi: 124, status: 'Moderate',     pm25: 54.0,  pm10: 122.0, nox: 28.5, so2: 10.2, co: 1.10, o3: 26.5, station: 'Clock Tower CAAQMS (UEPPCB)', temp: '20.5°C', wind: '6.0 km/h ↗ NE', hum: '62%', mix: '820m (Good)', cat: 'Moderate', delta: '+0.5%' },
  'Haridwar':           { state: 'Uttarakhand',    lat: 29.9457, lng: 78.1642, aqi: 138, status: 'Moderate',     pm25: 62.0,  pm10: 135.0, nox: 32.0, so2: 12.0, co: 1.22, o3: 28.0, station: 'Roshnabad CAAQMS (UEPPCB)',   temp: '22.0°C', wind: '5.5 km/h ↗ NE', hum: '65%', mix: '780m (Good)', cat: 'Moderate', delta: '+1.8%' },

  // ── 28. WEST BENGAL
  'Kolkata':            { state: 'West Bengal',    lat: 22.5726, lng: 88.3639, aqi: 208, status: 'Poor',         pm25: 142.0, pm10: 218.0, nox: 54.0, so2: 19.5, co: 1.85, o3: 38.0, station: 'Victoria Memorial (WBPCB)',   temp: '27.2°C', wind: '5.4 km/h ↙ SW', hum: '72%', mix: '520m (Mod)', cat: 'Poor', delta: '+8.6%' },
  'Howrah':             { state: 'West Bengal',    lat: 22.5958, lng: 88.2636, aqi: 218, status: 'Poor',         pm25: 152.0, pm10: 232.0, nox: 58.0, so2: 21.0, co: 1.94, o3: 39.5, station: 'Padmapukur CAAQMS (WBPCB)',   temp: '27.4°C', wind: '5.2 km/h ↙ SW', hum: '74%', mix: '500m (Mod)', cat: 'Poor', delta: '+9.8%' },

  // ── 29. DELHI (UT / NCT)
  'Delhi':              { state: 'Delhi',          lat: 28.6139, lng: 77.2090, aqi: 312, status: 'Severe',       pm25: 262.4, pm10: 384.0, nox: 74.2, so2: 16.8, co: 2.14, o3: 42.5, station: 'Anand Vihar CAAQMS (DPCC)', temp: '27.8°C', wind: '4.2 km/h ↖ NW', hum: '64%', mix: '420m (Low)', cat: 'Hazardous', delta: '+18.4%' },

  // ── 30. CHANDIGARH (UT)
  'Chandigarh':         { state: 'Chandigarh',     lat: 30.7333, lng: 76.7794, aqi: 175, status: 'Moderate',     pm25: 84.0,  pm10: 162.0, nox: 41.0, so2: 12.5, co: 1.35, o3: 33.0, station: 'Sector 22 CAAQMS (CPCC)',    temp: '23.8°C', wind: '6.2 km/h ↖ NW', hum: '56%', mix: '620m (Mod)', cat: 'Moderate', delta: '+3.4%' },

  // ── 31. JAMMU AND KASHMIR (UT)
  'Srinagar':           { state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973, aqi: 68, status: 'Satisfactory', pm25: 28.0, pm10: 65.0, nox: 18.0, so2: 6.5, co: 0.85, o3: 21.0, station: 'Hyderpora CAAQMS (JKPCC)',   temp: '12.5°C', wind: '5.2 km/h ↗ NE', hum: '60%', mix: '1250m (High)', cat: 'Satisfactory', delta: '-1.5%' },
  'Jammu':              { state: 'Jammu and Kashmir', lat: 32.7266, lng: 74.8570, aqi: 142, status: 'Moderate',     pm25: 62.0, pm10: 135.0, nox: 34.0, so2: 12.0, co: 1.25, o3: 28.5, station: 'Bahu Plaza CAAQMS (JKPCC)',   temp: '22.8°C', wind: '6.0 km/h ↖ NW', hum: '58%', mix: '760m (Good)', cat: 'Moderate', delta: '+1.2%' },

  // ── 32. LADAKH (UT)
  'Leh':                { state: 'Ladakh',         lat: 34.1526, lng: 77.5771, aqi: 28,  status: 'Good',         pm25: 9.5,   pm10: 26.0,  nox: 7.5,  so2: 2.8,  co: 0.35, o3: 15.0, station: 'Leh Main Bazaar (LPCC)',      temp: '8.4°C',  wind: '9.5 km/h ↗ NE', hum: '42%', mix: '1500m (High)', cat: 'Good', delta: '-1.8%' },

  // ── 33. PUDUCHERRY (UT)
  'Puducherry':         { state: 'Puducherry',     lat: 11.9416, lng: 79.8083, aqi: 56,  status: 'Satisfactory', pm25: 21.5,  pm10: 55.0,  nox: 17.0, so2: 6.5,  co: 0.72, o3: 19.0, station: 'Muthialpet CAAQMS (PPCC)',    temp: '28.5°C', wind: '12.0 km/h ➔ E', hum: '80%', mix: '900m (High)', cat: 'Satisfactory', delta: '-2.4%' },

  // ── 34. ANDAMAN AND NICOBAR ISLANDS (UT)
  'Port Blair':         { state: 'Andaman and Nicobar Islands', lat: 11.6234, lng: 92.7265, aqi: 35, status: 'Good', pm25: 12.0, pm10: 32.0, nox: 9.2, so2: 3.5, co: 0.42, o3: 16.0, station: 'Aberdeen Bazaar (ANPCB)', temp: '27.8°C', wind: '14.2 km/h ➔ W', hum: '88%', mix: '1050m (High)', cat: 'Good', delta: '-2.0%' },

  // ── 35. DADRA AND NAGAR HAVELI AND DAMAN AND DIU (UT)
  'Daman':              { state: 'Dadra and Nagar Haveli and Daman and Diu', lat: 20.3974, lng: 72.8328, aqi: 92, status: 'Satisfactory', pm25: 36.0, pm10: 84.0, nox: 24.0, so2: 10.5, co: 0.92, o3: 24.5, station: 'Nani Daman CAAQMS (PCC)', temp: '29.0°C', wind: '10.5 km/h ➔ W', hum: '72%', mix: '860m (Good)', cat: 'Satisfactory', delta: '-1.0%' },

  // ── 36. LAKSHADWEEP (UT)
  'Kavaratti':          { state: 'Lakshadweep',    lat: 10.5669, lng: 72.6420, aqi: 22,  status: 'Good',         pm25: 7.8,   pm10: 20.5,  nox: 6.5,  so2: 2.2,  co: 0.28, o3: 14.0, station: 'Kavaratti Marine Station',    temp: '28.2°C', wind: '15.0 km/h ➔ W', hum: '85%', mix: '1100m (High)', cat: 'Good', delta: '-1.2%' },
}

export const STATE_CITIES = {
  'All India':                                  Object.keys(MASTER_CITY_DATA),
  'Andhra Pradesh':                             ['Visakhapatnam', 'Amaravati', 'Vijayawada'],
  'Arunachal Pradesh':                          ['Itanagar'],
  'Assam':                                      ['Guwahati', 'Dispur'],
  'Bihar':                                      ['Patna', 'Gaya'],
  'Chhattisgarh':                               ['Raipur', 'Bhilai'],
  'Goa':                                        ['Panaji'],
  'Gujarat':                                    ['Ahmedabad', 'Gandhinagar', 'Surat'],
  'Haryana':                                    ['Gurgaon', 'Faridabad'],
  'Himachal Pradesh':                           ['Shimla', 'Dharamshala'],
  'Jharkhand':                                  ['Ranchi', 'Jamshedpur'],
  'Karnataka':                                  ['Bengaluru', 'Mysuru'],
  'Kerala':                                     ['Thiruvananthapuram', 'Kochi'],
  'Madhya Pradesh':                             ['Bhopal', 'Indore'],
  'Maharashtra':                                ['Mumbai', 'Pune', 'Nagpur'],
  'Manipur':                                    ['Imphal'],
  'Meghalaya':                                  ['Shillong'],
  'Mizoram':                                    ['Aizawl'],
  'Nagaland':                                   ['Kohima', 'Dimapur'],
  'Odisha':                                     ['Bhubaneswar', 'Cuttack'],
  'Punjab':                                     ['Amritsar', 'Ludhiana'],
  'Rajasthan':                                  ['Jaipur', 'Jodhpur'],
  'Sikkim':                                     ['Gangtok'],
  'Tamil Nadu':                                 ['Chennai', 'Coimbatore', 'Madurai'],
  'Telangana':                                  ['Hyderabad', 'Warangal'],
  'Tripura':                                    ['Agartala'],
  'Uttar Pradesh':                              ['Lucknow', 'Kanpur', 'Varanasi', 'Noida'],
  'Uttarakhand':                                ['Dehradun', 'Haridwar'],
  'West Bengal':                                ['Kolkata', 'Howrah'],
  'Delhi':                                      ['Delhi'],
  'Chandigarh':                                 ['Chandigarh'],
  'Jammu and Kashmir':                          ['Srinagar', 'Jammu'],
  'Ladakh':                                     ['Leh'],
  'Puducherry':                                 ['Puducherry'],
  'Andaman and Nicobar Islands':                ['Port Blair'],
  'Dadra and Nagar Haveli and Daman and Diu':   ['Daman'],
  'Lakshadweep':                                ['Kavaratti'],
}

export const ALL_STATES = Object.keys(STATE_CITIES)
export const ALL_CITIES = Object.keys(MASTER_CITY_DATA)

export const AQI_COLORS = {
  Good:           '#10B981',
  Satisfactory:   '#84CC16',
  Moderate:       '#F59E0B',
  Poor:           '#F97316',
  'Very Poor':    '#EF4444',
  Severe:         '#BE123C',
  Hazardous:      '#881337',
  Unknown:        '#64748B',
}

export function getAQIColor(status) {
  return AQI_COLORS[status] ?? AQI_COLORS.Moderate
}

export function getAQIBadgeClass(status) {
  const map = {
    Good:           'badge-good',
    Satisfactory:   'badge-satisfactory',
    Moderate:       'badge-moderate',
    Poor:           'badge-poor',
    'Very Poor':    'badge-very-poor',
    Severe:         'badge-severe',
  }
  return map[status] ?? 'badge-moderate'
}

export function getCitiesForState(state) {
  if (!state || state === 'All India') return ALL_CITIES
  return STATE_CITIES[state] ?? [ALL_CITIES[0]]
}

export function getCityDetails(cityName) {
  return MASTER_CITY_DATA[cityName] ?? MASTER_CITY_DATA['Delhi']
}

export function AQIProvider({ children }) {
  const [selectedState, setSelectedState] = useState('All India')
  const [selectedCity,  setSelectedCity]  = useState('Delhi')

  useEffect(() => {
    const cities = getCitiesForState(selectedState)
    if (cities.length > 0 && !cities.includes(selectedCity)) {
      setSelectedCity(cities[0])
    }
  }, [selectedState])

  return (
    <AQIContext.Provider value={{
      selectedState, setSelectedState,
      selectedCity,  setSelectedCity,
    }}>
      {children}
    </AQIContext.Provider>
  )
}

export function useAQI() {
  const ctx = useContext(AQIContext)
  if (!ctx) throw new Error('useAQI must be used within AQIProvider')
  return ctx
}
"""

with open(r'g:\rproject\frontend\src\context\AQIContext.jsx', 'w', encoding='utf-8') as f:
    f.write(aqi_context_code)

print("Comprehensive coverage of ALL 28 States and 8 Union Territories successfully updated in AQIContext.jsx!")
