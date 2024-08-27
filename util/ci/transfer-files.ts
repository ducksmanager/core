import SFTPClient from "ssh2-sftp-client";

const {
    PRODUCTION_SSH_HOST,
    PRODUCTION_SSH_USER,
    PRODUCTION_SSH_KEY,
    REMOTE_ROOT
}: {
    PRODUCTION_SSH_HOST: string;
    PRODUCTION_SSH_USER: string;
    PRODUCTION_SSH_KEY: string;
    REMOTE_ROOT: string;
} = process.env;

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
        const targetFileIsRemote = targetFile.startsWith("@");
        const remoteFile = `${REMOTE_ROOT}/${(targetFileIsRemote ? targetFile : sourceFile).replace("@", "")}`;
        const localFile = `../../${(targetFileIsRemote ? sourceFile : targetFile)}`;
        if (targetFileIsRemote) {
            console.log(`Uploading ${localFile} to ${remoteFile}`);
            // await sftp.put(sourceFile, targetFile);
        } else {
            console.log(`Downloading ${remoteFile} to ${localFile}`);
            // await sftp.get(sourceFile, targetFile);
        }
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        sftp.end();
    }
}
