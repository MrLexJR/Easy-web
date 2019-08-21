import React from 'react'
import Router from 'next/router'
import Layout from '../components/layout'
import Session from '../utils/session'
import ReactTooltip from 'react-tooltip'
import $ from 'jquery'
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Card, CardBody, CustomInput } from 'reactstrap';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

export default class extends React.Component {
	static async getInitialProps({ req, res }) {
		let props = { session: '' }
		if (req && req.session) { props.session = req.session }
		else { props.session = await Session.getSession() }
		if (!props.session || !props.session.loggedin) {
			if (req) { res.redirect('/login') }
			else { Router.push('/login') }
		}
		return props
	}
	constructor(props) {
		super(props)
		this.state = {
			lista_img: '/static/candidato_1.png',
			row_cargo: [],
			row_cargo_lis: [{ id: 1, nombre: 'Presidente' }, { id: 2, nombre: 'Vicepresidente' }, { id: 3, nombre: 'Tesorero' }],
			row_cargo_pro: [{ id: 1, nombre: 'Reina' }, { id: 2, nombre: 'Rey' }, { id: 3, nombre: 'Buffon' }],
			row_listas: [], row_persona: [], proc_activo: [], candidato_proceso: [],
			lista_proceso: 0, nombre_proceso: '', filtro_c: 0,
			id_persona: 0, id_proceso: 0, id_lista: 0, id_cargo: 0, cargo: '',
			message: null, messageStyle: null,
		}
		this.handleChangeImg = this.handleChangeImg.bind(this)
		this.handleProcessData = this.handleProcessData.bind(this)
		this.saveCandid = this.saveCandid.bind(this)
	}

	Clean = () => {
		document.getElementById("lista-data").reset();
		this.setState({
			lista_img: '/static/candidato.png', selectedFile: null,
			message: null, messageStyle: null
		});
	}

	saveCandid(event) {
		event.preventDefault()
		this.setState({ message: null, messageStyle: null })
	}

		handleProcessData(e) {
			const name = e.target.name;
			const value = e.target.value;
			this.setState({ [name]: value });
		}

	handleChangeImg(event) {
		if (event.target.files[0]) {
			this.setState({ lista_img: URL.createObjectURL(event.target.files[0]),  /* selectedFile: event.target.files[0] */ })
		}
	}

	getProceso() {
		fetch('/auth/getProceso', { credentials: 'include' })
			.then(res => res.json())
			.then(response => {
				if (!response) return
				var x = response.results.find(x => x.status === 1)							// Preguntamos si hay proceso activo 
				var c1 = (x) ? x.id_proceso : 0;
				var n1 = (x) ? x.nombre : '';
				var t1 = (x) ? x.tipo : 0;
				this.setState({ lista_proceso: c1, nombre_proceso: n1, proc_activo: x })
				if (t1 == 1) { this.setState({ row_cargo: this.state.row_cargo_lis }) }
				else { this.setState({ row_cargo: this.state.row_cargo_lis }) }
				if (c1 == 2) {
					document.getElementById("id_lista").disabled = true;
				}
			})
	}

	getLista() {
		fetch('/auth/getLista', {
			credentials: 'include'
		})
			.then(res => res.json())
			.then(response => {
				if (!response) return
				this.setState({ row_listas: response.results })
			})
	}

	getPersonaCandidato() {
		fetch('/auth/getPersonaCandidato', { credentials: 'include' })
			.then(res => res.json())
			.then(response => {
				if (!response) return
				this.setState({ row_persona: response.results, options_cand: [] })
				response.results.map((row) => {
					const { id_persona, nombres, apellidos } = row
					const item = { value: id_persona, label: id_persona + ' - ' + nombres + ' ' + apellidos, data: nombres + ' ' + apellidos, isDisabled: false }
					this.setState({ options_cand: [...this.state.options_cand, item] })
				})
			})
	}

	getCandidatoProceso() {
		fetch('/auth/getCandidatoProceso', { credentials: 'include' })
			.then(res => res.json())
			.then(response => {
				if (!response) return
				this.setState({ candidato_proceso: response.results })
			})
	}

	renderTableCandidatoProceso() {
		if (this.state.candidato_proceso.length > 0) {
			var dta = this.state.candidato_proceso;
			// var dta = []
			if (this.state.id_cargo && this.state.filtro_c == 2) {
				const cargo_1 = this.state.row_cargo.find(x => x.id == this.state.id_cargo);
				dta = this.state.candidato_proceso.filter(function (x) { return x.cargo == cargo_1.nombre  });
			}
			if (this.state.id_lista && this.state.filtro_c == 1) {
				const lista_1 = this.state.row_listas.find(x => x.id_lista == this.state.id_lista);
				dta = this.state.candidato_proceso.filter(function (x) { return x.lista == lista_1.nombre  });
			}
			// data = (dta.length>0) ? dta :  data
			return dta.map((row) => {
				const { id_candidato, candidato, lista, cargo } = row
				return (
					<tr key={id_candidato} id={id_candidato}>
						<td className="col-md-4">{lista}</td>
						<td className="col-md-2">{cargo}</td>
						<td className="col-md-4">{candidato}</td>
						<td className="col-md-2">
							<h4>
								<ReactTooltip place="right" effect="solid" />
								<span style={{ cursor: "pointer" }} className="text-info icon ion-md-information-circle ml-4" data-tip="Eliminar" />
							</h4>
						</td>
					</tr>
				)
			})
		} else { return (<tr key={0}><td className="col-md-12">No consta ningun candidato</td></tr>) }
	}

