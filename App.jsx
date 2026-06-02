import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Platform, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
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
  
  // สถานะสำหรับระบบปฏิทิน
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

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

      alert(`บันทึกสำเร็จ! ตั้งเวลาเตือนตอน ${hours}:${minutes} น. เรียบร้อยครับ`);
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  // --- ฟังก์ชันคำนวณและสร้างปฏิทิน ---
  const monthsTH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const daysShort = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const renderCalendarDays = () => {
    const dayItems = [];
    // ส่วนว่างก่อนเริ่มวันที่ 1 ของเดือน
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayItems.push(<View key={`empty-${i}`} style={styles.dayBoxEmpty} />);
    }
    // รายชื่อวันที่ 1 ถึงสิ้นเดือน
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      const isSelected = d === selectedDay;

      // ระบบสมมติจำลองวันพระคร่าวๆ (เช่น วันที่ 8, 15, 23, 30 ของเดือน)
      const isWanPhra = [8, 15, 23, 30].includes(d);

      dayItems.push(
        <TouchableOpacity 
          key={`day-${d}`} 
          style={[
            styles.dayBox,
            isToday && styles.todayBox,
            isSelected && !isToday && styles.selectedBox
          ]}
          onPress={() => setSelectedDay(d)}
        >
          <Text style={[styles.dayText, (isToday || isSelected) && styles.textBold]}>{d}</Text>
          {isWanPhra && <Text style={styles.wanPhraDot}>🏮</Text>}
        </TouchableOpacity>
      );
    }
    return dayItems;
  };

  const changeMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
    setSelectedDay(1);
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

      {/* 📅 ส่วนแสดงตารางปฏิทินที่เพิ่มเข้ามาใหม่ */}
      <View style={styles.card}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
            <Text style={styles.navButtonText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthsTH[month]} {year + 543}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
            <Text style={styles.navButtonText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* ชื่อวัน อาทิตย์ - เสาร์ */}
        <View style={styles.weekDaysRow}>
          {daysShort.map((day, idx) => (
            <Text key={idx} style={[styles.weekDayLabel, idx === 0 && {color: '#FF5252'}]}>{day}</Text>
          ))}
        </View>

        {/* ตารางวันที่ */}
        <View style={styles.calendarGrid}>
          {renderCalendarDays()}
        </View>
      </View>

      {/* 📝 กล่องบันทึกโน้ตจำค่า */}
      <View style={styles.card}>
        <Text style={styles.label}>📝 โน้ตแจ้งเตือนสำหรับวันที่ {selectedDay} (จำค่าไว้ในเครื่อง):</Text>
        <TextInput
          style={styles.input}
          placeholder="พิมพ์ข้อความโน้ตที่นี่..."
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

        <Button title="💾 บันทึกค่าและตั้งเวลา" color="#1EB980" onPress={() => scheduleNotification(`แจ้งเตือนวันที่ ${selectedDay}`, note || 'ถึงเวลาที่บันทึกไว้แล้วค่ะ')} />
      </View>

      {/* 🔔 ส่วนระบบวันพระ */}
      <View style={styles.card}>
        <Text style={styles.label}>🔔 ระบบแจ้งเตือนวันพระประจำเดือน</Text>
        <Text style={styles.subLabel}>วันพระในปฏิทินจะมีสัญลักษณ์ 🏮 แสดงอยู่ ระบบจะสปีดเสียงเมื่อถึงเวลาที่กำหนด</Text>
        <Button title="เปิดแจ้งเตือนวันพระ (เสียงพูดไทย)" color="#FF9800" onPress={() => scheduleNotification('แจ้งเตือนวันพระ', 'วันนี้วันพระ อย่าลืมทำบุญรักษาศีลนะคะ')} />
      </View>
      
      <Button title="🔊 ทดสอบฟังเสียงพูดด่วน" color="#444" onPress={() => Speech.speak(note || 'ทดสอบระบบปฏิทินเสร็จสิ้น', { language: 'th-TH' })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#121212', padding: 20, paddingTop: 50 },
  centerContainer: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, marginBottom: 15 },
  label: { color: '#E0E0E0', fontSize: 14, marginBottom: 8 },
  subLabel: { color: '#AAA', fontSize: 12, marginBottom: 12 },
  input: { backgroundColor: '#2D2D2D', color: '#FFFFFF', padding: 10, borderRadius: 8, marginBottom: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  timeInput: { backgroundColor: '#2D2D2D', color: '#FFFFFF', fontSize: 20, padding: 6, textAlign: 'center', borderRadius: 8, width: 60, fontWeight: 'bold' },
  colon: { color: '#FFFFFF', fontSize: 22, marginHorizontal: 10 },
  
  // สไตล์สำหรับระบบปฏิทิน
  calendarHeader: { flexDirection: 'row', justifyContent: 'between', alignItems: 'center', marginBottom: 15 },
  monthTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  navButton: { padding: 10 },
  navButtonText: { color: '#1EB980', fontSize: 16 },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  weekDayLabel: { color: '#AAA', fontSize: 14, width: '14.2%', textAlign: 'center', fontWeight: 'bold' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayBox: { width: '14.2%', height: 45, justifyContent: 'center', alignItems: 'center', marginVertical: 2, borderRadius: 6 },
  dayBoxEmpty: { width: '14.2%', height: 45 },
  dayText: { color: '#FFF', fontSize: 15 },
  textBold: { fontWeight: 'bold', color: '#FFF' },
  todayBox: { backgroundColor: '#1EB980' },
  selectedBox: { backgroundColor: '#444', borderWidth: 1, borderColor: '#1EB980' },
  wanPhraDot: { fontSize: 9, position: 'absolute', bottom: 2 }
});
