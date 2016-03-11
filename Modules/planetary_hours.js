/*  PlanetaryHours calculates day and evening hours
*   based on time between sunrise and sunset.
*/
var suncalc = require("./suncalc.js");
var planets = [ 'Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn' ];

var PlanetaryHours = {
  planetaryDays: planets,
  planetaryHours: planets,
  weekdays: [ 'Sun','Mon','Tue','Wed','Thu','Fri','Sat' ],
  colors: ['yellow','purple','red','orange','blue','green','black' ],
  hours: null,
  sunriseTime: null,
  sunsetTime: null,
  sunMinutes: null,
  darkMinutes: null,
  planetaryDayRuler: null,
  calculateTimes(date, lat, lng, timezoneString) {
    var times = suncalc.getTimes(date, lat, lng);
    this.sunriseTime = times.sunrise;
    this.sunsetTime = times.sunset;
    this.planetaryDayRuler = this.getRulerForDay(this.sunriseTime.getDay());
  },
  getSunriseTime: function() {
    return this.sunriseTime;
  },
  getSunsetTime: function() {
      return this.sunsetTime;
  },
  getPlanetaryRuler: function() {
      return this.planetaryDayRuler;
  },
  getSunMinutes: function() {
      return this.sunMinutes;
  },
  getDarkMinutes: function() {
      return this.darkMinutes;
  },
  getHours: function() {
      return this.hours;
  },
  getRulerForDay: function(dayNumber) {
      return this.planetaryDays[dayNumber];
  },
  getHourIndex: function(planet) {
      return this.planetaryHours.indexOf(planet);
  },
  getDayIndex: function(weekday) {
      return this.weekdays.indexOf(weekday);
  },
  currentTime: function(timeNow, startTime, endTime) {
      return (timeNow >= startTime && timeNow <= endTime);
  }

};

module.exports = Object.create(PlanetaryHours);
