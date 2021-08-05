import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { rollDie } from '../utils/random';
import { task, timeout } from 'ember-concurrency';

export default class TreeService extends Service {
  constructor() {
    super();
    this.species = 'Sycamore';
    this.waterRetention = 8; // out of 10
    this.sunReq = 8; // # hours needed to create php
    this.taproot = false; // can get water deep in the water table
    this.growthRate = 8; // out of 10, grows fast
  }
  @tracked php = 10; // Photosynthesis points AKA Energy
  @tracked leafCount = 8;
  @tracked diameter = 0.1; // meters
  @tracked trunkHeight = 1; // meters
  @tracked rootEnds = 8; // count of ends that can absorb water
  @tracked rootDepth = 0.5; // meters
  @tracked waterStored = 0.5; // TODO: Unit here?

  get displayHeight() {
    return `${Math.floor(this.trunkHeight * 5)}em`;
  }
  get waterStorageTotal() {
    let area = Math.pow(this.diameter / 2, 2) * Math.PI;
    return Math.ceil(area * this.trunkHeight * 10);
  }
  get efficiency() {
    // Efficiency = leaveCount / sun hours
    return this.leafCount / this.sunReq;
  }
  get status() {
    if (this.php <= 0 && this.waterStored <= 0) {
      console.log('is dead');
      return 'Dead';
    }
    if (this.waterStored < 0.1) return 'Stressed';
    return 'Healthy';
  }
  updatePhp(newPhp) {
    if (newPhp < 0) {
      this.php = 0;
    } else {
      this.php = newPhp;
    }
  }
  @task *growLeaves() {
    console.log('grow leaves');
    let amount = rollDie(5);
    this.updatePhp(this.php - amount);
    yield timeout(1000);
    this.leafCount += amount;
    // how many leaves it grows depends on how many branches, PHP spent, water available
  }
  @task *storeWater(evt, efficiency = 0.4) {
    // TODO: Work in water retention, mass here and water table/root depth
    let waterAmt = this.rootEnds * efficiency;
    let newWater = this.waterStored + waterAmt;
    console.log(this.rootEnds, efficiency, waterAmt);
    console.log({ waterAmt, newWater });
    console.log('store water', newWater);
    if (this.waterStorageTotal < newWater) {
      console.log('not enough capacity', this.waterStorageTotal);
      newWater = this.waterStorageTotal;
    }
    yield timeout(1000);
    this.waterStored = newWater;
    // cost: 1 PhP
    // How much water it can store on an action depends on water table, root depth, and
  }
  @task *growMass(evt, growthSpeed = 1, costRatio = 1) {
    // TODO: calculate better
    let newGrowth = growthSpeed * 0.1;
    let amount = Math.ceil(newGrowth * costRatio);
    console.log('grow mass, php spent:', amount, this.php);
    this.updatePhp(this.php - amount);
    yield timeout(1000);
    this.diameter += newGrowth;
  }
  @action
  makeEnergy(sunshineHours, waterRatio = 5) {
    let php = this.leafCount * Math.floor(sunshineHours / this.sunReq);
    let water = php / waterRatio;
    // console.log('making energy', php, water);
    if (this.waterStored < water) {
      // not enough water for full conversion
      water = this.waterStored;
      php = water * 10;
    }
    this.updatePhp(this.php + php);
    this.waterStored -= water;
    // Can only happen during sunshine hours
    // Will not work if sun levels are less than this.sunReq
    // cost: 2 water, 2 active sun, oxygen
    // which is the limiting factor? Depends on day
    // water + sun / oxygen
  }
  @action
  dailyGrow(weather) {
    if (this.status === 'Dead') {
      return;
    }
    // let water = this.waterStored + Math.floor(weather.rain) * this.rootEnds;
    if (this.status === 'Stressed') {
      this.leafCount -= 1;
      this.updatePhp(this.php - rollDie(5));
      return;
    }
    // Automatic growth that happens based on weather
    this.diameter += 0.1; // TODO: Change based on season
    this.leafCount += rollDie(20) >= 15 ? 1 : 0;
    this.waterStored -= 0.1;
    this.updatePhp(this.php - 1);
    this.makeEnergy(weather.sunshine);
    // TODO: adjust water table
  }
}
