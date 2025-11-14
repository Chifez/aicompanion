ALTER TABLE app_users
    ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';

UPDATE app_users
   SET password_hash = COALESCE(NULLIF(password_hash, ''), '$2a$12$NMS4Hy9KaLgsx3ElJYyhf.7WCs8IYtPZxoMA.BHTTX3e8DqRLVQBm');

ALTER TABLE app_users
    ALTER COLUMN password_hash DROP DEFAULT;

