var ObjectId = require('mongodb').ObjectId;
const express = require('express');
const db = import("../db/connection.mjs");
const router = express.Router();
const multer  = require('multer')
const base_url = process.env.base_url || 'http://localhost:3000'
let fileName = ''

let storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, './public/data/uploads/') //Destination folder
        },
        filename: function (req, file, cb) {
            cb(null, `${new Date().getTime()}.${file.mimetype.split('/')[1]}`)
        }
    }
);
const upload = multer( { storage: storage })


router.post("/", async (req, res) => {
    let collection = (await db).default.collection("posts");
    let newDocument = req.body;
    newDocument.date = new Date();
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
});
router.get("/", async (req, res) => {
    let collection = (await db).default.collection("posts");
    let results = await collection.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "_id.str",
                foreignField: "author_id",
                as: "user",
            },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                content: 1,
                image: 1,
                author_id: 1,
                //"author_id":"$user._id",
                author_first_name:"$user.first_name",
                author_last_name:"$user.last_name",
                author_avatar:"$user.avatar",

                date: 1,
            },
        },
    ],{"$sort": {"date": -1}})
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

router.get('/:id', async (req, res) => {
    let collection = (await db).default.collection("posts");
    let results = await collection.find({_id:new ObjectId(req.params.id)}).toArray();
    res.send(results).status(200);
})

router.post('/upload', upload.single('file'),function (req, res) {
    let fileName = `${new Date().getTime()}.${req.file.mimetype.split('/')[1]}`
    res.send({status:"success",link:`${base_url}/data/uploads/${req.file.filename}`})
});

module.exports = router;
