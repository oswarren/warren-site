# Routine: warren-site: balance columns from Todoist

The prompt of the nightly cloud routine that keeps the two columns on the home page true. This file is the
readable copy; the live one is `trig_01RU4a6NebP2WWLNvkQWqW8E`, at
https://claude.ai/code/routines/trig_01RU4a6NebP2WWLNvkQWqW8E (created 2026-09-14). To change it: edit here, then
`RemoteTrigger update` with the text below as `job_config.ccr.events[0].data.message.content`. Debug with
`RemoteTrigger list_runs` and `get_run_log`.

- Schedule: `0 7 * * *` UTC, 3am EDT (2am EST).
- Sources: `oswarren/warren-site`. Connector: Todoist.
- Todoist project "Balance", id `6hW845xr52qH7JV3`. Section "Runs without me" is the automatic column;
  anything else, "Still my hands" or no section, is the by-hand column.

## Prompt

You keep the two columns on warrenstetler.com true to Warren's Todoist project "Balance" (id 6hW845xr52qH7JV3). The warren-site repo is checked out in your working directory: find it with `find . -maxdepth 3 -name balance.json` and cd into that folder. Do every step in order. Change nothing except what the steps say.

1. Load the Todoist tools with ToolSearch if they are deferred.
2. find-sections with projectId 6hW845xr52qH7JV3. Keep each section's id and name.
3. find-completed-tasks with projectId 6hW845xr52qH7JV3, since = three days before today and until = today (today is `TZ=America/New_York date +%Y-%m-%d`), limit 200, following the cursor until there are no more. Keep each task's id, content, description, sectionId (null if absent), and completedAt, exactly as returned.
4. If step 3 found any, reopen them all with one uncomplete-tasks call. If some fail, carry on; the script handles it.
5. find-tasks with projectId 6hW845xr52qH7JV3, limit 100, following the cursor until there are no more. Keep each task's id, content, description, and sectionId (null if absent), exactly as returned.
6. Write `/tmp/balance-snapshot.json`: `{"sections": [...step 2], "tasks": [...step 5], "completed": [...step 3]}`. Copy every text byte for byte. Never reword, shorten, or tidy anything Warren typed.
7. Run `python3 tools/balance.py /tmp/balance-snapshot.json`. If it exits non-zero or prints "refused", stop here and make that output your final message. Do not commit.
8. If it printed "unchanged", stop with the final message "balance: unchanged".
9. If it printed "changed", publish:

```
git config user.name site-log
git config user.email site-log@users.noreply.github.com
git add balance.json
git commit -q -m "balance: from Todoist"
git pull -q --rebase
git push -q
```

   If the push is rejected, run `git pull -q --rebase` and `git push -q` once more. Final message: "balance: changed" plus the output of `git diff HEAD~1 --stat`.

Rules: edit only balance.json. In Todoist, the only write allowed is step 4's uncomplete-tasks on tasks step 3 found in this project; never add, edit, move, complete, or delete a task. Never ask a question; nobody reads the final message until something is wrong.
