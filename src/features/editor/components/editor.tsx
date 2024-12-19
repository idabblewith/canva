"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../hooks/useEditor";
import { fabric } from "fabric";
import EditorNavbar from "./navbar";
import EditorSidebar from "./sidebar";
import Toolbar from "./toolbar";
import Footer from "./footer";
import { ActiveTool, selectionDependentTools } from "../types";
import { ShapeSidebar } from "./shape-sidebar";
import { FillColorSidebar } from "./fill-color-sidebar";
import { StrokeColorSidebar } from "./stroke-color-sidebar";

const Editor = () => {
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

	const onClearSelection = useCallback(() => {
		if (selectionDependentTools.includes(activeTool)) {
			setActiveTool("select");
		}
		// editor?.clearSelection();
	}, [activeTool]);

	const { init, editor } = useEditor({
		clearSelectionCallback: onClearSelection,
	});
	const canvasRef = useRef(null);
	const containerRef = useRef<HTMLDivElement>(null);

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
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<FillColorSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<StrokeColorSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<main className="bg-muted flex-col flex-1 flex overflow-auto relative">
					<Toolbar
						editor={editor}
						activeTool={activeTool}
						onChangeActiveTool={onChangeActiveTool}
						key={JSON.stringify(editor?.canvas.getActiveObject())}
					/>
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
