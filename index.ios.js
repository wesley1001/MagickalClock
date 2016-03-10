/**
 * The Magickal Clock
 */
'use strict';

var React = require('react-native');
var Icon = require('react-native-vector-icons/FontAwesome')
var Hours = require('./hours.ios');
var Location = require('./location.ios');
var {
  AppRegistry,
  TabBarIOS,
  Component
} = React;

class MagickalClock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'hours'
    };
  }

  render() {
      return (
        <TabBarIOS selectedTab={this.state.selectedTab}>
          <Icon.TabBarItemIOS
            selected={this.state.selectedTab === 'hours'}
            iconName='hourglass'
            title='The Hours'
            onPress={() => {
                this.setState({
                    selectedTab: 'hours',
                });
            }}>
              <Hours/>
          </Icon.TabBarItemIOS>
          <Icon.TabBarItemIOS
            selected={this.state.selectedTab === 'location'}
            iconName='compass'
            title='Location'
            onPress={() => {
                  this.setState({
                      selectedTab: 'location',
                  });
            }}>
            <Location/>
          </Icon.TabBarItemIOS>
        </TabBarIOS>
      );
    }
}

AppRegistry.registerComponent('MagickalClock', () => MagickalClock);
