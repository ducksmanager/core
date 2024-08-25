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

console.log('Test is ' + process.env.PRODUCTION_TEST)

const sftp = new SFTPClient();

await sftp.connect({
    host: PRODUCTION_SSH_HOST,
    username: PRODUCTION_SSH_USER,
    privateKey: PRODUCTION_SSH_KEY,
});

const transfers: string[] = process.argv.slice(2);

for (const transfer of transfers) {
    let [sourceFile, targetFile] = transfer.split(":");

    try {
        if (targetFile.startsWith("@")) {
            sourceFile = `../../${sourceFile.replace("@", "")}`;
            console.log(`Uploading ${sourceFile} to ${targetFile}`);
            // await sftp.put(sourceFile, targetFile);
        } else {
            targetFile = `../../${targetFile.replace("@", "")}`;
            console.log(`Downloading ${sourceFile} to ${targetFile}`);
            // await sftp.get(sourceFile, targetFile);
        }
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        sftp.end();
    }
}
