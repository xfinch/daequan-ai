const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CLIENT_ID = '469295090220-i6khc6n1pknhssrqtucse72kd10cun5h.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // Out-of-band/device flow

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Token storage path
const TOKEN_PATH = '/Users/xfinch/.openclaw/workspace/credentials/gdrive-oauth-token.json';

// Load token if exists
async function loadToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oauth2Client.setCredentials(token);
    console.log('Loaded existing token');
    return true;
  }
  return false;
}

// Save token
function saveToken(token) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
  console.log(`Token saved to ${TOKEN_PATH}`);
}

// Authenticate
async function authenticate() {
  const hasToken = await loadToken();
  if (hasToken) return;

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive'],
    prompt: 'consent'
  });

  console.log('\n=====================================');
  console.log('Authorize this app by visiting:');
  console.log(authUrl);
  console.log('=====================================\n');
  console.log('After authorizing, paste the code here:');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question('Code: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oauth2Client.getToken(code.trim());
        oauth2Client.setCredentials(tokens);
        saveToken(tokens);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function findOrCreateFolder(folderName) {
  const response = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (response.data.files.length > 0) {
    console.log(`Found existing folder: ${response.data.files[0].id}`);
    return response.data.files[0].id;
  }

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

  console.log(`✓ Uploaded: ${fileName}`);
  return file.data;
}

async function main() {
  // Check if client secret is available
  if (!CLIENT_SECRET) {
    console.error('Error: GOOGLE_CLIENT_SECRET environment variable not set');
    console.error('The client secret should be in drive-upload.js or environment');
    process.exit(1);
  }

  await authenticate();

  const folderName = 'XF Assistant Documents';
  const folderId = await findOrCreateFolder(folderName);

  // Upload story document
  const storyPath = '/Users/xfinch/.openclaw/workspace/katsu-burger-story/katsu-burger-story.md';
  if (fs.existsSync(storyPath)) {
    const doc = await uploadFile(storyPath, folderId);
    console.log(`Document link: ${doc.webViewLink}`);
  }

  // Upload images
  const storyDir = '/Users/xfinch/.openclaw/workspace/katsu-burger-story';
  const files = fs.readdirSync(storyDir);
  let uploadedCount = 0;
  for (const file of files) {
    if (file.endsWith('.jpg')) {
      await uploadFile(path.join(storyDir, file), folderId);
      uploadedCount++;
    }
  }

  console.log(`\n✅ Upload complete!`);
  console.log(`📁 Folder: XF Assistant Documents`);
  console.log(`📄 Files uploaded: ${uploadedCount + 1}`);
  console.log(`🔑 Folder ID: ${folderId}`);
  
  // Save folder ID for future use
  const configPath = '/Users/xfinch/.openclaw/workspace/credentials/gdrive-config.json';
  fs.writeFileSync(configPath, JSON.stringify({ folderId, folderName }, null, 2));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
