import { observable, action } from 'mobx';
import { WordType, IWord } from '../Types';
import { number } from 'prop-types';

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
            {type: WordType.plain, text: '1234567890'}
          ],
          [
            {type: WordType.plain, text: 'abcdef'},
            {type: WordType.block, text: 'ghijk'},
            {type: WordType.plain, text: 'lmnopqrstuvwxyz'}
          ],
          [
            {type: WordType.plain, text: 'ㄱㄴㄷㄹㅁㅂㅅ'},
            {type: WordType.plain, text: 'ㅇㅈㅊㅋㅌㅍㅎ'}
          ]
        ]
    };

    @observable drag = {
      dragging: false,
      lineIdx: 0,
      wordIdx: 0,
      lineIdxAt: 0,
      wordIdxAt: 0,
      caret: 0
    }

    @action startDrag = (lineIdx, wordIdx) => {
      this.drag.dragging = true;
      this.drag.lineIdx = lineIdx;
      this.drag.wordIdx = wordIdx;

      console.log('startDrag', lineIdx, wordIdx);
    }


    @action onDrag = (lineIdx, wordIdx, caret) => {
      this.drag.lineIdxAt = lineIdx;
      this.drag.wordIdxAt = wordIdx;
      this.drag.caret = caret;

      console.log('onDrag', lineIdx, wordIdx);
    }

    @action stopDrag = () => {
      this.insertBlock(this.drag.lineIdx, this.drag.wordIdx, this.drag.lineIdxAt, this.drag.wordIdxAt, this.drag.caret);

      this.drag.dragging = false;
      this.drag.lineIdx = 0;
      this.drag.wordIdx = 0;

      console.log('stopDrag');
    }

    @action updateLine = (lineIdx : number, wordIdx : number, wordText : string) => {
        this.lyrics.lines[lineIdx][wordIdx].text = wordText;
    }

    @action updateRef = (lineIdx : number, wordIdx : number, ref : React.RefObject<any>) => {
      // console.log(`update ref! ${lineIdx}, ${wordIdx}`, ref);
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
        if(prev.type === WordType.plain) {
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
        if(prev.type === WordType.plain) {
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
        if(prev.type === WordType.plain) {
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
        if(prev.type === WordType.plain) {
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
        if(next.type === WordType.plain) {
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
          if(next.type === WordType.plain) {
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

      const newLine = [{type: WordType.plain, text: wordPos}]
      line[wordIdx].text = wordPre;
      line.splice(wordIdx+1).forEach(w => {
        newLine.push(w)
      });
      this.lyrics.lines.splice(lineIdx+1, 0, newLine);

      const timer = setInterval(()=>{
        const ref = this.lyrics.lines[lineIdx+1][0]['ref'];
        if(ref){
          setCaretPosition(ref.current, 0);
          clearInterval(timer);
        }
      }, 10);
    }

    @action removeFromFirst = (lineIdx : number, wordIdx : number) => {
      if(wordIdx == 0) {
        if(lineIdx == 0) return;
        const line = this.lyrics.lines.splice(lineIdx, 1)[0];
        const prevLine = this.lyrics.lines[lineIdx-1];
        const prevWord = prevLine[prevLine.length-1];
        const caret = prevWord.text.length;
        line.map(w => prevLine.push(w));
        this.mergePlainWords(lineIdx-1);

        const timer = setInterval(()=>{
          const ref = prevWord['ref'];
          if(ref){
            setCaretPosition(ref.current, caret);
            clearInterval(timer);
          }
        }, 10);
      }
      else {
        const prevWord = this.lyrics.lines[lineIdx][wordIdx-1];
        if(prevWord.type == WordType.block) {
          console.log('블럭 지우기');
          this.removeBlockWord(lineIdx, wordIdx-1);
        }
      }
    }

    @action removeBlockWord = (lineIdx : number, wordIdx : number) => {
      const block = this.lyrics.lines[lineIdx][wordIdx];
      if(block.type !== WordType.block) {
        console.log('블럭이 아닙니다.');
        return;
      }
      const prevWord = this.lyrics.lines[lineIdx][wordIdx-1];
      const caret = prevWord.text.length;

      console.log(caret);

      this.lyrics.lines[lineIdx].splice(wordIdx, 1);

      this.mergePlainWords(lineIdx);

      const timer = setInterval(()=>{
        const ref = prevWord['ref'];
        if(ref){
          setCaretPosition(ref.current, caret);
          clearInterval(timer);
        }
      }, 10);
    }

    @action blockToPlain = (lineIdx : number, wordIdx : number) => {
      const block = this.lyrics.lines[lineIdx][wordIdx];
      if(block.type !== WordType.block) {
        console.log('블럭이 아닙니다.');
        return;
      }

      block.type = WordType.plain;

      this.mergePlainWords(lineIdx);
    }

    @action plainToBlock = (lineIdx : number, wordIdx : number, startIdx: number, endIdx: number) => {
      const word = this.lyrics.lines[lineIdx][wordIdx];
      if(word.type !== WordType.plain) {
        console.log('Plain Text가 아닙니다.');
        return;
      }

      const pre = {type: WordType.plain, text: word.text.substring(0, startIdx)};
      const txt = {type: WordType.block, text: word.text.substring(startIdx, endIdx)};
      const sub = {type: WordType.plain, text: word.text.substring(endIdx)};

      this.lyrics.lines[lineIdx].splice(wordIdx, 1, pre);
      this.lyrics.lines[lineIdx].splice(wordIdx+1, 0, txt);
      this.lyrics.lines[lineIdx].splice(wordIdx+2, 0, sub);

      this.mergePlainWords(lineIdx);
    }

    @action insertBlock = (lineIdx : number, wordIdx : number, lineIdxAt : number, wordIdxAt : number, caret: number) => {
      const word = this.lyrics.lines[lineIdxAt][wordIdxAt];
      console.log(word.text.substring(0, caret), '~', word.text.substring(caret));
      if(word.type !== WordType.plain) {
        console.log('Plain Text가 아닙니다.');
        return;
      }

      const txt = this.lyrics.lines[lineIdx][wordIdx];
      const sub = {type: WordType.plain, text: word.text.substring(caret)};

      if(wordIdxAt > wordIdx) { // 작은곳에서 큰 곳 갈때
        this.lyrics.lines[lineIdxAt].splice(wordIdxAt+1, 0, sub);
        this.lyrics.lines[lineIdxAt].splice(wordIdxAt+1, 0, txt);
        this.lyrics.lines[lineIdxAt][wordIdxAt].text = word.text.substring(0, caret);
  
        this.lyrics.lines[lineIdx].splice(wordIdx, 1);
      }
      else { // 큰 곳에서 작은곳 갈 때
        const block = this.lyrics.lines[lineIdx].splice(wordIdx, 1)[0];
        this.lyrics.lines[lineIdxAt].splice(wordIdxAt+1, 0, sub);
        this.lyrics.lines[lineIdxAt].splice(wordIdxAt+1, 0, block);
        this.lyrics.lines[lineIdxAt][wordIdxAt].text = word.text.substring(0, caret);
      }

      this.mergePlainWords(lineIdxAt);
      this.mergePlainWords(lineIdx);
    }

    @action mergePlainWords = (lineIdx?: number) => {
      if(lineIdx !== undefined) {
        const line = this.lyrics.lines[lineIdx];
        if(line.length == 0) line.unshift({type: WordType.plain, text: ''});
        if(line[0].type === WordType.block) {
          line.unshift({type: WordType.plain, text: ''});
        }
        if(line[line.length-1].type === WordType.block) {
          line.push({type: WordType.plain, text: ''})
        }
        for(let i=0;i<line.length-1;i++) {
          const w1 = line[i];
          const w2 = line[i+1];
          if(w1.type === WordType.plain && w2.type === WordType.plain) {
            w1.text = w1.text + w2.text;
            line.splice(i+1, 1);
            i--;
          }
        }
      }
      else {
        for(let lineIdx=0;lineIdx<this.lyrics.lines.length;lineIdx ++) {
          const line = this.lyrics.lines[lineIdx];
          if(line.length == 0) line.unshift({type: WordType.plain, text: ''});
          if(line[0].type === WordType.block) {
            line.unshift({type: WordType.plain, text: ''});
          }
          if(line[line.length-1].type === WordType.block) {
            line.push({type: WordType.plain, text: ''})
          }
          for(let i=0;i<line.length-1;i++) {
            const w1 = line[i];
            const w2 = line[i+1];
            if(w1.type === WordType.plain && w2.type === WordType.plain) {
              w1.text = w1.text + w2.text;
              line.splice(i+1, 1);
              i--;
            }
          }
        }
      }
    }
}