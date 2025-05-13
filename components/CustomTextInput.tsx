import React from 'react';
import { TextInput, TextInputProps, StyleSheet, Dimensions } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface CustomTextInputProps extends TextInputProps {
  theme: 'light' | 'dark';
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({ theme, ...props }) => {
  return (
    <TextInput
      {...props}
      style={[
        styles.input,
        theme === 'light' ? styles.lightContainer : styles.darkContainer,
        props.style,
      ]}
      placeholderTextColor={theme === 'light' ? 'gray' : 'lightgray'} // Optional: change placeholder text color based on theme
    />
  );
};
const { width } = Dimensions.get('window');
const fontSize = width > 600 ? RFValue(10) : RFValue(14);

const styles = StyleSheet.create({
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 5,
    marginVertical: 3,
    fontFamily: 'Inter_400Regular',
    fontSize: fontSize,// Velikost textu se přizpůsobí rozlišení obrazovky
    textAlign: 'center', 
  },
  lightContainer: {
    backgroundColor: 'white',
    color: 'black', // Text color for light theme
  },
  darkContainer: {
    backgroundColor: 'black',
    color: 'white', // Text color for dark theme
  },
});

export default CustomTextInput;