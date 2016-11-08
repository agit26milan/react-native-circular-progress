import React, { Component } from 'react';
import { View, Platform } from 'react-native';
import { Surface, Shape, Path, Group } from 'react-native/Libraries/ART/ReactNativeART';

const REACT_ART_MOVE_POINT = 0;
const REACT_ART_DRAW_LINE = 2;

const ONE_EIGHT_OF_FILL = 12.5;

const fillForCriticalPoints = {
  start: 0,
  topRightCorner: ONE_EIGHT_OF_FILL,
  oneQuarter: ONE_EIGHT_OF_FILL * 2,
  bottomRightCorner: ONE_EIGHT_OF_FILL * 3,
  half: ONE_EIGHT_OF_FILL * 4,
  bottomLeftCorner: ONE_EIGHT_OF_FILL * 5,
  threeQuaters: ONE_EIGHT_OF_FILL * 6,
  topLeftCorner: ONE_EIGHT_OF_FILL * 7
};

export default class CircularFillingProgress extends Component {
  static propTypes = {
    style: View.propTypes.style,
    fill: React.PropTypes.number.isRequired,
    tintColor: React.PropTypes.string,
    innerCircleBackgroundColor: React.PropTypes.string,
    innerDiameter: React.PropTypes.number,
    topPadding: React.PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      height: 1, // android doesnt like creating views with height 0 so we pick 1 until we can update on layout
      width: 1
    };
  }

  render() {
    const { style, fill, tintColor, innerCircleBackgroundColor, innerDiameter, topPadding } = this.props;
    const { width, height } = this.state;
    // TODO: Modify CircularFillingProgress to take transparent background for the innerCircleBackground color. (create path for circle and fill outer)
    const innerCirclePath = this.circlePath(width / 2, topPadding + innerDiameter / 2, innerDiameter / 2, 0, 360);

    const _fill = this.extractFill(fill);
    const outerFillPath = this.fillPath(_fill);

    return (
      <View style={style}
            onLayout={this.onLayout}>
        <Surface
          width={width}
          height={height}>
          <Group>
            <Shape d={outerFillPath}
                   fill={tintColor} />
            <Shape d={innerCirclePath}
                   fill={innerCircleBackgroundColor}/>
          </Group>
        </Surface>
      </View>
    );
  }

  fillPath = (fill) => {
    const { topPadding, innerDiameter } = this.props;
    const { width, height } = this.state;
    const innerCircleYOrigin = topPadding + innerDiameter / 2;

    const p = Path();
    p.path.push(REACT_ART_MOVE_POINT, width / 2, topPadding + innerDiameter / 2);
    p.path.push(REACT_ART_DRAW_LINE, width / 2, 0);

    if (fill <= fillForCriticalPoints.topRightCorner) {
      const topRightHorizontalRemainingDistance = width / 2 + width / 2 * fill / ONE_EIGHT_OF_FILL;
      p.path.push(REACT_ART_DRAW_LINE, topRightHorizontalRemainingDistance, 0);
      return p;
    }

    p.path.push(REACT_ART_DRAW_LINE, width, 0);

    if ( fill <= fillForCriticalPoints.oneQuarter ) {
      const topRightVerticalRemainingDistance = (fill - fillForCriticalPoints.topRightCorner) * innerCircleYOrigin / ONE_EIGHT_OF_FILL;
      p.path.push(REACT_ART_DRAW_LINE, width, topRightVerticalRemainingDistance);
      return p;
    }

    p.path.push(REACT_ART_DRAW_LINE, width, innerCircleYOrigin);

    if ( fill <= fillForCriticalPoints.bottomRightCorner ) {
      const bottomRightVerticalRemainingDistance = innerCircleYOrigin + (fill - fillForCriticalPoints.oneQuarter) * (height - innerCircleYOrigin) / ONE_EIGHT_OF_FILL;
      p.path.push(REACT_ART_DRAW_LINE, width, bottomRightVerticalRemainingDistance);
      return p;
    }

    p.path.push(REACT_ART_DRAW_LINE, width, height);
    if ( fill <= fillForCriticalPoints.half ) {
      const bottomRightHorizontalRemainingDistance = width - (fill - fillForCriticalPoints.bottomRightCorner) * width / 2 / ONE_EIGHT_OF_FILL;
      p.path.push(REACT_ART_DRAW_LINE, bottomRightHorizontalRemainingDistance, height);
      return p;
    }

    p.path.push(REACT_ART_DRAW_LINE, width / 2, height);

    if (fill <= fillForCriticalPoints.bottomLeftCorner) {
      const bottomLeftHorizontalRemainingDistance = width / 2 - (fill - fillForCriticalPoints.half) * width / 2 / ONE_EIGHT_OF_FILL;
      p.path.push(REACT_ART_DRAW_LINE, bottomLeftHorizontalRemainingDistance, height);
      return p;
    }

    p.path.push(REACT_ART_DRAW_LINE, 0, height);

    if ( fill <= fillForCriticalPoints.threeQuaters ) {
      const bottomLeftVerticalRemainingDistance = height - (fill - fillForCriticalPoints.bottomLeftCorner) * (height - innerCircleYOrigin) / ONE_EIGHT_OF_FILL;
      p.path.push(REACT_ART_DRAW_LINE, 0, bottomLeftVerticalRemainingDistance);
      return p;
    }

    p.path.push(REACT_ART_DRAW_LINE, 0, innerCircleYOrigin);
    if (fill <= fillForCriticalPoints.topLeftCorner ) {
      const topLeftVerticalRemainingDistance = innerCircleYOrigin - (fill - fillForCriticalPoints.threeQuaters) * innerCircleYOrigin / ONE_EIGHT_OF_FILL;
      p.path.push(REACT_ART_DRAW_LINE, 0, topLeftVerticalRemainingDistance);
      return p;
    }

    p.path.push(REACT_ART_DRAW_LINE, 0, 0);

    const topLeftHorizontalRemainingDistance = (fill - fillForCriticalPoints.topLeftCorner) * width / 2 / ONE_EIGHT_OF_FILL;
    p.path.push(REACT_ART_DRAW_LINE, topLeftHorizontalRemainingDistance, 0);
    return p;
  };

  circlePath(cx, cy, r, startDegree, endDegree) {
    const p = Path();
    if (Platform.OS === 'ios') {
      p.path.push(0, cx + r, cy);
      p.path.push(4, cx, cy, r, startDegree * Math.PI / 180, endDegree * Math.PI / 180, 1);
    } else {
      // For Android we have to resort to drawing low-level Path primitives, as ART does not support
      // arbitrary circle segments. It also does not support strokeDash.
      // Furthermore, the ART implementation seems to be buggy/different than the iOS one.
      // MoveTo is not needed on Android
      p.path.push(4, cx, cy, r, startDegree * Math.PI / 180, (startDegree - endDegree) * Math.PI / 180, 0);
    }
    return p;
  }

  extractFill(fill) {
    if (fill < 0.01) {
      return 0;
    } else if (fill > 100) {
      return 100;
    }
    return fill;
  }

  onLayout = (evt) => {
    this.setState({
      width: evt.nativeEvent.layout.width,
      height: evt.nativeEvent.layout.height
    });
  };

}
