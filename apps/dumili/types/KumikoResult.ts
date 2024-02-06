export type Boundaries = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type KumikoResult = {
  filename: string;
  size: number[];
  background: string;
  gutters: number[];
  panels: Boundaries[];
};
