/** @format */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {withTheme, Tools, Fonts} from '@common';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomerSummary = ({theme}) => {
  const user = useSelector(state => state.user.user);
  const name = Tools.getName(user);

  return (
    <View style={[styles.container, {backgroundColor: '#fbf2e6'}]}> 
      <View style={styles.item}>
        <View style={styles.labelRow}>
          <View style={styles.iconContainer}>
            <Icon name="person" size={10} color="#fff" />
          </View>
          <Text style={[styles.title, {color: theme.colors.text}]}>Member Club</Text>
        </View>
        <Text style={[styles.value, {color: theme.colors.text}]}>{name}</Text>
      </View>
      <View style={[styles.separator, {backgroundColor: theme.colors.border || 'rgba(0,0,0,0.1)'}]} />
      <View style={styles.item}>
        <View style={styles.labelRow}>
          <View style={[styles.iconContainer, {backgroundColor: '#e74c3c'}]}>
            <Icon name="star" size={10} color="#fff" />
          </View>
          <Text style={[styles.title, {color: theme.colors.text}]}>DoB Rewards</Text>
        </View>
        <Text style={[styles.value, {color: theme.colors.text}]}>327 points</Text>
      </View>
      <View style={[styles.separator, {backgroundColor: theme.colors.border || 'rgba(0,0,0,0.1)'}]} />
      <View style={styles.item}>
        <View style={styles.labelRow}>
          <View style={[styles.iconContainer, {backgroundColor: '#f39c12'}]}>
            <Icon name="local-offer" size={9} color="#fff" />
          </View>
          <Text style={[styles.title, {color: theme.colors.text}]}>Vouchers</Text>
        </View>
        <Text style={[styles.value, {color: theme.colors.text}]}>10+ vouchers</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  item: {
    flex: 1,
    alignItems: 'left',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainer: {
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  separator: {
    width: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: 10,
    opacity: 0.6,
    marginBottom: 5,
    fontWeight: '400',
    letterSpacing: 0.3,
    textAlign: 'left',
    fontFamily: Fonts.regular,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'left',
    fontFamily: Fonts.medium,
  },
});

export default withTheme(CustomerSummary);


