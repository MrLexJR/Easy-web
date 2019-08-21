import React from 'react'
import Router from 'next/router'
import Layout from '../components/layout'
import Session from '../utils/session'
import $ from 'jquery'
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Card, Table, CardBody } from 'reactstrap';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

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
      name: '', address: '', rows_proceso: [],
      proc_name: '', proc_tipo: 0, proc_periodo: 0, proc_fec_vot: '', proc_hor_inicio: '', proc_hor_fin: '',
      message: null, messageStyle: null
    }
    this.saveProcess = this.saveProcess.bind(this)
    this.handleProcessData = this.handleProcessData.bind(this)
    this.handleProcesUpd = this.handleProcesUpd.bind(this)
  }

  saveProcess(event) {
    event.preventDefault()
    this.setState({ message: null, messageStyle: null })
    if (!this.state.proc_name || !this.state.proc_tipo || !this.state.proc_periodo || !this.state.proc_fec_vot || !this.state.proc_hor_inicio || !this.state.proc_hor_fin) {
      this.setState({ message: 'Complete todos los campos!', messageStyle: 'alert-warning' })
      return
    }
    if (this.state.proc_hor_inicio >= this.state.proc_hor_fin) {
      this.setState({ message: 'Las horas deben ser validad', messageStyle: 'alert-warning' })
      return
    }

    if (this.state.rows_proceso.find(x => x.status === 1)) {
      this.setState({
        message: 'Solo puede tener un proceso activo',
        messageStyle: 'alert-danger'
      })
      return
    }

    let data = {
      nombre: this.state.proc_name, tipo: this.state.proc_tipo,
      dia_v: this.state.proc_fec_vot, periodo: this.state.proc_periodo,
      hora_i: this.state.proc_hor_inicio, hora_f: this.state.proc_hor_fin
    }
    fetch('auth/saveProceso', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(res => {
        if (res) {
          this.setState({
            message: res.message,
            messageStyle: res.messageStyle
          })
          if (res.staus == 200) {
            this.getProceso();
            Swal.fire('Genial!', 'Proceso ' + this.state.proc_name + ' agregado excitosamente! <br/> Desea agregar las <a href="/lista">listas</a> del proceso.', 'success')
          }
        } else {
          this.setState({
            message: 'Error al intentar guardar',
            messageStyle: 'alert-danger'
          })
        }
      })
      .catch(error => {
        console.error('Error:', error)
        this.setState({
          message: 'Request Failed!',
          messageStyle: 'alert-danger'
        })
      })
  }

  handleProcesUpd = (idx) => () => {
    let data = {
      id_proceso: idx.id_proceso
    }
    MySwal.fire({
      title: <p>¿Estas seguro?</p>,
      text: "¡Deseas cambiar de estado del Proceso!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, terminarlo!',
    }).then((result) => {
      if (result.value) {
        fetch('auth/updateProceso', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then(res => {
            if (res) {
              if (res.staus == 200) {
                Swal.fire('Listo!', 'El proceso ha terminado', 'success')
                this.getProceso();
              }
            } else {
              Swal.fire('Error', 'Hubon un error!: ', 'error')
            }
          })
          .catch(error => {
            console.error('Error:', error)
            this.setState({
              message: 'Request Failed!',
              messageStyle: 'alert-danger'
            })
          })
      }
    })
  }

  getProceso() {
    fetch('/auth/getProceso', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(response => {
        if (!response) return
        this.setState({
          rows_proceso: response.results
        })
      })
  }

  renderTableProceso() {
    if (this.state.rows_proceso.length > 0) {
      return this.state.rows_proceso.map((row) => {
        const { id_proceso, nombre, tipo, periodo, status } = row
        const tipo_d = (tipo === 1) ? 'Elecciones por Lista' : 'Elecciones Individuales';
        const estado = (status === 1) ? <a href='#' onClick={this.handleProcesUpd(row)} className="badge badge-success">Activo</a> : <a href='#' className="badge  badge-secondary">Culminado</a>;
        return (
          <tr key={id_proceso} id={id_proceso}>
            <td className="col-md-4" >{nombre}</td>
            <td className="col-md-3" >{tipo_d}</td>
            <td className="col-md-3">{periodo}</td>
            <td className="col-md-2">{estado}</td>
          </tr>
        )
      })
    } else {
      return (
        <tr key={0}><td className="col-md-12">No hay datos</td></tr>
      )
    }
  }

  async componentDidMount() {
    this.getProfile();
    this.getProceso();

    // Jquery here $(...)...
    $(document).ready(function () {
      $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myTable tr").filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
      });
    });
  }

  handleProcessData(e) {
    // var index = e.nativeEvent.target.selectedIndex;
    // if (index) var text_op = e.nativeEvent.target[index].text;
    const name = e.target.name;
    const value = e.target.value;
    // const value = text_op || e.target.value;
    this.setState({ [name]: value });
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
    const alert = (this.state.message === null) ? <div /> : <div className={`text-center alert ${this.state.messageStyle}`} role="alert">{this.state.message}</div>
    return (
      <Layout {...this.props}>
        <Row>
          <Col>
            <Row className="mt-1">
              <Col sm={{ size: 10, offset: 1 }} >
                <Card className='m-1'>
                  <CardBody>
                    <Form onSubmit={this.saveProcess}>
                      <FormGroup row>
                        <Label md={10}><h4> Administrar Proceso Electoral </h4></Label>
                        <Col md={2}>
                          <Button className='btn-block' color="success" type="submit">
                            Guardar{' '}<span className="icon ion-md-save"></span>
                          </Button>
                        </Col>
                      </FormGroup>
                      <Row>
                        <Col md="12"> <FormGroup row>
                          <Label md={1} for="proc_name">Titulo</Label>
                          <Col md={4}>
                            <Input type="text" id="proc_name" name="proc_name" placeholder="Ingrese titulo del proceso" value={this.state.proc_name} onChange={this.handleProcessData} />
                          </Col>
                          <Label md={1} for="proc_tipo">Tipo</Label>
                          <Col md={3}>
                            <Input type="select" name="proc_tipo" id="proc_tipo" defaultValue={this.state.proc_tipo} onChange={this.handleProcessData} >
                              <option value={0} disabled>Escojer...</option>
                              <option value={1}>Elecciones por Lista</option>
                              <option value={2}>Elecciones individaules</option>
                            </Input>
                          </Col>
                          <Label md={1} for="proc_periodo">Ciclo</Label>
                          <Col md={2}>
                            <Input type="select" name="proc_periodo" id="proc_periodo" defaultValue={this.state.proc_periodo} onChange={this.handleProcessData} >
                              <option value={0} disabled>Escojer...</option>
                              <option value='Abril - Agosto 2019'>Abril - Agosto 2019</option>
                            </Input>
                          </Col>
                        </FormGroup></Col>
                        <Col md="12"> <FormGroup row>
                          <Label md={1} for="proc_fec_vot">Fecha</Label>
                          <Col md={4}>
                            <Input type="date" name="proc_fec_vot" id="proc_fec_vot" onChange={this.handleProcessData} />
                          </Col>
                          <Label md={1} >Hora:</Label>
                          <Label md={1} for="proc_hor_inicio" >Inicio</Label>
                          <Col md={2}>
                            <Input type="time" name="proc_hor_inicio" id="proc_hor_inicio" onChange={this.handleProcessData} />
                          </Col>
                          <Label md={1} for="proc_hor_fin" >Fin</Label>
                          <Col md={2}>
                            <Input type="time" name="proc_hor_fin" id="proc_hor_fin" onChange={this.handleProcessData} />
                          </Col>
                        </FormGroup></Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
                {alert}
                <Container className="mt-2" >
                  <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                    <Input onChange={this.handleTable} name="seacrh" className="my-2" id="myInput" type="text" placeholder="Buscar.." />{''}
                  </FormGroup>
                  <table className='table table-hover table-fixed Tab_Doc' >
                    <thead>
                      <tr>
                        <th className="col-md-4">Nombre</th>
                        <th className="col-md-3">Tipo</th>
                        <th className="col-md-3">Periodo</th>
                        <th className="col-md-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody id="myTable">
                      {this.renderTableProceso()}
                    </tbody>
                  </table>
                </Container>
                <p className="text-center lead m-2">Ud es {this.state.name} el admin del sistema</p>
              </Col>
            </Row>
          </Col>
        </Row>
      </Layout>
    )
  }
}

