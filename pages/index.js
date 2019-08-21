import React from 'react'
import Router from 'next/router'
import Layout from '../components/layout'
import Session from '../utils/session'
import Link from 'next/link'
import { Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';

export default class extends React.Component {
  static async getInitialProps({ req, res }) {

    let props = {
      session: ''
    }

    if (req && req.session) {
      props.session = req.session
    } else {
      props.session = await Session.getSession()
    }

    if (!props.session || !props.session.loggedin) {
      if (req) {
        res.redirect('/login')
      } else {
        Router.push('/login')
      }
    }
    return props
  }

  constructor(props) {
    super(props)
    this.state = {
      name: '',
      address: '',
      message: null,
      messageStyle: null
    }
  }
  componentDidMount() {
    this.getProfile();
  }

  getProfile() {
    fetch('/auth/profile', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(response => {
        if (!response.name || !response.address) return
        this.setState({
          name: response.name,
          address: response.address
        })
      })
  }

  

  render() {
    const alert = (this.state.message === null) ? <div /> : <div className={`alert ${this.state.messageStyle}`} role="alert">{this.state.message}</div>
    if (this.props.session.loggedin) {
      return (
        <Layout {...this.props}>
          <Row className="mt-1 text-center">
            <Col xs="8" >
              <h1 className=" display-4">Bienvenido {this.state.name} </h1>
              <hr className="mt-3" />
              <h2>Sistema de Votacion Movil</h2>
              <h5>Tus responsabilidades como admin seran:</h5>
              <Row>
                <Col xs="4">
                  <span style={{ fontSize: '15vw' }} className="icon ion-md-bookmarks"></span>
                  <p className=" text-muted">
                    Gestiona los <Link href="/process"><a className='text-muted font-weight-bold'>procesos</a></Link> y los <a className='text-muted font-weight-bold' href='#'>participantes</a>.
                    </p>
                </Col>
                <Col xs="4">
                  <span style={{ fontSize: '15vw' }} className="icon ion-md-filing"></span>
                  <p className=" text-muted">
                    Edita las <a className='text-muted font-weight-bold' href='/lista'>listas</a> y sus <a className='text-muted font-weight-bold' href='/candidatos'>candidatos</a>.
                    </p>
                </Col>
                <Col xs="4">
                  <span style={{ fontSize: '15vw' }} className="icon ion-md-stats"></span>
                  <p className=" text-muted">
                    Consulta las  <a className='text-muted font-weight-bold' href='/resultados'>estadisticas</a> del proceso.
                    </p>
                </Col>
              </Row>
            </Col>
            <Col xs="4" >
              <img style={{ height: '40vw' }} src="../static/Phone-1.1.png" className="img-responsive" alt="Online" />
              <p className=" text-muted">
                Para descargar la apk, haga click <a className='font-weight-bold' href='#'>aqui</a>.
              </p>
            </Col>
          </Row>
        </Layout>
      )
    } else {
      return (
        <Layout {...this.props}>
          <div />
        </Layout>
      )
    }
  }
}