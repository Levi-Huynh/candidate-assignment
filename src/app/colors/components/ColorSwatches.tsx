"use client";

import { hexToRgb, hslToHex } from "@/app/utils";
import { useCallback, useEffect, useState } from "react";

import ntcColorsData from "@/color-name-map.json";
import { useToast } from "@/app/hooks/useToast";

const apiCache = new Map<string, string>(); // => {hex: name}
const ntcColorsMap: Record<string, string> = ntcColorsData; // => {hex: name}
type ColorSwatch = Map<string, string>; // => {name: `${rgbVal}-${hex}`}

// Hydrate the apiCache (which is reset on component mount)
// From localStorage data which is persisted through user sessions
if (typeof window !== "undefined" && apiCache.size === 0) {
  const stored = localStorage.getItem("colorNameCache");
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Record<string, string>;
      for (const [hex, name] of Object.entries(parsed)) {
        apiCache.set(hex, name);
      }
    } catch (e) {
      console.warn(
        `Error: ${e} failed to parse colorNameCache from localStorage`
      );
    }
  }
}

export default function ColorSwatches() {
  const [saturation, setSaturation] = useState<number>(0);
  const [lightness, setLight] = useState<number>(0);
  const [colorSwatches, setColorSwatches] = useState<ColorSwatch>(new Map());

  const [loading, setLoading] = useState<boolean>(false);
  const { showToast, Toast } = useToast();

  const fetchColor = useCallback(async (hex: string) => {
    const res = await fetch(
      `https://www.thecolorapi.com/id?hex=${hex.replace("#", "")}`
    );
    const json = await res.json();
    return [json.name.value, json.rgb.value];
  }, []);

  // 1. When saturation or lightness updates via an input change
  // 2. Iterate through each hue value (0-360) to create a hsl combination for the saturation/light pair
  // 3. Convert each hsl to a hex using the `hslToHex` util
  // 4. Map the hex to the closest color name using the preloaded ntc color map from color-name-map.json -OR- the apiCache
  // 5. If the hex color name is not in the ntc colors map or the apiCache, fetch the API using the hex string & update cache
  useEffect(() => {
    let cancelled = false;

    const getColorNames = async () => {
      const colorNameSet = new Set();
      setColorSwatches(new Map());

      // Iterate through every hue value 0-360
      for (let hue = 0; hue < 360; hue++) {
        // Convert the hsl to hex
        const hex = hslToHex(hue, saturation / 100, lightness / 100);

        // Lookup the color name using the ntc color map
        let name = ntcColorsMap[hex];
        let rgbVal = null;

        // If ntc color map does not have the hex, lookup the color name in apiCache
        if (!name && apiCache.has(hex)) {
          name = apiCache.get(hex)!;
        }

        // If name isn't in our api cache
        if (!name && !colorNameSet.has(name)) {
          setLoading(true);
          try {
            // Fetch the color api using the hex value
            [name, rgbVal] = await fetchColor(hex);

            // Update the apiCache
            apiCache.set(hex, name);

            // Update local storage
            const stored = localStorage.getItem("colorNameCache");
            const parsed = stored
              ? (JSON.parse(stored) as Record<string, string>)
              : {};
            parsed[hex] = name;
            localStorage.setItem("colorNameCache", JSON.stringify(parsed));
          } catch (e) {
            console.error(`Error: ${e}, failed to fetch name for ${hex}.`);
            showToast(`Error: ${e}, failed to fetch name for ${hex}.`);
            continue;
          }
        }

        // If the unique colorName set does not already have the color
        if (!cancelled && !colorNameSet.has(name)) {
          // Add the color to the set
          colorNameSet.add(name);
          // Update the color swatches with the new color swatch
          setColorSwatches((prev) => {
            const updated = new Map(prev);
            // Since our static NTC color list doesn't include rgb values,
            // If the color name wasnt fetched from the API, use a `hexToRgb` util to calculate the rgp value
            updated.set(name, `${rgbVal || hexToRgb(hex)}-${hex}`);
            return updated;
          });
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    };

    getColorNames();

    return () => {
      // Prevent async logic from updating state on an unmounted component
      cancelled = true;
    };
  }, [saturation, lightness, fetchColor, showToast]);

  return (
    <div className="mx-auto">
      <section className="flex flex-col items-center">
        <h2 className="text-6xl">Color Swatches Generator</h2>
        <span className="mb-10">
          Adjust the saturation & lightness using the range or number input.
        </span>
      </section>

      <section className="flex flex-col mt-10 mb-3 justify-evenly sm:items-center sm:flex-row">
        <section className="flex flex-col mb-4 gap-4">
          <label>Saturation: {saturation} </label>
          <input
            type="range"
            min={0}
            max={100}
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
          />
          <input
            type="number"
            min={0}
            max={100}
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="border border-white rounded p-1"
          />
        </section>

        <section className="flex flex-col mb-4 gap-4">
          <label>Lightness: {lightness} </label>
          <input
            type="range"
            min={0}
            max={100}
            value={lightness}
            onChange={(e) => setLight(Number(e.target.value))}
          />
          <input
            type="number"
            min={0}
            max={100}
            value={lightness}
            onChange={(e) => setLight(Number(e.target.value))}
            className="border border-white rounded p-1"
          />
        </section>
      </section>

      <h2 className="my-15 text-3xl items-center">
        {loading ? (
          <div>Looking Up Colors...</div>
        ) : (
          <div>Swatches Generated!</div>
        )}
      </h2>

      <section className="flex flex-col gap-10 flex-wrap sm:items-center sm:flex-row">
        {Toast}
        {Array.from(colorSwatches?.entries()).map(([colorName, v]) => {
          const [rgb, hex] = v.split("-");
          return (
            <div key={colorName}>
              <div
                style={{
                  backgroundColor: `#${hex}`,
                  width: "80px",
                  height: "80px",
                }}
              ></div>
              <div>{colorName}</div>
              <div>{rgb}</div>
            </div>
          );
        })}
        {loading && <div>Loading...</div>}
      </section>
    </div>
  );
}
