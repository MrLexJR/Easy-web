import React from 'react'
import Router from 'next/router'
import Layout from '../components/layout'
import Session from '../utils/session'
import ReactTooltip from 'react-tooltip'
import $ from 'jquery'
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Card, CardBody, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
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
			rows_proceso: [], row_listas_a: [], row_lista_select: [], row_listas_candid: [],
			lista_img: '/static/part_polit.png', selectedFile: null,
			lista_name: '', lista_eslogan: '', lista_proceso: 0, lista_numero: 0,
			message: null, messageStyle: null, modal: false,
		}
		this.handleChangeImg = this.handleChangeImg.bind(this)
		this.handleProcessData = this.handleProcessData.bind(this)
		this.saveLista = this.saveLista.bind(this)
		this.updateLista = this.updateLista.bind(this)
		this.deleteLista = this.deleteLista.bind(this)
		this.modalToggle = this.modalToggle.bind(this)
	}

	modalToggle() { this.setState(prevState => ({ modal: !prevState.modal })); }

	dignidadesLista = (idx) => () => {
		this.setState({ row_lista_select: idx })
		this.modalToggle(); this.getListaCandi(idx.id_lista);
	}

	Clean = () => {
		document.getElementById("lista-data").reset();
		this.setState({
			lista_img: '/static/part_polit.png', selectedFile: null,
			lista_name: '', lista_eslogan: '', lista_numero: 0,
			message: null, messageStyle: null
		});
	}

	saveLista(event) {
		event.preventDefault()
		this.setState({ message: null, messageStyle: null })
		// console.log(this.state.lista_img,this.state.selectedFile)
		if (!this.state.lista_img || !this.state.lista_img || !this.state.lista_eslogan || !this.state.lista_proceso) {
			this.setState({ message: 'Complete todos los campos!', messageStyle: 'alert-warning' })
			return
		}
		let data = { lnombre: this.state.lista_name, leslogan: this.state.lista_eslogan, lproceso: parseInt(this.state.lista_proceso), lnumero: this.state.lista_numero, limagen: this.state.selectedFile }
		fetch('auth/saveLista', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json' }
		})
			.then(res => res.json())
			.then(res => {
				if (res) {
					this.setState({ message: res.message, messageStyle: res.messageStyle })
					if (res.staus == 200) {
						this.getLista();
						Swal.fire('Genial!', 'La lista ' + this.state.lista_name + ' agregado excitosamente!', 'success')
					}
				} else { this.setState({ message: 'Error al intentar guardar', messageStyle: 'alert-danger' }) }
			})
			.catch(error => { this.setState({ message: 'Request Failed!', messageStyle: 'alert-danger' }) })
	}

	updateLista = (idx) => () => {
		console.log(idx)
	}

	deleteLista = (idx) => () => {
		console.log(idx)
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
				var c = response.results.find(x => x.status === 1 && x.tipo === 'Elecciones por Lista');
				var c1 = (c) ? c.id_proceso : 0;
				this.setState({ rows_proceso: response.results, lista_proceso: c1 })
				if (c1 == 0) {
					this.setState({ message: 'El proceso no admite listas o no hay proceso activo', messageStyle: 'alert-danger' })
					document.getElementById("saveData").disabled = true;
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
				this.setState({ row_listas_a: response.results })
			})
	}

	getListaCandi(id) {
		let data = { id: id }
		fetch('/auth/getListaCandi', {
			method: 'POST', body: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json' }
		})
		.then(res => res.json())
		.then(response => {
			if (!response) return
			this.setState({ row_listas_candid: response.results })
		})
	}

	renderOptProceso() {
		if (this.state.lista_proceso != 0) {
			return this.state.rows_proceso.map((row) => {
				const { id_proceso, status, nombre } = row
				if (status === 1) { return (<option key={id_proceso} value={id_proceso} >{nombre}</option>) }
				else { return (<option disabled key={id_proceso} value={id_proceso} >{nombre}</option>) }
			})
		}
		else { return (<option key={0} value={0} > Null </option>) }
	}

	renderTableProceso() {
		if (this.state.row_listas_a.length > 0) {
			return this.state.row_listas_a.map((row) => {
				const { id_lista, nombre, numero, eslogan } = row
				return (
					<tr key={id_lista} id={id_lista}>
						<td className="col-md-2">{numero}</td>
						<td className="col-md-4">{nombre}</td>
						<td className="col-md-4">{eslogan}</td>
						<td className="col-md-2">
							<h4 className="ml-1" >
								<ReactTooltip place="right" effect="solid" />
								<span onClick={this.dignidadesLista(row)} style={{ cursor: "pointer" }} className="text-dark icon ion-ios-people mr-2" data-tip="Dignidades" />
								<span onClick={this.updateLista(row)} style={{ cursor: "pointer" }} className="text-info icon ion-md-settings mr-2" data-tip="Editar" />
								<span onClick={this.deleteLista(row)} style={{ cursor: "pointer" }} className="text-danger icon ion-md-close-circle mr-1" data-tip="Eliminar" />
							</h4>
						</td>
					</tr>
				)
			})
		} else { return (<tr key={0}><td className="col-md-12">No consta ninguna lista</td></tr>) }
	}


	async componentDidMount() {
		this.getProceso();
		this.getLista();
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
				<DignidadesModal state={this.state} modalToggle={this.modalToggle} />
				<Row>
					<Col>
						<Row className="mt-2">
							<Col sm={{ size: 10, offset: 1 }} >
								<Card className='m-1'>
									<CardBody>
										<Form id="lista-data" onSubmit={this.saveLista} >
											<FormGroup row>
												<Label md={10}><h4> Administrar Listas Electorales </h4></Label>
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
													<Col md="12">
														<FormGroup row>
															<Label md={2} for="lista_name">Nombre</Label>
															<Col md={4}>
																<Input type="text" id="lista_name" name="lista_name" placeholder="Ingrese nombre" value={this.state.lista_name} onChange={this.handleProcessData} />
															</Col>
															<Label md={2} for="lista_proceso">Proceso</Label>
															<Col md={4}>
																<Input type="select" id="lista_proceso" name="lista_proceso" value={this.state.lista_proceso} onChange={this.handleProcessData} >
																	{this.renderOptProceso()}
																</Input>
															</Col>
														</FormGroup></Col>
													<Col md="12"> <FormGroup row>
														<Label md={2} for="lista_eslogan">Eslogan</Label>
														<Col md={10}>
															<Input type="text" id="lista_eslogan" name="lista_eslogan" placeholder="Ejemplo: 'Juntos Venceremos'" value={this.state.lista_eslogan} onChange={this.handleProcessData} />
														</Col>
													</FormGroup></Col>
												</Col>
											</Row>
										</Form>
									</CardBody>
								</Card>
								{alert}
								<Container className="mt-2" >
									<FormGroup className="mb-2 mr-sm-2 mb-sm-0">
										<Input name="seacrh" className="my-2" id="myInput" type="text" placeholder="Buscar.." />{''}
									</FormGroup>
									<table className='table table-hover table-fixed ' >
										<thead>
											<tr>
												<th className="col-md-2">Numero</th>
												<th className="col-md-4">Nombre</th>
												<th className="col-md-4">Eslogan</th>
												<th className="col-md-2">Opciones</th>
											</tr>
										</thead>
										<tbody id="myTable">
											{this.renderTableProceso()}
										</tbody>
									</table>
								</Container>
							</Col>
						</Row>
					</Col>
				</Row>
			</Layout>
		)
	}
}

