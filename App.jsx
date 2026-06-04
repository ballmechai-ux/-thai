import React, { useState, useEffect } from 'react';
import './App.css';

// ============================================================================
// 1. ENGINE คำนวณวันพระ ดาราศาสตร์ และวันสำคัญไทย (เหนือชั้นด้วยระบบ Dynamic)
// ============================================================================
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

// ฟังก์ชันหาปฏิทินทางจันทรคติไทยแบบย่อเพื่อระบุวันพระ (ขึ้น/แรม 8, 15 ค่ำ)
const getThaiLunarDetails = (day, month, year) => {
  // ใช้ Algorithm คำนวณจำลองหาวันพระไทยแบบอ้างอิงความสัมพันธ์รอบวงโคจรดวงจันทร์
  // หมายเหตุ: รอบวันพระจริงจะอิงตามปฏิทินหลวง (ปักขคณนา) นี่คือชุดข้อมูลจำลองที่ใกล้เคียงที่สุด
  const baseEpoch = new Date(2026, 4, 1); // 1 พ.ค. 2026
  const currentDays = (new Date(year, month, day) - baseEpoch) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.53059; // รอบจันทรคติโดยเฉลี่ย
  const currentAge = (currentDays + 12.5) % lunarCycle; // ชดเชยเฟสเริ่มต้น

  if (currentAge < 0) return null;

  // ตรวจหาจุดวิกฤตของข้างขึ้นข้างแรม (ประมาณการเฟสพระจันทร์)
  if (Math.abs(currentAge - 7.4) < 0.65) return { label: "วันพระ", detail: "ขึ้น ๘ ค่ำ" };
  if (Math.abs(currentAge - 14.8) < 0.65) return { label: "วันพระ", detail: "ขึ้น ๑๕ ค่ำ" };
  if (Math.abs(currentAge - 22.1) < 0.65) return { label: "วันพระ", detail: "แรม ๘ ค่ำ" };
  if (Math.abs(currentAge - 29.2) < 0.65 || currentAge < 0.4) return { label: "วันพระ", detail: "แรม ๑๕ ค่ำ" };

  return null;
};

// ฟังก์ชันระบุวันหยุดและวันสำคัญของไทยแบบ Dynamic อิงตามเดือน
const getThaiHolidays = (day, month, year) => {
  // เดือนนับแบบ JavaScript: 0 = ม.ค., 4 = พ.ค.
  if (month === 4) { // พฤษภาคม
    if (day === 4) return { label: "วันฉัตร...", detail: "วันฉัตรมงคล" };
    if (day === 13) return { label: "วันพืชม...", detail: "วันพระราชพิธีพืชมงคลจรดพระนังคัลแรกนาขวัญ" };
    if (day === 31) return { label: "วันวิสา...", detail: "วันวิสาขบูชา (วันหยุดราชการ)" };
  }
  if (month === 0 && day === 1) return { label: "วันขึ้นปีใหม่", detail: "วันขึ้นปีใหม่" };
  if (month === 11 && day === 31) return { label: "วันสิ้นปี", detail: "วันสิ้นปี" };
  return null;
};

