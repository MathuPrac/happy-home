import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Bell, MapPin, Search } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { FoodCard } from '@/components/food/FoodCard';
import { CATEGORIES, FOODS, PROMOTIONS, USER } from '@/constants/mock-data';

export default function HomeScreen() {
  const popular = FOODS.filter((f) => f.popular);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.locationRow}>
              <MapPin size={12} color="#8a8078" />
              <Text style={styles.locationLabel}>Deliver to</Text>
            </View>
            <Text style={styles.location}>Cinnamon Gardens, C07</Text>
          </View>
          <Link href="/notifications" asChild>
            <Pressable style={styles.iconBtn}>
              <Bell size={20} color="#f5f0e8" />
            </Pressable>
          </Link>
        </View>

        <Text style={styles.greeting}>
          Good evening, <Text style={styles.accent}>{USER.name.split(' ')[0]}</Text>
        </Text>
        <Text style={styles.sub}>What are we craving tonight?</Text>

        <Link href="/search" asChild>
          <Pressable style={styles.search}>
            <Search size={16} color="#8a8078" />
            <Text style={styles.searchText}>Search dishes…</Text>
          </Pressable>
        </Link>
      </View>

      <FlatList
        horizontal
        data={PROMOTIONS}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promoList}
        renderItem={({ item }) => (
          <View style={[styles.promo, { backgroundColor: item.color }]}>
            <Text style={styles.promoTitle}>{item.title}</Text>
            <Text style={styles.promoSub}>{item.subtitle}</Text>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        renderItem={({ item }) => (
          <Link href={`/category/${item.id}`} asChild>
            <Pressable style={styles.category}>
              <Text style={styles.catEmoji}>{item.emoji}</Text>
              <Text style={styles.catName}>{item.name}</Text>
            </Pressable>
          </Link>
        )}
      />

      <Text style={styles.sectionTitle}>Popular now</Text>
      <FlatList
        horizontal
        data={popular}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.foodList}
        renderItem={({ item }) => <FoodCard {...item} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationLabel: { color: '#8a8078', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  location: { color: '#f5f0e8', fontSize: 14, fontWeight: '600' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a221c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  greeting: { color: '#f5f0e8', fontSize: 26, fontWeight: '700', marginTop: 20 },
  accent: { color: '#d4a853' },
  sub: { color: '#8a8078', fontSize: 14, marginTop: 4 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#2a221c',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchText: { color: '#8a8078', fontSize: 14 },
  promoList: { gap: 12, paddingVertical: 16 },
  promo: { width: 260, padding: 20, borderRadius: 16, marginRight: 12 },
  promoTitle: { color: '#1a1410', fontSize: 18, fontWeight: '700' },
  promoSub: { color: 'rgba(26,20,16,0.7)', fontSize: 12, marginTop: 4 },
  sectionTitle: { color: '#f5f0e8', fontSize: 18, fontWeight: '600', marginTop: 8, marginBottom: 12 },
  catList: { gap: 12, paddingBottom: 8 },
  category: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#2a221c',
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.15)',
    minWidth: 88,
  },
  catEmoji: { fontSize: 28 },
  catName: { color: '#f5f0e8', fontSize: 12, marginTop: 8, fontWeight: '500' },
  foodList: { gap: 12, paddingBottom: 24 },
});
