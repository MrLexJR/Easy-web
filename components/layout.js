import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  Collapse, NavLink, Container, Navbar, NavbarBrand,
  NavbarToggler, Nav, NavItem, Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'
import Package from '../package'
import Styles from '../styles/styles.scss'

export default class extends React.Component {

  static propTypes() {
    return {
      //session: React.PropTypes.object.isRequired,
      children: React.PropTypes.object.isRequired,
      fluid: React.PropTypes.boolean
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      isOpen: true
    }
    this.nav_toggle = this.nav_toggle.bind(this);
  }
  nav_toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <React.Fragment>
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{this.props.title || 'Easy-Vote'}</title>
          <style dangerouslySetInnerHTML={{ __html: Styles }} />
        </Head>
        <Navegacion {...this.props} state={this.state} nav_toggle={this.nav_toggle} />
      </React.Fragment>
    )
  }
}

export class Navegacion extends React.Component {
  render() {
    if (this.props.session && this.props.session.loggedin) {
      return (
        <div>
          <Navbar light expand="lg">
            <NavbarBrand href="/">
              <span className="icon ion-md-home mr-1"></span> {Package.name}
            </NavbarBrand>
            <NavbarToggler onClick={this.props.nav_toggle} />
            <Collapse isOpen={this.props.state.isOpen} navbar>
              <SignOutButton {...this.props} />
            </Collapse>
          </Navbar>
          <MainBody fluid={this.props.fluid}>
            {this.props.children}
          </MainBody>
        </div>
      )
    } else {
      return (
        <div>
          <Navbar light expand="lg">
            <NavbarBrand href="/">
              <span className="icon ion-md-home mr-1"></span> {Package.name}
            </NavbarBrand>
          </Navbar>
          <MainBody fluid={this.props.fluid}>
            {this.props.children}
          </MainBody>
        </div>
      )
    }
  }
}

export class MainBody extends React.Component {
  render() {
    return (
      <Container fluid={this.props.fluid} style={{ marginTop: '1em' }}>
        {this.props.children}
        <Container fluid={this.props.fluid}>
          <hr className="mt-1" />
          <p className="text-muted small">
            <Link href="#"><a className="text-muted font-weight-bold"><span className="icon ion-ios-archive" /> {Package.name} {Package.version}</a></Link>
            <span> built with </span>
            <Link href="https://github.com/zeit/next.js"><a className="text-muted font-weight-bold">Next.js {Package.dependencies.next.replace('^', '')}</a></Link>
            <span> &amp; </span>
            <Link href="https://github.com/facebook/react"><a className="text-muted font-weight-bold">React {Package.dependencies.react.replace('^', '')}</a></Link>
            .<span className="ml-2">&copy; {new Date().getYear() + 1900}.</span>
          </p>

        </Container>
      </Container>
    )
  }
}

export class SignOutButton extends React.Component {
  render() {
    if (this.props.session && this.props.session.loggedin) {
      return (
        <Nav className="ml-auto" navbar>
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              <span className="icon ion-md-contact mr-2"></span>{this.props.session.email}
            </DropdownToggle>
            <DropdownMenu className='shadow' right>
              <DropdownItem>
                <span className="icon ion-md-settings mr-1"></span> Preferencias
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem href="/auth/signout">
                <span className="icon ion-md-log-out mr-1"></span> Cerrar Sesion
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
      )
    } else {
      return (
        <span />
      )
    }
  }
}