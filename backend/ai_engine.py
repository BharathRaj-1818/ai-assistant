import os
import asyncio
import json
from groq import AsyncGroq
from agent_tools import search_web, read_local_file, write_local_file, schedule_event, execute_python_code

# Using the provided key as the default
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

# Initialize the async client
client = AsyncGroq(api_key=GROQ_API_KEY)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Searches the web using DuckDuckGo and returns a summary of results. Use this when asked about current events, facts, or information you don't know.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query."}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "read_local_file",
            "description": "Reads the content of a local file in the project. Use this when the user asks to read, summarize, or check a file.",
            "parameters": {
                "type": "object",
                "properties": {
                    "filepath": {"type": "string", "description": "The path to the file."}
                },
                "required": ["filepath"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "write_local_file",
            "description": "Writes code or content to a local file in the project. Use this when the user asks you to create a script, save code, or modify a file.",
            "parameters": {
                "type": "object",
                "properties": {
                    "filepath": {"type": "string", "description": "The path to the file to create or overwrite."},
                    "content": {"type": "string", "description": "The full text/code content to write to the file."}
                },
                "required": ["filepath", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "schedule_event",
            "description": "Schedules a calendar event for the user. Use this when the user asks to book a meeting, set an appointment, or add to their schedule.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "The title of the event."},
                    "date": {"type": "string", "description": "The date of the event in YYYY-MM-DD format."},
                    "time": {"type": "string", "description": "The time of the event in HH:MM format."}
                },
                "required": ["title", "date", "time"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "execute_python_code",
            "description": "Executes a Python code snippet and returns the real output. Use this when the user wants to run code, test logic, or calculate something.",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {"type": "string", "description": "The Python code to execute."}
                },
                "required": ["code"]
            }
        }
    }
]

def _route_to_agent(user_message: str) -> tuple[str, str]:
    """
    Detects the type of query and returns (agent_name, specialized_system_prompt).
    This is a lightweight classifier — no extra API call needed.
    """
    msg = user_message.lower()
    
    # Code Agent triggers
    code_keywords = ['write', 'code', 'script', 'function', 'debug', 'fix', 'program', 'python', 'javascript', 'implement', 'class', 'algorithm', 'syntax']
    if any(k in msg for k in code_keywords):
        return ("Code Agent", 
            "You are NeuroAI's Code Specialist. Write complete, working, production-ready code. "
            "Always use markdown code blocks with language specified. Explain your approach briefly before the code. "
            "If debugging, identify the root cause first.")
    
    # Research Agent triggers  
    research_keywords = ['research', 'search', 'find', 'news', 'what is', 'who is', 'explain', 'how does', 'why', 'when did', 'latest', 'current', 'today']
    if any(k in msg for k in research_keywords):
        return ("Research Agent",
            "You are NeuroAI's Research Specialist. Analyze and synthesize information clearly. "
            "Cite sources when available. Present findings in structured format with key insights highlighted. "
            "Be factual and precise.")

    # Task Agent triggers
    task_keywords = ['schedule', 'remind', 'task', 'todo', 'plan', 'meeting', 'appointment', 'organize', 'calendar', 'deadline']
    if any(k in msg for k in task_keywords):
        return ("Task Agent",
            "You are NeuroAI's Task & Productivity Specialist. Help manage tasks, schedules, and plans. "
            "Respond with clear structured lists or action plans. Be concise and action-oriented. "
            "Always confirm what action was taken.")
    
    # Default: General NeuroAI
    return ("NeuroAI Core",
        "You are NeuroAI, an advanced intelligent assistant operating system — like Tony Stark's Jarvis. "
        "Be helpful, precise, and concise. Do not use filler words. "
        "You were built by an elite AI engineer.")

async def generate_response_stream(chat_history: list, memory_context: str = "", user_profile: dict = None):
    """
    Generates a streaming response using Groq API with Tool Calling + Multi-Agent Routing.
    """
    # Get the latest user message for routing
    last_user_msg = next((m['content'] for m in reversed(chat_history) if m['role'] == 'user'), "")
    agent_name, system_prompt = _route_to_agent(last_user_msg)


    if user_profile:
        profile_str = ", ".join([f"{k}: {v}" for k, v in user_profile.items()])
        system_prompt += f"\n\nUSER PROFILE (use naturally in conversation): {profile_str}"

    if memory_context:
        system_prompt += f"\n\nCRITICAL CONTEXT - You must remember the following user notes/memories:\n{memory_context}\nIf the user asks a question relating to these notes, answer using this information."

    try:
        messages = [{"role": "system", "content": system_prompt}] + chat_history[-10:]
        
        # Create a completion request WITHOUT stream because Groq tools don't support stream=True
        response = await client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant",
            stream=False,
            temperature=0.7,
            max_tokens=2048,
            tools=TOOLS,
            tool_choice="auto"
        )

        message = response.choices[0].message
        
        if message.tool_calls:
            yield f"\n\n> ⚙️ **{agent_name} — Agent Mode**\n"
            
            # Format the assistant's tool call message safely
            tool_calls_formatted = []
            for tc in message.tool_calls:
                tool_calls_formatted.append({
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                })

            messages.append({
                "role": "assistant",
                "content": message.content,
                "tool_calls": tool_calls_formatted
            })
            
            for tc in message.tool_calls:
                func_name = tc.function.name
                try:
                    func_args = json.loads(tc.function.arguments)
                except:
                    func_args = {}
                    
                if func_name == "search_web":
                    query = func_args.get("query", "")
                    yield f"> 🔍 Searching web for: `{query}`\n"
                    func_response = search_web(query)
                elif func_name == "read_local_file":
                    filepath = func_args.get("filepath", "")
                    yield f"> 📄 Reading file: `{filepath}`\n"
                    func_response = read_local_file(filepath)
                elif func_name == "write_local_file":
                    filepath = func_args.get("filepath", "")
                    content = func_args.get("content", "")
                    yield f"> ✏️ Writing file: `{filepath}`\n"
                    func_response = write_local_file(filepath, content)
                elif func_name == "schedule_event":
                    title = func_args.get("title", "")
                    date = func_args.get("date", "")
                    time = func_args.get("time", "")
                    yield f"> 📅 Scheduling: `{title}` on `{date}` at `{time}`\n"
                    func_response = schedule_event(title, date, time)
                elif func_name == "execute_python_code":
                    code = func_args.get("code", "")
                    yield f"> ⚡ Executing Python code...\n"
                    func_response = execute_python_code(code)
                else:
                    func_response = "Unknown tool."
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "name": func_name,
                    "content": func_response
                })
            
            yield "> ✅ Data retrieved. Synthesizing...\n\n"
            
            # Second stream for final answer without tools
            second_stream = await client.chat.completions.create(
                messages=messages,
                model="llama-3.1-8b-instant",
                stream=True,
                temperature=0.7,
                max_tokens=2048
            )
            
            async for chunk in second_stream:
                delta = chunk.choices[0].delta
                if delta.content is not None:
                    yield delta.content
                    await asyncio.sleep(0.01)
        else:
            # Simulated streaming for fast UX when no tool is called
            content = message.content or ""
            words = content.split(" ")
            for i, word in enumerate(words):
                yield word + (" " if i < len(words) - 1 else "")
                await asyncio.sleep(0.01)

    except Exception as e:
        # Fallback mechanism
        fallback_text = f"**NeuroAI Error**\n\nI encountered an issue communicating with the Groq AI Core: `{str(e)}`."
        words = fallback_text.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            await asyncio.sleep(0.05)