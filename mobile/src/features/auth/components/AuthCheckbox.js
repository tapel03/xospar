import React from 'react';
import { View, Pressable } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { Icon } from '../../../components/ui';

/**
 * Standard checkbox row. Only the box is tappable, so links inside the label can be pressed
 * without ticking or unticking it. The label shrinks to fit, so it never pushes other items off screen.
 */
export default function AuthCheckbox({ value, onChange, children, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <Pressable
        onPress={() => onChange(!value)}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!value }}
        accessibilityLabel={label}
        style={{ width: 22, height: 22, marginTop: 1, borderRadius: 6, borderWidth: value ? 0 : 1.5, borderColor: c.borderStrong, backgroundColor: value ? c.blue : 'transparent', alignItems: 'center', justifyContent: 'center' }}
      >
        {value ? <Icon name="check" size={14} color="#FFFFFF" /> : null}
      </Pressable>
      <View style={{ flexShrink: 1 }}>{children}</View>
    </View>
  );
}