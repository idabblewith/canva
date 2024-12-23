import Replicate from "replicate";

export const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN,
	useFileOutput: false, // Set to true if you want to save the output to a file directly
});