export default function App() {
  // ============================================================================
  // 2. STATES & INITIALIZATION
  // ============================================================================
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 30)); // ตั้งต้นตามรูปภาพ (30 พ.ค. 2569)
  const [selectedDay, setSelectedDay] = useState(30);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Settings States (บันทึกลง LocalStorage อัตโนมัติเพื่อความเทพ)
  const [showBuddhist, setShowBuddhist] = useState(() => JSON.parse(localStorage.getItem('cal_buddhist') ?? 'true'));
  const [showHolidays, setShowHolidays] = useState(() => JSON.parse(localStorage.getItem('cal_holidays') ?? 'true'));
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem('cal_dark') ?? 'false'));
  const [startOfWeek, setStartOfWeek] = useState(() => localStorage.getItem('cal_start_week') || 'Sunday');

  // User Events State (ระบบบันทึกความจำส่วนตัวระดับแอปพลิเคชันจริง)
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem('cal_events') || '{}'));
  const [newEventText, setNewEventText] = useState('');

  useEffect(() => {
    localStorage.setItem('cal_buddhist', JSON.stringify(showBuddhist));
    localStorage.setItem('cal_holidays', JSON.stringify(showHolidays));
    localStorage.setItem('cal_dark', JSON.stringify(isDarkMode));
    localStorage.setItem('cal_start_week', startOfWeek);
    localStorage.setItem('cal_events', JSON.stringify(events));
  }, [showBuddhist, showHolidays, isDarkMode, startOfWeek, events]);

  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();

  // ============================================================================
  // 3. CALENDAR GENERATOR CALCULATION (คำนวณวันในเดือนแบบอัตโนมัติจริง)
  // ============================================================================
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 1 = Mon...

  const generateGrid = () => {
    const grid = [];
    // คำนวณหาวันว่าง (Offset) ก่อนเริ่มวันที่ 1 ของเดือน
    let blanks = startOfWeek === 'Sunday' ? firstDayIndex : (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
    for (let i = 0; i < blanks; i++) {
      grid.push(null);
    }
    // ใส่เลขวันจริงเข้าไปในอาเรย์
    for (let d = 1; d <= daysInMonth; d++) {
      grid.push(d);
    }
    return grid;
  };

  const calendarDays = generateGrid();
  const weekHeaders = startOfWeek === 'Sunday' 
    ? ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."] 
    : ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

  // ============================================================================
  // 4. HANDLERS / ACTIONS
  // ============================================================================
  const handlePrevMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth + 1, 1));
    setSelectedDay(1);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventText.trim()) return;
    const dateKey = `${viewYear}-${viewMonth}-${selectedDay}`;
    const currentDayEvents = events[dateKey] || [];
    setEvents({
      ...events,
      [dateKey]: [...currentDayEvents, newEventText.trim()]
    });
    setNewEventText('');
  };

  const handleDeleteEvent = (index) => {
    const dateKey = `${viewYear}-${viewMonth}-${selectedDay}`;
    const updated = [...events[dateKey]];
    updated.splice(index, 1);
    setEvents({
      ...events,
      [dateKey]: updated
    });
  };

  // ดึงรายละเอียดวันปัจจุบันมาแสดงผล
  const dateKey = `${viewYear}-${viewMonth}-${selectedDay}`;
  const dayBuddhistData = getThaiLunarDetails(selectedDay, viewMonth, viewYear);
  const dayHolidayData = getThaiHolidays(selectedDay, viewMonth, viewYear);
  const dayUserEvents = events[dateKey] || [];

  return (
    <div className={`super-calendar ${isDarkMode ? 'dark-core' : 'light-core'}`}>
      
      {/* HEADER CONTROLS */}
      <div className="cal-header">
        <button className="nav-btn" onClick={handlePrevMonth}>◀ ก่อนหน้า</button>
        <h2 className="header-title">
          {THAI_MONTHS[viewMonth]} {viewYear + 543} {/* แสดงปีเป็น พ.ศ. ตามรูป */}
        </h2>
        <button className="nav-btn setup-btn" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
          {isSettingsOpen ? '✕ ปิด' : '⚙️ ตั้งค่า'}
        </button>
      </div>

      {isSettingsOpen ? (
        /* SETTINGS MATRIX */
        <div className="settings-matrix animate-fade-in">
          <h3 className="matrix-title">⚙️ แผงควบคุมระบบปฏิทิน</h3>
          <div className="control-row">
            <label>แสดงวันพระไทย (🪷)</label>
            <input type="checkbox" checked={showBuddhist} onChange={e => setShowBuddhist(e.target.checked)} />
          </div>
          <div className="control-row">
            <label>แสดงวันหยุดราชการและวันสำคัญ</label>
            <input type="checkbox" checked={showHolidays} onChange={e => setShowHolidays(e.target.checked)} />
          </div>
          <div className="control-row">
            <label>เริ่มต้นวันแรกของสัปดาห์</label>
            <select value={startOfWeek} onChange={e => setStartOfWeek(e.target.value)}>
              <option value="Sunday">วันอาทิตย์ (Sun)</option>
              <option value="Monday">วันจันทร์ (Mon)</option>
            </select>
          </div>
          <div className="control-row">
            <label>เปิดใช้งาน Ultra Dark Mode</label>
            <input type="checkbox" checked={isDarkMode} onChange={e => setIsDarkMode(e.target.checked)} />
          </div>
        </div>
      ) : (
        /* MAIN CALENDAR CORE */
        <>
          <div className="weekdays-strip">
            {weekHeaders.map((w, idx) => (
              <div key={idx} className={w === "อา." ? "sun-highlight" : ""}>{w}</div>
            ))}
          </div>

          <div className="days-matrix">
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="cell empty-cell"></div>;

              const isSelected = selectedDay === day;
              const lunar = getThaiLunarDetails(day, viewMonth, viewYear);
              const holiday = getThaiHolidays(day, viewMonth, viewYear);
              
              const hasBuddhist = lunar && showBuddhist;
              const hasHoliday = holiday && showHolidays;
              const hasUserEvent = events[`${viewYear}-${viewMonth}-${day}`]?.length > 0;

              return (
                <div 
                  key={`day-${day}`} 
                  className={`cell day-cell ${isSelected ? 'active-cell' : ''} ${hasUserEvent ? 'has-event' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="cell-top">
                    <span className="num-lbl">{day}</span>
                    {hasUserEvent && <span className="event-dot"></span>}
                  </div>
                  <div className="cell-body">
                    {hasHoliday && <span className="badge holiday-txt">{holiday.label}</span>}
                    {hasBuddhist && (
                      <span className="badge buddhist-txt">
                        <span className="mini-lotus">🪷</span>วันพระ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DYNAMIC DASHBOARD / INTELLIGENT PANEL */}
