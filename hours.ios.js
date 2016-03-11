'use strict';
var planetaryHours = require("./Modules/planetary_hours.js");

var React = require('react-native');
var {
  StyleSheet,
  View,
  Text,
  Component
} = React;
// Today in Baltimore, MD
var dateNow = new Date();
var tzOffsetMinutes = dateNow.getTimezoneOffset();
//var UTCDate = dateNow.setUTCHours((tzOffsetMinutes / 60) * -1);
var lat = 39.2;
var lng = -76.6;
var timezone = 'America/New York';

var styles = StyleSheet.create({
  description: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000000'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  }
});

class Hours extends Component {
  render() {
    planetaryHours.calculateTimes(dateNow, lat, lng, timezone);
    var sunrise = this.toJSONLocal(planetaryHours.getSunriseTime());
    var sunset = this.toJSONLocal(planetaryHours.getSunsetTime());
    var ruler = planetaryHours.getPlanetaryRuler();
    return (
      <View style={styles.container}>
        <Text style={styles.description}>
          This is the Hours tab.{'\n\n'}
          Today in Baltimore:{'\n'}
          Sunrise is at {sunrise}{'\n'}
          Sunset at {sunset}{'\n'}
          The ruling planet is {ruler}
        </Text>
      </View>
    );
  }
  toJSONLocal (date) {
  	var local = new Date(date);
  	local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  	return local.toJSON().slice(11, -1);
  }
}
module.exports = Hours;
