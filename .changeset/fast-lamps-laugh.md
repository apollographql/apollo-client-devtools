---
"apollo-client-devtools": minor
---

Change the devtools behavior to always create a panel regardless of whether an Apollo Client instance can be found. This ensures the panel can at least be reached even if the inter-extension communiation is flaky, or our client detection mechanism is buggy. This should help alleviate the large number of reports that the devtools is simply broken.

To provide more helpful feedback during usage, status messages are now displayed to show that the devtools is acively trying to locate the client. When a client instance is not found, a helpful dialog is now shown with troubleshooting steps to try and help resolve the issue.
