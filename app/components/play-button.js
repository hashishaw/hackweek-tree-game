import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PlayButtonComponent extends Component {
  @service game;

  @action
  runSeason() {
    console.log('running season');
    this.game.runSeason.perform(8);
  }

  @action
  nextSeason() {
    this.game.nextSeason();
  }
}
