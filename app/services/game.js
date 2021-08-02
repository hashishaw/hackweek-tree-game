import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task, timeout, waitForEvent } from 'ember-concurrency';

const SEASONS = ['spring', 'summer', 'fall', 'winter'];
export default class GameService extends Service {
  constructor() {
    super();
    console.log('constructing game');
    this.species = 'Oak';
    // this.season.perform();
  }

  @service locale;
  @tracked clock = 0;
  @tracked stopClock = -1;
  @tracked paused = false;
  @tracked seasonCount = 0;
  @tracked year = 1;
  // @tracked species = 'oak';

  nextYear() {
    this.year++;
  }
  nextSeason() {
    this.seasonCount++;
    if (this.seasonCount > 0 && this.seasonCount % 4 === 0) {
      this.nextYear();
    }
  }
  pause() {
    this.paused = !this.paused;
  }

  get seasonName() {
    return SEASONS[this.seasonCount % 4];
  }

  tick() {
    this.clock++;
    console.log('tick', this.clock);
    // do stuff
    if (this.clock === 5) {
      this.paused = true;
    }
    return this.clock;
  }
  nextAnimationFrame() {
    console.log('calling next', this);
    let nextTimeToTick = Date.now();
    const now = Date.now();
    if (nextTimeToTick <= now) {
      this.tick();
      nextTimeToTick = now + 1000; // tick rate
    }
    if (this.stopClock > this.clock) {
      requestAnimationFrame(this.nextAnimationFrame.bind(this));
    }
  }

  @task *runSeason(setNumber = 10) {
    this.stopClock = this.clock + setNumber;

    // this.nextAnimationFrame();
    yield this.season.perform();
    this.nextSeason();
  }

  @task *season() {
    console.log('looping');
    while (this.clock < this.stopClock) {
      // tick the tock
      this.tick();
      console.log('tock', this.clock);
      if (this.paused) {
        yield this.ackWaiter.perform();
      }
      yield timeout(1000);
    }
  }

  @task *ackWaiter() {
    // TODO: wait for better event
    let event = yield waitForEvent(document.body, 'click');
    this.paused = false;
    return event;
  }

  buttonTest() {
    this.trigger('fooEvent', { v: Math.random() });
  }
}
