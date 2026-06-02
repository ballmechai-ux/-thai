import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, ActivityIndicator, TouchableOpacity, Switch } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [note, setNote] = useState('');

  // --- ⚙️ State สำหรับระบบตั้งค่าตามแบบที่เฮียต้องการ ---
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
  const [lunarSymbol, setLunarSymbol] = useState('รูปดวงจันทร์');
  const [changeYearType, setChangeYearType] = useState('ขึ้น 1 ค่ำ เดือนห้า (5)');
  const [showThaiNumber, setShowThaiNumber] = useState(false);
  const [showHoliday, setShowHoliday] = useState(true);
  const [showImportantDay, setShowImportantDay] = useState(true);
  const [showPatimokkha, setShowPatimokkha] = useState(true);
  const [showProverb, setShowProverb] = useState(true);
  
  const [selectedTheme, setSelectedTheme] = useState('เขียว');
  const [widgetTransparent, setWidgetTransparent] = useState(true);
  const [autoCloseIntro, setAutoCloseIntro] = useState(false);

  // --- 🎨 ระบบเปลี่ยนสีกระดานตามธีมที่เลือก ---
  const themes = {
    'เขียว': { primary: '#4CAF50', headerBg: '#4CAF50', text: '#FFF', cardBg: '#FFF', mainBg: '#F5F5F5', darkText: '#333' },
    'น้ำเงิน': { primary: '#2196F3', headerBg: '#2196F3', text: '#FFF', cardBg: '#FFF', mainBg: '#F5F5F5', darkText: '#333' },
    'ส้ม': { primary: '#FF9800', headerBg: '#FF9800', text: '#FFF', cardBg: '#FFF', mainBg: '#F5F5F5', darkText: '#333' },
    'ดำ': { primary: '#222222', headerBg: '#333333', text: '#FFF', cardBg: '#1E1E1E', mainBg: '#121212', darkText: '#EEE' },
    'แดง': { primary: '#E53935', headerBg: '#E53935', text: '#FFF', cardBg: '#FFF', mainBg: '#F5F5F5', darkText: '#333' },
    'เหลือง': { primary: '#FDD835', headerBg: '#FDD835', text: '#333', cardBg: '#FFF', mainBg: '#F5F5F5', darkText: '#333' },
    'ม่วง': { primary: '#E040FB', headerBg: '#E040FB', text: '#FFF', cardBg: '#FFF', mainBg: '#F5F5F5', darkText: '#333' },
    'ชมพู': { primary: '#FF4081', headerBg: '#FF4081', text: '#FFF', cardBg: '#FFF', mainBg: '#F5F5F5', darkText: '#333' }
  };

  const theme = themes[selectedTheme] || themes['เขียว'];

  useEffect(() => {
    async function loadSettings() {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme');
        if (savedTheme) setSelectedTheme(savedTheme);
        const savedNote = await AsyncStorage.getItem(`@note_${selectedDay}`);
        if (savedNote) setNote(savedNote);
      } catch (e) { console.log(e); }
      setIsLoading(false);
    }
    loadSettings();
  }, [selectedDay]);

  const saveSettingsToStorage = async (key, value) => {
    try { await AsyncStorage.setItem(key, String(value)); } catch (e) { console.log(e); }
  };

  const monthsTH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const daysShort = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // --- 🇹🇭 ฐานข้อมูลวันพระและวันหยุด (อ้างอิง มิถุนายน 2569 ตามรูปของเฮีย) ---
  const getThaiCalendarData = (dY, dM, dD) => {
    let lunarText = "";
    let holidayText = "";
    let isWanPhra = false;

    if (dM === 5) { // มิถุนายน 2569
      if (dD === 1) lunarText = "แรม 1 ค่ำ";
      if (dD === 2) lunarText = "แรม 2 ค่ำ";
      if (dD === 3) { lunarText = "แรม 3 ค่ำ"; holidayText = "วันเฉลิมฯ พระราชินี"; }
      if (dD === 4) lunarText = "แรม 4 ค่ำ";
      if (dD === 5) lunarText = "แรม 5 ค่ำ";
      if (dD === 6) lunarText = "แรม 6 ค่ำ";
      if (dD === 7) lunarText = "แรม 7 ค่ำ";
      if (dD === 8) { lunarText = "แรม 8 ค่ำ"; isWanPhra = true; }
      if (dD === 9) lunarText = "แรม 9 ค่ำ";
      if (dD === 14) { lunarText = "แรม 14 ค่ำ"; isWanPhra = true; }
      if (dD === 22) { lunarText = "ขึ้น 8 ค่ำ"; isWanPhra = true; }
      if (dD === 29) { lunarText = "ขึ้น 15 ค่ำ"; isWanPhra = true; holidayText = "วันอาสาฬหบูชา"; }
      if (dD === 30) { lunarText = "แรม 1 ค่ำ"; holidayText = "วันเข้าพรรษา"; }
    }

    if (lunarText === "") {
      lunarText = dD % 2 === 0 ? `ขึ้น ${dD % 15 || 1} ค่ำ` : `แรม ${dD % 15 || 1} ค่ำ`;
    }
    return { lunarText, holidayText, isWanPhra };
  };

  const renderCalendarDays = () => {
    const dayItems = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayItems.push(<View key={`empty-${i}`} style={styles.dayBoxEmpty} />);
    }
    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const isSelected = dayNumber === selectedDay;
      const { lunarText, holidayText, isWanPhra } = getThaiCalendarData(year, month, dayNumber);

      // เลือกใช้สัญลักษณ์ตามใจเฮีย (ถ้าเปิดในตาราง)
      const symbol = lunarSymbol === 'รูปดวงจันทร์' ? '🌕' : '🪷';

      dayItems.push(
        <TouchableOpacity 
          key={`day-${dayNumber}`} 
          style={[
            styles.dayBox,
            isSelected && { backgroundColor: '#E8F5E9', borderColor: theme.primary, borderWidth: 2 },
            holidayText !== "" && showHoliday && { backgroundColor: '#FFEBEE' }
          ]}
          onPress={() => setSelectedDay(dayNumber)}
        >
          <View style={styles.dayTopRow}>
            <Text style={[styles.dayNumberText, holidayText !== "" && { color: '#D32F2F', fontWeight: 'bold' }]}>
              {showThaiNumber ? dayNumber.toLocaleString('th-TH-u-nu-thai') : dayNumber}
            </Text>
            {isWanPhra && <Text style={{ fontSize: 14 }}>{symbol}</Text>}
          </View>
          <Text style={styles.lunarGridText}>{lunarText}</Text>
          {holidayText !== "" && showHoliday && (
            <Text style={styles.holidayGridText} numberOfLines={1}>{holidayText}</Text>
          )}
        </TouchableOpacity>
      );
    }
    return dayItems;
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <View style={[styles.mainWrapper, { backgroundColor: theme.mainBg }]}>
      {/* ส่วนหัวแอปปรับตามธีมสี */}
      <View style={[styles.appHeader, { backgroundColor: theme.headerBg }]}>
        <Text style={[styles.appHeaderTitle, { color: theme.text }]}>ปฏิทินไทยธีมสี & ระบบผู้ช่วยแจ้งเตือน</Text>
      </View>

      {/* แถบเปลี่ยนหน้าด้านล่างสไตล์เมนูบาร์ */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('calendar')}>
          <Text style={[styles.tabItemText, currentTab === 'calendar' && { color: theme.primary, fontWeight: 'bold' }]}>📅 เดือน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('settings')}>
          <Text style={[styles.tabItemText, currentTab === 'settings' && { color: theme.primary, fontWeight: 'bold' }]}>🛠️ ตั้งค่า</Text>
        </TouchableOpacity>
      </View>

      {currentTab === 'calendar' && (
        <ScrollView style={styles.contentBody}>
          <View style={[styles.calendarCard, { backgroundColor: theme.cardBg }]}>
            <View style={styles.monthHeaderRow}>
              <Text style={[styles.monthLabelTitle, { color: theme.darkText }]}>{monthsTH[month]} {year + 543} | {year}</Text>
            </View>

            <View style={styles.weekDaysHeaderRow}>
              {daysShort.map((d, i) => (
                <Text key={i} style={[styles.weekDayLabelText, i === 0 && { color: '#D32F2F' }]}>{d}</Text>
              ))}
            </View>

            {/* ช่องปฏิทินแบบขยายกว้างขวางตาทรงสี่เหลี่ยมผืนผ้า */}
            <View style={styles.calendarGridContainer}>
              {renderCalendarDays()}
            </View>
          </View>

          {/* กล่องบันทึกโน้ตประจำวัน */}
          <View style={[styles.calendarCard, { backgroundColor: theme.cardBg, padding: 15 }]}>
            <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>📝 บันทึกโน้ตสำหรับวันที่ {selectedDay} (จำคำไว้ในเครื่อง):</Text>
            <TextInput 
              style={styles.textInputBox}
              placeholder="พิมพ์ข้อความโน้ตที่นี่..."
              value={note}
              onChangeText={(val) => { setNote(val); AsyncStorage.setItem(`@note_${selectedDay}`, val); }}
            />
          </View>
        </ScrollView>
      )}

      {currentTab === 'settings' && (
        <ScrollView style={styles.contentBody}>
          
          {/* หมวดหมู่: การแจ้งเตือน */}
          <View style={styles.sectionHeaderContainer}><Text style={styles.sectionHeaderText}>การแจ้งเตือน</Text></View>
          
          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แจ้งเตือนเมื่อถึงวันพระ</Text>
              <Text style={styles.settingItemSub}>กำหนดให้มีเสียงเตือนเมื่อถึงวันพระ</Text>
            </View>
            <Switch value={alertOnWanPhra} onValueChange={(v) => { setAlertOnWanPhra(v); saveSettingsToStorage('@alert_wanphra', v); }} />
          </View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>กำหนดเวลาแจ้งเตือน</Text>
              <Text style={styles.settingItemSub}>แตะเพื่อเปลี่ยนเวลาแจ้งเตือนวันพระ</Text>
            </View>
            <TextInput style={styles.smallInlineInput} value={wanPhraTime} onChangeText={setWanPhraTime} />
          </View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แจ้งเตือนล่วงหน้าวันพระ</Text>
              <Text style={styles.settingItemSub}>กำหนดให้แจ้งเตือนล่วงหน้าก่อนถึงวันพระ</Text>
            </View>
            <Switch value={alertAdvance} onValueChange={(v) => setAlertAdvance(v)} />
          </View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>กำหนดเวลาแจ้งเตือนล่วงหน้า</Text>
            </View>
            <TextInput style={styles.smallInlineInput} value={advanceTime} onChangeText={setAdvanceTime} />
          </View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>กำหนดวันแจ้งเตือนล่วงหน้า</Text>
            </View>
            <TextInput style={styles.smallInlineInput} value={advanceDays} onChangeText={setAdvanceDays} />
          </View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>เสียงแจ้งเตือน</Text>
              <Text style={styles.settingItemSub}>แตะเพื่อเปลี่ยนระบบเสียงแจ้งเตือน</Text>
            </View>
            <TouchableOpacity onPress={() => setAlertSound(alertSound === 'เสียงระฆัง' ? 'เสียงพูดธรรมดา' : 'เสียงระฆัง')}>
              <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{alertSound}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>จำนวนครั้งของเสียงระฆัง</Text>
            </View>
            <TextInput style={styles.smallInlineInput} value={bellCount} onChangeText={setBellCount} keyboardType="numeric" />
          </View>

          {/* หมวดหมู่: เพิ่มประสิทธิภาพ */}
          <View style={styles.sectionHeaderContainer}><Text style={styles.sectionHeaderText}>เพิ่มประสิทธิภาพการแจ้งเตือน</Text></View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>ใช้ฟังก์ชันนาฬิกาปลุก</Text>
            </View>
            <Switch value={useAlarmClock} onValueChange={(v) => setUseAlarmClock(v)} />
          </View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>การทำงานเบื้องหลังของแอป</Text>
            </View>
            <Text style={{ color: '#D32F2F', fontWeight: 'bold' }}>{appBackground}</Text>
          </View>

          {/* หมวดหมู่: แสดงข้อมูลปฏิทิน */}
          <View style={styles.sectionHeaderContainer}><Text style={styles.sectionHeaderText}>แสดงข้อมูล</Text></View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>สัญลักษณ์วันพระบนปฏิทิน</Text>
            </View>
            <TouchableOpacity onPress={() => setLunarSymbol(lunarSymbol === 'รูปดวงจันทร์' ? 'รูปดอกบัว' : 'รูปดวงจันทร์')}>
              <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{lunarSymbol}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>วันเปลี่ยนปีนักษัตร</Text>
            </View>
            <Text style={{ color: '#555' }}>{changeYearType}</Text>
          </View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แสดงตัวเลขไทย</Text>
            <Switch value={showThaiNumber} onValueChange={(v) => setShowThaiNumber(v)} />
          </View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แสดงวันหยุด</Text>
            <Switch value={showHoliday} onValueChange={(v) => setShowHoliday(v)} />
          </View>

          <View style={[styles.settingRowItem, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>แสดงวันสำคัญ</Text>
            <Switch value={showImportantDay} onValueChange={(v) => setShowImportantDay(v)} />
          </View>

          {/* หมวดหมู่: การแสดงผลและเลือกธีมสี */}
          <View style={styles.sectionHeaderContainer}><Text style={styles.sectionHeaderText}>การแสดงผล (เลือกธีมแอป)</Text></View>
          
          <View style={[styles.themeSelectorGrid, { backgroundColor: theme.cardBg }]}>
            {Object.keys(themes).map((tName) => (
              <TouchableOpacity 
                key={tName} 
                style={[styles.themeCircleButton, { backgroundColor: themes[tName].primary }]} 
                onPress={() => { setSelectedTheme(tName); AsyncStorage.setItem('@theme', tName); }}
              >
                {selectedTheme === tName && <Text style={{ color: '#FFF', fontWeight: 'bold' }}>✓</Text>}
                <Text style={styles.themeCircleLabel}>{tName}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  appHeader: { paddingTop: 45, paddingBottom: 15, alignItems: 'center' },
  appHeaderTitle: { fontSize: 16, fontWeight: 'bold' },
  
  contentBody: { flex: 1, padding: 8 },
  calendarCard: { borderRadius: 4, padding: 6, marginBottom: 10, elevation: 2 },
  monthHeaderRow: { paddingVertical: 10, alignItems: 'center', borderBottomWidth: 1, borderColor: '#EEE' },
  monthLabelTitle: { fontSize: 16, fontWeight: 'bold' },
  
  weekDaysHeaderRow: { flexDirection: 'row', paddingVertical: 8, backgroundColor: '#FAFAFA' },
  weekDayLabelText: { width: '14.28%', textAlign: 'center', fontSize: 12, fontWeight: '500', color: '#666' },
  
  // --- 🛠️ ส่วนปรับขนาดตารางปฏิทินให้กว้างขวาง เต็มตา ---
  calendarGridContainer: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', marginTop: 5 },
  dayBox: { width: '14.28%', height: 75, padding: 4, backgroundColor: '#FFF', borderWidth: 0.3, borderColor: '#E0E0E0', justifyContent: 'space-between' },
  dayBoxEmpty: { width: '14.28%', height: 75, backgroundColor: '#F9F9F9', borderWidth: 0.3, borderColor: '#E0E0E0' },
  dayTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayNumberText: { fontSize: 14, color: '#333' },
  lunarGridText: { fontSize: 9, color: '#757575', textAlign: 'left' },
  holidayGridText: { fontSize: 8, color: '#E53935', textAlign: 'center', marginTop: 1 },

  // --- 🛠️ ส่วนดีไซน์หน้าตั้งค่ารายการเมนู ---
  sectionHeaderContainer: { paddingHorizontal: 12, paddingVertical: 8 },
  sectionHeaderText: { fontSize: 13, fontWeight: 'bold', color: '#666' },
  settingRowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: '#EDF1F7' },
  settingTextGroup: { flex: 1, paddingRight: 10 },
  settingItemTitle: { fontSize: 14, fontWeight: '500' },
  settingItemSub: { fontSize: 11, color: '#8F9BB3', marginTop: 2 },
  smallInlineInput: { borderWidth: 1, borderColor: '#E4E9F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, minWidth: 60, textAlign: 'center', backgroundColor: '#F7F9FC', color: '#333' },
  textInputBox: { backgroundColor: '#F7F9FC', borderWidth: 1, borderColor: '#E4E9F2', padding: 10, borderRadius: 6, marginTop: 8, color: '#333' },

  // --- 🎨 ตารางปุ่มเลือกธีมสีสีสันสดใส ---
  themeSelectorGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, justifyContent: 'space-around' },
  themeCircleButton: { width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', margin: 8, elevation: 3 },
  themeCircleLabel: { fontSize: 10, color: '#FFF', fontWeight: 'bold', position: 'absolute', bottom: -18, width: 65, textAlign: 'center', color: '#333' },

  // --- 📱 เมนูบาร์เปลี่ยนหน้า ---
  bottomTabBar: { flexDirection: 'row', height: 52, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E4E9F2' },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabItemText: { fontSize: 13, color: '#8F9BB3' }
});
