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
    this.handleChange = this.handleChange.bind(this)
    this.setProfile = this.setProfile.bind(this)
  }
  async componentDidMount() {
    this.getProfile()
  }

  getProfile() {
    fetch('/auth/profile', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(response => {
        if (!response.name || !response.cedula) return
        this.setState({
          name: response.name,
          address: response.cedula
        })
      })
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  async setProfile(e) {
    e.preventDefault()

    this.setState({
      message: null,
      messageStyle: null
    })

    const data = {
      name: this.state.name,
      address: this.state.address
    }

    fetch('/auth/update', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(async res => {
        if (res.status === 200) {
          this.getProfile()
          this.setState({
            message: 'Profile have been saved!',
            messageStyle: 'alert-success'
          })
        } else {
          this.setState({
            message: 'Failed to save profile',
            messageStyle: 'alert-danger'
          })
        }
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
              <h5>Tus reesponsabilidades como admin seran:</h5>
              <Row>
                <Col xs="4">
                  <span style={{ fontSize: '200px' }} className="icon ion-md-bookmarks"></span>
                  <p className=" text-muted">
                    Gestiona los <Link href="#"><a className='text-muted font-weight-bold'>procesos</a></Link> y los <a className='text-muted font-weight-bold' href='#'>participantes</a>.
                    </p>
                </Col>
                <Col xs="4">
                <span style={{ fontSize: '200px' }} className="icon ion-md-filing"></span>
                  <p className=" text-muted">
                    Edita las <a className='text-muted font-weight-bold' href='#'>listas</a> y sus <a className='text-muted font-weight-bold' href='#'>candidatos</a>.
                    </p>
                </Col>
                <Col xs="4">
                <span style={{ fontSize: '200px' }} className="icon ion-md-stats"></span>
                  <p className=" text-muted">
                    Consulta las  <a className='text-muted font-weight-bold' href='#'>estadisticas</a> del proceso.
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