-- Fix RLS for orcamentos to ensure multi-tenancy/ownership
-- Adding user_id column and updating policies

-- 1. Add user_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orcamentos' AND column_name = 'user_id') THEN
        ALTER TABLE public.orcamentos ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- 2. Drop existing weak policies
DROP POLICY IF EXISTS "Auth users orcamentos SELECT" ON public.orcamentos;
DROP POLICY IF EXISTS "Auth users orcamentos INSERT" ON public.orcamentos;
DROP POLICY IF EXISTS "Auth users orcamentos UPDATE" ON public.orcamentos;
DROP POLICY IF EXISTS "Auth users orcamentos DELETE" ON public.orcamentos;

-- 3. Create new secure policies based on user_id
CREATE POLICY "Users can view their own budgets" 
ON public.orcamentos FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets" 
ON public.orcamentos FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
ON public.orcamentos FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
ON public.orcamentos FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
