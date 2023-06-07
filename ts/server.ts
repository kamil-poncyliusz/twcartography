import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from "url";
import router from "./routes/router.js";
import api from "./routes/api.js";
import admin from "./routes/admin.js";
import { adminAuthorization } from "./src/authorization.js";
import turnDataDownloaderDaemon from "./src/turn-data-downloader-daemon.js";
import session from "express-session";
import { UserSessionData } from "./Types.js";

declare module "express-session" {
  interface SessionData {
    user: UserSessionData;
  }
}

const app = express();
const PORT = "8080";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.env.ROOT = __dirname;

app.set("view engine", "pug");
app.set("json escape", true);
app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(helmet());
app.use(
  cors({
    origin: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    proxy: true,
    name: "cookie",
    saveUninitialized: true,
    cookie: { secure: process.env.HTTPS === "true", maxAge: 3600000, sameSite: "lax" },
  })
);

app.use("/", router);
app.use("/api", api);
app.use("/admin", adminAuthorization);
app.use("/admin", admin);
app.all("*", (req, res) => {
  return res.status(404).render("not-found");
});

app.listen(process.env.PORT || PORT, () => {
  console.log("[server] Server started");
});

turnDataDownloaderDaemon();
