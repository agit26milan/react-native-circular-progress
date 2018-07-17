import React, { Component } from 'react';
import { Animated, ViewPropTypes } from 'react-native';
import CircularFillingProgress from './CircularFillingProgress';
const AnimatedProgress = Animated.createAnimatedComponent(CircularFillingProgress);

export default class AnimatedCircularProgress extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    fill: React.PropTypes.number,
    prefill: React.PropTypes.number,
    tintColor: React.PropTypes.string,
    innerCircleBackgroundColor: React.PropTypes.string,
    innerDiameter: React.PropTypes.number,
    tension: React.PropTypes.number,
    friction: React.PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      chartFillAnimation: new Animated.Value(props.prefill || 0)
    };
  }

  componentDidMount() {
    this.animateFill();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fill !== this.props.fill) {
      this.animateFill();
    }
  }

  render() {
    const { ...other } = this.props;

    return (
      <AnimatedProgress {...other}
                        fill={this.state.chartFillAnimation} />
    );
  }

  performLinearAnimation(toValue, duration) {
    Animated.timing(this.state.chartFillAnimation, {
      toValue,
      duration
    }).start();
  }

  animateFill() {
    const { tension, friction } = this.props;

    Animated.spring(
      this.state.chartFillAnimation,
      {
        toValue: this.props.fill,
        tension,
        friction
      }
    ).start();
  }
}
