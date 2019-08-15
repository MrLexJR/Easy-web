import React from 'react'
import Router from 'next/router'
import Select from 'react-select'
import Layout from '../components/layout'
import Session from '../utils/session'
import ReactTooltip from 'react-tooltip'
import $ from 'jquery'
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Card, CardBody, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { constants } from 'zlib';
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
			rows_proceso: [], row_listas_a: [], row_lista_select: [], row_listas_candid: [], row_persona: [], options_cand: [], cand_bc: [],
			row_cargo_lis: [{ id: 1, nombre: 'Presidente' }, { id: 2, nombre: 'Vicepresidente' }, { id: 3, nombre: 'Tesorero' }],
			lista_img: '/static/part_polit.png', selectedFile: null,
			lista_name: '', lista_eslogan: '', lista_proceso: 0, nombre_proceso: '', lista_numero: '',
			message: null, messageStyle: null, modal: false, showCandid: false,
			selectedOption_Presi: null, selectedOption_VicePresi: null, selectedOption_Secre: null,
			isDisabled1: true, isDisabled2: true, isDisabled3: true,
		}
		this.handleChangeImg = this.handleChangeImg.bind(this)
		this.handleProcessData = this.handleProcessData.bind(this)
		this.saveLista = this.saveLista.bind(this)
		this.updateLista = this.updateLista.bind(this)
		this.deleteLista = this.deleteLista.bind(this)
		this.modalToggle = this.modalToggle.bind(this)
		this.handleChangePresi = this.handleChangePresi.bind(this)
		this.handleChangeVice = this.handleChangeVice.bind(this)
		this.handleChangeSecre = this.handleChangeSecre.bind(this)
	}

	modalToggle() { this.setState(prevState => ({ modal: !prevState.modal })); }

	CerrarSelect = () =>{
		this.setState({ showCandid: false });
	}

	CleanSelect = () => {
		this.setState(state => ({ isDisabled1: false, isDisabled2: false, isDisabled3: false, selectedOption_Presi: null, selectedOption_VicePresi: null, selectedOption_Secre: null, }));
		this.getPersona();  
	}

	handleChangePresi = selectedOption_Presi => {
		this.setState({ selectedOption_Presi });
		this.setState(state => ({ isDisabled1: !state.isDisabled1 }));
		var index = this.state.options_cand.indexOf(selectedOption_Presi); const array = this.state.options_cand.slice(); array[index].isDisabled = true; this.setState({ options_cand: array });
	};

	handleChangeVice = selectedOption_VicePresi => {
		this.setState({ selectedOption_VicePresi });
		this.setState(state => ({ isDisabled2: !state.isDisabled2 }));
		var index = this.state.options_cand.indexOf(selectedOption_VicePresi); const array = this.state.options_cand.slice(); array[index].isDisabled = true; this.setState({ options_cand: array });
	};
	handleChangeSecre = selectedOption_Secre => {
		this.setState({ selectedOption_Secre });
		this.setState(state => ({ isDisabled3: !state.isDisabled3 }));
		var index = this.state.options_cand.indexOf(selectedOption_Secre); const array = this.state.options_cand.slice(); array[index].isDisabled = true; this.setState({ options_cand: array });
	};

	dignidadesLista = (idx) => () => {
		this.setState({ row_lista_select: idx })
		this.modalToggle(); this.getListaCandi(idx.id_lista);
	}

	Clean = () => {
		document.getElementById("lista-data").reset();
		document.getElementById('lista_name').removeAttribute("disabled");
		this.setState({
			lista_img: '/static/part_polit.png', selectedFile: null,
			lista_name: '', lista_eslogan: '', lista_numero: '',
			message: null, messageStyle: null
		});
	}

	saveLista(event) {
		event.preventDefault()
		this.setState({ message: null, messageStyle: null })
		if (!this.state.showCandid) {
			if (!this.state.lista_name || !this.state.lista_eslogan || !this.state.lista_numero) {
				this.setState({ message: 'Complete todos los campos!', messageStyle: 'alert-warning' })
				return
			}
			let data = { lnombre: this.state.lista_name, leslogan: this.state.lista_eslogan, lproceso: parseInt(this.state.lista_proceso), lnumero: parseInt(this.state.lista_numero), limagen: this.state.selectedFile }
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
							this.setState({ showCandid: true }); this.CleanSelect();
							document.getElementById('lista_name').setAttribute("disabled", "disabled");
							Swal.fire('Genial!', 'La lista ' + this.state.lista_name + ' agregado excitosamente!', 'success')
						}
					} else { this.setState({ message: 'Error al intentar guardar', messageStyle: 'alert-danger' }) }
				})
				.catch(error => { this.setState({ message: 'Request Failed!', messageStyle: 'alert-danger' }) })
		} else {
			if (!this.state.selectedOption_Presi || !this.state.selectedOption_VicePresi || !this.state.selectedOption_Secre) { this.setState({ message: 'Complete todos las Dignidades', messageStyle: 'alert-warning' }); return }
			var lista = this.state.row_listas_a.find(x => x.nombre === this.state.lista_name)
			let data = [{ idcandidato: this.state.selectedOption_Presi.value, idproceso: parseInt(this.state.lista_proceso), idlista: lista.id_lista, cargo: 'Presidente' },
			{ idcandidato: this.state.selectedOption_VicePresi.value, idproceso: parseInt(this.state.lista_proceso), idlista: lista.id_lista, cargo: 'Vicepresidente' },
			{ idcandidato: this.state.selectedOption_Secre.value, idproceso: parseInt(this.state.lista_proceso), idlista: parseInt(lista.id_lista), cargo: 'Tesorero' }]
			fetch('auth/saveCandidato', {
				method: 'POST',
				body: JSON.stringify(data),
				headers: { 'Content-Type': 'application/json' }
			})
				.then(res => res.json())
				.then(res => {
					if (res) {
						this.setState({ message: res.message, messageStyle: res.messageStyle })
						if (res.staus == 200) {
							this.Clean();this.CleanSelect();
							Swal.fire('Listo!', 'Los Candidatos se han agregado excitosamente!', 'success')
						}
					} else { this.setState({ message: 'Error al intentar guardar', messageStyle: 'alert-danger' }); return }
				})
				.catch(error => { this.setState({ message: 'Request Failed!', messageStyle: 'alert-danger' }) })
		}
	}

	updateLista = (idx) => () => {
		console.log(idx.nombre)
		this.setState( state => ( { lista_name: idx.nombre, lista_eslogan: idx.eslogan, lista_numero: idx.numero }));
		// document.getElementById("lista_name").value = idx.nombre; 
		// document.getElementById("lista_numero").value = idx.numero; 
		// document.getElementById("lista_eslogan").value = idx.eslogan;
		this.setState({ showCandid: true }); this.CleanSelect();
		document.getElementById('lista_name').setAttribute("disabled", "disabled");
	}

	deleteLista = (idx) => () => {
		console.log(idx)
	}

	handleProcessData(e) {
		const name = e.target.name;
		const value = e.target.value.trim();
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
				var x = response.results.find(x => x.status === 1 )
				var c = response.results.find(x => x.status === 1 && x.tipo === 1);
				var c1 = (c) ? c.id_proceso : 0;
				this.setState({ lista_proceso: c1, nombre_proceso: x.nombre })
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

	getPersona() {
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
							<h4>
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
		this.getProceso(); this.getLista(); this.getPersona();
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
												<Label md={10}><h4> Administrar Listas Electorales del Proceso <span className='text-info'>{this.state.nombre_proceso}</span> </h4></Label>
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
													<Col md="12">
														<FormGroup row>
															<Label md={2} for="lista_name">Nombre</Label>
															<Col md={6}>
																<Input type="text" id="lista_name" name="lista_name" placeholder="Ejemplo: FNU" value={this.state.lista_name} onChange={this.handleProcessData} />
															</Col>
															<Label md={2} for="lista_numero">Numero</Label>
															<Col md={2}>
																<Input type="text" id="lista_numero" name="lista_numero" placeholder="Ej: 54" value={this.state.lista_numero} onChange={this.handleProcessData} />
															</Col>
														</FormGroup></Col>
													<Col md="12"> <FormGroup row>
														<Label md={2} for="lista_eslogan">Eslogan</Label>
														<Col md={7}>
															<Input type="text" id="lista_eslogan" name="lista_eslogan" placeholder="Ejemplo: 'Juntos Venceremos'" value={this.state.lista_eslogan} onChange={this.handleProcessData} />
														</Col>
														<Col md={3}>
															<Button id='saveData' className='btn-block' color="info" type="submit">
																Crear<span className="icon ion-ios-create ml-2"></span>
															</Button>
														</Col>
													</FormGroup></Col>
													{this.state.showCandid ? <Col >
														<ReactTooltip place="right" effect="solid" />
														<FormGroup row>
															<Col md={11}><h4>Cargos</h4> </Col>
															<Col md={1}><h4>
																<span onClick={this.CerrarSelect} style={{ cursor: "pointer" }} className="text-info icon ion-md-close " data-tip="Cerrar" />
															</h4></Col>
															<Col md={4}>
																<Label for="lista_presidente" >Presidente</Label>
																<Select name="lista_presidente" id="lista_presidente"
																	isDisabled={this.state.isDisabled1} value={this.state.selectedOption_Presi} onChange={this.handleChangePresi} options={this.state.options_cand} />
															</Col>
															<Col md={4}>
																<Label for="lista_vicepresidente">Vicepresidente</Label>
																<Select name="lista_vicepresidente" id="lista_vicepresidente"
																	isDisabled={this.state.isDisabled2} value={this.state.selectedOption_VicePresi} onChange={this.handleChangeVice} options={this.state.options_cand} />
															</Col>
															<Col md={4}>
																<Label for="lista_secretario">Tesorero</Label>
																<Select name="lista_secretario" id="lista_secretario"
																	isDisabled={this.state.isDisabled3} value={this.state.selectedOption_Secre} onChange={this.handleChangeSecre} options={this.state.options_cand} />
															</Col>
														</FormGroup>
														<FormGroup className='d-flex align-items-center justify-content-center' row>
															<Col md={4}>
																<Button id='saveData' className='btn-block' color="success" type="submit">
																	Guardar Todo<span className="icon ion-md-save ml-1"></span>
																</Button>
															</Col>
															<Col md={1}>
																<Button onClick={this.CleanSelect} id='clean' color="secondary" size="sm" data-tip="Limpiar" ><span className="icon ion-md-close" /></Button>
															</Col>
														</FormGroup>
													</Col> : null}
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
	renderOpcDignid() {
		const row_cad_l = this.props.state.row_listas_candid
		if (row_cad_l.length > 0) {
			return this.props.state.row_cargo_lis.map((row) => {
				const { id, nombre } = row
				const candid = row_cad_l.find(x => x.cargo == nombre)
				const persona = (candid) ? candid.nombres + ' ' + candid.apellidos : null;
				return (
					<tr key={id} id={id}>
						<td className="col-md-2">{id}</td>
						<td className="col-md-5">{nombre}</td>
						<td className="col-md-5">{persona}</td>
					</tr>
				)
			})
		} else { return (<tr key={0} id={0}><td className="col-md-12">No hay ingresado los candidatos</td> </tr>) }
	}

	render() {
		const state1 = this.props.state;
		const nombre_l = state1.row_lista_select.nombre;
		return (
			<Modal isOpen={state1.modal} toggle={this.props.modalToggle} className='modal-lg modal-dialog-centered'>
				<ModalHeader toggle={this.props.modalToggle} >Dignidades de {nombre_l} </ModalHeader>
				<ModalBody>
					<Container className="mt-2" >
						<table className='table table-hover table-fixed' >
							<thead>
								<tr>
									<th className="col-md-2">#</th>
									<th className="col-md-5">Dignidad</th>
									<th className="col-md-5">Persona</th>
								</tr>
							</thead>
							<tbody id="myTable" >
								{this.renderOpcDignid()}
							</tbody>
						</table>
					</Container>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={this.props.modalToggle}>Regresar</Button>
				</ModalFooter>
			</Modal>
		)
	}
}

