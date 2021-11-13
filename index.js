const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Mongodb Connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ugc3m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        //make database
        const database = client.db("sleekNshineDB");
        const productsCollection = database.collection('products');
        const myOrderCollection = database.collection('myOrder');
        const reviewCollection = database.collection('review');
        const usersCollection = database.collection('users');

        //Get all Services API
        app.get('/allProducts', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // Get Single Service API
        app.get('/allProducts/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific product', id);
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

        //My Orders Post API
        app.post('/myOrders', async (req, res) => {
            const myOrder = req.body;
            const result = await myOrderCollection.insertOne(myOrder);
            res.json(result);
            console.log(result);
        })

        //My order get api

        app.get("/myOrder/:email", async (req, res) => {
            const result = await myOrderCollection
                .find({
                    email: req.params.email
                })
                .toArray();
            res.send(result);
        });

        /// delete order

        app.delete("/delteOrder/:id", async (req, res) => {
            const result = await myOrderCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        // all order get api
        app.get("/allOrders", async (req, res) => {
            const result = await myOrderCollection.find({}).toArray();
            res.send(result);
        });

        //get review
        app.get('/getReview', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });


        //post review
        app.post("/addSReview", async (req, res) => {
            const result = await reviewCollection.insertOne(req.body);
            res.send(result);
        });

        //add products post api
        app.post('/addProducts', async (req, res) => {
            const product = req.body;
            console.log('hit the post api', product);

            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });


        //user info post
        app.post("/addUserInfo", async (req, res) => {
            console.log("req.body");
            const result = await usersCollection.insertOne(req.body);
            res.send(result);
            console.log(result);
        });

        //userInfo upsert
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
            console.log("PUT", user);

        })

        app.put("/makeAdmin", async (req, res) => {
            const filter = { email: req.body.email };
            const result = await usersCollection.find(filter).toArray();
            if (result) {
                const documents = await usersCollection.updateOne(filter, {
                    $set: { role: "admin" },
                });
                console.log(documents);
            }
            // else {
            //   const role = "admin";
            //   const result3 = await usersCollection.insertOne(req.body.email, {
            //     role: role,
            //   });
            // }

            // console.log(result);
        });

        // check admin or not
        app.get("/checkAdmin/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });

            // const result = await usersCollection
            //     .findOne({ email: req.params.email })
            //     .toArray();
            // console.log(result);

            // res.send(result);
        });


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Running Sleek N Care');
});

app.listen(port, () => {
    console.log('Running Sleek N Care on port', port);
})