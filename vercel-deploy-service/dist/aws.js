"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyFinalDist = exports.downloadS3Folder = void 0;
const aws_sdk_1 = require("aws-sdk");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// replace with your own credentials
const s3 = new aws_sdk_1.S3({
    accessKeyId: "43fc27de38e38529cf27f8ad0a4ce052",
    secretAccessKey: "41c7ff8308da0402d7bdeb5fd293b8573a0eedadc1aa2ac00ed79556f2c90744",
    endpoint: "https://c1d0a77f12e7ed5895da993b19fd2142.r2.cloudflarestorage.com"
});
function downloadS3Folder(prefix) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const allFiles = yield s3.listObjectsV2({
            Bucket: "vercel",
            Prefix: prefix
        }).promise();
        const allPromises = ((_a = allFiles.Contents) === null || _a === void 0 ? void 0 : _a.map(({ Key }) => {
            if (!Key)
                return Promise.resolve("");
            const finalOutputPath = path_1.default.join(__dirname, Key);
            const dirName = path_1.default.dirname(finalOutputPath);
            // Ensure directory exists
            if (!fs_1.default.existsSync(dirName))
                fs_1.default.mkdirSync(dirName, { recursive: true });
            // Return a promise that resolves when stream ends
            return new Promise((resolve, reject) => {
                const outputFile = fs_1.default.createWriteStream(finalOutputPath);
                s3.getObject({ Bucket: "vercel", Key })
                    .createReadStream()
                    .pipe(outputFile)
                    .on("finish", () => resolve(""))
                    .on("error", reject); // Reject on error
            });
        })) || [];
        console.log("Awaiting...");
        try {
            yield Promise.all(allPromises);
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.downloadS3Folder = downloadS3Folder;
function copyFinalDist(id) {
    const folderPath = path_1.default.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    });
}
exports.copyFinalDist = copyFinalDist;
const getAllFiles = (folderPath) => {
    let response = [];
    const allFilesAndFolders = fs_1.default.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path_1.default.join(folderPath, file);
        if (fs_1.default.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath));
        }
        else {
            response.push(fullFilePath);
        }
    });
    return response;
};
const uploadFile = (fileName, localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const fileContent = fs_1.default.readFileSync(localFilePath);
    const response = yield s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    return response;
});
