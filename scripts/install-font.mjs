#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = join(__dirname, "..", "assets", "chonk-chart.ttf");

function log(message) {
	console.log(`[pi-chonk] ${message}`);
}

function installFont() {
	if (!existsSync(source)) {
		log(`Chonk Chart font missing: ${source}`);
		return;
	}

	const os = platform();
	let targetDir;

	if (os === "darwin") {
		targetDir = join(homedir(), "Library", "Fonts");
	} else if (os === "linux") {
		targetDir = join(homedir(), ".local", "share", "fonts");
	} else {
		log(`Skipping font install on unsupported platform: ${os}`);
		return;
	}

	mkdirSync(targetDir, { recursive: true });
	const target = join(targetDir, "chonk-chart.ttf");
	copyFileSync(source, target);
	log(`Installed Chonk Chart font to ${target}`);

	if (os === "linux") {
		const result = spawnSync("fc-cache", ["-f", targetDir], { stdio: "ignore" });
		if (result.status === 0) log("Refreshed font cache");
		else log("fontconfig fc-cache not available; restart terminal if font is not visible");
	}

	if (os === "darwin") {
		log("Restart terminal or select a Chonk Chart-capable fallback font if glyphs still show as boxes");
	}
}

try {
	installFont();
} catch (error) {
	log(`Font install failed: ${error instanceof Error ? error.message : String(error)}`);
	process.exitCode = 0;
}
