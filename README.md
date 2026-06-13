# pi-chonk

A pi extension that shows context-window fill with a configurable Chonk Chart cat badge.

## Features

- Footer status showing current context usage.
- Six increasingly chonky cats mapped across the active model's context window.
- Optional token-count or percentage prefix.
- Optional chonk label text.
- Theme-aware coloring: muted prefix, success chonk states, and error coloring for the last two stages.
- Configurable labels, icons, and refresh interval.
- Interactive settings UI.
- Footer-agnostic integration through Pi extension status.

## Install

From npm, once published:

```bash
pi install npm:pi-chonk
```

Try without installing:

```bash
pi -e npm:pi-chonk
```

From GitHub:

```bash
pi install git:github.com/somus/pi-chonk
```

From a local checkout:

```bash
git clone https://github.com/somus/pi-chonk.git
pi install ./pi-chonk
```

After installing or updating, restart pi or run:

```text
/reload
```

## Usage

Open settings:

```text
/pi-chonk
```

Settings are changed through the `/pi-chonk` UI. Command arguments do not mutate settings.

## Settings

Configurable from `/pi-chonk`:

- Enabled on/off
- Prefix: `off`, `tokens`, or `percentage`
- Label on/off
- Refresh interval
- Six chonk labels
- Six chonk icons
- Reset defaults

Settings are stored at:

```text
~/.pi/agent/pi-chonk.json
```

Default config:

```json
{
  "enabled": true,
  "showLabel": true,
  "tokenDisplay": "tokens",
  "refreshIntervalMs": 2000,
  "labels": ["Lean", "Chonking", "Chonky", "Big Chonk", "Mega Chonk", "Oh lawd"],
  "icons": ["󡤀", "󡤁", "󡤂", "󡤃", "󡤄", "󡤅"]
}
```

`tokenDisplay` values:

- `off` — show only the cat and optional label
- `tokens` — show compact context token count, e.g. `138k`
- `percentage` — show context fill percentage, e.g. `51%`

## Chonk Chart font

Chonk icons use private-use glyphs from the bundled Chonk Chart font. `npm install` runs a postinstall script that installs `assets/chonk-chart.ttf`:

- macOS: `~/Library/Fonts/chonk-chart.ttf`
- Linux: `~/.local/share/fonts/chonk-chart.ttf`

Manual install:

```bash
npm run install-font
```

Restart your terminal or select a font fallback that includes Chonk Chart if glyphs still show as boxes.

## Custom footer integration

pi-chonk exposes footer text through Pi extension status:

```ts
ctx.ui.setStatus("pi-chonk", text);
```

Custom footer extensions can include it with:

```ts
footerData.getExtensionStatuses()
```

The status text may include safe SGR color sequences from Pi theme tokens. Custom footers should preserve those sequences if they want pi-chonk colors to appear.

## Package metadata

`package.json` declares this as a pi package:

```json
{
  "keywords": ["pi-package"],
  "pi": {
    "extensions": ["./src/index.ts"]
  }
}
```

## Development

Install dependencies:

```bash
npm install
```

Run checks:

```bash
npm run check
npm run typecheck
npm test
```

Package dry-run:

```bash
npm pack --dry-run
```

Releases use Release Please and npm trusted publishing. Merge Conventional Commits to `main`, then merge the Release Please PR to publish with provenance.
