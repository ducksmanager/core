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
  port: 22,
  username: PRODUCTION_SSH_USER,
  key: PRODUCTION_SSH_KEY,
});

const transfers = Bun.argv.splice(2);

for (const transfer of transfers) {
  let [sourceFile, targetFile] = transfer.slice(":");

  try {
    if (targetFile.indexOf("@") === 0) {
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
