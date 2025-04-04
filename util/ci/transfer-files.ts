import SFTPClient from "ssh2-sftp-client";
import path from "path";

const {
  PRODUCTION_SSH_HOST,
  PRODUCTION_SSH_USER,
  PRODUCTION_SSH_KEY,
  REMOTE_ROOT,
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

await Promise.all(
  transfers.map((transfer) => {
    const [sourceFile, targetFile] = transfer.split(":");

    const targetFileIsRemote = targetFile.startsWith("@");
    const remoteFile = `${REMOTE_ROOT}/${(targetFileIsRemote ? targetFile : sourceFile).replace("@", "")}`;
    const localFile = `../../${targetFileIsRemote ? sourceFile : targetFile}`;
    if (targetFileIsRemote) {
      console.log(`Uploading ${localFile} to ${remoteFile}`);
      const remoteFileDir = path.dirname(remoteFile);
      console.log(`Creating directory ${remoteFileDir} if it doesn't exist`);
      return [
        sftp.mkdir(remoteFileDir, true),
        sftp.put(localFile, remoteFile),
      ];
    } else {
      console.log(`Downloading ${remoteFile} to ${localFile}`);
      return sftp.get(remoteFile, localFile);
    }
  }).flat(),
)
  .catch((error) => {
    console.error("Error:", error.message);
    sftp.end();
    process.exit(1);
  })
  .finally(() => {
    sftp.end();
  });
