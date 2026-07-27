# Deep SEO V2 Changes

Updated: 27 July 2026

## Additional implementation

- Added category-specific supporting content to thin canonical tool pages.
- Added direct workflow, accuracy, submission and limitation guidance.
- Added `date-modified` metadata across all HTML pages.
- Added `dateModified` to WebPage and BlogPosting structured data.
- Added a WebPage entity connected to each canonical WebApplication entity.
- Extracted large inline CSS into 42 cacheable `page.css` files.
- Extracted large inline JavaScript into 47 cacheable `page.js` files.
- Normalized favicon references and restored missing favicon assets.
- Revalidated internal links, local assets, metadata, canonicals, headings, JSON-LD and sitemap.
- Browser-tested the Age Calculator after asset extraction.

## Validation result

- 85 HTML pages
- Unique titles, descriptions and canonicals
- One H1 per page
- Valid JSON-LD
- Valid sitemap XML
- Zero broken internal links
- Zero missing local CSS, JavaScript or image references
- Age Calculator interaction test passed without JavaScript errors

## Deployment note

Replace the previous repository build with this version and preserve `_redirects`, `_headers`, `robots.txt`, `sitemap.xml`, `llms.txt`, clean URL folders and all generated `page.css` / `page.js` files.

## Remaining performance migration

Several legacy templates still load Tailwind through the CDN. The site works with this setup, but a future build should compile Tailwind locally from the complete class inventory before removing the CDN script. Removing it without a compiled replacement will break page layouts.
