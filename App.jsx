import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Switch,
  Alert
} from "react-native";
import { StatusBar } from "expo-status-bar";

// ---- DATA ----
const THAI_MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const THAI_DAYS_SHORT = ["อา","จ","อ","พ","พฤ","ศ","ส"];

const ALL_HOLIDAYS = {
  "2026-01-01": { name: "วันขึ้นปีใหม่" },
  "2026-03-03": { name: "วันมาฆบูชา" },
  "2026-04-06": { name: "วันจักรี" },
  "2026-04-13": { name: "วันสงกรานต์" },
  "2026-04-14": { name: "วันสงกรานต์" },
  "2026-04-15": { name: "วันสงกรานต์" },
  "2026-05-01": { name: "วันแรงงานแห่งชาติ" },
  "2026-05-05": { name: "วันฉัตรมงคล" },
  "2026-05-31": { name: "วันวิสาขบูชา" },
  "2026-06-03": { name: "วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี" },
  "2026-07-29": { name: "วันอาสาฬหบูชา" },
  "2026-07-30": { name: "วันเข้าพรรษา" },
  "2026-07-28": { name: "วันเฉลิมพระชนมพรรษา ร.10" },
  "2026-08-12": { name: "วันแม่แห่งชาติ" },
  "2026-10-13": { name: "วันนวมินทรมหาราช" },
  "2026-10-23": { name: "วันปิยมหาราช" },
  "2026-10-25": { name: "วันออกพรรษา" },
  "2026-12-05": { name: "วันพ่อแห่งชาติ" },
  "2026-12-10": { name: "วันรัฐธรรมนูญ" },
  "2026-12-31": { name: "วันสิ้นปี" },
};

const LUNAR_DATA = {
  "2026-06-01":{"phase":"แรม","day":1}, "2026-06-02":{"phase":"แรม","day":2}, "2026-06-03":{"phase":"แรม","day":3}
};

function getLunarMonthMap(year, month) {
  const map = {};
  const days = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const key = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    map[d] = LUNAR_DATA[key] || { phase: d % 2 === 0 ? "ขึ้น" : "แรม", day: (d % 15) + 1 };
  }
  return map;
}

function toDateKey(y, m, d) { return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }

