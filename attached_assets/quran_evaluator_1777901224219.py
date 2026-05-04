import os
import json
from mistralai import Mistral

MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY", "")
MODEL_NAME = "mistral-large-latest"
QURAN_FILE_PATH = "quran.json"

class QuranMistralEvaluator:
    def __init__(self, api_key):
        self.client = Mistral(api_key=api_key)

    def evaluate(self, original, user):
        system_instruction = "You are a Quran recitation evaluator. Compare the texts and return JSON with status, accuracy_score, and teacher_note in Arabic."
        response = self.client.chat.complete(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": f"Original: {original}\nUser: {user}"}
            ],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)

if __name__ == "__main__":
    try:
        if not os.path.exists(QURAN_FILE_PATH):
            print(f"Error: {QURAN_FILE_PATH} not found in this folder!")
        else:
            with open(QURAN_FILE_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            ref = data['surahs'][0]['verses'][1]['text']
            user_input = "الْحَمْدُ لِلَّهَ رَبِّ الْعَالَمِينَ"
            
            evaluator = QuranMistralEvaluator(MISTRAL_API_KEY)
            result = evaluator.evaluate(ref, user_input)
            print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {str(e)}")