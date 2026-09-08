import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        page.set_default_timeout(15000)

        await page.goto("http://localhost:3000/custom-neon")

        # Click on Size tab
        await page.locator("button.ns-champ-tab").nth(1).click()

        # Select XL
        await page.locator(".ns-option-list button").filter(has_text="Extra Large").click()

        # Click on Text tab
        await page.locator("button.ns-champ-tab").nth(0).click()

        # Fill in 'The Neon Stack' text
        await page.locator("textarea").fill("The Neon Stack")

        # Click Backboard tab
        await page.locator("button.ns-champ-tab").nth(4).click()

        # Ensure Cut to Shape is selected
        await page.locator(".ns-option-list button").filter(has_text="Cut to Shape").click()

        # Wait a moment for rendering
        await asyncio.sleep(2)

        await page.screenshot(path="/home/jules/verification/configurator_preview4.png")
        await browser.close()

asyncio.run(main())
