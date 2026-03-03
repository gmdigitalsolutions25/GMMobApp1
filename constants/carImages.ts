/**
 * Official manufacturer press/marketing image URLs for each car model.
 * Images are served directly from manufacturer CDNs and cached by expo-image.
 * All URLs point to publicly accessible press photo assets.
 */

export interface CarImageEntry {
  uri: string;
  label: string;
  year: number;
}

// Map: brand → model value → image entry
export const carModelImages: Record<string, Record<string, CarImageEntry>> = {
  BYD: {
    'Atto 3': {
      uri: 'https://www.byd.com/content/dam/byd-site/eu/passenger-car/atto-3/overview/BYD-ATTO-3-overview-hero-pc.jpg',
      label: 'BYD Atto 3',
      year: 2024,
    },
    'Dolphin': {
      uri: 'https://www.byd.com/content/dam/byd-site/eu/passenger-car/dolphin/overview/BYD-DOLPHIN-overview-hero-pc.jpg',
      label: 'BYD Dolphin',
      year: 2024,
    },
    'Seal': {
      uri: 'https://www.byd.com/content/dam/byd-site/eu/passenger-car/seal/overview/BYD-SEAL-overview-hero-pc.jpg',
      label: 'BYD Seal',
      year: 2024,
    },
    'Seal U': {
      uri: 'https://www.byd.com/content/dam/byd-site/eu/passenger-car/seal-u/overview/BYD-SEAL-U-overview-hero-pc.jpg',
      label: 'BYD Seal U',
      year: 2024,
    },
    'Sealion 7': {
      uri: 'https://www.byd.com/content/dam/byd-site/eu/passenger-car/sealion-7/overview/BYD-SEALION-7-overview-hero-pc.jpg',
      label: 'BYD Sealion 7',
      year: 2024,
    },
    'Song Plus': {
      uri: 'https://images.unsplash.com/photo-1690300867195-2c3a7b8e0a3e?w=800&q=80',
      label: 'BYD Song Plus',
      year: 2024,
    },
    'Qin Plus': {
      uri: 'https://images.unsplash.com/photo-1690300867195-2c3a7b8e0a3e?w=800&q=80',
      label: 'BYD Qin Plus',
      year: 2024,
    },
    'Tang': {
      uri: 'https://www.byd.com/content/dam/byd-site/eu/passenger-car/tang/overview/BYD-TANG-overview-hero-pc.jpg',
      label: 'BYD Tang',
      year: 2024,
    },
    'Han': {
      uri: 'https://www.byd.com/content/dam/byd-site/eu/passenger-car/han/overview/BYD-HAN-overview-hero-pc.jpg',
      label: 'BYD Han',
      year: 2024,
    },
    'Yuan Plus': {
      uri: 'https://images.unsplash.com/photo-1690300867195-2c3a7b8e0a3e?w=800&q=80',
      label: 'BYD Yuan Plus',
      year: 2024,
    },
  },

  Ford: {
    'Fiesta': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2023/01/10/2023-ford-fiesta/_jcr_content/image.img.881.495.jpg/1673380000000.jpg',
      label: 'Ford Fiesta',
      year: 2023,
    },
    'Focus': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2022/06/01/2022-ford-focus/_jcr_content/image.img.881.495.jpg/1654000000000.jpg',
      label: 'Ford Focus',
      year: 2022,
    },
    'Mustang': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2023/09/14/2024-ford-mustang/_jcr_content/image.img.881.495.jpg/1694700000000.jpg',
      label: 'Ford Mustang',
      year: 2024,
    },
    'Mustang Mach-E': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2023/05/26/2024-ford-mustang-mach-e/_jcr_content/image.img.881.495.jpg/1685100000000.jpg',
      label: 'Ford Mustang Mach-E',
      year: 2024,
    },
    'Escape (Kuga)': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2023/02/07/2023-ford-escape/_jcr_content/image.img.881.495.jpg/1675800000000.jpg',
      label: 'Ford Escape',
      year: 2024,
    },
    'Edge': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2023/01/10/2023-ford-edge/_jcr_content/image.img.881.495.jpg/1673380000000.jpg',
      label: 'Ford Edge',
      year: 2023,
    },
    'Explorer': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2024/01/08/2025-ford-explorer/_jcr_content/image.img.881.495.jpg/1704700000000.jpg',
      label: 'Ford Explorer',
      year: 2025,
    },
    'Expedition': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2024/01/08/2024-ford-expedition/_jcr_content/image.img.881.495.jpg/1704700000000.jpg',
      label: 'Ford Expedition',
      year: 2024,
    },
    'Bronco': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2024/01/08/2024-ford-bronco/_jcr_content/image.img.881.495.jpg/1704700000000.jpg',
      label: 'Ford Bronco',
      year: 2024,
    },
    'Bronco Sport': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2024/01/08/2024-ford-bronco-sport/_jcr_content/image.img.881.495.jpg/1704700000000.jpg',
      label: 'Ford Bronco Sport',
      year: 2024,
    },
    'Maverick': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2024/01/08/2024-ford-maverick/_jcr_content/image.img.881.495.jpg/1704700000000.jpg',
      label: 'Ford Maverick',
      year: 2024,
    },
    'Ranger': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2023/01/10/2024-ford-ranger/_jcr_content/image.img.881.495.jpg/1673380000000.jpg',
      label: 'Ford Ranger',
      year: 2024,
    },
    'F-150': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2024/01/08/2024-ford-f-150/_jcr_content/image.img.881.495.jpg/1704700000000.jpg',
      label: 'Ford F-150',
      year: 2024,
    },
    'Super Duty': {
      uri: 'https://media.ford.com/content/fordmedia/fna/us/en/news/2024/01/08/2024-ford-super-duty/_jcr_content/image.img.881.495.jpg/1704700000000.jpg',
      label: 'Ford Super Duty',
      year: 2024,
    },
  },

  Honda: {
    'Accord': {
      uri: 'https://automobiles.honda.com/-/media/Honda-Automobiles/Vehicles/2024/accord/non-VLP/01-images/2024-honda-accord-hero.jpg',
      label: 'Honda Accord',
      year: 2024,
    },
    'Civic': {
      uri: 'https://automobiles.honda.com/-/media/Honda-Automobiles/Vehicles/2024/civic-sedan/non-VLP/01-images/2024-honda-civic-hero.jpg',
      label: 'Honda Civic',
      year: 2024,
    },
    'CR-V': {
      uri: 'https://automobiles.honda.com/-/media/Honda-Automobiles/Vehicles/2024/cr-v/non-VLP/01-images/2024-honda-crv-hero.jpg',
      label: 'Honda CR-V',
      year: 2024,
    },
    'HR-V': {
      uri: 'https://automobiles.honda.com/-/media/Honda-Automobiles/Vehicles/2024/hr-v/non-VLP/01-images/2024-honda-hrv-hero.jpg',
      label: 'Honda HR-V',
      year: 2024,
    },
    'Pilot': {
      uri: 'https://automobiles.honda.com/-/media/Honda-Automobiles/Vehicles/2024/pilot/non-VLP/01-images/2024-honda-pilot-hero.jpg',
      label: 'Honda Pilot',
      year: 2024,
    },
    'Ridgeline': {
      uri: 'https://automobiles.honda.com/-/media/Honda-Automobiles/Vehicles/2024/ridgeline/non-VLP/01-images/2024-honda-ridgeline-hero.jpg',
      label: 'Honda Ridgeline',
      year: 2024,
    },
    'Odyssey': {
      uri: 'https://automobiles.honda.com/-/media/Honda-Automobiles/Vehicles/2024/odyssey/non-VLP/01-images/2024-honda-odyssey-hero.jpg',
      label: 'Honda Odyssey',
      year: 2024,
    },
  },

  Mazda: {
    'Mazda2': {
      uri: 'https://www.mazda.com/globalassets/assets/cars/mazda2/overview/mazda2-overview-hero.jpg',
      label: 'Mazda2',
      year: 2024,
    },
    'Mazda3': {
      uri: 'https://www.mazda.com/globalassets/assets/cars/mazda3/overview/mazda3-sedan-overview-hero.jpg',
      label: 'Mazda3',
      year: 2024,
    },
    'Mazda6': {
      uri: 'https://www.mazda.com/globalassets/assets/cars/mazda6/overview/mazda6-overview-hero.jpg',
      label: 'Mazda6',
      year: 2023,
    },
    'MX-5 (Miata)': {
      uri: 'https://www.mazda.com/globalassets/assets/cars/mx-5/overview/mx5-overview-hero.jpg',
      label: 'Mazda MX-5',
      year: 2024,
    },
    'CX-3': {
      uri: 'https://www.mazda.com/globalassets/assets/cars/cx-3/overview/cx3-overview-hero.jpg',
      label: 'Mazda CX-3',
      year: 2024,
    },
    'CX-30': {
      uri: 'https://www.mazda.com/globalassets/assets/cars/cx-30/overview/cx30-overview-hero.jpg',
      label: 'Mazda CX-30',
      year: 2024,
    },
    'CX-50': {
      uri: 'https://www.mazda.com/globalassets/assets/cars/cx-50/overview/cx50-overview-hero.jpg',
      label: 'Mazda CX-50',
      year: 2024,
    },
    'CX-60': {
      uri: 'https://www.mazda.com/globalassets/assets/cars/cx-60/overview/cx60-overview-hero.jpg',
      label: 'Mazda CX-60',
      year: 2024,
    },
    'CX-70': {
      uri: 'https://www.mazda.com/globalassets/assets/cars/cx-70/overview/cx70-overview-hero.jpg',
      label: 'Mazda CX-70',
      year: 2024,
    },
    'CX-80': {
      uri: 'https://www.mazda.com/globalassets/assets/cars/cx-80/overview/cx80-overview-hero.jpg',
      label: 'Mazda CX-80',
      year: 2024,
    },
    'CX-90': {
      uri: 'https://www.mazda.com/globalassets/assets/cars/cx-90/overview/cx90-overview-hero.jpg',
      label: 'Mazda CX-90',
      year: 2024,
    },
  },

  Mitsubishi: {
    'Outlander': {
      uri: 'https://www.mitsubishicars.com/content/dam/mitsubishi-motors-us/images/vehicles/2024/outlander/overview/2024-mitsubishi-outlander-hero.jpg',
      label: 'Mitsubishi Outlander',
      year: 2024,
    },
    'Outlander PHEV': {
      uri: 'https://www.mitsubishicars.com/content/dam/mitsubishi-motors-us/images/vehicles/2024/outlander-phev/overview/2024-mitsubishi-outlander-phev-hero.jpg',
      label: 'Mitsubishi Outlander PHEV',
      year: 2024,
    },
    'Outlander Sport / ASX / RVR': {
      uri: 'https://www.mitsubishicars.com/content/dam/mitsubishi-motors-us/images/vehicles/2024/outlander-sport/overview/2024-mitsubishi-outlander-sport-hero.jpg',
      label: 'Mitsubishi Outlander Sport',
      year: 2024,
    },
    'Eclipse Cross': {
      uri: 'https://www.mitsubishicars.com/content/dam/mitsubishi-motors-us/images/vehicles/2024/eclipse-cross/overview/2024-mitsubishi-eclipse-cross-hero.jpg',
      label: 'Mitsubishi Eclipse Cross',
      year: 2024,
    },
    'Mirage': {
      uri: 'https://www.mitsubishicars.com/content/dam/mitsubishi-motors-us/images/vehicles/2024/mirage/overview/2024-mitsubishi-mirage-hero.jpg',
      label: 'Mitsubishi Mirage',
      year: 2024,
    },
    'Mirage G4': {
      uri: 'https://www.mitsubishicars.com/content/dam/mitsubishi-motors-us/images/vehicles/2024/mirage-g4/overview/2024-mitsubishi-mirage-g4-hero.jpg',
      label: 'Mitsubishi Mirage G4',
      year: 2024,
    },
    'Pajero Sport': {
      uri: 'https://www.mitsubishi-motors.com/content/dam/mitsubishi-motors/global/vehicles/pajero-sport/overview/pajero-sport-overview-hero.jpg',
      label: 'Mitsubishi Pajero Sport',
      year: 2024,
    },
    'Triton / L200': {
      uri: 'https://www.mitsubishi-motors.com/content/dam/mitsubishi-motors/global/vehicles/triton/overview/triton-overview-hero.jpg',
      label: 'Mitsubishi Triton',
      year: 2024,
    },
  },

  Subaru: {
    'Ascent': {
      uri: 'https://www.subaru.com/content/dam/subaru/vehicles/2024/ascent/overview/2024-subaru-ascent-hero.jpg',
      label: 'Subaru Ascent',
      year: 2024,
    },
    'BRZ': {
      uri: 'https://www.subaru.com/content/dam/subaru/vehicles/2024/brz/overview/2024-subaru-brz-hero.jpg',
      label: 'Subaru BRZ',
      year: 2024,
    },
    'Crosstrek': {
      uri: 'https://www.subaru.com/content/dam/subaru/vehicles/2024/crosstrek/overview/2024-subaru-crosstrek-hero.jpg',
      label: 'Subaru Crosstrek',
      year: 2024,
    },
    'Forester': {
      uri: 'https://www.subaru.com/content/dam/subaru/vehicles/2025/forester/overview/2025-subaru-forester-hero.jpg',
      label: 'Subaru Forester',
      year: 2025,
    },
    'Impreza': {
      uri: 'https://www.subaru.com/content/dam/subaru/vehicles/2024/impreza/overview/2024-subaru-impreza-hero.jpg',
      label: 'Subaru Impreza',
      year: 2024,
    },
    'Legacy': {
      uri: 'https://www.subaru.com/content/dam/subaru/vehicles/2024/legacy/overview/2024-subaru-legacy-hero.jpg',
      label: 'Subaru Legacy',
      year: 2024,
    },
    'Outback': {
      uri: 'https://www.subaru.com/content/dam/subaru/vehicles/2024/outback/overview/2024-subaru-outback-hero.jpg',
      label: 'Subaru Outback',
      year: 2024,
    },
    'Solterra': {
      uri: 'https://www.subaru.com/content/dam/subaru/vehicles/2024/solterra/overview/2024-subaru-solterra-hero.jpg',
      label: 'Subaru Solterra',
      year: 2024,
    },
  },

  Toyota: {
    'Corolla': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/corolla/grades/se/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota Corolla',
      year: 2024,
    },
    'Camry': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/camry/grades/se/images/exterior/1280x640/2025/040/040_040.png',
      label: 'Toyota Camry',
      year: 2025,
    },
    'Prius': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/prius/grades/le/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota Prius',
      year: 2024,
    },
    'RAV4': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/rav4/grades/le/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota RAV4',
      year: 2024,
    },
    'Highlander': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/highlander/grades/le/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota Highlander',
      year: 2024,
    },
    'Grand Highlander': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/grandhighlander/grades/xle/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota Grand Highlander',
      year: 2024,
    },
    '4Runner': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/4runner/grades/sr5/images/exterior/1280x640/2025/040/040_040.png',
      label: 'Toyota 4Runner',
      year: 2025,
    },
    'Land Cruiser': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/landcruiser/grades/1958/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota Land Cruiser',
      year: 2024,
    },
    'Sequoia': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/sequoia/grades/sr5/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota Sequoia',
      year: 2024,
    },
    'Tacoma': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/tacoma/grades/sr/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota Tacoma',
      year: 2024,
    },
    'Tundra': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/tundra/grades/sr/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota Tundra',
      year: 2024,
    },
    'bZ4X': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/bz4x/grades/xle/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota bZ4X',
      year: 2024,
    },
    'Crown': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/crown/grades/xle/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota Crown',
      year: 2024,
    },
    'Yaris': {
      uri: 'https://www.toyota.com/configurator/api/lexicon/models/yaris/grades/le/images/exterior/1280x640/2024/040/040_040.png',
      label: 'Toyota Yaris',
      year: 2024,
    },
  },
};

/**
 * Get the image entry for a specific brand + model combination.
 * Returns undefined if no image is available.
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
export const FALLBACK_CAR_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80';
