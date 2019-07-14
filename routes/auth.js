const pool = require('../dbconfig/dbconfig')
const bcrypt = require('bcrypt');
const saltRounds = 10;


module.exports = (server) => {

  if (server === null) {
    throw new Error('server should be an express instance')
  }

  server.post('/auth/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    if (email && password) {
      const results = await getUser(email)
      if (results.email) {
        if (password === results.password) {
          req.session.loggedin = true
          req.session.email = email
          return res.json(req.session)
        } else {
          return res.json({ message: 'Incorrect Password!' })
        }


      } else {
        return res.json({ message: 'Datos Erroneos' })
      }
    } else {
      return res.json({ message: 'Please enter email and Password!' })
    }
  })

  async function getUser(email) {
    const url = "https://easy-voto-utm.000webhostapp.com/getuser.php?email=" + email;
    const dt = await fetch(url, { method: 'GET' })
      .then(function (response) {
        return response.json();
      })
    return dt
  }

  server.get('/auth/signout', (req, res) => {
    if (req.session && req.session.loggedin) {
      req.session.destroy()
      res.redirect(`/`)
    } else {
      res.redirect(`/`)
    }
  })

  server.get('/auth/session', (req, res) => {
    if (req.session) {
      return res.json(req.session)
    } else {
      return res.status(403)
    }
  })

  server.get('/auth/profile', async (req, res) => {
    if (req.session && req.session.loggedin) {
      const results = await getUser(req.session.email)
      if (results.email) {
        return res.json({
          name: results.nombre || '',
          cedula: results.cedula || ''
        })
      } else {
        return res.status(500)
      }
    } else {
      return res.status(403)
    }
  })

  server.post('/auth/update', async (req, res) => {
    if (req.session && req.session.loggedin) {
      const results = await updateUser(req.body, req.session.email)
      if (results && results.length > 0) {
        return res.json({ ok: true })
      } else {
        return res.status(500)
      }
    } else {
      return res.status(403)
    }
  })

  async function updateUser(body, email) {
    try {
      const results = await pool.query(`UPDATE users SET name='${body.name}', address='${body.address}' WHERE email='${email}';`)
      return results
    } catch (e) {
      console.error(e)
    }
  }

}