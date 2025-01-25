import sys
import json
import math
import requests
from typing import List, Dict, Any, Optional, Callable
from datetime import datetime

class OllamaModel:
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

class Tool:
    def __init__(self, name: str, description: str, func: Callable):
        self.name = name
        self.description = description
        self.func = func

class CodeAgent:
    def __init__(self, model: Optional[OllamaModel] = None, tools: Optional[List[Tool]] = None):
        self.model = model or OllamaModel()
        self.base_tools = [
            Tool(
                name="calculate",
                description="Perform mathematical calculations",
                func=self._calculate
            ),
            Tool(
                name="get_current_time",
                description="Get the current date and time",
                func=self._get_current_time
            ),
            Tool(
                name="fibonacci",
                description="Calculate the nth number in the Fibonacci sequence",
                func=self._fibonacci
            )
        ]
        self.tools = tools or []
        self.all_tools = self.base_tools + self.tools

    def _calculate(self, expression: str) -> str:
        try:
            allowed_names = {"abs": abs, "round": round}
            code = compile(expression, "<string>", "eval")
            for name in code.co_names:
                if name not in allowed_names:
                    raise NameError(f"Use of {name} not allowed")
            return str(eval(expression, {"__builtins__": {}}, allowed_names))
        except Exception as e:
            return f"Error in calculation: {str(e)}"

    def _get_current_time(self) -> str:
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def _fibonacci(self, n: int) -> str:
        try:
            n = int(n)
            if n < 0:
                return "Please provide a non-negative integer"
            if n <= 1:
                return str(n)
            a, b = 0, 1
            for _ in range(2, n + 1):
                a, b = b, a + b
            return str(b)
        except ValueError:
            return "Please provide a valid integer"

    def _should_use_tools(self, user_input: str) -> bool:
        # Keywords that suggest tool usage
        calculation_keywords = ["calculate", "compute", "sum", "multiply", "divide", "plus", "minus", "times"]
        time_keywords = ["time", "date", "current time", "what time", "what date"]
        fibonacci_keywords = ["fibonacci", "fib number", "fibonacci number", "fibonacci sequence"]
        
        user_input_lower = user_input.lower()
        
        # Check for explicit calculation patterns
        if any(keyword in user_input_lower for keyword in calculation_keywords):
            return True
        
        # Check for time-related queries
        if any(keyword in user_input_lower for keyword in time_keywords):
            return True
            
        # Check for Fibonacci queries
        if any(keyword in user_input_lower for keyword in fibonacci_keywords):
            return True
            
        # Check for mathematical expressions
        if any(c in user_input for c in "+-*/"):
            return True
            
        return False

    def _format_tools_for_prompt(self) -> str:
        tools_str = "Available tools:\n\n"
        for tool in self.all_tools:
            tools_str += f"- {tool.name}: {tool.description}\n"
        return tools_str

    def _extract_tool_calls(self, response: str) -> List[Dict[str, Any]]:
        tool_calls = []
        try:
            if "USE TOOL:" in response:
                parts = response.split("USE TOOL:", 1)[1].strip()
                if "\n" in parts:
                    tool_part = parts.split("\n")[0]
                else:
                    tool_part = parts
                
                tool_name, args = tool_part.split("(", 1)
                args = args.rstrip(")").strip()
                
                tool_calls.append({
                    "tool": tool_name.strip(),
                    "args": args
                })
        except Exception:
            pass
        return tool_calls

    def run(self, user_input: str) -> str:
        try:
            # Check if we should use tools based on the input
            if self._should_use_tools(user_input):
                # Construct the prompt with available tools
                prompt = f"""You are a helpful AI assistant with access to various tools.

{self._format_tools_for_prompt()}

When you need to use a tool, respond with:
USE TOOL: tool_name(arguments)

Then wait for the tool's response before continuing.

User: {user_input}
Assistant: Let me help you with that."""

                # Get initial response
                response = self.model.generate(prompt)
                
                # Check for tool usage
                tool_calls = self._extract_tool_calls(response)
                
                # If tools were called, execute them and get final response
                if tool_calls:
                    results = []
                    for tool_call in tool_calls:
                        tool_name = tool_call["tool"]
                        tool_args = tool_call["args"]
                        
                        # Find the tool
                        tool = next((t for t in self.all_tools if t.name == tool_name), None)
                        if tool:
                            result = tool.func(tool_args)
                            results.append(f"Tool {tool_name} returned: {result}")
                    
                    # Get final response with tool results
                    final_prompt = f"{prompt}\n\nTool Results:\n" + "\n".join(results)
                    response = self.model.generate(final_prompt)
                
                return response.strip()
            else:
                # For regular conversation, use a simpler prompt
                prompt = f"""You are a helpful AI assistant. Please provide a clear and helpful response.

User: {user_input}
Assistant:"""
                
                response = self.model.generate(prompt)
                return response.strip()

        except Exception as e:
            return f"Error: {str(e)}"

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Please provide input message"}))
        sys.exit(1)

    try:
        agent = CodeAgent()
        user_message = sys.argv[1]
        response = agent.run(user_message)
        print(json.dumps({"response": response}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
