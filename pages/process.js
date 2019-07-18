import React from 'react'
import Router from 'next/router'
import Layout from '../components/layout'
import Session from '../utils/session'
import $ from 'jquery'
import Link from 'next/link'
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Card, Table, CardBody } from 'reactstrap';

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
			proc_name: '',
			proc_tipo: 'Escoger',
			message: null,
			messageStyle: null
		}
		this.saveProcess = this.saveProcess.bind(this)
		this.handleProcessData = this.handleProcessData.bind(this)
	}
	async componentDidMount() {
		this.getProfile()
	}

	saveProcess(event) {
		event.preventDefault()
		this.setState({
			message: null
		})
		console.log([this.state.proc_name], [this.state.proc_tipo])
		if (!this.state.proc_name || this.state.proc_tipo == 'Escoger') {
			this.setState({
				message: 'Error!',
				messageStyle: 'alert-danger'
			})
			return
		}
	}

	handleProcessData(e) {
		const name = e.target.name;
		const value = e.target.value;
		this.setState({ [name]: value });
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
				})
			})
	}

	render() {
		const alert = (this.state.message === null) ? <div /> : <div className={`text-center alert ${this.state.messageStyle}`} role="alert">{this.state.message}</div>
		return (
			<Layout {...this.props}>
				<Row>
					<Col>
						<h1 className=" display-4"> Proceso Electoral </h1>
						<Row className="mt-4">
							<Col sm={{ size: 10, offset: 1 }} >
								<Card>
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
												<Col md="7"> <FormGroup row>
													<Label md={3} for="proc_name">Nombre</Label>
													<Col md={9}>
														<Input type="text" id="proc_name" name="proc_name" placeholder="Ingrese el nombre" value={this.state.email} onChange={this.handleProcessData} />
													</Col>
												</FormGroup>
												</Col>
												<Col md="5"> <FormGroup row>
													<Label md={3} for="proc_tipo">Tipo</Label>
													<Col md={9}>
														<Input type="select" name="proc_tipo" id="proc_tipo" defaultValue={this.state.proc_tipo} onChange={this.handleProcessData} >
															<option value="Escoger" disabled>Escojer...</option>
															<option value="E_lista">Elecciones por Lista</option>
															<option value="E_indiv">Elecciones individaules</option>
														</Input>
													</Col>
												</FormGroup></Col>
												<Col md="7"> <FormGroup row>
													<Label md={3} for="proc_fec_vot">Fecha</Label>
													<Col md={9}>
														<Input type="text" name="proc_fec_vot" id="proc_fec_vot" defaultValue={new Date().getDate() +'/'+ [new Date().getMonth()+1] +'/'+ new Date().getFullYear() } />
													</Col>
												</FormGroup></Col>
											</Row>
										</Form>
									</CardBody>
								</Card>
								< Process_table />
								<br />
								{alert}
								<p className="text-center lead mt-2">
									Ud es {this.state.name} el best del sistema
						</p>
							</Col>
						</Row>
					</Col>
				</Row>
			</Layout>
		)
	}
}


export class Process_table extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			seacrh: '',
		};
		this.handleTable = this.handleTable.bind(this)
	}
	componentDidMount() {
    // Jquery here $(...)...
    $(document).ready(function () {
      $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myTable tr").filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
      });
      $("#r1, #r2, #r3, #r4").click(function () {
        var row = $(this).closest("tr");    // Find the row
        console.log(row[0].innerText);
      });
    });
  }

	handleTable(e) {
		const name = e.target.name;
		const value = e.target.value;
		this.setState({ [name]: value });
	}

	render() {
		return (
			<Container className="mt-2" >
				<FormGroup className="mb-2 mr-sm-2 mb-sm-0">
					<Input onChange={this.handleTable}  name="seacrh" className="my-2" id="myInput" type="text" placeholder="Buscar.." />{''}
				</FormGroup>
				<Table responsive hover className='Tab_Doc' >
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Tipo</th>
							<th>Ganador</th>
							<th>Periodo</th>
						</tr>
					</thead>
					<tbody id="myTable">
						<tr id='r1' >
							<td>Consejo Universitario</td>
							<td>Elecciones por lista</td>
							<td>Carlos Iza<br />EXU LISTA 3</td>
							<td>Agosto 2018 <br /> Enero 2019</td>
						</tr>
						<tr id='r2' >
							<td>Reina de la FCI</td>
							<td>Elecciones individaules</td>
							<td>Cinthya Briones</td>
							<td>Agosto 2018 <br /> Enero 2019</td>
						</tr>
					</tbody>
				</Table>
			</Container>
		)
	}
}