const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load service account credentials
const credentials = JSON.parse(fs.readFileSync('/Users/xfinch/.openclaw/workspace/credentials/gdrive-service-account.json', 'utf8'));

// Create auth client
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function findOrCreateFolder(folderName) {
  // Search for existing folder
  const response = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (response.data.files.length > 0) {
    console.log(`Found existing folder: ${response.data.files[0].id}`);
    return response.data.files[0].id;
  }

  // Create new folder
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  console.log(`Created new folder: ${folder.data.id}`);
  return folder.data.id;
}

async function uploadFile(filePath, folderId) {
  const fileName = path.basename(filePath);
  const mimeType = fileName.endsWith('.md') ? 'text/markdown' : 'image/jpeg';

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: fs.createReadStream(filePath),
    },
    fields: 'id, name, webViewLink',
  });

  console.log(`Uploaded: ${fileName}`);
  console.log(`Link: ${file.data.webViewLink}`);
  return file.data;
}

async function main() {
  const folderName = 'XF Assistant Documents';
  const folderId = await findOrCreateFolder(folderName);

  // Upload story document
  const storyPath = '/Users/xfinch/.openclaw/workspace/katsu-burger-story/katsu-burger-story.md';
  if (fs.existsSync(storyPath)) {
    await uploadFile(storyPath, folderId);
  }

  // Upload images
  const storyDir = '/Users/xfinch/.openclaw/workspace/katsu-burger-story';
  const files = fs.readdirSync(storyDir);
  for (const file of files) {
    if (file.endsWith('.jpg')) {
      await uploadFile(path.join(storyDir, file), folderId);
    }
  }

  console.log('\nUpload complete!');
  console.log(`Folder ID: ${folderId}`);
}

main().catch(console.error);
