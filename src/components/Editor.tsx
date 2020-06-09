import React, { Fragment, Props, RefObject, DOMElement } from 'react';
import { inject, observer } from 'mobx-react';
import { IWord, ILine, WordType } from '../Types';
import AutosizeInput from './AutosizeInput';

import './Editor.css';

function setCaretPosition(ctrl, pos) {
    // Modern browsers
    if (ctrl.setSelectionRange) {
      ctrl.focus();
      ctrl.setSelectionRange(pos, pos);
    // IE8 and below
    } else if (ctrl.createTextRange) {
      var range = ctrl.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }

@inject('store')
@observer
export default class Editor extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    render() {
        console.log('Editor Render!');
        this.props.store.mergePlainWords();
        return (
            <div>
                {this.props.store.lyrics.lines.map((line: ILine, idx: number) => <Line idx={idx} line={line}/>)}
            </div>
        );
    }
}

@inject('store')
@observer
class Line extends React.Component<any, any> {
    remainder: RefObject<any>;
    constructor(props) {
        super(props);
        this.state = {width: 0};
        this.remainder = React.createRef();
    }

    componentDidMount() {
        setTimeout(()=>{this.setLastWidth()}, 10);
        window.addEventListener('resize', this.setLastWidth);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setLastWidth);
    }

    setLastWidth = () => {
        const element: any = this.remainder.current;
        const rect = element.getBoundingClientRect();
        const x = rect.left + window.scrollX;
        const maxWidth = element.parentElement.clientWidth-30;
        this.setState({width: maxWidth-x})
    }

    onClickRemainder = (e) => {
        const line = this.props.store.lyrics.lines[this.props.idx];
        const lastWord = line[line.length-1];
        if(lastWord['ref']) {
            lastWord['ref'].current.focus();
        }
    }

    render() {
        console.log(this.props.idx, 'Line Render!');
        const line: ILine = this.props.line;
        return (
            <div className='line'>
                <div className='line-index'>{this.props.idx}</div>
                {line.map((word: IWord, idx: number) => <Word lineIdx={this.props.idx} idx={idx} word={word} updateRemainder={this.setLastWidth}/>)}
                <div className='remainder' ref={this.remainder} style={{width: this.state.width}} onClick={this.onClickRemainder}></div>
            </div>
        );
    }
}

@inject('store')
@observer
class Word extends React.Component<any, any> {
    wordRef: RefObject<any>;
    mouseDown: boolean = false;
    timeout: any;
    constructor(props) {
        super(props);
        this.state = { dragging: false, x: 0, y: 0 };
        this.wordRef = React.createRef();
    }

    updateLyrics = (lineIdx: number, wordIdx: number, wordText: string) => {
        this.props.updateRemainder();
        this.props.store.updateLine(lineIdx, wordIdx, wordText);
    }

    updateRef = (lineIdx: number, wordIdx: number, ref: RefObject<any>) => {
        this.props.store.updateRef(lineIdx, wordIdx, ref);
    }

    componentDidMount() {
        this.updateRef(this.props.lineIdx, this.props.idx, this.wordRef);
    }

    componentDidUpdate() {
        this.updateRef(this.props.lineIdx, this.props.idx, this.wordRef);
    }

    handleChange = (e) => {
        this.updateLyrics(this.props.lineIdx, this.props.idx, e.target.value);
    }

    onKeyDown = (e) => {
        const element = this.wordRef.current;
        console.log(e.keyCode);
        if(e.keyCode === 37) { // left
            if(element.selectionStart == 0) {
                e.preventDefault();
                console.log('왼쪽 텍스트로')
                this.props.store.prevRef(this.props.lineIdx, this.props.idx);
            }
        }
        if(e.keyCode === 39) { // right
            if(element.selectionEnd == this.props.word.text.length) {
                e.preventDefault();
                console.log('오른쪽 텍스트로')
                this.props.store.nextRef(this.props.lineIdx, this.props.idx);
            }
        }
        if(e.keyCode === 38) { // up
            e.preventDefault();
            console.log('위 텍스트로',element.selectionStart)
            this.props.store.upperRef(this.props.lineIdx, this.props.idx, element.selectionStart);
        }
        if(e.keyCode === 40) { // down
            e.preventDefault();
            console.log('아래 텍스트로',element.selectionStart)
            this.props.store.lowerRef(this.props.lineIdx, this.props.idx, element.selectionStart);
        }
        if(e.keyCode === 13) {
            e.preventDefault();
            console.log('엔터')
            this.props.store.newLine(this.props.lineIdx, this.props.idx, element.selectionStart);
        }
        if(e.keyCode == 8) {
            if(element.selectionStart == 0) {
                e.preventDefault();
                this.props.store.removeFromFirst(this.props.lineIdx, this.props.idx);
            }
        }
        if((e.ctrlKey && e.keyCode == 66) || (e.metaKey && e.keyCode == 66)) {
            e.preventDefault();
            const text = window.getSelection()?.toString();
            if(text) {
                console.log('블록 생성', element.selectionStart, element.selectionEnd);
                this.props.store.plainToBlock(this.props.lineIdx, this.props.idx, element.selectionStart, element.selectionEnd);
            }
            else {
                console.log('블록 지정 안됨');
            }
        }
    }

