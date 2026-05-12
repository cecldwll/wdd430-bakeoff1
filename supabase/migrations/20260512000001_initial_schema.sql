-- Initial Database Schema for Digital Scrapboard
-- This migration creates all core tables and their relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  reset_password_token VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  settings JSONB DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Scrapboard table
CREATE TABLE scrapboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visibility VARCHAR(50) DEFAULT 'private' CHECK (visibility IN ('private', 'shared')),
  share_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Note table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrapboard_id UUID NOT NULL REFERENCES scrapboards(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('typed', 'handwritten')),
  content TEXT,
  image_url VARCHAR(500),
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  width FLOAT NOT NULL DEFAULT 200,
  height FLOAT NOT NULL DEFAULT 150,
  background_theme VARCHAR(50) DEFAULT 'yellow_sticky' CHECK (
    background_theme IN ('yellow_sticky', 'pink_sticky', 'kraft_paper', 'postcard', 'blue_sticky', 'scrap')
  ),
  z_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Image table
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrapboard_id UUID NOT NULL REFERENCES scrapboards(id) ON DELETE CASCADE,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  width FLOAT NOT NULL DEFAULT 300,
  height FLOAT NOT NULL DEFAULT 300,
  rotation_degrees FLOAT DEFAULT 0,
  z_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Line table
CREATE TABLE lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrapboard_id UUID NOT NULL REFERENCES scrapboards(id) ON DELETE CASCADE,
  from_element_id UUID NOT NULL,
  from_element_type VARCHAR(50) NOT NULL CHECK (from_element_type IN ('note', 'image')),
  to_element_id UUID NOT NULL,
  to_element_type VARCHAR(50) NOT NULL CHECK (to_element_type IN ('note', 'image')),
  style VARCHAR(50) DEFAULT 'solid' CHECK (style IN ('solid', 'dashed')),
  color VARCHAR(50) DEFAULT '#000000',
  z_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- SharedAccess table
CREATE TABLE shared_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrapboard_id UUID NOT NULL UNIQUE REFERENCES scrapboards(id) ON DELETE CASCADE,
  share_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_scrapboards_owner ON scrapboards(owner_user_id);
CREATE INDEX idx_scrapboards_share_token ON scrapboards(share_token);
CREATE INDEX idx_notes_scrapboard ON notes(scrapboard_id);
CREATE INDEX idx_notes_deleted_at ON notes(deleted_at);
CREATE INDEX idx_images_scrapboard ON images(scrapboard_id);
CREATE INDEX idx_images_deleted_at ON images(deleted_at);
CREATE INDEX idx_lines_scrapboard ON lines(scrapboard_id);
CREATE INDEX idx_lines_deleted_at ON lines(deleted_at);
CREATE INDEX idx_shared_access_token ON shared_access(share_token);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrapboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_access ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scrapboards_updated_at BEFORE UPDATE ON scrapboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lines_updated_at BEFORE UPDATE ON lines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
