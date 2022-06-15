const express = require("express");
const router = express.Router();
const upload = require("../modules/multer");
const Images = require("../models/images");

router.post("/", upload.single("image"), async (req, res) => {
    console.log(req.file)
    const imageUrl = req.file.location;
    const createdAt = new Date();    

    await Images.create({
        imageUrl,
        createdAt
    });

  res.status(200).json({ success:"upload success" });
});

module.exports = router;
