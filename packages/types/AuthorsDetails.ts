export interface AuthorsDetails {
  [personcode: string]: {
    missingstorycount: number;
    storycount: number;
    fullname: string;
  };
}
