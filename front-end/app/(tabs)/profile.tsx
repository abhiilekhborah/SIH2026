import { StyleSheet, Text, View } from 'react-native';

export default function Search() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Profile and settings</Text>
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
