import { createUser } from "./src/queries/index.js";
import bcrypt from "bcryptjs";

const login = "Admin";
const password = "password";
const hash = bcrypt.hashSync(password, 5);

createUser(login, hash, 2).then((createdAccountOrNull) => {
  if (createdAccountOrNull === null) console.log("Failed to create administrator account");
  else console.log(`Created "${login}" account with "${password}" password`);
});
