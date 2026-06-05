import sys
import re
from openai import OpenAI

api_key = ""

def get_openai_client_and_model(api_key: str):
    base_url = None
    model = "gpt-4o-mini"
    
    if api_key.startswith("AIzaSy"):
        base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
        model = "gemini-2.5-flash"
    elif api_key.startswith("gsk_"):
        base_url = "https://api.groq.com/openai/v1"
        model = "llama-3.3-70b-versatile"
        
    client = OpenAI(api_key=api_key, base_url=base_url)
    return client, model

try:
    print("Testing client creation and query...")
    client, model = get_openai_client_and_model(api_key)
    print("Model:", model)
    print("Base URL:", client.base_url)
    
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello! Reply in one short sentence."}
        ]
    )
    print("Response:")
    print(response.choices[0].message.content)
except Exception as e:
    import traceback
    print("FAILED with exception:")
    traceback.print_exc()
