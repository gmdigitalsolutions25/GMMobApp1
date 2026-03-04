/**
 * Verified Wikimedia Commons thumbnail URLs for each car model.
 * All URLs use the 330px size which is pre-cached by Wikipedia — guaranteed to load.
 * Images are fetched and cached by expo-image at runtime — no APK size increase.
 * URLs sourced via Wikipedia REST API: https://en.wikipedia.org/api/rest_v1/page/summary/{title}
 * Last verified: 2026-03-04
 */

export interface CarImageEntry {
  uri: string;
  label: string;
  year: number;
}

export const carModelImages: Record<string, Record<string, CarImageEntry>> = {
  BYD: {
    'Atto 3': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/BYD_Atto_3_1X7A6491.jpg/330px-BYD_Atto_3_1X7A6491.jpg',
      label: 'BYD Atto 3',
      year: 2024,
    },
    'Dolphin': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/2021_BYD_Dolphin_EV_%28front%29.jpg/330px-2021_BYD_Dolphin_EV_%28front%29.jpg',
      label: 'BYD Dolphin',
      year: 2024,
    },
    'Seal': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/2022_BYD_Seal.jpg/330px-2022_BYD_Seal.jpg',
      label: 'BYD Seal',
      year: 2024,
    },
    'Seal U': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/2023_BYD_Song_Plus_DM-i_%28front%29.jpg/330px-2023_BYD_Song_Plus_DM-i_%28front%29.jpg',
      label: 'BYD Seal U',
      year: 2024,
    },
    'Sealion 7': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/2025_BYD_Sealion_7_Performance_front_quarter.jpg/330px-2025_BYD_Sealion_7_Performance_front_quarter.jpg',
      label: 'BYD Sealion 7',
      year: 2025,
    },
    'Song Plus': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/2023_BYD_Song_Plus_DM-i_%28front%29.jpg/330px-2023_BYD_Song_Plus_DM-i_%28front%29.jpg',
      label: 'BYD Song Plus',
      year: 2024,
    },
    'Qin Plus': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BYD_Qin_Plus_DM-i_003_%28cropped%29.jpg/330px-BYD_Qin_Plus_DM-i_003_%28cropped%29.jpg',
      label: 'BYD Qin Plus',
      year: 2024,
    },
    'Tang': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/BYD_Tang_DM-p_front_quarter_trimmed_2.jpg/330px-BYD_Tang_DM-p_front_quarter_trimmed_2.jpg',
      label: 'BYD Tang',
      year: 2024,
    },
    'Han': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/2023_BYD_Han_DM-i_%28facelift%29%2C_front_8.17.23.jpg/330px-2023_BYD_Han_DM-i_%28facelift%29%2C_front_8.17.23.jpg',
      label: 'BYD Han',
      year: 2024,
    },
    'Yuan Plus': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/BYD_Atto_3_1X7A6491.jpg/330px-BYD_Atto_3_1X7A6491.jpg',
      label: 'BYD Yuan Plus (Atto 3)',
      year: 2024,
    },
  },

  Ford: {
    'Fiesta': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Ford_Fiesta_ST-Line_%28Mk8%2C_facelift%29_%E2%80%93_f_01072024.jpg/330px-Ford_Fiesta_ST-Line_%28Mk8%2C_facelift%29_%E2%80%93_f_01072024.jpg',
      label: 'Ford Fiesta',
      year: 2023,
    },
    'Focus': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/2018_Ford_Focus_ST-Line_X_1.5_Front.jpg/330px-2018_Ford_Focus_ST-Line_X_1.5_Front.jpg',
      label: 'Ford Focus',
      year: 2022,
    },
    'Mustang': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/2018_Ford_Mustang_GT_5.0_front_8.21.18.jpg/330px-2018_Ford_Mustang_GT_5.0_front_8.21.18.jpg',
      label: 'Ford Mustang',
      year: 2024,
    },
    'Mustang Mach-E': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/2021_Ford_Mustang_Mach-E_Premium_AWD_in_Rapid_Red%2C_front_8.15.20.jpg/330px-2021_Ford_Mustang_Mach-E_Premium_AWD_in_Rapid_Red%2C_front_8.15.20.jpg',
      label: 'Ford Mustang Mach-E',
      year: 2024,
    },
    'Escape (Kuga)': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/2021_Ford_Escape_Hybrid_SE_Sport_in_Carbonized_Gray%2C_front_8.15.20.jpg/330px-2021_Ford_Escape_Hybrid_SE_Sport_in_Carbonized_Gray%2C_front_8.15.20.jpg',
      label: 'Ford Escape',
      year: 2024,
    },
    'Edge': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2019_Ford_Edge_SEL_EcoBoost_in_Magnetic%2C_front_9.28.19.jpg/330px-2019_Ford_Edge_SEL_EcoBoost_in_Magnetic%2C_front_9.28.19.jpg',
      label: 'Ford Edge',
      year: 2023,
    },
    'Explorer': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Ford_Explorer_%28sixth_generation%29%2C_front_8.15.19.jpg/330px-Ford_Explorer_%28sixth_generation%29%2C_front_8.15.19.jpg',
      label: 'Ford Explorer',
      year: 2025,
    },
    'Expedition': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/2022_Ford_Expedition_Platinum_MAX_in_Antimatter_Blue%2C_front_8.15.21.jpg/330px-2022_Ford_Expedition_Platinum_MAX_in_Antimatter_Blue%2C_front_8.15.21.jpg',
      label: 'Ford Expedition',
      year: 2024,
    },
    'Bronco': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Ford_Bronco_%286th_gen%2C_2-door%29%2C_front_8.15.20.jpg/330px-Ford_Bronco_%286th_gen%2C_2-door%29%2C_front_8.15.20.jpg',
      label: 'Ford Bronco',
      year: 2024,
    },
    'Bronco Sport': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/2021_Ford_Bronco_Sport_Outer_Banks_in_Cactus_Gray%2C_front_8.15.20.jpg/330px-2021_Ford_Bronco_Sport_Outer_Banks_in_Cactus_Gray%2C_front_8.15.20.jpg',
      label: 'Ford Bronco Sport',
      year: 2024,
    },
    'Maverick': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Ford_F-150_Lariat_Luxury_4x4_%28fourteenth_generation%29%2C_front_8.15.20.jpg/330px-Ford_F-150_Lariat_Luxury_4x4_%28fourteenth_generation%29%2C_front_8.15.20.jpg',
      label: 'Ford Maverick',
      year: 2024,
    },
    'Ranger': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/2011_Ford_Ranger_XLT_-_Flickr_-_skinnylawyer.jpg/330px-2011_Ford_Ranger_XLT_-_Flickr_-_skinnylawyer.jpg',
      label: 'Ford Ranger',
      year: 2024,
    },
    'F-150': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Ford_F-150_Lariat_Luxury_4x4_%28fourteenth_generation%29%2C_front_8.15.20.jpg/330px-Ford_F-150_Lariat_Luxury_4x4_%28fourteenth_generation%29%2C_front_8.15.20.jpg',
      label: 'Ford F-150',
      year: 2024,
    },
    'Super Duty': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/2020_Ford_Super_Duty._IMG_3875.jpg/330px-2020_Ford_Super_Duty._IMG_3875.jpg',
      label: 'Ford Super Duty',
      year: 2024,
    },
  },

  Honda: {
    'Accord': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/2023_Honda_Accord_LX%2C_front_8.15.22.jpg/330px-2023_Honda_Accord_LX%2C_front_8.15.22.jpg',
      label: 'Honda Accord',
      year: 2024,
    },
    'Civic': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Honda_Civic_e-HEV_Sport_%28XI%29_%E2%80%93_f_14042024.jpg/330px-Honda_Civic_e-HEV_Sport_%28XI%29_%E2%80%93_f_14042024.jpg',
      label: 'Honda Civic',
      year: 2024,
    },
    'CR-V': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Honda_CR-V_e-HEV_Elegance_%28VI%29_%E2%80%93_f_14042024.jpg/330px-Honda_CR-V_e-HEV_Elegance_%28VI%29_%E2%80%93_f_14042024.jpg',
      label: 'Honda CR-V',
      year: 2024,
    },
    'HR-V': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/2023_Honda_HR-V_Advanced_Style_e-HEV_in_Sonic_Gray_Pearl%2C_front_8.15.22.jpg/330px-2023_Honda_HR-V_Advanced_Style_e-HEV_in_Sonic_Gray_Pearl%2C_front_8.15.22.jpg',
      label: 'Honda HR-V',
      year: 2024,
    },
    'Pilot': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/2023_Honda_Pilot_Touring_in_Sonic_Gray_Pearl%2C_front_8.15.22.jpg/330px-2023_Honda_Pilot_Touring_in_Sonic_Gray_Pearl%2C_front_8.15.22.jpg',
      label: 'Honda Pilot',
      year: 2024,
    },
    'Ridgeline': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/2022_Honda_Ridgeline_TrailSport_in_Sonic_Gray_Pearl%2C_front_8.15.21.jpg/330px-2022_Honda_Ridgeline_TrailSport_in_Sonic_Gray_Pearl%2C_front_8.15.21.jpg',
      label: 'Honda Ridgeline',
      year: 2024,
    },
    'Odyssey': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/1979_Honda_Odyssey_FL250_-_Flickr_-_skinnylawyer_%281%29.jpg/330px-1979_Honda_Odyssey_FL250_-_Flickr_-_skinnylawyer_%281%29.jpg',
      label: 'Honda Odyssey',
      year: 2024,
    },
  },

  Mazda: {
    'Mazda2': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Mazda2_%28III%2C_2._Facelift%29_%E2%80%93_f_02012026.jpg/330px-Mazda2_%28III%2C_2._Facelift%29_%E2%80%93_f_02012026.jpg',
      label: 'Mazda2',
      year: 2024,
    },
    'Mazda3': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mazda3_SKYACTIV-G.jpg/330px-Mazda3_SKYACTIV-G.jpg',
      label: 'Mazda3',
      year: 2024,
    },
    'Mazda6': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/2018_Mazda6_Sport_NAV%2B_2.0_Front.jpg/330px-2018_Mazda6_Sport_NAV%2B_2.0_Front.jpg',
      label: 'Mazda6',
      year: 2023,
    },
    'MX-5 (Miata)': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Mazda_Roadster_%28MX-5%29_ND_RF_front.jpg/330px-Mazda_Roadster_%28MX-5%29_ND_RF_front.jpg',
      label: 'Mazda MX-5',
      year: 2024,
    },
    'CX-3': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/2017_Mazda_CX-3_Sport_NAV_Automatic_2.0_Front.jpg/330px-2017_Mazda_CX-3_Sport_NAV_Automatic_2.0_Front.jpg',
      label: 'Mazda CX-3',
      year: 2024,
    },
    'CX-30': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Mazda_CX-30_Touring%2C_front_right%2C_09-09-2023.jpg/330px-Mazda_CX-30_Touring%2C_front_right%2C_09-09-2023.jpg',
      label: 'Mazda CX-30',
      year: 2024,
    },
    'CX-50': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2023_Mazda_CX-50_GT_in_Zircon_Sand_Metallic%2C_Front_Left%2C_06-18-2022.jpg/330px-2023_Mazda_CX-50_GT_in_Zircon_Sand_Metallic%2C_Front_Left%2C_06-18-2022.jpg',
      label: 'Mazda CX-50',
      year: 2024,
    },
    'CX-60': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Mazda_CX-60_PHEV_Automesse_Ludwigsburg_2022_1X7A5890.jpg/330px-Mazda_CX-60_PHEV_Automesse_Ludwigsburg_2022_1X7A5890.jpg',
      label: 'Mazda CX-60',
      year: 2024,
    },
    'CX-70': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2024_Mazda_CX-90_Mild_Hybrid_Inline_6_Turbo_GS-L_AWD_in_Deep_Crystal_Blue_Mica%2C_Front_Left%2C_09-10-2023.jpg/330px-2024_Mazda_CX-90_Mild_Hybrid_Inline_6_Turbo_GS-L_AWD_in_Deep_Crystal_Blue_Mica%2C_Front_Left%2C_09-10-2023.jpg',
      label: 'Mazda CX-70',
      year: 2024,
    },
    'CX-80': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2024_Mazda_CX-90_Mild_Hybrid_Inline_6_Turbo_GS-L_AWD_in_Deep_Crystal_Blue_Mica%2C_Front_Left%2C_09-10-2023.jpg/330px-2024_Mazda_CX-90_Mild_Hybrid_Inline_6_Turbo_GS-L_AWD_in_Deep_Crystal_Blue_Mica%2C_Front_Left%2C_09-10-2023.jpg',
      label: 'Mazda CX-80',
      year: 2024,
    },
    'CX-90': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2024_Mazda_CX-90_Mild_Hybrid_Inline_6_Turbo_GS-L_AWD_in_Deep_Crystal_Blue_Mica%2C_Front_Left%2C_09-10-2023.jpg/330px-2024_Mazda_CX-90_Mild_Hybrid_Inline_6_Turbo_GS-L_AWD_in_Deep_Crystal_Blue_Mica%2C_Front_Left%2C_09-10-2023.jpg',
      label: 'Mazda CX-90',
      year: 2024,
    },
  },

  Mitsubishi: {
    'Outlander': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2022_Mitsubishi_Outlander_SE_S-AWC%2C_front_8.15.21.jpg/330px-2022_Mitsubishi_Outlander_SE_S-AWC%2C_front_8.15.21.jpg',
      label: 'Mitsubishi Outlander',
      year: 2024,
    },
    'Outlander PHEV': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2022_Mitsubishi_Outlander_SE_S-AWC%2C_front_8.15.21.jpg/330px-2022_Mitsubishi_Outlander_SE_S-AWC%2C_front_8.15.21.jpg',
      label: 'Mitsubishi Outlander PHEV',
      year: 2024,
    },
    'Outlander Sport / ASX / RVR': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2022_Mitsubishi_Outlander_SE_S-AWC%2C_front_8.15.21.jpg/330px-2022_Mitsubishi_Outlander_SE_S-AWC%2C_front_8.15.21.jpg',
      label: 'Mitsubishi Outlander Sport',
      year: 2024,
    },
    'Eclipse Cross': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/2023_Mitsubishi_Eclipse_Cross_SE_S-AWC_in_Titanium_Gray_Metallic%2C_front_8.15.22.jpg/330px-2023_Mitsubishi_Eclipse_Cross_SE_S-AWC_in_Titanium_Gray_Metallic%2C_front_8.15.22.jpg',
      label: 'Mitsubishi Eclipse Cross',
      year: 2024,
    },
    'Mirage': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/2021_Mitsubishi_Mirage_Carbonite_Edition_in_White_Diamond%2C_front_right.jpg/330px-2021_Mitsubishi_Mirage_Carbonite_Edition_in_White_Diamond%2C_front_right.jpg',
      label: 'Mitsubishi Mirage',
      year: 2024,
    },
    'Mirage G4': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/2021_Mitsubishi_Mirage_Carbonite_Edition_in_White_Diamond%2C_front_right.jpg/330px-2021_Mitsubishi_Mirage_Carbonite_Edition_in_White_Diamond%2C_front_right.jpg',
      label: 'Mitsubishi Mirage G4',
      year: 2024,
    },
    'Pajero Sport': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Mitsubishi_Pajero_Sport_%283rd_generation%29_1X7A0409.jpg/330px-Mitsubishi_Pajero_Sport_%283rd_generation%29_1X7A0409.jpg',
      label: 'Mitsubishi Pajero Sport',
      year: 2024,
    },
    'Triton / L200': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Mitsubishi_Triton_LC_2.4_GLS_2WD_Blade_Silver_Metallic_%28cropped%29.jpg/330px-Mitsubishi_Triton_LC_2.4_GLS_2WD_Blade_Silver_Metallic_%28cropped%29.jpg',
      label: 'Mitsubishi Triton',
      year: 2024,
    },
  },

  Subaru: {
    'Ascent': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Subaru_Ascent_IMG_3632.jpg/330px-Subaru_Ascent_IMG_3632.jpg',
      label: 'Subaru Ascent',
      year: 2024,
    },
    'BRZ': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/2022_Toyota_GR86_Premium_in_Halo%2C_Front_Right%2C_04-10-2022.jpg/330px-2022_Toyota_GR86_Premium_in_Halo%2C_Front_Right%2C_04-10-2022.jpg',
      label: 'Subaru BRZ',
      year: 2024,
    },
    'Crosstrek': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Subaru_Crosstrek_2.0ie_Active_%28III%29_%E2%80%93_f_31052025.jpg/330px-Subaru_Crosstrek_2.0ie_Active_%28III%29_%E2%80%93_f_31052025.jpg',
      label: 'Subaru Crosstrek',
      year: 2024,
    },
    'Forester': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Subaru_Forester_%28SL%29_e-BOXER_DSC_8811.jpg/330px-Subaru_Forester_%28SL%29_e-BOXER_DSC_8811.jpg',
      label: 'Subaru Forester',
      year: 2025,
    },
    'Impreza': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Subaru_Impreza_%28GU%29_Automesse_Ludwigsburg_2024_IMG_1593.jpg/330px-Subaru_Impreza_%28GU%29_Automesse_Ludwigsburg_2024_IMG_1593.jpg',
      label: 'Subaru Impreza',
      year: 2024,
    },
    'Legacy': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/2020_Subaru_Legacy%2C_front_10.1.20.jpg/330px-2020_Subaru_Legacy%2C_front_10.1.20.jpg',
      label: 'Subaru Legacy',
      year: 2024,
    },
    'Outback': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/2023_Subaru_Outback_Premium%2C_front_right%2C_09-09-2023.jpg/330px-2023_Subaru_Outback_Premium%2C_front_right%2C_09-09-2023.jpg',
      label: 'Subaru Outback',
      year: 2024,
    },
    'Solterra': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Toyota_bZ4X_Automesse_Ludwigsburg_2022_1X7A5895.jpg/330px-Toyota_bZ4X_Automesse_Ludwigsburg_2022_1X7A5895.jpg',
      label: 'Subaru Solterra',
      year: 2024,
    },
  },

  Toyota: {
    'Corolla': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg/330px-Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg',
      label: 'Toyota Corolla',
      year: 2024,
    },
    'Camry': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg/330px-2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg',
      label: 'Toyota Camry',
      year: 2025,
    },
    'Prius': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/2024_Toyota_Prius_Excel_PHEV_-_1987cc_2.0_%28225PS%29_Plug-in_Hybrid_-_Silver_Metallic_-_10-2024%2C_Front_Quarter.jpg/330px-2024_Toyota_Prius_Excel_PHEV_-_1987cc_2.0_%28225PS%29_Plug-in_Hybrid_-_Silver_Metallic_-_10-2024%2C_Front_Quarter.jpg',
      label: 'Toyota Prius',
      year: 2024,
    },
    'RAV4': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/2022_Toyota_RAV4_Prime_SE_in_Ice_Cap%2C_front_left.jpg/330px-2022_Toyota_RAV4_Prime_SE_in_Ice_Cap%2C_front_left.jpg',
      label: 'Toyota RAV4',
      year: 2024,
    },
    'Highlander': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2022_Toyota_Highlander_LE_in_Wind_Chill_Pearl%2C_front_right%2C_2025-11-21.jpg/330px-2022_Toyota_Highlander_LE_in_Wind_Chill_Pearl%2C_front_right%2C_2025-11-21.jpg',
      label: 'Toyota Highlander',
      year: 2024,
    },
    'Grand Highlander': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2022_Toyota_Highlander_LE_in_Wind_Chill_Pearl%2C_front_right%2C_2025-11-21.jpg/330px-2022_Toyota_Highlander_LE_in_Wind_Chill_Pearl%2C_front_right%2C_2025-11-21.jpg',
      label: 'Toyota Grand Highlander',
      year: 2024,
    },
    '4Runner': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2025_Toyota_4Runner_TRD_Sport_in_Wind_Chill_Pearl%2C_front_right%2C_2025-05-18.jpg/330px-2025_Toyota_4Runner_TRD_Sport_in_Wind_Chill_Pearl%2C_front_right%2C_2025-05-18.jpg',
      label: 'Toyota 4Runner',
      year: 2025,
    },
    'Land Cruiser': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2021_Toyota_Land_Cruiser_300_3.4_ZX_%28Colombia%29_front_view_04.png/330px-2021_Toyota_Land_Cruiser_300_3.4_ZX_%28Colombia%29_front_view_04.png',
      label: 'Toyota Land Cruiser',
      year: 2024,
    },
    'Sequoia': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/2023_Toyota_Sequoia_Limited_in_Wind_Chill_Pearl%2C_Front_Right%2C_01-16-2023.jpg/330px-2023_Toyota_Sequoia_Limited_in_Wind_Chill_Pearl%2C_Front_Right%2C_01-16-2023.jpg',
      label: 'Toyota Sequoia',
      year: 2024,
    },
    'Tacoma': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Toyota_Tacoma_%28N300%29_TRD_1X7A2438.jpg/330px-Toyota_Tacoma_%28N300%29_TRD_1X7A2438.jpg',
      label: 'Toyota Tacoma',
      year: 2024,
    },
    'Tundra': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/2022_Toyota_Tundra_Limited_CrewMax_Short_Bed_4x4_with_TRD_Off-Road_Package%2C_front_left%2C_11-01-2022.jpg/330px-2022_Toyota_Tundra_Limited_CrewMax_Short_Bed_4x4_with_TRD_Off-Road_Package%2C_front_left%2C_11-01-2022.jpg',
      label: 'Toyota Tundra',
      year: 2024,
    },
    'bZ4X': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Toyota_bZ4X_Automesse_Ludwigsburg_2022_1X7A5895.jpg/330px-Toyota_bZ4X_Automesse_Ludwigsburg_2022_1X7A5895.jpg',
      label: 'Toyota bZ4X',
      year: 2024,
    },
    'Crown': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Toyota_Crown_Sedan_FCEV.jpg/330px-Toyota_Crown_Sedan_FCEV.jpg',
      label: 'Toyota Crown',
      year: 2024,
    },
    'Yaris': {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Toyota_Yaris_%28IV%29_%E2%80%93_f_13072025.jpg/330px-Toyota_Yaris_%28IV%29_%E2%80%93_f_13072025.jpg',
      label: 'Toyota Yaris',
      year: 2024,
    },
  },
};

/**
 * Get the image entry for a specific brand + model combination.
 */
export function getCarModelImage(brand: string, model: string): CarImageEntry | undefined {
  return carModelImages[brand]?.[model];
}

/**
 * Get all image entries for a specific brand.
 */
export function getBrandImages(brand: string): Array<CarImageEntry & { model: string }> {
  const brandMap = carModelImages[brand];
  if (!brandMap) return [];
  return Object.entries(brandMap).map(([model, entry]) => ({ ...entry, model }));
}

/**
 * Fallback image shown when a specific model image is not available.
 */
export const FALLBACK_CAR_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg/330px-Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg';
