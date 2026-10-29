import React from 'react';
import { View, Linking } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { Frame } from '../../../navigation/Frame';
import { Screen, PageTitle, T, Card, Row, Icon } from '../../../components/ui';
import { LEGAL, LICENSES } from '../data/legal';

export default function LegalScreen({ route, navigation }) {
  const key = route.params?.doc || 'privacy';
  const doc = LEGAL[key] || LEGAL.privacy;
  const isLicenses = key === 'licenses';

  return (
    <Frame active="settings">
      <Screen>
        <PageTitle onBack={() => navigation.goBack()} kicker={doc.updated ? `Last updated ${doc.updated}` : 'About'} title={doc.title} />
        <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center', gap: 12 }}>
          {isLicenses ? (
            <>
              <T v="small" muted>{doc.intro}</T>
              {LICENSES.map((l) => (
                <Card key={l.name} pad={14} onPress={() => Linking.openURL(l.url).catch(() => {})}>
                  <Row style={{ justifyContent: 'space-between' }} gap={10}>
                    <View style={{ flex: 1 }}>
                      <T v="h3">{l.name}</T>
                      {l.note ? <T v="small" muted>{l.note}</T> : null}
                      <T v="caption" muted style={{ marginTop: 2 }}>License: {l.license}</T>
                    </View>
                    <Icon name="external-link" size={16} color={c.muted} />
                  </Row>
                </Card>
              ))}
            </>
          ) : doc.sections.map((s, i) => (
            <Card key={s.h} pad={16} style={{ gap: 6 }}>
              <T v="h3">{i + 1}. {s.h}</T>
              <T v="small" muted>{s.p}</T>
            </Card>
          ))}
        </View>
      </Screen>
    </Frame>
  );
}