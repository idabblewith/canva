import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

// Next auth for later
import { auth } from "@/auth";
// const auth = (req: Request) => ({ user: { id: "fakeId" } });

const f = createUploadthing();

export const ourFileRouter = {
	imageUploader: f({ image: { maxFileSize: "4MB" } })
		.middleware(async () => {
			// const session = await auth(req);
			const session = await auth();

			if (!session) throw new UploadThingError("Unauthorized");

			return { userId: session.user?.id };
		})
		.onUploadComplete(async ({ file }) => {
			return { url: file.url };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
