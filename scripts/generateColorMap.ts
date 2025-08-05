import fs from "fs";
import ntc from "ntcjs";
import path from "path";

const colorNameMap: Record<string, string> = {};

ntc.names.forEach(([hex, name]) => {
  colorNameMap[hex.toLowerCase()] = name;
});

const outputPath = path.resolve(__dirname, "../src/color-name-map.json");
fs.writeFileSync(outputPath, JSON.stringify(colorNameMap, null, 2), "utf-8");

console.log(`Success: color-name-map.json generated at ${outputPath}`);
