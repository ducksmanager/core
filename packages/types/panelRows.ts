// Shared so measure-kumiko-accuracy.ts scores the same code Dumili runs.

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
