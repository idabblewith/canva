import { ITextboxOptions } from "fabric/fabric-impl";

export type ActiveTool =
	| "select"
	| "shapes"
	| "text"
	| "images"
	| "draw"
	| "fill"
	| "stroke-color"
	| "stroke-width"
	| "font"
	| "opacity"
	| "filter"
	| "settings"
	| "ai"
	| "remove-bg"
	| "templates";

export interface Editor {
	savePng: () => void;
	saveJpg: () => void;
	saveSvg: () => void;
	saveJson: () => void;
	loadJson: (json: string) => void;
	onUndo: () => void;
	onRedo: () => void;
	canUndo: () => boolean;
	canRedo: () => boolean;
	autoZoom: () => void;
	zoomIn: () => void;
	zoomOut: () => void;
	getWorkspace: () => fabric.Object | undefined;
	changeBackground: (value: string) => void;
	changeSize: (value: { width: number; height: number }) => void;
	enableDrawingMode: () => void;
	disableDrawingMode: () => void;
	onCopy: () => void;
	onPaste: () => void;
	changeImageFilter: (value: string) => void;
	addImage: (value: string) => void;
	delete: () => void;
	changeFontSize: (value: number) => void;
	getActiveFontSize: () => number;
	changeTextAlign: (value: string) => void;
	getActiveTextAlign: () => string;
	changeFontUnderline: (value: boolean) => void;
	getActiveFontUnderline: () => boolean;
	changeFontLinethrough: (value: boolean) => void;
	getActiveFontLinethrough: () => boolean;
	changeFontStyle: (value: string) => void;
	getActiveFontStyle: () => string;
	changeFontWeight: (value: number) => void;
	getActiveFontWeight: () => number;
	getActiveFontFamily: () => string;
	changeFontFamily: (value: string) => void;
	addText: (value: string, options?: ITextboxOptions) => void;
	getActiveOpacity: () => number;
	changeOpacity: (value: number) => void;
	bringForward: () => void;
	sendBackwards: () => void;
	changeStrokeWidth: (value: number) => void;
	changeFillColor: (value: string) => void;
	changeStrokeColor: (value: string) => void;
	changeStrokeDashArray: (value: number[]) => void;
	addCircle: () => void;
	addSoftRectangle: () => void;
	addRectangle: () => void;
	addTriangle: () => void;
	addInverseTriangle: () => void;
	addDiamond: () => void;
	canvas: fabric.Canvas;
	getActiveFillColor: () => string;
	getActiveStrokeColor: () => string;
	getActiveStrokeWidth: () => number;
	getActiveStrokeDashArray: () => number[];
	selectedObjects: fabric.Object[];
}
