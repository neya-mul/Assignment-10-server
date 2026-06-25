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
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // collections
        const db = client.db('fitness-cafe');
        const classCollection = db.collection('classes');
        const forumCollection = db.collection('forums');
        const userCollection = db.collection('user');
        const myBookedClasesCollection = db.collection('my-booked-classes');
        const favoritesCollection = db.collection('favorites');

        // ==========================================
        // ALL APIS
        // ==========================================

        // --- CLASSES ---

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

        // --- FORUM POSTS ---

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

        // --- USER MANAGEMENT ---

        app.get('/users', async (req, res) => {
            try {
                const result = await userCollection.find().toArray();
                res.json(result);
            } catch (error) {
                console.error("Error fetching users:", error);
                res.status(500).json({ error: "Failed to fetch users" });
            }
        });

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

        // --- BOOKED CLASSES ---

        app.post('/my-booked-classes', async (req, res) => {
            try {
                const myBookedClases = req.body;
                const result = await myBookedClasesCollection.insertOne(myBookedClases);
                res.json(result);
            } catch (error) {
                console.error("Booking insert error:", error);
                res.status(500).json({ error: "Failed to book class" });
            }
        });

        // ✅ FIXED: Check if a class is already booked by a user
        // Must be defined BEFORE /my-booked-classes/:userEmail to avoid route conflict
        app.get('/bookings/check', async (req, res) => {
            try {
                const { classId, userId } = req.query;
                const found = await myBookedClasesCollection.findOne({ classId, userId });
                res.json({ booked: !!found });
            } catch (error) {
                console.error("Booking check error:", error);
                res.status(500).json({ error: "Failed to check booking status" });
            }
        });

        app.get('/my-booked-classes/:userEmail', async (req, res) => {
            try {
                const { userEmail } = req.params;
                const result = await myBookedClasesCollection.find({ userEmail: userEmail }).toArray();
                res.json(result);
            } catch (error) {
                console.error("Fetch booked classes error:", error);
                res.status(500).json({ error: "Failed to fetch booked classes" });
            }
        });

        // --- FAVORITES ---

        // Add to favorites
        app.post('/favorites', async (req, res) => {
            try {
                const favoriteDoc = req.body;

                const exists = await favoritesCollection.findOne({
                    classId: favoriteDoc.classId,
                    userId: favoriteDoc.userId
                });

                if (exists) {
                    return res.status(400).json({ error: "Class already in favorites" });
                }

                const result = await favoritesCollection.insertOne(favoriteDoc);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Remove from favorites
        app.delete('/favorites', async (req, res) => {
            try {
                const { classId, userId } = req.body;
                const result = await favoritesCollection.deleteOne({ classId, userId });
                res.json({ success: true, deletedCount: result.deletedCount });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Check favorite status
        app.get('/favorites/check', async (req, res) => {
            try {
                const { classId, userId } = req.query;
                const found = await favoritesCollection.findOne({ classId, userId });
                res.json({ favorited: !!found });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});