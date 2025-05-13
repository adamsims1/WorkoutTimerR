import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, Dimensions } from 'react-native';
import CustomText from './CustomText';
import { RFValue } from 'react-native-responsive-fontsize';


interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, style, ...props }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} {...props}>
      <CustomText style={styles.buttonText}>{title}</CustomText>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const fontSize = width > 600 ? RFValue(18) : RFValue(14);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007BFF',
    padding: 9,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize, // Velikost textu se přizpůsobí rozlišení obrazovky
    
  },
});

export default CustomButton;