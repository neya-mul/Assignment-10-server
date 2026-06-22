require('dotenv').config();
const cors = require('cors')

const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const uri = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000


app.use(cors())

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
        const db = client.db('fitness-cafe');
        const classCollection = db.collection('classes');


        // all apis
        app.post('/all-classes', async (req, res) => {
            try {
                const classData = req.body;
                const result = await classCollection.insertOne(classData);
                res.status(201).json(result);
            } catch (error) {
                console.error("Insert error:", error);
                res.status(500).json({ error: "Failed to insert class" });
            }
        });

        app.get('/all-classes', async (req, res) => {
            const query = { status: 'approved' };

            const result = await classCollection.find(query).toArray()
            res.json(result)
        })


        app.get('/all-classes/:id', async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id) };


            const result = await classCollection.find(query).toArray()
            res.json(result)
        })

        app.get('/admin-classes', async (req, res) => {
            const result = await classCollection.find().toArray()
            res.json(result)
        })


        app.patch('/admin-classes/:id', async (req, res) => {
            const { id } = req.params
            const updatedData = req.body
            const result = await classCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            )
            res.json(result)

        })




        app.delete('/admin-classes/:id', async (req, res) => {
            const { id } = req.params;

            const result = await classCollection.deleteOne({
                _id: new ObjectId(id)
            });

            res.json(result);
        });


        app.get('/my-classes/:trainerId', async (req, res) => {
            const { trainerId } = req.params;

            const result = await classCollection
                .find({ trainerId })
                .toArray();

            res.json(result);
        });


        app.patch('/update-class/:id', async (req, res) => {
            const { id } = req.params
            const updatedData = req.body
            const result = await classCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            )
            res.json(result)

        })


        app.delete('/delete-class/:id', async (req, res) => {
            const { id } = req.params;

            const result = await classCollection.deleteOne({
                _id: new ObjectId(id)
            });

            res.json(result);
        });

        // const { id } = req.params
        //             const updatedData = req.bodyy
        //             const result =await petCollection.updateOne(
        //                 { _id: new ObjectId(id) },
        //                 { $set: updatedData }
        //             )
        //             res.json(result)







    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(PORT, () => {
    console.log('server is running')
})