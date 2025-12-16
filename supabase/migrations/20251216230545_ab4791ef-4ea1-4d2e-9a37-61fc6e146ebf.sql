-- Add is_default column to credit_cards table
ALTER TABLE public.credit_cards 
ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;

-- Create function to ensure only one default card per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_card()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.credit_cards 
    SET is_default = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to enforce single default card
CREATE TRIGGER enforce_single_default_card
BEFORE INSERT OR UPDATE ON public.credit_cards
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_default_card();