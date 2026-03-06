import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 3000;

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "connexion-page.html"));
});

function passwordcheck(req, res, next) {
  const { username, password } = req.body;
  if (password === "1234" && username == "admin") {
    next();
  } else {
    res.status(401).json({ message: "unauthorized" });
  }
}

app.post("/home-page", passwordcheck, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home-page.html"));
});

app.get("/home-page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home-page.html"));
});

app.listen(port, () => {
  console.log(`server is running on : http://localhost:${port}`);
});
