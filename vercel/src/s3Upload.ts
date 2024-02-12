import { S3 } from "aws-sdk";
import fs from "fs";

// replace with your own credentials
const s3 = new S3({
    accessKeyId: "43fc27de38e38529cf27f8ad0a4ce052",
    secretAccessKey: "41c7ff8308da0402d7bdeb5fd293b8573a0eedadc1aa2ac00ed79556f2c90744",
    endpoint: "https://c1d0a77f12e7ed5895da993b19fd2142.r2.cloudflarestorage.com"
})
// 6cUzTEUDBIOtRMHoxxEAs9X4fPoadgeJM6IbqPJv
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response)
    return response
}