
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const CATEGORY_PAIRS = {
  Crypto: [
    {
      symbol: "BTC/USD",
      name: "Bitcoin",
      price: "104,250.20",
      change: "+2.8%",
      positive: true,
    },
    {
      symbol: "ETH/USD",
      name: "Ethereum",
      price: "2,568.20",
      change: "-5.2%",
      positive: false,
    },
    {
      symbol: "SUI/USD",
      name: "Sui",
      price: "7.55",
      change: "+2.8%",
      positive: true,
    },
    {
      symbol: "SOL/USD",
      name: "Solana",
      price: "182.40",
      change: "+4.1%",
      positive: true,
    },
    {
      symbol: "BNB/USD",
      name: "BNB",
      price: "612.35",
      change: "+1.6%",
      positive: true,
    },
  ],

  Forex: [
    {
      symbol: "EUR/USD",
      name: "Euro / US Dollar",
      price: "1.0834",
      change: "+0.42%",
      positive: true,
    },
    {
      symbol: "GBP/USD",
      name: "British Pound / US Dollar",
      price: "1.2687",
      change: "-0.18%",
      positive: false,
    },
    {
      symbol: "USD/JPY",
      name: "US Dollar / Japanese Yen",
      price: "148.25",
      change: "+0.31%",
      positive: true,
    },
    {
      symbol: "AUD/USD",
      name: "Australian Dollar / US Dollar",
      price: "0.6542",
      change: "-0.22%",
      positive: false,
    },
  ],

  Indices: [
    {
      symbol: "S&P 500",
      name: "S&P 500 Index",
      price: "5,642.18",
      change: "+0.52%",
      positive: true,
    },
    {
      symbol: "NASDAQ",
      name: "Nasdaq Composite",
      price: "17,825.15",
      change: "+0.84%",
      positive: true,
    },
    {
      symbol: "DOW",
      name: "Dow Jones",
      price: "41,203.45",
      change: "-0.31%",
      positive: false,
    },
    {
      symbol: "FTSE 100",
      name: "FTSE 100",
      price: "8,245.60",
      change: "+0.24%",
      positive: true,
    },
  ],

  Stocks: [
    {
      symbol: "AAPL",
      name: "Apple",
      price: "226.45",
      change: "+1.24%",
      positive: true,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA",
      price: "142.68",
      change: "+2.51%",
      positive: true,
    },
    {
      symbol: "TSLA",
      name: "Tesla",
      price: "348.92",
      change: "-1.12%",
      positive: false,
    },
    {
      symbol: "MSFT",
      name: "Microsoft",
      price: "510.25",
      change: "+0.65%",
      positive: true,
    },
  ],
};

export default function MarketCategoryDetailScreen({ navigation, route }) {
  const category = route?.params?.category || "Crypto";

  const pairs = CATEGORY_PAIRS[category] || [];

  return (
    <View style={styles.container}>

      {/* =========================
          HEADER
      ========================== */}
      <View style={styles.header}>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.title}>
          {category}
        </Text>

        <View style={styles.headerSpacer} />

      </View>


      {/* =========================
          TRADING PAIRS
      ========================== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <Text style={styles.sectionTitle}>
          Trading Pairs
        </Text>

        {pairs.map((pair) => (
          <Pressable
            key={pair.symbol}
            style={({ pressed }) => [
              styles.pairRow,
              pressed && styles.pairPressed,
            ]}
          >

            <View style={styles.pairLeft}>

              <View style={styles.icon}>
                <Text style={styles.iconText}>
                  {pair.symbol.charAt(0)}
                </Text>
              </View>

              <View>
                <Text style={styles.symbol}>
                  {pair.symbol}
                </Text>

                <Text style={styles.name}>
                  {pair.name}
                </Text>
              </View>

            </View>


            <View style={styles.pairRight}>

              <Text style={styles.price}>
                {pair.price}
              </Text>

              <Text
                style={[
                  styles.change,
                  {
                    color: pair.positive
                      ? "#39E6C0"
                      : "#FF4D67",
                  },
                ]}
              >
                {pair.positive ? "↑ " : "↓ "}
                {pair.change}
              </Text>

            </View>

            <Ionicons
              name="chevron-forward"
              size={17}
              color="#59636D"
            />

          </Pressable>
        ))}

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },

  headerSpacer: {
    flex: 1,
  },

  content: {
    paddingBottom: 30,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },

  pairRow: {
    minHeight: 72,
    marginHorizontal: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  pairPressed: {
    opacity: 0.55,
  },

  pairLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#27313B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  iconText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  symbol: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  name: {
    color: "#777F84",
    fontSize: 10,
    marginTop: 3,
  },

  pairRight: {
    alignItems: "flex-end",
    marginRight: 10,
  },

  price: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  change: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },
});
