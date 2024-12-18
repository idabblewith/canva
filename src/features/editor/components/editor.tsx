"use client";

import React, { useEffect, useRef } from "react";
import { useEditor } from "../hooks/useEditor";
import { fabric } from "fabric";
import EditorNavbar from "./navbar";
import EditorSidebar from "./sidebar";
import Toolbar from "./toolbar";
import Footer from "./footer";

const Editor = () => {
	const { init } = useEditor();
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
			<EditorNavbar />
			{/* offset nav */}
			<div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
				<EditorSidebar />
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
