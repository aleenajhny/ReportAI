class QuestionnaireEngine:
    COMMON = [
        {"id": "problem_statement", "label": "What problem does your project solve?", "type": "textarea"},
        {"id": "objectives", "label": "List the main objectives.", "type": "textarea"},
        {"id": "scope", "label": "What is included and excluded from scope?", "type": "textarea"},
    ]

    DOMAIN_QUESTIONS = {
        "ai": [
            {"id": "dataset", "label": "Dataset used?", "type": "text"},
            {"id": "model_architecture", "label": "Model architecture?", "type": "text"},
            {"id": "accuracy", "label": "Accuracy achieved?", "type": "text"},
        ],
        "iot": [
            {"id": "sensors", "label": "Sensors used?", "type": "text"},
            {"id": "controller", "label": "Controller used?", "type": "text"},
            {"id": "protocol", "label": "Communication protocol?", "type": "text"},
        ],
        "web": [
            {"id": "tech_stack", "label": "Tech stack?", "type": "text"},
            {"id": "architecture", "label": "Application architecture?", "type": "textarea"},
            {"id": "database", "label": "Database used?", "type": "text"},
        ],
    }

    def generate(self, domain: str) -> list[dict]:
        key = domain.lower()
        for candidate in self.DOMAIN_QUESTIONS:
            if candidate in key:
                return self.COMMON + self.DOMAIN_QUESTIONS[candidate]
        return self.COMMON + [
            {"id": "tools", "label": "Tools, frameworks, or hardware used?", "type": "textarea"},
            {"id": "evaluation", "label": "How will the project be evaluated?", "type": "textarea"},
        ]
