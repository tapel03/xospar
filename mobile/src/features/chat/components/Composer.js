import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image, Animated, Easing, Platform } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { T, Icon } from '../../../components/ui';

const MIN_H = 22; // one line of text
const MAX_H = 132; // six lines, then the text scrolls inside the box
const WEB = Platform.OS === 'web';

export const sizeLabel = (b) => (!b ? '' : b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`);
export const isPdf = (f) => /pdf/i.test(f.mime || '') || /\.pdf$/i.test(f.name || '');

const timing = (v, to, ms = 180) => Animated.timing(v, { toValue: to, duration: ms, easing: Easing.out(Easing.cubic), useNativeDriver: false });
const clamp01 = { extrapolate: 'clamp' };

/** An attached file or photo. While it is uploading it is dimmed and shows a progress bar. */
export function FileChip({ f, onRemove }) {
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(enter, { toValue: 1, duration: 180, useNativeDriver: true }).start(); }, []);
  const uploading = f.status === 'uploading';
  const pct = Math.round((f.progress || 0) * 100);
  return (
    <Animated.View
      style={{
        opacity: enter, transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
        width: f.kind === 'image' ? 64 : 168, height: 64, borderRadius: 12, borderWidth: 1, borderColor: c.borderStrong,
        backgroundColor: c.elevated2, overflow: 'hidden', justifyContent: 'center',
      }}
    >
      {f.kind === 'image' ? (
        <Image source={{ uri: f.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityLabel={f.name} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 }}>
          <Icon name={isPdf(f) ? 'file-text' : 'file'} size={18} />
          <View style={{ flex: 1 }}>
            <T v="caption" numberOfLines={1} style={{ fontWeight: '600' }}>{f.name}</T>
            <T v="caption" muted numberOfLines={1}>{uploading ? `Uploading ${pct}%` : sizeLabel(f.size) || 'File'}</T>
          </View>
        </View>
      )}
      {uploading ? (
        <>
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: `${c.bg}66` }} />
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: c.border }}>
            <View style={{ width: `${pct}%`, height: 3, backgroundColor: c.lavender }} />
          </View>
        </>
      ) : null}
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${f.name}`} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={12} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

function ToolBtn({ icon, label, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed, hovered }) => [{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : 1 }, (pressed || hovered) && { backgroundColor: c.elevated2 }]}
    >
      <Icon name={icon} size={18} color={c.muted} />
    </Pressable>
  );
}

/**
 * The mentor's message box.
 * Layers: attachments (top), text, toolbar (bottom, never moves), and the caption the screen puts underneath.
 * The box grows upward because it is anchored to the bottom of the screen.
 *
 * Props: value, onChange, onSend, onStop, answering, files, onRemove(id), onPickPhoto, onTakePhoto, onPickFile,
 * onDropFiles(File[]) (web), onGrow, note, maxFiles, placeholder
 */
