import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';

// 📅 ฐานข้อมูลวันหยุดราชการไทย พ.ศ. 2569
const THAI_HOLIDAYS = {
  '2026-01-01': 'วันขึ้นปีใหม่', '2026-02-24': 'วันศิลปินแห่งชาติ', '2026-03-03': 'วันมาฆบูชา',
  '2026-04-06': 'วันจักรี', '2026-04-13': 'วันสงกรานต์', '2026-04-14': 'วันสงกรานต์', '2026-04-15': 'วันสงกรานต์',
  '2026-05-01': 'วันแรงงานแห่งชาติ', '2026-05-04': 'วันฉัตรมงคล', '2026-05-13': 'วันพืชมงคล', '2026-05-31': 'วันวิสาขบูชา',
  '2026-06-03': 'วันเฉลิมฯ พระราชินี', '2026-07-28': 'วันเฉลิมฯ ร.10', '2026-07-29': 'วันอาสาฬหบูชา', '2026-07-30': 'วันเข้าพรรษา',
  '2026-08-12': 'วันแม่แห่งชาติ', '2026-10-13': 'วันคล้ายวันสวรรคต ร.9', '2026-10-23': 'วันปิยมหาราช',
  '2026-12-05': 'วันพ่อแห่งชาติ', '2026-12-10': 'วันรัฐธรรมนูญ', '2026-12-31': 'วันสิ้นปี'
};

// 🟡 ฐานข้อมูลวันพระหลวง ปี พ.ศ. 2569 (ตรงตามหน้าจอปฏิทินเดิมของเฮียเป๊ะๆ)
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
const WEEKDAYS_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export default function App() {
  const [currentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // โชว์เดือนมิถุนายนเป็นค่าเริ่มต้น

  const changeMonth = (direction) => {
    let nextMonth = currentMonth + direction;
    if (nextMonth > 11) {
      setCurrentMonth(0);
    } else if (nextMonth < 0) {
      setCurrentMonth(11);
    } else {
      setCurrentMonth(nextMonth);
    }
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

      cells.push(
        <TouchableOpacity key={`day-${day}`} style={styles.dayCell} activeOpacity={0.7}>
          {/* ตัวเลขวันที่อยู่ส่วนบนปกติ */}
          <Text style={styles.dayNumber}>{day}</Text>
          
          {/* ส่วนล่างของช่อง: ฟังก์ชันข้อมูลแสดงวันพระและวันหยุด (เปลี่ยนเป็นอิโมจิดอกบัวเรียบร้อย) */}
          <View style={styles.cellFooter}>
            {buddhistDetails && (
              <View style={styles.buddhistWrapper}>
                {/* 🪷 คืนค่ารูปดอกบัวตามเดิมของเฮียเป๊ะๆ ไม่พึ่งพิงโมดูลภายนอก */}
                <Text style={styles.buddhistIcon}>🪷</Text>
                <Text style={styles.buddhistLabelText}>วันพระ</Text>
              </View>
            )}

            {holidayName && (
              <Text style={styles.holidayText} numberOfLines={1}>
                {holidayName}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton} onPress={() => changeMonth(-1)}>
            <Text style={styles.navButtonText}>◀ ก่อนหน้า</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTH_NAMES_TH[currentMonth]} {currentYear + 543}
          </Text>
          <TouchableOpacity style={styles.navButton} onPress={() => changeMonth(1)}>
            <Text style={styles.navButtonText}>ถัดไป ▶</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAYS_TH.map((day, index) => (
            <Text key={index} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.gridContainer}>
          <View style={styles.calendarGrid}>
            {renderCalendarCells()}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const cellWidth = (width - 40) / 7;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  container: {
    flex: 1,
    padding: 10,
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
    color: '#2C3E50',
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
    color: '#2C3E50',
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
    height: 100, // ความสูงเดิมของกล่อง
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e4e6',
    borderRadius: 6,
    margin: 2,
    padding: 4,
    justifyContent: 'space-between',
  },
  emptyCell: {
    backgroundColor: '#f9fafb',
    borderColor: 'transparent',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
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
    color: '#e67e22',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 1,
  },
  holidayText: {
    fontSize: 8,
    color: '#e74c3c',
    backgroundColor: '#fde8e8',
    borderRadius: 2,
    paddingHorizontal: 2,
    textAlign: 'center',
    marginTop: 2,
    width: '100%',
  }
});

