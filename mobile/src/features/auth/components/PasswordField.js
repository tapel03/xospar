import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { T, Row, Icon, s as ui } from '../../../components/ui';

/** Password box with an eye button to show or hide what you typed. */
export default function PasswordField({ label, value, onChangeText, placeholder, onSubmitEditing }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? <T v="label">{label}</T> : null}
      <Row style={[ui.input, { paddingRight: 4 }]} gap={4}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.faint}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={label}
          style={{ flex: 1, color: c.text, fontSize: 14, minHeight: 46 }}
        />
        <Pressable
          onPress={() => setShow(!show)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={show ? 'Hide password' : 'Show password'}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name={show ? 'eye-off' : 'eye'} size={18} color={c.muted} />
        </Pressable>
      </Row>
    </View>
  );
}