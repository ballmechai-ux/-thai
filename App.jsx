import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Modal, Switch, TextInput } from 'react-native';

// 📅 ฐานข้อมูลวันหยุดราชการไทย พ.ศ. 2569
const THAI_HOLIDAYS = {
  '2026-01-01': 'วันขึ้นปีใหม่', '2026-02-24': 'วันศิลปินแห่งชาติ', '2026-03-03': 'วันมาฆบูชา',
  '2026-04-06': 'วันจักรี', '2026-04-13': 'วันสงกรานต์', '2026-04-14': 'วันสงกรานต์', '2026-04-15': 'วันสงกรานต์',
  '2026-05-01': 'วันแรงงานแห่งชาติ', '2026-05-04': 'วันฉัตรมงคล', '2026-05-13': 'วันพืชมงคล', '2026-05-31': 'วันวิสาขบูชา',
  '2026-06-03': 'วันเฉลิมฯ พระราชินี', '2026-07-28': 'วันเฉลิมฯ ร.10', '2026-07-29': 'วันอาสาฬหบูชา', '2026-07-30': 'วันเข้าพรรษา',
  '2026-08-12': 'วันแม่แห่งชาติ', '2026-10-13': 'วันคล้ายวันสวรรคต ร.9', '2026-10-23': 'วันปิยมหาราช',
  '2026-12-05': 'วันพ่อแห่งชาติ', '2026-12-10': 'วันรัฐธรรมนูญ', '2026-12-31': 'วันสิ้นปี'
};

// 🟡 ฐานข้อมูลวันพระหลวง ปี พ.ศ. 2569
const BUDDHIST_DAYS_2026 = {
  '2026-01-03': 'ขึ้น ๑๕ ค่ำ เดือน ๒', '2026-01-11': 'แรม ๘ ค่ำ เดือน ๒', '2026-01-18': 'แรม ๑๕ ค่ำ เดือน ๒', '2026-01-26': 'ขึ้น ๘ ค่ำ เดือน ๓',
  '2026-02-02': 'ขึ้น ๑๕ ค่ำ เดือน ๓', '2026-02-10': 'แรม ๘ ค่ำ เดือน ๓', '2026-02-16': 'แรม ๑๔ ค่ำ เดือน ๓', '2026-02-24': 'ขึ้น ๘ ค่ำ เดือน ๔',
  '2026-03-03': 'ขึ้น ๑๕ ค่ำ เดือน ๔ (มาฆบูชา)', '2026-03-11': 'แรม ๘ ค่ำ เดือน ๔', '2026-03-18': 'แรม ๑๕ ค่ำ เดือน ๔', '2026-03-26': 'ขึ้น ๘ ค่ำ เดือน ๕',
  '2026-04-02': 'ขึ้น ๑๕ ค่ำ เดือน ๕', '2026-04-10': 'แรม ๘ ค่ำ เดือน ๕', '2026-04-16': 'แรม ๑๔ ค่ำ เดือน ๕', '2026-04-24': 'ขึ้น ๘ ค่ำ เดือน ๖',
  '2026-05-01': 'ขึ้น ๑๕ ค่ำ เดือน ๖', '2026-05-09': 'แรม ๘ ค่ำ เดือน ๖', '2026-05-16': 'แรม ๑๕ ค่ำ เดือน ๖', '2026-05-24': 'ขึ้น ๘ ค่ำ เดือน ๗', '2026-05-31': 'ขึ้น ๑๕ ค่ำ เดือน ๗ (วิสาขบูชา)',
  '2026-06-08': 'แรม ๘ ค่ำ เดือน ๗', '2026-06-14': 'แรม ๑๔ ค่ำ เดือน ๗', '2026-06-22': 'ขึ้น ๘ ค่ำ เดือน ๘', '2026-06-29': 'ขึ้น ๑๕ ค่ำ เดือน ๘',
  '2026-07-07': 'แรม ๘ ค่ำ เดือน ๘', '2026-07-14': 'แรม ๑๕ ค่ำ เดือน ๘', '2026-07-22': 'ขึ้น ๘ ค่ำ เดือน ๘-๘', '2026-07-29': 'ขึ้น ๑๕ ค่ำ เดือน ๘-๘ (อาสาฬหบูชา)',
  '2026-08-06': 'แรม ๘ ค่ำ เดือน ๘-๘', '2026-08-13': 'แรม ๑๕ ค่ำ เดือน ๘-๘', '2026-08-21': 'ขึ้น ๘ ค่ำ เดือน ๙', '2026-08-28': 'ขึ้น ๑๕ ค่ำ เดือน ๙',
  '2026-09-05': 'แรม ๘ ค่ำ เดือน ๙', '2026-09-11': 'แรม ๑๔ ค่ำ เดือน ๙', '2026-09-19': 'ขึ้น ๘ ค่ำ เดือน ๑๐', '2026-09-26': 'ขึ้น ๑๕ ค่ำ เดือน ๑๐',
  '2026-10-04': 'แรม ๘ ค่ำ เดือน ๑๐', '2026-10-11': 'แรม ๑๕ ค่ำ เดือน ๑๐', '2026-10-19': 'ขึ้น ๘ ค่ำ เดือน ๑๑', '2026-10-27': 'ขึ้น ๑๕ ค่ำ เดือน ๑๑ (ออกพรรษา)',
  '2026-11-03': 'แรม ๘ ค่ำ เดือน ๑๑', '2026-11-09': 'แรม ๑๔ ค่ำ เดือน ๑๑', '2026-11-17': 'ขึ้น ๘ ค่ำ เดือน ๑๒', '2026-11-24': 'ขึ้น ๑๕ ค่ำ เดือน ๑๒ (ลอยกระทง)',
  '2026-12-02': 'แรม ๘ ค่ำ เดือน ๑๒', '2026-12-09': 'แรม ๑๕ ค่ำ เดือน ๑๒', '2026-12-17': 'ขึ้น ๘ ค่ำ เดือน ๑', '2026-12-24': 'ขึ้น ๑๕ ค่ำ เดือน ๑'
};

