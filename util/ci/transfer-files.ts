#!/usr/bin/env bun
import SFTPClient from "ssh2-sftp-client";

const {
    PRODUCTION_SSH_HOST,
    PRODUCTION_SSH_USER,
    PRODUCTION_SSH_KEY,
}: {
    PRODUCTION_SSH_HOST: string;
    PRODUCTION_SSH_USER: string;
    PRODUCTION_SSH_KEY: string;
} = process.env;

const sftp = new SFTPClient();

await sftp.connect({
    host: PRODUCTION_SSH_HOST,
    username: PRODUCTION_SSH_USER,
    privateKey: PRODUCTION_SSH_KEY,
});

const transfers: string[] = Bun.argv.splice(2);

for (const transfer of transfers) {
    let [sourceFile, targetFile] = transfer.split(":");

    try {
        if (targetFile.startsWith("@")) {
            targetFile = `../../${targetFile.replace("@", "")}`;
            console.log(`Uploading ${sourceFile} to ${targetFile}`);
            // await sftp.put(sourceFile, targetFile);
        } else {
            sourceFile = `../../${sourceFile.replace("@", "")}`;
            console.log(`Downloading ${sourceFile} to ${targetFile}`);
            // await sftp.get(sourceFile, targetFile);
        }
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        sftp.end();
    }
}
