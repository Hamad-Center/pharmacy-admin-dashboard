/**
 * Kuwait locations constants for governorates and cities
 * Used for branch address dropdowns
 */

export const KUWAIT_GOVERNORATES = [
  { id: 1, name: 'Al Ahmadi' },
  { id: 2, name: 'Al Farwaniyah' },
  { id: 3, name: 'Al Jahra' },
  { id: 4, name: 'Capital' },
  { id: 5, name: 'Hawalli' },
  { id: 6, name: 'Mubarak Al-Kabeer' }
] as const;

export const KUWAIT_CITIES_BY_GOVERNORATE: Record<number, { id: number; name: string }[]> = {
  1: [
    { id: 1, name: 'Ahmadi' },
    { id: 2, name: 'Fahaheel' },
    { id: 3, name: 'Fintas' },
    { id: 4, name: 'Jaber Al Ali' },
    { id: 5, name: 'Mahboula' },
    { id: 6, name: 'Mangaf' },
    { id: 7, name: 'Riqqa' },
    { id: 8, name: 'Sabah Al Ahmad' },
    { id: 9, name: 'Shuaiba' }
  ],
  2: [
    { id: 10, name: 'Abdullah Al Mubarak' },
    { id: 11, name: 'Abraq Khaitan' },
    { id: 12, name: 'Al Rai' },
    { id: 13, name: 'Andalous' },
    { id: 14, name: 'Ardiyah' },
    { id: 15, name: 'Dajeej' },
    { id: 16, name: 'Farwaniya' },
    { id: 17, name: 'Hasawi' },
    { id: 18, name: 'Ishbiliya' },
    { id: 19, name: 'Jeleeb Al Shuyoukh' },
    { id: 20, name: 'Khaitan' },
    { id: 21, name: 'Omariya' },
    { id: 22, name: 'Rabia' },
    { id: 23, name: 'Rihab' },
    { id: 24, name: 'Sabah Al Nasser' },
    { id: 25, name: 'Sheikh Saad' }
  ],
  3: [
    { id: 26, name: 'Al Jahra' },
    { id: 27, name: 'Al Nahda' },
    { id: 28, name: 'Al Salmi' },
    { id: 29, name: 'Al Subiyah' },
    { id: 30, name: 'Amgarah Industrial' },
    { id: 31, name: 'Naeem' },
    { id: 32, name: 'Oyoun' },
    { id: 33, name: 'Qasr' },
    { id: 34, name: 'Saad Al Abdullah' },
    { id: 35, name: 'Sulaibiya' },
    { id: 36, name: 'Taima' },
    { id: 37, name: 'Waha' },
    { id: 38, name: 'Rawdatain' }
  ],
  4: [
    { id: 39, name: 'Adailiya' },
    { id: 40, name: 'Al Mansouriya' },
    { id: 41, name: 'Al Qadisiya' },
    { id: 42, name: 'Al Qibla' },
    { id: 43, name: 'Al Shamiya' },
    { id: 44, name: 'Al Shuwaikh' },
    { id: 45, name: 'Al Watiya' },
    { id: 46, name: 'Bneid Al Gar' },
    { id: 47, name: 'Dasman' },
    { id: 48, name: 'Doha' },
    { id: 49, name: 'Faiha' },
    { id: 50, name: 'Ghornata' },
    { id: 51, name: 'Jaber Al Ahmad' },
    { id: 52, name: 'Kaifan' },
    { id: 53, name: 'Khaldiya' },
    { id: 54, name: 'Kuwait City' },
    { id: 55, name: 'Mansouriya' },
    { id: 56, name: 'Mirqab' },
    { id: 57, name: 'Nuzha' },
    { id: 58, name: 'Qadsiya' },
    { id: 59, name: 'Qibla' },
    { id: 60, name: 'Qortuba' },
    { id: 61, name: 'Rawda' },
    { id: 62, name: 'Salhiya' },
    { id: 63, name: 'Salmiya' },
    { id: 64, name: 'Salwa' },
    { id: 65, name: 'Shamiya' },
    { id: 66, name: 'Sharq' },
    { id: 67, name: 'Shuwaikh' },
    { id: 68, name: 'Sulaibikhat' },
    { id: 69, name: 'Surra' },
    { id: 70, name: 'Yarmouk' }
  ],
  5: [
    { id: 71, name: 'Al Salam' },
    { id: 72, name: 'Bayán' },
    { id: 73, name: 'Hateen' },
    { id: 74, name: 'Hawally' },
    { id: 75, name: 'Jabriya' },
    { id: 76, name: 'Maidan Hawally' },
    { id: 77, name: 'Mishref' },
    { id: 78, name: 'Mubarak Al Abdullah' },
    { id: 79, name: 'Rumaithiya' },
    { id: 80, name: 'Salam' },
    { id: 81, name: 'Salmiya' },
    { id: 82, name: 'Shaab' },
    { id: 83, name: 'Shuhada' },
    { id: 84, name: 'Siddiq' },
    { id: 85, name: 'Zahra' }
  ],
  6: [
    { id: 86, name: 'Abu Al Hasaniya' },
    { id: 87, name: 'Abu Fatira' },
    { id: 88, name: 'Adan' },
    { id: 89, name: 'Al Masayel' },
    { id: 90, name: 'Coast Strip B' },
    { id: 91, name: 'Fnaitees' },
    { id: 92, name: 'Messila' },
    { id: 93, name: 'Mubarak Al Kabeer' },
    { id: 94, name: 'Qurain' },
    { id: 95, name: 'Qusor' },
    { id: 96, name: 'Sabah Al Salem' },
    { id: 97, name: 'Sabhan' },
    { id: 98, name: 'South Wista' },
    { id: 99, name: 'Wista' }
  ]
};

export const getGovernorateById = (id: number) => {
  return KUWAIT_GOVERNORATES.find(gov => gov.id === id);
};

export const getCityById = (governorateId: number, cityId: number) => {
  const cities = KUWAIT_CITIES_BY_GOVERNORATE[governorateId] || [];
  return cities.find(city => city.id === cityId);
};
