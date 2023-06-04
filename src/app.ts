import { rest } from "./servers/index.js";

(async (): Promise<void> => {
  try {
    await rest.start();
    console.log("⚡️ Server running");
  } catch (err) {
    console.log(
      "Something went terribly wrong when starting GRPC and REST servers",
      err
    );
  }
})();
