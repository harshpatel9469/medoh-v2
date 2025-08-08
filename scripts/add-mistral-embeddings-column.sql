-- Add new column for Mistral embeddings (1024 dimensions)
ALTER TABLE questions ADD COLUMN mistral_embedding vector(1024);
 
-- Add comment to document the column
COMMENT ON COLUMN questions.mistral_embedding IS 'Mistral embeddings for semantic search (1024 dimensions)'; 