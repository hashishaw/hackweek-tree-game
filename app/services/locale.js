import Service from '@ember/service';
const YEAR_DAYS = 364;
const SEASON_DAYS = 91;

export default class LocaleService extends Service {
  /**
   * Returns the average weather in Fahrenheit
   * @param {number} x
   * @param {number} min weather's minimum in Fahrenheit
   * @param {number} max weather's maximum in Fahrenheit
   * @returns
   */
  getYforX(x = 0, min = 40, max = 90) {
    var amplitude = Math.abs(max - min) / 2;
    var tempOffset = max - amplitude;
    var frequency = YEAR_DAYS / (Math.PI * 2);
    return {
      x,
      y: tempOffset + amplitude * Math.sin(x / frequency),
    };
  }

  plotSeason(min = 40, max = 90, counter = 0, steps = SEASON_DAYS) {
    let x = counter;
    let finish = x + steps;
    let y = 0;
    let coords = [];
    while (x <= finish) {
      let coord = this.getYforX(x, min, max);
      coords.push(coord);
      if (x === 0) {
        console.log('beginning of spring:', y);
      }
      if (x === 91) {
        console.log('peak summer:', y);
      }
      if (x === 182) {
        console.log('beginning fall:', y);
      }
      if (x === 273) {
        console.log('peak winter:', y);
      }

      x = x + 1;
    }
  }
}
