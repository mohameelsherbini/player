-- Add owner_reply to reviews table
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS owner_reply TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS owner_reply_at TIMESTAMPTZ;

-- Allow owner to update the owner_reply column
CREATE POLICY "Owners can reply to reviews for their pitches"
    ON public.reviews
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.pitches
            WHERE pitches.id = reviews.pitch_id
            AND pitches.owner_id = auth.uid()
        )
    );
