'use strict';
var suncalc = require("./suncalc.js");

var React = require('react-native');
var {
  StyleSheet,
  View,
  Text,
  Component
} = React;
// Today in Baltimore, MD
var date = new Date();
var lat = 39.2;
var lng = -76.6;

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
    var result = suncalc.calc(date, lat, lng);
    var sunrise = this.toJSONLocal(result.sunrise);
    var sunset = this.toJSONLocal(result.sunset);
    return (
      <View style={styles.container}>
        <Text style={styles.description}>
          This is the Hours tab.{'\n'}
          Sunrise: {sunrise}{'\n'}
          Sunset: {sunset}
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
