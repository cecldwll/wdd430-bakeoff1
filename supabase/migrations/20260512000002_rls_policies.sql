-- Row-Level Security (RLS) Policies
-- Ensures users can only access their own data

-- Users table policies
-- Users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Scrapboards policies
-- Users can read their own scrapboards
CREATE POLICY "Users can read own scrapboards"
  ON scrapboards FOR SELECT
  USING (owner_user_id = auth.uid());

-- Users can insert scrapboards they own
CREATE POLICY "Users can create scrapboards"
  ON scrapboards FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- Users can update their own scrapboards
CREATE POLICY "Users can update own scrapboards"
  ON scrapboards FOR UPDATE
  USING (owner_user_id = auth.uid());

-- Users can delete (soft delete) their own scrapboards
CREATE POLICY "Users can delete own scrapboards"
  ON scrapboards FOR DELETE
  USING (owner_user_id = auth.uid());

-- Anonymous users can read shared scrapboards via share token
CREATE POLICY "Anonymous can read shared scrapboards"
  ON scrapboards FOR SELECT
  USING (
    visibility = 'shared'
    AND share_token IS NOT NULL
  );

-- Notes policies
-- Users can read notes from their own scrapboards
CREATE POLICY "Users can read notes from own scrapboards"
  ON notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = notes.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

-- Users can insert notes into their own scrapboards
CREATE POLICY "Users can create notes in own scrapboards"
  ON notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = notes.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

-- Users can update notes in their own scrapboards
CREATE POLICY "Users can update notes in own scrapboards"
  ON notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = notes.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

-- Users can delete notes in their own scrapboards
CREATE POLICY "Users can delete notes in own scrapboards"
  ON notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = notes.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

-- Anonymous users can read notes from shared scrapboards
CREATE POLICY "Anonymous can read notes from shared scrapboards"
  ON notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = notes.scrapboard_id
      AND scrapboards.visibility = 'shared'
      AND scrapboards.share_token IS NOT NULL
      AND notes.deleted_at IS NULL
    )
  );

-- Images policies (same pattern as notes)
CREATE POLICY "Users can read images from own scrapboards"
  ON images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = images.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create images in own scrapboards"
  ON images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = images.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images in own scrapboards"
  ON images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = images.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images in own scrapboards"
  ON images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = images.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous can read images from shared scrapboards"
  ON images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = images.scrapboard_id
      AND scrapboards.visibility = 'shared'
      AND scrapboards.share_token IS NOT NULL
      AND images.deleted_at IS NULL
    )
  );

-- Lines policies (same pattern as notes)
CREATE POLICY "Users can read lines from own scrapboards"
  ON lines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = lines.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lines in own scrapboards"
  ON lines FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = lines.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update lines in own scrapboards"
  ON lines FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = lines.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete lines in own scrapboards"
  ON lines FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = lines.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous can read lines from shared scrapboards"
  ON lines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = lines.scrapboard_id
      AND scrapboards.visibility = 'shared'
      AND scrapboards.share_token IS NOT NULL
      AND lines.deleted_at IS NULL
    )
  );

-- SharedAccess policies
CREATE POLICY "Users can read shared access for own scrapboards"
  ON shared_access FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = shared_access.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shared access for own scrapboards"
  ON shared_access FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = shared_access.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update shared access for own scrapboards"
  ON shared_access FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = shared_access.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shared access for own scrapboards"
  ON shared_access FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM scrapboards
      WHERE scrapboards.id = shared_access.scrapboard_id
      AND scrapboards.owner_user_id = auth.uid()
    )
  );
