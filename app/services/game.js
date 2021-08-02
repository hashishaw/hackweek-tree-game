import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout, waitForProperty } from 'ember-concurrency';
import LocaleService from './locale';

const TICK_RATE = 700;
const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const SEASON_DAYS = 10; // TODO: season days should be 91
export default class GameService extends Service {
  constructor() {
    super();
    console.log('construct game');
    this.species = 'Sycamore';
    this.locale = new LocaleService({ location: 'Texas' });
    this.started = false;
  }

  @tracked fastMode = true;
  @tracked tempUnit = 'F';
  // Time-based things tracked here
  @tracked clock = 0;
  @tracked stopClock = -1;
  @tracked paused = false;
  @tracked seasonCount = 0;
  @tracked year = 1;
  @tracked hasEvent = false;
  // @tracked species = 'oak';

  nextYear() {
    this.year++;
  }
  nextSeason(fakeCount = false) {
    this.seasonCount++;
    if (this.seasonCount > 0 && this.seasonCount % 4 === 0) {
      this.nextYear();
    }
    if (fakeCount) {
      this.clock += SEASON_DAYS;
    }
  }
  get seasonName() {
    return SEASONS[this.seasonCount % 4];
  }

  tick() {
    this.clock++;
    console.log('tick', this.clock);
    // Get weather
    this.locale.getWeather(this.clock, this.seasonCount);
    // TODO: Adjust env
    // TODO: Tree resources
    // TODO: Get event (non-player pause)
    return this.clock;
  }
  nextAnimationFrame() {
    let nextTimeToTick = Date.now();
    const now = Date.now();
    if (nextTimeToTick <= now) {
      this.tick();
      nextTimeToTick = now + TICK_RATE;
    }
    if (this.stopClock > this.clock) {
      requestAnimationFrame(this.nextAnimationFrame.bind(this));
    }
  }

  @task *runSeason(setNumber = SEASON_DAYS) {
    this.stopClock = this.clock + setNumber;
    this.locale.resetSeasonalStats();

    if (this.fastMode) {
      this.clock++;
      let newClock = yield this.locale.fastSeason.perform(this.clock);
      this.clock = newClock;
    } else {
      yield this.runDays.perform();
    }
    this.nextSeason();
  }

  @task *runDays() {
    while (this.clock < this.stopClock) {
      if (this.paused) {
        yield this.pauseWaiter.perform();
      }
      this.tick();
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
