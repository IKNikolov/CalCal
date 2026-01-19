-- PostgreSQL Schema for Calorie Calculator
-- Create database first: CREATE DATABASE calorie_calculator;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  daily_calorie_goal INTEGER DEFAULT 2000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calorie entries table
CREATE TABLE IF NOT EXISTS calorie_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  food_description TEXT NOT NULL,
  total_calories INTEGER NOT NULL,
  entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('text', 'image')),
  image_url TEXT,
  ai_response JSONB,
  confidence VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calorie_entries_user_id ON calorie_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_calorie_entries_entry_date ON calorie_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_calorie_entries_user_date ON calorie_entries(user_id, entry_date DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calorie_entries_updated_at
  BEFORE UPDATE ON calorie_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
