import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Platform, ScrollView, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [note, setNote] = useState('');
  const [hours, setHours] = useState('08');
  const [minutes, setMinutes] = useState('00');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function prepareApp() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }
      await Notifications.requestPermissionsAsync();

      try {
        const savedNote = await AsyncStorage.getItem('@saved_note');
        const savedHours = await AsyncStorage.getItem('@saved_hours');
        const savedMinutes = await AsyncStorage.getItem('@saved_minutes');

        if (savedNote !== null) setNote(savedNote);
        if (savedHours !== null) setHours(savedHours);
        if (savedMinutes !== null) setMinutes(savedMinutes);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    }
    prepareApp();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const message = notification.request.content.body;
      if (message) {
        Speech.speak(message, { language: 'th-TH', pitch: 1.0, rate: 1.0 });
      }
    });

    return () => subscription.remove();
  }, []);

  const scheduleNotification = async (title, bodyMessage) => {
    const triggerHour = parseInt(hours, 10);
    const triggerMinute = parseInt(minutes, 10);

    if (isNaN(triggerHour) || isNaN(triggerMinute) || triggerHour > 23 || triggerMinute > 59) {
      alert('กรุณากรอกเวลาให้ถูกต้องครับ');
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.setItem('@saved_note', bodyMessage);
      await AsyncStorage.setItem('@saved_hours', hours);
      await AsyncStorage.setItem('@saved_minutes', minutes);

      await Notifications.scheduleNotificationAsync({
        content: { title: title, body: bodyMessage, sound: true },
        trigger: { hour: triggerHour, minute: triggerMinute, repeats: true },
      });

      alert('บันทึกสำเร็จ! แอปจะจำค่านี้ไว้และแจ้งเตือนตามเวลาครับ');
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1EB980" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>ปฏิทินไทยธีมมืด & แจ้งเตือนเสียงพูด</Text>

      <View style={styles.card}>
        <Text style={styles.label}>📝 บันทึกโน้ต (ระบบจะจำไว้ไม่ลืม):</Text>
        <TextInput
          style={styles.input}
          placeholder="พิมพ์ข้อความที่นี่..."
          placeholderTextColor="#666"
          value={note}
          onChangeText={setNote}
        />
        
        <Text style={styles.label}>⏰ ตั้งเวลาแจ้งเตือนส่งเสียงพูด:</Text>
        <View style={styles.timeRow}>
          <TextInput style={styles.timeInput} value={hours} onChangeText={setHours} keyboardType="numeric" maxLength={2} />
          <Text style={styles.colon}>:</Text>
          <TextInput style={styles.timeInput} value={minutes} onChangeText={setMinutes} keyboardType="numeric" maxLength={2} />
        </View>

        <Button title="💾 บันทึกค่าและตั้งเวลา" color="#1EB980" onPress={() => scheduleNotification('แจ้งเตือนบันทึก', note || 'ถึงเวลาแล้วค่ะ')} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🔔 แจ้งเตือนวันพระ (เสียงพูดไทย)</Text>
        <Button title="เปิดแจ้งเตือนวันพระ" color="#FF9800" onPress={() => scheduleNotification('แจ้งเตือนวันพระ', 'วันนี้วันพระ อย่าลืมทำบุญนะคะ')} />
      </View>
      
      <Button title="🔊 ทดสอบเสียงพูด" color="#444" onPress={() => Speech.speak(note || 'ทดสอบสำเร็จ', { language: 'th-TH' })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#121212', padding: 20, paddingTop: 60 },
  centerContainer: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 12, marginBottom: 20 },
  label: { color: '#E0E0E0', fontSize: 15, marginBottom: 10 },
  input: { backgroundColor: '#2D2D2D', color: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 15 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  timeInput: { backgroundColor: '#2D2D2D', color: '#FFFFFF', fontSize: 22, padding: 8, textAlign: 'center', borderRadius: 8, width: 65, fontWeight: 'bold' },
  colon: { color: '#FFFFFF', fontSize: 26, marginHorizontal: 12 },
});
