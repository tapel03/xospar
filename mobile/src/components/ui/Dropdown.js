import React, { useRef, useState } from 'react';
import { View, Pressable, Modal, ScrollView, useWindowDimensions } from 'react-native';
import { colors as c } from '../../theme/tokens';
import { T, Icon } from '.';

const ROW_H = 40;

/**
 * Select-style dropdown. The option list floats over the page (it never pushes other content down).
 * options: string[]   counts: optional { [option]: number } shown next to each option.
 */
export default function Dropdown({ value, options, onChange, counts, width = 190, label }) {
  const ref = useRef(null);
  const { height: winH } = useWindowDimensions();
  const [pos, setPos] = useState(null); // { x, y, w, h }
  const text = (o) => (counts && counts[o] != null ? `${o}  ${counts[o]}` : o);

  const openMenu = () => {
    if (ref.current && ref.current.measureInWindow) {
      ref.current.measureInWindow((x, y, w, h) => setPos({ x, y, w, h }));
    } else {
      setPos({ x: 16, y: 120, w: typeof width === 'number' ? width : 190, h: 38 });
    }
  };
  const close = () => setPos(null);

  let menuTop = 0;
  let menuMax = 0;
  if (pos) {
    const want = Math.min(options.length * ROW_H, 320);
    const below = winH - (pos.y + pos.h + 6) - 16;
    const above = pos.y - 6 - 16;
    if (below >= want || below >= above) {
      menuTop = pos.y + pos.h + 4;
      menuMax = Math.max(ROW_H, Math.min(want, below));
    } else {
      menuMax = Math.max(ROW_H, Math.min(want, above));
      menuTop = pos.y - 4 - menuMax;
    }
  }

  return (
    <View style={{ width }}>
      <View ref={ref} collapsable={false}>
        <Pressable
          onPress={pos ? close : openMenu}
          accessibilityRole="button"
          accessibilityLabel={label || 'Filter'}
          style={{ height: 38, borderRadius: 8, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.elevated, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <T v="small">{text(value)}</T>
          <Icon name={pos ? 'chevron-up' : 'chevron-down'} size={14} color={c.muted} />
        </Pressable>
      </View>

      <Modal visible={!!pos} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={{ flex: 1 }} onPress={close} accessibilityLabel="Close menu">
          {pos ? (
            <View
              style={{ position: 'absolute', left: pos.x, top: menuTop, width: pos.w, maxHeight: menuMax, borderRadius: 8, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.elevated, overflow: 'hidden' }}
            >
              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {options.map((o, n) => (
                  <Pressable
                    key={o}
                    onPress={() => { onChange(o); close(); }}
                    style={({ pressed }) => [{ minHeight: ROW_H, paddingHorizontal: 12, justifyContent: 'center', borderTopWidth: n ? 1 : 0, borderTopColor: c.border, backgroundColor: o === value ? c.elevated2 : 'transparent' }, pressed && { opacity: 0.7 }]}
                  >
                    <T v="small" bold={o === value}>{text(o)}</T>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}