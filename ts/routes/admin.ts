import express from "express";

const admin = express.Router();

admin.get("/", (req, res) => {
  return res.render("admin/index", {});
});
admin.get("/worlds", (req, res) => {
  return res.render("admin/worlds", {});
});

export default admin;
