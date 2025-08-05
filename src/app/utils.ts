// Convert HSL to Hex color string directly (compact form with embedded RGB logic)
export function hslToHex(h: number, s: number, l: number): string {
  // Calculate chroma adjustment factor based on saturation and lightness
  const a = s * Math.min(l, 1 - l);

  // Helper function to compute R, G, B channels based on hue offset
  const f = (n: number) => {
    // Convert hue to base-12 sector and wrap using modulo
    const k = (n + h / 30) % 12;

    // Determine channel brightness relative to chroma and lightness
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    // Convert to 0–255 scale and format as 2-digit hex
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };

  // Compose full hex color by calculating R (f(0)), G (f(8)), and B (f(4))
  return `${f(0)}${f(8)}${f(4)}`.toLowerCase();
}

// Convert hex color string to RGB tuple
export function hexToRgb(hex: string): string {
  // Remove the '#' if present
  hex = hex.replace(/^#/, "");

  // Support shorthand hex format (#abc)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (hex.length !== 6) {
    throw new Error("Invalid hex color");
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
}
