const MM_PER_PT = 0.352778;

export interface FitTextResult {
  text: string;
  truncated: boolean;
  lines: number;
}

function emFor(ch: string): number {
  if (ch === " " || ch === "\n") return 0.33;
  if (ch === "i" || ch === "l" || ch === "I" || ch === "j" || ch === "." || ch === "," || ch === "'") return 0.28;
  if (ch === "m" || ch === "w" || ch === "M" || ch === "W") return 0.84;
  if (ch === "—") return 1;
  return 0.52;
}

export function measureMm(text: string, fontPt: number): number {
  const em = fontPt * MM_PER_PT;
  let width = 0;
  for (const ch of text) width += em * emFor(ch);
  return width;
}

function collapse(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function fitLine(input: string, maxWidthMm: number, fontPt: number, maxChars: number): FitTextResult {
  const clean = collapse(input);
  const chars = [...clean];
  const capped = chars.slice(0, Math.max(0, maxChars)).join("");
  const truncatedByChars = chars.length > maxChars;
  if (capped.length === 0) return { text: "", truncated: false, lines: 0 };
  if (measureMm(capped, fontPt) <= maxWidthMm) {
    return { text: capped, truncated: truncatedByChars, lines: 1 };
  }
  const ellipsis = "…";
  let kept = "";
  for (const ch of capped) {
    const next = kept + ch;
    if (measureMm(next + ellipsis, fontPt) > maxWidthMm) break;
    kept = next;
  }
  if (kept.length === 0) return { text: "", truncated: true, lines: 0 };
  return { text: `${kept}${ellipsis}`, truncated: true, lines: 1 };
}

export function fitBlock(
  input: string,
  maxWidthMm: number,
  maxHeightMm: number,
  fontPt: number,
  lineHeight: number,
  maxChars: number,
): FitTextResult {
  const clean = collapse(input);
  const chars = [...clean];
  const capped = chars.slice(0, Math.max(0, maxChars)).join("");
  const truncatedByChars = chars.length > maxChars;
  if (capped.length === 0) return { text: "", truncated: false, lines: 0 };

  const lineMm = fontPt * MM_PER_PT * lineHeight;
  const maxLines = Math.max(1, Math.floor(maxHeightMm / lineMm));
  const words = capped.split(" ");
  const lines: string[] = [];
  let current = "";

  const pushWord = (word: string): boolean => {
    const candidate = current.length === 0 ? word : `${current} ${word}`;
    if (measureMm(candidate, fontPt) <= maxWidthMm) {
      current = candidate;
      return true;
    }
    if (current.length > 0) {
      lines.push(current);
      current = "";
      if (lines.length >= maxLines) return false;
    }
    if (measureMm(word, fontPt) <= maxWidthMm) {
      current = word;
      return true;
    }
    let slice = "";
    for (const ch of word) {
      if (measureMm(slice + ch, fontPt) > maxWidthMm) break;
      slice += ch;
    }
    if (slice.length === 0) return false;
    lines.push(slice);
    current = "";
    return lines.length < maxLines;
  };

  let consumed = 0;
  for (const word of words) {
    const before = lines.length;
    const ok = pushWord(word);
    consumed += word.length + 1;
    if (!ok) {
      if (lines.length === before && current.length > 0 && lines.length < maxLines) lines.push(current);
      const room = lines.length > 0 ? lines.length - 1 : 0;
      const last = lines[room] ?? "";
      const ellipsis = "…";
      let trimmed = last;
      while (trimmed.length > 0 && measureMm(trimmed + ellipsis, fontPt) > maxWidthMm) {
        trimmed = trimmed.slice(0, -1);
      }
      lines[room] = trimmed.length > 0 ? `${trimmed}${ellipsis}` : ellipsis;
      return { text: lines.filter(Boolean).join("\n"), truncated: true, lines: lines.filter(Boolean).length };
    }
  }
  if (current.length > 0 && lines.length < maxLines) lines.push(current);
  const text = lines.join("\n");
  const truncated = truncatedByChars || consumed < capped.length + 1;
  return { text, truncated, lines: lines.length };
}
