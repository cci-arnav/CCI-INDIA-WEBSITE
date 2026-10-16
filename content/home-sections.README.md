# Homepage media and member statements

## Life at CCI

The homepage reads video entries from `gallery.json` and selects entries with a `youtubeId`. Keep the stable `id` and approved public title with each video. The `youtubeId` is embedded in the privacy-enhanced YouTube player only after a visitor selects a video; it does not autoplay. Existing gallery entries with local `url` sources remain available to the Gallery page and are not copied into another media registry.

To add or replace a Life at CCI video, edit `gallery.json` → `videos.items` with an approved title, a unique stable `id`, and the correct `youtubeId`. The homepage currently displays the title; captions, dates, and local MP4 records are not displayed in this section.

## What Our Members Say

Member statements are configured in `member-voices.json` → `items`. Add an entry only after CCI has approved it for public publication. Required fields are `id`, `title`, `statement`, `approved: true`, and `published: true`. Optional fields are `excerpt`, `memberName`, `designation`, `organization`, `portrait`, `publicationDate` (ISO date), and `attachmentUrl` (a publicly approved source document). Entries without both approval flags are not displayed. Do not put private contact details or non-public attachments in this file.

There is no member statement upload flow in the existing news admin. Authorized staff can add approved content through the project's reviewed content change process; this does not change news administration or require public accounts.
