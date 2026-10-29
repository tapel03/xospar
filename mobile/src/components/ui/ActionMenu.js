import React, { useRef, useState } from 'react';
import { View, Pressable, Modal, useWindowDimensions } from 'react-native';
import { colors as c } from '../../theme/tokens';
import { T, Icon, Button } from '.';

/**
 * One button that opens a small menu of actions.
 * items: [{ label, icon, onPress }]
 */
export default function ActionMenu({ label = 'Options', icon = 'more-horizontal', items }) {
  const ref = useRef(null);
  const { width } = useWindowDimensions();
  const [pos, setPos] = useState(null); // { top, right }

  const openMenu = () => {
    if (ref.current && ref.current.measureInWindow) {
      ref.current.measureInWindow((x, y, w, h) => setPos({ top: y + h + 6, right: Math.max(12, width - (x + w)) }));
    } else {
      setPos({ top: 120, right: 16 });
    }
  };
  const close = () => setPos(null);

  return (
    <>
      <View ref={ref} collapsable={false}>
        <Button small variant="secondary" icon={icon} label={label} onPress={openMenu} />
      </View>
      <Modal visible={!!pos} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={{ flex: 1 }} onPress={close} accessibilityLabel="Close menu">
          {pos ? (
            <View style={{ position: 'absolute', top: pos.top, right: pos.right, minWidth: 210, borderRadius: 14, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.elevated, overflow: 'hidden' }}>
              {items.map((it, i) => (
                <Pressable
                  key={it.label}
                  accessibilityRole="button"
                  onPress={() => { close(); setTimeout(it.onPress, 60); }}
                  style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 14, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }, pressed && { backgroundColor: c.elevated2 }]}
                >
                  <Icon name={it.icon} size={16} />
                  <T v="small" bold>{it.label}</T>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}