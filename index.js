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
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wwpjvfb.mongodb.net/?retryWrites=true&w=majority`;
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
    const usersCollection = client.db("jooskart_crm").collection("users");
    const customersCollection = client
      .db("jooskart_crm")
      .collection("customers");

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
        // Password excluded
        const name = matchedUser.name;
        const userName = matchedUser.userName;
        const userType = matchedUser.userType;
        const id = matchedUser._id;
        const matchedUsersData = {
          name,
          userName,
          userType,
          id,
        };
        const passwordMatched = await bcrypt.compare(
          password,
          matchedUser.hashp
        );
        if (passwordMatched) {
          res.send(matchedUsersData);
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
    // Delete customer
    app.delete("/delete-customer/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await customersCollection.deleteOne(query);
      res.send(result);
    });
    //Update customers info
    app.put("/update-customer", async (req, res) => {
      const customersInfo = req.body;
      const id = customersInfo.cid;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          customerName: customersInfo.customerName,
          contactNumber: customersInfo.contactNumber,
          email: customersInfo.email,
          status: customersInfo.status,
          leadDate: customersInfo.leadDate,
          personIncharge: customersInfo.personIncharge,
          inchargeUsername: customersInfo.inchargeUsername,
          comment: customersInfo.comment,
        },
      };
      const options = { upsert: true };
      const result = await customersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
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
