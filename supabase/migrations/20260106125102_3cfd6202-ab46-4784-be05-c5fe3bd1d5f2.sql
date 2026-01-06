-- Create savings table for tracking monthly savings
CREATE TABLE public.savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  note TEXT,
  savings_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own savings" 
ON public.savings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings" 
ON public.savings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings" 
ON public.savings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings" 
ON public.savings 
FOR DELETE 
USING (auth.uid() = user_id);