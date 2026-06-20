-- ============================================================
-- Vacation Planner Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- VACATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS vacations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  description TEXT,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  cover_image VARCHAR(512),
  status      VARCHAR(50) NOT NULL DEFAULT 'planning'
                CHECK (status IN ('planning', 'upcoming', 'active', 'completed', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACTIVITIES  (places to visit, eat, things to do)
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacation_id   UUID NOT NULL REFERENCES vacations(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  category      VARCHAR(50) NOT NULL DEFAULT 'activity'
                  CHECK (category IN ('place_to_visit', 'restaurant', 'activity', 'accommodation', 'transport', 'other')),
  description   TEXT,
  location      VARCHAR(255),
  address       TEXT,
  website       VARCHAR(512),
  phone         VARCHAR(50),
  scheduled_date DATE,
  scheduled_time TIME,
  duration_mins  INTEGER,
  cost_estimate  NUMERIC(10,2),
  currency       VARCHAR(10) DEFAULT 'USD',
  status        VARCHAR(50) NOT NULL DEFAULT 'planned'
                  CHECK (status IN ('planned', 'confirmed', 'in_progress', 'completed', 'skipped', 'cancelled')),
  priority      INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PACKING LIST
-- ============================================================
CREATE TABLE IF NOT EXISTS packing_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacation_id UUID NOT NULL REFERENCES vacations(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  category    VARCHAR(100),
  quantity    INTEGER DEFAULT 1,
  packed      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTES / JOURNAL
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacation_id UUID NOT NULL REFERENCES vacations(id) ON DELETE CASCADE,
  title       VARCHAR(255),
  content     TEXT NOT NULL,
  note_date   DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vacations_updated_at
  BEFORE UPDATE ON vacations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER packing_items_updated_at
  BEFORE UPDATE ON packing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_activities_vacation_id  ON activities(vacation_id);
CREATE INDEX IF NOT EXISTS idx_activities_category     ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_status       ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled    ON activities(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_packing_vacation_id     ON packing_items(vacation_id);
CREATE INDEX IF NOT EXISTS idx_notes_vacation_id       ON notes(vacation_id);

-- ============================================================
-- SEED DATA (sample vacation)
-- ============================================================
INSERT INTO vacations (id, title, destination, description, start_date, end_date, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Summer in Tokyo',
  'Tokyo, Japan',
  'Two week exploration of Tokyo — temples, ramen, tech districts, and cherry blossoms.',
  '2025-07-10',
  '2025-07-24',
  'planning'
) ON CONFLICT DO NOTHING;

INSERT INTO activities (vacation_id, title, category, description, location, scheduled_date, scheduled_time, cost_estimate, status, priority)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Senso-ji Temple', 'place_to_visit', 'Historic Buddhist temple in Asakusa', 'Asakusa, Tokyo', '2025-07-11', '09:00', 0, 'planned', 5),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ichiran Ramen', 'restaurant', 'Solo ramen experience at the famous chain', 'Shibuya, Tokyo', '2025-07-11', '13:00', 15.00, 'planned', 4),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Akihabara Electric Town', 'activity', 'Explore anime, manga and electronics district', 'Akihabara, Tokyo', '2025-07-12', '10:00', 50.00, 'planned', 3),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'teamLab Borderless', 'place_to_visit', 'Digital art museum experience', 'Odaiba, Tokyo', '2025-07-13', '10:00', 32.00, 'confirmed', 5),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Park Hyatt Tokyo', 'accommodation', 'Lost in Translation hotel stay', 'Shinjuku, Tokyo', '2025-07-10', '15:00', 400.00, 'confirmed', 5)
ON CONFLICT DO NOTHING;