export default function Composer({ value, onChange, onSend, onStop, answering, files, onRemove, onPickPhoto, onTakePhoto, onPickFile, onDropFiles, onGrow, note, maxFiles = 5, placeholder }) {
  const [focused, setFocused] = useState(false);
  const [drag, setDrag] = useState(false);
  const [h, setH] = useState(MIN_H);
  const dragCount = useRef(0);

  const ringV = useRef(new Animated.Value(0)).current; // 0 quiet, 1 focused, 2 dragging a file over
  const readyV = useRef(new Animated.Value(0)).current; // send button asleep (0) or awake (1)
  const popV = useRef(new Animated.Value(1)).current; // small pop when the button wakes
  const stopV = useRef(new Animated.Value(0)).current; // send arrow (0) or stop square (1)
  const dropV = useRef(new Animated.Value(0)).current; // "Drop to attach" overlay
  const pulse = useRef(new Animated.Value(0)).current; // ring around the stop button

  const hasText = value.trim().length > 0;
  const uploading = files.some((f) => f.status === 'uploading');
  const canSend = !answering && !uploading && (hasText || files.length > 0);
  const awake = canSend || answering;

  useEffect(() => { timing(ringV, drag ? 2 : focused ? 1 : 0).start(); }, [focused, drag]);
  useEffect(() => {
    timing(readyV, awake ? 1 : 0, 160).start();
    if (awake) Animated.sequence([timing(popV, 1.1, 90), timing(popV, 1, 140)]).start();
  }, [awake]);
  useEffect(() => { timing(stopV, answering ? 1 : 0, 160).start(); }, [answering]);
  useEffect(() => { timing(dropV, drag ? 1 : 0, 140).start(); }, [drag]);
  useEffect(() => {
    if (!answering) { pulse.setValue(0); return undefined; }
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: false }));
    loop.start();
    return () => loop.stop();
  }, [answering]);
  useEffect(() => { if (!value) setH(MIN_H); }, [value]);

  // Colours are read here so they follow the light/dark theme.
  const ring = ringV.interpolate({ inputRange: [0, 1, 2], outputRange: [`${c.lavender}00`, `${c.lavender}38`, `${c.lavender}88`] });
  const edge = ringV.interpolate({ inputRange: [0, 1, 2], outputRange: [c.border, c.borderStrong, c.lavender] });
  const btnBg = readyV.interpolate({ inputRange: [0, 1], outputRange: [c.elevated2, c.btn] });
  const btnEdge = readyV.interpolate({ inputRange: [0, 1], outputRange: [c.border, c.btn] });
  const btnScale = Animated.multiply(readyV.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1], ...clamp01 }), popV);
  const sleepingArrow = readyV.interpolate({ inputRange: [0, 1], outputRange: [1, 0], ...clamp01 });
  const awakeArrow = Animated.multiply(readyV, stopV.interpolate({ inputRange: [0, 1], outputRange: [1, 0], ...clamp01 }));

  const onKeyPress = (e) => {
    if (!WEB) return;
    const k = e.nativeEvent;
    if (k.key === 'Enter' && !k.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  // Dropping files from the desktop (web only).
  const hasFiles = (e) => !!(e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files'));
  const dropHandlers = WEB ? {
    onDragEnter: (e) => { if (!hasFiles(e)) return; e.preventDefault(); dragCount.current += 1; setDrag(true); },
    onDragOver: (e) => { if (!hasFiles(e)) return; e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; },
    onDragLeave: () => { dragCount.current = Math.max(0, dragCount.current - 1); if (dragCount.current === 0) setDrag(false); },
    onDrop: (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCount.current = 0;
      setDrag(false);
      const list = Array.from(e.dataTransfer.files || []);
      if (list.length && onDropFiles) onDropFiles(list);
    },
  } : null;

  const full = files.length >= maxFiles;
  const box = (
    <Animated.View style={{ borderRadius: 24, borderWidth: 3, borderColor: ring }}>
      <Animated.View style={{ borderRadius: 21, borderWidth: 1, borderColor: edge, backgroundColor: c.elevated, overflow: 'hidden' }}>
        {/* Layer 1: attachments, shown inside the box */}
        {files.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingTop: 12 }} keyboardShouldPersistTaps="handled">
            {files.map((f) => <FileChip key={f.id} f={f} onRemove={() => onRemove(f.id)} />)}
          </ScrollView>
        ) : null}

        {/* Layer 2: the text. It grows upward, the toolbar below stays put. */}
        <View style={{ paddingHorizontal: 16, paddingTop: files.length ? 10 : 14, paddingBottom: 4 }}>
          <TextInput
            value={value}
            onChangeText={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyPress={onKeyPress}
            onContentSizeChange={(e) => {
              const nh = Math.max(MIN_H, Math.min(MAX_H, Math.ceil(e.nativeEvent.contentSize.height)));
              if (nh !== h) { setH(nh); if (onGrow) onGrow(); }
            }}
            multiline
            scrollEnabled={h >= MAX_H}
            blurOnSubmit={false}
            placeholder={placeholder || (files.length ? 'Add a note about your attachment' : 'Ask about a trade, a pattern or the market')}
            placeholderTextColor={c.faint}
            selectionColor={c.lavender}
            accessibilityLabel="Message the mentor"
            style={[{ height: h, padding: 0, color: c.text, fontSize: 15, lineHeight: 22, textAlignVertical: 'top' }, WEB ? { outlineStyle: 'none', outlineWidth: 0 } : null]}
          />
        </View>

        {/* Layer 3: toolbar, always at the bottom of the box */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 4, paddingBottom: 8, gap: 2 }}>
          <ToolBtn icon="paperclip" label="Attach a file" onPress={onPickFile} disabled={full} />
          <ToolBtn icon="image" label="Attach a photo" onPress={onPickPhoto} disabled={full} />
          {!WEB && onTakePhoto ? <ToolBtn icon="camera" label="Take a photo" onPress={onTakePhoto} disabled={full} /> : null}
          <View style={{ flex: 1 }} />
          {note ? <T v="caption" muted numberOfLines={1} style={{ marginRight: 8, flexShrink: 1 }}>{note}</T> : null}

          <View style={{ width: 40, height: 40 }}>
            {answering ? (
              <Animated.View
                pointerEvents="none"
                style={{ position: 'absolute', left: 0, top: 0, width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: c.lavender, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }] }}
              />
            ) : null}
            <Pressable
              onPress={answering ? onStop : onSend}
              disabled={!answering && !canSend}
              accessibilityRole="button"
              accessibilityLabel={answering ? 'Stop response' : 'Send message'}
              accessibilityState={{ disabled: !answering && !canSend }}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <Animated.View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: btnEdge, backgroundColor: btnBg, alignItems: 'center', justifyContent: 'center', transform: [{ scale: btnScale }] }}>
                <Animated.View style={{ position: 'absolute', opacity: sleepingArrow }}><Icon name="arrow-up" size={18} color={c.faint} /></Animated.View>
                <Animated.View style={{ position: 'absolute', opacity: awakeArrow }}><Icon name="arrow-up" size={18} color={c.btnText} /></Animated.View>
                <Animated.View style={{ position: 'absolute', opacity: stopV, transform: [{ scale: stopV.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1], ...clamp01 }) }] }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: c.btnText }} />
                </Animated.View>
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {/* Dragging a file over the box */}
        <Animated.View
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: dropV, backgroundColor: `${c.elevated}F2`, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.lavender }}
        >
          <Icon name="upload" size={20} color={c.lavender} />
          <T v="h3">Drop to attach</T>
          <T v="caption" muted>Photos, PDFs and text files</T>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );

  // On web the box listens for files dropped on it. "display: contents" keeps the layout unchanged.
  return WEB ? React.createElement('div', { style: { display: 'contents' }, ...dropHandlers }, box) : box;
}