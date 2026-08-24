---
title: library-sale-watch
shortTitle: tools — library-sale-watch
description: Checks the library’s page for sale dates and drops any new one into the letter draft.
log: library-sale-watch
tags: [tools]
---

Fetches the library’s sale page once an hour, hashes it, and compares with the last hash in `.state/`. If the page changed, the new text goes into the [letter](../letter) draft. 61 lines. Exists because I missed one, once.

Every run below is a line this script wrote.
