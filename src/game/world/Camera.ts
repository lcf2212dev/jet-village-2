export class Camera {
  x = 0;
  y = 0;
  width = 320;
  height = 180;
  private worldW = 1000;
  private worldH = 1000;

  setViewport(w: number, h: number): void {
    this.width = w;
    this.height = h;
  }

  setWorldSize(pixelW: number, pixelH: number): void {
    this.worldW = pixelW;
    this.worldH = pixelH;
  }

  centerOn(px: number, py: number): void {
    this.x = px - this.width / 2;
    this.y = py - this.height / 2;
    this.x = Math.max(0, Math.min(this.x, Math.max(0, this.worldW - this.width)));
    this.y = Math.max(0, Math.min(this.y, Math.max(0, this.worldH - this.height)));
  }
}
