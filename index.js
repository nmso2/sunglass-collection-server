const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sjr78.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('sunglassCollection');
        const sunglassCollection = database.collection('sunglass');
        const purchaseCollection = database.collection('purchaseSunglass');
        const usersCollection = database.collection("users");
        const reviewCollection = database.collection("review");

        // POST API to add user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });


        // GET API to get all user
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        });

        // GET API (Get all sunglasses)
        app.get('/sunglass', async (req, res) => {
            const cursor = sunglassCollection.find({});
            const sunglass = await cursor.toArray();
            res.send(sunglass);
        });


        // PUT API to update user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        // PUT API to make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });


        //Get API for admin check...
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            console.log(user);
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        
        // POST API to add sunglass
        app.post('/sunglass', async (req, res) => {
            const sunglass = req.body;
            const result = await sunglassCollection.insertOne(sunglass);
            res.json(result);
        });


        // GET API (Get all sunglasses)
        app.get('/sunglass', async (req, res) => {
            const cursor = sunglassCollection.find({});
            const sunglass = await cursor.toArray();
            res.send(sunglass);
        });


        // GET API (Get single sunglass)
        app.get('/sunglass/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const sunglass = await sunglassCollection.findOne(query);
            res.json(sunglass);
        });


        // POST API to add review
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });

        // GET API (Get all sunglasses)
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });

        // POST API to add Purchase order
        app.post('/purchaseSunglass', async (req, res) => {
            const order = req.body;
            const result = await purchaseCollection.insertOne(order);
            res.json(result);
        });

        // GET API (Get all Purchase order)
        app.get('/purchaseSunglasses', async (req, res) => {
            const cursor = purchaseCollection.find({});
            const plans = await cursor.toArray();
            res.send(plans);
        });

        // GET API (Get single Purchase order)
        app.get('/purchaseSunglass/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.findOne(query);
            res.json(result);
        });

        // GET API (Get Purchase orders for single user)
        app.get('/purchaseSunglass', async (req, res) => {
            const email = req.query.email;
            const date = req.query.date;
            const query = { email: email };
            const cursor = purchaseCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // UPDATE API
        app.put('/purchaseSunglass/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    confirmed: updatedOrder.confirmed
                },
            };
            const result = await purchaseCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        })

        // DELETE API
        app.delete('/purchaseSunglass/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})