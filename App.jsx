import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ตั้งค่าระบบแจ้งเตือนหลัก
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [note, setNote] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadSavedData();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const message = notification.request.content.body;
      if (message) {
        speakThai(message);
      }
    });

    return () => subscription.remove();
  }, []);

  // ระบบดึงข้อมูลถาวรที่เคยบันทึกไว้ในเครื่อง (ทำให้อุปกรณ์จำค่าได้)
  const loadSavedData = async () => {
    try {
      const savedNote = await AsyncStorage.getItem('@saved_note');
      const savedHours = await AsyncStorage.getItem('@saved_hours');
      const savedMinutes = await AsyncStorage.getItem('@saved_minutes');

      setNote(savedNote !== null ? savedNote : '');
      setHours(savedHours !== null ? savedHours : '08');
      setMinutes(savedMinutes !== null ? savedMinutes : '00');
    } catch (e) {
      setHours('08');
      setMinutes('00');
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันส่งเสียงพูดภาษาไทย (Text-to-Speech)
  const speakThai = (text) => {
    try {
      Speech.speak(text, {
        language: 'th-TH',
        pitch: 1.0,
        rate: 1.0,
      });
    } catch (error) {
      console.log('Speech error:', error);
    }
  };

  // ฟังก์ชันจองคิวแจ้งเตือนระบบและเซฟค่าลงเครื่อง
  const scheduleNotification = async (title, bodyMessage) => {
    const triggerHour = parseInt(hours, 10);
    const triggerMinute = parseInt(minutes, 10);

    if (isNaN(triggerHour) || isNaN(triggerMinute) || triggerHour > 23 || triggerMinute > 59) {
      if (Platform.OS === 'web') {
        alert('กรุณากรอกเวลาให้ถูกต้องครับ (ชั่วโมง 00-23, นาที 00-59)');
      } else {
        Alert.alert('แจ้งเตือน', 'กรุณากรอกเวลาให้ถูกต้องครับ (ชั่วโมง 00-23, นาที 00-59)');
      }
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      // บันทึกลงเครื่องถาวร ปิดแอปเปิดใหม่ค่าไม่หาย
      await AsyncStorage.setItem('@saved_note', bodyMessage);
      await AsyncStorage.setItem('@saved_hours', hours);
      await AsyncStorage.setItem('@saved_minutes', minutes);

      // สั่งตั้งเวลาแจ้งเตือนในระบบมือถือ
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

      const successMessage = `บันทึกสำเร็จ! ข้อมูลถูกจำในเครื่องแล้ว และระบบจะตั้งเตือนตอน ${hours}:${minutes} น.`;
      if (Platform.OS === 'web') {
        alert(successMessage);
      } else {
        Alert.alert('สำเร็จ', successMessage);
      }
    } catch (e) {
      if (Platform.OS === 'web') {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      } else {
        Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }
    await Notifications.requestPermissionsAsync();
  };

  // หน้าจอตอนกำลังโหลดความจำแอปพลิเคชัน
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1EB980" />
        <Text style={styles.loadingText}>กำลังเปิดระบบความจำ...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>ปฏิทินไทยธีมมืด & แจ้งเตือนเสียงพูด</Text>

      {/* ส่วนตั้งค่าโน้ตจำจำถาวร */}
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
          title="💾 บันทึกค่าและตั้งเวลา" 
          color="#1EB980" 
          onPress={() => scheduleNotification('แจ้งเตือนบันทึก', note || 'ถึงเวลาแล้วค่ะ')} 
        />
      </View>

      {/* ส่วนตั้งเตือนวันพระด่วน */}
      <View style={styles.card}>
        <Text style={styles.label}>🔔 แจ้งเตือนวันพระ (เสียงพูดไทย)</Text>
        <Button 
          title="เปิดแจ้งเตือนวันพระ" 
          color="#FF9800" 
          onPress={() => scheduleNotification('แจ้งเตือนวันพระ', 'วันนี้วันพระ อย่าลืมทำบุญนะคะ')} 
        />
      </View>
      
      <View style={styles.testZone}>
        <Button 
          title="🔊 ทดสอบเสียงพูด" 
          color="#444" 
          onPress={() => speakThai(note || 'ทดสอบสำเร็จ')} 
        />
      </View>
    </ScrollView>
  );
}

// 🌑 ตกแต่งสไตล์ Dark Mode 100%
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    padding: 20,
    paddingTop: 60,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    color: '#E0E0E0',
    fontSize: 15,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#2D2D2D',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeInput: {
    backgroundColor: '#2D2D2D',
    color: '#FFFFFF',
    fontSize: 22,
    padding: 8,
    textAlign: 'center',
    borderRadius: 8,
    width: 65,
    fontWeight: 'bold',
  },
  colon: {
    color: '#FFFFFF',
    fontSize: 26,
    marginHorizontal: 12,
  },
  testZone: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
