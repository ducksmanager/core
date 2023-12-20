export default interface Options {
  getBookcaseOptions: (username: string, callback: (value: {
    textures: {
      bookcase: string;
      bookshelf: string;
    };
    showAllCopies: boolean;
  }) => void) => void;

  setBookcaseOptions: (data: {
    textures: { bookcase: string; bookshelf: string };
    showAllCopies: boolean;
  }, callback: (value: string) => void) => void;
}
