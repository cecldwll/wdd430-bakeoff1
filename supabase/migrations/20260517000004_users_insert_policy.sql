-- Allow authenticated users to create their own profile row.
-- Server routes should still prefer the service role key during signup,
-- because email confirmation can mean there is no session yet.
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
