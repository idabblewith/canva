"use client";

import React, { useState } from "react";
import { ActiveTool, Editor, FONT_SIZE, FONT_WEIGHT } from "../types";
import { isTextType } from "../utils";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
interface ToolbarProps {
	editor: Editor | undefined;
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
}

const Toolbar = ({ editor, activeTool, onChangeActiveTool }: ToolbarProps) => {
	const initialFillColor = editor?.getActiveFillColor();
	const initialStrokeColor = editor?.getActiveStrokeColor();
	// const initialFontFamily = editor?.getActiveFontFamily();
	// const initialFontWeight = editor?.getActiveFontWeight() || FONT_WEIGHT;
	// const initialFontStyle = editor?.getActiveFontStyle();
	// const initialFontLinethrough = editor?.getActiveFontLinethrough();
	// const initialFontUnderline = editor?.getActiveFontUnderline();
	// const initialTextAlign = editor?.getActiveTextAlign();
	// const initialFontSize = editor?.getActiveFontSize() || FONT_SIZE

	const [properties, setProperties] = useState({
		fillColor: initialFillColor,
		strokeColor: initialStrokeColor,
		//   fontFamily: initialFontFamily,
		//   fontWeight: initialFontWeight,
		//   fontStyle: initialFontStyle,
		//   fontLinethrough: initialFontLinethrough,
		//   fontUnderline: initialFontUnderline,
		//   textAlign: initialTextAlign,
		//   fontSize: initialFontSize,
	});

	const selectedObject = editor?.selectedObjects[0];
	const selectedObjectType = editor?.selectedObjects[0]?.type;

	const isText = isTextType(selectedObjectType);
	const isImage = selectedObjectType === "image";

	if (editor?.selectedObjects.length === 0) {
		return (
			<div className="shrink-0 h-[56px] border-b bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2" />
		);
	}

	return (
		<div className="shrink-0 h-[56px] border-b bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2">
			{!isImage && (
				<div className="flex items-center h-full justify-center">
					<Hint label="Color" side="bottom" sideOffset={5}>
						<Button
							onClick={() => onChangeActiveTool("fill")}
							size="icon"
							variant="ghost"
							className={cn(
								activeTool === "fill" && "bg-gray-100"
							)}
						>
							<div
								className="rounded-sm size-4 border"
								style={{
									backgroundColor: properties.fillColor,
								}}
							/>
						</Button>
					</Hint>
				</div>
			)}
		</div>
	);
};

export default Toolbar;
