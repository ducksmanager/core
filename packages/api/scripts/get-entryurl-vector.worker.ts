import { parentPort, workerData } from "worker_threads";
import { getImageVector } from "../services/story-search";

(async () => {
  try {
    const vector = await getImageVector(workerData.filePath);
    parentPort?.postMessage({ vector: vector.vector, filePath: workerData.filePath });
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message: string }).message : String(error);
    parentPort?.postMessage({ error: message, filePath: workerData.filePath });
  }
})(); 