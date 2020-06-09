import React, { Fragment, Props } from 'react';
import { inject, observer } from 'mobx-react';
import { IWord, ILine, WordType } from '../Types';
import './Editor.css';

@inject('store')
@observer
export default class Editor extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                {this.props.store.lyrics.lines.map((line: ILine, idx: number) => <Line idx={idx}line={line}/>)}
            </div>
        );
    }
}

class Line extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    render() {
        const line: ILine = this.props.line;
        return (
            <div className='line'>
                <div className='line-index'>{this.props.idx}</div>
                {line.map((word: IWord, idx: number) => <Word idx={idx} word={word}/>)}
            </div>
        );
    }
}

class Word extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    render() {
        const word: IWord = this.props.word;
        const element = word.type === WordType.plane ? <Plane word={word}/> : <Block word={word}/>
        return (
            <Fragment>
                {element}
            </Fragment>
        );
    }
}

class Block extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    render() {
        const word: IWord = this.props.word;
        return (
            <div className='word block'>
                {word.text}
            </div>
        );
    }
}

class Plane extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = { word: props.word };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({word: e.target.value});
    }

    render() {
        const word = this.state.word;
        return (
            <Fragment>
                <input className='word plane' onChange={this.handleChange} value={word.text}/>
            </Fragment>
        );
    }
}