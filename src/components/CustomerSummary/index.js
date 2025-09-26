/** @format */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {withTheme, Tools} from '@common';
import {useSelector} from 'react-redux';

const CustomerSummary = ({theme}) => {
  const user = useSelector(state => state.user.user);
  const name = Tools.getName(user);

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.card}]}> 
      <View style={styles.item}>
        <Text style={[styles.title, {color: theme.colors.text}]}>Member Club</Text>
        <Text style={[styles.value, {color: theme.colors.text}]}>{name}</Text>
      </View>
      <View style={[styles.separator, {backgroundColor: theme.colors.border || 'rgba(0,0,0,0.1)'}]} />
      <View style={styles.item}>
        <Text style={[styles.title, {color: theme.colors.text}]}>DoB Rewards</Text>
        <Text style={[styles.value, {color: theme.colors.text}]}>327 points</Text>
      </View>
      <View style={[styles.separator, {backgroundColor: theme.colors.border || 'rgba(0,0,0,0.1)'}]} />
      <View style={styles.item}>
        <Text style={[styles.title, {color: theme.colors.text}]}>Vouchers</Text>
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
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 6,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default withTheme(CustomerSummary);


