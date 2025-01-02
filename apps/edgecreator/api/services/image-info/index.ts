import axios from "axios";
import sizeOf from "image-size";

export default () => ({
  getImageInfo: async (targetUrl: string) => {
    const url = targetUrl.startsWith("https://res.cloudinary.com")
      ? targetUrl
      : `${process.env.EDGES_URL!}/${targetUrl}`;

    const response = await axios.get<string>(url);
    if (response.status === 200) {
      try {
        const buffer = Buffer.from(response.data);
        const dimensions = sizeOf(buffer) as {
          width: number;
          height: number;
        };
        const base64 = `data:${
          response.headers["Content-Type"]
        };base64,${buffer.toString()}`;
        return { results: { dimensions, base64, url } };
      } catch (e) {
        return {
          error: "Cloudinary error",
          errorDetails: `${targetUrl} : ${e as string}`,
        };
      }
    }
  },
});
