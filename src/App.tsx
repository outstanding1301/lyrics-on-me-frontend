import React from 'react';
import './App.scss';

class Header extends React.Component<any, any> {
  render() {
    return (
      <React.Fragment>
        <header className="header">header here</header>
      </React.Fragment>
    );
  }
}

class SideMenu extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { 
      opened: true
    }
  }

  toggleMenu = () => {
    this.setState((state) => ({opened: !state.opened}));
  }

  render() {
    return (
      <React.Fragment>
        <aside className={`side_menu ${this.state.opened ? '' : 'closed'}`} 
          onClick={this.toggleMenu}>Side Menu Here</aside>
      </React.Fragment>
    );
  }
}

class Title extends React.Component<any, any> {
  render() {
    return (
      <React.Fragment>
        <h1 className='title'>Title</h1>
      </React.Fragment>
    );
  }
}

class Editor extends React.Component<any, any> {
  render() {
    return (
      <React.Fragment>
        <div className='editor' contentEditable="true">
          <strong>Edi</strong>itor
        </div>
      </React.Fragment>
    );
  }
}

class Tools extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { 
      opened: true
    }
  }

  toggleTools = () => {
    this.setState((state) => ({opened: !state.opened}));
  }

  render() {
    return (
      <React.Fragment>
        <div className={`tools ${this.state.opened ? '' : 'closed'}`}
            onClick={this.toggleTools}>Tools</div>
      </React.Fragment>
    );
  }
}

export default class App extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { 
      sideMenuOpen: true,
      toolsOpen: true,
    }
  } 
  render() {
    return (
      <div className="frame">
        <Header />
        <div className="contents">
          <SideMenu />
          <div className="main">
            <div className='wrapper'>
              <Title />
              <Editor />
            </div>
            <Tools />
          </div>
        </div>
      </div>
    );
  }
}