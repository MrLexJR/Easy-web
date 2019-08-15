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
			lista_img: '/static/candidato_1.png', selectedFile: null,
			row_cargo_lis: [{ id: 1, nombre: 'Presidente' }, { id: 2, nombre: 'Vicepresidente' }, { id: 3, nombre: 'Tesorero' }],
			row_cargo_pro: [{ id: 1, nombre: 'Reina' }, { id: 2, nombre: 'Rey' }, { id: 3, nombre: 'Buffon' }],
			rows_proceso: [], row_listas: [], row_persona: [], proc_activo: [],
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
				var c = response.results.find(x => x.status === 1)
				this.setState({ rows_proceso: response.results, id_proceso: c.id_proceso, proc_activo: c })
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

	getPersona() {
		fetch('/auth/getPersona', { credentials: 'include' })
			.then(res => res.json())
			.then(response => {
				if (!response) return
				this.setState({ row_persona: response.results })
			})
	}

	renderOptProceso() {
		return this.state.rows_proceso.map((row) => {
			const { id_proceso, status, nombre } = row
			if (status === 1) { return (<option key={id_proceso} value={id_proceso} >{nombre}</option>) }
			else { return (<option disabled key={id_proceso} value={id_proceso} >{nombre}</option>) }
		})
	}

	renderOptLista() {
		return this.state.row_listas.map((row) => {
			const { id_lista, nombre } = row
			return (<option key={id_lista} value={id_lista} >{nombre}</option>)
		})
	}

	renderOptCargo() {
		if (this.state.proc_activo.tipo == 1) {
			return this.state.row_cargo_lis.map((row) => {
				const { id, nombre } = row
				return (<option key={id} value={id} >{nombre}</option>)
			})
		} else if (this.state.proc_activo.tipo == 2) {
			return this.state.row_cargo_pro.map((row) => {
				const { id, nombre } = row
				return (<option key={id} value={id} >{nombre}</option>)
			})
		}
	}
	renderOptPersona() {
		return this.state.row_persona.map((row) => {
			const { id_persona, nombres,apellidos } = row
			return (<option key={id_persona} value={id_persona} >{nombres}{' '}{apellidos} </option>)
		})
	}

	async componentDidMount() {
		this.getLista(); this.getPersona(); this.getProceso();
		window.onload = function () {
			var fileupload = document.getElementById("imgPers");
			var filePath = document.getElementById("spnFilePath");
			var image = document.getElementById("lista_img");
			image.onclick = function () {
				fileupload.click();
			};
			fileupload.onchange = function () {
				var fileName = fileupload.value.split('\\')[fileupload.value.split('\\').length - 1];
				filePath.innerHTML = "<b>Imagen: </b>" + fileName;
			};
		};
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
		return (
			<Layout {...this.props}>
				<Row>
					<Col>
						<Row className="mt-2">
							<Col sm={{ size: 10, offset: 1 }} >
								<Card className='m-1'>
									<CardBody>
										<Form id="cand-data" onSubmit={this.saveCandid} >
											<FormGroup row>
												<Label md={10}><h4> Administrar Candidatos </h4></Label>
												<Col md={2}>
													<Button id='saveData' className='btn-block' color="success" type="submit">
														Guardar{' '}<span className="icon ion-md-save"></span>
													</Button>
												</Col>
											</FormGroup>
											<Row>
												<Col md="3">
													<FormGroup>
														<Row >
															<Col className='d-flex align-items-center justify-content-center contImg'>
																<img style={{ cursor: "pointer" }} id="lista_img" alt="Click para Seleccionar" title="Click para Seleccionar" className='rounded' src={this.state.lista_img} />
															</Col>
														</Row>
														<p className="text-center" id="spnFilePath"></p>
														<Input style={{ display: "none" }} onChange={this.handleChangeImg} accept="image/x-png,image/gif,image/jpeg" type="file" id="imgPers" name="imgPers" />
													</FormGroup>
												</Col>
												<Col md="9">
													<h3 className="text-center">Datos</h3>
													<Col md="12"><FormGroup row>
														<Label md={2} for="id_persona">Persona</Label>
														<Col md={4}>
															<Input type="select" id="id_persona" name="id_persona" value={this.state.id_persona} onChange={this.handleProcessData} >
																<option value={0} disabled>Escojer...</option>
																{this.renderOptPersona()}
															</Input>
														</Col>
														<Label md={2} for="id_cargo">Cargo</Label>
														<Col md={4}>
															<Input type="select" id="id_cargo" name="id_cargo" value={this.state.id_cargo} onChange={this.handleProcessData} >
																<option value={0} disabled>Escojer...</option>
																{this.renderOptCargo()}
															</Input>
														</Col>
													</FormGroup></Col>
													<Col md="12"><FormGroup row>
														<Label md={2} for="id_proceso">Proceso</Label>
														<Col md={4}>
															<Input type="select" id="id_proceso" name="id_proceso" value={this.state.id_proceso} onChange={this.handleProcessData} >
																{this.renderOptProceso()}
															</Input>
														</Col>
														<Label md={2} for="id_lista">Lista</Label>
														<Col md={4}>
															<Input type="select" id="id_lista" name="id_lista" value={this.state.id_lista} onChange={this.handleProcessData} >
																<option value={0} disabled>Escojer...</option>
																{this.renderOptLista()}
															</Input>
														</Col>
													</FormGroup></Col>
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
