import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from groq import AsyncGroq

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = AsyncGroq(api_key=GROQ_API_KEY)

class BaseAgent:
    """Base class for all NeuroAI specialist agents."""
    
    name = "Base Agent"
    system_prompt = "You are a helpful AI assistant."
    
    async def run(self, query: str, context: str = "") -> str:
        messages = [{"role": "system", "content": self.system_prompt}]
        if context:
            messages.append({"role": "user", "content": f"Context:\n{context}"})
        messages.append({"role": "user", "content": query})
        
        response = await client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant",
            temperature=0.5,
            max_tokens=2048
        )
        return response.choices[0].message.content or ""
