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
      <View style={styles.separator} />
      <View style={styles.item}>
        <Text style={[styles.title, {color: theme.colors.text}]}>DoB Rewards</Text>
        <Text style={[styles.value, {color: theme.colors.text}]}>327 points</Text>
      </View>
      <View style={styles.separator} />
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
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default withTheme(CustomerSummary);


