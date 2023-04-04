import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import { Fontisto } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};

export default function App() {
  const [days, setDays] = useState([]);
  const [location, setLocation] = useState({
    city: "Loding...",
    district: "Loding...",
  });
  const [ok, setOk] = useState(true);

  const ask = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) setOk(false);

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({
      accuracy: 5,
    });

    const [{ city, district }] = await Location.reverseGeocodeAsync(
      {
        latitude,
        longitude,
      },
      { useGoogleMaps: false }
    );

    setLocation({
      ...location,
      city: city,
      district: district,
    });

    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${process.env.API_KEY}&units=metric`;

    await axios.get(url).then((data) => {
      const res = data.data;
      setDays(res.daily);
    });
  };

  useEffect(() => {
    ask();
  }, []);

  return ok ? (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.city}>
        <Text style={styles.cityName}>{location.city}</Text>
        <Text style={styles.district}>{location.district}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {days.length === 0 ? (
          <View style={{ ...styles.day, alignItems: "center" }}>
            <ActivityIndicator color="Black" size="large" />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View
                style={{
                  flexDirection: "row",
                  width: SCREEN_WIDTH / 2,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: "#FFE8B3",
                    fontWeight: 500,
                    marginBottom: 10,
                  }}
                >
                  {new Date(day.dt * 1000).toString().substring(0, 10)}
                </Text>
                <Fontisto
                  style={{
                    color: "#FFE8B3",
                    position: "absolute",
                    width: SCREEN_WIDTH / 2,
                    textAlign: "right",
                    marginTop: -1,
                  }}
                  name={icons[day.weather[0].main]}
                  size={30}
                  color="black"
                />
              </View>
              <View
                style={{
                  alignItems: "center",
                  borderTopWidth: 3,
                  borderTopColor: "#FFE8B3",
                }}
              >
                <Text style={styles.temp}>{Math.floor(day.temp.day)}°</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.description}>{day.weather[0].main}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  ) : (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 59, marginBottom: 20 }}>🤯</Text>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>
          위치 접근에 동의해야 서비스 사용이 가능해요
        </Text>
        <Text style={{ fontSize: 18, fontWeight: 600 }}>
          설정 {">"} 앱 {">"} 위치 접근 허용
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1042",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    color: "white",
    fontSize: 38,
    fontWeight: 600,
  },
  district: {
    color: "#E8E7FF",
    fontSize: 24,
    marginTop: 10,
  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  temp: {
    color: "white",
    fontSize: 158,
    marginTop: 20,
    marginLeft: 20,
  },
  description: {
    color: "#E8E7FF",
    fontSize: 38,
    marginTop: -20,
    marginRight: 10,
  },
});