	renderOptLista() {
		return this.state.row_listas.map((row) => {
			const { id_lista, nombre } = row
			return (<option key={id_lista} value={id_lista} >{nombre}</option>)
		})
	}

	renderOptCargo() {
		if (this.state.proc_activo) {
			return this.state.row_cargo.map((row) => {
				const { id, nombre } = row
				return (<option key={id} value={id} >{nombre}</option>)
			})
		}
}


async componentDidMount() {
	this.getLista(); this.getPersonaCandidato(); this.getProceso(); this.getCandidatoProceso();

	$(document).ready(function () {
		$("#myInput").on("keyup", function () {
			var value = $(this).val().toLowerCase();
			$("#myTable tr").filter(function () {
				$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
			});
		});
	});
}

render() {
	const alert = (this.state.message === null) ? <div /> : <div className={`text-center alert ${this.state.messageStyle}`} role="alert">{this.state.message}</div>
	const buscar = (this.state.filtro_c == 0) ? <Input name="seacrh" id="myInput" type="text" placeholder="Buscar.." /> : (this.state.filtro_c == 1) ? <Input type="select" id="id_lista" name="id_lista" value={this.state.id_lista} onChange={this.handleProcessData} ><option value={0} disabled>Escojer...</option> {this.renderOptLista()} </Input> : <Input type="select" id="id_cargo" name="id_cargo" value={this.state.id_cargo} onChange={this.handleProcessData} ><option value={0} disabled>Escojer...</option>{this.renderOptCargo()}</Input>
	return (
		<Layout {...this.props}>
			<Row>
				<Col>
					<Row className="mt-2">
						<Col sm={{ size: 12, offset: 0 }} >
							<Card className='m-1'>
								<CardBody>
									<Form id="cand-data" onSubmit={this.saveCandid} >
										<FormGroup row>
											<Label md={10}><h4> Administrar Candidatos <span className='text-info'>{this.state.nombre_proceso}</span> </h4></Label>
											{/* <Col md={2}>
													<Button id='saveData' className='btn-block' color="success" type="submit">
														Guardar{' '}<span className="icon ion-md-save"></span>
													</Button>
												</Col> */}
										</FormGroup>
										<Row>
											<Col md="12">
												{/* <Col md="12"><FormGroup row>
														<Label md={1} for="id_cargo">Cargo</Label>
														<Col md={3}>
															<Input type="select" id="id_cargo" name="id_cargo" value={this.state.id_cargo} onChange={this.handleProcessData} >
																<option value={0} disabled>Escojer...</option>
																{this.renderOptCargo()}
															</Input>
														</Col>
														<Label md={1} for="id_lista">Lista</Label>
														<Col md={3}>
															<Input type="select" id="id_lista" name="id_lista" value={this.state.id_lista} onChange={this.handleProcessData} >
																<option value={0} disabled>Escojer...</option>
																{this.renderOptLista()}
															</Input>
														</Col>
														<Label md={1} for="id_persona">Persona</Label>
														<Col md={3}>
															<Input type="select" id="id_persona" name="id_persona" value={this.state.id_persona} onChange={this.handleProcessData} >
																<option value={0} disabled>Escojer...</option>
															</Input>
														</Col>
													</FormGroup></Col> */}
												{alert}
												<Container className="mt-2" >
													<FormGroup className="m-2 mr-sm-2 mb-sm-2" row>
														<Col md={7} >
															{buscar}
														</Col>
														<Label md={1} for="filtro_c">Filtrado</Label>
														<Col md={4}>
															<Input type="select" id="filtro_c" name="filtro_c" value={this.state.filtro_c} onChange={this.handleProcessData} >
																<option value={0} >Todos</option>
																<option value={1} >Lista</option>
																<option value={2} >Cargo</option>
															</Input>
														</Col>
													</FormGroup>
													<table className='table table-hover table-fixed ' >
														<thead>
															<tr>
																<th className="col-md-4">Lista</th>
																<th className="col-md-2">Cargo</th>
																<th className="col-md-4">Candidato</th>
																<th className="col-md-2">Opciones</th>
															</tr>
														</thead>
														<tbody style={{ height: '400px' }} id="myTable">
															{this.renderTableCandidatoProceso()}
														</tbody>
													</table>
												</Container>
											</Col>
										</Row>
									</Form>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</Col>
			</Row>
		</Layout>
	)
}
}
