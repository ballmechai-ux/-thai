import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Platform, ScrollView, ActivityIndicator, TouchableOpacity, PanResponder } from 'react-native';
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
  const [currentTab, setCurrentTab] = useState('calendar');
  const [note, setNote] = useState('');
  const [autoWanPhra, setAutoWanPhra] = useState(true);
  const [enableNoteAlarm, setEnableNoteAlarm] = useState(false);
  const [hours, setHours] = useState('08');
  const [minutes, setMinutes] = useState('00');
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [theme, setTheme] = useState('glass');

  const themes = {
    glass: { primary: '#00D4FF', secondary: '#00FFC6', glass: 'rgba(30, 40, 60, 0.6)', border: 'rgba(0, 212, 255, 0.3)' },
    ocean: { primary: '#0077FF', secondary: '#00BFFF', glass: 'rgba(0, 50, 100, 0.6)', border: 'rgba(0, 119, 255, 0.3)' },
    pastel: { primary: '#88CFFF', secondary: '#A8E6CF', glass: 'rgba(200, 230, 255, 0.6)', border: 'rgba(136, 207, 255, 0.3)' }
  };
  const currentTheme = themes[theme];

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 50) setCurrentDate(new Date(year, month - 1, 1));
      if (gesture.dx < -50) setCurrentDate(new Date(year, month + 1, 1));
    },
  });

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
        const savedTheme = await AsyncStorage.getItem('@app_theme');
        if (savedNote!== null) setNote(savedNote);
        if (savedHours!== null) setHours(savedHours);
        if (savedMinutes!== null) setMinutes(savedMinutes);
        if (savedAutoPhra!== null) setAutoWanPhra(savedAutoPhra === 'true');
        if (savedEnableNote!== null) setEnableNoteAlarm(savedEnableNote === 'true');
        if (savedTheme!== null) setTheme(savedTheme);
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

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('@auto_wanphra', String(autoWanPhra));
      await AsyncStorage.setItem('@enable_note_alarm', String(enableNoteAlarm));
      await AsyncStorage.setItem('@saved_hours', hours);
      await AsyncStorage.setItem('@saved_minutes', minutes);
      await AsyncStorage.setItem('@app_theme', theme);
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (autoWanPhra) {
        await Notifications.scheduleNotificationAsync({
          content: { title: '🪷 วันนี้วันพระ', body: 'วันนี้วันพระ อย่าลืมทำบุญรักษาศีลนะคะ', sound: true },
          trigger: { hour: 7, minute: 0, repeats: true },
        });
      }
      if (enableNoteAlarm && note) {
        const tHour = parseInt(hours, 10);
        const tMinute = parseInt(minutes, 10);
        if (!isNaN(tHour) &&!isNaN(tMinute) && tHour < 24 && tMinute < 60) {
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

  const onDayPress = (dayNumber, dayData) => {
    setSelectedDay(dayNumber);
    setSelectedInfo(dayData);
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
    if (day === 1 || day === 15) {
      lunarText = "ขึ้น ๑๕ ค่ำ";
      isWanPhra = day === 15;
    } else if (day === 8) {
      lunarText = "ขึ้น ๘ ค่ำ";
      isWanPhra = true;
    } else if (day === 23) {
      lunarText = "แรม ๘ ค่ำ";
      isWanPhra = true;
    } else if (day === 30 || (day === 29 && daysInMonth === 29)) {
      lunarText = "แรม ๑๕ ค่ำ";
      isWanPhra = true;
    } else {
      lunarText = day % 2 === 0? `ขึ้น ${day % 15} ค่ำ` : `แรม ${day % 15} ค่ำ`;
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
        <TouchableOpacity key={`day-${dayNumber}`} style={[styles.dayBox, isToday && styles.todayBox, isSelected &&!isToday && styles.selectedBox, holidayText!== "" && styles.holidayBg]} onPress={() => onDayPress(dayNumber, { lunarText, holidayText, isWanPhra, day: dayNumber })}>
          <View style={styles.dayTopRow}>
            <Text style={[styles.dayText, (isToday || isSelected) && styles.textBold, holidayText!== "" && {color: '#FF5252'}]}>
              {dayNumber}
            </Text>
            {isWanPhra && <Text style={[styles.wanPhraIcon, {color: currentTheme.primary}]}>🪷</Text>}
          </View>
          <Text style={styles.lunarText} numberOfLines={1}>{lunarText}</Text>
          {holidayText!== "" && <Text style={[styles.holidayText, {color: currentTheme.primary}]} numberOfLines={1}>{holidayText}</Text>}
        </TouchableOpacity>
      );
    }
    return dayItems;
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.mainWrapper, {backgroundColor: '#0A0E1A'}]}>
      <Text style={styles.headerTitle}>ปฏิทินไทยธีมืด & ระบบผู้ช่วยเสียง</Text>

      <View style={[styles.tabContainer, {backgroundColor: currentTheme.glass, borderColor: currentTheme.border}]}>
        <TouchableOpacity style={[styles.tabButton, currentTab === 'calendar' && styles.tabActive, currentTab === 'calendar' && {borderColor: currentTheme.primary}]} onPress={() => setCurrentTab('calendar')}>
          <Text style={[styles.tabText, currentTab === 'calendar' && {color: currentTheme.primary}]}>📅 ปฏิทินไทย</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, currentTab === 'settings' && styles.tabActive, currentTab === 'settings' && {borderColor: currentTheme.primary}]} onPress={() => setCurrentTab('settings')}>
          <Text style={[styles.tabText, currentTab === 'settings' && {color: currentTheme.primary}]}>⚙️ ตั้งค่าการแจ้งเตือน</Text>
        </TouchableOpacity>
      </View>

      {currentTab === 'calendar' && (
        <ScrollView {...panResponder.panHandlers} contentContainerStyle={styles.container}>
          <View style={[styles.card, {backgroundColor: currentTheme.glass, borderColor: currentTheme.border}]}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))} style={styles.navButton}>
                <Text style={[styles.navButtonText, {color: currentTheme.primary}]}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{monthsTH[month]} {year + 543}</Text>
              <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))} style={styles.navButton}>
                <Text style={[styles.navButtonText, {color: currentTheme.primary}]}>▶</Text>
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

          {selectedInfo && (
            <View style={[styles.card, {backgroundColor: currentTheme.glass, borderColor: currentTheme.border, marginTop: 10}]}>
              <Text style={[styles.settingMainTitle, {color: currentTheme.primary}]}>
                วันที่ {selectedInfo.day} {monthsTH[month]}
              </Text>
              {selectedInfo.isWanPhra && <Text style={styles.subLabel}>🪷 วันพระ: {selectedInfo.lunarText}</Text>}
              {selectedInfo.holidayText!== "" && <Text style={styles.subLabel}>🏛️ วันสำคัญ: {selectedInfo.holidayText}</Text>}
              {!selectedInfo.isWanPhra && selectedInfo.holidayText === "" && <Text style={styles.subLabel}>วันธรรมดา</Text>}
            </View>
          )}

          <View style={[styles.card, {backgroundColor: currentTheme.glass, borderColor: currentTheme.border}]}>
            <Text style={styles.label}>📝 บันทึกโน้ตความจำ (วันที่ {selectedDay} {monthsTH[month]}):</Text>
            <TextInput style={[styles.input, {backgroundColor: 'rgba(0,0,0,0.3)', borderColor: currentTheme.border}]} placeholder="พิมพ์รายละเอียดกิจกรรมที่นี่..." placeholderTextColor="#666" value={note} onChangeText={setNote} />
            <Button title="💾 บันทึกข้อความลงปฏิทิน" color={currentTheme.primary} onPress={saveNoteOnly} />
          </View>
        </ScrollView>
      )}

      {currentTab === 'settings' && (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.card, {backgroundColor: currentTheme.glass, borderColor: currentTheme.border}]}>
            <Text style={styles.settingMainTitle}>🎨 เลือกธีมสีแอป</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 10}}>
              {Object.keys(themes).map(t => (
                <TouchableOpacity key={t} onPress={() => setTheme(t)}
                  style={[styles.tabButton, theme === t && styles.tabActive, theme === t && {borderColor: currentTheme.primary}]}>
                  <Text style={[styles.tabText, theme === t && {color: currentTheme.primary}]}>
                    {t === 'glass'? 'กระจกฟ้า' : t === 'ocean'? 'ทะเลลึก' : 'พาสเทล'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.card, {backgroundColor: currentTheme.glass, borderColor: currentTheme.border}]}>
            <Text style={styles.settingMainTitle}>🪷 ระบบแจ้งเตือนวันพระอัตโนมัติ (Auto)</Text>
            <Text style={styles.subLabel}>เมื่อถึงวันพระ แอปจะส่งเสียงพูดแจ้งเตือนอัตโนมัติในตอนเช้า</Text>
            <View style={styles.rowToggle}>
              <Text style={styles.label}>เปิดใช้งานระบบ Auto วันพระ</Text>
              <TouchableOpacity
                style={[styles.customSwitch, autoWanPhra? {backgroundColor: currentTheme.primary} : {backgroundColor: '#444'}]}
                onPress={() => setAutoWanPhra(!autoWanPhra)}
              >
                <Text style={styles.switchButtonText}>{autoWanPhra? "เปิด" : "ปิด"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, {backgroundColor: currentTheme.glass, borderColor: currentTheme.border}]}>
            <Text style={styles.settingMainTitle}>📌 ระบบตั้งเวลาสำหรับแจ้งเตือนโน้ต</Text>
            <Text style={styles.subLabel}>กำหนดให้แอปส่งเสียงพูดอ่านข้อความโน้ตตามเวลาที่ระบุ</Text>
            <View style={styles.rowToggle}>
              <Text style={styles.label}>เปิดการแจ้งเตือนเวลาสำหรับโน้ต</Text>
              <TouchableOpacity
                style={[styles.customSwitch, enableNoteAlarm? {backgroundColor: currentTheme.primary} : {backgroundColor: '#444'}]}
                onPress={() => setEnableNoteAlarm(!enableNoteAlarm)}
              >
                <Text style={styles.switchButtonText}>{enableNoteAlarm? "เปิด" : "ปิด"}</Text>
              </TouchableOpacity>
            </View>
            {enableNoteAlarm && (
              <View style={[styles.timePickerContainer, {backgroundColor: 'rgba(0,0,0,0.3)', borderColor: currentTheme.border}]}>
                <Text style={[styles.labelAlarm, {color: currentTheme.primary}]}>⏰ ระบุช่วงเวลาที่ต้องการให้ส่งเสียงเตือน:</Text>
                <View style={styles.timeRow}>
                  <TextInput style={[styles.timeInput, {backgroundColor: 'rgba(0,0,0,0.4)', borderColor: currentTheme.border}]} value={hours} onChangeText={setHours} keyboardType="numeric" maxLength={2} />
                  <Text style={styles.colon}>:</Text>
                  <TextInput style={[styles.timeInput, {backgroundColor: 'rgba(0,0,0,0.4)', borderColor: currentTheme.border}]} value={minutes} onChangeText={setMinutes} keyboardType="numeric" maxLength={2} />
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
  mainWrapper: { flex: 1, paddingTop: 50 },
  container: { padding: 15, paddingBottom: 30 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  card: { padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1 },
  label: { color: '#E0E0E0', fontSize: 14, flex: 1 },
  subLabel: { color: '#AAA', fontSize: 12, marginBottom: 15, lineHeight: 16 },
  input: { color: '#FFFFFF', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1 },
  tabContainer: { flexDirection: 'row', marginHorizontal: 15, borderRadius: 8, padding: 4, marginBottom: 10, borderWidth: 1 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6, borderWidth: 1, borderColor: 'transparent' },
  tabActive: { backgroundColor: 'rgba(0,0,0,0.3)' },
  tabText: { color: '#888', fontSize: 13, fontWeight: 'bold' },
  settingMainTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
  rowToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  customSwitch: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6, minWidth: 60, alignItems: 'center' },
  switchButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  timePickerContainer: { padding: 12, borderRadius: 8, marginTop: 15, alignItems: 'center', borderWidth: 1 },
  labelAlarm: { fontSize: 13, marginBottom: 8, fontWeight: 'bold' },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeInput: { color: '#FFFFFF', fontSize: 22, padding: 6, textAlign: 'center', borderRadius: 8, width: 65, fontWeight: 'bold', borderWidth: 1 },
  colon: { color: '#FFFFFF', fontSize: 24, marginHorizontal: 10 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  monthTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  navButton: { padding: 10 },
  navButtonText: { fontSize: 16 },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  weekDayLabel: { color: '#AAA', fontSize: 13, width: '14.2%', textAlign: 'center', fontWeight: 'bold' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 0.5, borderColor: '#333' },
  dayBox: { width: '14.28%', height: 58, justifyContent: 'flex-start', padding: 4, backgroundColor: 'rgba(38, 38, 38, 0.8)', borderWidth: 0.5, borderColor: '#3A3A3A' },
  dayBoxEmpty: { width: '14.28%', height: 58, backgroundColor: 'rgba(30, 30, 30, 0.8)', borderWidth: 0.5, borderColor: '#3A3A3A' },
  dayTopRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  dayText: { color: '#FFFFFF', fontSize: 13 },
  textBold: { fontWeight: 'bold', color: '#FFFFFF' },
  wanPhraIcon: { fontSize: 10, textShadowRadius: 6 },
  lunarText: { color: '#E0A96D', fontSize: 8, fontWeight: 'bold', marginTop: 2, textAlign: 'center', width: '100%' },
  holidayText: { fontSize: 7, marginTop: 1, textAlign: 'center', width: '100%', fontWeight: 'bold' },
  holidayBg: { backgroundColor: 'rgba(50, 34, 34, 0.8)' },
  todayBox: { backgroundColor: 'rgba(0, 212, 255, 0.4)', borderColor: '#00D4FF', borderWidth: 2 },
  selectedBox: { backgroundColor: 'rgba(68, 68, 68, 0.8)', borderColor: '#00D4FF', borderWidth: 1.5 },
});
