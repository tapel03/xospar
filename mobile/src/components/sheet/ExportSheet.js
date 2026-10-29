import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { colors as c } from '../../theme/tokens';
import { Sheet, T, Row, Button, Icon } from '../ui';
import { exportPdf, exportCsv } from '../../utils/exporter';

const FORMATS = [
  ['pdf', 'file-text', 'PDF report', 'A formatted document you can read, print or send.'],
  ['csv', 'grid', 'CSV spreadsheet', 'Raw numbers you can open in Excel or Google Sheets.'],
];

/**
 * Export sheet: pick PDF or CSV, then share the file.
 * doc is a function that returns the document, so the data is built fresh at the moment of export.
 */
export default function ExportSheet({ visible, onClose, title = 'Export', doc, fileName = 'edgeline-export' }) {
  const [busy, setBusy] = useState(null); // 'pdf' | 'csv' | null
  const [error, setError] = useState(null);

  useEffect(() => { if (!visible) { setBusy(null); setError(null); } }, [visible]);

  const run = async (kind) => {
    if (busy) return;
    setBusy(kind);
    setError(null);
    try {
      const d = typeof doc === 'function' ? doc() : doc;
      if (kind === 'pdf') await exportPdf(d, fileName);
      else await exportCsv(d, fileName);
      onClose();
    } catch (e) {
      setError(e && e.message ? e.message : 'The export could not be completed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      footer={<Row style={{ justifyContent: 'flex-end' }}><Button variant="ghost" label="Cancel" onPress={onClose} /></Row>}
    >
      <T v="small" muted>Exports the trades currently shown.</T>

      <View style={{ borderRadius: 14, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
        {FORMATS.map(([kind, icon, label, sub], i) => (
          <Pressable
            key={kind}
            onPress={() => run(kind)}
            disabled={!!busy}
            accessibilityRole="button"
            accessibilityLabel={`Export as ${label}`}
            style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, minHeight: 68, borderTopWidth: i ? 1 : 0, borderTopColor: c.border, opacity: busy && busy !== kind ? 0.4 : 1 }, pressed && { backgroundColor: c.elevated }]}
          >
            <View style={{ width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon} />
            </View>
            <View style={{ flex: 1 }}>
              <T v="h3">{label}</T>
              <T v="caption" muted>{busy === kind ? 'Preparing file…' : sub}</T>
            </View>
            <Icon name="chevron-right" size={16} color={c.muted} />
          </Pressable>
        ))}
      </View>

      {error ? (
        <View style={{ padding: 12, borderRadius: 12, borderWidth: 2, borderColor: c.red }}>
          <T v="small">⚠  {error}</T>
        </View>
      ) : null}
    </Sheet>
  );
}