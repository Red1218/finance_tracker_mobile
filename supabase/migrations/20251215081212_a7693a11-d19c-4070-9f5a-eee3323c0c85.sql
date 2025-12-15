-- Add limit column to credit_cards table
ALTER TABLE public.credit_cards 
ADD COLUMN IF NOT EXISTS credit_limit numeric NOT NULL DEFAULT 0;