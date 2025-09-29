/** @format */

import React, {useEffect, useRef} from 'react';
import {View, Animated, Dimensions} from 'react-native';
import {withTheme} from '@common';

const {width} = Dimensions.get('window');

const SkeletonLoader = ({theme, style, height = 200, borderRadius = 15}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#999999', '#d2d2d2'], // Gradient dari #e39c7a ke warna yang lebih terang
  });

  return (
    <View style={[style, {height, borderRadius, overflow: 'hidden'}]}>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor,
          borderRadius,
        }}
      />
    </View>
  );
};

export default withTheme(SkeletonLoader);
