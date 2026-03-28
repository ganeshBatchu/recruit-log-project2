const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const db = require("./db/dbConnector_Mongo");

const indexRouter = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).render("error", { message: "Page not found", error: {} });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", { message: err.message, error: err });
});

// Start server
async function start() {
  await db.connect();
  app.listen(PORT, () => {
    console.log(`Recruit.log running at http://localhost:${PORT}`);
  });
}

start().catch(console.error);
