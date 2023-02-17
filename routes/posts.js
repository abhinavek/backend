const express = require('express');
const db = import("../db/connection.mjs");
const router = express.Router();

router.post("/", async (req, res) => {
    let collection = (await db).default.collection("posts");
    let newDocument = req.body;
    newDocument.date = new Date();
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
});
router.get("/", async (req, res) => {
    let collection = (await db).default.collection("posts");
    let results = await collection.find({})
        .limit(50)
        .toArray();

    res.send(results).status(200);
});
router.get("/latest", async (req, res) => {
    let collection = (await db).default.collection("posts");
    let results = await collection.aggregate([
        {"$project": {"author": 1, "title": 1, "tags": 1, "date": 1}},
        {"$sort": {"date": -1}},
        {"$limit": 3}
    ]).toArray();
    res.send(results).status(200);
});

module.exports = router;
