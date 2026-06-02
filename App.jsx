import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Modal,
  SafeAreaView
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

  // คำนวณวันในเดือน
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  // ใส่ช่องว่างสำหรับวันก่อนเริ่มเดือน
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({ id: `empty-${i}`, date: null });
  }
  // ใส่จำนวณวันจริง
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

  return (
    <SafeAreaView style={styles.container}>
      {/* ส่วนหัวปฏิทิน */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Text style={styles.navButton}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{months[month]} {year + 543}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Text style={styles.navButton}>{">"}</Text>
        </TouchableOpacity>
      </View>

      {/* ชื่อวันในสัปดาห์ */}
      <View style={styles.weekDaysContainer}>
        {daysOfWeek.map((day, index) => (
          <Text key={index} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      {/* ตารางปฏิทิน */}
      <FlatList
        data={calendarCells}
        numColumns={7}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const hasEvent = item.dateStr && events[item.dateStr] && events[item.dateStr].length > 0;
          return (
            <TouchableOpacity 
              style={[styles.cell, item.dateStr === selectedDate && styles.selectedCell]}
              onPress={() => handleSelectDate(item.dateStr)}
            >
              <Text style={[styles.cellText, !item.date && styles.emptyCellText]}>
                {item.date || ""}
              </Text>
              {hasEvent && <View style={styles.eventDot} />}
            </TouchableOpacity>
          );
        }}
      />

      {/* รายการกิจกรรมของวันที่เลือกใต้ปฏิทิน */}
      {selectedDate ? (
        <View style={styles.eventListContainer}>
          <Text style={styles.eventListTitle}>กิจกรรมวันที่ {selectedDate}:</Text>
          {events[selectedDate] && events[selectedDate].length > 0 ? (
            events[selectedDate].map((ev, index) => (
              <Text key={index} style={styles.eventItem}>• {ev}</Text>
            ))
          ) : (
            <Text style={styles.noEventText}>ไม่มีกิจกรรมในวันนี้</Text>
          )}
        </View>
      ) : null}

      {/* ป๊อปอัพเพิ่มกิจกรรม */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มกิจกรรมสำหรับ {selectedDate}</Text>
            <TextInput 
              style={styles.input} 
              placeholder="พิมพ์ชื่อกิจกรรมที่นี่..." 
              value={newEventText}
              onChangeText={setNewEventText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={addEvent}>
                <Text style={styles.btnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  navButton: { fontSize: 24, fontWeight: 'bold', color: '#007AFF', paddingHorizontal: 10 },
  weekDaysContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  weekDayText: { flex: 1, textAlign: 'center', fontWeight: '600', color: '#666' },
  cell: { flex: 1, height: 55, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', position: 'relative' },
  selectedCell: { backgroundColor: '#E3F2FD', borderRadius: 4 },
  cellText: { fontSize: 16, color: '#333' },
  emptyCellText: { color: '#ccc' },
  eventDot: { width: 6, height: 6, backgroundColor: '#FF3B30', borderRadius: 3, position: 'absolute', bottom: 5 },
  eventListContainer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', height: 200 },
  eventListTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  eventItem: { fontSize: 15, marginVertical: 4, color: '#444' },
  noEventText: { color: '#999', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowOpacity: 0.25 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 8, marginBottom: 20, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginLeft: 10 },
  btnCancel: { backgroundColor: '#efefef' },
  btnSave: { backgroundColor: '#007AFF' },
  btnText: { fontWeight: '600' }
});
