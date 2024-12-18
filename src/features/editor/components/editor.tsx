"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../hooks/useEditor";
import { fabric } from "fabric";
import EditorNavbar from "./navbar";
import EditorSidebar from "./sidebar";
import Toolbar from "./toolbar";
import Footer from "./footer";
import { ActiveTool } from "../types";
import { ShapeSidebar } from "./shape-sidebar";

const Editor = () => {
	const { init } = useEditor();
	const canvasRef = useRef(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeTool, setActiveTool] = useState<ActiveTool>("select");

	const onChangeActiveTool = useCallback(
		(tool: ActiveTool) => {
			if (tool === "draw") {
				// editor?.enableDrawingMode();
			}

			if (activeTool === "draw") {
				// editor?.disableDrawingMode();
			}

			if (tool === activeTool) {
				return setActiveTool("select");
			}

			setActiveTool(tool);
		},
		[
			activeTool,
			// editor
		]
	);

	useEffect(() => {
		const canvas = new fabric.Canvas(canvasRef.current, {
			controlsAboveOverlay: true,
			preserveObjectStacking: true,
		});

		init({
			initialCanvas: canvas,
			initialContainer: containerRef.current,
		});

		return () => {
			canvas.dispose();
		};
	}, [init]);

	return (
		<div className="h-full flex flex-col">
			<EditorNavbar
				activeTool={activeTool}
				onChangeActiveTool={onChangeActiveTool}
			/>
			{/* offset nav */}
			<div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
				<EditorSidebar
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<ShapeSidebar
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<main className="bg-muted flex-col flex-1 flex overflow-auto relative">
					<Toolbar />
					<div
						className="flex-1 h-[calc(100%-124px)] bg-muted"
						ref={containerRef}
					>
						<canvas ref={canvasRef} />
					</div>
					<Footer />
				</main>
			</div>
		</div>
	);
};

export default Editor;
