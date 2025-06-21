export const getUrl = (path: string) =>
  `${import.meta.env.CLOUDINARY_URL_ROOT}${path}`;
