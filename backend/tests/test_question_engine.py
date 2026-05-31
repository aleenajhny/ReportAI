from app.services.question_engine import QuestionnaireEngine


def test_questionnaire_engine_adds_ai_questions() -> None:
    questions = QuestionnaireEngine().generate("AI Project")
    ids = {question["id"] for question in questions}
    assert {"dataset", "model_architecture", "accuracy"}.issubset(ids)
