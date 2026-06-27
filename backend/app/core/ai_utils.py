from openai import OpenAI
from app.core.config import settings


PROVIDER_MODELS = {
    "openai": getattr(settings, "openai_model", "gpt-4o-mini"),
    "gemini": "gemini-2.5-flash",
    "groq": "llama-3.3-70b-versatile",
}


def get_openai_client_and_model(
    api_key: str | None = None,
) -> tuple[OpenAI, str]:
    """
    Returns an OpenAI-compatible client.

    Supports:
    - OpenAI
    - Google Gemini
    - Groq
    """

    key = api_key or settings.openai_api_key

    if not key:
        raise ValueError("No AI API key configured.")

    provider = "openai"
    base_url = None

    # -----------------------------
    # Google Gemini
    # Supports both old AIza... keys
    # and new AQ.... AI Studio keys
    # -----------------------------
    if key.startswith(("AIza", "AQ.")):
        provider = "gemini"
        base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"

    # -----------------------------
    # Groq
    # -----------------------------
    elif key.startswith("gsk_"):
        provider = "groq"
        base_url = "https://api.groq.com/openai/v1"

    # -----------------------------
    # OpenAI
    # -----------------------------
    elif key.startswith(("sk-", "sk-proj-")):
        provider = "openai"

    print("=" * 70)
    print(f"AI Provider : {provider}")
    print(f"Model       : {PROVIDER_MODELS[provider]}")
    print(f"Base URL    : {base_url}")
    print("=" * 70)

    client = OpenAI(
        api_key=key,
        base_url=base_url,
    )

    return client, PROVIDER_MODELS[provider]