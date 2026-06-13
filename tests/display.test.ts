import type { Theme } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../src/config";
import { chonkIndex, formatCount, renderChonk } from "../src/display";

describe("formatCount", () => {
	it("formats compact token counts", () => {
		expect(formatCount(999)).toBe("999");
		expect(formatCount(1500)).toBe("1.5k");
		expect(formatCount(12_345)).toBe("12k");
		expect(formatCount(1_234_567)).toBe("1.2M");
	});
});

describe("chonkIndex", () => {
	it("maps context percent into six buckets", () => {
		expect(chonkIndex(null)).toBe(0);
		expect(chonkIndex(0)).toBe(0);
		expect(chonkIndex(16)).toBe(0);
		expect(chonkIndex(17)).toBe(1);
		expect(chonkIndex(50)).toBe(3);
		expect(chonkIndex(83)).toBe(4);
		expect(chonkIndex(100)).toBe(5);
	});
});

const theme = {
	fg(color: string, text: string) {
		return text ? `[${color}]${text}[/${color}]` : text;
	},
} as Theme;

describe("renderChonk", () => {
	it("renders tokens, icon, and label", () => {
		expect(renderChonk(DEFAULT_CONFIG, { tokens: 101_000, percent: 37 })).toBe("101k 󡤂   Chonky");
	});

	it("keeps post-icon padding when the label is hidden", () => {
		const config = { ...DEFAULT_CONFIG, tokenDisplay: "off" as const, showLabel: false };
		expect(renderChonk(config, { tokens: 101_000, percent: 37 })).toBe("󡤂 ");
	});

	it("can render percentage as the prefix", () => {
		const config = { ...DEFAULT_CONFIG, tokenDisplay: "percentage" as const };
		expect(renderChonk(config, { tokens: 101_000, percent: 37 })).toBe("37% 󡤂   Chonky");
	});

	it("colors normal stages with success and muted prefix", () => {
		expect(renderChonk(DEFAULT_CONFIG, { tokens: 101_000, percent: 37 }, theme)).toBe(
			"[muted]101k [/muted][success]󡤂[/success]   [success]Chonky[/success]",
		);
	});

	it("colors the last two stages with danger color", () => {
		expect(renderChonk(DEFAULT_CONFIG, { tokens: 900_000, percent: 84 }, theme)).toBe(
			"[muted]900k [/muted][error]󡤅[/error]   [error]Oh lawd[/error]",
		);
	});
});
