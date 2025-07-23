ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password_hash TEXT;
 
-- Example: When creating a user, store the bcrypt hash in this column.
-- UPDATE public.profiles SET password_hash = '<bcrypt_hash>' WHERE email = '<user_email>'; 