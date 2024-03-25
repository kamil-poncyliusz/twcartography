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
import { upsertUser } from "./src/queries/user.js";
import { UserSessionData } from "./src/types";
import dataFilesDownloaderDaemon from "./src/data-files-downloader-daemon.js";

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

const createAccount = async (username: string, password: string, rank: number) => {
  const isAccountCreated = await upsertUser(username, password, rank);
  if (!isAccountCreated) console.log(`Failed to create ${username} account`);
};

app.set("view engine", "pug");
app.set("json escape", true);
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(helmet());
app.use(cors({ origin: true }));
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

await createAccount("Admin", process.env.ADMIN_ACCOUNT_PASSWORD ?? "password", 10);
await createAccount("test", "test1234", 2);
await dataFilesDownloaderDaemon.init();

app.use("/", router);
app.use("/api", apiRouter);
app.use("/admin", minRequiredRank(10), adminRouter);
app.all("*", (req, res) => res.status(404).render("not-found"));

app.listen(PORT, () => {
  console.log("[server] server started");
});
