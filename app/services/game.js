import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
// import { task, timeout, waitForEvent } from 'ember-concurrency';

export default class GameService extends Service {
  constructor() {
    super();
    console.log('constructing game');
    // this.season.perform();
  }

  @tracked clock = 1;
  @tracked stopClock = -1;
  @tracked paused = false;

  tick() {
    this.clock++;
    console.log('tick', this.clock);
    // do stuff
    return this.clock;
  }
  nextAnimationFrame() {
    console.log('calling next', this);
    let nextTimeToTick = Date.now();
    const now = Date.now();
    if (nextTimeToTick <= now) {
      this.tick();
      nextTimeToTick = now + 3000; // tick rate
    }
    if (this.stopClock > this.clock) {
      requestAnimationFrame(this.nextAnimationFrame.bind(this));
    }
  }

  runSeason(setNumber = 10) {
    this.stopClock = this.clock + setNumber;

    this.nextAnimationFrame();
  }

  // @task *season() {
  //   console.log('loping');
  //   while (true) {
  //     // tick the tock
  //     yield this.ackWaiter.perform();
  //     yield timeout(1500);
  //   }
  // }

  // @task *ackWaiter() {
  //   let event = yield waitForEvent(this, 'fooEvent');
  //   return event;
  // }

  // buttonTest() {
  //   this.trigger('fooEvent', { v: Math.random() });
  // }
}
