"use client";

import { useRef, useState } from "react";
import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  Transformer,
  Group,
} from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";

type ShapeType = "line" | "rect" | "circle" | "group";

type ShapeData = {
  id: string;
  type: ShapeType;
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  stroke?: string;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  children?: ShapeData[];
  draggable: boolean;
};

export default function Draw() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [drawType, setDrawType] = useState<ShapeType>("line");
  const [newShape, setNewShape] = useState<ShapeData | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Start drawing a new shape
  function handleMouseDown(e: KonvaEventObject<MouseEvent>) {
    const stage = e.target.getStage();
    if (e.target == stage) {
      setSelectedIds([]);
      setDrawing(true);
    }
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;
    if (drawType === "line") {
      setNewShape({
        id: `shape_${Date.now()}`,
        type: "line",
        points: [pointer.x, pointer.y, pointer.x, pointer.y],
        stroke: "black",
        draggable: true,
      });
    } else if (drawType === "rect") {
      setNewShape({
        id: `shape_${Date.now()}`,
        type: "rect",
        x: pointer.x,
        y: pointer.y,
        width: 0,
        height: 0,
        stroke: "black",
        draggable: true,
      });
    } else if (drawType === "circle") {
      setNewShape({
        id: `shape_${Date.now()}`,
        type: "circle",
        x: pointer.x,
        y: pointer.y,
        radius: 0,
        stroke: "black",
        draggable: true,
      });
    }
  }

  // Drawing in progress
  function handleMouseMove(e: KonvaEventObject<MouseEvent>) {
    if (!drawing || !newShape) return;
    const stage = e.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;
    if (newShape.type === "line") {
      setNewShape({
        ...newShape,
        points: [
          newShape.points![0],
          newShape.points![1],
          pointer.x,
          pointer.y,
        ],
      });
    } else if (newShape.type === "rect") {
      setNewShape({
        ...newShape,
        width: pointer.x - (newShape.x || 0),
        height: pointer.y - (newShape.y || 0),
      });
    } else if (newShape.type === "circle") {
      const dx = pointer.x - (newShape.x || 0);
      const dy = pointer.y - (newShape.y || 0);
      setNewShape({ ...newShape, radius: Math.sqrt(dx * dx + dy * dy) });
    }
  }

  // Finish drawing
  function handleMouseUp() {
    if (!drawing || !newShape) return;
    setShapes((prev) => [...prev, newShape]);
    setNewShape(null);
    setDrawing(false);
  }

  // Multi-select with Shift or Ctrl/Cmd, single select otherwise
  function handleSelect(id: string, evt?: MouseEvent | TouchEvent) {
    if (
      evt &&
      (("ctrlKey" in evt && evt.ctrlKey) ||
        ("metaKey" in evt && evt.metaKey) ||
        ("shiftKey" in evt && evt.shiftKey))
    ) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  }

  // Update shape after transform
  function handleTransform(id: string, attrs: Partial<ShapeData>) {
    setShapes((prev) =>
      prev.map((shape) => (shape.id === id ? { ...shape, ...attrs } : shape))
    );
  }

  // Group selected shapes
  function handleGroup() {
    if (selectedIds.length < 2) return;
    setShapes((prev) => {
      const toGroup = prev.filter((shape) => selectedIds.includes(shape.id));
      const rest = prev.filter((shape) => !selectedIds.includes(shape.id));
      const groupChildren = toGroup.map((shape) => {
        return { ...shape, draggable: false };
      });
      const group: ShapeData = {
        id: `group_${Date.now()}`,
        type: "group",
        children: groupChildren,
        draggable: true,
      };
      return [...rest, group];
    });
    setSelectedIds([]);
  }

  // Delete selected shape
  function handleDelete() {
    if (!selectedIds.length) return;
    setShapes((prev) =>
      prev.filter((shape) => !selectedIds.includes(shape.id))
    );
    setSelectedIds([]);
  }

  // Export canvas as image
  function handleExport() {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = uri;
    link.click();
  }

  function renderShape(shape: ShapeData) {
    const isSelected = selectedIds.includes(shape.id);
    const commonProps = {
      id: shape.id,
      x: shape.x,
      y: shape.y,
      draggable: shape.draggable,
      onClick: (evt: KonvaEventObject<MouseEvent>) =>
        handleSelect(shape.id, evt.evt),
      onTap: (evt: KonvaEventObject<TouchEvent>) =>
        handleSelect(shape.id, evt.evt),
      onMouseEnter: () => {
        const container = stageRef.current?.container();
        if (container) container.style.cursor = "pointer";
      },
      onMouseLeave: () => {
        const container = stageRef.current?.container();
        if (container) container.style.cursor = "crosshair";
      },
      onDragEnd: (e: KonvaEventObject<DragEvent>) => {
        handleTransform(shape.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      },
      stroke: isSelected ? "#2563eb" : shape.stroke,
    };
    if (shape.type === "line") {
      return (
        <Line
          {...commonProps}
          key={shape.id}
          points={shape.points!}
          strokeWidth={2}
          onTransformEnd={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            handleTransform(shape.id, {
              points: shape.points!.map((p, i) =>
                i % 2 === 0 ? p * scaleX : p * scaleY
              ),
            });
          }}
        />
      );
    } else if (shape.type === "rect") {
      return (
        <Rect
          {...commonProps}
          key={shape.id}
          width={shape.width}
          height={shape.height}
          rotation={shape.rotation || 0}
          onTransformEnd={(e) => {
            const node = e.target;
            handleTransform(shape.id, {
              x: node.x(),
              y: node.y(),
              width: node.width() * node.scaleX(),
              height: node.height() * node.scaleY(),
              rotation: node.rotation(),
            });
            node.scaleX(1);
            node.scaleY(1);
          }}
        />
      );
    } else if (shape.type === "circle") {
      return (
        <Circle
          {...commonProps}
          key={shape.id}
          radius={shape.radius}
          rotation={shape.rotation || 0}
          onTransformEnd={(e) => {
            const node = e.target as Konva.Circle;
            handleTransform(shape.id, {
              x: node.x(),
              y: node.y(),
              radius: node.radius() * node.scaleX(),
              rotation: node.rotation(),
            });
            node.scaleX(1);
            node.scaleY(1);
          }}
        />
      );
    } else if (shape.type === "group" && shape.children) {
      // Render children recursively
      return (
        <Group
          {...commonProps}
          key={shape.id}
          width={shape.width}
          height={shape.height}
          rotation={shape.rotation || 0}
          onTransformEnd={(e) => {
            const node = e.target;
            handleTransform(shape.id, {
              x: node.x(),
              y: node.y(),
              width: node.width() * node.scaleX(),
              height: node.height() * node.scaleY(),
              rotation: node.rotation(),
            });
            node.scaleX(1);
            node.scaleY(1);
          }}
        >
          {shape.children.map((child) => {
            return renderShape(child);
          })}
        </Group>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2 mb-2">
        <button
          className={`px-2 py-1 border rounded ${
            drawType === "line" ? "bg-blue-200" : ""
          }`}
          onClick={() => setDrawType("line")}
        >
          Line
        </button>
        <button
          className={`px-2 py-1 border rounded ${
            drawType === "rect" ? "bg-blue-200" : ""
          }`}
          onClick={() => setDrawType("rect")}
        >
          Rectangle
        </button>
        <button
          className={`px-2 py-1 border rounded ${
            drawType === "circle" ? "bg-blue-200" : ""
          }`}
          onClick={() => setDrawType("circle")}
        >
          Circle
        </button>
        <button
          className="px-2 py-1 border rounded bg-yellow-200 disabled:opacity-50"
          onClick={handleGroup}
          disabled={selectedIds.length < 2}
        >
          Group
        </button>

        <button
          className="px-2 py-1 border rounded bg-green-200"
          onClick={handleExport}
        >
          Export PNG
        </button>
        <button
          className="px-2 py-1 border rounded bg-red-200 disabled:opacity-50"
          onClick={handleDelete}
          disabled={!selectedIds.length}
        >
          Delete
        </button>
      </div>
      <div className="border-2">
        <Stage
          ref={stageRef}
          width={window.innerWidth / 2}
          height={window.innerHeight / 2}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: "crosshair" }}
        >
          <Layer>
            {shapes.map((shape) => {
              return renderShape(shape);
            })}
            {/* Render shape being drawn */}
            {newShape && newShape.type === "line" && (
              <Line
                points={newShape.points!}
                stroke={newShape.stroke}
                strokeWidth={2}
              />
            )}
            {newShape && newShape.type === "rect" && (
              <Rect
                x={newShape.x}
                y={newShape.y}
                width={newShape.width}
                height={newShape.height}
                stroke={newShape.stroke}
              />
            )}
            {newShape && newShape.type === "circle" && (
              <Circle
                x={newShape.x}
                y={newShape.y}
                radius={newShape.radius}
                stroke={newShape.stroke}
              />
            )}
            {/* Transformer for selected shapes */}
            {selectedIds.length > 0 && (
              <Transformer
                enabledAnchors={(() => {
                  if (selectedIds.length === 1) {
                    const shape = shapes.find(
                      (shape) => shape.id === selectedIds[0]
                    );
                    if (shape?.type === "line") {
                      return ["top-left", "bottom-right"];
                    }
                  }
                })()}
                rotationSnaps={[0, 90, 180, 270]}
                rotationSnapTolerance={30}
                borderEnabled={false}
                nodes={(() => {
                  const stage = stageRef.current;
                  if (!stage) return [];
                  const layer = stage.getLayers()[0];
                  if (!layer) return [];
                  return selectedIds.map((id) =>
                    layer.findOne((n: Konva.Node) => n.attrs.id === id)
                  );
                })()}
              />
            )}
          </Layer>
        </Stage>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Click a shape to select and transform. Drag to move. Use buttons to
        switch draw mode or export.
      </div>
    </div>
  );
}
