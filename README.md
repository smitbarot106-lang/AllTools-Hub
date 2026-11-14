# AllTools Hub

Free online tools that run in the visitor's browser. Nothing a visitor types is sent to a server.
Live site: https://alltools-hub.pages.dev

## What is in this project (all files sit in one folder, no sub-folders)

| File | What it is |
|---|---|
| `index.html` | Homepage (generated) |
| `<tool-name>.html` | One page per tool, for example `word-counter.html` (generated). Cloudflare Pages shows it as `/word-counter` |
| `about.html`, `contact.html`, `privacy.html`, `terms.html`, `disclaimer.html` | Information pages (generated) |
| `style.css` | The whole design: colours, fonts, layout, dark mode |
| `tools.js` | **Every tool lives here**: its text, its form fields and its logic |
| `tool.js` | Builds the form on each tool page and runs the Copy, Download and Reset buttons |
| `home.js` | Homepage search |
| `site.js` | Light / dark mode |
| `build.js` | Creates all the HTML pages, sitemap and robots.txt from `tools.js` |
| `test.js` | Automatic tests for every tool |
| `_headers` | Security settings used by Cloudflare Pages |

Cloudflare Pages needs no build step. Leave the build command empty and the output folder as the root.

## How to add a new tool

1. Open `tools.js` and copy an existing tool as a starting point.
2. Change its `id`, `name`, `desc`, `intro`, `steps`, `fields` and `run` function.
3. Add tests for it in `test.js`.
4. Run `node test.js`, then `node build.js`. This creates the new page, the homepage card, search results and the sitemap entry.
5. Upload the changed files.

## Tool status

Completed and tested (19): Word Counter, Case Converter, Remove Duplicate Lines, Text to Slug, GST Calculator, Percentage Calculator, Discount Calculator, BMI Calculator, Age Calculator, EMI Calculator, Password Generator, JSON Formatter and Validator, Base64 Encoder and Decoder, URL Encoder and Decoder, UUID Generator, Length Converter, Weight Converter, Temperature Converter, Random Number Generator.

Not started: Image tools, PDF tools, and the rest of the planned list.

Contact details use the GitHub issues page until a public email address is chosen.
