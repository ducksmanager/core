export const getUrl = (path: string) =>
  `${import.meta.env.VITE_CLOUDINARY_URL_ROOT}${path}`;
