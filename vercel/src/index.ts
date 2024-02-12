import path from 'path';
import express from 'express';
import cors from 'cors';
import { generateRandomId, getAllFiles } from './generate';
import simpleGit from 'simple-git';
import { uploadFile } from './s3Upload';
import { createClient } from "redis";

const app = express();

const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const port = process.env.PORT || 3000;


app.post('/deploy', async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generateRandomId();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    files.forEach(async file => {
        await uploadFile(file.slice(__dirname.length + 1), file);
        console.log(`Uploading ${file}`);
    })
    publisher.lPush("build-queue", id);
    publisher.hSet("status", id, "uploaded");
    res.json({
        id: id
    })
});

app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
