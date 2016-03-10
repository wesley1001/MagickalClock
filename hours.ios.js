'use strict';

var React = require('react-native');
var {
  StyleSheet,
  View,
  Text,
  Component
} = React;

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
    return (
      <View style={styles.container}>
        <Text style={styles.description}>
          This is the Hours tab.
        </Text>
      </View>
    );
  }
}

module.exports = Hours;
