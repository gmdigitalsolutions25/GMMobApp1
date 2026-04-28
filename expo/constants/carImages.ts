/**
 * Car model images — hosted on GitHub as WebP at 800px width.
 * All images are stored in expo/assets/car-images/{brand}/{model}.webp
 * and served via raw.githubusercontent.com CDN.
 * Total: 109 models across 7 brands.
 * Last updated: 2026-04-29
 */

export interface CarImageEntry {
  uri: string;
  label: string;
  year: number;
}

export const carModelImages: Record<string, Record<string, CarImageEntry>> = {
  BYD: {
    'Atto 3': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/atto-3.webp',
      label: 'BYD Atto 3',
      year: 2024,
    },
    'Denza D9': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/denza-d9.webp',
      label: 'BYD Denza D9',
      year: 2024,
    },
    'Dolphin': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/dolphin.webp',
      label: 'BYD Dolphin',
      year: 2024,
    },
    'Han': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/han.webp',
      label: 'BYD Han',
      year: 2024,
    },
    'Qin Plus': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/qin-plus.webp',
      label: 'BYD Qin Plus',
      year: 2024,
    },
    'Seagull': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/seagull.webp',
      label: 'BYD Seagull',
      year: 2024,
    },
    'Seal': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/seal.webp',
      label: 'BYD Seal',
      year: 2024,
    },
    'Seal U': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/seal-u.webp',
      label: 'BYD Seal U',
      year: 2024,
    },
    'Sealion 7': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/sealion-7.webp',
      label: 'BYD Sealion 7',
      year: 2025,
    },
    'Shark': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/shark.webp',
      label: 'BYD Shark',
      year: 2025,
    },
    'Song Plus': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/song-plus.webp',
      label: 'BYD Song Plus',
      year: 2024,
    },
    'Tang': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/tang.webp',
      label: 'BYD Tang',
      year: 2024,
    },
    'Yuan Plus': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/yuan-plus.webp',
      label: 'BYD Yuan Plus',
      year: 2024,
    },
    'e6': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/byd/e6.webp',
      label: 'BYD e6',
      year: 2022,
    },
  },

  Ford: {
    'Bronco': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/bronco.webp',
      label: 'Ford Bronco',
      year: 2024,
    },
    'Bronco Sport': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/bronco-sport.webp',
      label: 'Ford Bronco Sport',
      year: 2024,
    },
    'EcoSport': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/ecosport.webp',
      label: 'Ford EcoSport',
      year: 2023,
    },
    'Edge': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/edge.webp',
      label: 'Ford Edge',
      year: 2024,
    },
    'Escape (Kuga)': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/escape-kuga.webp',
      label: 'Ford Escape (Kuga)',
      year: 2024,
    },
    'Everest': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/everest.webp',
      label: 'Ford Everest',
      year: 2024,
    },
    'Expedition': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/expedition.webp',
      label: 'Ford Expedition',
      year: 2024,
    },
    'Explorer': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/explorer.webp',
      label: 'Ford Explorer',
      year: 2024,
    },
    'F-150': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/f-150.webp',
      label: 'Ford F-150',
      year: 2024,
    },
    'Fiesta': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/fiesta.webp',
      label: 'Ford Fiesta',
      year: 2023,
    },
    'Focus': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/focus.webp',
      label: 'Ford Focus',
      year: 2023,
    },
    'Maverick': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/maverick.webp',
      label: 'Ford Maverick',
      year: 2024,
    },
    'Mondeo': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/mondeo.webp',
      label: 'Ford Mondeo',
      year: 2023,
    },
    'Mustang': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/mustang.webp',
      label: 'Ford Mustang',
      year: 2024,
    },
    'Mustang Mach-E': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/mustang-mach-e.webp',
      label: 'Ford Mustang Mach-E',
      year: 2024,
    },
    'Puma': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/puma.webp',
      label: 'Ford Puma',
      year: 2024,
    },
    'Ranger': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/ranger.webp',
      label: 'Ford Ranger',
      year: 2024,
    },
    'Super Duty': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/super-duty.webp',
      label: 'Ford Super Duty',
      year: 2024,
    },
    'Territory': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/territory.webp',
      label: 'Ford Territory',
      year: 2025,
    },
    'Tourneo Connect': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/tourneo-connect.webp',
      label: 'Ford Tourneo Connect',
      year: 2024,
    },
    'Transit Custom': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/ford/transit-custom.webp',
      label: 'Ford Transit Custom',
      year: 2024,
    },
  },

  Honda: {
    'Accord': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/accord.webp',
      label: 'Honda Accord',
      year: 2024,
    },
    'BR-V': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/br-v.webp',
      label: 'Honda BR-V',
      year: 2024,
    },
    'CR-V': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/cr-v.webp',
      label: 'Honda CR-V',
      year: 2024,
    },
    'City': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/city.webp',
      label: 'Honda City',
      year: 2024,
    },
    'Civic': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/civic.webp',
      label: 'Honda Civic',
      year: 2024,
    },
    'Fit': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/fit.webp',
      label: 'Honda Fit',
      year: 2023,
    },
    'HR-V': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/hr-v.webp',
      label: 'Honda HR-V',
      year: 2024,
    },
    'Odyssey': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/odyssey.webp',
      label: 'Honda Odyssey',
      year: 2024,
    },
    'Pilot': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/pilot.webp',
      label: 'Honda Pilot',
      year: 2024,
    },
    'Ridgeline': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/ridgeline.webp',
      label: 'Honda Ridgeline',
      year: 2024,
    },
    'WR-V': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/wr-v.webp',
      label: 'Honda WR-V',
      year: 2024,
    },
    'ZR-V': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/honda/zr-v.webp',
      label: 'Honda ZR-V',
      year: 2024,
    },
  },

  Mazda: {
    'BT-50': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/bt-50.webp',
      label: 'Mazda BT-50',
      year: 2024,
    },
    'CX-3': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/cx-3.webp',
      label: 'Mazda CX-3',
      year: 2024,
    },
    'CX-30': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/cx-30.webp',
      label: 'Mazda CX-30',
      year: 2024,
    },
    'CX-5': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/cx-5.webp',
      label: 'Mazda CX-5',
      year: 2024,
    },
    'CX-50': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/cx-50.webp',
      label: 'Mazda CX-50',
      year: 2024,
    },
    'CX-60': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/cx-60.webp',
      label: 'Mazda CX-60',
      year: 2024,
    },
    'CX-70': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/cx-70.webp',
      label: 'Mazda CX-70',
      year: 2025,
    },
    'CX-80': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/cx-80.webp',
      label: 'Mazda CX-80',
      year: 2025,
    },
    'CX-90': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/cx-90.webp',
      label: 'Mazda CX-90',
      year: 2024,
    },
    'MX-30': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/mx-30.webp',
      label: 'Mazda MX-30',
      year: 2024,
    },
    'MX-5 (Miata)': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/mx-5-miata.webp',
      label: 'Mazda MX-5 (Miata)',
      year: 2024,
    },
    'Mazda2': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/mazda2.webp',
      label: 'Mazda Mazda2',
      year: 2024,
    },
    'Mazda2 Hybrid': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/mazda2-hybrid.webp',
      label: 'Mazda Mazda2 Hybrid',
      year: 2024,
    },
    'Mazda3': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/mazda3.webp',
      label: 'Mazda Mazda3',
      year: 2024,
    },
    'Mazda6': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mazda/mazda6.webp',
      label: 'Mazda Mazda6',
      year: 2023,
    },
  },

  Mitsubishi: {
    'Attrage': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/attrage.webp',
      label: 'Mitsubishi Attrage',
      year: 2024,
    },
    'Colt': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/colt.webp',
      label: 'Mitsubishi Colt',
      year: 2024,
    },
    'Delica': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/delica.webp',
      label: 'Mitsubishi Delica',
      year: 2024,
    },
    'Eclipse Cross': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/eclipse-cross.webp',
      label: 'Mitsubishi Eclipse Cross',
      year: 2024,
    },
    'Mirage': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/mirage.webp',
      label: 'Mitsubishi Mirage',
      year: 2023,
    },
    'Mirage G4': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/mirage-g4.webp',
      label: 'Mitsubishi Mirage G4',
      year: 2023,
    },
    'Outlander': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/outlander.webp',
      label: 'Mitsubishi Outlander',
      year: 2024,
    },
    'Outlander PHEV': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/outlander-phev.webp',
      label: 'Mitsubishi Outlander PHEV',
      year: 2024,
    },
    'Outlander Sport / ASX / RVR': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/outlander-sport-asx-rvr.webp',
      label: 'Mitsubishi Outlander Sport / ASX / RVR',
      year: 2024,
    },
    'Pajero Sport': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/pajero-sport.webp',
      label: 'Mitsubishi Pajero Sport',
      year: 2024,
    },
    'Triton / L200': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/triton-l200.webp',
      label: 'Mitsubishi Triton / L200',
      year: 2024,
    },
    'Xforce': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/xforce.webp',
      label: 'Mitsubishi Xforce',
      year: 2024,
    },
    'Xpander': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/mitsubishi/xpander.webp',
      label: 'Mitsubishi Xpander',
      year: 2024,
    },
  },

  Subaru: {
    'Ascent': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/subaru/ascent.webp',
      label: 'Subaru Ascent',
      year: 2024,
    },
    'BRZ': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/subaru/brz.webp',
      label: 'Subaru BRZ',
      year: 2024,
    },
    'Crosstrek': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/subaru/crosstrek.webp',
      label: 'Subaru Crosstrek',
      year: 2024,
    },
    'Forester': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/subaru/forester.webp',
      label: 'Subaru Forester',
      year: 2024,
    },
    'Impreza': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/subaru/impreza.webp',
      label: 'Subaru Impreza',
      year: 2024,
    },
    'Legacy': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/subaru/legacy.webp',
      label: 'Subaru Legacy',
      year: 2024,
    },
    'Levorg': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/subaru/levorg.webp',
      label: 'Subaru Levorg',
      year: 2024,
    },
    'Outback': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/subaru/outback.webp',
      label: 'Subaru Outback',
      year: 2024,
    },
    'Solterra': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/subaru/solterra.webp',
      label: 'Subaru Solterra',
      year: 2024,
    },
    'WRX': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/subaru/wrx.webp',
      label: 'Subaru WRX',
      year: 2024,
    },
  },

  Toyota: {
    '4Runner': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/4runner.webp',
      label: 'Toyota 4Runner',
      year: 2025,
    },
    'Avalon': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/avalon.webp',
      label: 'Toyota Avalon',
      year: 2023,
    },
    'C-HR': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/c-hr.webp',
      label: 'Toyota C-HR',
      year: 2024,
    },
    'Camry': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/camry.webp',
      label: 'Toyota Camry',
      year: 2024,
    },
    'Corolla': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/corolla.webp',
      label: 'Toyota Corolla',
      year: 2024,
    },
    'Crown': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/crown.webp',
      label: 'Toyota Crown',
      year: 2024,
    },
    'Fortuner': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/fortuner.webp',
      label: 'Toyota Fortuner',
      year: 2024,
    },
    'Grand Highlander': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/grand-highlander.webp',
      label: 'Toyota Grand Highlander',
      year: 2024,
    },
    'Highlander': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/highlander.webp',
      label: 'Toyota Highlander',
      year: 2024,
    },
    'Hilux': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/hilux.webp',
      label: 'Toyota Hilux',
      year: 2024,
    },
    'Innova': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/innova.webp',
      label: 'Toyota Innova',
      year: 2024,
    },
    'Land Cruiser': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/land-cruiser.webp',
      label: 'Toyota Land Cruiser',
      year: 2024,
    },
    'Land Cruiser Prado': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/land-cruiser-prado.webp',
      label: 'Toyota Land Cruiser Prado',
      year: 2024,
    },
    'Prius': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/prius.webp',
      label: 'Toyota Prius',
      year: 2024,
    },
    'RAV4': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/rav4.webp',
      label: 'Toyota RAV4',
      year: 2024,
    },
    'Rush': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/rush.webp',
      label: 'Toyota Rush',
      year: 2024,
    },
    'Sequoia': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/sequoia.webp',
      label: 'Toyota Sequoia',
      year: 2024,
    },
    'Sienna': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/sienna.webp',
      label: 'Toyota Sienna',
      year: 2024,
    },
    'Supra': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/supra.webp',
      label: 'Toyota Supra',
      year: 2024,
    },
    'Tacoma': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/tacoma.webp',
      label: 'Toyota Tacoma',
      year: 2024,
    },
    'Tundra': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/tundra.webp',
      label: 'Toyota Tundra',
      year: 2024,
    },
    'Venza': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/venza.webp',
      label: 'Toyota Venza',
      year: 2024,
    },
    'Yaris': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/yaris.webp',
      label: 'Toyota Yaris',
      year: 2024,
    },
    'bZ4X': {
      uri: 'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/bz4x.webp',
      label: 'Toyota bZ4X',
      year: 2024,
    },
  },

};

/**
 * Get the image entry for a specific brand and model.
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
  'https://raw.githubusercontent.com/Elnur004GH/Qaraj-GM/main/expo/assets/car-images/toyota/corolla.webp';
