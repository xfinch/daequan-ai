// Server-only auth re-export
// This file ensures auth is only used server-side
export { auth, signIn, signOut, handlers } from './auth';
export const { GET, POST } = require('./auth').handlers;
