import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { fileURLToPath } from "url";
import router from "./routes/router.js";
import apiRouter from "./routes/api/api-router.js";
import adminRouter from "./routes/admin/admin-router.js";
import { minRequiredRank } from "./src/authorization.js";
import { upsertAdminAccount } from "./src/queries/user.js";
import { synchronizeTempDirectories } from "./src/temp-directory-handlers.js";
import turnDataDownloaderDaemon from "./src/turn-data-downloader-daemon.js";
import { UserSessionData } from "./src/types.js";
import { parseAvailableTurnData } from "./src/world-data-state.js";

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
    cookie: { secure: false, maxAge: 3600000, sameSite: "lax" },
  })
);

const isAdminAccountCreated = await upsertAdminAccount("Admin", process.env.ADMIN_ACCOUNT_PASSWORD ?? "password");
if (!isAdminAccountCreated) console.log("Failed to create administrator account");

await synchronizeTempDirectories();

await parseAvailableTurnData();

app.use("/", router);
app.use("/api", apiRouter);
app.use("/admin", minRequiredRank(10));
app.use("/admin", adminRouter);
app.all("*", (req, res) => {
  return res.status(404).render("not-found");
});

turnDataDownloaderDaemon.init();

app.listen(PORT, () => {
  console.log("[server] Server started");
});
