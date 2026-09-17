import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

dotenv.config({
  path: ".env.local",
  override: true,
});
