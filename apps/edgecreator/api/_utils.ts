export const getSvgPath = (
  isExport: boolean,
  country: string,
  magazine: string,
  issuenumber: string
) =>
  `${process.cwd()}/../${process.env.EDGES_PATH}/${country}/gen/${
    isExport ? "" : "_"
  }${magazine}.${issuenumber}.svg`;
