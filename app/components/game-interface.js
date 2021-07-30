import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class GameInterfaceComponent extends Component {
  @service game;
  @tracked pauseScreen = false;

  @action pauseGame() {
    this.game.pause();
    this.pauseScreen = true;
  }
  @action togglePause() {
    this.game.pause();
    this.pauseScreen = !this.pauseScreen;
  }
}
