// catch all route

import { Hono, Context } from "hono";
import { handle } from "hono/vercel";
import { AuthConfig, initAuthConfig } from "@hono/auth-js";
import authConfig from "@/auth.config";

import images from "./images";
import ai from "./ai";
import users from "./users";
import projects from "./projects";

// Deployable everywhere, revert to edge if only edge
export const runtime = "nodejs";

function getAuthConfig(c: Context): AuthConfig {
	return {
		// secret: c.env.AUTH_SECRET,
		// ...authConfig,
		secret: process.env.AUTH_SECRET,
		...(authConfig as any), // Added due to ts errors with new nextjs auth libs
	};
}

const app = new Hono().basePath("/api");
app.use("*", initAuthConfig(getAuthConfig));

// app.get("/posts/:id/comments/:commentId", (c) => {
// 	// const { id, commentId } = c.req.param();
// 	const params = c.req.param();
// 	return c.json({ message: `Post: ${params.id}, comment: ${params.commentId}` });
// });

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
	.route("/ai", ai)
	.route("/images", images)
	.route("/users", users)
	.route("/projects", projects);
//   .route("/subscriptions", subscriptions);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
