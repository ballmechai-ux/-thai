import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Platform, ScrollView, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';

// ตั้งค่าให้ระบบแจ้งเตือนเด้งขึ้นมา แม้ในขณะที่กำลังเปิดแอปอยู่
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

  useEffect(() => {
    // ขออนุญาตผู้ใช้ในการส่งการแจ้งเตือนเมื่อเปิดแอปครั้งแรก
    registerForPushNotificationsAsync();

    // ตัวจับสัญญาณ: เมื่อมีการแจ้งเตือนเด้งขึ้นมา ให้สั่งส่งเสียงพูดภาษาไทยทันที
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const message = notification.request.content.body;
      speakThai(message);
    });

    return () => subscription.remove();
  }, []);

  // ฟังก์ชันสั่งให้ระบบพูดภาษาไทย (Text-to-Speech)
  const speakThai = (text) => {
    Speech.speak(text, {
      language: 'th-TH', // ล็อคสำเนียงภาษาไทย
      pitch: 1.0,
      rate: 1.0,
    });
  };

  // ฟังก์ชันคำนวณและตั้งเวลาแจ้งเตือน
  const scheduleNotification = async (title, bodyMessage) => {
    const triggerHour = parseInt(hours);
    const triggerMinute = parseInt(minutes);

    if (isNaN(triggerHour) || isNaN(triggerMinute) || triggerHour > 23 || triggerMinute > 59) {
      alert('กรุณาใส่รูปแบบเวลาให้ถูกต้อง (00-23 น. และ 00-59 นาที)');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: bodyMessage,
      },
      trigger: {
        hour: triggerHour,
        minute: triggerMinute,
        repeats: true, // ตั้งให้แจ้งเตือนซ้ำในเวลานี้ของทุกๆ วัน
      },
    });

    alert(`ตั้งเวลาแจ้งเตือน "${bodyMessage}" ตอน ${hours}:${minutes} น. เรียบร้อยแล้ว!`);
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
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('โปรดอนุญาตสิทธิ์การแจ้งเตือน เพื่อให้ระบบเสียงพูดทำงานได้ถูกต้องครับ');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>ปฏิทินไทย & ระบบแจ้งเตือน</Text>

      {/* กล่องบันทึกโน้ตและเลือกเวลา */}
      <View style={styles.card}>
        <Text style={styles.label}>พิมพ์ข้อความโน้ตที่ต้องการให้แจ้งเตือน:</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น ได้เวลาทำธุระแล้วค่ะ"
          placeholderTextColor="#666"
          value={note}
          onChangeText={setNote}
        />
        
        <Text style={styles.label}>ตั้งเวลาแจ้งเตือน (รูปแบบ 24 ชม.):</Text>
        <View style={styles.timeRow}>
          <TextInput 
            style={styles.timeInput} 
            value={hours} 
            onChangeText={setHours} 
            keyboardType="numeric" 
            maxLength={2} 
            placeholder="08"
            placeholderTextColor="#555"
          />
          <Text style={styles.colon}>:</Text>
          <TextInput 
            style={styles.timeInput} 
            value={minutes} 
            onChangeText={setMinutes} 
            keyboardType="numeric" 
            maxLength={2} 
            placeholder="00"
            placeholderTextColor="#555"
          />
        </View>

        <Button title="บันทึกเวลาแจ้งเตือนโน้ต" color="#1EB980" onPress={() => scheduleNotification('แจ้งเตือนบันทึกโน้ต', note || 'ได้เวลาตามที่บันทึกไว้แล้วค่ะ')} />
      </View>

      {/* กล่องตั้งเตือนวันพระด่วน */}
      <View style={styles.card}>
        <Text style={styles.label}>🔔 ระบบแจ้งเตือนวันพระ</Text>
        <Text style={styles.subLabel}>เมื่อถึงเวลา {hours}:{minutes} น. ระบบจะส่งเสียงพูดเตือนวันพระทันที</Text>
        <Button 
          title="เปิดแจ้งเตือนวันพระ (เสียงพูดไทย)" 
          color="#FF9800" 
          onPress={() => scheduleNotification('แจ้งเตือนวันพระ', 'วันนี้วันพระ อย่าลืมทำบุญและรักษาศีลนะคะ')} 
        />
      </View>

      {/* ปุ่มกดเพื่อเทสเสียง */}
      <View style={styles.testZone}>
        <Button title="🔊 ทดสอบฟังเสียงพูดภาษาไทย" color="#444" onPress={() => speakThai(note || 'ทดสอบระบบเสียงพูดภาษาไทยสำเร็จ')} />
      </View>
    </ScrollView>
  );
}

// สไตล์ตกแต่งหน้าตาแอปให้เป็นสีดำ (Dark Mode)
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212', // พื้นหลังสีดำมืด ดีต่อสายตา
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF', // ตัวหนังสือหัวข้อสีขาว
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#1E1E1E', // กล่องเมนูสีเทาเข้ม ตัดกับพื้นหลัง
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    color: '#E0E0E0',
    fontSize: 15,
    marginBottom: 10,
  },
  subLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#2D2D2D',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
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
    fontWeight: 'bold',
  },
  testZone: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
  }
});
