# Adding knowledge papers

Add a published paper by creating one catalogue record in `content/knowledge-papers.json`. Optional public cover artwork may be placed in `public/images/knowledge-papers/`.

Knowledge papers use controlled access. Never add a PDF, Drive URL, storage URL, or provider file ID to the public repository or catalogue. Visitors submit an enquiry, stored in Supabase, and CCI India shares approved papers outside the public website.

Each record should use a stable, unique `id` and include `title`, `country`, `countryCode` (two-letter ISO code), `collection`, `publishedAt` (`YYYY-MM-DD`), `accessMode: "request"`, and `published: true`. Optional fields are `subject`, `region`, `description`, `year`, `coverImage`, `fileSize`, `tags`, and `featured`.

Example shape (documentation only; this is not displayed):

```json
{
  "id": "stable-paper-slug",
  "title": "Verified paper title",
  "country": "Country name",
  "countryCode": "IN",
  "region": "South Asia",
  "collection": "International & Sectoral",
  "description": "Short summary",
  "publishedAt": "2026-09-01",
  "year": 2026,
  "coverImage": "/images/knowledge-papers/verified-cover.webp",
  "fileSize": "2.4 MB",
  "tags": ["Trade", "Investment"],
  "featured": false,
  "accessMode": "request",
  "published": true
}
```
