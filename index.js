require('dotenv').config();
const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const uri = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Server is running');
});

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        // collections
        const db = client.db('pet-nest');
        const classCollection = db.collection('classes');


        // all apis
        app.post('/all-classes', async (req, res)=>{
            const classess = req.body
            const result =  await classCollection.insertOne(classess)
            res.json(result)
        })











    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(PORT, () => {
    console.log('server is running')
})