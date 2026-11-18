const radians = Math.PI / 180;
export const initialView = { longitude: 0, latitude: 16 };
export type PlanetView = typeof initialView;
const touchSize = 192;
const touchMapWidth = 512;
const touchTextures = new Map<string, Promise<Uint32Array>>();
let touchProjection: Int32Array | undefined;

async function readTexture(url: string, width: number) {
  const image = new Image();
  image.src = url;
  await image.decode();
  const map = document.createElement('canvas');
  map.width = width;
  map.height = width / 2;
  const ctx = map.getContext('2d')!;
  ctx.drawImage(image, 0, 0, map.width, map.height);
  return new Uint32Array(ctx.getImageData(0, 0, map.width, map.height).data.buffer);
}

function textureFor(url: string, touch: boolean) {
  if (!touch) return readTexture(url, 1024);
  let texture = touchTextures.get(url);
  if (!texture) {
    texture = readTexture(url, touchMapWidth).catch(error => {
      touchTextures.delete(url);
      throw error;
    });
    touchTextures.set(url, texture);
  }
  return texture;
}

// Horizontal touch gestures keep the same latitude across all six planets.
function project(size: number, width: number, latitude: number, texels: Int32Array = new Int32Array(size * size)) {
  const height = width / 2;
  const sin = Math.sin(latitude * radians), cos = Math.cos(latitude * radians);
  for (let row = 0; row < size; row++) {
    const y = (row + .5) / size * 2 - 1;
    for (let col = 0; col < size; col++) {
      const x = (col + .5) / size * 2 - 1;
      const z = Math.sqrt(Math.max(0, 1 - x*x - y*y));
      const u = .5 + Math.atan2(x, y*sin + z*cos) / (2*Math.PI);
      const v = .5 + Math.asin(Math.max(-1, Math.min(1, y*cos - z*sin))) / Math.PI;
      texels[row * size + col] = Math.min(height - 1, Math.floor(v * height)) * width + (Math.floor(u * width) & (width - 1));
    }
  }
  return texels;
}

export function planetSurface(canvas: HTMLCanvasElement, textureUrl: string) {
  const ctx = canvas.getContext('2d');
  const touch = matchMedia('(pointer: coarse)').matches;
  const size = touch ? touchSize : 320;
  const width = touch ? touchMapWidth : 1024;
  canvas.width = canvas.height = size;
  const frame = ctx?.createImageData(size, size);
  const pixels = frame && new Uint32Array(frame.data.buffer);
  let texels: Int32Array | undefined;
  let texture: Uint32Array | undefined;
  let latitude = NaN;
  let lastOffset = NaN;
  let disposed = false;
  let current = initialView;
  function draw(view: PlanetView) {
    current = view;
    if (!ctx || !frame || !pixels || !texture) return;
    const offset = Math.round(view.longitude / 360 * width);
    if (texels && latitude === view.latitude && lastOffset === offset) return;
    if (!texels || latitude !== view.latitude) {
      latitude = view.latitude;
      texels = touch && latitude === initialView.latitude
        ? (touchProjection ??= project(size, width, latitude))
        : project(size, width, latitude, texels === touchProjection ? undefined : texels);
    }
    lastOffset = offset;
    for (let i = 0; i < pixels.length; i++) {
      const uv = texels[i];
      pixels[i] = texture[(uv & -width) + ((uv + offset) & (width - 1))];
    }
    ctx.putImageData(frame, 0, 0);
  }
  textureFor(textureUrl, touch).then(data => {
    if (disposed) return;
    texture = data;
    draw(current);
  }, () => { /* The globe keeps its CSS texture if canvas decoding fails. */ });
  return { draw, dispose() { disposed = true; } };
}
