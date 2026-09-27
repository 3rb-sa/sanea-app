-- Switching from phone/OTP auth to Google sign-in, so the phone number is no
-- longer verified at signup -- it's just a contact field the user types in
-- themselves. Drop the uniqueness constraint (an unverified field shouldn't
-- block signup over a typo/shared family number) and require it, since the
-- whole app is built around "call/WhatsApp this number".
--
-- Run this once in Supabase Dashboard > SQL Editor

alter table profiles drop constraint if exists profiles_phone_key;
alter table profiles alter column phone set not null;
