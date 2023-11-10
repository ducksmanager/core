import { dataset, round } from "@prisma/client";

interface PredictionResponse {
  url: string;
  predicted: string;
  predictionProbability: string;
}

export const predict = (
  round: round,
  dataset: dataset,
  possibleAuthors: string[]
): Promise<string> =>
  new Promise((resolve) => {
    console.log("Possible authors: " + JSON.stringify(possibleAuthors));
    const startTime = new Date().getTime();
    fetch(process.env.BOT_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: round.sitecodeUrl,
        dataset: dataset.name,
      }),
    })
      .then((response) => response.json())
      .then(
        ({
          data: { predicted, predictionProbability },
        }: {
          data: PredictionResponse;
        }) => {
          console.log(
            `Prediction done in ${new Date().getTime() - startTime}ms`
          );
          console.log(
            `Round ${round.roundNumber} - Predicted artist = ${predicted},
            probability of ${predictionProbability}%`
          );
          if (!possibleAuthors.includes(predicted)) {
            console.log("Skipped");
          } else {
            resolve(predicted);
            return;
          }
          console.error(
            "No possible authors match the prediction, choosing a random author"
          );
          const randomElement =
            possibleAuthors[Math.floor(Math.random() * possibleAuthors.length)];
          resolve(randomElement);
        }
      )
      .catch((error: unknown) => {
        console.error(
          (error as { response?: { data?: string } })?.response?.data ||
            "Bot server seems to be offline"
        );
        console.log("Prediction failed, choosing a random author");
        const randomElement =
          possibleAuthors[Math.floor(Math.random() * possibleAuthors.length)];
        resolve(randomElement);
      });
  });
