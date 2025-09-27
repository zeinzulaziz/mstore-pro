/** @format */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {withTheme, Tools} from '@common';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomerSummary = ({theme}) => {
  const user = useSelector(state => state.user.user);
  const name = Tools.getName(user);

  return (
    <View style={[styles.container, {backgroundColor: '#f8f9fa'}]}> 
      <View style={styles.item}>
        <View style={styles.textContainer}>
          <View style={styles.iconContainer}>
            <Icon name="person" size={14} color="#fff" />
          </View>
          <View style={styles.textContent}>
            <Text style={[styles.title, {color: theme.colors.text}]}>Member Club</Text>
            <Text style={[styles.value, {color: theme.colors.text}]}>{name}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.separator, {backgroundColor: theme.colors.border || 'rgba(0,0,0,0.1)'}]} />
      <View style={styles.item}>
        <View style={styles.textContainer}>
          <View style={[styles.iconContainer, {backgroundColor: '#e74c3c'}]}>
            <Icon name="star" size={14} color="#fff" />
          </View>
          <View style={styles.textContent}>
            <Text style={[styles.title, {color: theme.colors.text}]}>DoB Rewards</Text>
            <Text style={[styles.value, {color: theme.colors.text}]}>327 points</Text>
          </View>
        </View>
      </View>
      <View style={[styles.separator, {backgroundColor: theme.colors.border || 'rgba(0,0,0,0.1)'}]} />
      <View style={styles.item}>
        <View style={styles.textContainer}>
          <View style={[styles.iconContainer, {backgroundColor: '#f39c12'}]}>
            <Icon name="local-offer" size={14} color="#fff" />
          </View>
          <View style={styles.textContent}>
            <Text style={[styles.title, {color: theme.colors.text}]}>Vouchers</Text>
            <Text style={[styles.value, {color: theme.colors.text}]}>10+ vouchers</Text>
          </View>
        </View>
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
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 2,
    fontWeight: '500',
    letterSpacing: 0.3,
    textAlign: 'left',
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'left',
  },
});

export default withTheme(CustomerSummary);


