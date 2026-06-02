import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Modal,
  SafeAreaView,
  StatusBar
} from 'react-native';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventText, setNewEventText] = useState('');

  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  // 1. ระบบฐานข้อมูลวันสำคัญและวันพระ (สามารถมาเพิ่มวันอื่นๆ ในนี้ทีหลังได้ครับ)
  const holidayData = {
    // เดือน มกราคม (01)
    "01-01": { name: "วันขึ้นปีใหม่", isBuddhaDay: false },
    "01-16": { name: "วันครู", isBuddhaDay: false },
    // เดือน กุมภาพันธ์ (02)
    "02-12": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๒)", isBuddhaDay: true },
    "02-19": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๒)", isBuddhaDay: true },
    "02-27": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๓)", isBuddhaDay: true },
    // เดือน มีนาคม (03)
    "03-06": { name: "วันมาฆบูชา (วันพระใหญ่)", isBuddhaDay: true },
    "03-14": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๓)", isBuddhaDay: true },
    "03-21": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๓)", isBuddhaDay: true },
    "03-29": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๔)", isBuddhaDay: true },
    // เดือน เมษายน (04)
    "04-06": { name: "วันจักรี / วันพระใหญ่", isBuddhaDay: true },
    "04-13": { name: "วันสงกรานต์", isBuddhaDay: false },
    "04-14": { name: "วันสงกรานต์ / วันครอบครัว", isBuddhaDay: false },
    "04-15": { name: "วันสงกรานต์", isBuddhaDay: false },
    "04-21": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๔)", isBuddhaDay: true },
    "04-29": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๕)", isBuddhaDay: true },
    // เดือน พฤษภาคม (05)
    "05-01": { name: "วันแรงงานแห่งชาติ", isBuddhaDay: false },
    "05-04": { name: "วันฉัตรมงคล", isBuddhaDay: false },
    "05-06": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๕)", isBuddhaDay: true },
    "05-13": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๕)", isBuddhaDay: true },
    "05-22": { name: "วันวิสาขบูชา (วันพระใหญ่)", isBuddhaDay: true },
    "05-30": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๖)", isBuddhaDay: true },
    // เดือน มิถุนายน (06)
    "06-03": { name: "วันเฉลิมพระชนมพรรษาพระราชินี", isBuddhaDay: false },
    "06-11": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๖)", isBuddhaDay: true },
    "06-19": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๗)", isBuddhaDay: true },
    "06-26": { name: "วันพระ (ขึ้น ๑๕ ค่ำ เดือน ๗)", isBuddhaDay: true },
    // เดือน กรกฎาคม (07)
    "07-11": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๗)", isBuddhaDay: true },
    "07-19": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๘)", isBuddhaDay: true },
    "07-25": { name: "วันอาสาฬหบูชา (วันพระใหญ่)", isBuddhaDay: true },
    "07-26": { name: "วันเข้าพรรษา", isBuddhaDay: false },
    "07-28": { name: "วันเฉลิมพระชนมพรรษา ร.๑๐", isBuddhaDay: false },
    // เดือน สิงหาคม (08)
    "08-12": { name: "วันแม่แห่งชาติ", isBuddhaDay: false },
    // เดือน ตุลาคม (10)
    "10-13": { name: "วันคล้ายวันสวรรคต ร.๙", isBuddhaDay: false },
    "10-23": { name: "วันปิยมหาราช", isBuddhaDay: false },
    "10-24": { name: "วันออกพรรษา (วันพระใหญ่)", isBuddhaDay: true },
    // เดือน ธันวาคม (12)
    "12-05": { name: "วันพ่อแห่งชาติ", isBuddhaDay: false },
    "12-10": { name: "วันรัฐธรรมนูญ", isBuddhaDay: false },
    "12-31": { name: "วันสิ้นปี", isBuddhaDay: false },
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({ id: `empty-${i}`, date: null });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({ id: `date-${i}`, date: i, dateStr: dateString });
  }

  const changeMonth = (direction) => {
    const newDate = new Date(year, month + direction, 1);
    setCurrentDate(newDate);
  };

  const handleSelectDate = (dateStr) => {
    if (!dateStr) return;
    setSelectedDate(dateStr);
  };

  const openAddEventModal = () => {
    if (!selectedDate) return;
    setModalVisible(true);
  };

  const addEvent = () => {
    if (!newEventText.trim()) return;
    const updatedEvents = { ...events };
    if (!updatedEvents[selectedDate]) {
      updatedEvents[selectedDate] = [];
    }
    updatedEvents[selectedDate].push(newEventText);
    setEvents(updatedEvents);
    setNewEventText('');
    setModalVisible(false);
  };

  const toThaiNumber = (num) => {
    if (num === null || num === undefined) return "";
    const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
    return num.toString().split('').map(char => {
      const digit = parseInt(char, 10);
      return isNaN(digit) ? char : thaiDigits[digit];
    }).join('');
  };

  const getThaiDayLabel = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    const dayNum = parseInt(parts[2], 10);
    const monthNum = parseInt(parts[1], 10) - 1;
    const yearNum = parseInt(parts[0], 10) + 543;
    return `${toThaiNumber(dayNum)} ${months[monthNum]} ${toThaiNumber(yearNum)}`;
  };

  // 2. ฟังก์ชันตรวจสอบวันสำคัญและวันพระจากวันที่
  const getHolidayInfo = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    const monthDayKey = `${parts[1]}-${parts[2]}`; // ดึงเฉพาะ "MM-DD"
    return holidayData[monthDayKey] || null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* การ์ดปฏิทินหลัก */}
      <View style={styles.calendarCard}>
        {/* ส่วนหัวแสดงเดือน/ปี */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButtonContainer} onPress={() => changeMonth(-1)}>
            <Text style={styles.navButton}>{"‹"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{months[month]} {toThaiNumber(year + 543)}</Text>
          <TouchableOpacity style={styles.navButtonContainer} onPress={() => changeMonth(1)}>
            <Text style={styles.navButton}>{"›"}</Text>
          </TouchableOpacity>
        </View>

        {/* ชื่อวันในสัปดาห์ */}
        <View style={styles.weekDaysContainer}>
          {daysOfWeek.map((day, index) => (
            <Text key={index} style={[styles.weekDayText, index === 0 && {color: '#FF3B30'}, index === 6 && {color: '#007AFF'}]}>
              {day}
            </Text>
          ))}
        </View>

        {/* ตารางวันที่ */}
        <FlatList
          data={calendarCells}
          numColumns={7}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const hasEvent = item.dateStr && events[item.dateStr] && events[item.dateStr].length > 0;
            const isSelected = item.dateStr === selectedDate;
            const isToday = item.dateStr === new Date().toISOString().split('T')[0];
            
            // เช็คว่าเป็นวันพระหรือวันสำคัญไหม
            const holiday = getHolidayInfo(item.dateStr);
            const isBuddhaDay = holiday && holiday.isBuddhaDay;

            return (
              <TouchableOpacity 
                style={[
                  styles.cell, 
                  isSelected && styles.selectedCell,
                  isToday && !isSelected && styles.todayCell
                ]}
                onPress={() => handleSelectDate(item.dateStr)}
                disabled={!item.date}
              >
                {/* ถ้าเป็นวันพระ แสดงรูปพระ 🪷 หรือ 🙏 ข้างบนตัวเลข */}
                {isBuddhaDay && (
                  <Text style={[styles.buddhaIcon, isSelected && { color: '#FFF' }]}>🙏</Text>
                )}
                
                <Text style={[
                  styles.cellText, 
                  isSelected && styles.selectedCellText,
                  isToday && !isSelected && styles.todayCellText,
                  isBuddhaDay && !isSelected && { color: '#E6A23C', fontWeight: '700' }, // ไฮไลต์ตัวเลขวันพระเป็นสีทอง
                  !item.date && styles.emptyCellText
                ]}>
                  {item.date ? toThaiNumber(item.date) : ""}
                </Text>
                {hasEvent && <View style={[styles.eventDot, isSelected && styles.selectedEventDot]} />}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* บอร์ดแสดงรายละเอียดกิจกรรมและวันสำคัญด้านล่าง */}
      <View style={styles.bottomCard}>
        {selectedDate ? (
          <View style={styles.eventListContainer}>
            <View style={styles.bottomHeaderRow}>
              <Text style={styles.eventListTitle}>วันที่ {getThaiDayLabel(selectedDate)}</Text>
              
              {/* ปุ่มกดเพื่อเพิ่มกิจกรรมส่วนตัว */}
              <TouchableOpacity style={styles.addEventBtn} onPress={openAddEventModal}>
                <Text style={styles.addEventBtnText}>+ บันทึกงาน</Text>
              </TouchableOpacity>
            </View>

            {/* 3. ส่วนแสดงข้อมูลวันสำคัญที่ระบบตรวจเจอ */}
            {getHolidayInfo(selectedDate) && (
              <View style={[styles.holidayCard, getHolidayInfo(selectedDate).isBuddhaDay ? styles.buddhaCardBg : styles.normalHolidayCardBg]}>
                <Text style={styles.holidayEmoji}>
                  {getHolidayInfo(selectedDate).isBuddhaDay ? "🔴 วันพระใหญ่ / วันปฏิบัติธรรม" : "⭐ วันสำคัญ"}
                </Text>
                <Text style={styles.holidayNameText}>{getHolidayInfo(selectedDate).name}</Text>
              </View>
            )}

            {/* ส่วนแสดงกิจกรรมส่วนตัวที่ผู้ใช้พิมพ์บันทึกไว้ */}
            <Text style={styles.sectionSubTitle}>บันทึกกิจกรรมส่วนตัว:</Text>
            {events[selectedDate] && events[selectedDate].length > 0 ? (
              <FlatList
                data={events[selectedDate]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.eventItemCard}>
                    <View style={styles.eventIndicator} />
                    <Text style={styles.eventItemText}>{item}</Text>
                  </View>
                )}
              />
            ) : (
              <View style={styles.noEventContainer}>
                <Text style={styles.noEventText}>ไม่มีบันทึกกิจกรรมส่วนตัวในวันนี้</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noEventContainer}>
            <Text style={styles.noEventText}>เลือกวันที่บนปฏิทินเพื่อดูวันสำคัญหรือเพิ่มบันทึกงาน</Text>
          </View>
        )}
      </View>

      {/* หน้าต่างป๊อปอัพบันทึกกิจกรรม */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>บันทึกกิจกรรมใหม่</Text>
            <Text style={styles.modalSubtitle}>สำหรับวันที่ {getThaiDayLabel(selectedDate)}</Text>
            <TextInput 
              style={styles.input} 
              placeholder="กรอกรายละเอียดกิจกรรมที่นี่..." 
              placeholderTextColor="#999"
              value={newEventText}
              onChangeText={setNewEventText}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={addEvent}>
                <Text style={styles.btnSaveText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA' },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 5 },
  headerTitle: { fontSize: 19, fontWeight: '700', color: '#1A1C24' },
  navButtonContainer: { width: 40, height: 40, backgroundColor: '#F0F4F8', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  navButton: { fontSize: 24, fontWeight: '600', color: '#4A5568', marginTop: -4 },
  weekDaysContainer: { flexDirection: 'row', marginBottom: 12 },
  weekDayText: { flex: 1, textAlign: 'center', fontWeight: '600', color: '#718096', fontSize: 13 },
  
  // ช่องวันที่ + จัดตำแหน่งรูปพระ
  cell: { flex: 1, height: 48, justifyContent: 'center', alignItems: 'center', margin: 2, borderRadius: 12, position: 'relative' },
  cellText: { fontSize: 15, fontWeight: '600', color: '#2D3748', marginTop: 4 },
  buddhaIcon: { fontSize: 10, position: 'absolute', top: 2, color: '#E6A23C' },
  emptyCellText: { color: '#E2E8F0' },
  todayCell: { backgroundColor: '#EDF2F7' },
  todayCellText: { color: '#4A5568', fontWeight: '700' },
  selectedCell: { backgroundColor: '#007AFF' },
  selectedCellText: { color: '#FFFFFF', fontWeight: '700' },
  eventDot: { width: 5, height: 5, backgroundColor: '#FF3B30', borderRadius: 2.5, position: 'absolute', bottom: 2 },
  selectedEventDot: { backgroundColor: '#FFFFFF' },
  
  // บอร์ดด้านล่าง
  bottomCard: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 5 },
  eventListContainer: { flex: 1 },
  bottomHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  eventListTitle: { fontSize: 17, fontWeight: '700', color: '#1A1C24' },
  sectionSubTitle: { fontSize: 14, fontWeight: '700', color: '#718096', marginTop: 14, marginBottom: 8 },
  
  // ปุ่มเพิ่มงานแบบใหม่แยกสัดส่วน
  addEventBtn: { backgroundColor: '#E8F2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addEventBtnText: { color: '#007AFF', fontWeight: '700', fontSize: 13 },
  
  // การ์ดแสดงวันสำคัญ/วันพระ
  holidayCard: { padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1 },
  buddhaCardBg: { backgroundColor: '#FFF9E6', borderColor: '#FFE699' },
  normalHolidayCardBg: { backgroundColor: '#F0F9EB', borderColor: '#E1F3D8' },
  holidayEmoji: { fontSize: 12, fontWeight: '700', color: '#E6A23C', marginBottom: 2 },
  holidayNameText: { fontSize: 15, fontWeight: '700', color: '#2C3E50' },
  
  eventItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#EDF2F7' },
  eventIndicator: { width: 4, height: 20, backgroundColor: '#007AFF', borderRadius: 2, marginRight: 12 },
  eventItemText: { fontSize: 15, color: '#4A5568', fontWeight: '500' },
  noEventContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 15 },
  noEventText: { color: '#A0AEC0', fontSize: 14, textAlign: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 28, 36, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '88%', backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1C24', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#718096', marginBottom: 20 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#2D3748', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, marginLeft: 12, minWidth: 90, alignItems: 'center' },
  btnCancel: { backgroundColor: '#F1F5F9' },
  btnCancelText: { color: '#64748B', fontWeight: '600', fontSize: 15 },
  btnSave: { backgroundColor: '#007AFF' },
  btnSaveText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 }
});
