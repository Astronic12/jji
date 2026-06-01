"use client";
import { useState } from "react";
import Terrain2D from "@/components/Terrain2D";
import Terrain3D from "@/components/Terrain3D";
import { exportToJSON, exportToHeightmap, exportToOBJ, exportToFBX } from "@/utils/exporters";
import { Layers, Cuboid as Cube, Sliders, Download, RefreshCw } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"2d" | "3d">("3d");
  const [seed, setSeed] = useState<number>(42);
  const [steps, setSteps] = useState<number>(50);
  const [size, setSize] = useState<number>(256);
  const [heightScale, setHeightScale] = useState<number>(40);
  const [loading, setLoading] = useState<boolean>(false);
  const [terrainMatrix, setTerrainMatrix] = useState<number[][]>(() => Array(256).fill(0).map(() => Array(256).fill(0.3)));

  const generateTerrain = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed, steps, size }),
      });
      const result = await response.json();
      if (result.success) setTerrainMatrix(result.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <main className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <section className="w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Terrain Diffusion Studio</h1>
            <p className="text-xs text-slate-400 mt-1">Generative diffusion pipeline</p>
          </div>
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Sliders size={16} /> Configurations</h2>
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Random Seed</label>
              <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Diffusion Steps ({steps})</label>
              <input type="range" min="10" max="150" value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="w-full accent-green-500" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Resolution</label>
              <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm">
                <option value={128}>128 x 128</option>
                <option value={256}>256 x 256</option>
                <option value={512}>512 x 512</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">3D Amplitude ({heightScale})</label>
              <input type="range" min="5" max="120" value={heightScale} onChange={(e) => setHeightScale(Number(e.target.value))} className="w-full accent-green-500" />
            </div>
          </div>
          <button onClick={generateTerrain} disabled={loading} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-800 font-medium py-2.5 rounded flex items-center justify-center gap-2">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> {loading ? "Synthesizing..." : "Generate Terrain"}
          </button>
        </div>
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Download size={16} /> Export Options</h2>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => exportToHeightmap(terrainMatrix)} className="bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded border border-slate-700">Heightmap</button>
            <button onClick={() => exportToJSON(terrainMatrix)} className="bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded border border-slate-700">JSON Raw</button>
            <button onClick={() => exportToOBJ(terrainMatrix, heightScale)} className="bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded border border-slate-700">OBJ Mesh</button>
            <button onClick={() => exportToFBX(terrainMatrix, heightScale)} className="bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded border border-slate-700">FBX Mesh</button>
          </div>
        </div>
      </section>
      <section className="flex-1 p-6 flex flex-col space-y-4">
        <div className="flex bg-slate-900 self-start p-1 rounded-lg border border-slate-800">
          <button onClick={() => setActiveTab("2d")} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === "2d" ? "bg-slate-800 text-green-400" : "text-slate-400"}`}><Layers size={16} /> 2D View</button>
          <button onClick={() => setActiveTab("3d")} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === "3d" ? "bg-slate-800 text-green-400" : "text-slate-400"}`}><Cube size={16} /> 3D View</button>
        </div>
        <div className="flex-1 min-h-0 relative">
          {activeTab === "2d" ? <Terrain2D matrix={terrainMatrix} /> : <Terrain3D matrix={terrainMatrix} heightScale={heightScale} />}
        </div>
      </section>
    </main>
  );
}
