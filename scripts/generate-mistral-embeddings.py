import os
import sys
from mistralai.client import MistralClient
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Initialize Mistral client
mistral_api_key = os.getenv("MISTRAL_API_KEY")
if not mistral_api_key:
    print("❌ MISTRAL_API_KEY not found in environment variables")
    sys.exit(1)

mistral = MistralClient(api_key=mistral_api_key)

# Initialize Supabase client
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

def generate_mistral_embedding(text: str) -> list:
    """Generate Mistral embedding for given text"""
    try:
        response = mistral.embeddings.create(
            model="mistral-embed",
            inputs=[text]
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"❌ Error generating embedding: {e}")
        return None

def update_question_embeddings():
    """Update questions in the database that don't have Mistral embeddings yet"""
    try:
        # Fetch only questions that don't have Mistral embeddings
        print("Fetching questions without Mistral embeddings...")
        response = supabase.table('questions').select('id, question_text').is_('mistral_embedding', 'null').execute()
        
        if not response.data:
            print("No questions found without Mistral embeddings")
            return
        
        questions = response.data
        print(f"Found {len(questions)} questions that need Mistral embeddings")
        
        # Process each question
        for i, question in enumerate(questions, 1):
            question_id = question['id']
            question_text = question['question_text']
            
            print(f"Processing {i}/{len(questions)}: {question_text[:50]}...")
            
            # Generate Mistral embedding
            embedding = generate_mistral_embedding(question_text)
            
            if embedding:
                # Update the question with Mistral embedding
                update_response = supabase.table('questions').update({
                    'mistral_embedding': embedding
                }).eq('id', question_id).execute()
                
                if update_response.data:
                    print(f"✅ Updated question: {question_text[:50]}...")
                else:
                    print(f"❌ Failed to update question: {question_text[:50]}...")
            else:
                print(f"❌ Failed to generate embedding for: {question_text[:50]}...")
        
        print(f"\n🎉 Successfully updated {len(questions)} questions with Mistral embeddings!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🚀 Starting Mistral embedding generation for questions...")
    update_question_embeddings()
    print("✅ Done!") 