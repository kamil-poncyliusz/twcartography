import { createUser, deleteAllUsers } from "./src/queries/index.js";
import bcrypt from "bcryptjs";

const login = "Admin";
const password = "password";
const hash = bcrypt.hashSync(password, 5);

deleteAllUsers().then((success) => {
  if (success) {
    createUser(login, hash, 10).then((createdAccountOrNull) => {
      if (createdAccountOrNull === null) console.log("Failed to create administrator account");
      else console.log(`Created "${login}" account with "${password}" password`);
    });
  } else {
    console.log("Database error");
  }
});
