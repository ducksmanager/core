/**
 * How many rows (tiers) of panels a page has, from Kumiko's panel boxes.
 *
 * Here rather than in apps/dumili, which is the only place that calls it in
 * anger, because `packages/api/scripts/measure-kumiko-accuracy.ts` scores it
 * against `inducks_storyversion.rowsperpage` and cannot reach across into an
 * app. A copy over there would be free to drift from what production sends,
 * which would quietly make the measurement meaningless. Depends on nothing, so
 * either side can import it without dragging a package graph along.
 */

/** A Kumiko panel box, as `aiKumikoResultPanel` stores it. */
export type PanelBox = { x: number; y: number; width: number; height: number };

export const getPanelRows = (panels: PanelBox[]): number => {
  if (!panels.length) {
    return 0;
  }

  const sortedPanels = [...panels].sort((a, b) => a.y - b.y);
  const rows: number[] = [sortedPanels[0].y];
  const tolerance = 5;
  for (let i = 0; i < sortedPanels.length; i++) {
    const panelY = sortedPanels[i].y;

    const belongsToExistingRow = rows.some(
      (rowY) => Math.abs(panelY - rowY) <= tolerance,
    );

    if (!belongsToExistingRow) {
      rows.push(panelY);
    }
  }

  return rows.length;
};
