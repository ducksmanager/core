export interface MedalPoints {
  [userId: number]: Record<
    "edge_photographer" | "edge_designer" | "duckhunter",
    number
  >;
}
