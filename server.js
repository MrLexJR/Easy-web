const next = require('next');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const routes = {
  auth: require('./routes/auth')
}

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(session({
    secret: 'sesion1',
    resave: false,
    cookie: { maxAge: 1 * 60 * 60 * 1000 },  // 8 hours
    saveUninitialized: false
  }));

  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());
  server.use('/fonts/ionicons', express.static('./node_modules/ionicons/dist/fonts'))

  routes.auth(server)

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, err => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
})
.catch(err => {
  console.log('An error occurred, unable to start the server')
  console.log(err)
})