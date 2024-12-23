// catch all route

import { Hono } from "hono";
import { handle } from "hono/vercel";

// Deployable everywhere, revert to edge if only edge
export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// context
app.get("/test", (c) => {
	return c.json({ message: "Hello World!" });
});

// app.get("/test/:id", (c) => {
// 	return c.json({ message: `Hello ${c.params.id}!` });
// });

app.get("/posts/:id/comments/:commentId", (c) => {
	const { id, commentId } = c.req.param();
	return c.json({ message: `Post: ${id}, comment: ${commentId}` });
});

export const GET = handle(app);
