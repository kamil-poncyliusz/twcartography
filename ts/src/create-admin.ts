import { createUser, deleteAllUsers } from "./queries/index.js";
import bcrypt from "bcryptjs";

const login = "Admin";
const password = "password";
const hash = bcrypt.hashSync(password, 5);

deleteAllUsers().then((success) => {
  if (!success) return console.log("Database error");
  createUser(login, hash, 10).then((isCreated) => {
    if (!isCreated) console.log("Failed to create administrator account");
    else console.log(`Created "${login}" account with "${password}" password`);
  });
});
