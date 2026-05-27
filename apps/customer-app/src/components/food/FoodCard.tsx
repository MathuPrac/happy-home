import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

interface FoodCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export function FoodCard({ id, name, description, price, image }: FoodCardProps) {
  return (
    <Link href={`/food/${id}`} asChild>
      <Pressable style={styles.card}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.body}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.desc} numberOfLines={2}>
            {description}
          </Text>
          <Text style={styles.price}>LKR {price.toLocaleString()}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: '#2a221c',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.15)',
  },
  image: { width: '100%', height: 120 },
  body: { padding: 12 },
  name: { color: '#f5f0e8', fontSize: 14, fontWeight: '600' },
  desc: { color: '#8a8078', fontSize: 11, marginTop: 4 },
  price: { color: '#d4a853', fontSize: 13, fontWeight: '700', marginTop: 8 },
});