export default function App() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [notes, setNotes] = useState({});
  const [holyDayAlert, setHolyDayAlert] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalNote, setModalNote] = useState("");
  const [dayDetail, setDayDetail] = useState(null);

  const lunarMap = getLunarMonthMap(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const openAddNote = (dateKey) => {
    setSelectedDate(dateKey);
    setModalNote("");
    setShowModal(true);
  };

  const saveNote = () => {
    if (!modalNote.trim()) return;
    const updated = { ...notes };
    if (!updated[selectedDate]) updated[selectedDate] = [];
    updated[selectedDate].push({ id: Date.now(), text: modalNote });
    setNotes(updated);
    setShowModal(false);
    setDayDetail(null);
    Alert.alert("สำเร็จ", "บันทึกกิจกรรมเรียบร้อยแล้ว");
  };

  const renderGrid = () => {
    const totalSlots = daysInMonth + firstDay;
    const gridItems = [];

    for (let i = 0; i < totalSlots; i++) {
      if (i < firstDay) {
        gridItems.push(<View key={`empty-${i}`} style={styles.dayCellEmpty} />);
      } else {
        const day = i - firstDay + 1;
        const dateKey = toDateKey(currentYear, currentMonth, day);
        const holiday = ALL_HOLIDAYS[dateKey];
        const lunar = lunarMap[day];
        const hasNote = notes[dateKey] && notes[dateKey].length > 0;

        gridItems.push(
          <TouchableOpacity 
            key={`day-${day}`} 
            style={styles.dayCell}
            onPress={() => setDayDetail(dateKey)}
          >
            <Text style={styles.dayText}>{day}</Text>
            {lunar && (
              <Text style={[styles.lunarText, { color: lunar.phase === "ขึ้น" ? "#93c5fd" : "#f9a8d4" }]}>
                {lunar.phase}{lunar.day}
              </Text>
            )}
            <View style={styles.dotContainer}>
              {holiday && <View style={[styles.dot, { backgroundColor: "#f87171" }]} />}
              {hasNote && <View style={[styles.dot, { backgroundColor: "#34d399" }]} />}
            </View>
          </TouchableOpacity>
        );
      }
    }
    return gridItems;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{THAI_MONTHS[currentMonth]} {currentYear + 543}</Text>
        <View style={styles.alertRow}>
          <Text style={styles.alertText}>แจ้งเตือนวันพระ</Text>
          <Switch value={holyDayAlert} onValueChange={setHolyDayAlert} />
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navButton} onPress={prevMonth}>
          <Text style={styles.navButtonText}>เดือนก่อนหน้า</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={nextMonth}>
          <Text style={styles.navButtonText}>เดือนถัดไป</Text>
        </TouchableOpacity>
      </View>

      {/* Weekdays Header */}
      <View style={styles.weekHeader}>
        {THAI_DAYS_SHORT.map((d, idx) => (
          <Text key={d} style={[styles.weekText, { color: idx === 0 ? "#f87171" : "#64748b" }]}>{d}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView contentContainerStyle={styles.gridContainer}>
        <View style={styles.grid}>
          {renderGrid()}
        </View>
      </ScrollView>

      {/* Day Detail Modal */}
      {dayDetail && (() => {
        const [dy, dm, dd] = dayDetail.split("-").map(Number);
        const holiday = ALL_HOLIDAYS[dayDetail];
        const dayNotes = notes[dayDetail] || [];

        return (
          <Modal visible={true} transparent={true} animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>วันที่ {dd} {THAI_MONTHS[dm-1]} {dy+543}</Text>
                {holiday && <Text style={styles.holidayText}>วันหยุด: {holiday.name}</Text>}
                
                <Text style={styles.sectionTitle}>📝 รายการกิจกรรม:</Text>
                {dayNotes.length === 0 ? (
                  <Text style={styles.noNoteText}>ไม่มีกิจกรรมในวันนี้</Text>
                ) : (
                  dayNotes.map(n => <Text key={n.id} style={styles.noteItem}>• {n.text}</Text>)
                )}

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setDayDetail(null)}>
                    <Text style={styles.btnText}>ปิด</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={() => openAddNote(dayDetail)}>
                    <Text style={styles.btnText}>+ เพิ่มโน้ต</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        );
      })()}

      {/* Add Note Modal */}
      <Modal visible={showModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มกิจกรรม</Text>
            <TextInput 
              style={styles.input}
              placeholder="กรอกรายละเอียดกิจกรรมที่นี่..."
              placeholderTextColor="#64748b"
              value={modalNote}
              onChangeText={setModalNote}
              multiline
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setShowModal(false)}>
                <Text style={styles.btnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={saveNote}>
                <Text style={styles.btnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingTop: 50 },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(99,102,241,0.2)", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  alertRow: { flexDirection: "row", alignItems: "center" },
  alertText: { color: "#64748b", marginRight: 8, fontSize: 12 },
  navRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 10 },
  navButton: { padding: 10, backgroundColor: "#1e1b4b", borderRadius: 8, borderWidth: 1, borderColor: "#4f46e5" },
  navButtonText: { color: "#fff", fontSize: 14 },
  weekHeader: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 10, marginTop: 10 },
  weekText: { fontSize: 14, fontWeight: "600", width: 40, textAlign: "center" },
  gridContainer: { paddingBottom: 40 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10 },
  dayCell: { width: "13.5%", height: 65, margin: "0.4%", backgroundColor: "rgba(30,27,75,0.4)", borderWidth: 1, borderColor: "rgba(99,102,241,0.1)", borderRadius: 8, padding: 4, justifyContent: "space-between" },
  dayCellEmpty: { width: "13.5%", height: 65, margin: "0.4%" },
  dayText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  lunarText: { fontSize: 9 },
  dotContainer: { flexDirection: "row", gap: 2 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: "#0f172a", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "rgba(99,102,241,0.3)" },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  holidayText: { color: "#f87171", fontSize: 14, marginBottom: 10 },
  sectionTitle: { color: "#fff", fontSize: 14, marginTop: 10, fontWeight: "600" },
  noNoteText: { color: "#64748b", fontSize: 13, marginVertical: 5 },
  noteItem: { color: "#cbd5e1", fontSize: 14, marginVertical: 2 },
  modalBtnRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  btnCancel: { backgroundColor: "none", borderWidth: 1, borderColor: "#64748b" },
  btnSave: { backgroundColor: "#4f46e5" },
  btnText: { color: "#fff", fontWeight: "600" },
  input: { width: "100%", backgroundColor: "#1e1b4b", borderColor: "#4f46e5", borderWidth: 1, borderRadius: 8, padding: 10, color: "#fff", height: 80, textAlignVertical: "top", marginTop: 10 }
});
