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
      if (results[0][0]) {
          bcrypt.compare(password, results[0][0].contrasena).then(function(response) {
            if (response == true) {
              req.session.loggedin = true
              req.session.email = email
              return res.json(req.session)
            } else {
              return res.json({message: 'Incorrect Password!'})
            }
          })
      } else {
        return res.json({message: 'User not found'})
      }
    } else {
      return res.json({message: 'Please enter email and Password!'})
    }
  })

  async function getUser(email) {
    try {
      const results = await pool.query(`SELECT * FROM view_admin WHERE correo='${email}';`)
      return results
    }catch(e){
      console.error(e)
    }
  }

  server.post('/auth/saveProceso',async (req,res) =>{
    if(req.session && req.session.loggedin){
      const results = await saveProceso(req.body)
      if(results && results.length > 0) {
        return res.json({ message: null, messageStyle: null, staus: 200 })
      }else {
        return res.json({ message: 'Error: Solo puede tener un proceso activo ' , messageStyle: 'alert-danger', staus: 500 })
      }
    }
  })

  async function saveProceso(body) {
    try {
      const results = await pool.query(`INSERT INTO proceso_elec (nombre,tipo,voto_date,periodo,hora_incio,hora_fin) VALUES ("${body.nombre}", "${body.tipo}","${body.dia_v}","${body.periodo}","${body.hora_i}","${body.hora_f}");`)
      return results
    }catch(e){
      console.error(e)
    }
  }
  

  server.get('/auth/getProceso', async (req, res) => {
    const results = await getProceso()
    if (results) {
      return res.json({ results })
    } else {
      return res.status(500)
    }
  })

  async function getProceso() {
    try {
      const q = await pool.query('SELECT * FROM proceso_elec ORDER BY status DESC')
      return q[0]
    } catch (e) {
      console.error(e)
    }
  }

  server.post('/auth/updateProceso', async (req, res) => {
    if (req.session && req.session.loggedin) {
      const results = await updateProceso(req.body.id_proceso)
      if (results && results.length > 0) {
        return res.json({ message: null, messageStyle: null, staus: 200 })
      }
      else {
        return res.json({ message: 'Error: ', messageStyle: 'alert-danger', staus: 500 })
      }
    } 
  })
  
  async function updateProceso(id_proceso) {
    try {
      const results = await pool.query(`UPDATE proceso_elec SET status = "0" WHERE id_proceso= "${id_proceso}";`)
      return results
    } catch (e) {
      console.error(e)
    }
  }

  server.post('/auth/saveLista',async (req,res) =>{
    if(req.session && req.session.loggedin){
      const results = await saveLista(req.body)
      if(results && results.length > 0) {
        return res.json({ message: null, messageStyle: null, staus: 200 })
      }else {
        return res.json({ message: 'Error: Solo puede tener un proceso activo ' , messageStyle: 'alert-danger', staus: 500 })
      }
    }
  })

  async function saveLista(body) {
    try {
      const results = await pool.query(`INSERT INTO lista_electoral (nombre,eslogan,id_proceso,numero) VALUES ("${body.lnombre}", "${body.leslogan}","${body.lproceso}","${body.lnumero}");`)
      return results
    }catch(e){
      console.error(e)
    }
  }

  server.post('/auth/saveCandidato',async (req,res) =>{
    if(req.session && req.session.loggedin){
      
      const results1 = req.body.map((row)=>{
        return saveCandidato(row)
      })
      if(results1 && results1.length > 0) {
        return res.json({ message: null, messageStyle: null, staus: 200 })
      }else {
        return res.json({ message: 'Error:' , messageStyle: 'alert-danger', staus: 500 })
      }
    }
  })

  async function saveCandidato(body) {
    try {
      const results = await pool.query(`INSERT INTO candidato (id_proceso,id_persona,id_lista_e,cargo) VALUES ("${body.idproceso}", "${body.idcandidato}","${body.idlista}","${body.cargo}");`)
      return results
    }catch(e){
      console.error(e)
    }
  }


  server.get('/auth/getLista', async (req, res) => {
    const results = await getLista()
    if (results) {
      return res.json({ results })
    } else {
      return res.status(500)
    }
  })

  async function getLista() {
    try {
      const q = await pool.query(`SELECT * FROM viwe_lista_activa`)
      return q[0]
    } catch (e) {
      console.error(e)
    }
  }

  server.get('/auth/getPersona', async (req, res) => {
    const results = await getPersona()
    if (results) {
      return res.json({ results })
    } else {
      return res.status(500)
    }
  })

  async function getPersona() {
    try {
      const q = await pool.query(`SELECT * FROM persona`)
      return q[0]
    } catch (e) {
      console.error(e)
    }
  }

  server.get('/auth/getPersonaCandidato', async (req, res) => {
    const results = await getPersonaCandidato()
    if (results) {
      return res.json({ results })
    } else {
      return res.status(500)
    }
  })

  async function getPersonaCandidato() {
    try {
      const q = await pool.query(`SELECT * FROM view_pers_cand`)
      return q[0]
    } catch (e) {
      console.error(e)
    }
  }

  server.post('/auth/getListaCandi', async (req, res) => {
    const id = req.body.id
    const results = await getListaCandi(id)
    if (results) {
      return res.json({ results })
    } else {
      return res.status(500)
    }
  })

  async function getListaCandi(id) {
    try {
      const q = await pool.query(`SELECT persona.id_persona, persona.nombres, persona.apellidos, candidato.cargo FROM candidato, persona WHERE candidato.id_persona = persona.id_persona AND candidato.id_lista_e = '${id}';`)
      return q[0]
    } catch (e) {
      console.error(e)
    }
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
      if (results[0][0]) {
        return res.json({
          name: results[0][0].nombres || '',
          address: results[0][0].correo || ''
        })
      } else {
        return res.status(500)
      }
    } else {
      return res.status(403)
    }
  })


}