import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { type Config, DEFAULT_CONFIG } from "./config";

const CUSTOM_OPTION = "Custom...";

async function promptNumber(ctx: ExtensionContext, title: string, current: number): Promise<number | undefined> {
	const value = await ctx.ui.input(title, String(current));
	if (value === undefined) return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

async function pickNumberPreset(ctx: ExtensionContext, title: string, current: number, presets: number[]): Promise<number> {
	const currentText = String(current);
	const options = [currentText, ...presets.map(String).filter((preset) => preset !== currentText), CUSTOM_OPTION];
	const choice = await ctx.ui.select(title, options);
	if (!choice) return current;
	if (choice === CUSTOM_OPTION) return (await promptNumber(ctx, title, current)) ?? current;
	const parsed = Number(choice);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : current;
}

async function editCsvTuple(
	ctx: ExtensionContext,
	title: string,
	current: [string, string, string, string, string, string],
): Promise<[string, string, string, string, string, string]> {
	const value = await ctx.ui.input(title, current.join(", "));
	if (value === undefined) return current;
	const parts = value
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);
	return parts.length === 6 ? (parts as [string, string, string, string, string, string]) : current;
}

export async function openSettings(
	ctx: ExtensionContext,
	getConfig: () => Config,
	setConfig: (config: Config) => void,
	applyConfig: () => void,
): Promise<void> {
	while (true) {
		let config = getConfig();
		const choice = await ctx.ui.select("pi-chonk settings", [
			`Enabled: ${config.enabled ? "on" : "off"}`,
			`Prefix: ${config.tokenDisplay}`,
			`Show label: ${config.showLabel ? "on" : "off"}`,
			`Refresh interval: ${config.refreshIntervalMs}ms`,
			`Labels: ${config.labels.join(" / ")}`,
			`Icons: ${config.icons.join(" ")}`,
			"Reset defaults",
			"Done",
		]);
		if (!choice || choice === "Done") return;

		config = { ...config, labels: [...config.labels], icons: [...config.icons] };
		if (choice.startsWith("Enabled:")) config.enabled = !config.enabled;
		else if (choice.startsWith("Prefix:")) {
			const next = await ctx.ui.select("Prefix", ["off", "tokens", "percentage"]);
			if (next === "off" || next === "tokens" || next === "percentage") config.tokenDisplay = next;
		} else if (choice.startsWith("Show label:")) config.showLabel = !config.showLabel;
		else if (choice.startsWith("Refresh interval:"))
			config.refreshIntervalMs = await pickNumberPreset(ctx, "Refresh interval ms", config.refreshIntervalMs, [500, 1000, 2000, 5000]);
		else if (choice.startsWith("Labels:")) config.labels = await editCsvTuple(ctx, "Six labels, comma-separated", config.labels);
		else if (choice.startsWith("Icons:")) config.icons = await editCsvTuple(ctx, "Six icons, comma-separated", config.icons);
		else if (choice === "Reset defaults") {
			if (await ctx.ui.confirm("Reset pi-chonk?", "Restore default settings?")) config = { ...DEFAULT_CONFIG };
		}

		setConfig(config);
		applyConfig();
		ctx.ui.notify("pi-chonk config saved", "info");
	}
}
