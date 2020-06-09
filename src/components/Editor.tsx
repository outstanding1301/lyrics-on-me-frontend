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
    }

    render() {
        console.log('Editor Render!');
        return (
            <div>
                {this.props.store.lyrics.lines.map((line: ILine, idx: number) => <Line idx={idx} line={line}/>)}
            </div>
        );
    }
}

@observer
class Line extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    render() {
        console.log(this.props.idx, 'Line Render!');
        const line: ILine = this.props.line;
        return (
            <div className='line'>
                <div className='line-index'>{this.props.idx}</div>
                {line.map((word: IWord, idx: number) => <Word lineIdx={this.props.idx} last={idx===line.length-1} idx={idx} word={word}/>)}
            </div>
        );
    }
}

@inject('store')
@observer
class Word extends React.Component<any, any> {
    wordRef: RefObject<any>;
    constructor(props) {
        super(props);

        this.state = { width: 0 };
        this.handleChange = this.handleChange.bind(this);
        this.setLastWidth = this.setLastWidth.bind(this);
        this.getWordElement = this.getWordElement.bind(this);
        this.updateLyrics = this.updateLyrics.bind(this);
        this.updateRef = this.updateRef.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        this.wordRef = React.createRef();
    }

    updateLyrics(lineIdx: number, wordIdx: number, wordText: string) {
        this.props.store.updateLine(lineIdx, wordIdx, wordText);
    }

    updateRef(lineIdx: number, wordIdx: number, ref: RefObject<any>) {
        this.props.store.updateRef(lineIdx, wordIdx, ref);
    }

    componentDidMount() {
        this.updateRef(this.props.lineIdx, this.props.idx, this.wordRef);
        this.setLastWidth();
        if(this.props.last) {
            window.addEventListener('resize', this.setLastWidth);
            console.log('register event');
        }
    }

    componentWillUnmount() {
        if(this.props.last) {
            window.removeEventListener('resize', this.setLastWidth);
            console.log('unregister event');
        }
    }

    componentDidUpdate() {
        this.updateRef(this.props.lineIdx, this.props.idx, this.wordRef);
    }

    handleChange(e) {
        this.updateLyrics(this.props.lineIdx, this.props.idx, e.target.value);
        this.setLastWidth();
        // e.target.style.width = ((e.target.value.length) * 14) + 'px'
    }

    setLastWidth() {
        if(this.props.last) {
            const element: any = this.wordRef.current;
            const rect = element.getBoundingClientRect();
            const x = rect.left + window.scrollX;
            const maxWidth = element.parentElement.clientWidth-30;
            this.setState({width: maxWidth-x})
        }
    }

    onKeyDown(e) {
        const element = this.wordRef.current;
        console.log(e.keyCode);
        if(e.keyCode === 37) { // left
            if(element.selectionStart == 0) {
                e.preventDefault();
                console.log('왼쪽 텍스트로')
                this.props.store.prevRef(this.props.lineIdx, this.props.idx);
                this.setLastWidth();
            }
        }
        if(e.keyCode === 39) { // right
            if(element.selectionEnd == this.props.word.text.length) {
                e.preventDefault();
                console.log('오른쪽 텍스트로')
                this.props.store.nextRef(this.props.lineIdx, this.props.idx);
                this.setLastWidth();
            }
        }
        if(e.keyCode === 38) { // up
            e.preventDefault();
            console.log('위 텍스트로',element.selectionStart)
            this.props.store.upperRef(this.props.lineIdx, this.props.idx, element.selectionStart);
            this.setLastWidth();
        }
        if(e.keyCode === 40) { // down
            e.preventDefault();
            console.log('아래 텍스트로',element.selectionStart)
            this.props.store.lowerRef(this.props.lineIdx, this.props.idx, element.selectionStart);
            this.setLastWidth();
        }
        if(e.keyCode === 13) {
            e.preventDefault();
            console.log('엔터')
            this.props.store.newLine(this.props.lineIdx, this.props.idx, element.selectionStart);
            this.setLastWidth();
        }
    }

    getWordElement() {
        const word = this.props.word;
        if(this.props.word.type === WordType.block) {
            return (
                <div className='word block' ref={this.wordRef}>
                    {word.text}
                </div>
            );
        }
        else {
            if(this.props.last) {
                let style = { };
                if(this.state.width > 0) style['width'] = this.state.width;
                return <input className='word plane' style={style} onChange={this.handleChange} onKeyDown={this.onKeyDown} value={this.props.word.text} ref={this.wordRef}/>;
            }
            else {
                return <AutosizeInput inputClassName='word plane' onChange={this.handleChange} onKeyDown={this.onKeyDown} value={this.props.word.text} inputRef={this.wordRef}/>;
            }
        }
    }

    render() {
        console.log(this.props.lineIdx, this.props.idx, 'Word Render!');
        const element = this.getWordElement();

        return (
            <Fragment>
                {element}
            </Fragment>
        );
    }
}



// @observer
// class Block extends React.Component<any, any> {
//     constructor(props) {
//         super(props);
//     }

//     render() {
//         const word: IWord = this.props.word;
//         return (
//             <div className='word block'>
//                 {word.text}
//             </div>
//         );
//     }
// }

// @observer
// class Plane extends React.Component<any, any> {
//     inputRef: RefObject<HTMLInputElement>;
//     constructor(props) {
//         super(props);
//         this.state = { width: 0 };
//         console.log(this.props.last);
//         this.handleChange = this.handleChange.bind(this);
//         this.setLastWidth = this.setLastWidth.bind(this);

//         this.inputRef = React.createRef();
//     }

//     handleChange(e) {
//         this.props.updateWord(e.target.value);
//         this.setLastWidth();
//         // e.target.style.width = ((e.target.value.length) * 14) + 'px'
//     }

//     componentDidMount() {
//         window.addEventListener('resize', this.setLastWidth);
//         console.log('register event');
//         this.setLastWidth();
//     }

//     componentWillUnmount() {
//         window.removeEventListener('resize', this.setLastWidth);
//         console.log('unregister event');
//     }

//     setLastWidth() {
//         if(this.props.last) {
//             const element: any = this.inputRef.current;
//             const rect = element.getBoundingClientRect();
//             const x = rect.left + window.scrollX;
//             const maxWidth = element.parentElement.clientWidth-30;
//             console.log(maxWidth-x);
//             this.setState({width: maxWidth-x})
//         }
//     }

//     render() {
//         let input = <AutosizeInput inputClassName='word plane' onChange={this.handleChange} value={this.props.word.text}/>;
        
//         if(this.props.last) {
//             let style = { };
//             if(this.state.width > 0) style['width'] = this.state.width;
//             input = <input className='word plane' style={style} onChange={this.handleChange} value={this.props.word.text} ref={this.inputRef}/>;
//         }
//         return (
//             <Fragment>
//                 {input}
//             </Fragment>
//         );
//     }
// }