import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import {
  rollRandomSpike,
  rollFibDiv,
  rollSplit,
  rollZed,
} from '../utils/random';
const YEAR_DAYS = 364;
const SEASON_DAYS = 20; //91;

export default class LocaleService extends Service {
  // TODO: Constructor with various base stats/location

  min = 40;
  max = 90;
  @tracked instability = 1;
  @tracked waterTable = 1; // meters below ground
  @tracked isDrought;
  @tracked temp;
  @tracked rain = 0; // TODO: how is this measured?
  @tracked totalRain = 0;
  @tracked sunshine = 0;
  @tracked totalSun = 0;

  resetSeasonalStats() {
    this.totalRain = 0;
    this.totalSun = 0;
  }

  /**
   * Returns the average weather in Fahrenheit
   * @param {number} x the day for which to return weather
   * @returns number
   */
  getTempForDay(x = 0) {
    var amplitude = Math.abs(this.max - this.min) / 2;
    var tempOffset = this.max - amplitude;
    var frequency = YEAR_DAYS / (Math.PI * 2);
    let extreme = rollSplit(this.instability) / 10 + 1;
    let variation = rollRandomSpike(14, true) + rollFibDiv(this.instability);
    // y = (maxF/2 + amplitude) * Math.sin(x/frequency);
    return (
      tempOffset + amplitude * (Math.sin(x / frequency) * extreme) + variation
    );
  }

  /**
   *
   * @param {number} season index of which season is currently running
   * @param {*} difference number, positive or negative, which indicates the change in weather from yesterday
   * @returns
   */
  getRainForSeason(seasonCt, difference = 0) {
    // rain chance is determined by season, weather, and instability
    // amount of rain is determined by weather + instability
    // negative difference means the temperature dropped, which results in higher chance of rain
    let chanceOfRain; // number out of 20 to beat that allows for rain
    switch (seasonCt % 4) {
      case 0: // spring
        chanceOfRain = 14 + rollSplit(this.instability) - difference;
        break;
      case 1: // summer
        chanceOfRain = 4 - rollSplit(this.instability) - difference;
        break;
      case 2: // fall
        chanceOfRain = 12 - rollSplit(this.instability) - difference;
        break;
      default:
        // winter
        chanceOfRain = 7 - rollSplit(this.instability) - difference;
        break;
    }

    if (this.isDrought || rollZed(20) <= chanceOfRain) {
      return 0;
    }

    return rollZed(10) * rollFibDiv(this.instability);
  }

  getSunshineForSeason(seasonCt, rain) {
    // sunshine is determined by season and whether it rained
    // sunshine is measured in hours, cloud cover counts as half
    // cloudCoverage is calculated from rain and season
    let maxSunHours;
    let cloudCoverage;
    switch (seasonCt % 4) {
      case 1: // summer
        maxSunHours = 16;
        cloudCoverage = 0;
        break;
      case 3: // winter
        maxSunHours = 8;
        cloudCoverage = 8;
        break;
      default:
        // fall, spring
        maxSunHours = 12;
        cloudCoverage = 4;
        break;
    }
    let sunshine;
    if (rain > 4) {
      sunshine = rollZed(4);
    } else if (rain > 0) {
      sunshine = rollZed(maxSunHours - 2);
    } else {
      sunshine = rollZed(maxSunHours);
    }
    let result = sunshine - cloudCoverage * rollFibDiv(this.instability);
    // No negative sunshine
    return 0 > result ? 0 : result;
  }

  getWeather(x = 0, season = 0) {
    let prevTemp = this.temp;
    let y = this.getTempForDay(x);
    let rain = this.getRainForSeason(season, y - prevTemp);
    let sunshine = this.getSunshineForSeason(rain);
    console.log(rain, 'rain', sunshine, 'sunshine');

    this.temp = Math.round(y);
    this.rain = rain;
    this.totalRain = this.totalRain + rain;
    this.sunshine = sunshine;
    this.totalSun = this.totalSun + sunshine;

    return {
      x,
      y,
      rain,
      difference: y - prevTemp,
    };
  }

  @task *fastSeason(x, season) {
    let finish = x + SEASON_DAYS;
    while (x <= finish) {
      this.getWeather(x, season);
      yield timeout(300);
      x = x + 1;
    }
    return x;
  }

  // TODO: Move this to tree service
  useWater(thirstLevel = 5) {
    this.waterTable = this.waterTable + rollZed(thirstLevel);
  }
}
