"""
NeuroAI Plugin Loader
Automatically discovers and loads tool functions from /plugins/*.py files.
Each plugin file must define a TOOLS list and optionally HANDLERS dict.
"""
import os
import importlib.util
import sys

PLUGINS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "plugins")

def load_plugins():
    """Scans plugins/ directory and returns (tool_schemas, handler_map)."""
    all_tools = []
    all_handlers = {}
    
    if not os.path.exists(PLUGINS_DIR):
        os.makedirs(PLUGINS_DIR)
        return all_tools, all_handlers
    
    for filename in os.listdir(PLUGINS_DIR):
        if filename.endswith(".py") and not filename.startswith("_"):
            plugin_path = os.path.join(PLUGINS_DIR, filename)
            module_name = f"plugin_{filename[:-3]}"
            
            try:
                spec = importlib.util.spec_from_file_location(module_name, plugin_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                
                # Each plugin exposes TOOLS (list of tool schemas) and HANDLERS (dict)
                if hasattr(module, 'TOOLS'):
                    all_tools.extend(module.TOOLS)
                if hasattr(module, 'HANDLERS'):
                    all_handlers.update(module.HANDLERS)
                    
                print(f"[PluginLoader] Loaded plugin: {filename}")
            except Exception as e:
                print(f"[PluginLoader] Failed to load {filename}: {e}")
    
    return all_tools, all_handlers

# Load plugins at import time
PLUGIN_TOOLS, PLUGIN_HANDLERS = load_plugins()
