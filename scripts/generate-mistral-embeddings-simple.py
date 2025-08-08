import os
import sys
import requests
import json
from mistralai.client import MistralClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Initialize Mistral client
mistral_api_key = os.getenv("MISTRAL_API_KEY")
if not mistral_api_key:
    print("❌ MISTRAL_API_KEY not found in environment variables")
    sys.exit(1)

mistral = MistralClient(api_key=mistral_api_key)

# Supabase configuration
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def generate_mistral_embedding(text: str) -> list:
    """Generate Mistral embedding for given text"""
    try:
        response = mistral.embeddings(
            model="mistral-embed",
            input=[text]
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"❌ Error generating embedding: {e}")
        return None

def get_questions_without_embeddings():
    """Get questions that don't have Mistral embeddings"""
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }
    
    # Query to get questions without mistral_embedding
    query = f"{supabase_url}/rest/v1/questions?select=id,question_text&mistral_embedding=is.null"
    
    response = requests.get(query, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Error fetching questions: {response.status_code}")
        return []

def update_question_embedding(question_id: str, embedding: list):
    """Update a question with its Mistral embedding"""
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    data = {
        'mistral_embedding': embedding
    }
    
    url = f"{supabase_url}/rest/v1/questions?id=eq.{question_id}"
    response = requests.patch(url, headers=headers, json=data)
    
    return response.status_code == 204

def update_question_embeddings():
    """Update questions in the database that don't have Mistral embeddings yet"""
    try:
        # Fetch only questions that don't have Mistral embeddings
        print("Fetching questions without Mistral embeddings...")
        questions = get_questions_without_embeddings()
        
        if not questions:
            print("No questions found without Mistral embeddings")
            return
        
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
                success = update_question_embedding(question_id, embedding)
                
                if success:
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