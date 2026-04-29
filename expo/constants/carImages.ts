/**
 * Car model images — served from the backend server as WebP at 800px width.
 * Images are served via the backend static route: /static/cars/{brand}/{model}.webp
 * Client-side caching: 30 days via imageCache.ts
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
      uri: 'http://91.107.161.67:3000/static/cars/byd/atto-3.webp',
      label: 'BYD Atto 3',
      year: 2024,
    },
    'Chazor': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/chazor.webp',
      label: 'BYD Chazor',
      year: 2024,
    },
    'Denza D9': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/denza-d9.webp',
      label: 'BYD Denza D9',
      year: 2024,
    },
    'Destroyer': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/destroyer.webp',
      label: 'BYD Destroyer',
      year: 2024,
    },
    'Dolphin': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/dolphin.webp',
      label: 'BYD Dolphin',
      year: 2024,
    },
    'Han': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/han.webp',
      label: 'BYD Han',
      year: 2024,
    },
    'Leopard': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/leopard.webp',
      label: 'BYD Leopard',
      year: 2025,
    },
    'Qin Plus': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/qin-plus.webp',
      label: 'BYD Qin Plus',
      year: 2024,
    },
    'Seagull': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/seagull.webp',
      label: 'BYD Seagull',
      year: 2024,
    },
    'Seal': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/seal.webp',
      label: 'BYD Seal',
      year: 2024,
    },
    'Seal U': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/seal-u.webp',
      label: 'BYD Seal U',
      year: 2024,
    },
    'Sealion 7': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/sealion-7.webp',
      label: 'BYD Sealion 7',
      year: 2025,
    },
    'Shark': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/shark.webp',
      label: 'BYD Shark',
      year: 2025,
    },
    'Song Plus': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/song-plus.webp',
      label: 'BYD Song Plus',
      year: 2024,
    },
    'Tang': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/tang.webp',
      label: 'BYD Tang',
      year: 2024,
    },
    'Yuan Plus': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/yuan-plus.webp',
      label: 'BYD Yuan Plus',
      year: 2024,
    },
    'e6': {
      uri: 'http://91.107.161.67:3000/static/cars/byd/e6.webp',
      label: 'BYD e6',
      year: 2022,
    },
  },

  Ford: {
    'Bronco': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/bronco.webp',
      label: 'Ford Bronco',
      year: 2024,
    },
    'Bronco Sport': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/bronco-sport.webp',
      label: 'Ford Bronco Sport',
      year: 2024,
    },
    'Courier': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/courier.webp',
      label: 'Ford Courier',
      year: 2024,
    },
    'Custom': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/custom.webp',
      label: 'Ford Custom',
      year: 2024,
    },
    'EcoSport': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/ecosport.webp',
      label: 'Ford EcoSport',
      year: 2023,
    },
    'Edge': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/edge.webp',
      label: 'Ford Edge',
      year: 2024,
    },
    'Escape (Kuga)': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/escape-kuga.webp',
      label: 'Ford Escape (Kuga)',
      year: 2024,
    },
    'Everest': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/everest.webp',
      label: 'Ford Everest',
      year: 2024,
    },
    'Expedition': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/expedition.webp',
      label: 'Ford Expedition',
      year: 2024,
    },
    'Explorer': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/explorer.webp',
      label: 'Ford Explorer',
      year: 2024,
    },
    'F-150': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/f-150.webp',
      label: 'Ford F-150',
      year: 2024,
    },
    'Fiesta': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/fiesta.webp',
      label: 'Ford Fiesta',
      year: 2023,
    },
    'Fusion': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/fusion.webp',
      label: 'Ford Fusion',
      year: 2020,
    },
    'Focus': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/focus.webp',
      label: 'Ford Focus',
      year: 2023,
    },
    'Maverick': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/maverick.webp',
      label: 'Ford Maverick',
      year: 2024,
    },
    'Mondeo': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/mondeo.webp',
      label: 'Ford Mondeo',
      year: 2023,
    },
    'Mustang': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/mustang.webp',
      label: 'Ford Mustang',
      year: 2024,
    },
    'Mustang Mach-E': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/mustang-mach-e.webp',
      label: 'Ford Mustang Mach-E',
      year: 2024,
    },
    'Puma': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/puma.webp',
      label: 'Ford Puma',
      year: 2024,
    },
    'Ranger': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/ranger.webp',
      label: 'Ford Ranger',
      year: 2024,
    },
    'Super Duty': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/super-duty.webp',
      label: 'Ford Super Duty',
      year: 2024,
    },
    'Territory': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/territory.webp',
      label: 'Ford Territory',
      year: 2025,
    },
    'Tourneo Connect': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/tourneo-connect.webp',
      label: 'Ford Tourneo Connect',
      year: 2024,
    },
    'Transit': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/transit.webp',
      label: 'Ford Transit',
      year: 2024,
    },
    'Transit Custom': {
      uri: 'http://91.107.161.67:3000/static/cars/ford/transit-custom.webp',
      label: 'Ford Transit Custom',
      year: 2024,
    },
  },

  Honda: {
    'Accord': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/accord.webp',
      label: 'Honda Accord',
      year: 2024,
    },
    'BR-V': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/br-v.webp',
      label: 'Honda BR-V',
      year: 2024,
    },
    'CR-V': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/cr-v.webp',
      label: 'Honda CR-V',
      year: 2024,
    },
    'City': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/city.webp',
      label: 'Honda City',
      year: 2024,
    },
    'Civic': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/civic.webp',
      label: 'Honda Civic',
      year: 2024,
    },
    'e:NS': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/e-ns.webp',
      label: 'Honda e:NS',
      year: 2024,
    },
    'Fit': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/fit.webp',
      label: 'Honda Fit',
      year: 2023,
    },
    'HR-V': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/hr-v.webp',
      label: 'Honda HR-V',
      year: 2024,
    },
    'Insight': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/insight.webp',
      label: 'Honda Insight',
      year: 2022,
    },
    'Odyssey': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/odyssey.webp',
      label: 'Honda Odyssey',
      year: 2024,
    },
    'Passport': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/passport.webp',
      label: 'Honda Passport',
      year: 2024,
    },
    'Pilot': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/pilot.webp',
      label: 'Honda Pilot',
      year: 2024,
    },
    'Ridgeline': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/ridgeline.webp',
      label: 'Honda Ridgeline',
      year: 2024,
    },
    'WR-V': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/wr-v.webp',
      label: 'Honda WR-V',
      year: 2024,
    },
    'ZR-V': {
      uri: 'http://91.107.161.67:3000/static/cars/honda/zr-v.webp',
      label: 'Honda ZR-V',
      year: 2024,
    },
  },

  Mazda: {
    'BT-50': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/bt-50.webp',
      label: 'Mazda BT-50',
      year: 2024,
    },
    'CX-3': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/cx-3.webp',
      label: 'Mazda CX-3',
      year: 2024,
    },
    'CX-30': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/cx-30.webp',
      label: 'Mazda CX-30',
      year: 2024,
    },
    'CX-5': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/cx-5.webp',
      label: 'Mazda CX-5',
      year: 2024,
    },
    'CX-50': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/cx-50.webp',
      label: 'Mazda CX-50',
      year: 2024,
    },
    'CX-7': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/cx-7.webp',
      label: 'Mazda CX-7',
      year: 2012,
    },
    'CX-9': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/cx-9.webp',
      label: 'Mazda CX-9',
      year: 2023,
    },
    'CX-60': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/cx-60.webp',
      label: 'Mazda CX-60',
      year: 2024,
    },
    'CX-70': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/cx-70.webp',
      label: 'Mazda CX-70',
      year: 2025,
    },
    'CX-80': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/cx-80.webp',
      label: 'Mazda CX-80',
      year: 2025,
    },
    'CX-90': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/cx-90.webp',
      label: 'Mazda CX-90',
      year: 2024,
    },
    'MX-30': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/mx-30.webp',
      label: 'Mazda MX-30',
      year: 2024,
    },
    'MX-5 (Miata)': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/mx-5-miata.webp',
      label: 'Mazda MX-5 (Miata)',
      year: 2024,
    },
    'Mazda2': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/mazda2.webp',
      label: 'Mazda Mazda2',
      year: 2024,
    },
    'Mazda2 Hybrid': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/mazda2-hybrid.webp',
      label: 'Mazda Mazda2 Hybrid',
      year: 2024,
    },
    'Mazda3': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/mazda3.webp',
      label: 'Mazda Mazda3',
      year: 2024,
    },
    'Mazda6': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/mazda6.webp',
      label: 'Mazda Mazda6',
      year: 2023,
    },
    'EZ-60': {
      uri: 'http://91.107.161.67:3000/static/cars/mazda/ez-60.webp',
      label: 'Mazda EZ-60',
      year: 2025,
    },
  },

  Mitsubishi: {
    'Attrage': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/attrage.webp',
      label: 'Mitsubishi Attrage',
      year: 2024,
    },
    'Colt': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/colt.webp',
      label: 'Mitsubishi Colt',
      year: 2024,
    },
    'Delica': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/delica.webp',
      label: 'Mitsubishi Delica',
      year: 2024,
    },
    'Gallant': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/gallant.webp',
      label: 'Mitsubishi Gallant',
      year: 2012,
    },
    'Eclipse Cross': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/eclipse-cross.webp',
      label: 'Mitsubishi Eclipse Cross',
      year: 2024,
    },
    'Lancer': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/lancer.webp',
      label: 'Mitsubishi Lancer',
      year: 2017,
    },
    'Mirage': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/mirage.webp',
      label: 'Mitsubishi Mirage',
      year: 2023,
    },
    'Mirage G4': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/mirage-g4.webp',
      label: 'Mitsubishi Mirage G4',
      year: 2023,
    },
    'Outlander': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/outlander.webp',
      label: 'Mitsubishi Outlander',
      year: 2024,
    },
    'Outlander PHEV': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/outlander-phev.webp',
      label: 'Mitsubishi Outlander PHEV',
      year: 2024,
    },
    'Outlander Sport / ASX / RVR': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/outlander-sport-asx-rvr.webp',
      label: 'Mitsubishi Outlander Sport / ASX / RVR',
      year: 2024,
    },
    'Pajero': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/pajero.webp',
      label: 'Mitsubishi Pajero',
      year: 2021,
    },
    'Pajero Sport': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/pajero-sport.webp',
      label: 'Mitsubishi Pajero Sport',
      year: 2024,
    },
    'Triton / L200': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/triton-l200.webp',
      label: 'Mitsubishi Triton / L200',
      year: 2024,
    },
    'Xforce': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/xforce.webp',
      label: 'Mitsubishi Xforce',
      year: 2024,
    },
    'Xpander': {
      uri: 'http://91.107.161.67:3000/static/cars/mitsubishi/xpander.webp',
      label: 'Mitsubishi Xpander',
      year: 2024,
    },
  },

  Subaru: {
    'Ascent': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/ascent.webp',
      label: 'Subaru Ascent',
      year: 2024,
    },
    'BRZ': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/brz.webp',
      label: 'Subaru BRZ',
      year: 2024,
    },
    'Crosstrek': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/crosstrek.webp',
      label: 'Subaru Crosstrek',
      year: 2024,
    },
    'Forester': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/forester.webp',
      label: 'Subaru Forester',
      year: 2024,
    },
    'Impreza': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/impreza.webp',
      label: 'Subaru Impreza',
      year: 2024,
    },
    'Legacy': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/legacy.webp',
      label: 'Subaru Legacy',
      year: 2024,
    },
    'Levorg': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/levorg.webp',
      label: 'Subaru Levorg',
      year: 2024,
    },
    'Outback': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/outback.webp',
      label: 'Subaru Outback',
      year: 2024,
    },
    'Solterra': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/solterra.webp',
      label: 'Subaru Solterra',
      year: 2024,
    },
    'Tribeca': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/tribeca.webp',
      label: 'Subaru Tribeca',
      year: 2014,
    },
    'WRX': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/wrx.webp',
      label: 'Subaru WRX',
      year: 2024,
    },
    'XV': {
      uri: 'http://91.107.161.67:3000/static/cars/subaru/xv.webp',
      label: 'Subaru XV',
      year: 2021,
    },
  },

  Toyota: {
    '4Runner': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/4runner.webp',
      label: 'Toyota 4Runner',
      year: 2025,
    },
    'Avalon': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/avalon.webp',
      label: 'Toyota Avalon',
      year: 2023,
    },
    'C-HR': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/c-hr.webp',
      label: 'Toyota C-HR',
      year: 2024,
    },
    'Camry': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/camry.webp',
      label: 'Toyota Camry',
      year: 2024,
    },
    'Corolla': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/corolla.webp',
      label: 'Toyota Corolla',
      year: 2024,
    },
    'Corolla Cross': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/corolla-cross.webp',
      label: 'Toyota Corolla Cross',
      year: 2024,
    },
    'Crown': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/crown.webp',
      label: 'Toyota Crown',
      year: 2024,
    },
    'FJ Cruiser': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/fj-cruiser.webp',
      label: 'Toyota FJ Cruiser',
      year: 2014,
    },
    'Fortuner': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/fortuner.webp',
      label: 'Toyota Fortuner',
      year: 2024,
    },
    'Grand Highlander': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/grand-highlander.webp',
      label: 'Toyota Grand Highlander',
      year: 2024,
    },
    'Hiace': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/hiace.webp',
      label: 'Toyota Hiace',
      year: 2024,
    },
    'Highlander': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/highlander.webp',
      label: 'Toyota Highlander',
      year: 2024,
    },
    'Hilux': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/hilux.webp',
      label: 'Toyota Hilux',
      year: 2024,
    },
    'Innova': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/innova.webp',
      label: 'Toyota Innova',
      year: 2024,
    },
    'Land Cruiser': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/land-cruiser.webp',
      label: 'Toyota Land Cruiser',
      year: 2024,
    },
    'Land Cruiser Prado': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/land-cruiser-prado.webp',
      label: 'Toyota Land Cruiser Prado',
      year: 2024,
    },
    'Prius': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/prius.webp',
      label: 'Toyota Prius',
      year: 2024,
    },
    'RAV4': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/rav4.webp',
      label: 'Toyota RAV4',
      year: 2024,
    },
    'Rush': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/rush.webp',
      label: 'Toyota Rush',
      year: 2024,
    },
    'Sequoia': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/sequoia.webp',
      label: 'Toyota Sequoia',
      year: 2024,
    },
    'Sienna': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/sienna.webp',
      label: 'Toyota Sienna',
      year: 2024,
    },
    'Supra': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/supra.webp',
      label: 'Toyota Supra',
      year: 2024,
    },
    'Tacoma': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/tacoma.webp',
      label: 'Toyota Tacoma',
      year: 2024,
    },
    'Tundra': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/tundra.webp',
      label: 'Toyota Tundra',
      year: 2024,
    },
    'Venza': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/venza.webp',
      label: 'Toyota Venza',
      year: 2024,
    },
    'Yaris': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/yaris.webp',
      label: 'Toyota Yaris',
      year: 2024,
    },
    'Yaris Cross': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/yaris-cross.webp',
      label: 'Toyota Yaris Cross',
      year: 2024,
    },
    'bZ4X': {
      uri: 'http://91.107.161.67:3000/static/cars/toyota/bz4x.webp',
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
  'http://91.107.161.67:3000/static/cars/toyota/corolla.webp';
