import os
from duckduckgo_search import DDGS

def search_web(query: str, max_results: int = 3) -> str:
    """Searches the web using DuckDuckGo and returns a summary of results."""
    try:
        results = DDGS().text(query, max_results=max_results)
        if not results:
            return f"No results found for '{query}'."
        
        output = f"Search Results for '{query}':\n\n"
        for i, res in enumerate(results):
            output += f"{i+1}. {res['title']}\n"
            output += f"Link: {res['href']}\n"
            output += f"Snippet: {res['body']}\n\n"
        
        return output
    except Exception as e:
        return f"Error performing web search: {str(e)}"

def read_local_file(filepath: str) -> str:
    """Reads the content of a local file. Limited to the project workspace for safety."""
    # Safety Check: Restrict to current working directory (backend) or frontend
    abs_path = os.path.abspath(filepath)
    project_root = os.path.abspath(os.path.join(os.getcwd(), ".."))
    
    if not abs_path.startswith(project_root):
        return f"Error: Access denied. Cannot read files outside the project directory ({project_root})."
    
    if not os.path.exists(abs_path):
        return f"Error: File '{filepath}' does not exist."
        
    try:
        with open(abs_path, "r", encoding="utf-8") as f:
            content = f.read()
            # Limit returned content to avoid overwhelming the LLM
            if len(content) > 4000:
                content = content[:4000] + "\n\n...[Content truncated for length]..."
            return content
    except Exception as e:
        return f"Error reading file '{filepath}': {str(e)}"

def write_local_file(filepath: str, content: str) -> str:
    """Writes content to a local file. Limited to the project workspace for safety."""
    abs_path = os.path.abspath(filepath)
    project_root = os.path.abspath(os.path.join(os.getcwd(), ".."))
    
    if not abs_path.startswith(project_root):
        return f"Error: Access denied. Cannot write files outside the project directory ({project_root})."
        
    try:
        # Create directories if they don't exist
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
        return f"Successfully wrote to file '{filepath}'."
    except Exception as e:
        return f"Error writing file '{filepath}': {str(e)}"

def execute_python_code(code: str) -> str:
    """Executes a Python code snippet in a safe subprocess and returns the output."""
    import subprocess
    import sys
    try:
        result = subprocess.run(
            [sys.executable, "-c", code],
            capture_output=True,
            text=True,
            timeout=10  # Hard timeout: 10 seconds
        )
        output = ""
        if result.stdout:
            output += f"**Output:**\n```\n{result.stdout.strip()}\n```"
        if result.stderr:
            output += f"\n**Stderr:**\n```\n{result.stderr.strip()}\n```"
        if not output:
            output = "Code executed successfully with no output."
        return output
    except subprocess.TimeoutExpired:
        return "Error: Code execution timed out (10s limit)."
    except Exception as e:
        return f"Error executing code: {str(e)}"

def schedule_event(title: str, date: str, time: str) -> str:
    """Schedules an event on the user's dashboard Calendar."""
    try:
        from database.database import SessionLocal
        from database import crud
        with SessionLocal() as db:
            crud.add_calendar_event(db, title=title, date=date, time=time)
        return f"Successfully scheduled '{title}' on {date} at {time}."
    except Exception as e:
        return f"Error scheduling event: {str(e)}"

# Example Usage:
if __name__ == "__main__":
    print(search_web("Python 3.12 release date"))
    print(read_local_file("main.py"))
