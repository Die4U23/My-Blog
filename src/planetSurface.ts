const radians = Math.PI / 180;
export const initialView = { longitude: 0, latitude: 16 };
export type PlanetView = typeof initialView;
// Cache the inverse orthographic projection. Rotation around the polar axis
// then needs only one wrapped texture lookup per pixel.
export function planetSurface(canvas: HTMLCanvasElement, textureUrl: string) {
  const ctx = canvas.getContext('2d');
  const size = matchMedia('(pointer: coarse)').matches ? 224 : 320;
  canvas.width = canvas.height = size;
  const frame = ctx?.createImageData(size, size);
  const pixels = frame && new Uint32Array(frame.data.buffer);
  const texels = new Int32Array(size * size);
  const width = 1024, height = 512;
  let texture: Uint32Array | undefined;
  let latitude = NaN;
  let current = initialView;
  function draw(view: PlanetView) {
    current = view;
    if (!ctx || !frame || !pixels || !texture) return;
    if (latitude !== view.latitude) {
      latitude = view.latitude;
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
    }
    const offset = Math.round(view.longitude / 360 * width);
    for (let i = 0; i < pixels.length; i++) {
      const uv = texels[i];
      pixels[i] = texture[(uv & -width) + ((uv + offset) & (width - 1))];
    }
    ctx.putImageData(frame, 0, 0);
  }
  const image = new Image();
  image.onload = () => {
    const map = document.createElement('canvas');
    map.width = width; map.height = height;
    const painter = map.getContext('2d');
    if (!painter) return;
    painter.drawImage(image, 0, 0, width, height);
    texture = new Uint32Array(painter.getImageData(0, 0, width, height).data.buffer);
    draw(current);
  };
  image.src = textureUrl;
  return { draw, dispose() { image.onload = null; } };
}
