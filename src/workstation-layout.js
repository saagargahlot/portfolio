export function fitWorkstation(width, height) {
  const margin = Math.min(32, width * 0.05);
  const scale = Math.max(0.1, Math.min(1.12,
    (width - margin * 2) / 940,
    (height - margin * 2) / 720,
  ));
  return {
    scale,
    x: width - margin - 650 * scale + (width >= 1100 ? 24 : 0),
    y: (height - 720 * scale) / 2 + 60 * scale,
  };
}

export function typingDelay(character, index) {
  if (character === '\n') return 165;
  if (/[;{}]/.test(character)) return 100;
  if (character === ' ') return 30;
  return index % 31 === 0 ? 220 : 14 + (index * 17 % 24);
}
