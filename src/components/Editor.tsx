import React, { Fragment, Props, RefObject, DOMElement } from 'react';
import { inject, observer } from 'mobx-react';
import { IWord, ILine, WordType } from '../Types';
import AutosizeInput from './AutosizeInput';
import './Editor.css';

@inject('store')
@observer
export default class Editor extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.updateLyrics = this.updateLyrics.bind(this);
    }

    updateLyrics(lineIdx: number, wordIdx: number, wordText: string) {
        this.props.store.updateLine(lineIdx, wordIdx, wordText);
    }

    render() {
        return (
            <div>
                {this.props.store.lyrics.lines.map((line: ILine, idx: number) => <Line idx={idx} line={line} updateLyrics={this.updateLyrics}/>)}
            </div>
        );
    }
}

@observer
class Line extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.updateLine = this.updateLine.bind(this);
    }

    updateLine(wordIdx: number, wordText: string) {
        this.props.updateLyrics(this.props.idx, wordIdx, wordText)
    }

    render() {
        const line: ILine = this.props.line;
        return (
            <div className='line'>
                <div className='line-index'>{this.props.idx}</div>
                {line.map((word: IWord, idx: number) => <Word last={idx===line.length-1} idx={idx} word={word} updateLine={this.updateLine}/>)}
            </div>
        );
    }
}

@observer
class Word extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.updateWord = this.updateWord.bind(this);
    }

    updateWord(wordText: string) {
        this.props.updateLine(this.props.idx, wordText);
    }

    render() {
        const word: IWord = this.props.word;
        const element = word.type === WordType.plane ? <Plane last={this.props.last} word={word} updateWord={this.updateWord}/> : <Block word={word}/>
        return (
            <Fragment>
                {element}
            </Fragment>
        );
    }
}

@observer
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

@observer
class Plane extends React.Component<any, any> {
    inputRef: RefObject<HTMLInputElement>;
    constructor(props) {
        super(props);
        this.state = { width: 0 };
        console.log(this.props.last);
        this.handleChange = this.handleChange.bind(this);
        this.setLastWidth = this.setLastWidth.bind(this);

        this.inputRef = React.createRef();
    }

    handleChange(e) {
        this.props.updateWord(e.target.value);
        this.setLastWidth();
        // e.target.style.width = ((e.target.value.length) * 14) + 'px'
    }

    componentDidMount() {
        window.addEventListener('resize', this.setLastWidth);
        console.log('register event');
        this.setLastWidth();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setLastWidth);
        console.log('unregister event');
    }

    setLastWidth() {
        if(this.props.last) {
            const element: any = this.inputRef.current;
            const rect = element.getBoundingClientRect();
            const x = rect.left + window.scrollX;
            const maxWidth = element.parentElement.clientWidth-30;
            console.log(maxWidth-x);
            this.setState({width: maxWidth-x})
        }
    }

    render() {
        let input = <AutosizeInput inputClassName='word plane' onChange={this.handleChange} value={this.props.word.text}/>;
        
        if(this.props.last) {
            let style = { };
            if(this.state.width > 0) style['width'] = this.state.width;
            input = <input className='word plane' style={style} onChange={this.handleChange} value={this.props.word.text} ref={this.inputRef}/>;
        }
        return (
            <Fragment>
                {input}
            </Fragment>
        );
    }
}