export class DignidadesModal extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			row_persona: [], id_persona: 0,
			row_cargo_lis: [{ id: 1, nombre: 'Presidente' }, { id: 2, nombre: 'Vicepresidente' }, { id: 3, nombre: 'Secretario' }],
		}
		this.handleProcessData = this.handleProcessData.bind(this)
	}

	handleProcessData(e) {
		const name = e.target.name;
		const value = e.target.value;
		this.setState({ [name]: value });
	}

	getPersona() {
		fetch('/auth/getPersona', { credentials: 'include' })
			.then(res => res.json())
			.then(response => {
				if (!response) return
				this.setState({ row_persona: response.results })
			})
	}

	renderOptPersona() {
		return this.state.row_persona.map((row) => {
			const { id_persona, nombres, apellidos } = row
			return (<option key={id_persona} value={id_persona} >{nombres}{' '}{apellidos} </option>)
		})
	}

	async componentDidMount() {
		this.getPersona();
	}

	renderOpcDignid() {
		const row_cad_l = this.props.state.row_listas_candid
		return this.state.row_cargo_lis.map((row) => {
			const { id, nombre } = row
			const candid  = row_cad_l.find(x => x.cargo == nombre) 
			const persona = (candid) ? candid.nombres+' '+ candid.apellidos : null;
			const data = (persona) ? <span style={{ cursor: "pointer" }} className="text-info icon ion-md-settings" data-tip="Editar" />  : <span style={{ cursor: "pointer" }} className="text-info icon ion-md-person-add" data-tip="Agregar" /> ;
			return (
				<tr key={id} id={id}>
					<td className="col-md-1">{id}</td>
					<td className="col-md-5">{persona}</td>
					<td className="col-md-4">{nombre}</td>
					<td className="col-md-2">
						<h4 className="ml-3" >
							<ReactTooltip place="top" effect="solid" />
							{data}
						</h4>
					</td>
				</tr>
			)
		})
	}


	render() {
		const state1 = this.props.state;
		const nombre_l = state1.row_lista_select.nombre;
		return (
			<Modal isOpen={state1.modal} toggle={this.props.modalToggle} className='modal-lg modal-dialog-centered'>
				<ModalHeader toggle={this.props.modalToggle} >Dignidades de {nombre_l} </ModalHeader>
				<ModalBody>
					<Container className="mt-2" >
						{/* <FormGroup row className='float-right'>
							<Label md={1} for="myInput">Buscar..</Label>
              <Col md={4}>
								<Input name="seacrh" id="myInput" type="text" placeholder="Buscar.." />{''}
							</Col>
						</FormGroup> */}
						<table className='table table-hover table-fixed' >
							<thead>
								<tr>
									<th className="col-md-1">#</th>
									<th className="col-md-5">Persona</th>
									<th className="col-md-4">Dignidad</th>
									<th className="col-md-2">Opciones</th>
								</tr>
							</thead>
							<tbody id="myTable">
								{this.renderOpcDignid()}
							</tbody>
						</table>
					</Container>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={this.props.modalToggle}>Cancel</Button>
				</ModalFooter>
			</Modal>
		)
	}
}