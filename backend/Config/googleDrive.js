import { google } from 'googleapis';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_DRIVE_FOLDER_ID,
} = process.env;

if (!GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is missing from environment variables.');
}

if (!GOOGLE_CLIENT_SECRET) {
  throw new Error(
    'GOOGLE_CLIENT_SECRET is missing from environment variables.'
  );
}

if (!GOOGLE_REFRESH_TOKEN) {
  throw new Error(
    'GOOGLE_REFRESH_TOKEN is missing from environment variables.'
  );
}

if (!GOOGLE_DRIVE_FOLDER_ID) {
  throw new Error(
    'GOOGLE_DRIVE_FOLDER_ID is missing from environment variables.'
  );
}

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

export default drive;