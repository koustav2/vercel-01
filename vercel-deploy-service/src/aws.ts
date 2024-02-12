import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

// replace with your own credentials
const s3 = new S3({
    accessKeyId: "43fc27de38e38529cf27f8ad0a4ce052",
    secretAccessKey: "41c7ff8308da0402d7bdeb5fd293b8573a0eedadc1aa2ac00ed79556f2c90744",
    endpoint: "https://c1d0a77f12e7ed5895da993b19fd2142.r2.cloudflarestorage.com"
})


export async function downloadS3Folder(prefix: string) {
    const allFiles = await s3.listObjectsV2({
        Bucket: "vercel",
        Prefix: prefix
    }).promise();
    const allPromises = allFiles.Contents?.map(({ Key }) => {
        if (!Key) return Promise.resolve("");

        const finalOutputPath = path.join(__dirname, Key);
        const dirName = path.dirname(finalOutputPath);

        // Ensure directory exists
        if (!fs.existsSync(dirName)) fs.mkdirSync(dirName, { recursive: true });

        // Return a promise that resolves when stream ends
        return new Promise((resolve, reject) => {
            const outputFile = fs.createWriteStream(finalOutputPath);
            s3.getObject({ Bucket: "vercel", Key })
                .createReadStream()
                .pipe(outputFile)
                .on("finish", () => resolve(""))
                .on("error", reject); // Reject on error
        });
    }) || [];

    console.log("Awaiting...");

    try {
        await Promise.all(allPromises);
    } catch (err) {
        console.error(err);
    }

}


export function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    })
}

const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath); allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    return response;
}
