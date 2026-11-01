import React from 'react';
import { View, Image } from 'react-native';
import { colors as c } from '../../theme/tokens';
import { T } from '.';

/** Round profile picture. Shows the photo when there is one, otherwise the person's initial. */
export default function Avatar({ photo, initial = '?', size = 48 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.elevated, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {photo ? (
        <Image source={{ uri: photo }} resizeMode="cover" style={{ width: size, height: size }} accessibilityLabel="Profile picture" />
      ) : (
        <T style={{ fontSize: size * 0.42, fontWeight: '700' }}>{initial}</T>
      )}
    </View>
  );
}