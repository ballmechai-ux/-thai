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

  // ฐานข้อมูลวันสำคัญ วันพระ และระบุวันหยุด (เพิ่ม shortName สำหรับเขียนลงบนช่องวันที่)
  const holidayData = {
    // มกราคม
    "01-01": { name: "วันขึ้นปีใหม่", shortName: "ปีใหม่", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "01-16": { name: "วันครู", shortName: "วันครู", isBuddhaDay: false, isGovernmentHoliday: false, isBankHoliday: false },
    // กุมภาพันธ์
    "02-12": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๒)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "02-19": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๒)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "02-27": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๓)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    // มีนาคม
    "03-06": { name: "วันมาฆบูชา", shortName: "มาฆบูชา", isBuddhaDay: true, isGovernmentHoliday: true, isBankHoliday: true },
    "03-14": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๓)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "03-21": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๓)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "03-29": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๔)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    // เมษายน
    "04-06": { name: "วันจักรี", shortName: "วันจักรี", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "04-13": { name: "วันสงกรานต์", shortName: "สงกรานต์", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "04-14": { name: "วันสงกรานต์ / วันครอบครัว", shortName: "สงกรานต์", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "04-15": { name: "วันสงกรานต์", shortName: "สงกรานต์", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "04-21": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๔)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "04-29": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๕)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    // พฤษภาคม
    "05-01": { name: "วันแรงงานแห่งชาติ", shortName: "วันแรงงาน", isBuddhaDay: false, isGovernmentHoliday: false, isBankHoliday: true },
    "05-04": { name: "วันฉัตรมงคล", shortName: "ฉัตรมงคล", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "05-06": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๕)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "05-13": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๕)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "05-22": { name: "วันวิสาขบูชา", shortName: "วิสาขบูชา", isBuddhaDay: true, isGovernmentHoliday: true, isBankHoliday: true },
    "05-30": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๖)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    // มิถุนายน
    "06-03": { name: "วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าฯ พระบรมราชินี", shortName: "ควีน ร.๑๐", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "06-11": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๖)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "06-19": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๗)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "06-26": { name: "วันพระ (ขึ้น ๑๕ ค่ำ เดือน ๗)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    // กรกฎาคม
    "07-11": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๗)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "07-19": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๘)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "07-25": { name: "วันอาสาฬหบูชา", shortName: "อาสาฬหฯ", isBuddhaDay: true, isGovernmentHoliday: true, isBankHoliday: true },
    "07-26": { name: "วันเข้าพรรษา", shortName: "เข้าพรรษา", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: false },
    "07-28": { name: "วันเฉลิมพระชนมพรรษา ร.๑๐", shortName: "วัน ร.๑๐", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    // สิงหาคม
    "08-12": { name: "วันแม่แห่งชาติ", shortName: "วันแม่", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    // ตุลาคม
    "10-13": { name: "วันคล้ายวันสวรรคต ร.๙", shortName: "วัน ร.๙", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "10-23": { name: "วันปิยมหาราช", shortName: "ปิยมหาราช", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "10-24": { name: "วันออกพรรษา", shortName: "ออกพรรษา", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    // ธันวาคม
    "12-05": { name: "วันพ่อแห่งชาติ", shortName: "วันพ่อ", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "12-10": { name: "วันรัฐธรรมนูญ", shortName: "รัฐธรรมนูญ", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "12-31": { name: "วันสิ้นปี", shortName: "วันสิ้นปี", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
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

  const getHolidayInfo = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    const monthDayKey = `${parts[1]}-${parts[2]}`;
    return holidayData[monthDayKey] || null;
  };

  const getHolidayTypeLabel = (holiday) => {
    if (!holiday) return "";
    if (holiday.isGovernmentHoliday && holiday.isBankHoliday) {
      return "🔴 วันหยุดราชการ และ วันหยุดธนาคาร";
    }
    if (holiday.isGovernmentHoliday) {
      return "🏛️ วันหยุดราชการ (ธนาคารเปิดทำการ)";
    }
    if (holiday.isBankHoliday) {
      return "💵 วันหยุดธนาคาร (ราชการเปิดทำการ)";
    }
    if (holiday.isBuddhaDay) {
      return "🪷 วันพระ / วันปฏิบัติธรรม";
    }
    return "⭐ วันสำคัญ";
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
            
            const holiday = getHolidayInfo(item.dateStr);
            const isBuddhaDay = holiday && holiday.isBuddhaDay;
            const isPublicHoliday = holiday && (holiday.isGovernmentHoliday || holiday.isBankHoliday);
            const holidayLabel = holiday && holiday.shortName ? holiday.shortName : "";

            return (
              <TouchableOpacity 
                style={[
                  styles.cell, 
                  isSelected && styles.selectedCell,
                  isToday && !isSelected && styles.todayCell,
                  isPublicHoliday && !isSelected && styles.publicHolidayCell
                ]}
                onPress={() => handleSelectDate(item.dateStr)}
                disabled={!item.date}
              >
                {/* 1. เปลี่ยนจากรูปพระ 🙏 เป็น รูปดอกบัว 🪷 สีทอง */}
                {isBuddhaDay && (
                  <Text style={[styles.buddhaIcon, isSelected && { color: '#FFF' }]}>🪷</Text>
                )}
                
                <Text style={[
                  styles.cellText, 
                  isSelected && styles.selectedCellText,
                  isToday && !isSelected && styles.todayCellText,
                  isPublicHoliday && !isSelected && { color: '#FF3B30' }, 
                  isBuddhaDay && !isSelected && !isPublicHoliday && { color: '#E6A23C', fontWeight: '700' },
                  !item.date && styles.emptyCellText
                ]}>
                  {item.date ? toThaiNumber(item.date) : ""}
                </Text>

                {/* 2. เขียนชื่อวันหยุดย่อๆ ลงบนช่องวันที่ใต้ตัวเลข */}
                {item.date && holidayLabel !== "" && (
                  <Text 
                    numberOfLines={1} 
                    ellipsizeMode="tail" 
                    style={[styles.holidayCellLabel, isSelected && { color: '#FFF' }]}
                  >
                    {holidayLabel}
                  </Text>
                )}

                {hasEvent && <View style={[styles.eventDot, isSelected && styles.selectedEventDot]} />}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* บอร์ดแสดงรายละเอียดด้านล่าง */}
      <View style={styles.bottomCard}>
        {selectedDate ? (
          <View style={styles.eventListContainer}>
            <View style={styles.bottomHeaderRow}>
              <Text style={styles.eventListTitle}>วันที่ {getThaiDayLabel(selectedDate)}</Text>
              <TouchableOpacity style={styles.addEventBtn} onPress={openAddEventModal}>
                <Text style={styles.addEventBtnText}>+ บันทึกงาน</Text>
              </TouchableOpacity>
            </View>

            {/* ส่วนแสดงข้อมูลวันสำคัญ/วันหยุด */}
            {getHolidayInfo(selectedDate) && (
              <View style={[
                styles.holidayCard, 
                getHolidayInfo(selectedDate).isGovernmentHoliday || getHolidayInfo(selectedDate).isBankHoliday
                  ? styles.redHolidayCardBg 
                  : getHolidayInfo(selectedDate).isBuddhaDay ? styles.buddhaCardBg : styles.normalHolidayCardBg
              ]}>
                <Text style={[
                  styles.holidayTypeLabel,
                  (getHolidayInfo(selectedDate).isGovernmentHoliday || getHolidayInfo(selectedDate).isBankHoliday) && { color: '#D90429' },
                  getHolidayInfo(selectedDate).isBuddhaDay && !getHolidayInfo(selectedDate).isGovernmentHoliday && { color: '#E6A23C' }
                ]}>
                  {getHolidayTypeLabel(getHolidayInfo(selectedDate))}
                </Text>
                <Text style={styles.holidayNameText}>{getHolidayInfo(selectedDate).name}</Text>
              </View>
            )}

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
  calendarCard: { backgroundColor: '#FFFFFF', borderRadius: 24, margin: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 5 },
  headerTitle: { fontSize: 19, fontWeight: '700', color: '#1A1C24' },
  navButtonContainer: { width: 40, height: 40, backgroundColor: '#F0F4F8', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  navButton: { fontSize: 24, fontWeight: '600', color: '#4A5568', marginTop: -4 },
  weekDaysContainer: { flexDirection: 'row', marginBottom: 12 },
  weekDayText: { flex: 1, textAlign: 'center', fontWeight: '600', color: '#718096', fontSize: 13 },
  
  // ปรับขนาดช่องวันที่ให้สูงขึ้นเล็กน้อย (จาก 48 เป็น 52) เพื่อรองรับตัวอักษรชื่อวันหยุดย่อด้านล่าง
  cell: { flex: 1, height: 52, justifyContent: 'center', alignItems: 'center', margin: 2, borderRadius: 12, position: 'relative text' },
  cellText: { fontSize: 14, fontWeight: '700', color: '#2D3748', marginTop: 2 },
  buddhaIcon: { fontSize: 11, position: 'absolute', top: 1, color: '#E6A23C' },
  
  // ตัวอักษรกำกับชื่อวันหยุดขนาดจิ๋วในช่องวันที่
  holidayCellLabel: { fontSize: 8, color: '#D90429', fontWeight: '600', marginTop: 1, textAlign: 'center', width: '95%' },
  
  emptyCellText: { color: '#E2E8F0' },
  todayCell: { backgroundColor: '#EDF2F7' },
  todayCellText: { color: '#4A5568', fontWeight: '700' },
  selectedCell: { backgroundColor: '#007AFF' },
  selectedCellText: { color: '#FFFFFF', fontWeight: '700' },
  publicHolidayCell: { backgroundColor: '#FFEBEB' },
  eventDot: { width: 4, height: 4, backgroundColor: '#FF3B30', borderRadius: 2, position: 'absolute', bottom: 1 },
  selectedEventDot: { backgroundColor: '#FFFFFF' },
  
  bottomCard: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 5 },
  eventListContainer: { flex: 1 },
  bottomHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  eventListTitle: { fontSize: 17, fontWeight: '700', color: '#1A1C24' },
  sectionSubTitle: { fontSize: 14, fontWeight: '700', color: '#718096', marginTop: 14, marginBottom: 8 },
  addEventBtn: { backgroundColor: '#E8F2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addEventBtnText: { color: '#007AFF', fontWeight: '700', fontSize: 13 },
  
  holidayCard: { padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1 },
  redHolidayCardBg: { backgroundColor: '#FFF0F2', borderColor: '#FFCCD5' },
  buddhaCardBg: { backgroundColor: '#FFF9E6', borderColor: '#FFE699' },
  normalHolidayCardBg: { backgroundColor: '#F0F9EB', borderColor: '#E1F3D8' },
  holidayTypeLabel: { fontSize: 12, fontWeight: '700', color: '#718096', marginBottom: 2 },
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
