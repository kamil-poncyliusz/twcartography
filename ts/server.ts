import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import router from "./routes/router.js";
import api from "./routes/api.js";
import admin from "./routes/admin.js";
import scheduleWorldDataDownload from "./src/scheduleWorldDataDownload.js";
import { authorization, adminAuthorization } from "./src/authorization.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.env.ROOT = __dirname;
const PORT = "8080";

app.set("view engine", "pug");
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

app.use("/", authorization);
app.use("/", router);
app.use("/api", api);
app.use("/admin", adminAuthorization);
app.use("/admin", admin);

app.listen(process.env.PORT || PORT, () => {
  console.log("[server] Server started");
});

// scheduleWorldDataDownload();
