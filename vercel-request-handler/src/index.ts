import express from "express";
import { S3 } from "aws-sdk";

const s3 = new S3({
    accessKeyId: "43fc27de38e38529cf27f8ad0a4ce052",
    secretAccessKey: "41c7ff8308da0402d7bdeb5fd293b8573a0eedadc1aa2ac00ed79556f2c90744",
    endpoint: "https://c1d0a77f12e7ed5895da993b19fd2142.r2.cloudflarestorage.com"
})
const app = express();

app.get("/*", async (req, res) => {
    const host = req.hostname;

    const id = host.split(".")[0];
    const filePath = req.path;
    console.log(id, filePath);
    const contents = await s3.getObject({
        Bucket: "vercel",
        Key: `dist/${id}${filePath}`
    }).promise();
    
    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
    res.set("Content-Type", type);

    res.send(contents.Body);
})

app.listen(3001, () => {
    console.log("Server running on port 3001");
});