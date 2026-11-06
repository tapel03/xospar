import React from 'react';
import { View } from 'react-native';
import { T, Card } from '../../../components/ui';
import { AuthScreen, Heading } from '../components/AuthParts';
import { LEGAL } from '../../more/data/legal';

// DRAFT TEXT. Have a lawyer review it, and check the financial-services rules of every country you launch in.
const RISK = {
  title: 'Risk disclosure',
  updated: '27 October 2026',
  sections: [
    { h: 'High risk of loss', p: 'Trading forex, commodities, indices, stocks and crypto carries a high risk. You can lose some or all of the money you put in. Only trade with money you can afford to lose.' },
    { h: 'No financial advice', p: 'Edgeline provides journaling tools, analysis and scenarios for education. Nothing in the app, including mentor replies, alerts and trade checks, is financial, investment, tax or legal advice, or a recommendation to buy or sell.' },
    { h: 'Past results', p: 'Past performance, statistics and back-tested results do not guarantee future results.' },
    { h: 'Data can be wrong', p: 'Prices, news and calendars come from third parties and can be delayed, incomplete or wrong. Check important information with your broker.' },
    { h: 'Your decisions', p: 'You are fully responsible for every trade you place and for the risk you take. Edgeline and its owners are not responsible for trading losses.' },
  ],
};

export default function AuthLegalScreen({ navigation, route }) {
  const key = route.params?.doc || 'terms';
  const doc = key === 'risk' ? RISK : (LEGAL[key] || LEGAL.terms);
  return (
    <AuthScreen navigation={navigation}>
      <Heading title={doc.title} sub={doc.updated ? `Last updated ${doc.updated}` : undefined} />
      <View style={{ gap: 10 }}>
        {doc.sections.map((s, i) => (
          <Card key={s.h} pad={16} style={{ gap: 6 }}>
            <T v="h3">{i + 1}. {s.h}</T>
            <T v="small" muted>{s.p}</T>
          </Card>
        ))}
      </View>
    </AuthScreen>
  );
}