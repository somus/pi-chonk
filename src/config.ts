import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const STATUS_ID = "pi-chonk";
export const CONFIG_PATH = join(process.env.HOME ?? "", ".pi/agent/pi-chonk.json");

export type TokenDisplay = "off" | "tokens" | "percentage";

export type Config = {
	enabled: boolean;
	showLabel: boolean;
	tokenDisplay: TokenDisplay;
	refreshIntervalMs: number;
	labels: [string, string, string, string, string, string];
	icons: [string, string, string, string, string, string];
};

export const DEFAULT_CONFIG: Config = {
	enabled: true,
	showLabel: true,
	tokenDisplay: "tokens",
	refreshIntervalMs: 2000,
	labels: ["Lean", "Chonking", "Chonky", "Big Chonk", "Mega Chonk", "Oh lawd"],
	icons: ["󡤀", "󡤁", "󡤂", "󡤃", "󡤄", "󡤅"],
};

function normalizeConfig(value: unknown): Config {
	const parsed = value && typeof value === "object" && !Array.isArray(value) ? (value as Partial<Config>) : {};
	return {
		...DEFAULT_CONFIG,
		...parsed,
		tokenDisplay:
			parsed.tokenDisplay === "off" || parsed.tokenDisplay === "tokens" || parsed.tokenDisplay === "percentage"
				? parsed.tokenDisplay
				: DEFAULT_CONFIG.tokenDisplay,
		labels: Array.isArray(parsed.labels) && parsed.labels.length === 6 ? (parsed.labels as Config["labels"]) : DEFAULT_CONFIG.labels,
		icons: Array.isArray(parsed.icons) && parsed.icons.length === 6 ? (parsed.icons as Config["icons"]) : DEFAULT_CONFIG.icons,
	};
}

export function loadConfig(): Config {
	try {
		if (!existsSync(CONFIG_PATH)) return { ...DEFAULT_CONFIG };
		return normalizeConfig(JSON.parse(readFileSync(CONFIG_PATH, "utf8")));
	} catch {
		return { ...DEFAULT_CONFIG };
	}
}

export function saveConfig(config: Config): void {
	writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);
}
