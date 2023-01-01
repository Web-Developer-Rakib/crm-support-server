const express = require("express");
const bcrypt = require("bcrypt");
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
    //Post registered users info
    app.post("/post-user", async (req, res) => {
      const username = req.body.userName;
      const existingUser = await usersCollection.findOne({
        userName: username,
      });
      if (existingUser === null) {
        const name = req.body.name;
        const userName = req.body.userName;
        const userType = req.body.userType;
        const password = req.body.password;
        const hashp = await bcrypt.hash(password, 10);
        const userDetails = { name, userName, userType, hashp };
        await usersCollection.insertOne(userDetails);
        res.send({ added: "Employee added successfully." });
      } else {
        res.send({ exist: "Username already exist. Try different one." });
      }
    });
    //Post login info
    app.post("/login", async (req, res) => {
      try {
        const username = req.body.username;
        const password = req.body.password;
        const matchedUser = await usersCollection.findOne({
          userName: username,
        });
        const passwordMatched = await bcrypt.compare(
          password,
          matchedUser.hashp
        );
        if (passwordMatched) {
          res.send(matchedUser);
        } else {
          res.send({ Invalid: "invalid login details." });
        }
      } catch (error) {
        res.send({ Error: "Something went wrong" });
      }
    });
    //Post customer details
    app.post("/post-customer-details", async (req, res) => {
      const customerDetails = req.body;
      const result = await customersCollection.insertOne(customerDetails);
      res.send(result);
    });
    //Get all custommers data
    app.get("/customers", async (req, res) => {
      const query = {};
      const cursor = customersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    //Get a single customer
    app.post("/customer", async (req, res) => {
      const id = req.body.id;
      const query = { _id: ObjectId(id) };
      const customer = await customersCollection.findOne(query);
      res.send(customer);
    });
  } finally {
    // Connection continue
  }
};
run().catch(console.dir);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
