import { useCallback, useEffect } from "react";
import { fabric } from "fabric";

interface IAutoResize {
	canvas: fabric.Canvas | null;
	container: HTMLDivElement | null;
}

export const useAutoResize = ({ canvas, container }: IAutoResize) => {
	const autoZoom = useCallback(() => {
		if (!canvas || !container) return;

		const width = container.offsetWidth;
		const height = container.offsetHeight;

		canvas.setWidth(width);
		canvas.setHeight(height);

		const center = canvas.getCenter();
		const zoomRatio = 0.85;

		const localWorkspace = canvas
			.getObjects()
			.find((object) => object.name === "clip");
		// @ts-expect-error Property 'findScaleToFit' does not exist on type 'IUtil'.ts(2339)

		const scale = fabric.util.findScaleToFit(localWorkspace, {
			width,
			height,
		});

		const zoom = zoomRatio * scale;

		canvas.setViewportTransform(fabric.iMatrix.concat());
		canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);

		if (!localWorkspace) return;

		const workSpaceCenter = localWorkspace.getCenterPoint();
		const viewportTransform = canvas.viewportTransform;

		if (
			!viewportTransform ||
			canvas.width === undefined ||
			canvas.height === undefined
		)
			return;

		viewportTransform[4] =
			canvas.width / 2 - workSpaceCenter.x * viewportTransform[0];
		viewportTransform[5] =
			canvas.height / 2 - workSpaceCenter.y * viewportTransform[3];

		canvas.setViewportTransform(viewportTransform);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		localWorkspace.clone((cloned: any) => {
			canvas.clipPath = cloned;
			canvas.requestRenderAll();
		});
	}, [canvas, container]);

	useEffect(() => {
		let resizeObserver: ResizeObserver | null = null;

		if (canvas && container) {
			resizeObserver = new ResizeObserver(() => {
				autoZoom();
			});

			resizeObserver.observe(container);
		}

		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	}, [canvas, container, autoZoom]);

	return { autoZoom };
};
