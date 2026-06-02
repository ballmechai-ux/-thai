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
  // ระบบสลับหน้าจอ (Tab เมนู) -> 'calendar' = หน้าปฏิทิน, 'settings' = หน้าตั้งค่า
  const [currentTab, setCurrentTab] = useState('calendar');

  // ข้อมูลฝั่งโน้ต
  const [note, setNote] = useState('');
  
  // ข้อมูลฝั่งตั้งค่า (หน้า 2)
  const [autoWanPhra, setAutoWanPhra] = useState(true); // เปิดแจ้งเตือนวันพระออโต้เริ่มต้น
  const [enableNoteAlarm, setEnableNoteAlarm] = useState(false); // ปิดการตั้งเวลาโน้ตเริ่มต้น
  const [hours, setHours] = useState('08');
  const [minutes, setMinutes] = useState('00');
  
  const [isLoading, setIsLoading] = useState(true);
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
        const savedAutoPhra = await AsyncStorage.getItem('@auto_wanphra');
        const savedEnableNote = await AsyncStorage.getItem('@enable_note_alarm');

        if (savedNote !== null) setNote(savedNote);
        if (savedHours !== null) setHours(savedHours);
        if (savedMinutes !== null) setMinutes(savedMinutes);
        if (savedAutoPhra !== null) setAutoWanPhra(savedAutoPhra === 'true');
        if (savedEnableNote !== null) setEnableNoteAlarm(savedEnableNote === 'true');
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

  // บันทึกการตั้งค่าระบบแจ้งเตือนทั้งหมด
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('@auto_wanphra', String(autoWanPhra));
      await AsyncStorage.setItem('@enable_note_alarm', String(enableNoteAlarm));
      await AsyncStorage.setItem('@saved_hours', hours);
      await AsyncStorage.setItem('@saved_minutes', minutes);

      await Notifications.cancelAllScheduledNotificationsAsync();

      // บิ้วด์คำสั่งแจ้งเตือน Auto วันพระ (สมมติระบบยิงล่วงหน้า)
      if (autoWanPhra) {
        await Notifications.scheduleNotificationAsync({
          content: { title: '🪷 วันนี้วันพระ', body: 'วันนี้วันพระ อย่าลืมทำบุญรักษาศีลนะคะ', sound: true },
          trigger: { hour: 7, minute: 0, repeats: true }, // ออโต้ปลุกตอน 7 โมงเช้าทุกวันพระ
        });
      }

      // บิ้วด์คำสั่งสำหรับเวลาของโน้ต
      if (enableNoteAlarm && note) {
        const tHour = parseInt(hours, 10);
        const tMinute = parseInt(minutes, 10);
        if (!isNaN(tHour) && !isNaN(tMinute) && tHour < 24 && tMinute < 60) {
          await Notifications.scheduleNotificationAsync({
            content: { title: `📌 แจ้งเตือนบันทึก`, body: note, sound: true },
            trigger: { hour: tHour, minute: tMinute, repeats: true },
          });
        }
      }

      alert('⚙️ บันทึกการตั้งค่าระบบแจ้งเตือนเรียบร้อยแล้ว!');
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    }
  };

  const saveNoteOnly = async () => {
    try {
      await AsyncStorage.setItem('@saved_note', note);
      alert(`📝 บันทึกโน้ตของวันที่ ${selectedDay} เรียบร้อยแล้ว!`);
    } catch (e) {
      alert('บันทึกโน้ตล้มเหลว');
    }
  };

  const monthsTH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const daysShort = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getThaiLunarAndHoliday = (day) => {
    let lunarText = "";
    let holidayText = "";
    let isWanPhra = false;

    if (day === 1 || day === 15) { lunarText = "ขึ้น ๑๕ ค่ำ"; isWanPhra = day === 15; }
    else if (day === 8) { lunarText = "ขึ้น ๘ ค่ำ"; isWanPhra = true; }
    else if (day === 23) { lunarText = "แรม ๘ ค่ำ"; isWanPhra = true; }
    else if (day === 30 || (day === 29 && daysInMonth === 29)) { lunarText = "แรม ๑๕ ค่ำ"; isWanPhra = true; }
    else {
      lunarText = day % 2 === 0 ? `ขึ้น ${day % 15} ค่ำ` : `แรม ${day % 15} ค่ำ`;
    }

    if (month === 0 && day === 1) holidayText = "วันขึ้นปีใหม่";
    if (month === 3 && day === 6) holidayText = "วันจักรี";
    if (month === 3 && [13, 14, 15].includes(day)) holidayText = "วันสงกรานต์";
    if (month === 4 && day === 1) holidayText = "วันแรงงาน";
    if (month === 5 && day === 3) holidayText = "วันวิสาขบูชา";

    return { lunarText, holidayText, isWanPhra };
  };

  const renderCalendarDays = () => {
    const dayItems = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayItems.push(<View key={`empty-${i}`} style={styles.dayBoxEmpty} />);
    }
    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const isToday = dayNumber === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      const isSelected = dayNumber === selectedDay;
      const { lunarText, holidayText, isWanPhra } = getThaiLunarAndHoliday(dayNumber);

      dayItems.push(
        <TouchableOpacity 
          key={`day-${dayNumber}`} 
          style={[
            styles.dayBox,
            isToday && styles.todayBox,
            isSelected && !isToday && styles.selectedBox,
            holidayText !== "" && styles.holidayBg
          ]}
          onPress={() => setSelectedDay(dayNumber)}
        >
          <View style={styles.dayTopRow}>
            <Text style={[styles.dayText, (isToday || isSelected) && styles.textBold, holidayText !== "" && {color: '#FF5252'}]}>
              {dayNumber}
            </Text>
            {isWanPhra && <Text style={styles.wanPhraIcon}>🏮</Text>}
          </View>
          <Text style={styles.lunarText} numberOfLines={1}>{lunarText}</Text>
          {holidayText !== "" && <Text style={styles.holidayText} numberOfLines={1}>{holidayText}</Text>}
        </TouchableOpacity>
      );
    }
    return dayItems;
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1EB980" />
      </View>
    );
  }

  return (
    <View style={styles.mainWrapper}>
      {/* 🧭 ส่วนหัวของแอป */}
      <Text style={styles.headerTitle}>ปฏิทินไทยธีมมืด & ระบบผู้ช่วยเสียง</Text>

      {/* 📑 เมนูสลับหน้าจอ (Tab Bar ด้านบนเพิ่มความหรูหรา) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, currentTab === 'calendar' && styles.tabActive]} onPress={() => setCurrentTab('calendar')}>
          <Text style={[styles.tabText, currentTab === 'calendar' && styles.tabTextActive]}>📅 ปฏิทินไทย</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, currentTab === 'settings' && styles.tabActive]} onPress={() => setCurrentTab('settings')}>
          <Text style={[styles.tabText, currentTab === 'settings' && styles.tabTextActive]}>⚙️ ตั้งค่าการแจ้งเตือน</Text>
        </TouchableOpacity>
      </View>

      {/* 📥 หน้าที่ 1: ตารางปฏิทินและกล่องโน้ตปกติ */}
      {currentTab === 'calendar' && (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))} style={styles.navButton}>
                <Text style={styles.navButtonText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{monthsTH[month]} {year + 543}</Text>
              <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))} style={styles.navButton}>
                <Text style={styles.navButtonText}>▶</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {daysShort.map((day, idx) => (
                <Text key={idx} style={[styles.weekDayLabel, idx === 0 && {color: '#FF5252'}]}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {renderCalendarDays()}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>📝 บันทึกโน้ตความจำ (วันที่ {selectedDay} {monthsTH[month]}):</Text>
            <TextInput
              style={styles.input}
              placeholder="พิมพ์รายละเอียดกิจกรรมที่นี่..."
              placeholderTextColor="#666"
              value={note}
              onChangeText={setNote}
            />
            <Button title="💾 บันทึกข้อความลงปฏิทิน" color="#1EB980" onPress={saveNoteOnly} />
          </View>
        </ScrollView>
      )}

      {/* 📥 หน้าที่ 2: เมนูตั้งค่าแยกฟังก์ชันการแจ้งเตือนออกมาชัดเจน */}
      {currentTab === 'settings' && (
        <ScrollView contentContainerStyle={styles.container}>
          {/* ส่วนย่อยที่ 1: ระบบวันพระ Auto */}
          <View style={styles.card}>
            <Text style={styles.settingMainTitle}>🪷 ระบบแจ้งเตือนวันพระอัตโนมัติ (Auto)</Text>
            <Text style={styles.subLabel}>เมื่อถึงวันพระ (ขึ้น ๘/๑๕ ค่ำ แรม ๘/๑๕ ค่ำ) แอปจะส่งเสียงพูดแจ้งเตือนอัตโนมัติในตอนเช้า</Text>
            <View style={styles.rowToggle}>
              <Text style={styles.label}>เปิดใช้งานระบบ Auto วันพระ</Text>
              <TouchableOpacity style={[styles.customSwitch, autoWanPhra ? styles.switchOn : styles.switchOff]} onPress={() => setAutoWanPhra(!autoWanPhra)}>
                <Text style={styles.switchButtonText}>{autoWanPhra ? "เปิด" : "ปิด"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ส่วนย่อยที่ 2: แยกช่องตั้งเวลาเตือนของบันทึกโน้ต */}
          <View style={styles.card}>
            <Text style={styles.settingMainTitle}>📌 ระบบตั้งเวลาสำหรับแจ้งเตือนโน้ต</Text>
            <Text style={styles.subLabel}>กำหนดให้แอปส่งเสียงพูดอ่านข้อความโน้ตที่เฮียพิมพ์บันทึกไว้ในหน้าแรกตามเวลาที่ระบุ</Text>
            
            <View style={styles.rowToggle}>
              <Text style={styles.label}>เปิดการแจ้งเตือนเวลาสำหรับโน้ต</Text>
              <TouchableOpacity style={[styles.customSwitch, enableNoteAlarm ? styles.switchOn : styles.switchOff]} onPress={() => setEnableNoteAlarm(!enableNoteAlarm)}>
                <Text style={styles.switchButtonText}>{enableNoteAlarm ? "เปิด" : "ปิด"}</Text>
              </TouchableOpacity>
            </View>

            {enableNoteAlarm && (
              <View style={styles.timePickerContainer}>
                <Text style={styles.labelAlarm}>⏰ ระบุช่วงเวลาที่ต้องการให้ส่งเสียงเตือน:</Text>
                <View style={styles.timeRow}>
                  <TextInput style={styles.timeInput} value={hours} onChangeText={setHours} keyboardType="numeric" maxLength={2} />
                  <Text style={styles.colon}>:</Text>
                  <TextInput style={styles.timeInput} value={minutes} onChangeText={setMinutes} keyboardType="numeric" maxLength={2} />
                </View>
              </View>
            )}
          </View>

          <Button title="💾 บันทึกสิทธิ์และตั้งค่าการทำงานแอป" color="#FF9800" onPress={saveSettings} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  container: { padding: 15, paddingBottom: 30 },
  centerContainer: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  card: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, marginBottom: 15 },
  label: { color: '#E0E0E0', fontSize: 14, flex: 1 },
  subLabel: { color: '#AAA', fontSize: 12, marginBottom: 15, lineHeight: 16 },
  input: { backgroundColor: '#2D2D2D', color: '#FFFFFF', padding: 10, borderRadius: 8, marginBottom: 12 },
  
  // โซนเมนูแท็บ (Tab Navigation)
  tabContainer: { flexDirection: 'row', backgroundColor: '#1E1E1E', marginHorizontal: 15, borderRadius: 8, padding: 4, marginBottom: 10 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabActive: { backgroundColor: '#2D2D2D', borderWidth: 0.5, borderColor: '#1EB980' },
  tabText: { color: '#888', fontSize: 13, fontWeight: 'bold' },
  tabTextActive: { color: '#1EB980' },

  // โซนตั้งค่าหน้า 2
  settingMainTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
  rowToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  customSwitch: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6, minWidth: 60, alignItems: 'center' },
  switchOn: { backgroundColor: '#1EB980' },
  switchOff: { backgroundColor: '#444' },
  switchButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  timePickerContainer: { backgroundColor: '#262626', padding: 12, borderRadius: 8, marginTop: 15, alignItems: 'center' },
  labelAlarm: { color: '#1EB980', fontSize: 13, marginBottom: 8, fontWeight: 'bold' },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeInput: { backgroundColor: '#1E1E1E', color: '#FFFFFF', fontSize: 22, padding: 6, textAlign: 'center', borderRadius: 8, width: 65, fontWeight: 'bold', borderWidth: 1, borderColor: '#444' },
  colon: { color: '#FFFFFF', fontSize: 24, marginHorizontal: 10 },

  // สไตล์ตารางปฏิทินไทย
  calendarHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  monthTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  navButton: { padding: 10 },
  navButtonText: { color: '#1EB980', fontSize: 16 },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  weekDayLabel: { color: '#AAA', fontSize: 13, width: '14.2%', textAlign: 'center', fontWeight: 'bold' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 0.5, borderColor: '#333' },
  dayBox: { width: '14.28%', height: 58, justifyContent: 'start', padding: 4, backgroundColor: '#262626', borderWidth: 0.5, borderColor: '#3A3A3A' },
  dayBoxEmpty: { width: '14.28%', height: 58, backgroundColor: '#1E1E1E', borderWidth: 0.5, borderColor: '#3A3A3A' },
  dayTopRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  dayText: { color: '#FFFFFF', fontSize: 13 },
  textBold: { fontWeight: 'bold', color: '#FFFFFF' },
  wanPhraIcon: { fontSize: 9 },
  lunarText: { color: '#E0A96D', fontSize: 8, fontWeight: 'bold', marginTop: 2, textAlign: 'center', width: '100%' },
  holidayText: { color: '#FF5252', fontSize: 7, marginTop: 1, textAlign: 'center', width: '100%' },
  holidayBg: { backgroundColor: '#322222' },
  todayBox: { backgroundColor: '#1EB980', borderColor: '#1EB980' },
  selectedBox: { backgroundColor: '#444444', borderColor: '#1EB980', borderWidth: 1.5 },
});
