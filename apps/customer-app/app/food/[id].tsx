import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { FOODS } from '@/constants/mock-data';

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const food = FOODS.find((f) => f.id === id) ?? FOODS[0];

  return (
    <Screen scroll={false}>
      <Image source={{ uri: food.image }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.name}>{food.name}</Text>
        <Text style={styles.desc}>{food.description}</Text>
        <Text style={styles.price}>LKR {food.price.toLocaleString()}</Text>
        <Pressable style={styles.btn}>
          <Text style={styles.btnText}>Add to cart</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 280 },
  body: { flex: 1, padding: 20 },
  name: { color: '#f5f0e8', fontSize: 28, fontWeight: '700' },
  desc: { color: '#8a8078', fontSize: 15, marginTop: 8, lineHeight: 22 },
  price: { color: '#d4a853', fontSize: 22, fontWeight: '700', marginTop: 16 },
  btn: {
    marginTop: 24,
    backgroundColor: '#d4a853',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#1a1410', fontSize: 16, fontWeight: '700' },
});
