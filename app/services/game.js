import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout, waitForProperty } from 'ember-concurrency';
import LocaleService from './locale';
import TreeService from './tree';

const TICK_RATE = 1000;
const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const SEASON_DAYS = 10; // TODO: season days should be 91

/**
 * You Are A Tree
 * Game of planning and execution. Has 3 modes: season (action), shopping (marketplace), and planning (inventory)
 */
export default class GameService extends Service {
  constructor() {
    super();
    this.species = 'Sycamore';
    this.locale = new LocaleService({ location: 'Texas' });
    this.tree = new TreeService({ species: 'Sycamore' });
    this.started = false;
  }

  @tracked fastMode = false;
  @tracked tempUnit = 'F';
  // Time-based things tracked here
  @tracked clock = 0;
  @tracked stopClock = -1;
  @tracked paused = false;
  @tracked seasonCount = 0;
  @tracked year = 1;
  @tracked hasEvent = false;
  @tracked gameState = 'INIT'; // 'SEASON', 'STORE', 'ACTIONS'
  // @tracked species = 'oak';
  get gameOver() {
    return this.tree.status === 'Dead';
  }
  get seasonName() {
    return SEASONS[this.seasonCount % 4];
  }

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

  tick() {
    this.clock++;
    // Get weather
    let weather = this.locale.getWeather(this.clock, this.seasonCount);
    this.tree.dailyGrow(weather);
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
    if (!this.gameOver) {
      this.nextSeason();
    }
  }

  @task *runDays() {
    while (this.clock < this.stopClock && !this.gameOver) {
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
}
