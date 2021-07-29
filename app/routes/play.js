import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
const TICK_RATE = 3000;
const TICK_SET = 10;
export default class PlayRoute extends Route {
  @service game;

  initalizeGame() {
    console.log('Initialize');
    const game = this.game;
    // initButtons(game.handleUserAction);

    // let nextTimeToTick = Date.now();
    // function nextAnimationFrame() {
    //   const now = Date.now();
    //   if (nextTimeToTick <= now) {
    //     game.tick();
    //     nextTimeToTick = now + TICK_RATE;
    //   }
    //   requestAnimationFrame(nextAnimationFrame);
    // }
    // nextAnimationFrame();
  }

  // poll = task(function* () {
  //   while (true) {
  //     yield timeout(POLL_INTERVAL_MS);
  //     try {
  //       /* eslint-disable-next-line ember/no-controller-access-in-routes */
  //       yield this.controller.model.reload();
  //       yield this.transitionToTargetRoute();
  //     } catch (e) {
  //       // we want to keep polling here
  //     }
  //   }
  // })
  //   .cancelOn('deactivate')
  //   .keepLatest();

  setupController() {
    console.log('setup');
    this._super(...arguments);
    this.initalizeGame();
  }
}
