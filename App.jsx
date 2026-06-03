import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, ActivityIndicator, TouchableOpacity, Switch, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
// หัก padding ของ contentBody (8*2) + padding ของ calendarCard (4*2) = 24
const CALENDAR_PADDING = 24;
const dayWidth = Math.floor((width - CALENDAR_PADDING) / 7);

// ============================================================
// 🌕 ระบบคำนวณวันพระ + ข้างขึ้นข้างแรม (lunar calendar)
// ============================================================
const LUNAR_CYCLE = 29.53059;
const REF_FULL_MOON = new Date('2025-01-13T07:00:00+07:00'); // ขึ้น 15 ค่ำ อ้างอิง

function getLunarAge(date) {
  const diffDays = (date - REF_FULL_MOON) / 86400000;
  return ((diffDays % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
}

function checkIsWanPhra(date) {
  const age = getLunarAge(date);
  return [0, 7.38, 14.765, 22.15].some(t => {
    let diff = Math.abs(age - t);
    if (diff > LUNAR_CYCLE / 2) diff = LUNAR_CYCLE - diff;
    return diff <= 0.5;
  });
}

function getLunarText(date) {
  const age = getLunarAge(date);
  if (age <= 14.765) {
    // ข้างขึ้น: age 0 = ขึ้น 15, age 14.765 = แรม 1
    const k = Math.min(15, Math.max(1, Math.round(15 - (age / 14.765) * 14)));
    return 'ขึ้น ' + k + ' ค่ำ';
  } else {
    // ข้างแรม: age 14.765 = แรม 1, age 29.53 = ขึ้น 15
    const r = Math.min(15, Math.max(1, Math.round(1 + ((age - 14.765) / 14.765) * 13)));
    return 'แรม ' + r + ' ค่ำ';
  }
}

// ============================================================
// 📅 วันหยุดนักขัตฤกษ์ + วันสำคัญ ปี 2025–2026
// ============================================================
const THAI_HOLIDAYS = {
  '2025-1-1': 'วันปีใหม่',
  '2025-2-12': 'วันมาฆบูชา',
  '2025-4-6': 'วันจักรี',
  '2025-4-13': 'วันสงกรานต์',
  '2025-4-14': 'วันสงกรานต์',
  '2025-4-15': 'วันสงกรานต์',
  '2025-5-1': 'วันแรงงานแห่งชาติ',
  '2025-5-5': 'วันฉัตรมงคล',
  '2025-5-12': 'วันวิสาขบูชา',
  '2025-6-3': 'วันเฉลิมฯ พระราชินี',
  '2025-7-10': 'วันอาสาฬหบูชา',
  '2025-7-11': 'วันเข้าพรรษา',
  '2025-7-28': 'วันเฉลิมฯ ร.10',
  '2025-8-12': 'วันแม่แห่งชาติ',
  '2025-10-13': 'วันคล้ายวันสวรรคต ร.9',
  '2025-10-23': 'วันปิยมหาราช',
  '2025-12-5': 'วันพ่อแห่งชาติ / วันชาติ',
  '2025-12-10': 'วันรัฐธรรมนูญ',
  '2025-12-31': 'วันสิ้นปี',
  // 2026
  '2026-1-1': 'วันขึ้นปีใหม่',
  '2026-1-2': 'วันหยุดชดเชย',
  '2026-3-3': 'วันมาฆบูชา',
  '2026-4-6': 'วันจักรี',
  '2026-4-13': 'วันสงกรานต์',
  '2026-4-14': 'วันสงกรานต์',
  '2026-4-15': 'วันสงกรานต์',
  '2026-5-1': 'วันแรงงานแห่งชาติ',
  '2026-5-4': 'วันฉัตรมงคล',
  '2026-5-13': 'วันพืชมงคล',
  '2026-5-31': 'วันวิสาขบูชา',
  '2026-6-1': 'วันหยุดชดเชยวิสาขบูชา',
  '2026-6-3': 'วันเฉลิมฯ พระราชินี',
  '2026-6-28': 'วันอาสาฬหบูชา',   // ขึ้น 15 ค่ำ เดือน 8 (full moon มิ.ย.)
  '2026-6-29': 'วันเข้าพรรษา',
  '2026-7-27': 'วันหยุดชดเชยเฉลิมฯ ร.10',
  '2026-7-28': 'วันเฉลิมฯ ร.10',
  '2026-7-29': 'วันภาษาไทยแห่งชาติ',
  '2026-8-12': 'วันแม่แห่งชาติ',
  '2026-10-13': 'วันคล้ายวันสวรรคต ร.9',
  '2026-10-23': 'วันปิยมหาราช',
  '2026-12-5': 'วันพ่อแห่งชาติ / วันชาติ',
  '2026-12-7': 'วันหยุดชดเชยวันพ่อ',
  '2026-12-10': 'วันรัฐธรรมนูญ',
  '2026-12-31': 'วันสิ้นปี',
};

function getHolidayText(y, m, d) {
  return THAI_HOLIDAYS[`${y}-${m + 1}-${d}`] || '';
}

function getThaiCalendarData(y, m, d) {
  const date = new Date(y, m, d, 12);
  const lunarText = getLunarText(date);
  const isWanPhra = checkIsWanPhra(date);
  const holidayText = getHolidayText(y, m, d);
  return { lunarText, holidayText, isWanPhra };
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('calendar');
  const [isLoading, setIsLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const [selectedDay, setSelectedDay] = useState(3);
  const [note, setNote] = useState('');

  const [alertOnWanPhra, setAlertOnWanPhra] = useState(true);
  const [wanPhraTime, setWanPhraTime] = useState('06:00');
  const [alertAdvance, setAlertAdvance] = useState(true);
  const [advanceTime, setAdvanceTime] = useState('09:00');
  const [advanceDays, setAdvanceDays] = useState('1');
  const [alertSound, setAlertSound] = useState('เสียงระฆัง');
  const [bellCount, setBellCount] = useState('3');

  const [useAlarmClock, setUseAlarmClock] = useState(false);
  const [appBackground, setAppBackground] = useState('จำกัด');
  const [appLanguage, setAppLanguage] = useState('ไทย');
  const [lunarSymbol, setLunarSymbol] = useState('รูปดอกบัว');
  const [changeYearType, setChangeYearType] = useState('ขึ้น 1 ค่ำ เดือนห้า (5)');
  const [showThaiNumber, setShowThaiNumber] = useState(false);
  const [showHoliday, setShowHoliday] = useState(true);
  const [showImportantDay, setShowImportantDay] = useState(true);
  const [showPatimokkha, setShowPatimokkha] = useState(true);
  const [showProverb, setShowProverb] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('เขียว');
  const [widgetTransparent, setWidgetTransparent] = useState(true);
  const [autoCloseIntro, setAutoCloseIntro] = useState(false);

  let touchStartX = 0;

  const themes = {
    'เขียว': { primary: '#2E7D32', headerBg: '#2E7D32', text: '#FFF', cardBg: '#FFF', mainBg: '#E8F5E9', darkText: '#222' },
    'น้ำเงิน': { primary: '#1565C0', headerBg: '#1565C0', text: '#FFF', cardBg: '#FFF', mainBg: '#E3F2FD', darkText: '#222' },
    'ส้ม': { primary: '#EF6C00', headerBg: '#EF6C00', text: '#FFF', cardBg: '#FFF', mainBg: '#FFF3E0', darkText: '#222' },
    'ดำ': { primary: '#212121', headerBg: '#212121', text: '#FFF', cardBg: '#1E1E1E', mainBg: '#121212', darkText: '#EEE' },
    'แดง': { primary: '#C62828', headerBg: '#C62828', text: '#FFF', cardBg: '#FFF', mainBg: '#FFEBEE', darkText: '#222' },
    'เหลือง': { primary: '#FBC02D', headerBg: '#FBC02D', text: '#333', cardBg: '#FFF', mainBg: '#FFFDE7', darkText: '#333' },
    'ม่วง': { primary: '#AB47BC', headerBg: '#AB47BC', text: '#FFF', cardBg: '#FFF', mainBg: '#F3E5F5', darkText: '#222' },
    'ชมพู': { primary: '#F06292', headerBg: '#F06292', text: '#FFF', cardBg: '#FFF', mainBg: '#FCE4EC', darkText: '#222' }
  };

  const theme = themes[selectedTheme] || themes['เขียว'];

  useEffect(() => {
    async function loadSettings() {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme');
        if (savedTheme) setSelectedTheme(savedTheme);
        const savedNote = await AsyncStorage.getItem(`@note_${currentDate.getFullYear()}_${currentDate.getMonth()}_${selectedDay}`);
        setNote(savedNote || '');
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [selectedDay, currentDate]);

  const saveNoteOnly = async () => {
    try {
      await AsyncStorage.setItem(`@note_${currentDate.getFullYear()}_${currentDate.getMonth()}_${selectedDay}`, note);
      Alert.alert('บันทึกสำเร็จ', 'จำข้อมูลโน้ตเรียบร้อยครับเฮีย!');
    } catch (e) {
      Alert.alert('ผิดพลาด', 'บันทึกไม่สำเร็จ');
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(1);
  };

  const onTouchStart = (e) => { touchStartX = e.nativeEvent.pageX; };
  const onTouchEnd = (e) => {
    const swipeDistance = touchStartX - e.nativeEvent.pageX;
    if (swipeDistance > 60) handleNextMonth();
    if (swipeDistance < -60) handlePrevMonth();
  };

  const monthsTH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  const daysShort = ["อา","จ","อ","พ","พฤ","ศ","ส"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const renderCalendarDays = () => {
    const dayItems = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayItems.push(<View key={`empty-${i}`} style={styles.dayBoxEmpty} />);
    }
    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const isSelected = dayNumber === selectedDay;
      const { lunarText, holidayText, isWanPhra } = getThaiCalendarData(year, month, dayNumber);
      const symbol = lunarSymbol === 'รูปดอกบัว' ? '🪷' : '🌕';
      const isHoliday = holidayText !== '' && showHoliday;
      // คำนวณว่าวันนี้เป็นวันอะไรในสัปดาห์
      const dayOfWeek = new Date(year, month, dayNumber).getDay(); // 0=อา, 6=ส
      const isSunday = dayOfWeek === 0;

      dayItems.push(
        <TouchableOpacity
          key={`day-${dayNumber}`}
          style={[
            styles.dayBox,
            isSelected && { backgroundColor: '#C8E6C9', borderColor: theme.primary, borderWidth: 2 },
            isHoliday && !isSelected && { backgroundColor: '#FFCDD2' }
          ]}
          onPress={() => setSelectedDay(dayNumber)}
        >
          <View style={styles.dayTopRow}>
            <Text style={[
              styles.dayNumberText,
              isHoliday && { color: '#C62828' },
              isSunday && !isHoliday && { color: '#C62828' }
            ]}>
              {showThaiNumber ? dayNumber.toLocaleString('th-TH-u-nu-thai') : dayNumber}
            </Text>
            {isWanPhra && <Text style={{ fontSize: 14 }}>{symbol}</Text>}
          </View>
          <Text style={styles.lunarGridText} numberOfLines={1}>{lunarText}</Text>
          {isHoliday && (
            <Text style={styles.holidayGridText} numberOfLines={1}>{holidayText}</Text>
          )}
        </TouchableOpacity>
      );
    }
    return dayItems;
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2E7D32" /></View>;
  }

  return (
    <View style={[styles.mainWrapper, { backgroundColor: theme.mainBg }]}>
      <View style={[styles.appHeader, { backgroundColor: theme.headerBg }]}>
        <Text style={[styles.appHeaderTitle, { color: theme.text }]}>📅 ปฏิทินไทย & ระบบผู้ช่วยแจ้งเตือน</Text>
      </View>

      <ScrollView
        style={[styles.contentBody, { backgroundColor: theme.mainBg }]}
        contentContainerStyle={{ paddingBottom: 100, backgroundColor: theme.mainBg }}
      >
        {currentTab === 'calendar' && (
          <View>
            <View style={[styles.calendarCard, { backgroundColor: theme.cardBg }]}>
              <View style={styles.monthHeaderRow}>
                <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevMonth}>
                  <Text style={[styles.arrowTxt, { color: theme.primary }]}>◀</Text>
                </TouchableOpacity>
                <Text style={[styles.monthLabelTitle, { color: theme.darkText }]}>
                  {monthsTH[month]} {year + 543} / {year}
                </Text>
                <TouchableOpacity style={styles.arrowBtn} onPress={handleNextMonth}>
                  <Text style={[styles.arrowTxt, { color: theme.primary }]}>▶</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.weekDaysHeaderRow}>
                {daysShort.map((d, i) => (
                  <Text key={i} style={[styles.weekDayLabelText, i === 0 && { color: '#C62828' }]}>{d}</Text>
                ))}
              </View>

              <View
                style={styles.calendarGridContainer}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                {renderCalendarDays()}
              </View>
            </View>

            <View style={[styles.calendarCard, { backgroundColor: theme.cardBg, padding: 15 }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>
                📝 บันทึกความจำวันที่ {selectedDay} {monthsTH[month]}:
              </Text>
              <TextInput
                style={styles.textInputBox}
                placeholder="พิมพ์สิ่งที่ต้องการบันทึกไว้..."
                value={note}
                onChangeText={setNote}
              />
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={saveNoteOnly}>
                <Text style={{ color: '#FFF', fontWeight: 'bold', textAlign: 'center' }}>💾 บันทึกคำจำลงปฏิทิน</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentTab === 'settings' && (
          <View>
            <View style={styles.sectionHeaderContainer}><Text style={styles.sectionHeaderText}>การแจ้งเตือน</Text></View>

            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แจ้งเตือนเมื่อถึงวันพระ</Text>
              <Switch value={alertOnWanPhra} onValueChange={setAlertOnWanPhra} />
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>กำหนดเวลาแจ้งเตือน</Text>
              <TextInput style={styles.smallInlineInput} value={wanPhraTime} onChangeText={setWanPhraTime} />
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แจ้งเตือนล่วงหน้าวันพระ</Text>
              <Switch value={alertAdvance} onValueChange={setAlertAdvance} />
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>กำหนดเวลาแจ้งเตือนล่วงหน้า</Text>
              <TextInput style={styles.smallInlineInput} value={advanceTime} onChangeText={setAdvanceTime} />
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>กำหนดวันแจ้งเตือนล่วงหน้า</Text>
              <TextInput style={styles.smallInlineInput} value={advanceDays} onChangeText={setAdvanceDays} keyboardType="numeric" />
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>เสียงแจ้งเตือน</Text>
              <TouchableOpacity onPress={() => setAlertSound(alertSound === 'เสียงระฆัง' ? 'เสียงพูดธรรมดา' : 'เสียงระฆัง')}>
                <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{alertSound}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>จำนวนครั้งของเสียงระฆัง</Text>
              <TextInput style={styles.smallInlineInput} value={bellCount} onChangeText={setBellCount} keyboardType="numeric" />
            </View>

            <View style={styles.sectionHeaderContainer}><Text style={styles.sectionHeaderText}>เพิ่มประสิทธิภาพการแจ้งเตือน</Text></View>

            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>ใช้ฟังก์ชันนาฬิกาปลุก</Text>
              <Switch value={useAlarmClock} onValueChange={setUseAlarmClock} />
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>การทำงานเบื้องหลังของแอป</Text>
              <TouchableOpacity onPress={() => setAppBackground(appBackground === 'จำกัด' ? 'ไม่จำกัด' : 'จำกัด')}>
                <Text style={{ color: '#C62828', fontWeight: 'bold' }}>{appBackground}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHeaderContainer}><Text style={styles.sectionHeaderText}>แสดงข้อมูล</Text></View>

            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>ภาษาของแอป</Text>
              <TouchableOpacity onPress={() => setAppLanguage(appLanguage === 'ไทย' ? 'English' : 'ไทย')}>
                <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{appLanguage}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>สัญลักษณ์วันพระบนปฏิทิน</Text>
              <TouchableOpacity onPress={() => setLunarSymbol(lunarSymbol === 'รูปดอกบัว' ? 'รูปดวงจันทร์' : 'รูปดอกบัว')}>
                <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{lunarSymbol}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>วันเปลี่ยนปีนักษัตร</Text>
              <TouchableOpacity onPress={() => setChangeYearType(changeYearType.includes('เดือนห้า') ? 'วันสงกานต์ (13 เม.ย.)' : 'ขึ้น 1 ค่ำ เดือนห้า (5)')}>
                <Text style={{ color: theme.darkText, fontSize: 12 }}>{changeYearType}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แสดงตัวเลขไทย</Text>
              <Switch value={showThaiNumber} onValueChange={setShowThaiNumber} />
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แสดงวันหยุด</Text>
              <Switch value={showHoliday} onValueChange={setShowHoliday} />
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แสดงวันสำคัญ</Text>
              <Switch value={showImportantDay} onValueChange={setShowImportantDay} />
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แสดงวันสวดปาติโมกข์</Text>
              <Switch value={showPatimokkha} onValueChange={setShowPatimokkha} />
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แสดงสุภาษิตวันพระ</Text>
              <Switch value={showProverb} onValueChange={setShowProverb} />
            </View>

            <View style={styles.sectionHeaderContainer}><Text style={styles.sectionHeaderText}>การแสดงผล</Text></View>

            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>วิดเจ็ตโปร่งแสง</Text>
              <Switch value={widgetTransparent} onValueChange={setWidgetTransparent} />
            </View>
            <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>ปิดหน้าแนะนำอัตโนมัติ</Text>
              <Switch value={autoCloseIntro} onValueChange={setAutoCloseIntro} />
            </View>

            <View style={styles.sectionHeaderContainer}><Text style={styles.sectionHeaderText}>เลือกสีธีมกระดานแอป</Text></View>
            <View style={[styles.themeSelectorGrid, { backgroundColor: theme.cardBg }]}>
              {Object.keys(themes).map((tName) => (
                <TouchableOpacity
                  key={tName}
                  style={[styles.themeCircleButton, { backgroundColor: themes[tName].primary }]}
                  onPress={() => setSelectedTheme(tName)}
                >
                  {selectedTheme === tName && <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 11 }}>✓</Text>}
                  <Text style={styles.themeCircleLabel}>{tName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('calendar')}>
          <Text style={[styles.tabItemText, currentTab === 'calendar' && { color: theme.primary, fontWeight: 'bold' }]}>📅 ตารางเดือน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('settings')}>
          <Text style={[styles.tabItemText, currentTab === 'settings' && { color: theme.primary, fontWeight: 'bold' }]}>🛠️ ตั้งค่าระบบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  appHeader: { paddingTop: 50, paddingBottom: 15, alignItems: 'center', width: '100%' },
  appHeaderTitle: { fontSize: 15, fontWeight: 'bold' },
  contentBody: { flex: 1, padding: 8 },
  calendarCard: { borderRadius: 12, padding: 4, marginBottom: 10, elevation: 3, overflow: 'hidden' },
  monthHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 0.5, borderColor: '#EEE' },
  monthLabelTitle: { fontSize: 16, fontWeight: 'bold' },
  arrowBtn: { padding: 10, minWidth: 44, alignItems: 'center' },
  arrowTxt: { fontSize: 18, fontWeight: 'bold' },
  weekDaysHeaderRow: { flexDirection: 'row', paddingVertical: 6, backgroundColor: '#F5F5F5' },
  weekDayLabelText: { width: dayWidth, textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: '#555' },
  calendarGridContainer: { flexDirection: 'row', flexWrap: 'wrap', width: dayWidth * 7 },
  dayBox: { width: dayWidth, height: 88, padding: 5, backgroundColor: '#FFF', borderWidth: 0.3, borderColor: '#DDD', justifyContent: 'flex-start' },
  dayBoxEmpty: { width: dayWidth, height: 88, backgroundColor: '#FAFAFA', borderWidth: 0.3, borderColor: '#DDD' },
  dayTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  dayNumberText: { fontSize: 15, color: '#333', fontWeight: '600' },
  lunarGridText: { fontSize: 10, color: '#666', textAlign: 'left', width: '100%', marginTop: 2 },
  holidayGridText: { fontSize: 9, color: '#C62828', fontWeight: 'bold', width: '100%', marginTop: 1 },
  sectionHeaderContainer: { paddingHorizontal: 12, paddingVertical: 10 },
  sectionHeaderText: { fontSize: 12, fontWeight: 'bold', color: '#555' },
  settingRowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 14, borderBottomWidth: 0.5, borderColor: '#EEE' },
  settingItemTitle: { fontSize: 13, fontWeight: '500' },
  smallInlineInput: { borderWidth: 1, borderColor: '#CCC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, minWidth: 60, textAlign: 'center', backgroundColor: '#FFF', color: '#333' },
  textInputBox: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#DDD', padding: 8, borderRadius: 6, marginTop: 5, color: '#333' },
  saveBtn: { padding: 10, borderRadius: 6, marginTop: 10 },
  themeSelectorGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-around', borderRadius: 8 },
  themeCircleButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', margin: 10, elevation: 2 },
  themeCircleLabel: { fontSize: 10, color: '#333', fontWeight: 'bold', marginTop: 55, position: 'absolute' },
  bottomTabBar: { flexDirection: 'row', height: 56, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', position: 'absolute', bottom: 0, left: 0, right: 0 },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabItemText: { fontSize: 12, color: '#777' }
});
