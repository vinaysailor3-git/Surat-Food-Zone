# Code Zone — Client Website Subscription Manager

Open index.html in a modern browser. No installation, server, or internet connection is needed. Keep the vendor folder beside the three app files.

Add a client, enter subscription information, and save. Fixed durations automatically clamp to the last valid day of the target month (31 January → 28/29 February). Custom durations allow manual expiry. Expiry is inclusive: a record expires after its expiry date. Upcoming renewals include today through 30 days ahead. Active totals include expiring-soon records. Revenue is the sum of Paid records, not a historical payment ledger. Future-start records follow the requested expiry-based status model.

Click a client to view, edit, copy links/details, download their PDF, or delete with confirmation. The form's Download PDF button also works before saving. PDF files always use one A4 page. A compact layout wraps long content and automatically reduces text size to fit all fields. Very long notes may produce small text.

Data stays in this browser's localStorage. Use Backup regularly. Restore validates an exported JSON backup and asks before replacing records. Browser profiles, private browsing, clearing site data, and moving the app may affect access to saved records. Keep the app in a stable folder and use backups when transferring it.

Libraries: bundled jsPDF 3.0.4 (MIT; license in its source header) and Noto Sans Regular (SIL Open Font License, see vendor/OFL.txt). Noto Sans supports INR and Latin-script text; complex scripts may require a different font and text-shaping support.
