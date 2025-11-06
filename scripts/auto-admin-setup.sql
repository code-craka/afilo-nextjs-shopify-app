-- Auto Admin Setup for rihan@afilo.io
-- This will automatically grant admin access when rihan@afilo.io logs in

-- Create a function to auto-grant admin access to specific emails
CREATE OR REPLACE FUNCTION auto_grant_admin_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new user has a designated admin email
  IF NEW.email IN ('rihan@afilo.io', 'admin@afilo.io') THEN
    NEW.role = 'admin';
    RAISE NOTICE 'Auto-granted admin access to %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before INSERT on user_profiles
DROP TRIGGER IF EXISTS auto_admin_trigger ON user_profiles;
CREATE TRIGGER auto_admin_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_grant_admin_access();

-- Also update existing user if they already exist (in case they signed up but haven't been granted admin yet)
UPDATE user_profiles
SET role = 'admin'
WHERE email IN ('rihan@afilo.io', 'admin@afilo.io')
AND role != 'admin';

-- Display current admin users
SELECT
  clerk_user_id,
  email,
  role,
  created_at
FROM user_profiles
WHERE role = 'admin'
ORDER BY created_at DESC;