// catch all route

import { Hono } from "hono";
import { handle } from "hono/vercel";

import images from "./images";
import ai from "./ai";

// Deployable everywhere, revert to edge if only edge
export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// app.get("/posts/:id/comments/:commentId", (c) => {
// 	// const { id, commentId } = c.req.param();
// 	const params = c.req.param();
// 	return c.json({ message: `Post: ${params.id}, comment: ${params.commentId}` });
// });

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
	.route("/ai", ai)
	//   .route("/users", users)
	.route("/images", images);
//   .route("/projects", projects)
//   .route("/subscriptions", subscriptions);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
