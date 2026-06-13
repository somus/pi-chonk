import type { ExtensionContext, Theme } from "@earendil-works/pi-coding-agent";
import type { Config } from "./config";

export type ChonkUsage = {
	tokens: number | null;
	percent: number | null;
};

export function formatCount(value: number): string {
	if (value < 1000) return value.toString();
	if (value < 10_000) return `${(value / 1000).toFixed(1)}k`;
	if (value < 1_000_000) return `${Math.round(value / 1000)}k`;
	if (value < 10_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
	return `${Math.round(value / 1_000_000)}M`;
}

export function chonkIndex(percent: number | null | undefined, levels = 6): number {
	if (percent === null || percent === undefined || !Number.isFinite(percent)) return 0;
	return Math.max(0, Math.min(levels - 1, Math.floor((Math.max(0, Math.min(100, percent)) / 100) * levels)));
}

export function getChonkUsage(ctx: ExtensionContext): ChonkUsage {
	const usage = ctx.getContextUsage();
	return {
		tokens: typeof usage?.tokens === "number" && Number.isFinite(usage.tokens) ? usage.tokens : null,
		percent: typeof usage?.percent === "number" && Number.isFinite(usage.percent) ? usage.percent : null,
	};
}

function formatPrefix(config: Config, usage: ChonkUsage): string {
	if (config.tokenDisplay === "off") return "";
	if (config.tokenDisplay === "percentage") {
		return `${usage.percent === null ? "?" : Math.round(Math.max(0, Math.min(999, usage.percent)))}% `;
	}
	return `${usage.tokens === null ? "?" : formatCount(usage.tokens)} `;
}

function isDangerStage(index: number, levels: number): boolean {
	return index >= Math.max(0, levels - 2);
}

function colorChonkPart(theme: Theme | undefined, index: number, levels: number, text: string): string {
	if (!theme || text.length === 0) return text;
	return theme.fg(isDangerStage(index, levels) ? "error" : "success", text);
}

export function renderChonk(config: Config, usage: ChonkUsage, theme?: Theme): string {
	const index = chonkIndex(usage.percent, config.icons.length);
	const icon = config.icons[index] ?? config.icons[0];
	const label = config.labels[index] ?? config.labels[0];
	const beforeIcon = theme?.fg("muted", formatPrefix(config, usage)) ?? formatPrefix(config, usage);
	const coloredIcon = colorChonkPart(theme, index, config.icons.length, icon);
	const afterIcon = config.showLabel ? `   ${colorChonkPart(theme, index, config.icons.length, label)}` : " ";
	return `${beforeIcon}${coloredIcon}${afterIcon}`;
}
