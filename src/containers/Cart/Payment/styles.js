/** @format */

import { StyleSheet, Dimensions } from 'react-native';
import { Color, Constants } from '@common';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "white",
    flexWrap: 'wrap',
  },
  paymentOption: {
    marginTop: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  optionContainer: {
    width: (width - 48) / 2, // Better spacing calculation
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  btnOption: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedBtnOption: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f0ed',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#a96b4f',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#a96b4f',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  imgOption: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  message: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    padding: 24,
    marginTop: 8,
    paddingTop: 16,
    fontFamily: Constants.fontFamily,
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    borderRadius: 8,
  },
  formCard: {
    marginTop: 10,
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 10,
  },
  btnNextContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  btnNext: {
    marginBottom: 20,
    backgroundColor: '#0091ea',
    height: 40,
    width: 200,
    borderRadius: 20,
  },
  btnNextText: {
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: Color.Text,
    fontFamily: Constants.fontHeader,
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  descriptionView: {
    marginTop: 20,
  },
});
