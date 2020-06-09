import { observable, action } from 'mobx';
import { WordType, IWord } from '../Types';

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

export default class EditorStore {
    @observable lyrics = {
        lines: [
          [
            {type: WordType.plane, text: '123456789'},
            {type: WordType.block, text: 'Block'},
            {type: WordType.plane, text: '123456789'}
          ],
          [
            {type: WordType.plane, text: '123456789'},
            {type: WordType.block, text: 'Block'},
            {type: WordType.plane, text: '123456789'}
          ],
          [
            {type: WordType.plane, text: '123456789'},
            {type: WordType.block, text: 'Block'},
            {type: WordType.plane, text: '123456789'}
          ],
          [
            {type: WordType.plane, text: '123456789'},
            {type: WordType.block, text: 'Block'},
            {type: WordType.plane, text: '123456789'}
          ]
        ]
    };

    @action updateLine = (lineIdx : number, wordIdx : number, wordText : string) => {
        this.lyrics.lines[lineIdx][wordIdx].text = wordText;
    }

    @action updateRef = (lineIdx : number, wordIdx : number, ref : React.RefObject<any>) => {
      console.log(`update ref! ${lineIdx}, ${wordIdx}`, ref);
        this.lyrics.lines[lineIdx][wordIdx]['ref'] = ref;
    }

    @action upperRef = (lineIdx : number, wordIdx : number, offset: number) => {
      let cursor = offset;
      let caret = 0;
      if(lineIdx > 0) {
        let tmp = 0;
        const prevLine = this.lyrics.lines[lineIdx-1];
        const line = this.lyrics.lines[lineIdx];

        for(let i=0;i<wordIdx;i++){
          cursor += line[i].text.length + (line[i].type === WordType.block ? 3 : 0);
        }

        let i;
        for(i=0;i<prevLine.length;i++){
          const wordLength = prevLine[i].text.length + (prevLine[i].type === WordType.block ? 3 : 0);
          tmp += wordLength;
          if(tmp > cursor) {
            tmp -= wordLength;
            caret = cursor-tmp;
            break;
          }
        }
        if(i === prevLine.length) {
          caret = prevLine[--i].text.length;
        }

        let prev = prevLine[i];
        if(prev.type === WordType.plane) {
          if(prev['ref']) {
            const ref = prev['ref'];
            setCaretPosition(ref.current, caret);
          }
        }
        else {
          if(prevLine.length > i+1) {
            prev = prevLine[i+1];
            if(prev['ref']) {
              const ref = prev['ref'];
              setCaretPosition(ref.current, caret);
            }
          }
          else if(i-1 >= 0){
            prev = prevLine[i-1];
            if(prev['ref']) {
              const ref = prev['ref'];
              setCaretPosition(ref.current, caret);
            }
          }
        }
      }
    }

    @action lowerRef = (lineIdx : number, wordIdx : number, offset: number) => {
      let cursor = offset;
      let caret = 0;
      if(lineIdx + 1 < this.lyrics.lines.length) {
        let tmp = 0;
        const nextLine = this.lyrics.lines[lineIdx+1];
        const line = this.lyrics.lines[lineIdx];

        for(let i=0;i<wordIdx;i++){
          cursor += line[i].text.length + (line[i].type === WordType.block ? 3 : 0);
        }
        
        let i: number = 0;
        for(i=0;i<nextLine.length;i++){
          const wordLength = nextLine[i].text.length + (nextLine[i].type === WordType.block ? 3 : 0);
          tmp += wordLength;
          if(tmp > cursor) {
            tmp -= wordLength;
            caret = cursor-tmp;
            break;
          }
        }
        if(i === nextLine.length) {
          caret = nextLine[--i].text.length;
        }

        let prev = nextLine[i];
        if(prev.type === WordType.plane) {
          if(prev['ref']) {
            const ref = prev['ref'];
            setCaretPosition(ref.current, caret);
          }
        }
        else {
          if(nextLine.length > i+1) {
            prev = nextLine[i+1];
            if(prev['ref']) {
              const ref = prev['ref'];
              setCaretPosition(ref.current, caret);
            }
          }
          else if(i-1 >= 0){
            prev = nextLine[i-1];
            if(prev['ref']) {
              const ref = prev['ref'];
              setCaretPosition(ref.current, caret);
            }
          }
        }
      }
    }

    @action prevRef = (lineIdx : number, wordIdx : number) => {
      const words = this.lyrics.lines[lineIdx];
      if(wordIdx-1 >= 0) {
        const prev = words[wordIdx-1]
        if(prev.type === WordType.plane) {
          if(prev['ref']) {
            const ref = prev['ref'];
            setCaretPosition(ref.current, prev.text.length);
          }
        }
        else{
          this.prevRef(lineIdx, wordIdx-1);
        }
      }
      else if(lineIdx-1 >= 0){
        const prevLine = this.lyrics.lines[lineIdx-1];
        const prev = prevLine[prevLine.length-1];
        if(prev.type === WordType.plane) {
          if(prev['ref']) {
            const ref = prev['ref'];
            setCaretPosition(ref.current, prev.text.length);
          }
        }
        else{
          this.prevRef(lineIdx-1, wordIdx);
        }
      }
    }

    @action nextRef = (lineIdx : number, wordIdx : number) => {
      const words = this.lyrics.lines[lineIdx];
      if(words.length > wordIdx+1) {
        const next = words[wordIdx+1];
        if(next.type === WordType.plane) {
          if(next['ref']) {
            const ref = next['ref'];
            setCaretPosition(ref.current, 0);
          }
        }
        else{
          this.nextRef(lineIdx, wordIdx+1);
        }
      }
      else if(this.lyrics.lines.length > lineIdx+1) {
        const nextLine = this.lyrics.lines[lineIdx+1];
        if(nextLine.length > 0) {
          const next = nextLine[0];
          if(next.type === WordType.plane) {
            if(next['ref']) {
              const ref = next['ref'];
              setCaretPosition(ref.current, 0);
            }
          }
        }
      }
    }

    @action newLine = (lineIdx : number, wordIdx : number, position: number) => {
      const line = this.lyrics.lines[lineIdx];
      const wordPre = line[wordIdx].text.substring(0, position);
      const wordPos = line[wordIdx].text.substring(position);

      const newLine = [{type: WordType.plane, text: wordPos}]
      line[wordIdx].text = wordPre;
      line.splice(wordIdx+1).forEach(w => {
        newLine.push(w)
      });
      this.lyrics.lines.splice(lineIdx+1, 0, newLine);

      const timer = setInterval(()=>{
        console.log('TICK');
        const ref = this.lyrics.lines[lineIdx+1][0]['ref'];
        if(ref){
          setCaretPosition(ref.current, 0);
          console.log('DONE');
          clearInterval(timer);
        }
      }, 10);
    }
}