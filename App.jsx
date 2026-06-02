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
  const [hours, setHours] = useState(''); // ปล่อยว่างไว้เพื่อรอโหลดค่าจริง
  const [minutes, setMinutes] = useState(''); // ปล่อยว่างไว้เพื่อรอโหลดค่าจริง
  const [isLoading, setIsLoading] = useState(true); // สถานะรอโหลดข้อมูลเก่าจากเครื่อง

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadSavedData();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const message = notification.request.content.body;
      speakThai(message);
    });

    return () => subscription.remove();
  }, []);

  // ฟังก์ชันดึงค่าที่เคยบันทึกไว้ในเครื่องแบบละเอียด
  const loadSavedData = async () => {
    try {
      const savedNote = await AsyncStorage.getItem('@saved_note');
      const savedHours = await AsyncStorage.getItem('@saved_hours');
      const savedMinutes = await AsyncStorage.getItem('@saved_minutes');

      // ถ้าในเครื่องเคยเซฟค่าไว้ ให้เอาค่านั้นมาใช้ แต่ถ้ายังไม่เคยเซฟ ให้ใช้ค่าเริ่มต้น (08:00)
      setNote(savedNote !== null ? savedNote : '');
      setHours(savedHours !== null ? savedHours : '08');
      setMinutes(savedMinutes !== null ? savedMinutes : '00');
    } catch (e) {
      console.log('โหลดข้อมูลไม่สำเร็จ', e);
      // กรณีเกิดข้อผิดพลาด ให้ใส่ค่าเริ่มต้นไว้ก่อน
      setHours('08');
      setMinutes('00');
    } finally {
      setIsLoading(false); // โหลดเสร็จแล้ว ปิดหน้าจอรอ
    }
  };

  const speakThai = (text) => {
    Speech.speak(text, {
      language: 'th-TH',
      pitch: 1.0,
      rate: 1.0,
    });
  };

  const scheduleNotification = async (title, bodyMessage) => {
    const triggerHour = parseInt(hours);
    const triggerMinute = parseInt(minutes);

    if (isNaN(triggerHour) || isNaN(triggerMinute) || triggerHour > 23 || triggerMinute > 59) {
      alert('กรุณากรอกเวลาให้ถูกต้อง (ชั่วโมง 00-23, นาที 00-59)');
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      // บันทึกค่ายัดลงความจำถาวรของเครื่องทันที
      await AsyncStorage.setItem('@saved_note', bodyMessage);
      await AsyncStorage.setItem('@saved_hours', hours);
      await AsyncStorage.setItem('@saved_minutes', minutes);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: bodyMessage,
          sound: true,
        },
        trigger: {
          hour: triggerHour,
          minute: triggerMinute,
          repeats: true,
        },
      });

      alert(`บันทึกสำเร็จ! ข้อมูลจะถูกจำไว้ในเครื่อง ปิดเปิดใหม่ก็ไม่หาย และตั้งเตือนตอน ${hours}:${minutes} น. ครับ`);
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการเซฟข้อมูล');
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F71',
      });
    }
    await Notifications.requestPermissionsAsync();
  };

  // ถ้าระบบกำลังดึงข้อมูลที่บันทึกไว้จากเครื่อง ให้แสดงหน้าจอดาวน์โหลดแป๊บนึง เพื่อป้องกันค่าหลุด
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1EB980" />
        <Text style={{ color: '#FFF', marginTop: 10 }}>กำลังดึงข้อมูลที่บันทึกไว้...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>ปฏิทินไทย & ระบบแจ้งเตือน</Text>

      <View style={styles.card}>
        <Text style={styles.label}>📝 ข้อความโน้ตที่ต้องการบันทึก:</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น ได้เวลาทำธุระแล้วค่ะ"
          placeholderTextColor="#666"
          value={note}
          onChangeText={setNote}
        />
        
        <Text style={styles.label}>⏰ ตั้งเวลาแจ้งเตือน (รูปแบบ 24 ชม.):</Text>
        <View style={styles.timeRow}>
          <TextInput 
            style={styles.timeInput} 
            value={hours} 
            onChangeText={setHours} 
            keyboardType="numeric" 
            maxLength={2} 
          />
          <Text style={styles.colon}>:</Text>
          <TextInput 
            style={styles.timeInput} 
            value={minutes} 
            onChangeText={setMinutes} 
            keyboardType="numeric" 
            maxLength={2} 
          />
        </View>

        <Button 
          title="💾 บันทึกจำโน้ต & ตั้งเวลาเตือน" 
          color="#1EB980" 
          onPress={() => scheduleNotification('แจ้งเตือนบันทึกโน้ต', note || 'ได้เวลาตามที่บันทึกไว้แล้วค่ะ')} 
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🔔 ระบบแจ้งเตือนวันพระ</Text>
        <Text style={styles.subLabel}>ระบบจะส่งเสียงพูดเตือนวันพระตามเวลา {hours}:{minutes} น. ที่ตั้งไว้ด้านบน</Text>
        <Button 
          title="เปิดแจ้งเตือนวันพระ (เสียงพูดไทย)" 
          color="#FF9800" 
          onPress={() => scheduleNotification('แจ้งเตือนวันพระ', 'วันนี้วันพระ อย่าลืมทำบุญและรักษาศีลนะคะ')} 
        />
      </View>

      <View style={styles.testZone}>
        <Button title="🔊 ทดสอบฟังเสียงพูดภาษาไทย" color="#444" onPress={() => speakThai(note || 'ทดสอบระบบสำเร็จ')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#121212', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 5 },
  label: { color: '#E0E0E0', fontSize: 15, marginBottom: 10 },
  subLabel: { color: '#888', fontSize: 13, marginBottom: 15 },
  input: { backgroundColor: '#2D2D2D', color: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  timeInput: { backgroundColor: '#2D2D2D', color: '#FFFFFF', fontSize: 22, padding: 8, textAlign: 'center', borderRadius: 8, width: 65, fontWeight: 'bold' },
  colon: { color: '#FFFFFF', fontSize: 26, marginHorizontal: 12, fontWeight: 'bold' },
  testZone: { marginTop: 10, borderRadius: 8, overflow: 'hidden' }
});
