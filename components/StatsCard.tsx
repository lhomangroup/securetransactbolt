import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

export function StatsCard({ icon, title, value, subtitle, color }: StatsCardProps) {
  return (
    <View style={[styles.card, { flex: 1 }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          {icon}
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});