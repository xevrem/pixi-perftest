import * as PIXI from "pixi.js";
import Stats from "stats.js";
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const bgRotateURL = new URL(
  "assets/bg_rotate.jpeg",
  import.meta.url
).toString();

const bgSceneRotateURL = new URL(
  "assets/bg_scene_rotate.jpeg",
  import.meta.url
).toString();

const bgDisplacementURL = new URL(
  "assets/bg_displacement.jpeg",
  import.meta.url
).toString();

const NUM_TRIS = 10000;
const WIDTH = 1280;
const HEIGHT = 720;
const HALF_WIDTH = WIDTH / 2;
const HALF_HEIGHT = HEIGHT / 2;
const MAX = HEIGHT / 2;
const TWO_PI = Math.PI * 2;
const DEG_TO_RAD = TWO_PI / 360;
const ANGULAR_SPACING = 360/7;

export default run = () => {
  console.log("running app");
  console.log("URLs:", {
    bgRotateURL,
    bgSceneRotateURL,
    bgDisplacementURL,
  });
  const app = new PIXI.Application({
    width: WIDTH,
    height: HEIGHT,
  });
  document.body.appendChild(app.view);

  const geometry = new PIXI.Geometry()
    .addAttribute(
      "aVertexPosition", // the attribute name
      [
        -10,
        -10, // x, y
        10,
        -10, // x, y
        10,
        10,
        -10,
        10,
      ], // x, y
      2
    ) // the size of the attribute
    .addAttribute(
      "aUvs", // the attribute name
      [
        0,
        0, // u, v
        1,
        0, // u, v
        1,
        1,
        0,
        1,
      ], // u, v
      2
    )
    .addIndex([0, 1, 2, 0, 2, 3])
    .interleave(); // the size of the attribute
  geometry.instanced = true;
  geometry.instanceCount = NUM_TRIS;

  const positionSize = 2;
  // const uvSize = 2;
  const buffer = new PIXI.Buffer(new Float32Array(NUM_TRIS * positionSize));

  // instance position
  geometry.addAttribute(
    "aIPos",
    buffer,
    positionSize,
    false,
    PIXI.TYPES.FLOAT,
    4 * positionSize,
    0,
    true
  );


  for (let i = NUM_TRIS; i--; ) {
    const instanceOffset = i * positionSize;

    const angle = Math.random() * i * ANGULAR_SPACING * DEG_TO_RAD;
    buffer.data[instanceOffset + 0] = Math.sin(angle) * Math.random() * MAX;
    buffer.data[instanceOffset + 1] = Math.cos(angle) * Math.random() * MAX;
  }

  const program = PIXI.Program.from(
    `

    precision mediump float;

    attribute vec2 aVertexPosition;
    attribute vec2 aUvs;
    attribute vec2 aIPos;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vUvs;

    void main() {

        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition + aIPos, 1.0)).xy, 0.0, 1.0);

    }`,

    `precision mediump float;

    varying vec2 vUvs;

    uniform sampler2D uSamplerTexture;

    void main() {

        gl_FragColor = texture2D(uSamplerTexture, vUvs);
    }

`
  );

  const makeTriangle = (url) => {
    const triangle = new PIXI.Mesh(
      geometry,
      new PIXI.Shader(program, {
        uSamplerTexture: PIXI.Texture.from(url),
      })
    );
    return triangle;
  };

  const numTris = 10;
  const tris = [];
  const tri = makeTriangle(bgRotateURL);
  tri.position.set(HALF_WIDTH, HALF_HEIGHT);
  tris.push(tri);
  app.stage.addChild(tri);

  stats.begin();
  app.ticker.add((delta) => {
    stats.end();
    // for (let i = NUM_TRIS; i--; ) {
    //   const instanceOffset = i * positionSize;

    //   const angle = Math.random() * twoPi;
    //   geometry.buffers[2].data[instanceOffset + 0] += Math.random() * 5 - 2.5;
    //   geometry.buffers[2].data[instanceOffset + 1] += Math.random() * 5 - 2.5;
    // }
    tri.rotation += 0.001 * delta;
    stats.begin();
  });

  window.tri = tri;
  window.app = app;
};
