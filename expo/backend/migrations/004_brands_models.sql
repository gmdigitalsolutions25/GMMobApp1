-- ============================================================================
-- Migration 004: Brands & Models Tables
-- Qaraj GM Backend
-- Moves hardcoded brand/model lists into the database for dynamic management
-- ============================================================================

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(96) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(brand_id, name)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON brands(is_active);
CREATE INDEX IF NOT EXISTS idx_models_is_active ON models(is_active);

-- Grant permissions to dashboard_user
GRANT SELECT ON TABLE brands TO dashboard_user;
GRANT SELECT ON TABLE models TO dashboard_user;

-- ============================================================================
-- Seed Data: 7 Brands, 109 Models (from official GM model list)
-- ============================================================================

-- Insert brands (alphabetical, with sort_order)
INSERT INTO brands (name, sort_order) VALUES
    ('BYD',        1),
    ('Ford',       2),
    ('Honda',      3),
    ('Mazda',      4),
    ('Mitsubishi', 5),
    ('Subaru',     6),
    ('Toyota',     7)
ON CONFLICT (name) DO NOTHING;

-- BYD models (14)
INSERT INTO models (brand_id, name, sort_order) VALUES
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Atto 3',     1),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Chazor',     2),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Destroyer',  3),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Dolphin',    4),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Han',        5),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Leopard',    6),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Qin Plus',   7),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Seal',       8),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Seal U',     9),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Sealion 7',  10),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Shark',      11),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Song Plus',  12),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Tang',       13),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Yuan Plus',  14)
ON CONFLICT (brand_id, name) DO NOTHING;

-- Ford models (21)
INSERT INTO models (brand_id, name, sort_order) VALUES
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Bronco',         1),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Bronco Sport',   2),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Courier',        3),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Custom',         4),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'EcoSport',       5),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Edge',           6),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Escape (Kuga)',  7),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Expedition',     8),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Explorer',       9),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'F-150',          10),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Fiesta',         11),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Focus',          12),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Fusion',         13),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Maverick',       14),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Mondeo',         15),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Mustang',        16),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Mustang Mach-E', 17),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Puma',           18),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Ranger',         19),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Super Duty',     20),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Transit',        21)
ON CONFLICT (brand_id, name) DO NOTHING;

-- Honda models (12)
INSERT INTO models (brand_id, name, sort_order) VALUES
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Accord',      1),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'City',        2),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Civic',       3),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'CR-V',        4),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'e:NS',        5),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Fit / Jazz',  6),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'HR-V',        7),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Insight',     8),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Odyssey',     9),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Passport',    10),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Pilot',       11),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Ridgeline',   12)
ON CONFLICT (brand_id, name) DO NOTHING;

-- Mazda models (15)
INSERT INTO models (brand_id, name, sort_order) VALUES
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-3',    1),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-5',    2),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-7',    3),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-9',    4),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-30',   5),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-50',   6),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-60',   7),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-70',   8),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-80',   9),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-90',   10),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'EZ-60',   11),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'Mazda2',  12),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'Mazda3',  13),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'Mazda6',  14),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'MX-5',    15)
ON CONFLICT (brand_id, name) DO NOTHING;

-- Mitsubishi models (13)
INSERT INTO models (brand_id, name, sort_order) VALUES
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'ASX',              1),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Attrage',          2),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Eclipse Cross',    3),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Gallant',          4),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Lancer',           5),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Mirage',           6),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Mirage G4',        7),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Outlander',        8),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Outlander PHEV',   9),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Outlander Sport',  10),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Pajero',           11),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Pajero Sport',     12),
    ((SELECT id FROM brands WHERE name = 'Mitsubishi'), 'Triton / L200',    13)
ON CONFLICT (brand_id, name) DO NOTHING;

-- Subaru models (10)
INSERT INTO models (brand_id, name, sort_order) VALUES
    ((SELECT id FROM brands WHERE name = 'Subaru'), 'Ascent',    1),
    ((SELECT id FROM brands WHERE name = 'Subaru'), 'BRZ',       2),
    ((SELECT id FROM brands WHERE name = 'Subaru'), 'Crosstrek', 3),
    ((SELECT id FROM brands WHERE name = 'Subaru'), 'Forester',  4),
    ((SELECT id FROM brands WHERE name = 'Subaru'), 'Impreza',   5),
    ((SELECT id FROM brands WHERE name = 'Subaru'), 'Legacy',    6),
    ((SELECT id FROM brands WHERE name = 'Subaru'), 'Outback',   7),
    ((SELECT id FROM brands WHERE name = 'Subaru'), 'Solterra',  8),
    ((SELECT id FROM brands WHERE name = 'Subaru'), 'Tribeca',   9),
    ((SELECT id FROM brands WHERE name = 'Subaru'), 'XV',        10)
ON CONFLICT (brand_id, name) DO NOTHING;

-- Toyota models (24)
INSERT INTO models (brand_id, name, sort_order) VALUES
    ((SELECT id FROM brands WHERE name = 'Toyota'), '4Runner',             1),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Avalon',             2),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'bZ4X',              3),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'C-HR',              4),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Camry',             5),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Corolla',           6),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Corolla Cross',     7),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Crown',             8),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'FJ Cruiser',        9),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Fortuner',          10),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Grand Highlander',  11),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Hiace',             12),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Highlander',        13),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Hilux',             14),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Land Cruiser',      15),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Land Cruiser Prado',16),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Prius',             17),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'RAV4',              18),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Sequoia',           19),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Tacoma',            20),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Tundra',            21),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Venza',             22),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Yaris',             23),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Yaris Cross',       24)
ON CONFLICT (brand_id, name) DO NOTHING;
