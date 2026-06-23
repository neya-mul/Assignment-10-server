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
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // collections
        const db = client.db('fitness-cafe');
        const classCollection = db.collection('classes');
        const forumCollection = db.collection('forums');
        const userCollection = db.collection('user');

        // ==========================================
        // ALL APIS
        // ==========================================

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
            const result = await classCollection.find(query).toArray();
            res.json(result);
        });

        app.get('/all-classes/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: new ObjectId(id) };
            const result = await classCollection.find(query).toArray();
            res.json(result);
        });

        app.get('/admin-classes', async (req, res) => {
            const result = await classCollection.find().toArray();
            res.json(result);
        });

        app.patch('/admin-classes/:id', async (req, res) => {
            const { id } = req.params;
            const updatedData = req.body;
            const result = await classCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );
            res.json(result);
        });

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
            const { id } = req.params;
            const updatedData = req.body;
            const result = await classCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );
            res.json(result);
        });

        app.delete('/delete-class/:id', async (req, res) => {
            const { id } = req.params;
            const result = await classCollection.deleteOne({
                _id: new ObjectId(id)
            });
            res.json(result);
        });

        app.post('/forum-posts', async (req, res) => {
            const forum = req.body;
            const result = await forumCollection.insertOne(forum);
            res.json(result);
        });

        app.get('/forum-posts', async (req, res) => {
            const result = await forumCollection.find().toArray();
            res.json(result);
        });

        app.get('/my-forum-posts/:userId', async (req, res) => {
            const { userId } = req.params;
            const result = await forumCollection.find({
                userId: userId
            }).toArray();
            res.json(result);
        });

        // ----------------------------------------------------
        // --- CLEAN & CORRECTED USER MANAGEMENT ROUTES ---
        // ----------------------------------------------------

        // GET: Fetch all users (ডুপ্লিকেট রিমুভড)
        app.get('/users', async (req, res) => {
            try {
                const result = await userCollection.find().toArray();
                res.json(result);
            } catch (error) {
                console.error("Error fetching users:", error);
                res.status(500).json({ error: "Failed to fetch users" });
            }
        });

        // PATCH: Dynamic update for user status OR role (১টি রাউটে দুটি কাজই হবে)
        app.patch('/users/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const { status, role } = req.body; 

                const filter = { _id: new ObjectId(id) };

                const updateFields = {};
                if (status !== undefined) updateFields.status = status;
                if (role !== undefined) updateFields.role = role;

                const updatedDoc = { $set: updateFields };

                const result = await userCollection.updateOne(filter, updatedDoc);
                res.json(result);
            } catch (error) {
                console.error("Error updating user data:", error);
                res.status(500).json({ error: "Failed to update user data" });
            }
        });

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});