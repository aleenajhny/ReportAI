import os
import re

pattern = re.compile(r"sk-[a-zA-Z0-9_\-]{30,}", re.IGNORECASE)

search_dirs = [
    r"C:\Users\amalr"
]

ignored_dirs = {
    "node_modules", ".git", ".next", "venv", "env", "__pycache__", 
    "AppData", "JDownloader", "playwright", "chrome-win", "bin", 
    "Microsoft", "Intel", "Dell", "HP", "Dropbox", "OneDrive"
}

allowed_extensions = {
    ".txt", ".js", ".ts", ".tsx", ".env", ".json", ".py", ".html", 
    ".yml", ".yaml", ".ini", ".conf", ".md", ".sh", ".bat", ".ps1"
}

found_keys = []

print("Scanning C:\\Users\\amalr recursively for OpenAI keys...")
for root_dir in search_dirs:
    if not os.path.exists(root_dir):
        continue
    for root, dirs, files in os.walk(root_dir):
        # Filter directories
        dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith(".")]
        
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext not in allowed_extensions:
                continue
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for match in pattern.finditer(content):
                        found_keys.append((file_path, match.group(0)))
                        print(f"Found: {file_path} -> {match.group(0)}")
            except Exception as e:
                pass

print("Scan complete.")
print(f"Total keys found: {len(found_keys)}")
