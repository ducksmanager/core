export type Boundaries = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type KumikoResults = {
  filename: string;
  size: [number, number];
  background: string;
  gutters: [number, number];
  panels: Boundaries[];
}[];
