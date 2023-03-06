const {authenticateToken} = require("../auth/auth");
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const db = import("../db/connection.mjs");
const router = express.Router();
const multer  = require('multer')
const base_url = process.env.base_url || 'http://localhost:3000'

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

// router.use(authenticateToken)


router.post("/", async (req, res) => {
    let collection = (await db).default.collection("posts");
    let newDocument = req.body;
    newDocument.date = new Date();
    await collection.insertOne(newDocument).then(result=>{
        res.send(result).status(204);
    }).catch(e=>{
        res.send(e).status(500)
    })

});
router.get("/",authenticateToken, async (req, res) => {
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
                tags:1,
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
router.get("/latest", authenticateToken, async (req, res) => {
    let collection = (await db).default.collection("posts");
    let results = await collection.aggregate([
        {"$project": {"author": 1, "title": 1, "tags": 1, "date": 1}},
        {"$sort": {"date": -1}},
        {"$limit": 3}
    ]).toArray();
    res.send(results).status(200);
});

router.get('/:id', authenticateToken, async (req, res) => {
    let collection = (await db).default.collection("posts");
    let results = await collection.aggregate([
        {"$match":{_id:new ObjectId(req.params.id)}},
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
        },]).toArray();
    res.send(results).status(200);
})

router.put('/update', authenticateToken, async (req,res) => {
    let collection = (await db).default.collection('posts')
    console.log("id",req.body._id)
    console.log("object id",new ObjectId(req.body._id))
    collection.updateOne(
        {_id:new ObjectId(req.body._id)},
        {
            $set:
                {
                    title:req.body.title,
                    content:req.body.content,
                    image:req.body.image,
                }
        }
    )
        .then(result=>res.send(result))
        .catch(e=>{
            console.log(e)
            res.send(e).status(500)
        })

})

router.delete('/', authenticateToken,async function (req, res) {
    let collection = (await db).default.collection('posts')
    await collection.deleteOne({_id: new ObjectId(req.body._id)}).then(result=>{
        res.send(result).status(200)
    }).catch(e=>res.send(e).status(500))
})

router.post('/upload', authenticateToken, upload.single('file'),function (req, res) {
    res.send({status:"success",link:`${base_url}/data/uploads/${req.file.filename}`})
});

module.exports = router;
