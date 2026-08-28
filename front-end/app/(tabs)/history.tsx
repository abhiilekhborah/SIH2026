import { StyleSheet, Text, View } from 'react-native';

export default function History() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>History</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
});
