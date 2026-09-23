# Adding knowledge papers

Add a published paper by placing its PDF in `public/knowledge-papers/`, an optional cover image in `public/images/knowledge-papers/`, and one record in `content/knowledge-papers.json`.

Each record should use a stable, unique `id` and include `title`, `country`, `countryCode` (two-letter ISO code), `publishedAt` (`YYYY-MM-DD`), `pdfUrl`, and `published: true`. Optional fields are `region`, `description`, `year`, `coverImage`, `fileSize`, `tags`, and `featured`. Entries with `published: false`, unsafe PDF URLs, or missing required identity fields are not shown. Do not add a record until the corresponding real PDF is available.

Example shape (documentation only; this is not displayed):

```json
{
  "id": "stable-paper-slug",
  "title": "Verified paper title",
  "country": "Country name",
  "countryCode": "IN",
  "region": "South Asia",
  "description": "Short summary",
  "publishedAt": "2026-09-01",
  "year": 2026,
  "pdfUrl": "/knowledge-papers/verified-file.pdf",
  "coverImage": "/images/knowledge-papers/verified-cover.webp",
  "fileSize": "2.4 MB",
  "tags": ["Trade", "Investment"],
  "featured": false,
  "published": true
}
```