const MONTH_NAMES_TH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const MONTH_NAMES_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function App() {
  const [currentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // เดือนมิถุนายนเริ่มต้น
  const [selectedDay, setSelectedDay] = useState(null);
  
  // ⚙️ ส่วนควบคุมสถานะการตั้งค่าตามบรีฟ (ข้อ 2)
  const [showSettings, setShowSettings] = useState(false);
  const [isNotifyToday, setIsNotifyToday] = useState(true); // 2.1
  const [todayNotifyTime, setTodayNotifyTime] = useState('06:00'); // 2.2
  const [isNotifyAdvance, setIsNotifyAdvance] = useState(true); // 2.3
  const [advanceNotifyTime, setAdvanceNotifyTime] = useState('09:00'); // 2.4
  const [advanceDays, setAdvanceDays] = useState(1); // 2.5
  const [bellCount, setBellCount] = useState(3); // 2.6 จำนวนครั้งเสียงระฆัง
  const [language, setLanguage] = useState('th'); // 2.6 (ซ้ำ) th หรือ en
  const [is3DMode, setIs3DMode] = useState(true); // 2.8 ปุ่มเลือกแบบแสดง 3D
  
  // 2.7 โครงสร้างสีกำหนดพื้นหลังแต่ละส่วน (สามารถปรับแต่งได้)
  const [colors] = useState({
    bg: '#f4f6f9',
    cardBg: '#ffffff',
    textMain: '#2C3E50',
    buddhistText: '#e67e22',
    holidayBg: '#fde8e8',
    holidayText: '#e74c3c'
  });

  const changeMonth = (direction) => {
    let nextMonth = currentMonth + direction;
    if (nextMonth > 11) setCurrentMonth(0);
    else if (nextMonth < 0) setCurrentMonth(11);
    else setCurrentMonth(nextMonth);
    setSelectedDay(null);
  };

  const renderCalendarCells = () => {
    const cells = [];
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<View key={`empty-${i}`} style={[styles.dayCell, styles.emptyCell]} />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

      const buddhistDetails = BUDDHIST_DAYS_2026[dateKey];
      const holidayName = THAI_HOLIDAYS[dateKey];
      const isSelected = selectedDay === day;

      // ลอจิกสไตล์รูปแบบ 3D Neumorphism ทรงพลัง (ข้อ 3)
      const cellStyle = [
        styles.dayCell,
        { backgroundColor: colors.cardBg },
        is3DMode && isSelected ? styles.dayCell3DActive : null,
        !is3DMode && isSelected ? styles.dayCellSimpleActive : null
      ];

      cells.push(
        <TouchableOpacity 
          key={`day-${day}`} 
          style={cellStyle} 
          activeOpacity={0.8}
          onPress={() => setSelectedDay(day)}
        >
          <Text style={[styles.dayNumber, { color: colors.textMain }]}>{day}</Text>
          
          <View style={styles.cellFooter}>
            {buddhistDetails && (
              <View style={styles.buddhistWrapper}>
                <Text style={styles.buddhistIcon}>🪷</Text>
                <Text style={[styles.buddhistLabelText, { color: colors.buddhistText }]}>
                  {language === 'th' ? 'วันพระ' : 'Buddha'}
                </Text>
              </View>
            )}

            {holidayName && (
              <Text style={[styles.holidayText, { color: colors.holidayText, backgroundColor: colors.holidayBg }]} numberOfLines={1}>
                {holidayName}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  // ดึงข้อมูลสำหรับแถบสรุปล้ำๆ ด้านล่าง (ข้อ 3)
  const getSelectedDayDetails = () => {
    if (!selectedDay) return language === 'th' ? 'เลือกวันที่เพื่อดูรายละเอียด' : 'Select a date to view details';
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(selectedDay).padStart(2, '0');
    const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
    
    const buddhist = BUDDHIST_DAYS_2026[dateKey];
    const holiday = THAI_HOLIDAYS[dateKey];

    let info = `${language === 'th' ? 'วันที่' : 'Date'} ${selectedDay} ${language === 'th' ? MONTH_NAMES_TH[currentMonth] : MONTH_NAMES_EN[currentMonth]} ${currentYear + 543}\n`;
    if (buddhist) info += `🪷 ${language === 'th' ? 'วันพระหลวง' : 'Buddhist Holy Day'}: ${buddhist} (${language === 'th' ? 'เตือนเสียงระฆัง' : 'Bell Alert'})\n`;
    if (holiday) info += `🟥 ${language === 'th' ? 'วันหยุด' : 'Holiday'}: ${holiday}`;
    if (!buddhist && !holiday) info += language === 'th' ? ' ไม่มีวันสำคัญในวันนี้' : ' No important events today';
    
    return info;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* 1. ปุ่มตั้งค่าขนาดเล็กขวาบนจอ */}
      <TouchableOpacity style={styles.settingsMiniButton} onPress={() => setShowSettings(true)}>
        <Text style={styles.settingsMiniText}>⚙️ ตั้งค่า</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton} onPress={() => changeMonth(-1)}>
            <Text style={styles.navButtonText}>{language === 'th' ? '◀ ก่อนหน้า' : '◀ Prev'}</Text>
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: colors.textMain }]}>
            {language === 'th' ? `${MONTH_NAMES_TH[currentMonth]} ${currentYear + 543}` : `${MONTH_NAMES_EN[currentMonth]} ${currentYear}`}
          </Text>
          <TouchableOpacity style={styles.navButton} onPress={() => changeMonth(1)}>
            <Text style={styles.navButtonText}>{language === 'th' ? 'ถัดไป ▶' : 'Next ▶'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayRow}>
          {(language === 'th' ? WEEKDAYS_TH : WEEKDAYS_EN).map((day, index) => (
            <Text key={index} style={[styles.weekdayText, { color: colors.textMain }]}>{day}</Text>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.gridContainer}>
          <View style={styles.calendarGrid}>
            {renderCalendarCells()}
          </View>
        </ScrollView>

        {/* 3. แถบแสดงรายละเอียดล้ำๆ ด้านล่างสุด (Glassmorphism Concept) */}
        <View style={styles.detailGlassCard}>
          <Text style={styles.detailCardTitle}>📊 {language === 'th' ? 'ข้อมูลรายละเอียดประจำวัน' : 'Daily Information'}</Text>
          <Text style={styles.detailCardContent}>{getSelectedDayDetails()}</Text>
        </View>
      </View>

      {/* 2. หน้าจอป๊อปอัปผังการตั้งค่า (Settings Modal) */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚙️ การตั้งค่าระบบ</Text>
            
            <ScrollView style={styles.settingsScroll}>
              {/* 2.1 แจ้งเตือนเมื่อถึงวันพระ */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>2.1 แจ้งเตือนเมื่อถึงวันพระ</Text>
                  <Text style={styles.settingSub}>กำหนดให้แจ้งเตือนเมื่อถึงวันพระจริง</Text>
                </View>
                <Switch value={isNotifyToday} onValueChange={setIsNotifyToday} />
              </View>

              {/* 2.2 กำหนดเวลาแจ้งเตือนวันพระ */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>2.2 กำหนดเวลาแจ้งเตือน (วันพระ)</Text>
                  <Text style={styles.settingSub}>แตะเพื่อเปลี่ยนเวลาแจ้งเตือน</Text>
                </View>
                <TextInput 
                  style={styles.timeInput} 
                  value={todayNotifyTime} 
                  onChangeText={setTodayNotifyTime}
                  placeholder="06:00"
                />
              </View>

              <View style={styles.divider} />

              {/* 2.3 แจ้งเตือนล่วงหน้าวันพระ */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>2.3 แจ้งเตือนล่วงหน้าวันพระ</Text>
                  <Text style={styles.settingSub}>เตือนก่อน 1 วัน / วันจริงเสียงระฆัง</Text>
                </View>
                <Switch value={isNotifyAdvance} onValueChange={setIsNotifyAdvance} />
              </View>

              {/* 2.4 กำหนดเวลาแจ้งเตือนล่วงหน้า */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>2.4 กำหนดเวลาแจ้งเตือนล่วงหน้า</Text>
                  <Text style={styles.settingSub}>แตะเพื่อเปลี่ยนเวลาแจ้งเตือน</Text>
                </View>
                <TextInput 
                  style={styles.timeInput} 
                  value={advanceNotifyTime} 
                  onChangeText={setAdvanceNotifyTime}
                  placeholder="09:00"
                />
              </View>

              {/* 2.5 กำหนดวันแจ้งเตือนล่วงหน้า */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>2.5 กำหนดวันแจ้งเตือนล่วงหน้า</Text>
                  <Text style={styles.settingSub}>แตะเพื่อเปลี่ยนจำนวนวันล่วงหน้า</Text>
                </View>
                <TextInput 
                  style={styles.timeInput} 
                  value={String(advanceDays)} 
                  onChangeText={(val) => setAdvanceDays(Number(val) || 1)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.divider} />

              {/* 2.6 เสียงแจ้งเตือน (จำนวนครั้งเสียงระฆัง) */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>2.6 เสียงแจ้งเตือน (จำนวนครั้งระฆัง)</Text>
                  <Text style={styles.settingSub}>แตะเพื่อเปลี่ยนจำนวนครั้งตีระฆัง</Text>
                </View>
                <TextInput 
                  style={styles.timeInput} 
                  value={String(bellCount)} 
                  onChangeText={(val) => setBellCount(Number(val) || 3)}
                  keyboardType="numeric"
                />
              </View>

              {/* 2.6 (ซ้ำ) เปลี่ยนภาษา */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>2.6 เปลี่ยนภาษา (Language)</Text>
                  <Text style={styles.settingSub}>ไทย / English (US)</Text>
                </View>
                <View style={styles.langToggleContainer}>
                  <TouchableOpacity 
                    style={[styles.langButton, language === 'th' && styles.langButtonActive]}
                    onPress={() => setLanguage('th')}
                  >
                    <Text style={styles.langText}>TH</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.langButton, language === 'en' && styles.langButtonActive]}
                    onPress={() => setLanguage('en')}
                  >
                    <Text style={styles.langText}>EN</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2.7 การกำหนดการแสดงสี (แสดงสถานะโครงสร้างสีปัจจุบัน) */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>2.7 สีธีมของระบบแอป</Text>
                  <Text style={styles.settingSub}>ล็อกสถานะสีแบบมาตรฐานสมดุล</Text>
                </View>
                <View style={styles.colorIndicatorRow}>
                  <View style={[styles.colorDot, { backgroundColor: colors.buddhistText }]} />
                  <View style={[styles.colorDot, { backgroundColor: colors.holidayText }]} />
                </View>
              </View>

              {/* 2.8 ปุ่มเลือกแบบแสดงรูปแบบ 3D */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>2.8 รูปแบบหน้าตาแอป 3D นูนล้ำ</Text>
                  <Text style={styles.settingSub}>เปิดเอฟเฟกต์ 3D Neumorphism</Text>
                </View>
                <Switch value={is3DMode} onValueChange={setIs3DMode} />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowSettings(false)}>
              <Text style={styles.closeModalText}>บันทึกและปิด</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const cellWidth = (width - 40) / 7;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 30,
  },
  settingsMiniButton: {
    position: 'absolute',
    right: 15,
    top: 40,
    zIndex: 10,
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  settingsMiniText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 5,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  weekdayRow: {
    flexDirection: 'row',
    backgroundColor: '#E1E8ED',
    borderRadius: 6,
    paddingVertical: 8,
    marginBottom: 8,
  },
  weekdayText: {
    width: cellWidth,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  gridContainer: {
    flexGrow: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: cellWidth - 4,
    height: 95,
    borderWidth: 1,
    borderColor: '#e1e4e6',
    borderRadius: 8,
    margin: 2,
    padding: 4,
    justifyContent: 'space-between',
  },
  dayCell3DActive: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    // เอฟเฟกต์แบบ 3D นูนขึ้นมาชัดเจน
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  dayCellSimpleActive: {
    borderColor: '#2C3E50',
    backgroundColor: '#eaf2f8',
    borderWidth: 2,
  },
  emptyCell: {
    backgroundColor: '#f9fafb',
    borderColor: 'transparent',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cellFooter: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    width: '100%',
  },
  buddhistWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 2,
  },
  buddhistIcon: {
    fontSize: 12,
    textAlign: 'center',
  },
  buddhistLabelText: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 1,
  },
  holidayText: {
    fontSize: 8,
    borderRadius: 2,
    paddingHorizontal: 2,
    textAlign: 'center',
    marginTop: 2,
    width: '100%',
  },
  // 3. สไตล์แถบแสดงรายละเอียดล้ำๆ ด้านล่างสุด
  detailGlassCard: {
    backgroundColor: '#1A252F',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detailCardTitle: {
    color: '#ECF0F1',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailCardContent: {
    color: '#BDC3C7',
    fontSize: 12,
    lineHeight: 18,
  },
  // สไตล์โมดอลป๊อปอัปการตั้งค่า
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2C3E50',
  },
  settingsScroll: {
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  settingSub: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 2,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    width: 70,
    textAlign: 'center',
    fontSize: 13,
    color: '#2C3E50',
    backgroundColor: '#f8f9fa',
  },
  divider: {
    height: 8,
    backgroundColor: '#f4f6f9',
    marginHorizontal: -20,
    marginVertical: 10,
  },
  langToggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    overflow: 'hidden',
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
  },
  langButtonActive: {
    backgroundColor: '#4A90E2',
  },
  langText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  colorIndicatorRow: {
    flexDirection: 'row',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 6,
  },
  closeModalButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
