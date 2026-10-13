# Machine Corps Exec Hangar

Live PYAM-EXHANG-0-1 Executive Hangar lights for Star Citizen (Pyro): a replica of the five access lights, countdowns to the next light change and opening, the next openings in your local time, and alerts.

- **Website:** the GitHub Pages address of this repo
- **Discord:** runs inside Discord as an Activity (see below)
- **Windows app:** Machine Corps Exec Hangar on the Microsoft Store

## How the timing works

The hangar runs one 185-minute cycle on every server (60 min open, 5 min lethal reset, 120 min charging, plus 350 ms drift per cycle). `feed.json` holds the current anchor. A scheduled workflow (`.github/workflows/update-feed.yml`) refreshes it every 3 hours from the community timer at exec.xyxyll.com (MIT License), so re-anchors after game patches reach everyone automatically. Run the workflow by hand from the Actions tab after a patch if you want the update immediately.

## Discord Activity setup

1. Discord Developer Portal → your application → **Activities → Settings**: turn on Activities.
2. **Activities → URL Mappings**: map the root `/` to this site's host and path, without `https://` (for example `yourname.github.io/exec-hangar`).
3. **Installation**: install the app to your server, then launch it from the Activities (rocket) button in a channel.

Unverified apps can launch Activities only for the developer team and invited App Testers, and only in servers with fewer than 25 members. App verification in the Developer Portal removes that limit.

## Files

- `index.html`: the whole app in one file (fonts and Discord's Embedded App SDK included)
- `feed.json`: current cycle anchor, written by the workflow
- `scripts/update-feed.mjs`: the feed updater

Unofficial fan tool by saz-zas for Machine Corps. Not affiliated with or endorsed by Cloud Imperium Games. Star Citizen® is a registered trademark of Cloud Imperium Rights LLC.
