# Static Knowledge Paper Previews

The Knowledge Papers reader serves published preview PDFs as ordinary static public assets. It does not call a preview API, read from private storage, or generate PDFs at request time. The browser loads each PDF from `/knowledge-papers/<paper-id>.pdf`; PDF.js renders the already prepared PDF in the reader.

## Current static preview set

The 125 canonical preview PDFs were copied from the already generated and validated files under the ignored `private-knowledge-papers/previews/` directory. Each contains no more than 10 pages. Only these previews—not the original full PDFs—belong in `public/knowledge-papers/`.

The following three catalogue records remain without a preview because each has two alternate editions and the correct edition has not been selected:

- `india-kenya-strengthening-ties-2026`
- `india-iraq-shared-prosperity-2026`
- `india-tunisia-shared-future-2026`

Their cards and routes remain available. The reader displays an unavailable-preview message and retains the Request Full Knowledge Paper form link.

## Registry and verification

`src/data/knowledgePaperPreviewRegistry.json` maps catalogue IDs to public asset URLs and records both original source page count and prepared preview page count. The reader uses only entries in this registry.

To re-copy and validate the canonical static assets from the existing private generated previews, run:

```powershell
node scripts\publish-static-knowledge-paper-previews.mjs
```

This script does not extract archives or generate PDFs. It verifies each existing preview's checksum, PDF signature, structure, and page limit before copying it, and deliberately excludes all six unresolved alternate-edition previews.

The test suite verifies all registry entries and PDF page counts:

```powershell
node --test tests\knowledge-paper-static-previews.test.mjs
```

Production builds include files in `public/knowledge-papers/` as static assets. No Supabase bucket, SQL migration, private registry mapping, or server environment variable is required for this reader path.
