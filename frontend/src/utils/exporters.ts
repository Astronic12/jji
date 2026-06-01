export const exportToJSON = (matrix: number[][]) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ terrain: matrix }));
  triggerDownload(dataStr, "terrain_data.json");
};

export const exportToHeightmap = (matrix: number[][]) => {
  const size = matrix.length;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
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
  triggerDownload(canvas.toDataURL("image/png"), "terrain_heightmap.png");
};

export const exportToOBJ = (matrix: number[][], heightScale: number = 50) => {
  const size = matrix.length;
  let objText = "# Terrain Diffusion Generated OBJ\n";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      objText += `v ${x} ${matrix[y][x] * heightScale} ${y}\n`;
    }
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      objText += `vt ${x / (size - 1)} ${1 - y / (size - 1)}\n`;
    }
  }
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const v1 = y * size + x + 1;
      const v2 = y * size + (x + 1) + 1;
      const v3 = (y + 1) * size + x + 1;
      const v4 = (y + 1) * size + (x + 1) + 1;
      objText += `f ${v1}/${v1} ${v2}/${v2} ${v3}/${v3}\n`;
      objText += `f ${v2}/${v2} ${v4}/${v4} ${v3}/${v3}\n`;
    }
  }
  triggerDownload(URL.createObjectURL(new Blob([objText], { type: 'text/plain' })), "terrain_mesh.obj");
};

export const exportToFBX = (matrix: number[][], heightScale: number = 50) => {
  const size = matrix.length;
  const vertices: string[] = [];
  const indices: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      vertices.push(`${x},${matrix[y][x] * heightScale},${y}`);
    }
  }
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const i1 = y * size + x;
      const i2 = y * size + (x + 1);
      const i3 = (y + 1) * size + x;
      indices.push(`${i1},${i2},${-i3 - 1}`);
      indices.push(`${i2},${(y + 1) * size + (x + 1)},${-i3 - 1}`);
    }
  }
  const fbxText = `; FBX 7.4.0\nObjects: {\n  Geometry: 1001, "Geometry::Terrain", "Mesh" {\n    Vertices: *${vertices.length * 3} { a: ${vertices.join(",")} }\n    PolygonVertexIndex: *${indices.length * 3} { a: ${indices.join(",")} }\n  }\n}`;
  triggerDownload(URL.createObjectURL(new Blob([fbxText], { type: 'text/plain' })), "terrain_mesh.fbx");
};

const triggerDownload = (url: string, filename: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
};
