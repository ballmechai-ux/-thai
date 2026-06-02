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

// ธีมสีโปร่งใส 3 แบบ
const themes = {
  glass: { primary: '#00D4FF', secondary: '#00FFC6', glass: 'rgba(30, 40, 60, 0.6)', border: 'rgba(0, 212, 255, 0.3)' },
  ocean: { primary: '#0077FF', secondary: '#00BFFF', glass: 'rgba(0, 50, 100, 0.6)', border: 'rgba(0, 119, 255, 0.3)' },
  pastel: { primary: '#88CFFF', secondary: '#A8E6CF', glass: 'rgba(200, 230, 255, 0.6)', border: 'rgba(136, 207, 255, 0.3)' }
};

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
  const [theme, setTheme] = useState('glass');
  const [selectedInfo, setSelectedInfo] = useState(null);

  const currentTheme = themes[theme];

  // Gesture สไลด์เปลี่ยนเดือน
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 30,
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
        const savedTheme = await AsyncStorage.getItem('@theme');
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
      await AsyncStorage.setItem('@theme', theme);
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
      const dayData = getThaiLunarAndHoliday(dayNumber);
      dayItems.push(
        <TouchableOpacity key={`day-${dayNumber}`}
          style={[
            styles.dayBox,
            isToday && styles.todayBox,
            isSelected &&!isToday && styles.selectedBox,
            dayData.holidayText!== "" && styles.holidayBg
          ]}
          onPress={() => onDayPress(dayNumber, {...dayData, day: dayNumber })}
        >
          <View style={styles.dayTopRow}>
            <Text style={[styles.dayText, (isToday || isSelected) && styles.textBold, dayData.holidayText!== "" && {color: currentTheme.primary}]}>
              {dayNumber}
            </Text>
            {dayData.isWanPhra && <Text style={styles.wanPhraIcon}>🌸</Text>}
          </View>
          <Text style={styles.lunarText} numberOfLines={1}>{dayData.lunarText}</Text>
          {dayData.holidayText!== "" && <Text style={styles.holidayText} numberOfLines={1}>{dayData.holidayText}</Text>}
        </TouchableOpacity>
      );
    }
    return dayItems;
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, {backgroundColor: '#0A0E1A'}]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainWrapper}>
      <Text style={styles.headerTitle}>ปฏิทินไทยธีมืด & ระบบผู้ช่วยเสียง</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, currentTab === 'calendar' && styles.tabActive]} onPress={() => setCurrentTab('calendar')}>
          <Text style={[styles.tabText, currentTab === 'calendar' && styles.tabTextActive]}>📅 ปฏิทินไทย</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, currentTab === 'settings' && styles.tabActive]} onPress={() => setCurrentTab('settings')}>
          <Text style={[styles.tabText, currentTab === 'settings' && styles.tabTextActive]}>⚙️ ตั้งค่า</Text>
        </TouchableOpacity>
      </View>

      {currentTab === 'calendar' && (
        <ScrollView {...panResponder.panHandlers} contentContainerStyle={styles.container}>
          <View style={[styles.card, {borderColor: currentTheme.border, backgroundColor: currentTheme.glass}]}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))} style={styles.navButton}>
                <Text style={[styles.navButtonText, {color: currentTheme.primary}]}>◀</Text>
              </TouchableOpacity>
              <Text style={[styles.monthTitle, {color: '#FFF'}]}>{monthsTH[month]} {year + 543}</Text>
              <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))} style={styles.navButton}>
                <Text style={[styles.navButtonText, {color: currentTheme.primary}]}>▶</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color: '#AAA', fontSize: 11, textAlign: 'center', marginBottom: 8}}>ปัดซ้าย-ขวา เพื่อเปลี่ยนเดือน</Text>
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
            <View style={[styles.card, {borderColor: currentTheme.border, backgroundColor: currentTheme.glass}]}>
              <Text style={[styles.settingMainTitle, {color: currentTheme.primary}]}>
                วันที่ {selectedInfo.day} {monthsTH[month]} {year + 543}
              </Text>
              {selectedInfo.isWanPhra && <Text style={styles.subLabel}>🌸 วันพระ: {selectedInfo.lunarText}</Text>}
              {selectedInfo.holidayText!== "" && <Text style={styles.subLabel}>🏛️ วันสำคัญ: {selectedInfo.holidayText}</Text>}
              {!selectedInfo.isWanPhra && selectedInfo.holidayText === "" && <Text style={styles.subLabel}>วันธรรมดา</Text>}
            </View>
          )}

          <View style={[styles.card, {borderColor: currentTheme.border, backgroundColor: currentTheme.glass}]}>
            <Text style={[styles.label, {color: '#E0E0E0'}]}>📝 บันทึกโน้ตความจำ (วันที่ {selectedDay} {monthsTH[month]}):</Text>
            <TextInput style={[styles.input, {backgroundColor: 'rgba(0,0,0,0.3)', color: '#FFF'}]}
              placeholder="พิมพ์รายละเอียดกิจกรรมที่นี่..."
              placeholderTextColor="#666"
              value={note}
              onChangeText={setNote}
            />
            <Button title="💾 บันทึกข้อความลงปฏิทิน" color={currentTheme.primary} onPress={saveNoteOnly} />
          </View>
        </ScrollView>
      )}

      {currentTab === 'settings' && (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.card, {borderColor: currentTheme.border, backgroundColor: currentTheme.glass}]}>
            <Text style={[styles.settingMainTitle, {color: '#FFF'}]}>🎨 เลือกธีมสีแอป</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              {Object.keys(themes).map(t => (
                <TouchableOpacity key={t} onPress={() => setTheme(t)}
                  style={[styles.tabButton, theme === t && {backgroundColor: 'rgba(0,212,255,0.15)', borderColor: currentTheme.primary}]}>
                  <Text style={[styles.tabText, theme === t && {color: currentTheme.secondary}]}>
                    {t === 'glass'? 'กระจกฟ้า' : t === 'ocean'? 'ทะเลลึก' : 'พาสเทล'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.card, {borderColor: currentTheme.border, backgroundColor: currentTheme.glass}]}>
            <Text style={[styles.settingMainTitle, {color: '#FFF'}]}>🪷 ระบบแจ้งเตือนวันพระอัตโนมัติ</Text>
            <Text style={[styles.subLabel, {color: '#AAA'}]}>เมื่อถึงวันพระ แอปจะส่งเสียงพูดแจ้งเตือนอัตโนมัติตอน 7:00 น.</Text>
            <View style={styles.rowToggle}>
              <Text style={[styles.label, {color: '#E0E0E0'}]}>เปิดใช้งานระบบ Auto วันพระ</Text>
              <TouchableOpacity style={[styles.customSwitch, autoWanPhra? {backgroundColor: currentTheme.primary} : {backgroundColor: '#444'}]} onPress={() => setAutoWanPhra(!autoWanPhra)}>
                <Text style={styles.switch
