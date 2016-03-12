/*  PlanetaryHours calculates day and evening hours
*   based on time between sunrise and sunset.
*/
var moment = require('moment-timezone');

const SECONDS_IN_ONE_HOUR = 3600.0;
const SECONDS_IN_ONE_DAY = 86400.0;

var suncalc = require("./suncalc.js");
var planets = [ 'Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn' ];

var PlanetaryHours = {
  planetaryDays: planets,
  planetaryHours: planets,
  weekdays: [ 'Sun','Mon','Tue','Wed','Thu','Fri','Sat' ],
  dayColors: ['yellow','purple','red','orange','blue','green','black' ],
  hours: [],
  maxHours: 26,
  sunrise: null,
  sunset: null,
  sunriseTomorrow: null,
  sunsetTomorrow: null,
  sunriseTimeAMPM: null,
  sunsetTimeAMPM: null,
  sunMinutes: null,
  darkMinutes: null,
  planetaryDayRuler: null,
  isToday: false,
  currentDate: null,
  tommorowDate: null,
  noSunrise: false,
  noSunset: false,
  noSunriseOrSunset: false,
  calculateTimes(date, lat, lng, timezoneString) {
    // For future reference, get today's actual date in current timezone.
    var todaysDate = new Date();
    this.isToday = this._isThisToday(date, todaysDate);
    this.currentDate = date;
    this.tommorowDate = this._addDaysToDate(date, 1);
    // var tzOffsetMinutes = date.getTimezoneOffset();
    // var UTCDate = date.setUTCHours((tzOffsetMinutes / 60) * -1);
    //var a = moment.tz(date.getTime(), 'Europe/London');

    // Calulate the sunrise and sunset times for current and next day
    var times = suncalc.getTimes(this.currentDate, lat, lng);
    var tommorowTimes = suncalc.getTimes(this.tommorowDate, lat, lng);
    this.sunrise = times.sunrise;
    this.sunset = times.sunset;
    this.sunriseTomorrow = tommorowTimes.sunrise;
    this.sunsetTomorrow = tommorowTimes.sunset;

    this.sunriseTimeAMPM = this._getTimeAMPM(this.sunrise);
    this.sunsetTimeAMPM = this._getTimeAMPM(this.sunset);
    this.planetaryDayRuler = this.getRulerForDay(this.sunrise.getDay());

    this._checkForNoSunrise(this.sunrise, this.sunset);
    this._checkForNoSunset(this.sunset);

    this._loadHours(date);

  },
  getSunriseTime: function() {
    return this.sunriseTimeAMPM;
  },
  getSunsetTime: function() {
      return this.sunsetTimeAMPM;
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
  },
  _addDaysToDate: function(date, numDays) {
    var result = new Date(date);
    result.setDate(result.getDate() + numDays);
    return result;
  },
  _dateAdd: function(date, interval, unit) {
    var newDate = new Date(date.getTime());
    switch (unit) {
      case 's':
        newDate.setSeconds(newDate.getSeconds() + interval);
        break;
    }
    return newDate;
  },
  _checkForNoSunrise: function(sunrise, sunset) {
    // If sunrise an sunset are at exactly the same time, there is no sunrise :-(
    if (sunrise.toTimeString().substring(0,5) === sunset.toTimeString().substring(0,5)) {
      this.noSunrise = true;
      this.noSunriseOrSunset = true;
      this.sunriseTimeAMPM = 'Sun does not rise';
      this.sunrise = this._setDateToMidnight(this.sunrise);
      this.sunset = this._setDateToMidnight(this.sunset);
      this.maxHours = 25;
    }
  },
  _checkForNoSunset: function(sunset) {

  },
  _getIntervalInSeconds: function(startDate, endDate) {
    return (endDate.getTime() - startDate.getTime()) / 1000;
  },
  _getTimeAMPM: function(date) {
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var ampm = (hour <= 12) ? 'AM' : 'PM';
    // Make hour single digit and 12hr format
    hour = (hour < 10) ? parseInt(hour) : (hour % 12);
    return hour + ':' + minutes + ' ' + ampm;
  },
  _isThisToday: function(dateToCheck, todaysDate) {
    return todaysDate.toDateString() === dateToCheck.toDateString();
  },
  _loadHours: function(date) {
    var sunriseOffset = this._getIntervalInSeconds(this.sunrise, this.sunriseTomorrow);
    var sunriseDifference = (sunriseOffset == 0) ? 0 : (sunriseOffset - SECONDS_IN_ONE_DAY);
    var dawnSecondsOffset = (sunriseDifference == 0) ? 0 : (sunriseDifference / 12);
    var dayIndex = this.getDayIndex(date.getDay());
    // The sunrise hour is the same as the planetaryDayRuler
    var startIndex = this.getHourIndex(this.planetaryDayRuler);
    var currentIndex = startIndex;
    // Get the number of seconds of day and of night
    var sunlightSeconds = this._getIntervalInSeconds(this.sunrise, this.sunset);
    var planetaryHourRuler;
    var dayHourSeconds = (!this.noSunriseOrSunset) ? (sunlightSeconds / 12) : (SECONDS_IN_ONE_HOUR);
    var nightHourSeconds = (120 * 60) - dayHourSeconds + dawnSecondsOffset;
    //*** Get minutes per hour for display in the headers
    var sunMinutes = Math.round(dayHourSeconds / 60);
    var darkMinutes = Math.round(nightHourSeconds / 60);
    var startSeconds = 0;
    var endSeconds =  dayHourSeconds;
    var hourSeconds = dayHourSeconds;
    var startTime = this.sunrise;
    var endTime = this._dateAdd(this.sunrise, startSeconds, 's');
    // Build the array of hours and headers
    var isAfterSunset = false;
    for (i = 0; i < this.maxHours; i++) {
      isAfterSunset = (i > 12 && !this.noSunset) || this.noSunrise;
      hourSeconds = (i > 11 && !this.noSunriseOrSunset) ? nightHourSeconds : dayHourSeconds;
    }

    var foo = 'bar';
  },
  _setDateToMidnight: function(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
  }

};

module.exports = Object.create(PlanetaryHours);
