-- Create RPC function for Mistral embeddings search
CREATE OR REPLACE FUNCTION match_questions_mistral(
  query_embedding vector(1024),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  question_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.question_text,
    1 - (q.mistral_embedding <=> query_embedding) AS similarity
  FROM questions q
  WHERE q.mistral_embedding IS NOT NULL
    AND 1 - (q.mistral_embedding <=> query_embedding) > match_threshold
  ORDER BY q.mistral_embedding <=> query_embedding
  LIMIT match_count;
END;
$$; 