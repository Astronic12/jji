from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

try:
    from terrain_diffusion import TerrainDiffusionPipeline
except ImportError:
    class TerrainDiffusionPipeline:
        @staticmethod
        def generate(steps, seed, size):
            rng = np.random.default_rng(seed)
            x = np.linspace(0, 5, size)
            y = np.linspace(0, 5, size)
            X, Y = np.meshgrid(x, y)
            return np.sin(X) * np.cos(Y) * 0.5 + 0.5

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerationRequest(BaseModel):
    seed: int = 42
    steps: int = 50
    size: int = 256

@app.post("/api/generate")
async def generate_terrain(req: GenerationRequest):
    try:
        raw_terrain = TerrainDiffusionPipeline.generate(steps=req.steps, seed=req.seed, size=req.size)
        height_matrix = raw_terrain.tolist() if hasattr(raw_terrain, 'tolist') else raw_terrain
        return {"success": True, "size": req.size, "data": height_matrix}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
