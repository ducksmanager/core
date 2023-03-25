import fs from "fs";

export const getNextAvailableFile = (prefix: string, extension: string) => {
  let i = 1;
  let filename;
  do {
    filename = `${prefix}_${i++}.${extension}`;
  } while (fs.existsSync(filename));

  return filename;
};
