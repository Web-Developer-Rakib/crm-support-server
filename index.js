const express = require("express");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var cors = require("cors");
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
//DB info
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kobuznu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// Run DB connection
const run = async () => {
  try {
    // DB client connect
    await client.connect();
    //Collections
    const usersCollection = client.db("crm_support").collection("users");
    const customersCollection = client
      .db("crm_support")
      .collection("customers");
    app.get("/", (req, res) => {
      res.send("Hello world");
    });
    //Post users info
    app.post("/post-user", async (req, res) => {
      const userDetails = req.body;
      const result = await usersCollection.insertOne(userDetails);
      res.send(result);
    });
    //Post login info
    app.post("/login", async (req, res) => {
      try {
        const username = req.body.username;
        const password = req.body.password;
        const matchedUser = await usersCollection.findOne({
          userName: username,
        });

        if (matchedUser.password === password) {
          res.send(matchedUser);
        } else {
          res.send({ Invalid: "invalid login details." });
        }
      } catch (error) {
        res.send({ Error: "Something went wrong" });
      }
    });
    //Post users info
    app.post("/post-customer-details", async (req, res) => {
      const customerDetails = req.body;
      const result = await customersCollection.insertOne(customerDetails);
      res.send(result);
    });
  } finally {
    // Connection continue
  }
};
run().catch(console.dir);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
