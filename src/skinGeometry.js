import * as THREE from 'three';

/**
 * Creates a Minecraft cuboid geometry with custom UV coordinates
 * matching Minecraft Bedrock / Java 64x64 texture specifications.
 */
export function createMinecraftBoxGeometry(width, height, depth, uvRects, inflate = 0) {
  const w = width + inflate * 2;
  const h = height + inflate * 2;
  const d = depth + inflate * 2;

  const x0 = -w / 2;
  const x1 = w / 2;
  const y0 = -h / 2;
  const y1 = h / 2;
  const z0 = -d / 2;
  const z1 = d / 2;

  const positions = [];
  const normals = [];
  const uvs = [];

  function addQuad(pTL, pBL, pBR, pTR, norm, rect) {
    const u0 = rect.x / 64;
    const u1 = (rect.x + rect.w) / 64;
    const v0 = 1.0 - (rect.y / 64);
    const v1 = 1.0 - ((rect.y + rect.h) / 64);

    // Triangle 1: pTL, pBL, pTR
    positions.push(...pTL, ...pBL, ...pTR);
    normals.push(...norm, ...norm, ...norm);
    uvs.push(u0, v0, u0, v1, u1, v0);

    // Triangle 2: pTR, pBL, pBR
    positions.push(...pTR, ...pBL, ...pBR);
    normals.push(...norm, ...norm, ...norm);
    uvs.push(u1, v0, u0, v1, u1, v1);
  }

  // Right face (-X, normal: -1, 0, 0)
  addQuad(
    [x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1],
    [-1, 0, 0],
    uvRects.right
  );

  // Left face (+X, normal: 1, 0, 0)
  addQuad(
    [x1, y1, z1], [x1, y0, z1], [x1, y0, z0], [x1, y1, z0],
    [1, 0, 0],
    uvRects.left
  );

  // Top face (+Y, normal: 0, 1, 0)
  addQuad(
    [x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0],
    [0, 1, 0],
    uvRects.top
  );

  // Bottom face (-Y, normal: 0, -1, 0)
  addQuad(
    [x0, y0, z1], [x0, y0, z0], [x1, y0, z0], [x1, y0, z1],
    [0, -1, 0],
    uvRects.bottom
  );

  // Front face (+Z, normal: 0, 0, 1)
  addQuad(
    [x0, y1, z1], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1],
    [0, 0, 1],
    uvRects.front
  );

  // Back face (-Z, normal: 0, 0, -1)
  addQuad(
    [x1, y1, z0], [x1, y0, z0], [x0, y0, z0], [x0, y1, z0],
    [0, 0, -1],
    uvRects.back
  );

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  return geometry;
}

/**
 * Standard Minecraft UV layout builder from base (ox, oy) coordinates
 */
export function getMinecraftCuboidUVs(ox, oy, w, h, d) {
  return {
    top:    { x: ox + d,         y: oy,     w: w, h: d },
    bottom: { x: ox + d + w,     y: oy,     w: w, h: d },
    right:  { x: ox,             y: oy + d, w: d, h: h },
    front:  { x: ox + d,         y: oy + d, w: w, h: h },
    left:   { x: ox + d + w,     y: oy + d, w: d, h: h },
    back:   { x: ox + 2 * d + w, y: oy + d, w: w, h: h }
  };
}
