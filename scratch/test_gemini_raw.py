import requests
import json

api_key = ""

# 1. Test OpenAI-compatible endpoint
url_openai = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
headers_openai = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}
payload_openai = {
    "model": "gemini-2.5-flash",
    "messages": [
        {"role": "user", "content": "Reply with only the word: Success"}
    ]
}

print("Testing OpenAI-compatible endpoint...")
try:
    r = requests.post(url_openai, json=payload_openai, headers=headers_openai)
    print("OpenAI-compatible Status:", r.status_code)
    print("OpenAI-compatible Response:", r.text[:200])
except Exception as e:
    print("OpenAI-compatible Error:", e)

# 2. Test Native Gemini API endpoint
url_native = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
headers_native = {
    "Content-Type": "application/json"
}
payload_native = {
    "contents": [{
        "parts": [{"text": "Reply with only the word: Success"}]
    }]
}

print("\nTesting Native Gemini API endpoint...")
try:
    r = requests.post(url_native, json=payload_native, headers=headers_native)
    print("Native Status:", r.status_code)
    print("Native Response:", r.text[:200])
except Exception as e:
    print("Native Error:", e)
