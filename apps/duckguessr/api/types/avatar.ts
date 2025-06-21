export type Avatar = {
  character: string;
  restriction: {
    roundsWon: number;
  } | null;

  position: [number, number];
};

export const avatars: Avatar[] = [
  { character: "Huey", restriction: null, position: [206, 89] },
  { character: "Dewey", restriction: null, position: [331, 89] },
  { character: "Louie", restriction: null, position: [457, 90] },
  { character: "HDL's father", restriction: null, position: [229, 232] },
  { character: "Della Duck", restriction: null, position: [396, 232] },
  { character: "DD", restriction: null, position: [514, 235] },
  { character: "GL", restriction: null, position: [667, 234] },
  { character: "FE", restriction: null, position: [818, 236] },
  { character: "Whitewater Duck", restriction: null, position: [961, 239] },
  { character: "GU", restriction: null, position: [1143, 238] },
  // { character: 'Matilda McDuck', restriction: { roundsWon: 50 }, position: [92, 372] },
  // { character: 'US', restriction: { roundsWon: 100 }, position: [207, 371] },
  // { character: 'Hortense McDuck', restriction: { roundsWon: 50 }, position: [317, 370] },
];

export const avatarDiskDiameter = 102;
