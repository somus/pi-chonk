import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { type Config, loadConfig, STATUS_ID, saveConfig } from "./config";
import { getChonkUsage, renderChonk } from "./display";
import { openSettings } from "./settings";

export default function (pi: ExtensionAPI): void {
	let timer: ReturnType<typeof setInterval> | undefined;
	let config: Config = loadConfig();

	function stopTimer(): void {
		if (timer) clearInterval(timer);
		timer = undefined;
	}

	function clear(ctx: ExtensionContext): void {
		if (ctx.hasUI) ctx.ui.setStatus(STATUS_ID, undefined);
	}

	function publish(ctx: ExtensionContext): void {
		config = loadConfig();
		if (!config.enabled) {
			clear(ctx);
			return;
		}

		if (ctx.hasUI) ctx.ui.setStatus(STATUS_ID, renderChonk(config, getChonkUsage(ctx)));
	}

	pi.on("session_start", (_event, ctx) => {
		publish(ctx);
		stopTimer();
		timer = setInterval(() => publish(ctx), Math.max(250, config.refreshIntervalMs));
		timer.unref?.();
	});

	pi.on("turn_end", (_event, ctx) => publish(ctx));
	pi.on("message_end", (_event, ctx) => publish(ctx));
	pi.on("model_select", (_event, ctx) => publish(ctx));
	pi.on("session_compact", (_event, ctx) => publish(ctx));
	pi.on("session_tree", (_event, ctx) => publish(ctx));
	pi.on("session_shutdown", (_event, ctx) => {
		stopTimer();
		clear(ctx);
	});

	function applyConfig(ctx: ExtensionContext): void {
		saveConfig(config);
		publish(ctx);
	}

	async function handleConfigCommand(_args: string, ctx: ExtensionCommandContext): Promise<void> {
		await openSettings(
			ctx,
			() => config,
			(next) => {
				config = next;
			},
			() => applyConfig(ctx),
		);
	}

	pi.registerCommand("pi-chonk", {
		description: "Configure pi-chonk context meter",
		handler: handleConfigCommand,
	});
}
