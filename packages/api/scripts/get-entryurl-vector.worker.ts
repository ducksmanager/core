import { parentPort } from "worker_threads";
import { getImageVector, loadModel } from "../services/story-search";

let modelLoaded = false;

const processFile = async (filePath: string) => {
  try {
    if (!modelLoaded) {
      await loadModel();
      modelLoaded = true;
    }
    const vector = await getImageVector(filePath);
    parentPort?.postMessage({ type: "result", vector: vector.vector, filePath });
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message: string }).message : String(error);
    parentPort?.postMessage({ type: "error", error: message, filePath });
  }
};

parentPort?.on("message", (msg) => {
  if (msg.type === "process" && msg.filePath) {
    processFile(msg.filePath);
  }
}); 