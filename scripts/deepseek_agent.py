import sys
import json
import requests
from typing import Dict, Any

class OllamaAPI:
    def __init__(self, model_name: str = "deepseek-r1:1.5b"):
        self.url = "http://localhost:11434/api/generate"
        self.model = model_name

    def generate(self, prompt: str) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40
            }
        }
        try:
            response = requests.post(self.url, json=payload)
            if response.status_code == 200:
                return response.json().get("response", "")
            return f"Error: {response.status_code}"
        except Exception as e:
            return f"Error: {str(e)}"

class SimpleAgent:
    def __init__(self):
        self.llm = OllamaAPI()

    def process_message(self, message: str) -> str:
        prompt = f"""You are a helpful AI assistant.
Question: {message}
Please provide a clear and helpful response."""
        
        return self.llm.generate(prompt)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Please provide input message"}))
        sys.exit(1)

    try:
        agent = SimpleAgent()
        user_message = sys.argv[1]
        response = agent.process_message(user_message)
        print(json.dumps({"response": response}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
