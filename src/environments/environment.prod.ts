const COUCH_DB_URL_KEY = 'couch_db_url';

export const environment = {
  production: true,
  mocks: false,
  storage: localStorage.getItem(COUCH_DB_URL_KEY)  || '/couchdb',
  assets: '/media',
  graphql: '/api/graphql'
};
