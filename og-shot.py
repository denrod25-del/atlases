from playwright.sync_api import sync_playwright
import pathlib

src = pathlib.Path(__file__).parent / "og-source.html"
out = pathlib.Path(__file__).parent / "public" / "og.png"

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1200, "height": 630})
    page.goto(src.as_uri())
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(800)  # let webfonts settle
    page.screenshot(path=str(out))
    b.close()
print("wrote", out)
