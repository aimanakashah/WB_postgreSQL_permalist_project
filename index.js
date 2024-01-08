import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Permalist",
  password: "1234567890",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function findCheckList() {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  items = result.rows;
  console.log(items);

  return items;
}

app.get("/", async (req, res) => {
  const items = await findCheckList();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;

  const addItem = await db.query(
    "INSERT INTO items (title) VALUES ($1) RETURNING title;",
    [item]
  );
  items.push({ title: addItem });
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const updatedTitle = req.body.updatedItemTitle;
  const updatedId = req.body.updatedItemId;

  await db.query("UPDATE items SET title = ($1) WHERE id = ($2);", [
    updatedTitle,
    updatedId,
  ]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const deletedId = req.body.deleteItemId;

  await db.query("DELETE FROM items WHERE id = ($1);", [deletedId]);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
