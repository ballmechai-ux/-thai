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
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [newEventText, setNewEventText] = useState('');
  
  // 🎨 สถานะระบบตั้งค่า
  const [bgColor, setBgColor] = useState('#F4F7FA'); // สีพื้นหลังแอป
  const [calendarSize, setCalendarSize] = useState('normal'); // ขนาดหน้าจอปฏิทิน
  const [selectedCellColor, setSelectedCellColor] = useState('#007AFF'); // สีไฮไลต์ช่องวันที่เลือก (เริ่มต้นเป็นสีน้ำเงิน)

  // รายการสีพื้นหลังแอป
  const themeColors = [
    { id: 'default', name: 'ฟ้ามินิมอล', value: '#F4F7FA' },
    { id: 'cream', name: 'ครีมละมุน', value: '#FDFBF7' },
    { id: 'green', name: 'เขียวสบายตา', value: '#F0F7F4' },
    { id: 'pink', name: 'ชมพูพาสเทล', value: '#FFF0F5' },
    { id: 'dark', name: 'เทาโมเดิร์น', value: '#E2E8F0' },
  ];

  // 🎯 รายการสีไฮไลต์ช่องวันที่ถูกเลือก
  const highlightColors = [
    { id: 'blue', name: 'น้ำเงินเด่นชัด', value: '#007AFF' },
    { id: 'orange', name: 'ส้มพลังงาน', value: '#FF9500' },
    { id: 'green', name: 'เขียวธรรมชาติ', value: '#34C759' },
    { id: 'red', name: 'แดงร้อนแรง', value: '#FF3B30' },
    { id: 'purple', name: 'ม่วงพรีเมียม', value: '#5856D6' },
  ];

  // 📐 ฟังก์ชันคำนวณขนาดอักษรและช่องตารางตามขนาดที่เลือก
  const getSizeStyle = (type) => {
    switch (calendarSize) {
      case 'large':
        if (type === 'cellHeight') return 68;
        if (type === 'dateText') return 18;
        if (type === 'holidayText') return 10;
        if (type === 'buddhaIcon') return 13;
        if (type === 'weekText') return 15;
        return 18;
      case 'xlarge':
        if (type === 'cellHeight') return 82;
        if (type === 'dateText') return 22;
        if (type === 'holidayText') return 12;
        if (type === 'buddhaIcon') return 16;
        if (type === 'weekText') return 17;
        return 22;
      default: // normal
        if (type === 'cellHeight') return 54;
        if (type === 'dateText') return 14;
        if (type === 'holidayText') return 8;
        if (type === 'buddhaIcon') return 10;
        if (type === 'weekText') return 12;
        return 14;
    }
  };

  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const holidayData = {
    "01-01": { name: "วันขึ้นปีใหม่", shortName: "ปีใหม่", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "01-16": { name: "วันครู", shortName: "วันครู", isBuddhaDay: false, isGovernmentHoliday: false, isBankHoliday: false },
    "02-12": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๒)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "02-19": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๒)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "02-27": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๓)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "03-06": { name: "วันมาฆบูชา", shortName: "มาฆบูชา", isBuddhaDay: true, isGovernmentHoliday: true, isBankHoliday: true },
    "03-14": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๓)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "03-21": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๓)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "03-29": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๔)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "04-06": { name: "วันจักรี", shortName: "วันจักรี", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "04-13": { name: "วันสงกรานต์", shortName: "สงกรานต์", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "04-14": { name: "วันสงกรานต์ / วันครอบครัว", shortName: "สงกรานต์", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "04-15": { name: "วันสงกรานต์", shortName: "สงกรานต์", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "04-21": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๔)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "04-29": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๕)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "05-01": { name: "วันแรงงานแห่งชาติ", shortName: "วันแรงงาน", isBuddhaDay: false, isGovernmentHoliday: false, isBankHoliday: true },
    "05-04": { name: "วันฉัตรมงคล", shortName: "ฉัตรมงคล", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "05-06": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๕)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "05-13": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๕)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "05-22": { name: "วันวิสาขบูชา", shortName: "วิสาขบูชา", isBuddhaDay: true, isGovernmentHoliday: true, isBankHoliday: true },
    "05-30": { name: "วันพระ (แรม ๘ ค่ำ เดือน ๖)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "06-03": { name: "วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าฯ พระบรมราชินี", shortName: "ควีน ร.๑๐", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "06-11": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๖)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "06-19": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๗)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "06-26": { name: "วันพระ (ขึ้น ๑๕ ค่ำ เดือน ๗)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "07-11": { name: "วันพระ (แรม ๑๕ ค่ำ เดือน ๗)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "07-19": { name: "วันพระ (ขึ้น ๘ ค่ำ เดือน ๘)", shortName: "", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
    "07-25": { name: "วันอาสาฬหบูชา", shortName: "อาสาฬหฯ", isBuddhaDay: true, isGovernmentHoliday: true, isBankHoliday: true },
    "07-26": { name: "วันเข้าพรรษา", shortName: "เข้าพรรษา", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: false },
    "07-28": { name: "วันเฉลิมพระชนมพรรษา ร.๑๐", shortName: "วัน ร.๑๐", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "08-12": { name: "วันแม่แห่งชาติ", shortName: "วันแม่", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "10-13": { name: "วันคล้ายวันสวรรคต ร.๙", shortName: "วัน ร.๙", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "10-23": { name: "วันปิยมหาราช", shortName: "ปิยมหาราช", isBuddhaDay: false, isGovernmentHoliday: true, isBankHoliday: true },
    "10-24": { name: "วันออกพรรษา", shortName: "ออกพรรษา", isBuddhaDay: true, isGovernmentHoliday: false, isBankHoliday: false },
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
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const addEvent = () => {
    if (!newEventText.trim()) return;
    const updatedEvents = { ...events };
    if (!updatedEvents[selectedDate]) updatedEvents[selectedDate] = [];
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
    return `${toThaiNumber(parseInt(parts[2], 10))} ${months[parseInt(parts[1], 10) - 1]} ${toThaiNumber(parseInt(parts[0], 10) + 543)}`;
  };

  const getHolidayInfo = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    return holidayData[`${parts[1]}-${parts[2]}`] || null;
  };

  const holiday = getHolidayInfo(selectedDate);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.topBar}>
        <Text style={styles.mainAppTitle}>ปฏิทินมินิมอล</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
          <Text style={styles.settingsIcon}>⚙️ ตั้งค่า</Text>
        </TouchableOpacity>
      </View>

      {/* การ์ดตารางปฏิทิน */}
      <View style={styles.calendarCard}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButtonContainer} onPress={() => changeMonth(-1)}>
            <Text style={styles.navButton}>{"‹"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{months[month]} {toThaiNumber(year + 543)}</Text>
          <TouchableOpacity style={styles.navButtonContainer} onPress={() => changeMonth(1)}>
            <Text style={styles.navButton}>{"›"}</Text>
          </TouchableOpacity>
        </View>

        {/* หัววันในสัปดาห์ */}
        <View style={styles.weekDaysContainer}>
          {daysOfWeek.map((day, index) => (
            <Text 
              key={index} 
              style={[
                styles.weekDayText, 
                { fontSize: getSizeStyle('weekText') },
                index === 0 && {color: '#FF3B30'}, 
                index === 6 && {color: '#007AFF'}
              ]}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* ตารางวันที่แบบแบ่งช่อง Grid */}
        <View style={styles.gridContainer}>
          <FlatList
            data={calendarCells}
            numColumns={7}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const hasEvent = item.dateStr && events[item.dateStr] && events[item.dateStr].length > 0;
              const isSelected = item.dateStr === selectedDate;
              const isToday = item.dateStr === new Date().toISOString().split('T')[0];
              
              const cellHoliday = getHolidayInfo(item.dateStr);
              const isBuddhaDay = cellHoliday && cellHoliday.isBuddhaDay;
              const isPublicHoliday = cellHoliday && (cellHoliday.isGovernmentHoliday || cellHoliday.isBankHoliday);
              const holidayLabel = cellHoliday && cellHoliday.shortName ? cellHoliday.shortName : "";

              return (
                <TouchableOpacity 
                  style={[
                    styles.cell, 
                    { height: getSizeStyle('cellHeight') }, 
                    // 🎯 นำค่า selectedCellColor จากตั้งค่ามาใช้เปลี่ยนสีพื้นหลังช่องที่เลือกแบบ Dynamic
                    isSelected && { backgroundColor: selectedCellColor, borderColor: selectedCellColor },
                    isToday && !isSelected && styles.todayCell,
                    isPublicHoliday && !isSelected && styles.publicHolidayCell
                  ]}
                  onPress={() => setSelectedDate(item.dateStr)}
                  disabled={!item.date}
                >
                  {isBuddhaDay && (
                    <Text style={[styles.buddhaIcon, { fontSize: getSizeStyle('buddhaIcon') }, isSelected && { color: '#FFF' }]}>🪷</Text>
                  )}
                  
                  <Text style={[
                    styles.cellText, 
                    { fontSize: getSizeStyle('dateText') }, 
                    isSelected && styles.selectedCellText,
                    isToday && !isSelected && styles.todayCellText,
                    isPublicHoliday && !isSelected && { color: '#FF3B30' }, 
                    isBuddhaDay && !isSelected && !isPublicHoliday && { color: '#E6A23C', fontWeight: '700' },
                    !item.date && styles.emptyCellText
                  ]}>
                    {item.date ? toThaiNumber(item.date) : ""}
                  </Text>

                  {item.date && holidayLabel !== "" && (
                    <Text 
                      numberOfLines={1} 
                      style={[styles.holidayCellLabel, { fontSize: getSizeStyle('holidayText') }, isSelected && { color: '#FFF' }]}
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
      </View>

      {/* บอร์ดแสดงรายละเอียดกิจกรรมด้านล่าง */}
      <View style={styles.bottomCard}>
        {selectedDate ? (
          <View style={styles.eventListContainer}>
            <View style={styles.bottomHeaderRow}>
              <Text style={styles.eventListTitle}>วันที่ {getThaiDayLabel(selectedDate)}</Text>
              <TouchableOpacity style={styles.addEventBtn} onPress={() => setModalVisible(true)}>
                <Text style={styles.addEventBtnText}>+ บันทึกงาน</Text>
              </TouchableOpacity>
            </View>

            {holiday && (
              <View style={[styles.holidayCard, holiday.isBuddhaDay ? styles.buddhaCardBg : styles.redHolidayCardBg]}>
                <Text style={styles.holidayNameText}>{holiday.name}</Text>
              </View>
            )}

            <Text style={styles.sectionSubTitle}>บันทึกกิจกรรม:</Text>
            {events[selectedDate] && events[selectedDate].length > 0 ? (
              <FlatList
                data={events[selectedDate]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.eventItemCard}>
                    <View style={[styles.eventIndicator, { backgroundColor: selectedCellColor }]} />
                    <Text style={styles.eventItemText}>{item}</Text>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noEventText}>ไม่มีกิจกรรมส่วนตัวในวันนี้</Text>
            )}
          </View>
        ) : (
          <Text style={styles.noEventText}>เลือกวันที่บนตารางปฏิทินเพื่อดูรายละเอียดชั้นล่าง</Text>
        )}
      </View>

      {/* ⚙️ หน้าต่างป๊อปอัพ "ตั้งค่าแอป" */}
      <Modal visible={settingsVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚙️ ตั้งค่าแอปพลิเคชัน</Text>
            
            {/* 1. เลือกขนาดหน้าจอ */}
            <Text style={styles.sectionDividerText}>🔍 ขนาดหน้าปฏิทิน</Text>
            <View style={styles.sizeSelectorContainer}>
              <TouchableOpacity 
                style={[styles.sizeBtn, calendarSize === 'normal' && styles.activeSizeBtn]} 
                onPress={() => setCalendarSize('normal')}
              >
                <Text style={[styles.sizeBtnText, calendarSize === 'normal' && styles.activeSizeBtnText]}>ปกติ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sizeBtn, calendarSize === 'large' && styles.activeSizeBtn]} 
                onPress={() => setCalendarSize('large')}
              >
                <Text style={[styles.sizeBtnText, calendarSize === 'large' && styles.activeSizeBtnText]}>ใหญ่ 🔎</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sizeBtn, calendarSize === 'xlarge' && styles.activeSizeBtn]} 
                onPress={() => setCalendarSize('xlarge')}
              >
                <Text style={[styles.sizeBtnText, calendarSize === 'xlarge' && styles.activeSizeBtnText]}>ใหญ่พิเศษ 🚀</Text>
              </TouchableOpacity>
            </View>

            {/* 🎯 2. เมนูใหม่: เลือกสีไฮไลต์ของช่องวันที่เลือกเพื่อดูรายละเอียดชั้นล่าง */}
            <Text style={styles.sectionDividerText}>🎨 สีช่องวันที่เลือก (ดูรายละเอียด)</Text>
            <View style={{ height: 110, marginBottom: 5 }}>
              <FlatList
                data={highlightColors}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.colorOptionRow, 
                      selectedCellColor === item.value && { borderColor: item.value, backgroundColor: '#FAFAFA' },
                      { borderLeftColor: item.value }
                    ]}
                    onPress={() => setSelectedCellColor(item.value)}
                  >
                    <View style={[styles.colorPreviewCircle, { backgroundColor: item.value }]} />
                    <Text style={styles.colorOptionText}>{item.name}</Text>
                    {selectedCellColor === item.value && <Text style={[styles.checkmark, { color: item.value }]}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* 3. เลือกสีพื้นหลังตัวแอป */}
            <Text style={styles.sectionDividerText}>📱 สีพื้นหลังตัวแอป</Text>
            <View style={{ height: 110 }}>
              <FlatList
                data={themeColors}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.colorOptionRow, 
                      bgColor === item.value && styles.activeColorOption,
                      { borderLeftColor: item.value }
                    ]}
                    onPress={() => setBgColor(item.value)}
                  >
                    <View style={[styles.colorPreviewCircle, { backgroundColor: item.value }]} />
                    <Text style={styles.colorOptionText}>{item.name}</Text>
                    {bgColor === item.value && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
            </View>

            <TouchableOpacity style={styles.closeSettingsBtn} onPress={() => setSettingsVisible(false)}>
              <Text style={styles.closeSettingsBtnText}>บันทึกและปิดหน้าต่าง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* หน้าต่างป๊อปอัพเพิ่มบันทึกงาน */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>บันทึกกิจกรรมใหม่</Text>
            <TextInput 
              style={styles.input} 
              placeholder="กรอกรายละเอียด..." 
              value={newEventText}
              onChangeText={setNewEventText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave, { backgroundColor: selectedCellColor }]} onPress={addEvent}>
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
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  mainAppTitle: { fontSize: 20, fontWeight: '800', color: '#1A1C24' },
  settingsButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  settingsIcon: { fontSize: 13, fontWeight: '700', color: '#4A5568' },

  calendarCard: { backgroundColor: '#FFFFFF', borderRadius: 20, margin: 12, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1C24' },
  navButtonContainer: { width: 36, height: 36, backgroundColor: '#F0F4F8', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  navButton: { fontSize: 22, fontWeight: '600', color: '#4A5568', marginTop: -4 },
  weekDaysContainer: { flexDirection: 'row', marginBottom: 8 },
  weekDayText: { flex: 1, textAlign: 'center', fontWeight: '700', color: '#718096' },
  
  gridContainer: { borderWidth: 0.5, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' },
  cell: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative', borderWidth: 0.5, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  cellText: { fontWeight: '700', color: '#2D3748', marginTop: 4 },
  buddhaIcon: { position: 'absolute', top: 2, color: '#E6A23C' },
  holidayCellLabel: { color: '#FF3B30', fontWeight: '600', marginTop: 1, textAlign: 'center', width: '90%' },
  
  emptyCellText: { color: '#E2E8F0', backgroundColor: '#FAFAFA' },
  todayCell: { backgroundColor: '#EDF2F7' },
  todayCellText: { color: '#2B6CB0' },
  selectedCellText: { color: '#FFFFFF' },
  publicHolidayCell: { backgroundColor: '#FFEBEB' },
  eventDot: { width: 4, height: 4, backgroundColor: '#FF3B30', borderRadius: 2, position: 'absolute', bottom: 2 },
  selectedEventDot: { backgroundColor: '#FFFFFF' },
  
  bottomCard: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 5 },
  eventListContainer: { flex: 1 },
  bottomHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  eventListTitle: { fontSize: 16, fontWeight: '700', color: '#1A1C24' },
  sectionSubTitle: { fontSize: 13, fontWeight: '700', color: '#718096', marginTop: 10, marginBottom: 6 },
  addEventBtn: { backgroundColor: '#E8F2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addEventBtnText: { color: '#007AFF', fontWeight: '700', fontSize: 12 },
  
  holidayCard: { padding: 10, borderRadius: 10, marginBottom: 8 },
  redHolidayCardBg: { backgroundColor: '#FFF0F2' },
  buddhaCardBg: { backgroundColor: '#FFF9E6' },
  holidayNameText: { fontSize: 14, fontWeight: '700', color: '#2C3E50' },
  
  eventItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 6, borderWidth: 1, borderColor: '#EDF2F7' },
  eventIndicator: { width: 3, height: 16, borderRadius: 2, marginRight: 10 },
  eventItemText: { fontSize: 14, color: '#4A5568', fontWeight: '500' },
  noEventText: { color: '#A0AEC0', fontSize: 13, textAlign: 'center', marginVertical: 10 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 28, 36, 0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '88%', maxHeight: '90%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1A1C24', marginBottom: 10 },
  sectionDividerText: { fontSize: 14, fontWeight: '700', color: '#4A5568', marginTop: 6, marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginLeft: 10 },
  btnCancel: { backgroundColor: '#F1F5F9' },
  btnCancelText: { color: '#64748B', fontWeight: '600' },
  btnSaveText: { color: '#FFFFFF', fontWeight: '600' },

  sizeSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sizeBtn: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 10, alignItems: 'center', borderRadius: 10, marginHorizontal: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  activeSizeBtn: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  sizeBtnText: { fontSize: 14, fontWeight: '600', color: '#4A5568' },
  activeSizeBtnText: { color: '#FFFFFF', fontWeight: '700' },

  colorOptionRow: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#F8FAFC', borderRadius: 12, marginBottom: 4, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 6 },
  activeColorOption: { borderColor: '#007AFF', backgroundColor: '#F0F7FF' },
  colorPreviewCircle: { width: 16, height: 16, borderRadius: 8, marginRight: 12, borderWidth: 1, borderColor: '#CBD5E1' },
  colorOptionText: { fontSize: 13, fontWeight: '600', color: '#334155', flex: 1 },
  checkmark: { fontSize: 14, fontWeight: '700' },
  closeSettingsBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 14 },
  closeSettingsBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 }
});
