import React, { useLayoutEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm";

const generator = rough.generator();

function createElement(id,x1, y1, x2, y2, type) {
	const roughElement =
		type === "line"
			? generator.line(x1, y1, x2, y2)
			: generator.rectangle(x1, y1, x2 - x1, y2 - y1);
	return {id, x1, y1, x2, y2, roughElement };
}

const isWithinElement = (element, x, y) => {
	const { type, x1, x2, y1, y2 } = element;
	if (type === "rectangle") {
		const minX = Math.min(x1, x2);
		const maxX = Math.max(x1, x2);
		const minY = Math.min(y1, y2);
		const maxY = Math.max(y1, y2);
		return x >= minX && x <= maxX && y >= minY && y <= maxY;
	} else {
		const a = { x: x1, y: y1 };
		const b = { x: x2, y: y2 };
		const c = { x, y };
		const offset = distance(a, c) + distance(c, b) - distance(a, b);
		return Math.abs(offset) < 1;
	}
};

const distance = (a, b) => {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

const getElementAtPosition = (elements, x, y) => {
	return elements.find((element) => isWithinElement(element, x, y));
};
export default function Canvas() {
	const [elements, setElements] = useState([]);
	const [elementType, setElementType] = useState("line");
	const [action, setAction] = useState("none");
	const [selectedElement, setSelectedElement] = useState(null);
	const [tool, setTool] = useState("line");

	useLayoutEffect(() => {
		const canvas = document.getElementById("canvas");
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);

		const roughCanvas = rough.canvas(canvas);

		elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
		console.log("layout effect");
	}, [elements]);

	const handleMouseDown = (event) => {
		const { clientX, clientY } = event;
		if (tool === "select") {
			const element = getElementAtPosition(elements, clientX, clientY);
			if(element){
				setSelectedElement(element);
				setAction("moving");
			}
			
		} else {
			const id = elements.length;
			const element = createElement(
				id,
				clientX,
				clientY,
				clientX,
				clientY,
				elementType
			);
			setElements((prevElements) => [...prevElements, element]);
			setAction("Drawing");
			console.log("down");
		}
	};

	const handleMouseMove = (event) => {
		if (action === "Drawing") {
			const { clientX, clientY } = event;
			const index = elements.length - 1;
			const { x1, y1 } = elements[index];
			const updatedElement = createElement(
				index,
				x1,
				y1,
				clientX,
				clientY,
				elementType
			);
			const elementsCopy = [...elements];
			elementsCopy[index] = updatedElement;
			setElements(elementsCopy);
			console.log("move");
		}else if(action === 'moving'){
			const {} = selectedElement;

		}
	};

	const handleMouseUp = (event) => {
		setAction("none");
		setSelectedElement(null);
	};

	return (
		<div>
			<div style={{ position: "fixed" }}>
				<input
					type="radio"
					id="select"
					checked={elementType === "select"}
					onChange={() => setElementType("free")}
				/>
				<label htmlFor="select">Free</label>
				<input
					type="radio"
					id="line"
					checked={elementType === "line"}
					onChange={() => setElementType("line")}
				/>
				<label htmlFor="line">Line</label>
				<input
					type="radio"
					id="rectangle"
					checked={elementType === "rectangle"}
					onChange={() => setElementType("rectangle")}
				/>
				<label htmlFor="rectangle">Rectangle</label>
			</div>
			<canvas
				id="canvas"
				width={window.innerWidth}
				height={window.innerHeight}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
			>
				Canvas
			</canvas>
		</div>
	);
}
