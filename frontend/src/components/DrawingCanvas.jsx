import { useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { Eraser, Palette, RotateCcw } from 'lucide-react';

const DrawingCanvas = ({ onCanvasChange }) => {
  const stageRef = useRef();
  const [tool, setTool] = useState('pen');
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
  ];

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { 
      tool, 
      points: [pos.x, pos.y], 
      color: tool === 'eraser' ? '#FFFFFF' : color,
      strokeWidth: tool === 'eraser' ? brushSize * 2 : brushSize
    }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (onCanvasChange) {
      onCanvasChange();
    }
  };

  const clearCanvas = () => {
    setLines([]);
    if (onCanvasChange) {
      onCanvasChange();
    }
  };

  const exportCanvas = () => {
    if (stageRef.current) {
      return stageRef.current.toDataURL();
    }
    return null;
  };

  const exportBlob = (callback) => {
    if (stageRef.current) {
      stageRef.current.toBlob(callback);
    }
  };

  DrawingCanvas.exportCanvas = () => exportCanvas();
  DrawingCanvas.exportBlob = (callback) => exportBlob(callback);

  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg ${tool === 'pen' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <Palette className="h-5 w-5" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg ${tool === 'eraser' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <Eraser className="h-5 w-5" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Size:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-20"
          />
          <span className="text-sm w-8">{brushSize}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Color:</label>
          <div className="flex gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded border-2 ${color === c ? 'border-gray-400' : 'border-gray-200'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <Stage
          width={600}
          height={400}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
          className="bg-white cursor-crosshair"
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default DrawingCanvas;
