import requests

url = "https://reportai-ytsn.onrender.com/api/v1/generation/generate-report-public"
headers = {
    "Content-Type": "application/json",
    "X-OpenAI-API-Key": ""
}
payload = {
    "project": {
        "title": "Test Project",
        "domain": "AI",
        "description": "A test project"
    },
    "answers": {
        "problem_statement": "To verify if backend can generate LaTeX successfully."
    },
    "questions": [
        {"id": "problem_statement", "label": "What problem does this solve?", "type": "textarea"}
    ]
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print("Status Code:", response.status_code)
    print("Response JSON:")
    print(response.json())
except Exception as e:
    print("Error querying backend:", e)
