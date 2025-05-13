import React from 'react';
import { Text, TextProps, StyleSheet, Dimensions  } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface CustomTextProps extends TextProps {
  theme?: 'light' | 'dark';
}

const CustomText: React.FC<CustomTextProps> = ({ theme = 'light', style, ...props }) => {
  const textStyle = theme === 'light' ? styles.lightText : styles.darkText;
  return <Text {...props} style={[style, textStyle]} />;
};
const { width } = Dimensions.get('window');
const fontSize = width > 600 ? RFValue(10) : RFValue(14);

const styles = StyleSheet.create({
  lightText: {
    fontFamily: 'Inter_400Regular',
    fontSize: fontSize,
    color: '#000', // Example color for light theme
  },
  darkText: {
    fontFamily: 'Inter_400Regular',
    fontSize: fontSize,
    color: '#FFF', // Example color for dark theme
  },
});

export default CustomText;