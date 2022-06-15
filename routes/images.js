const express = require("express");
const router = express.Router();
const Images = require("../models/image");
const upload = require("../modules/multer");


router.post("/", upload.single("image"), async (req, res) => {
    console.log(req.file)
    const imageUrl = req.file.location;
    const createdAt = new Date();    

    await Images.create({
        imageUrl,
        createdAt
    });

  res.status(200).json({ imageUrl });
});

module.exports = router;
