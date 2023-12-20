export default interface Options {
  getBookcaseOrder: (username: string, callback: (value: {error?:string; publicationCodes: string[]}) => void) => void;

  setBookcaseOrder: (publicationCodes: string[], callback: (max: number|undefined) => void) => void;
}
