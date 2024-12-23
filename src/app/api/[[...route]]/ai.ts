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

			// if (Array.isArray(output)) {
			// 	const firstItem = output[0]; // Assuming the first item is the ReadableStream

			// 	if (firstItem instanceof ReadableStream) {
			// 		const reader = firstItem.getReader();
			// 		const chunks = [];
			// 		let result;

			// 		while (!(result = await reader.read()).done) {
			// 			chunks.push(result.value); // Collect the binary chunks
			// 		}

			// 		// Combine all chunks into a single Blob
			// 		const blob = new Blob(chunks);
			// 		const imageUrl = URL.createObjectURL(blob); // Create a URL to access the image

			// 		console.log("Image URL:", imageUrl);
			// 		return c.json({ data: imageUrl });
			// 	} else {
			// 		console.log(
			// 			"First item is not a ReadableStream:",
			// 			firstItem
			// 		);
			// 		return c.json({ data: firstItem });
			// 	}
			// } else {
			// 	console.log("Output is not an array:", output);
			// 	return c.json({ data: output });
			// }

			// const output = await replicate.run(
			// 	"stability-ai/stable-diffusion-3",
			// 	{ input }
			// );
			// console.log(output);

			const res = output as Array<string>;

			return c.json({ data: res[0] });
		}
	);

export default app;
