import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "1234",
  port: 5432,
})
db.connect()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = []

async function getList(){
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  items= result.rows
  return items
}

app.get("/", async (req, res) => {
  const items= await getList()

  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", (req, res) => {
  const item = req.body.newItem;
  console.log(item);
  try{
    const result = db.query(
      "INSERT INTO items (title) VALUES ($1) RETURNING id",
      [item]
    );
    res.redirect("/");
  }catch (e) {
    console.log(e);
    res.sendStatus(500);
  }

});

app.post("/edit", async (req, res) => {
const editTitle = req.body.updateTitle;
const id = parseInt(req.body.updatedItemId)

  try{
    await db.query("UPDATE items SET title = ($1) WHERE id = $2",
      [editTitle, id]
    );
    res.redirect("/");
  }catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/delete", async (req, res) => {
const id = req.body.deleteId
try {
  await db.query('DELETE FROM items WHERE id = $1', [id])
  res.redirect("/");
} catch (e){
  res.sendStatus(500);
}
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
