import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import router from "./routes/router.js";
import api from "./routes/api.js";
// import scheduleWorldDataDownload from "./src/scheduleWorldDataDownload.js";
import parser from "./src/worldDataParser.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.env.ROOT = __dirname;
const PORT = "8080";

app.set("view engine", "pug");
app.set("env", "development");
app.set("json escape", true);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
  })
);

app.use("/", router);
app.use("/api", api);

app.listen(process.env.PORT || PORT, () => {
  console.log("[server] Server started");
});

// worldDataDownloader();

// parser(8, 5);
// parser(8, 10);
// parser(8, 15);
// parser(8, 20);
// parser(8, 25);
// parser(8, 30);
// parser(8, 35);
// parser(8, 40);
// parser(8, 45);
// parser(8, 50);
// parser(8, 55);
// parser(8, 60);
