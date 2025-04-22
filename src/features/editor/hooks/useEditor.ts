import { useCallback, useMemo, useRef, useState } from "react";
import { fabric } from "fabric";
import { useAutoResize } from "./useAutoResize";
import {
	BuildEditorProps,
	CIRCLE_OPTIONS,
	DIAMOND_OPTIONS,
	FILL_COLOR,
	FONT_FAMILY,
	RECTANGLE_OPTIONS,
	STROKE_COLOR,
	STROKE_DASH_ARRAY,
	STROKE_WIDTH,
	TRIANGLE_OPTIONS,
	EditorHookProps,
	TEXT_OPTIONS,
	FONT_WEIGHT,
	FONT_SIZE,
	JSON_KEYS,
} from "../types";
import { useCanvasEvents } from "./useCanvasEvents";
import {
	isTextType,
	createFilter,
	downloadFile,
	transformText,
} from "../utils";
// import { ITextboxOptions } from "fabric/fabric-impl";
import { useClipboard } from "./useClipboard";
import { useHistory } from "./useHistory";
import { useHotkeys } from "./useHotkeys";
import { useWindowEvents } from "./useWindowEvents";
import { useLoadState } from "./useLoadState";

const buildEditor = ({
	canvas,
	fontFamily,
	fillColor,
	strokeColor,
	strokeWidth,
	strokeDashArray,
	selectedObjects,
	save,
	undo,
	redo,
	canUndo,
	canRedo,
	autoZoom,
	copy,
	paste,
	setFillColor,
	setStrokeColor,
	setStrokeWidth,
	setStrokeDashArray,
	setFontFamily,
}: BuildEditorProps) => {
	// Saving / Loading
	const generateSaveOptions = () => {
		const { width, height, left, top } = getWorkspace() as fabric.Rect;

		return {
			name: "Image",
			format: "png",
			quality: 1,
			width,
			height,
			left,
			top,
		};
	};

	const savePng = () => {
		const options = generateSaveOptions();

		canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		const dataUrl = canvas.toDataURL(options);

		downloadFile(dataUrl, "png");
		autoZoom();
	};

	const saveSvg = () => {
		const options = generateSaveOptions();

		canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		const dataUrl = canvas.toDataURL(options);

		downloadFile(dataUrl, "svg");
		autoZoom();
	};

	const saveJpg = () => {
		const options = generateSaveOptions();

		canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		const dataUrl = canvas.toDataURL(options);

		downloadFile(dataUrl, "jpg");
		autoZoom();
	};

	const saveJson = async () => {
		const dataUrl = canvas.toJSON(JSON_KEYS);

		await transformText(dataUrl.objects);
		const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
			JSON.stringify(dataUrl, null, "\t")
		)}`;
		downloadFile(fileString, "json");
	};

	const loadJson = (json: string) => {
		const data = JSON.parse(json);

		canvas.loadFromJSON(data, () => {
			autoZoom();
		});
	};

	const getWorkspace = () => {
		return canvas.getObjects().find((object) => object.name === "clip");
	};

	const center = (object: fabric.Object) => {
		const workspace = getWorkspace();
		const center = workspace?.getCenterPoint();

		if (!center) return;

		// @ts-expect-error Property '_centerObject' does not exist on type 'Canvas'. Did you mean 'centerObject'?ts(2551)
		canvas._centerObject(object, center);
	};

	const addToCanvas = (object: fabric.Object) => {
		center(object);
		canvas.add(object);
		canvas.setActiveObject(object);
	};

	return {
		getActiveFillColor: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return fillColor;
			}

			const value = selectedObject.get("fill") || fillColor;

			// Currently, gradients & patterns are not supported
			return value as string;
		},
		getActiveStrokeColor: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return strokeColor;
			}

			const value = selectedObject.get("stroke") || strokeColor;

			return value;
		},
		getActiveStrokeWidth: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return strokeWidth;
			}

			const value = selectedObject.get("strokeWidth") || strokeWidth;

			return value;
		},
		getActiveStrokeDashArray: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return strokeDashArray;
			}

			const value =
				selectedObject.get("strokeDashArray") || strokeDashArray;

			return value;
		},
		changeFillColor: (value: string) => {
			setFillColor(value);
			canvas.getActiveObjects().forEach((object) => {
				object.set({ fill: value });
			});
			canvas.renderAll();
		},
		changeStrokeColor: (value: string) => {
			setStrokeColor(value);
			canvas.getActiveObjects().forEach((object) => {
				// Text types don't have stroke
				if (isTextType(object.type)) {
					object.set({ fill: value });
					return;
				}

				object.set({ stroke: value });
			});
			canvas.freeDrawingBrush.color = value;
			canvas.renderAll();
		},
		changeStrokeWidth: (value: number) => {
			setStrokeWidth(value);
			canvas.getActiveObjects().forEach((object) => {
				object.set({ strokeWidth: value });
			});
			canvas.freeDrawingBrush.width = value;
			canvas.renderAll();
		},
		changeStrokeDashArray: (value: number[]) => {
			setStrokeDashArray(value);
			canvas.getActiveObjects().forEach((object) => {
				object.set({ strokeDashArray: value });
			});
			canvas.renderAll();
		},
		addCircle: () => {
			console.log("Adding a circle");
			const object = new fabric.Circle({
				...CIRCLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});

			addToCanvas(object);
			// canvas.add(object);
			// canvas.setActiveObject(object);
		},
		addSoftRectangle: () => {
			const object = new fabric.Rect({
				...RECTANGLE_OPTIONS,
				rx: 50,
				ry: 50,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});

			addToCanvas(object);
		},
		addRectangle: () => {
			const object = new fabric.Rect({
				...RECTANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});

			addToCanvas(object);
		},
		addTriangle: () => {
			const object = new fabric.Triangle({
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});

			addToCanvas(object);
		},
		addInverseTriangle: () => {
			const HEIGHT = TRIANGLE_OPTIONS.height;
			const WIDTH = TRIANGLE_OPTIONS.width;

			const object = new fabric.Polygon(
				[
					{ x: 0, y: 0 },
					{ x: WIDTH, y: 0 },
					{ x: WIDTH / 2, y: HEIGHT },
				],
				{
					...TRIANGLE_OPTIONS,
					fill: fillColor,
					stroke: strokeColor,
					strokeWidth: strokeWidth,
					strokeDashArray: strokeDashArray,
				}
			);

			addToCanvas(object);
		},
		addDiamond: () => {
			const HEIGHT = DIAMOND_OPTIONS.height;
			const WIDTH = DIAMOND_OPTIONS.width;

			const object = new fabric.Polygon(
				[
					{ x: WIDTH / 2, y: 0 },
					{ x: WIDTH, y: HEIGHT / 2 },
					{ x: WIDTH / 2, y: HEIGHT },
					{ x: 0, y: HEIGHT / 2 },
				],
				{
					...DIAMOND_OPTIONS,
					fill: fillColor,
					stroke: strokeColor,
					strokeWidth: strokeWidth,
					strokeDashArray: strokeDashArray,
				}
			);
			addToCanvas(object);
		},
		// Layering
		bringForward: () => {
			canvas.getActiveObjects().forEach((object) => {
				canvas.bringForward(object);
			});

			canvas.renderAll();

			const workspace = getWorkspace();
			workspace?.sendToBack();
		},
		sendBackwards: () => {
			canvas.getActiveObjects().forEach((object) => {
				canvas.sendBackwards(object);
			});

			canvas.renderAll();
			const workspace = getWorkspace();
			workspace?.sendToBack();
		},
		// Text
		// eslint:disable-next-line: no-shadowed-variable
		// @ts-expect-error Parameter 'options' implicitly has an 'any' type.ts(7006)
		addText: (value, options) => {
			const object = new fabric.Textbox(value, {
				...TEXT_OPTIONS,
				fill: fillColor,
				...options,
			});

			addToCanvas(object);
		},
		changeFontFamily: (value: string) => {
			setFontFamily(value);
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					// @ts-expect-error Object literal may only specify known properties, and 'fontFamily' does not exist in type 'Partial<Object>'.ts(2353)
					object.set({ fontFamily: value });
				}
			});
			canvas.renderAll();
		},
		getActiveFontFamily: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return fontFamily;
			}

			// @ts-expect-error Argument of type '"fontFamily"' is not assignable to parameter of type 'keyof Object'.ts(2345)
			// Faulty TS library, fontFamily exists.
			const value = selectedObject.get("fontFamily") || fontFamily;

			return value;
		},
		changeFontWeight: (value: number) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					// @ts-expect-error Argument of type '"fontWeight"' is not assignable to parameter of type 'keyof Object'.ts(2345)
					// Faulty TS library, fontWeight exists.
					object.set({ fontWeight: value });
				}
			});
			canvas.renderAll();
		},
		getActiveFontWeight: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return FONT_WEIGHT;
			}

			// @ts-expect-error Argument of type '"fontWeight"' is not assignable to parameter of type 'keyof Object'.ts(2345)
			// Faulty TS library, fontWeight exists.
			const value = selectedObject.get("fontWeight") || FONT_WEIGHT;

			return value;
		},
		changeFontSize: (value: number) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					//@ts-expect-error Object literal may only specify known properties, and 'fontSize' does not exist in type 'Partial<Object>'.ts(2353)
					// Faulty TS library, fontSize exists.
					object.set({ fontSize: value });
				}
			});
			canvas.renderAll();
		},
		getActiveFontSize: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return FONT_SIZE;
			}

			// @ts-expect-error Argument of type '"fontSize"' is not assignable to parameter of type 'keyof Object'.ts(2345)
			// Faulty TS library, fontSize exists.
			const value = selectedObject.get("fontSize") || FONT_SIZE;

			return value;
		},

		changeTextAlign: (value: string) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					// @ts-expect-error Object literal may only specify known properties, and 'textAlign' does not exist in type 'Partial<Object>'.ts(2353)
					// Faulty TS library, textAlign exists.
					object.set({ textAlign: value });
				}
			});
			canvas.renderAll();
		},
		getActiveTextAlign: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return "left";
			}

			// @ts-expect-error Argument of type '"textAlign"' is not assignable to parameter of type 'keyof Object'.ts(2345)
			// Faulty TS library, textAlign exists.
			const value = selectedObject.get("textAlign") || "left";

			return value;
		},
		changeFontUnderline: (value: boolean) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					// @ts-expect-error Object literal may only specify known properties, and 'underline' does not exist in type 'Partial<Object>'.ts(2353)
					// Faulty TS library, underline exists.
					object.set({ underline: value });
				}
			});
			canvas.renderAll();
		},
		getActiveFontUnderline: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return false;
			}

			// @ts-expect-error Argument of type '"underline"' is not assignable to parameter of type 'keyof Object'.ts(2345)
			// Faulty TS library, underline exists.
			const value = selectedObject.get("underline") || false;

			return value;
		},
		changeFontLinethrough: (value: boolean) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					// @ts-expect-error Object literal may only specify known properties, and 'linethrough' does not exist in type 'Partial<Object>'.ts(2353)
					// Faulty TS library, linethrough exists.
					object.set({ linethrough: value });
				}
			});
			canvas.renderAll();
		},
		getActiveFontLinethrough: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return false;
			}

			//@ts-expect-error Argument of type '"linethrough"' is not assignable to parameter of type 'keyof Object'.ts(2345)
			// Faulty TS library, linethrough exists.
			const value = selectedObject.get("linethrough") || false;

			return value;
		},
		changeFontStyle: (value: string) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					// @ts-expect-error Object literal may only specify known properties, and 'fontStyle' does not exist in type 'Partial<Object>'.ts(2353)
					// Faulty TS library, fontStyle exists.
					object.set({ fontStyle: value });
				}
			});
			canvas.renderAll();
		},
		getActiveFontStyle: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return "normal";
			}

			// @ts-expect-error Argument of type '"fontStyle"' is not assignable to parameter of type 'keyof Object'.ts(2345)
			// Faulty TS library, fontStyle exists.
			const value = selectedObject.get("fontStyle") || "normal";

			return value;
		},

		// Images
		addImage: (value: string) => {
			fabric.Image.fromURL(
				value,
				(image) => {
					const workspace = getWorkspace();

					image.scaleToWidth(workspace?.width || 0);
					image.scaleToHeight(workspace?.height || 0);

					addToCanvas(image);
				},
				{
					crossOrigin: "anonymous",
				}
			);
		},
		changeImageFilter: (value: string) => {
			const objects = canvas.getActiveObjects();
			objects.forEach((object) => {
				if (object.type === "image") {
					const imageObject = object as fabric.Image;

					const effect = createFilter(value);

					imageObject.filters = effect ? [effect] : [];
					imageObject.applyFilters();
					canvas.renderAll();
				}
			});
		},

		// Opacity
		changeOpacity: (value: number) => {
			canvas.getActiveObjects().forEach((object) => {
				object.set({ opacity: value });
			});
			canvas.renderAll();
		},
		getActiveOpacity: () => {
			const selectedObject = selectedObjects[0];

			if (!selectedObject) {
				return 1;
			}

			const value = selectedObject.get("opacity") || 1;

			return value;
		},
		// Drawing
		enableDrawingMode: () => {
			canvas.discardActiveObject();
			canvas.renderAll();
			canvas.isDrawingMode = true;
			canvas.freeDrawingBrush.width = strokeWidth;
			canvas.freeDrawingBrush.color = strokeColor;
		},
		disableDrawingMode: () => {
			canvas.isDrawingMode = false;
		},

		// Settings
		getWorkspace,
		zoomIn: () => {
			let zoomRatio = canvas.getZoom();
			zoomRatio += 0.05;
			const center = canvas.getCenter();
			canvas.zoomToPoint(
				new fabric.Point(center.left, center.top),
				zoomRatio > 1.25 ? 1.25 : zoomRatio
			);
		},
		zoomOut: () => {
			let zoomRatio = canvas.getZoom();
			zoomRatio -= 0.05;
			const center = canvas.getCenter();
			canvas.zoomToPoint(
				new fabric.Point(center.left, center.top),
				zoomRatio < 0.2 ? 0.2 : zoomRatio
			);
		},
		changeSize: ({ width, height }: { width: number; height: number }) => {
			const workspace = getWorkspace();
			workspace?.set({ width, height });
			autoZoom();
			save();
		},
		changeBackground: (value: string) => {
			const workspace = getWorkspace();
			workspace?.set({ fill: value });
			canvas.renderAll();
			save();
		},
		// Saving and Loading
		savePng,
		saveJpg,
		saveSvg,
		saveJson,
		loadJson,
		// Copy Paste Undo Redo Delete
		canUndo,
		canRedo,
		onCopy: () => copy(),
		onPaste: () => paste(),
		onUndo: () => undo(),
		onRedo: () => redo(),
		delete: () => {
			canvas
				.getActiveObjects()
				.forEach((object) => canvas.remove(object));
			canvas.discardActiveObject();
			canvas.renderAll();
		},
		autoZoom,
		canvas,
		selectedObjects,
	};
};

export const useEditor = ({
	defaultState,
	defaultHeight,
	defaultWidth,
	clearSelectionCallback,
	saveCallback,
}: EditorHookProps) => {
	useWindowEvents();

	const initialState = useRef(defaultState);
	const initialHeight = useRef(defaultHeight);
	const initialWidth = useRef(defaultWidth);

	const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
	const [container, setContainer] = useState<HTMLDivElement | null>(null);
	const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

	const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
	const [fillColor, setFillColor] = useState(FILL_COLOR);
	const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
	const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
	const [strokeDashArray, setStrokeDashArray] =
		useState<number[]>(STROKE_DASH_ARRAY);

	const { autoZoom } = useAutoResize({
		canvas,
		container,
	});

	const { copy, paste } = useClipboard({ canvas });

	const {
		save,
		canRedo,
		canUndo,
		undo,
		redo,
		canvasHistory,
		setHistoryIndex,
	} = useHistory({
		canvas,
		saveCallback,
	});

	useCanvasEvents({
		save,
		canvas,
		setSelectedObjects,
		clearSelectionCallback,
	});

	useHotkeys({
		undo,
		redo,
		copy,
		paste,
		save,
		canvas,
	});

	useLoadState({
		canvas,
		autoZoom,
		initialState,
		canvasHistory,
		setHistoryIndex,
	});

	const editor = useMemo(() => {
		if (canvas)
			return buildEditor({
				save,
				undo,
				redo,
				canUndo,
				canRedo,
				autoZoom,
				copy,
				paste,
				canvas,
				fillColor,
				strokeColor,
				setFillColor,
				setStrokeColor,
				setStrokeWidth,
				setStrokeDashArray,
				setFontFamily,
				strokeWidth,
				strokeDashArray,
				fontFamily,
				selectedObjects,
			});
		return undefined;
	}, [
		save,
		undo,
		redo,
		canUndo,
		canRedo,
		autoZoom,
		copy,
		paste,
		canvas,
		selectedObjects,
		fillColor,
		strokeWidth,
		strokeColor,
		strokeDashArray,
		fontFamily,
	]);

	const init = useCallback(
		({
			initialCanvas,
			initialContainer,
		}: {
			initialCanvas: fabric.Canvas;
			initialContainer: HTMLDivElement;
		}) => {
			fabric.Object.prototype.set({
				cornerColor: "#FFF",
				cornerStyle: "circle",
				borderColor: "#3b82f6",
				borderScaleFactor: 1.5,
				transparentCorners: false,
				borderOpacityWhenMoving: 1,
				cornerStrokeColor: "#3b82f6",
			});

			const initialWorkspace = new fabric.Rect({
				width: initialWidth.current,
				height: initialHeight.current,
				name: "clip",
				fill: "white",
				selectable: false,
				hasControls: false,
				shadow: new fabric.Shadow({
					color: "rgba(0,0,0,0.8)",
					blur: 5,
				}),
			});

			initialCanvas.setWidth(initialContainer.offsetWidth);
			initialCanvas.setHeight(initialContainer.offsetHeight);

			initialCanvas.add(initialWorkspace);
			initialCanvas.centerObject(initialWorkspace);
			initialCanvas.clipPath = initialWorkspace;

			setCanvas(initialCanvas);
			setContainer(initialContainer);

			const currentState = JSON.stringify(
				initialCanvas.toJSON(JSON_KEYS)
			);
			canvasHistory.current = [currentState];
			setHistoryIndex(0);
		},
		[
			canvasHistory, // Not required - satisfies linter, this is from useRef
			setHistoryIndex, // Not required - satifies linter, this is from useState
		]
	);

	return { init, editor };
};
