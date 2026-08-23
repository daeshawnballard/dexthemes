import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { inflateSync } from "node:zlib";

function decodeRgbaPng(png) {
  assert.deepEqual(png.subarray(0, 8), Buffer.from("89504e470d0a1a0a", "hex"));
  const chunks = [];
  let offset = 8;
  let width;
  let height;

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      assert.deepEqual([...data.subarray(8, 13)], [8, 6, 0, 0, 0], "must stay 8-bit RGBA");
    }
    if (type === "IDAT") chunks.push(data);
    offset += length + 12;
  }

  const stride = width * 4;
  const scanlines = inflateSync(Buffer.concat(chunks));
  const pixels = Buffer.alloc(stride * height);
  let previous = Buffer.alloc(stride);
  for (let row = 0; row < height; row += 1) {
    const start = row * (stride + 1);
    const filter = scanlines[start];
    const current = pixels.subarray(row * stride, (row + 1) * stride);
    for (let column = 0; column < stride; column += 1) {
      const value = scanlines[start + 1 + column];
      const left = column >= 4 ? current[column - 4] : 0;
      const up = previous[column];
      const upLeft = column >= 4 ? previous[column - 4] : 0;
      if (filter === 0) current[column] = value;
      if (filter === 1) current[column] = (value + left) & 0xff;
      if (filter === 2) current[column] = (value + up) & 0xff;
      if (filter === 3) current[column] = (value + Math.floor((left + up) / 2)) & 0xff;
      if (filter === 4) {
        const prediction = left + up - upLeft;
        const distances = [Math.abs(prediction - left), Math.abs(prediction - up), Math.abs(prediction - upLeft)];
        current[column] = (value + [left, up, upLeft][distances.indexOf(Math.min(...distances))]) & 0xff;
      }
      assert.ok(filter <= 4, `unsupported PNG filter ${filter}`);
    }
    previous = current;
  }
  return { width, height, pixels };
}

test("the public OAuth/PWA mark keeps transparent corners", async () => {
  const image = decodeRgbaPng(await readFile(new URL("../public/icon-192.png", import.meta.url)));
  assert.deepEqual([image.width, image.height], [192, 192]);
  const alphaAt = (x, y) => image.pixels[(y * image.width + x) * 4 + 3];

  for (const [x, y] of [[0, 0], [191, 0], [0, 191], [191, 191]]) {
    assert.equal(alphaAt(x, y), 0, `corner (${x}, ${y}) must remain transparent`);
  }
  assert.equal(alphaAt(96, 96), 255, "the approved mark must remain opaque at its center");
  assert.ok(image.pixels.some((_, index) => index % 4 === 3 && image.pixels[index] > 0 && image.pixels[index] < 255), "rounded edge must retain alpha antialiasing");
});
