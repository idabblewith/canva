import { z } from "zod";
import { Hono } from "hono";
// import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { replicate } from "@/lib/replicate";

const app = new Hono()
	.post(
		"/remove-bg",
		// verifyAuth(),
		zValidator(
			"json",
			z.object({
				image: z.string(),
			})
		),
		async (c) => {
			const { image } = c.req.valid("json");

			const input = {
				image: image,
			};

			const output: unknown = await replicate.run(
				"cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
				{ input }
			);

			const res = output as string;

			return c.json({ data: res });
		}
	)
	.post(
		"/generate-image",
		// verifyAuth(),
		zValidator(
			"json",
			z.object({
				prompt: z.string(),
			})
		),
		async (c) => {
			const { prompt } = c.req.valid("json");

			const input = {
				prompt: prompt,
				go_fast: true,
				guidance: 3.5,
				megapixels: "1",
				num_outputs: 1,
				aspect_ratio: "3:2",
				output_format: "webp",
				output_quality: 90,
				prompt_strength: 0.85,
				num_inference_steps: 28,
				// negative_prompt: "",
				disable_safety_checker: true,
			};

			const output = await replicate.run("black-forest-labs/flux-dev", {
				input,
			});

			const res = output as Array<string>;

			return c.json({ data: res[0] });
		}
	);

export default app;
