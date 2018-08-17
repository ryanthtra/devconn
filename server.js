const express = require("express");
const mongoose = require("mongoose");

const users = require("./routes/api/v1/users");
const profile = require("./routes/api/v1/profile");
const posts = require("./routes/api/v1/posts");

const app = express();

// Config for db
const db = require("./config/keys").mongoURI;
// Connecting to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB has been connected."))
  .catch(err => console.log(err));

app.get("/", (req, res) => res.send("Hello World!"));

// Setting routes
app.use("/api/v1/users", users);
app.use("/api/v1/profile", profile);
app.use("/api/v1/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
