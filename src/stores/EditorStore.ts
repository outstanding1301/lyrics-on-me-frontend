import { observable, action } from 'mobx';
import { WordType } from '../Types';

export default class EditorStore {
    @observable lyrics = {
        lines: [
          [
            {type: WordType.plane, text: ''},
            {type: WordType.block, text: 'Block'},
            {type: WordType.plane, text: ''},
          ],
          [
            {type: WordType.plane, text: ''},
          ],
        ]
    };

    @action updateLine = (lineIdx : number, wordIdx : number, wordText : string) => {
        this.lyrics.lines[lineIdx][wordIdx].text = wordText;
    }
}