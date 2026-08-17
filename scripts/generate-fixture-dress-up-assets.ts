import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import {
  backgroundAssets,
  dressUpAssets,
  productionAssets,
  type DressUpAsset,
} from "../src/features/dress-up/catalog";

const root = path.join(process.cwd(), "public");
const backgroundColors = [
  ["#a9d8ef", "#f9f0d9"],
  ["#b8e6d1", "#f6e9ca"],
  ["#f7c9a9", "#fde9d4"],
  ["#8ec7db", "#d7efd6"],
  ["#2f4778", "#d985a2"],
];
const itemColors = ["#f07782", "#6f76c9", "#f2a04d", "#61b29a", "#c676ae"];

function absolute(urlPath: string) {
  return path.join(root, urlPath.replace(/^\//, ""));
}

async function writeSvg(
  urlPath: string,
  svg: string,
  format: "webp" | "png" = "webp",
) {
  const destination = absolute(urlPath);
  await mkdir(path.dirname(destination), { recursive: true });
  const image = sharp(Buffer.from(svg));
  if (format === "png") await image.png().toFile(destination);
  else await image.webp({ quality: 88 }).toFile(destination);
}

function backgroundSvg(index: number) {
  const [top, bottom] = backgroundColors[index % backgroundColors.length]!;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600">
    <defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
    <rect width="1200" height="1600" fill="url(#sky)"/>
    <circle cx="1030" cy="180" r="112" fill="#fff7d5" opacity=".82"/>
    <path d="M0 1180 Q220 980 430 1180 T850 1160 T1200 1110 V1600 H0Z" fill="#ffffff" opacity=".34"/>
    <path d="M0 1310 Q240 1150 520 1320 T1200 1250 V1600 H0Z" fill="#ffffff" opacity=".42"/>
    <g fill="#fff" opacity=".56"><circle cx="170" cy="260" r="18"/><circle cx="220" cy="230" r="30"/><circle cx="270" cy="258" r="22"/></g>
  </svg>`;
}

function characterBaseSvg(character: "character-a" | "character-b") {
  const x = character === "character-a" ? 390 : 810;
  const skin = character === "character-a" ? "#d88d69" : "#d39a7d";
  const hair = character === "character-a" ? "#30334f" : "#55394a";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600">
    <ellipse cx="${x}" cy="1450" rx="190" ry="45" fill="#3c5570" opacity=".20"/>
    <circle cx="${x}" cy="450" r="104" fill="${skin}"/>
    <path d="M${x - 118} 455 Q${x - 90} 280 ${x} 300 Q${x + 112} 292 ${x + 125} 455 Q${x + 65} 380 ${x} 390 Q${x - 65} 380 ${x - 118} 455Z" fill="${hair}"/>
    <rect x="${x - 22}" y="530" width="44" height="74" rx="20" fill="${skin}"/>
    <path d="M${x - 138} 610 Q${x} 555 ${x + 138} 610 L${x + 182} 1030 H${x - 182}Z" fill="${skin}"/>
    <path d="M${x - 118} 1000 H${x - 22} L${x - 36} 1368 H${x - 140}Z M${x + 22} 1000 H${x + 118} L${x + 140} 1368 H${x + 36}Z" fill="${skin}"/>
    <path d="M${x - 155} 1360 H${x - 26} V1410 H${x - 175}Z M${x + 26} 1360 H${x + 155} L${x + 175} 1410 H${x + 26}Z" fill="#f7f3ea"/>
  </svg>`;
}

function itemSvg(asset: DressUpAsset, index: number) {
  const x = asset.characterId === "character-a" ? 390 : 810;
  const color = itemColors[index % itemColors.length]!;
  const stroke = "#3e435d";
  const common = `fill="${color}" stroke="${stroke}" stroke-width="12" stroke-linejoin="round"`;
  const shape = (() => {
    switch (asset.category) {
      case "hair":
        return `<path d="M${x - 132} 470 Q${x - 150} 268 ${x} 255 Q${x + 152} 268 ${x + 132} 470 L${x + 86} 430 Q${x} 382 ${x - 86} 430Z" ${common}/>`;
      case "top":
        return `<path d="M${x - 162} 610 L${x - 240} 690 L${x - 154} 800 L${x - 126} 1000 H${x + 126} L${x + 154} 800 L${x + 240} 690 L${x + 162} 610 Q${x} 665 ${x - 162} 610Z" ${common}/>`;
      case "bottom":
        return `<path d="M${x - 138} 965 H${x + 138} L${x + 118} 1260 H${x + 28} L${x} 1080 L${x - 28} 1260 H${x - 118}Z" ${common}/>`;
      case "one-piece":
        return `<path d="M${x - 162} 612 Q${x} 665 ${x + 162} 612 L${x + 138} 1010 L${x + 210} 1245 H${x - 210} L${x - 138} 1010Z" ${common}/>`;
      case "shoes":
        return `<path d="M${x - 170} 1360 H${x - 22} V1428 H${x - 205} Q${x - 205} 1384 ${x - 170} 1360Z M${x + 22} 1360 H${x + 170} Q${x + 205} 1384 ${x + 205} 1428 H${x + 22}Z" ${common}/>`;
      case "accessory":
        return `<path d="M${x + 112} 720 Q${x + 240} 780 ${x + 170} 1010 H${x + 54} Q${x - 8} 820 ${x + 112} 720Z" ${common}/><circle cx="${x + 112}" cy="780" r="24" fill="#fff7d5"/>`;
      default:
        return "";
    }
  })();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600">${shape}</svg>`;
}

async function createThumbnail(
  sourcePath: string,
  targetPath: string,
  background: boolean,
) {
  const destination = absolute(targetPath);
  await mkdir(path.dirname(destination), { recursive: true });
  await sharp(absolute(sourcePath))
    .resize(background ? 320 : 180, background ? 240 : 240, {
      fit: background ? "cover" : "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 82 })
    .toFile(destination);
}

async function main() {
  for (const [index, asset] of backgroundAssets.entries()) {
    await writeSvg(asset.assetSrcs[0]!, backgroundSvg(index));
    await createThumbnail(asset.assetSrcs[0]!, asset.iconSrc, true);
  }

  await writeSvg(
    productionAssets.characterBases[0].path,
    characterBaseSvg("character-a"),
  );
  await writeSvg(
    productionAssets.characterBases[1].path,
    characterBaseSvg("character-b"),
  );
  await writeSvg(
    productionAssets.watermarkPath,
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600"><text x="600" y="1525" text-anchor="middle" font-family="sans-serif" font-size="30" letter-spacing="9" fill="#ffffff" opacity=".72">WHITE CHORUS</text></svg>`,
    "png",
  );

  for (const [index, asset] of dressUpAssets.entries()) {
    if (asset.category === "background") continue;
    if (asset.iconPresentation === "framed-square") continue;
    await writeSvg(asset.assetSrcs[0]!, itemSvg(asset, index));
    await createThumbnail(asset.assetSrcs[0]!, asset.iconSrc, false);
  }

  console.log("Generated fixture dress-up assets.");
}

void main();