    blockDoubleClick = (e) => {
        this.props.store.blockToPlain(this.props.lineIdx, this.props.idx);
    }

    onMouseDown = (e) => {
        e.persist();
        this.mouseDown = true;
        console.log('down');
        window.addEventListener('mouseup', this.onMouseUp);
        this.timeout = setTimeout(() => {
            console.log('timeout');
            if(this.mouseDown) {
                console.log('timeout2');
                const rect = this.wordRef.current.getBoundingClientRect();
                this.setState({dragging: true, x: e.clientX-(rect.width/2), y: e.clientY-(rect.height/2)});
                window.addEventListener('mousemove', this.onMouseMove);
                setTimeout(()=>{this.props.updateRemainder()}, 10);
                this.props.store.startDrag(this.props.lineIdx, this.props.idx);
                this.timeout = undefined;
            }
        }, 200);
    }

    onMouseMove = (e) => {
        if(this.state.dragging) {
            const rect = this.wordRef.current.getBoundingClientRect();
            this.setState({x: e.clientX-(rect.width/2), y: e.clientY-(rect.height/2)})
        }
    }
    
    onMouseUp = (e) => {
        if(this.mouseDown) {
            console.log('up');
            this.mouseDown = false;
        }
        if(this.timeout) {
            console.log('cleartimeout');
            clearTimeout(this.timeout);
            this.timeout = undefined;
            window.removeEventListener('mouseup', this.onMouseUp);
            return;
        }
        this.setState({dragging: false, x: 0, y: 0})

        this.props.store.stopDrag();

        setTimeout(()=>{this.props.updateRemainder()}, 10);

        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
    }

    onPointerMove = (e) => {
        if(this.props.store.drag.dragging) {
            const element = this.wordRef.current;

            const rect = this.wordRef.current.getBoundingClientRect();
            const length : number = this.props.word.text.length;

            const pre = e.clientX-rect.left;
            const width = rect.width;

            const b = pre/width;

            const caret = parseInt((Math.round(length*b)).toString(), 10);
            this.props.store.onDrag(this.props.lineIdx, this.props.idx, caret);
            setCaretPosition(this.wordRef.current, caret);
        }
    }
    getWordElement = () => {
        const word = this.props.word;
        if(this.props.word.type === WordType.block) {
            return (
                <div className={this.state.dragging ? 'dragging word block' : 'word block'} style={this.state.dragging ? {left: this.state.x, top: this.state.y} : {}}
                onMouseDown={this.onMouseDown}
                onDoubleClick={this.blockDoubleClick} ref={this.wordRef}>
                    {word.text}
                </div>
            );
        }
        else {
            return <AutosizeInput inputClassName='word plain' onChange={this.handleChange} onPointerMove={this.onPointerMove}
            onKeyDown={this.onKeyDown} value={this.props.word.text} inputRef={this.wordRef}/>;
        }
    }

    render() {
        // console.log(this.props.lineIdx, this.props.idx, 'Word Render!');
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
// class Plain extends React.Component<any, any> {
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
//         let input = <AutosizeInput inputClassName='word plain' onChange={this.handleChange} value={this.props.word.text}/>;
        
//         if(this.props.last) {
//             let style = { };
//             if(this.state.width > 0) style['width'] = this.state.width;
//             input = <input className='word plain' style={style} onChange={this.handleChange} value={this.props.word.text} ref={this.inputRef}/>;
//         }
//         return (
//             <Fragment>
//                 {input}
//             </Fragment>
//         );
//     }
// }