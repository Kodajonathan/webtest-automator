"""
browser_tools.py

Atomic tools for browser interaction.  
These are called by the agent to dynamically interact with a website 
before generating a final Playwright script.
"""

from typing import List, Dict, Any, Optional
from langchain_core.tools import tool
from playwright.sync_api import sync_playwright, Page, Browser, BrowserContext
from bs4 import BeautifulSoup,Tag

# Store session state globally (later you can wrap this in a class for safety)
_playwright = None
_browser = None
_page = None

@tool
def open_browser(url: str, headless: bool = False) -> str:
    """
    Launches a browser instance and navigates to the given URL.
    """
    EDGE_PATH = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    try:
        global _playwright, _browser, _page
        if _browser and not _browser.is_closed():
            return 'Browser is already open.'

        _playwright = sync_playwright().start()
        _browser = _playwright.chromium.launch(
            executable_path=EDGE_PATH, 
            headless=False,
            timeout=30000  # 30 second timeout
        )
        context = _browser.new_context(
            viewport={'width': 1280, 'height': 720}
        )
        _page = context.new_page()
        _page.goto(url, timeout=30000)
        _page.wait_for_load_state("networkidle", timeout=30000)
        return f'Browser opened successfully and navigated to {url}'
    except Exception as e:
        print(f"An error occurred while trying to open browser: {e}")
        return f"error: {e}"


@tool
def close_browser() -> str:
    """
    Closes the current browser session if one is running.

    Returns:
        str: Result of tool execution.
    """
    """Close the current browser session."""
    global _browser, _playwright, _page

    try:
        if _browser:
            _browser.close()
            _browser = None
        if _playwright:
            _playwright.stop()
            _playwright = None
        _page = None
        return "Page closed successfully"
    except Exception as e:
        print(f"❌ Error closing browser: {e}")
        return f"error: {e}"

@tool
def get_dom_elements(selector: Optional[str] = None) -> str:
    """
    Retrieves DOM elements with faster button detection.
    """
    try:
        global _page
        if not _page or _page.is_closed():
            return "error: Browser session is not active"

        # Get elements directly from page (faster than BeautifulSoup for live elements)
        if not selector:
            # Focus on interactive elements, prioritize buttons
            elements = _page.query_selector_all("button, input[type='submit'], input[type='button'], [role='button'], input[type='text'], input[type='password'], select, textarea, a[href]")
        else:
            elements = _page.query_selector_all(selector)

        if not elements:
            return f"No elements found for selector: {selector or 'interactive elements'}"

        # Format as string for LangChain compatibility
        elements_info = []
        for i, el in enumerate(elements[:8]):  # Limit to first 8 elements
            try:
                tag = el.evaluate("el => el.tagName.toLowerCase()")
                element_desc = f"Element {i+1}: {tag}"
                
                # Get attributes quickly
                attrs = el.evaluate("""el => {
                    return {
                        id: el.id || null,
                        name: el.name || null,
                        type: el.type || null,
                        className: el.className || null,
                        text: el.innerText.substring(0, 30) || null
                    }
                }""")
                
                if attrs['id']:
                    element_desc += f" id='{attrs['id']}'"
                if attrs['name']:
                    element_desc += f" name='{attrs['name']}'"
                if attrs['type']:
                    element_desc += f" type='{attrs['type']}'"
                if attrs['text']:
                    element_desc += f" text='{attrs['text']}'"
                
                # Simple CSS selector
                if attrs['id']:
                    element_desc += f" css='#{attrs['id']}'"
                elif attrs['name']:
                    element_desc += f" css='{tag}[name=\"{attrs['name']}\"]'"
                else:
                    element_desc += f" css='{tag}'"
                    
                elements_info.append(element_desc)
            except:
                # Skip elements that can't be evaluated
                continue

        return f"Found {len(elements_info)} elements:\n" + "\n".join(elements_info)

    except Exception as e:
        return f"error: {str(e)}"



@tool
def do_action(selector: str, action: str, value: str="") -> str:
    """
    Perform an action on a DOM element with optimized button handling.

    Args:
        selector (str): CSS selector for the target element (no XPath).
        action (str): Type of action ('click', 'type', 'hover', 'select', etc.).
        value (str, optional): Text to input if action is 'type' or similar.

    Returns:
        str: Result of function call.
    """
    try: 
        global _page
        if not _page or _page.is_closed():
            return "error: Browser session is not active"

        # Convert XPath to CSS if needed
        if selector.startswith("//"):
            if selector.startswith("//input[@name='"):
                name = selector.split("'")[1]
                selector = f"input[name='{name}']"
            elif selector.startswith("//button"):
                selector = "button"
            else:
                return f"error: XPath not supported, use CSS selector instead: {selector}"

        # For button clicks, try multiple selectors quickly
        if action == "click":
            button_selectors = [
                selector,  # Original selector
                f"button:has-text('{value}')" if value else None,  # Button with text
                f"input[type='submit']:has-text('{value}')" if value else None,  # Submit input with text
                f"[role='button']:has-text('{value}')" if value else None,  # Role button with text
                "button[type='submit']",  # Any submit button
                "input[type='submit']",   # Any submit input
                "button",  # Any button
            ]
            
            # Try each selector with short timeout
            for test_selector in button_selectors:
                if not test_selector:
                    continue
                try:
                    if _page.is_visible(test_selector, timeout=1000):
                        _page.click(test_selector, timeout=2000)
                        return f"success: Clicked button using selector '{test_selector}'"
                except:
                    continue
            
            # If no button found, list available clickable elements
            clickable = _page.query_selector_all("button, input[type='submit'], input[type='button'], [role='button'], a")
            if clickable:
                button_info = []
                for i, el in enumerate(clickable[:3]):
                    text = el.inner_text()[:30] if el.inner_text() else "no-text"
                    tag = el.evaluate("el => el.tagName.toLowerCase()")
                    button_info.append(f"{tag}:'{text}'")
                return f"error: No clickable element found for '{selector}'. Available: {', '.join(button_info)}"
            else:
                return f"error: No clickable elements found on page"

        # For non-click actions, use original logic with shorter timeout
        try:
            _page.wait_for_selector(selector, timeout=2000, state="attached")
        except:
            return f"error: Element '{selector}' not found within 2 seconds"

        if action == "type":
            _page.fill(selector, value)
        elif action == "hover":
            _page.hover(selector)
        elif action == "select":
            _page.select_option(selector, value)
        else:
            return f"error: Action '{action}' not supported. Use: click, type, hover, select"
        
        return f"success: Action '{action}' executed on '{selector}'"
        
    except Exception as e:
        print(f"error occurred while trying to perform action: {e}")
        return f"error: {str(e)}"




@tool
def get_page_url() -> str:
    """
    Get the current page URL.

    Returns:
        str: Current URL.
    """
    ...

@tool
def get_page_title() -> str:
    """
    Get the current page title.

    Returns:
        str: Page title.
    """
    ...

@tool
def take_screenshot(filename: str = "screenshot.png") -> bool:
    """
    Captures a screenshot of the current page.

    Args:
        filename (str): Path to save screenshot.

    Returns:
        bool: True if successful, False otherwise.
    """
    ...

    # Helper functions
def generate_css_selector(element):
    """Generate a simple CSS selector for an element"""
    if element.get('id'):
        return f"#{element.get('id')}"
    elif element.get('name'):
        return f"{element.name}[name='{element.get('name')}']"
    elif element.get('class'):
        classes = ' '.join(element.get('class'))
        return f"{element.name}.{classes.replace(' ', '.')}"
    else:
        return element.name