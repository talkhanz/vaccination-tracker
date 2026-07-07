// Resolve a stable avatar color for a child: their chosen color, or a
// deterministic palette color derived from their id so existing children
// (saved before colors existed) still look consistent.

import { Child } from '../data/types';
import { avatarColors } from '../theme/theme';

export function childColor(child: Pick<Child, 'id' | 'color'>): string {
  if (child.color) return child.color;
  let h = 0;
  for (let i = 0; i < child.id.length; i++) {
    h = (h * 31 + child.id.charCodeAt(i)) >>> 0;
  }
  return avatarColors[h % avatarColors.length];
}

/** Suggest the next color for a new child, avoiding recent siblings' colors. */
export function suggestColor(existing: Child[]): string {
  const used = new Set(existing.map((c) => childColor(c)));
  return avatarColors.find((c) => !used.has(c)) ?? avatarColors[existing.length % avatarColors.length];
}
