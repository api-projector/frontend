const COUCH_DB_URL_KEY = 'couch_db_url';

export const environment = {
  production: true,
  mocks: true,
  storage: localStorage.getItem(COUCH_DB_URL_KEY)  || 'https://app.apiprojector.com/couchdb',
  assets: '/media',
  graphql: '/api/graphql'
};
