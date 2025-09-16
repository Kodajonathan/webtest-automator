from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from langchain_core.tools import tool
from langgraph.graph import MessagesState
from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from typing_extensions import TypedDict, Literal
from langgraph.graph import StateGraph, START, END

# Prefer relative import when used as a package; fall back for direct runs in debuging
try:
    from ..utils.file_handler import create_script_file
except Exception:
    import sys
    from pathlib import Path
    project_root = Path(__file__).resolve().parents[2]
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    from app.utils.file_handler import create_script_file

# ---------------------------------------------------------
# Import browser tools
# ---------------------------------------------------------

from app.agent.browser_tools import (
    open_browser,
    close_browser,
    get_dom_elements,
    do_action,
)


# ---------------------------------------------------------
# State definition
# ---------------------------------------------------------
class State(TypedDict):
    topic: str


# ---------------------------------------------------------
# Tool: Write Python code into a file
# ---------------------------------------------------------
@tool
def generatePythonScript(code: str, fileName: str) -> bool:
    """Save a generated Python Playwright test script to disk."""
    try:
        create_script_file(code, fileName)
        setGeneratedCode(code)
        print(f"[INFO] Script {fileName} created successfully")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to create script: {e}")
        return False


tools = [
    generatePythonScript,
    open_browser,
    close_browser,
    get_dom_elements,
    do_action]
tools_by_name = {tool.name: tool for tool in tools}
generatedCode=""

def setGeneratedCode(code:str):
    print("in setGeneratedCode")
    global generatedCode
    generatedCode=code
    
def getGeneratedCode()->str:
    print("in getGeneratedCode")
    global generatedCode
    return generatedCode


# ---------------------------------------------------------
# LLM setup
# ---------------------------------------------------------
load_dotenv()

def create_groq_llm(model="openai/gpt-oss-120b", temperature=0.1):
    return ChatGroq(groq_api_key=os.environ.get("GROQ_API_KEY"),
        model_name=model,
        temperature=temperature,
        # max_tokens=1024,
        timeout=60,
        max_retries=2,
    )

llm = create_groq_llm()
llm_with_tools = llm.bind_tools(tools)


systemPrompt = (
    "You are an AI Test Automation Agent. "
    "Your role is to dynamically explore a website and generate reliable Playwright scripts. "
    "Follow these rules:\n\n"
    "1. Always start by opening the browser with `open_browser(url)`.\n"
    "2. Use `get_dom_elements` to explore available elements.\n"
    "3. Use `do_action` to perform steps (click, type, select, etc.).\n"
    "4. Use `close_browser` when done.\n"
    "5. After a successful run, call `generatePythonScript` to export the tested flow.\n"
    "6. Handle possible browser opening errors in the generated script i.e if one browser fails try to open others"
    "6. IMPORTANT: You must always use the generatePythonScript tool to save your code with a suitable filename.\n"
    "7. Never generate destructive code (e.g. deleting files, OS commands).\n"
    "8. Keep responses structured and concise.\n\n"
    "9. Never execute destructive commands (file deletion, system installs).\n"
    "10. Always explain what you are doing before calling a tool.\n"
    "11. If instructions are unclear, ask clarifying questions.\n" 
)

systemPromptTest=( "You are an AI browser Automation Agent. "
    "Your role is to dynamically navigate to website perform specified actions. "
    "Follow these rules:\n\n"
    "1. Always start by opening the browser with `open_browser(url)`.\n"
    "2. Use `get_dom_elements` to explore available elements.\n"
    "3. Use `do_action` to perform steps (click, type, select, etc.).\n"
    "4. Use `close_browser` when done.\n"
    "5. Always explain what you are doing before calling a tool.\n"
    )

# samplecode=(
#     """
# this is some sample code
            
# from playwright.sync_api import sync_playwright, Page, Browser, BrowserContext
# import time

# EDGE_PATH = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'


# def test_university_login_form():
    
#     Test the university login form using Microsoft Edge browser
#     This test covers the multi-step form process:
#     1. Personal information (name, date of birth)
#     2. Academic information (course selection, GPA)
#     3. Terms and conditions acceptance
    
    
#     with sync_playwright() as p:
#         # Launch Microsoft Edge (non-headless mode)
#         browser = p.chromium.launch(executable_path=EDGE_PATH, headless=False)

        
#         page = browser.new_page()

        
#         try:
#             # Navigate to the university login form
#             print("🚀 Navigating to university login form...")
#             page.goto("http://127.0.0.1:5501/index.html")
#             page.wait_for_load_state("networkidle")
            
