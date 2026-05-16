# LINKr

LINKr is a static browser-based prompting companion for GitHub Pages.

It helps you create polished prompts that you can copy and paste into AI tools such as ChatGPT, Midjourney, Canva, Firefly, Ideogram, Leonardo, Runway or another AI tool.

## What is included

- `index.html` - the app structure
- `style.css` - the visual design
- `script.js` - the app behaviour
- `README.md` - these instructions

There is no backend, login, database, API key or paid service. Everything runs in your browser.

## How to open it on your computer

1. Open the project folder.
2. Double-click `index.html`.
3. The app should open in your browser.

That is enough because LINKr is a static app. A static app is a website made from normal files that do not need a server to run.

## How saving works

LINKr saves recipes, prompt history, brand kits and settings in `localStorage`.

`localStorage` is a small storage area inside your browser. It is useful for simple apps, but it is not the same as an online account. If you clear your browser data, your saved LINKr data may be removed.

Use **Export JSON** to make a backup. Use **Import JSON** to restore a backup.

## How to publish on GitHub Pages

1. Create a GitHub repository.
2. Upload these four files to the repository root:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`
3. In GitHub, open the repository settings.
4. Go to **Pages**.
5. Choose the main branch as the source.
6. Save.

GitHub will give you a public website link after a short wait.

## Using LINKr

- Use **Create Prompt** to build a polished prompt.
- Use **Prompt Rescue** when an AI output went wrong and you want to correct only the problem.
- Use **Style Library** to quickly choose a visual style.
- Use **Saved Recipes** to reuse prompt setups.
- Use **Brand Kits** to save brand colours, tone, audience and visual rules.
- Use **Prompt History** to copy or reuse recent prompts.

When you press **Copy Prompt**, LINKr copies the prompt to your clipboard and shows:

`Copied. Paste into your AI tool.`

## Privacy note

LINKr does not send prompts anywhere by itself. Your saved data stays in the browser you are using.
