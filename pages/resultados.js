import React from 'react'
import color from 'rcolor';
import { Bar } from 'react-chartjs-2';
import Layout from '../components/layout'
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Card, CardBody, CustomInput } from 'reactstrap';

const data1 = {
  labels: [],
  datasets: [{ label:  '', backgroundColor: '', borderColor: '', borderWidth: 2, hoverBackgroundColor: '', hoverBorderColor: '', data: [] } ]
};

const cargo_lis = [{ id: 1, nombre: 'Presidente' }, { id: 2, nombre: 'Vicepresidente' }, { id: 3, nombre: 'Tesorero' }];
const cargo_pro = [{ id: 1, nombre: 'Reina' }, { id: 2, nombre: 'Rey' }, { id: 3, nombre: 'Buffon' }];

export default class extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      rows_proceso: [], row_resultados: [], data_r_: [], row_cargo: [],
      id_proceso: 0, id_cargo: 0,
      message: null, messageStyle: null, datas: data1,
      showResultados: false,
    }
    this.handleProceso = this.handleProceso.bind(this)
    this.handleProcessData = this.handleProcessData.bind(this)
    this.getResultados = this.getResultados.bind(this)
    this.renderData = this.renderData.bind(this)
  }

  handleProceso(e) {
    const value = e.target.value
    const tipo = e.target.options[e.target.selectedIndex].dataset.rc
    this.setState({ id_proceso: value });
    if (tipo == 1) { this.setState({ row_cargo: cargo_lis }) }
    else { this.setState({ row_cargo: cargo_pro }) }
  }

  handleProcessData(e) {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value });
  }

  renderData() {
    console.log(this.state.datas)
    var newDataSet = {
      ...this.state.datas
    };
    const labels1 = []
    const voto = []
    this.state.row_resultados.map((row) => {
      const { candidato, c_voto,lista } = row
      labels1.push(candidato+' ('+lista+')')
      voto.push(c_voto)
    })
    var proceso =this.state.rows_proceso.find(x => x.id_proceso == this.state.id_proceso)
    var cargo = this.state.row_cargo.find(x=> x.id == this.state.id_cargo )
    newDataSet.label = proceso.nombre +' ('+cargo.nombre+') ';
    newDataSet.data = voto;
    newDataSet.backgroundColor = color();
    newDataSet.borderColor = color();
    newDataSet.hoverBackgroundColor = color();
    newDataSet.hoverBorderColor = color();

    var newState = {
      labels: labels1,
      datasets: [newDataSet]      
    };

    console.log(newState)
    this.setState({datas: newState, showResultados: true})

  }

  getResultados(event) {
    event.preventDefault()
    this.setState({ message: null, messageStyle: null })
    if (!this.state.id_proceso || !this.state.id_cargo) {
      this.setState({ message: 'Escoja el periodo y el cargo', messageStyle: 'alert-warning' })
      return
    }
    var carg1 = this.state.row_cargo.find(x => x.id == this.state.id_cargo)
    let data = { id: this.state.id_proceso, cargo: carg1.nombre }
    fetch('/auth/getResultados', {
      method: 'POST', body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(response => {
        if (!response) return
        this.setState({ row_resultados: response.results })
        this.renderData();
      })
  }

  getProceso() {
    fetch('/auth/getProceso', { credentials: 'include' })
      .then(res => res.json())
      .then(response => {
        if (!response) return
        this.setState({ rows_proceso: response.results })
      })
  }

  renderOptProceso() {
    return this.state.rows_proceso.map((row) => {
      const { id_proceso, nombre, tipo } = row
      return (<option key={id_proceso} data-rc={tipo} value={id_proceso} >{nombre}</option>)
    })
  }

  renderOptCargo() {
    if (this.state.row_cargo.length > 0) {
      return this.state.row_cargo.map((row) => {
        const { id, nombre } = row
        return (<option key={id} value={id} >{nombre}</option>)
      })
    }
  }

  async componentDidMount() {
    this.getProceso();
  }

  render() {
    const alert = (this.state.message === null) ? <div /> : <div className={`text-center alert ${this.state.messageStyle}`} role="alert">{this.state.message}</div>
    return (
      <Layout  {...this.props}>
        <Row>
          <Col>
            <Row className="mt-2">
              <Col sm={{ size: 12, offset: 0 }} >
                <Card className='m-1'>
                  <CardBody>
                    <FormGroup row>
                      <Label md={12} ><h2 className='text-center'> Resultados  </h2></Label>
                      <Label md={1} for="id_proceso">Proceso</Label>
                      <Col md={4}>
                        <Input type="select" id="id_proceso" name="id_proceso" value={this.state.id_proceso} onChange={this.handleProceso} >
                          <option value={0} disabled>Escojer...</option>
                          {this.renderOptProceso()}
                        </Input>
                      </Col>
                      <Label md={1} for="id_cargo">Cargo</Label>
                      <Col md={3}>
                        <Input type="select" id="id_cargo" name="id_cargo" value={this.state.id_cargo} onChange={this.handleProcessData} >
                          <option value={0} disabled>Escojer...</option>
                          {this.renderOptCargo()}
                        </Input>
                      </Col>
                      <Label md={1}></Label>
                      <Col md={2} >
                        <Button id='saveData' className='btn-block' color="info" onClick={this.getResultados}>
                          Generar<span className="icon ion-md-send ml-2"></span>
                        </Button>
                      </Col>
                    </FormGroup>
                    {alert}
                  </CardBody>
                </Card>
                <Container>
                 {this.state.showResultados ? <Bar data={this.state.datas} width={60} height={350} options={{ maintainAspectRatio: false }} />  : null }
                </Container>
              </Col>
            </Row>
          </Col>
        </Row>
      </Layout>
    )
  }
}