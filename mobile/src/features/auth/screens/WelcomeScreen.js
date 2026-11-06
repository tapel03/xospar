import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as c } from '../../../theme/tokens';
import { T, Button, Mark, AmbientBackdrop, useLayout } from '../../../components/ui';

/** First screen for anyone who is not signed in: two choices, sign in or create an account. */
export default function WelcomeScreen({ navigation }) {
  const { medium } = useLayout();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <AmbientBackdrop opacity={0.10} />
      <View style={{ flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', padding: medium ? 32 : 20, justifyContent: 'space-between' }}>
        <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
          <Mark size={72} />
          <T v="display" style={{ fontSize: 38, lineHeight: 44, letterSpacing: -1 }}>Trade with{'\n'}your edge.</T>
          <T muted>Journal your trades, check them against your own rules, and learn from every one.</T>
        </View>

        <View style={{ gap: 12 }}>
          <Button label="Sign in" icon="log-in" onPress={() => navigation.navigate('Login')} />
          <Button variant="secondary" label="Create account" icon="user-plus" onPress={() => navigation.navigate('SignUp')} />
          <T v="caption" muted style={{ textAlign: 'center', marginTop: 4 }}>
            Analysis and scenarios for education, not financial advice.
          </T>
        </View>
      </View>
    </SafeAreaView>
  );
}