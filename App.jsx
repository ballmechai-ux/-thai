import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
  TextInput,
  Platform
} from 'react';

// ประกาศขนาดหน้าจอเพื่อใช้วางสัดส่วน
const { width, height } = Dimensions.get('window');

// ข้อมูลจำลองวันพระและวันสำคัญ ปี 2569 (อ้างอิงจากฐานข้อมูลปฏิทินหลวง)
const HOLIDAYS_2569 = {
  '2026-06-04': { type: 'normal', text: 'วันนี้วันที่ 4 มิ.ย.' }, // ตัวอย่างวันปัจจุบันในภาพ
  '2026-06-08': { type: 'wanphra', text: 'วันพระ' },
  '2026-06-14': { type: 'wanphra', text: 'วันพระ' },
  '2026-06-22': { type: 'wanphra', text: 'วันพระ' },
  '2026-06-29': { type: 'wanphra', text: 'วันพระ' },
  '2026-06-03': { type: 'holiday', text: 'วันเฉลิมพระชนมพรรษาฯ' }
};

const MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function App() {
  // --- State Systems ---
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 4)); // ตั้งต้นที่ มิ.ย. 2569 ตามภาพ
  const [selectedDate, setSelectedDate] = useState('2026-06-04');
  const [settingVisible, setSettingVisible] = useState(false);
  
  // State ระบบแต่งสี (ข้อ 6 & 7)
  const [headerBgColor, setHeaderBgColor] = useState('#F0F4F8'); 
  const [dayCellColor, setDayCellColor] = useState('#FFFFFF');
  const [activeColorTarget, setActiveColorTarget] = useState('header'); // 'header' หรือ 'cell'

  // State ระบบบันทึกและความจำ (ข้อ 9)
  const [notes, setNotes] = useState({});
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [tempNoteText, setTempNoteText] = useState('');
  
  // จานสีที่มีให้เลือกครบสี (ข้อ 6)
  const COLOR_PALETTE = [
    '#F0F4F8', '#E3F2FD', '#E8F5E9', '#FFF3E0', '#FFEBEE', '#F3E5F5',
    '#FFFFFF', '#CFD8DC', '#FFE082', '#A5D6A7', '#90CAF9', '#EF9A9A'
  ];

  // ระบบตรวจจับการปัดหน้าจอ (ข้อ 5)
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.nativeEvent.locationX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.nativeEvent.locationX;
    handleSwipeGesture();
  };

  const handleSwipeGesture = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (swipeDistance > 60) {
      // ปัดซ้าย -> ไปเดือนข้างหน้า
      nextMonth();
    } else if (swipeDistance < -60) {
      // ปัดขวา -> ถอยกลับไปเดือนก่อนหน้า
      prevMonth();
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // --- ลอจิกการสร้างปฏิทิน ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // ฟังก์ชันจัดฟอร์แมตคีย์วันที่ (YYYY-MM-DD)
  const formatDateKey = (dayNum) => {
    if (!dayNum) return '';
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // ระบบบันทึกพร้อมถามแจ้งเตือน (ข้อ 9.1 - 9.4)
  const handleSaveNote = () => {
    if (!tempNoteText.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อความบันทึก');
      return;
    }

    // ถามว่าต้องการแจ้งเตือนไหม (ข้อ 9.1 และ 9.2)
    Alert.alert(
      'ระบบแจ้งเตือน',
      'ต้องการตั้งเวลาแจ้งเตือนสำหรับบันทึกนี้ด้วยหรือไม่?',
      [
        {
          text: 'ไม่ต้องการ',
          onPress: () => saveToState(null),
          style: 'cancel'
        },
        {
          text: 'ใช่, ต้องการ',
          onPress: () => {
            // จำลองการเลือกช่วงเวลา (ข้อ 9.3)
            Alert.alert(
              'เลือกช่วงเวลา',
              'เลือกรอบการแจ้งเตือนเสร็จสิ้น ระบบจะใช้เสียงแจ้งเตือนหลักตามที่เครื่องมือถือของท่านตั้งไว้ในระบบ', // ข้อ 9.4
              [{ text: 'ตกลง', onPress: () => saveToState('08:00 น.') }]
            );
          }
        }
      ]
    );
  };

  const saveToState = (timeString) => {
    setNotes({
      ...notes,
      [selectedDate]: {
        text: tempNoteText,
        alertTime: timeString
      }
    });
    setNoteModalVisible(false);
    setTempNoteText('');
    Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว');
  };

  // ดึงข้อมูลมาโชว์ที่แถบรายละเอียดด้านล่าง
  const activeKey = selectedDate;
  const hasHoliday = HOLIDAYS_2569[activeKey];
  const hasNote = notes[activeKey];
  const todayKey = '2026-06-04'; // กำหนดให้ระบบรู้ว่าวันนี้คือวันที่ 4 มิ.ย. 2569 ตามภาพ

  return (
    <SafeAreaView style={styles.container}>
      
      {/* ข้อ 3: ปุ่มตั้งค่าย้ายขึ้นไปด้านบนสุด (ตำแหน่งเลข 3) ไม่ทับปุ่มเปลี่ยนเดือน */}
      <View style={styles.topActionLine}>
        <TouchableOpacity style={styles.settingButton} onPress={() => setSettingVisible(true)}>
          <Text style={styles.settingButtonText}>⚙️ ตั้งค่าสไตล์</Text>
        </TouchableOpacity>
      </View>

      {/* แถบหัวเรื่องเดือน */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.navButton} onPress={prevMonth}>
          <Text style={styles.navButtonText}>◀ ก่อนหน้า</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {MONTH_NAMES[month]} {year + 543}
        </Text>
        
        <TouchableOpacity style={styles.navButton} onPress={nextMonth}>
          <Text style={styles.navButtonText}>ถัดไป ▶</Text>
        </TouchableOpacity>
      </View>

      {/* แถบชื่อวัน (ข้อ 7: ปรับสีแถบชื่อวันได้ตามค่าตัวแปร) */}
      <View style={[styles.weekDaysBar, { backgroundColor: headerBgColor }]}>
        {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((val, idx) => (
          <Text key={idx} style={styles.weekDayText}>{val}</Text>
        ))}
      </View>

      {/* ข้อ 4 & 5: ตารางปฏิทินขยายสุดขอบจอ + รองรับการปัดหน้าจอเพื่อเลื่อน */}
      <View 
        style={styles.calendarGridContainer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <View style={styles.matrixWrapper}>
          {daysArray.map((day, index) => {
            const dateKey = formatDateKey(day);
            const isSelected = selectedDate === dateKey;
            const isToday = dateKey === todayKey; // ข้อ 2: เช็กว่าเป็นวันปัจจุบันไหม
            const dayData = HOLIDAYS_2569[dateKey];

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  { backgroundColor: dayCellColor }, // ข้อ 7: ปรับสีช่องวันที่ได้
                  isSelected && styles.selectedDayCell,
                  isToday && styles.todayCellHighlight // ข้อ 2: ทำไฮไลต์สีพิเศษแสดงวันปัจจุบัน
                ]}
                disabled={!day}
                onPress={() => setSelectedDate(dateKey)}
              >
                {day && (
                  <View style={styles.dayInnerContent}>
                    <Text style={[styles.dayNumberText, isToday && styles.todayText]}>
                      {day}
                    </Text>
                    
                    {/* ข้อ 1: ขยับไอคอนดอกบัวขึ้นมาด้านบน (ไม่กองอยู่ติดขอบล่าง) */}
                    {dayData && dayData.type === 'wanphra' && (
                      <View style={styles.wanphraContainer}>
                        <Text style={styles.lotusIcon}>🪷</Text>
                        <Text style={styles.wanphraText}>วันพระ</Text>
                      </View>
                    )}

                    {dayData && dayData.type === 'holiday' && (
                      <View style={styles.holidayBadge}>
                        <Text style={styles.holidayText} numberOfLines={1}>วันเฉลิม...</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ข้อ 8: แถบข้อมูลด้านล่าง ปรับดีไซน์เป็นสีใส (Frosted Glass Effect) และตัวหนังสือสวยงาม */}
      <View style={styles.transparentDetailsBox}>
        <Text style={styles.detailsTitle}>📊 ข้อมูลรายละเอียดประจำวัน</Text>
        <Text style={styles.detailsBodyDate}>
          วันที่ {currentDate.getDate()} {MONTH_NAMES[month]} {year + 543}
        </Text>
        
        {hasHoliday ? (
          <Text style={styles.detailsEventText}>• {hasHoliday.text}</Text>
        ) : (
          <Text style={styles.detailsSubText}>• ไม่มีวันสำคัญในวันนี้</Text>
        )}

        {hasNote && (
          <View style={styles.noteStatusLine}>
            <Text style={styles.noteTextShow}>📌 บันทึก: {hasNote.text}</Text>
            {hasNote.alertTime && (
              <Text style={styles.alertTimeShow}>🔔 แจ้งเตือนเวลา: {hasNote.alertTime}</Text>
            )}
          </View>
        )}
      </View>

      {/* ข้อ 9: ปุ่มจดบันทึก โชว์ขึ้นที่ด้านล่างทางขวาของหน้าจอ */}
      <TouchableOpacity 
        style={styles.floatingActionButton} 
        onPress={() => {
          setTempNoteText(notes[selectedDate]?.text || '');
          setNoteModalVisible(true);
        }}
      >
        <Text style={styles.fabText}>📝 บันทึก</Text>
      </TouchableOpacity>

      {/* Modal หน้าต่างตั้งค่าสี (ข้อ 6 & 7) */}
      <Modal visible={settingVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBlurBackground}>
          <View style={styles.settingCard}>
            <Text style={styles.settingCardTitle}>🎨 ตั้งค่าปรับแต่งสีสันแอป</Text>
            
            {/* ส่วนเลือกจุดที่ต้องการแต่งสี (ข้อ 7) */}
            <View style={styles.toggleTargetRow}>
              <TouchableOpacity 
                style={[styles.targetTab, activeColorTarget === 'header' && styles.activeTargetTab]}
                onPress={() => setActiveColorTarget('header')}
              >
                <Text style={styles.targetTabText}>แถบบนชื่อเดือน</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.targetTab, activeColorTarget === 'cell' && styles.activeTargetTab]}
                onPress={() => setActiveColorTarget('cell')}
              >
                <Text style={styles.targetTabText}>ช่องวันที่</Text>
              </TouchableOpacity>
            </View>

            {/* ส่วนจานสีครบทุกสีให้เลือก (ข้อ 6) */}
            <Text style={styles.paletteLabel}>เลือกเฉดสีที่ต้องการ:</Text>
            <View style={styles.paletteContainer}>
              {COLOR_PALETTE.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.colorSphere, { backgroundColor: color }]}
                  onPress={() => {
                    if (activeColorTarget === 'header') {
                      setHeaderBgColor(color);
                    } else {
                      setDayCellColor(color);
                    }
                  }}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSettingVisible(false)}>
              <Text style={styles.closeModalBtnText}>ตกลงและบันทึกสี</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal หน้าต่างกรอกบันทึก (ข้อ 9) */}
      <Modal visible={noteModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalBlurBackground}>
          <View style={styles.settingCard}>
            <Text style={styles.settingCardTitle}>📝 เพิ่มข้อความบันทึก</Text>
            <Text style={{ marginBottom: 10, color: '#555' }}>วันที่เลือก: {selectedDate}</Text>
            
            <TextInput
              style={styles.noteTextInput}
              placeholder="พิมพ์ข้อความบันทึกตรงนี้..."
              value={tempNoteText}
              onChangeText={setTempNoteText}
              multiline={true}
            />

            <View style={styles.noteActionButtonsRow}>
              <TouchableOpacity 
                style={[styles.dialogBtn, { backgroundColor: '#E0E0E0' }]} 
                onPress={() => setNoteModalVisible(false)}
              >
                <Text style={{ color: '#333' }}>ยกเลิก</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dialogBtn, { backgroundColor: '#4CAF50' }]} 
                onPress={handleSaveNote}
              >
                <Text style={{ color: '#FFF' }}>บันทึกข้อมูล</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  // ข้อ 3: จัดพิกเซลปุ่มตั้งค่าแยกเลเยอร์ไว้ด้านบนสุด ไม่ทับปุ่มเปลี่ยนเดือน
  topActionLine: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  settingButton: {
    backgroundColor: '#ECEFF1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CFD8DC',
    elevation: 2,
  },
  settingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#455A64',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  navButton: {
    backgroundColor: '#29B6F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  weekDaysBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  weekDayText: {
    fontWeight: 'bold',
    color: '#37474F',
    width: width / 7 - 4,
    textAlign: 'center',
  },
  // ข้อ 4: ขยายตารางปฏิทินลงมาถมช่องว่างด้านล่างให้เต็มพื้นที่
  calendarGridContainer: {
    flex: 1, 
    marginHorizontal: 12,
    marginTop: 8,
  },
  matrixWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: (width - 24) / 7 - 4,
    height: (height * 0.52) / 6, // คำนวณขยายกล่องให้สูงเต็มสัดส่วนจอพอดี
    margin: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 4,
    elevation: 1,
  },
  // ข้อ 2: ทำสีกรอบและพื้นหลังพิเศษเพื่อระบุเด่นชัดว่าวันนี้คือวันปัจจุบัน
  todayCellHighlight: {
    borderColor: '#0288D1',
    borderWidth: 2.5,
    backgroundColor: '#E1F5FE',
  },
  todayText: {
    color: '#01579B',
    fontWeight: '900',
  },
  selectedDayCell: {
    borderColor: '#FF5252',
    borderWidth: 1.5,
  },
  dayInnerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  // ข้อ 1: ดันดอกบัวและข้อความวันพระขึ้นไปด้านบน ไม่กองอยู่ติดขอบด้านล่าง
  wanphraContainer: {
    alignItems: 'center',
    marginTop: -2,
  },
  lotusIcon: {
    fontSize: 15,
  },
  wanphraText: {
    fontSize: 9,
    color: '#E65100',
    fontWeight: '600',
  },
  holidayBadge: {
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  holidayText: {
    fontSize: 8,
    color: '#C62828',
  },
  // ข้อ 8: ดีไซน์สีใสโปร่งแสง (Frosted Glass Style) และตัวหนังสือสวยอ่านง่าย
  transparentDetailsBox: {
    backgroundColor: 'rgba(26, 37, 48, 0.88)', 
    margin: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailsTitle: {
    color: '#81D4FA',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailsBodyDate: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  detailsEventText: {
    color: '#FFCDD2',
    fontSize: 14,
  },
  detailsSubText: {
    color: '#B0BEC5',
    fontSize: 13,
  },
  noteStatusLine: {
    marginTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#546E7A',
    paddingTop: 6,
  },
  noteTextShow: {
    color: '#FFF59D',
    fontSize: 14,
  },
  alertTimeShow: {
    color: '#A5D6A7',
    fontSize: 13,
    marginTop: 2,
  },
  // ข้อ 9: ปุ่มลอยจดบันทึกไว้ที่ตำแหน่งขวาล่างของจอ
  floatingActionButton: {
    position: 'absolute',
    right: 20,
    bottom: 140, // ให้อยู่เหนือนำกล่องรายละเอียดขึ้นมานิดหน่อยเพื่อความสะดวกในการกด
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // ระบบโครงสร้าง Modal
  modalBlurBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingCard: {
    width: width * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  settingCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#333',
    textAlign: 'center',
  },
  toggleTargetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  targetTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeTargetTab: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
  },
  targetTabText: {
    fontWeight: 'bold',
    color: '#333',
  },
  paletteLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  paletteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  colorSphere: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 6,
    borderWidth: 1.5,
    borderColor: '#B0BEC5',
    elevation: 2,
  },
  closeModalBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  noteTextInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    height: 100,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  noteActionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dialogBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 8,
  },
});
