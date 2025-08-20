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
import { Button } from "./ui/button";
import { CircleIcon, LineSquiggle, RectangleHorizontal } from "lucide-react";
import useImage from "use-image";

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
  const [rotateImage] = useImage("/rotate-solid.svg");
  const stageRef = useRef<Konva.Stage | null>(null);
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [drawType, setDrawType] = useState<ShapeType>("line");
  const [newShape, setNewShape] = useState<ShapeData | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [guides, setGuides] = useState<
    | {
        snapPoint: number;
        orientation: string;
      }[]
    | null
  >(null);

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

  function resetShape() {
    setNewShape(null);
    setDrawing(false);
  }

  function handleMouseUp() {
    if (!drawing || !newShape) return;
    if (newShape.type == "rect" && Math.abs(newShape.width!) < 1) {
      resetShape();
      return;
    }
    if (newShape.type == "circle" && Math.abs(newShape.radius!) < 1) {
      resetShape();
      return;
    }
    if (newShape.type == "line" && newShape.points![0] == newShape.points![2]) {
      resetShape();
      return;
    }
    setShapes((prev) => [...prev, newShape]);
    resetShape();
  }

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

  function handleTransform(id: string, attrs: Partial<ShapeData>) {
    setShapes((prev) =>
      prev.map((shape) => (shape.id === id ? { ...shape, ...attrs } : shape))
    );
  }

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

  function handleDelete() {
    if (!selectedIds.length) return;
    setShapes((prev) =>
      prev.filter((shape) => !selectedIds.includes(shape.id))
    );
    setSelectedIds([]);
  }

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
        if (container) container.style.cursor = "move";
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

  function getSnapPoints(node: Konva.Node) {
    const stageWidth = stageRef.current!.width();
    const stageHeight = stageRef.current!.height();
    const vertical = [0, stageWidth / 2, stageWidth];
    const horizontal = [0, stageHeight / 2, stageHeight];
    const stageItems = stageRef.current!.getChildren()[0].getChildren();
    let guideItems = stageItems.filter((item) => {
      return item.attrs.id != node.attrs.id;
    });
    if (node.getClassName() == "Transformer") {
      const transformer = node as Konva.Transformer;
      guideItems = guideItems.filter((item) => {
        return transformer.nodes().includes(item) == false;
      });
    }
    guideItems.forEach((guideItem) => {
      if (guideItem.attrs.id == undefined) return;
      const box = guideItem.getClientRect();
      vertical.push(box.x, box.x + box.width, box.x + box.width / 2);
      horizontal.push(box.y, box.y + box.height, box.y + box.height / 2);
    });
    return {
      vertical,
      horizontal,
    };
  }

  function getObjectSnapTriggers(node: Konva.Node) {
    const box = node.getClientRect();
    const absPos = node.getAbsolutePosition();
    return {
      vertical: [
        {
          trigger: Math.round(box.x),
          offset: Math.round(absPos.x - box.x),
        },

        {
          trigger: Math.round(box.x + box.width / 2),
          offset: Math.round(absPos.x - box.x - box.width / 2),
        },
        {
          trigger: Math.round(box.x + box.width),
          offset: Math.round(absPos.x - box.x - box.width),
        },
      ],
      horizontal: [
        {
          trigger: Math.round(box.y),
          offset: Math.round(absPos.y - box.y),
        },

        {
          trigger: Math.round(box.y + box.height / 2),
          offset: Math.round(absPos.y - box.y - box.height / 2),
        },
        {
          trigger: Math.round(box.y + box.height),
          offset: Math.round(absPos.y - box.y - box.height),
        },
      ],
    };
  }

  function getSnapGuides(
    snapPoints: { vertical: number[]; horizontal: number[] },
    shapeTriggerPoints: {
      vertical: { trigger: number; offset: number }[];
      horizontal: { trigger: number; offset: number }[];
    }
  ) {
    const guidelineOffset = 5;
    const verticalSnapPoints: {
      snapPoint: number;
      diff: number;
      offset: number;
    }[] = [];
    const horizontalSnapPoints: {
      snapPoint: number;
      diff: number;
      offset: number;
    }[] = [];

    snapPoints.vertical.forEach((snapPoint) => {
      shapeTriggerPoints.vertical.forEach((triggerPoint) => {
        const diff = Math.abs(snapPoint - triggerPoint.trigger);
        if (diff < guidelineOffset) {
          verticalSnapPoints.push({
            snapPoint: snapPoint,
            diff: diff,
            offset: triggerPoint.offset,
          });
        }
      });
    });

    snapPoints.horizontal.forEach((snapPoint) => {
      shapeTriggerPoints.horizontal.forEach((triggerPoint) => {
        const diff = Math.abs(snapPoint - triggerPoint.trigger);
        if (diff < guidelineOffset) {
          horizontalSnapPoints.push({
            snapPoint: snapPoint,
            diff: diff,
            offset: triggerPoint.offset,
          });
        }
      });
    });

    const guides = [];

    const minVertSnapPoint = verticalSnapPoints.sort(
      (a, b) => a.diff - b.diff
    )[0];
    const minHorSnapPoint = horizontalSnapPoints.sort(
      (a, b) => a.diff - b.diff
    )[0];

    if (minVertSnapPoint) {
      guides.push({
        snapPoint: minVertSnapPoint.snapPoint,
        offset: minVertSnapPoint.offset,
        orientation: "vertical",
      });
    }

    if (minHorSnapPoint) {
      guides.push({
        snapPoint: minHorSnapPoint.snapPoint,
        offset: minHorSnapPoint.offset,
        orientation: "horizontal",
      });
    }

    return guides;
  }

  return (
    <div className="flex flex-col justify-end items-center h-screen pb-2">
      <div
        className="flex justify-center items-center absolute w-full h-[90vh] overflow-auto top-5 left-0 border-2"
        style={{ scrollbarWidth: "none" }}
      >
        <Stage
          ref={stageRef}
          width={3000}
          height={3000}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: "crosshair" }}
        >
          <Layer
            onDragMove={(e) => {
              setGuides(null);
              const snapPoints = getSnapPoints(e.target);
              const objectTriggerPoints = getObjectSnapTriggers(e.target);
              const guides = getSnapGuides(snapPoints, objectTriggerPoints);
              if (!guides.length) return;
              setGuides(guides);
              const absPos = e.target.getAbsolutePosition();
              guides.forEach((guide) => {
                switch (guide.orientation) {
                  case "vertical": {
                    absPos.x = guide.snapPoint + guide.offset;
                    break;
                  }
                  case "horizontal": {
                    absPos.y = guide.snapPoint + guide.offset;
                    break;
                  }
                }
              });
              e.target.absolutePosition(absPos);
            }}
            onDragEnd={() => {
              setGuides(null);
            }}
          >
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
            {guides?.map((guide, index) => {
              return (
                <Line
                  key={index}
                  stroke="#000"
                  strokeWidth={1}
                  points={
                    guide.orientation == "horizontal"
                      ? [-6000, 0, 6000, 0]
                      : [0, -6000, 0, 6000]
                  }
                  x={guide.orientation == "horizontal" ? 0 : guide.snapPoint}
                  y={guide.orientation == "vertical" ? 0 : guide.snapPoint}
                />
              );
            })}
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
                anchorStyleFunc={(anchor) => {
                  if (anchor.hasName("rotater")) {
                    if (rotateImage) {
                      anchor.fillPriority("pattern");
                      anchor.fillPatternImage(rotateImage);
                      anchor.strokeEnabled(false);
                      anchor.scale({ x: 2, y: 2 });
                      anchor.fillPatternScaleX(
                        anchor.width() / rotateImage.width
                      );
                      anchor.fillPatternScaleY(
                        anchor.height() / rotateImage.height
                      );
                      anchor.fillPatternRepeat("no-repeat");
                    }
                  }
                }}
                rotateAnchorCursor="move"
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
      <div className="z-10 flex gap-2 w-full justify-center">
        <Button
          className={
            drawType === "line"
              ? "bg-red-500 hover:bg-red-500"
              : "hover:bg-red-500"
          }
          onClick={() => setDrawType("line")}
        >
          <LineSquiggle />
        </Button>
        <Button
          className={
            drawType === "rect"
              ? "bg-blue-500 hover:bg-blue-500"
              : "hover:bg-blue-500"
          }
          onClick={() => setDrawType("rect")}
        >
          <RectangleHorizontal />
        </Button>
        <Button
          className={
            drawType === "circle"
              ? "bg-green-500 hover:bg-green-500"
              : "hover:bg-green-500"
          }
          onClick={() => setDrawType("circle")}
        >
          <CircleIcon />
        </Button>
        <Button onClick={handleGroup} disabled={selectedIds.length < 2}>
          Group
        </Button>

        <Button onClick={handleExport}>Export PNG</Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={!selectedIds.length}
        >
          Delete
        </Button>
      </div>
      <div className="z-10 mt-2 text-xs text-center text-gray-500">
        Click a shape to select and transform. Drag to move. Use buttons to
        switch draw mode or export.
      </div>
    </div>
  );
}
