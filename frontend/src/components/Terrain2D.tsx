import { useEffect, useRef } from "react";

export default function Terrain2D({ matrix }: { matrix: number[][] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current || !matrix.length) return;
    const size = matrix.length;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const imgData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const val = Math.floor(matrix[y][x] * 255);
        const idx = (y * size + x) * 4;
        imgData.data[idx] = val;
        imgData.data[idx + 1] = val;
        imgData.data[idx + 2] = val;
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [matrix]);
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl p-4">
      <canvas ref={canvasRef} width={matrix.length || 256} height={matrix.length || 256} className="max-w-full max-h-full aspect-square object-contain border border-slate-700" />
    </div>
  );
}