#             # Step 1: Fill personal information
#             print("📋 Step 1: Filling personal information...")
            
#             # Fill name field
#             name_input = page.locator('input[type="text"]').first
#             name_input.click()
#             name_input.fill("Jason Banda")
#             time.sleep(0.5)
            
#             # Fill date of birth
#             dob_input = page.locator('input[type="date"]').first
#             dob_input.click()
#             dob_input.fill("2025-08-28")
#             time.sleep(0.5)
            
#             # Click Next button
#             next1_button = page.locator('#next-1')
#             next1_button.click()
#             time.sleep(1)
            
#             # Step 2: Fill academic information
#             print("🎓 Step 2: Filling academic information...")
            
#             # Select course from dropdown
#             course_select = page.locator('select').first
#             course_select.select_option("Computer Science")
#             time.sleep(0.5)
            
#             # Fill GPA
#             gpa_input = page.locator('input[type="number"]').first
#             gpa_input.click()
#             gpa_input.fill("3.5")
#             time.sleep(0.5)
            
#             # Click Next button
#             next2_button = page.locator('#next-2')
#             next2_button.click()
#             time.sleep(1)
            
#             # Step 3: Accept terms and conditions
#             print("✅ Step 3: Accepting terms and conditions...")
            
#             # Check the checkbox
#             checkbox = page.locator('input[type="checkbox"]').first
#             checkbox.click()
#             time.sleep(0.5)
            
#             # Click submit button (assuming it's the danger button)
#             submit_button = page.locator('.btn.btn-outline-danger').first
#             submit_button.click()
#             time.sleep(2)
            
#             # Verify form submission (you can add assertions here)
#             print("🎉 Form submission completed!")
            
#             # Take a screenshot for verification
#             page.screenshot(path="university_form_submission.png", full_page=True)
            
#             # Wait a bit before closing
#             time.sleep(3)
            
#         except Exception as e:
#             print(f"❌ Error occurred: {str(e)}")
#             page.screenshot(path="error_screenshot.png", full_page=True)
#             raise
            
#         finally:
#             # Clean up
#             browser.close()

# if __name__ == "__main__":
#     test_university_login_form()
            
#             """)


# ---------------------------------------------------------
# Graph Nodes
# ---------------------------------------------------------
def llm_call(state: MessagesState):
    """Ask the LLM what to do next (generate code, call a tool, or stop)."""
    return {
        "messages": [
            llm_with_tools.invoke(
                [SystemMessage(content=systemPrompt)] + state["messages"]
            )
        ]
    }


def tool_node(state: dict):
    """Execute any tool calls requested by the LLM."""
    results = []
    last_message = state["messages"][-1]

    for tool_call in last_message.tool_calls:
        try:
            tool = tools_by_name[tool_call["name"]]
            observation = tool.invoke(tool_call["args"])
            results.append(
                ToolMessage(content=observation, tool_call_id=tool_call["id"])
            )
        except Exception as e:
            results.append(
                ToolMessage(content=f"Error: {str(e)}", tool_call_id=tool_call["id"])
            )

    return {"messages": results}


def should_continue(state: MessagesState) -> Literal["environment", END]:
    """Decide whether to loop back or finish."""
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "environment"
    return END


# ---------------------------------------------------------
# Build Agent
# ---------------------------------------------------------
def build_agent():
    """Compile and return the generator agent."""
    agent_builder = StateGraph(MessagesState)
    agent_builder.add_node("llm_call", llm_call)
    agent_builder.add_node("environment", tool_node)
    agent_builder.add_edge(START, "llm_call")
    agent_builder.add_conditional_edges(
        "llm_call", should_continue, {"environment": "environment", END: END}
    )
    agent_builder.add_edge("environment", "llm_call")
    return agent_builder.compile()

def generate_code_script(prompt: str):
    """Public API: generate a Playwright script from a natural language prompt."""
    agent = build_agent()
    messages = [HumanMessage(content=prompt)]
    result = agent.invoke({"messages": messages})
    for m in result["messages"]:
        m.pretty_print()
    code=getGeneratedCode()
        
    return code


# ---------------------------------------------------------
# Debug usage
# ---------------------------------------------------------
# if __name__ == "__main__":
#     agent = build_agent()
#     display(Image(agent.get_graph(xray=True).draw_mermaid_png()))
#     resp = generate_code_script("Generate a test that logs into a website with username and password fields.")
#     for m in resp["messages"]:
#         m.pretty_print()
