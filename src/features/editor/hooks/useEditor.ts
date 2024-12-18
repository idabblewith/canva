import { useCallback, useState } from "react";
import { fabric } from "fabric";
import { useAutoResize } from "./useAutoResize";

export const useEditor = () => {
	const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
	const [container, setContainer] = useState<HTMLDivElement | null>(null);

	useAutoResize({
		canvas,
		container,
	});

	const init = useCallback(
		({
			initialCanvas,
			initialContainer,
		}: {
			initialCanvas: fabric.Canvas | null;
			initialContainer: HTMLDivElement | null;
		}) => {
			fabric.Object.prototype.set({
				transparentCorners: false,
				cornerColor: "#49f",
				cornerStyle: "circle",
				borderColor: "rgba(0,0,0,0.3)",
				borderScaleFactor: 1.5,
				borderOpacityWhenMoving: 1,
				cornerSize: 12,
				padding: 5,
			});

			const initialWorkspace = new fabric.Rect({
				width: 400,
				height: 600,
				name: "clip",
				fill: "white",
				selectable: false,
				hasControls: false,
				shadow: new fabric.Shadow({
					color: "rgba(0,0,0,0.3)",
					blur: 5,
				}),
			});

			if (initialCanvas && initialContainer) {
				// Set the width and height of the canvas to the width and height of the container
				initialCanvas.setWidth(initialContainer.offsetWidth);
				initialCanvas.setHeight(initialContainer.offsetHeight);

				initialCanvas.add(initialWorkspace);
				initialCanvas.centerObject(initialWorkspace);
				initialCanvas.clipPath = initialWorkspace;
			}

			setCanvas(initialCanvas);
			setContainer(initialContainer);
		},
		[]
	);

	return { init };
};
