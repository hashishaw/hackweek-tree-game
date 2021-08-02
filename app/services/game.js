import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import {
  task,
  timeout,
  waitForEvent,
  waitForProperty,
} from 'ember-concurrency';

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
    while (this.clock < this.stopClock) {
      if (this.paused) {
        yield this.pauseWaiter.perform();
      }
      // tick the tock
      this.tick();
      console.log('tock', this.clock);
      yield timeout(1000);
    }
  }

  pause() {
    this.paused = !this.paused;
  }
  @task *pauseWaiter() {
    yield waitForProperty(this, 'paused', false);
  }

  buttonTest() {
    console.log('button test');
    // this.trigger('barEvent', { v: Math.random() });
  }
}
