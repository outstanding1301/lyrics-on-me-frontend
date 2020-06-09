import { observable, action } from 'mobx';
import { WordType } from '../Types';

export default class EditorStore {
    @observable lyrics = {
        lines: [
          [
            {type: WordType.plane, text: '라인 1 플레인 텍스트 1'},
            {type: WordType.block, text: '라인 1 블록 텍스트 1'},
          ],
          [
            {type: WordType.plane, text: '라인 2 플레인 텍스트 1'},
            {type: WordType.block, text: '라인 2 블록 텍스트 1'},
          ],
        ]
    };

    @action writeLine = (line : number, idx : number, value : string) => {
        this.lyrics.lines[line][idx].text = value;
    }
}