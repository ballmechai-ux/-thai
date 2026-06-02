import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, ActivityIndicator, TouchableOpacity, Switch, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const dayWidth = (width - 16) / 7; 

export default function App() {
  const [currentTab, setCurrentTab] = useState('calendar');
  const [isLoading, setIsLoading] = useState(true);
  
  // 📅 สเตตจัดการวันที่และเดือน
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // เริ่มต้นที่ มิถุนายน 2569
  const [selectedDay, setSelectedDay] = useState(3); 
  const [note, setNote] = useState('');

  // ⚙️ [ห้ามเอาออก] เก็บครบทุก State การตั้งค่าตามแบบเดิมของเฮีย 100%
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

  // พิกัดสำหรับระบบปัดหน้าจอ (Swipe Gesture)
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

  // ฟังก์ชันเลื่อนเดือน
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(1);
  };

  // ดักจับจังหวะสไลด์หน้าจอ
  const onTouchStart = (e) => { touchStartX = e.nativeEvent.pageX; };
  const onTouchEnd = (e) => {
    const touchEndX = e.nativeEvent.pageX;
    const swipeDistance = touchStartX - touchEndX;
    if (swipeDistance > 60) handleNextMonth();
    if (swipeDistance < -60) handlePrevMonth();
  };

  const monthsTH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const daysShort = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 🇹🇭 ฐานข้อมูลวันพระ และ วันหยุดสำคัญประจำปี พ.ศ. 2569 (ตรงตามรูปภาพอ้างอิง)
  const getThaiCalendarData = (dY, dM, dD) => {
    let lunarText = "";
    let holidayText = "";
    let isWanPhra = false;

    // คำนวณข้างขึ้นข้างแรมเบื้องต้นสำหรับแสดงผลทั่วไป
    lunarText = dD % 2 === 0 ? `ขึ้น ${dD % 15 || 15} ค่ำ` : `แรม ${dD % 15 || 15} ค่ำ`;

    // ตรวจสอบข้อมูลล็อกเฉพาะปี 2026 / 2569 ตามรายเดือนจากที่เฮียให้มา
    if (dY === 2026) {
      if (dM === 0) { // มกราคม
        if (dD === 1) holidayText = "วันขึ้นปีใหม่";
        if (dD === 2) holidayText = "วันหยุดชดเชย สคช.";
      }
      else if (dM === 2) { // มีนาคม
        if (dD === 3) holidayText = "วันมาฆบูชา";
      }
      else if (dM === 3) { // เมษายน
        if (dD === 6) holidayText = "วันจักรี";
        if (dD === 13) holidayText = "วันสงกรานต์";
        if (dD === 14) holidayText = "วันสงกรานต์";
        if (dD === 15) holidayText = "วันสงกรานต์";
      }
      else if (dM === 4) { // พฤษภาคม
        if (dD === 1) holidayText = "วันแรงงานแห่งชาติ";
        if (dD === 4) holidayText = "วันฉัตรมงคล";
        if (dD === 13) holidayText = "วันพืชมงคล";
        if (dD === 31) holidayText = "วันวิสาขบูชา";
      }
      else if (dM === 5) { // มิถุนายน
        if (dD === 1) holidayText = "วันหยุดชดเชยวิสาขบูชา";
        if (dD === 3) { holidayText = "วันเฉลิมฯ พระราชินี"; lunarText = "แรม 3 ค่ำ"; }
        // กำหนดวันพระตรงตามปฏิทินหลวง มิ.ย. 2569
        if (dD === 8) { lunarText = "แรม 8 ค่ำ"; isWanPhra = true; }
        if (dD === 14) { lunarText = "แรม 14 ค่ำ"; isWanPhra = true; }
        if (dD === 15) lunarText = "ขึ้น 1 ค่ำ";
        if (dD === 22) { lunarText = "ขึ้น 8 ค่ำ"; isWanPhra = true; }
        if (dD === 29) { lunarText = "ขึ้น 15 ค่ำ"; isWanPhra = true; holidayText = "วันอาสาฬหบูชา"; }
        if (dD === 30) { lunarText = "แรม 1 ค่ำ"; holidayText = "วันเข้าพรรษา"; }
      }
      else if (dM === 6) { // กรกฎาคม
        if (dD === 27) holidayText = "วันหยุดชดเชยเฉลิมฯ ร.10";
        if (dD === 28) holidayText = "วันเฉลิมฯ ร.10";
        if (dD === 29) holidayText = "วันภาษาไทยแห่งชาติ / วันอาสาฬหบูชา";
        if (dD === 30) holidayText = "วันเข้าพรรษา";
      }
      else if (dM === 7) { // สิงหาคม
        if (dD === 12) holidayText = "วันแม่แห่งชาติ";
      }
      else if (dM === 9) { // ตุลาคม
        if (dD === 13) holidayText = "วันคล้ายวันสวรรคต ร.9";
        if (dD === 23) holidayText = "วันปิยมหาราช";
      }
      else if (dM === 11) { // ธันวาคม
        if (dD === 5) holidayText = "วันพ่อแห่งชาติ / วันชาติ";
        if (dD === 7) holidayText = "วันหยุดชดเชยวันพ่อ";
        if (dD === 10) holidayText = "วันรัฐธรรมนูญ";
        if (dD === 31) holidayText = "วันสิ้นปี";
      }
    }

    // กำหนดลูปวันพระหลักแบบมาตรฐานสำหรับวันทั่วไปที่ระบบไม่ได้ล็อกวันพระหลวงไว้
    if (!isWanPhra && (dD === 8 || dD === 15 || dD === 23 || dD === 30)) {
      isWanPhra = true;
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
      const symbol = lunarSymbol === 'รูปดอกบัว' ? '🪷' : '🌕';

      dayItems.push(
        <TouchableOpacity 
          key={`day-${dayNumber}`} 
          style={[
            styles.dayBox,
            isSelected && { backgroundColor: '#C8E6C9', borderColor: theme.primary, borderWidth: 2 },
            holidayText !== "" && showHoliday && { backgroundColor: '#FFCDD2' }
          ]}
          onPress={() => setSelectedDay(dayNumber)}
        >
          <View style={styles.dayTopRow}>
            <Text style={[styles.dayNumberText, holidayText !== "" && { color: '#C62828', fontWeight: 'bold' }]}>
              {showThaiNumber ? dayNumber.toLocaleString('th-TH-u-nu-thai') : dayNumber}
            </Text>
            {isWanPhra && <Text style={{ fontSize: 13 }}>{symbol}</Text>}
          </View>
          <Text style={styles.lunarGridText} numberOfLines={1}>{lunarText}</Text>
          {holidayText !== "" && showHoliday && (
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
              
              {/* แถบหัวเดือนพร้อมปุ่มกดสไลด์เปลี่ยนเดือน */}
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

              {/* กระดานตารางปฏิทินรองรับการปัด Swipe นิ้วเปลี่ยนเดือน */}
              <View 
                style={styles.calendarGridContainer}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                {renderCalendarDays()}
              </View>
            </View>

            <View style={[styles.calendarCard, { backgroundColor: theme.cardBg, padding: 15 }]}>
              <Text style={[styles.settingItemTitle, { color: theme.darkText }]}>📝 บันทึกความจำวันที่ {selectedDay} {monthsTH[month]}:</Text>
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
  calendarCard: { borderRadius: 8, padding: 4, marginBottom: 10, elevation: 2 },
  monthHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 20, borderBottomWidth: 0.5, borderColor: '#EEE' },
  monthLabelTitle: { fontSize: 15, fontWeight: 'bold' },
  arrowBtn: { padding: 10, minWidth: 40, alignItems: 'center' },
  arrowTxt: { fontSize: 16, fontWeight: 'bold' },
  weekDaysHeaderRow: { flexDirection: 'row', paddingVertical: 8, backgroundColor: '#FDFDFD' },
  weekDayLabelText: { width: dayWidth, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#555' },
  calendarGridContainer: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  dayBox: { width: dayWidth, height: 80, padding: 4, backgroundColor: '#FFF', borderWidth: 0.3, borderColor: '#DDD', justifyContent: 'space-between' },
  dayBoxEmpty: { width: dayWidth, height: 80, backgroundColor: '#FAFAFA', borderWidth: 0.3, borderColor: '#DDD' },
  dayTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  dayNumberText: { fontSize: 13, color: '#333' },
  lunarGridText: { fontSize: 9, color: '#666', textAlign: 'left', width: '100%' },
  holidayGridText: { fontSize: 8, color: '#C62828', fontWeight: 'bold', width: '100%' },
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
