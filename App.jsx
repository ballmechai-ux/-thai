<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ปฏิทินไทยและระบบบันทึกโน้ต</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: #f4f6f9;
            color: #333;
            padding: 20px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }

        .nav-btn {
            background-color: #4A90E2;
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.2s;
        }

        .nav-btn:hover {
            background-color: #357ABD;
        }

        #monthTitle {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2C3E50;
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 10px;
            width: 100%;
        }

        .weekday {
            text-align: center;
            font-weight: bold;
            padding: 10px 0;
            background-color: #E1E8ED;
            color: #2C3E50;
            border-radius: 4px;
        }

        .day {
            background: #fff;
            border: 1px solid #e1e4e6;
            border-radius: 8px;
            min-height: 110px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
        }

        .day:hover {
            border-color: #4A90E2;
            box-shadow: 0 2px 8px rgba(74,144,226,0.15);
        }

        .day.empty {
            background: #f9fafb;
            border: 1px dashed #e1e4e6;
            cursor: default;
        }

        .day.empty:hover {
            box-shadow: none;
            border-color: #e1e4e6;
        }

        .day.today {
            background-color: #EBF3FC;
            border: 2px solid #4A90E2;
        }

        .day-num {
            font-size: 1.1rem;
            font-weight: bold;
            color: #444;
        }

        .lunar-info {
            font-size: 0.75rem;
            color: #7f8c8d;
            margin-top: 4px;
            line-height: 1.2;
        }

        .buddhist-day {
            color: #e67e22;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 2px;
            margin-top: 2px;
        }

        .holiday {
            font-size: 0.75rem;
            color: #e74c3c;
            background: #fde8e8;
            padding: 2px 4px;
            border-radius: 3px;
            margin-top: 4px;
            word-break: break-word;
        }

        .buddhist-icon {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .buddhist-icon svg {
            width: 100%;
            height: 100%;
        }

        .note-preview {
            font-size: 0.7rem;
            background: #2ecc71;
            color: white;
            padding: 2px 5px;
            border-radius: 3px;
            margin-top: auto;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .modal-content {
            background: white;
            padding: 25px;
            border-radius: 10px;
            width: 90%;
            max-width: 450px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .modal-header {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2C3E50;
        }

        .modal-textarea {
            width: 100%;
            height: 120px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
            resize: none;
            margin-bottom: 15px;
            font-size: 0.95rem;
        }

        .modal-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }

        .btn-save { background: #2ecc71; color: white; }
        .btn-cancel { background: #95a5a6; color: white; }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <button class="nav-btn" onclick="changeMonth(-1)">◀ เดือนก่อนหน้า</button>
        <div id="monthTitle"></div>
        <button class="nav-btn" onclick="changeMonth(1)">เดือนถัดไป ▶</button>
    </div>

    <div class="calendar-grid" id="calendarGrid"></div>
</div>

<div class="modal" id="noteModal">
    <div class="modal-content">
        <div class="modal-header" id="modalHeader">บันทึกความจำ</div>
        <textarea class="modal-textarea" id="noteInput" placeholder="พิมพ์ข้อความที่ต้องการบันทึกที่นี่..."></textarea>
        <div class="modal-buttons">
            <button class="btn btn-cancel" onclick="closeModal()">ยกเลิก</button>
            <button class="btn btn-save" onclick="saveNote()">บันทึก</button>
        </div>
    </div>
</div>

<script>
    const THAI_HOLIDAYS = {
        '2026-01-01': 'วันขึ้นปีใหม่',
        '2026-02-24': 'วันศิลปินแห่งชาติ', 
        '2026-03-03': 'วันมาฆบูชา',       
        '2026-04-06': 'วันจักรี',
        '2026-04-13': 'วันสงกรานต์',
        '2026-04-14': 'วันสงกรานต์',
        '2026-04-15': 'วันสงกรานต์',
        '2026-05-01': 'วันแรงงานแห่งชาติ',
        '2026-05-04': 'วันฉัตรมงคล',
        '2026-05-13': 'วันพืชมงคล',
        '2026-05-31': 'วันวิสาขบูชา',
        '2026-06-03': 'วันเฉลิมฯ พระราชินี',
        '2026-07-28': 'วันเฉลิมฯ ร.10',
        '2026-07-29': 'วันอาสาฬหบูชา',
        '2026-07-30': 'วันเข้าพรรษา',
        '2026-08-12': 'วันแม่แห่งชาติ',
        '2026-10-13': 'วันคล้ายวันสวรรคต ร.9',
        '2026-10-23': 'วันปิยมหาราช',
        '2026-12-05': 'วันพ่อแห่งชาติ',
        '2026-12-10': 'วันรัฐธรรมนูญ',
        '2026-12-31': 'วันสิ้นปี'
    };

    const BUDDHIST_DAYS_2026 = {
        '2026-01-03': 'ขึ้น ๑๕ ค่ำ เดือน ๒', '2026-01-11': 'แรม ๘ ค่ำ เดือน ๒', '2026-01-18': 'แรม ๑๕ ค่ำ เดือน ๒', '2026-01-26': 'ขึ้น ๘ ค่ำ เดือน ๓',
        '2026-02-02': 'ขึ้น ๑๕ ค่ำ เดือน ๓', '2026-02-10': 'แรม ๘ ค่ำ เดือน ๓', '2026-02-16': 'แรม ๑๔ ค่ำ เดือน ๓', '2026-02-24': 'ขึ้น ๘ ค่ำ เดือน ๔',
        '2026-03-03': 'ขึ้น ๑๕ ค่ำ เดือน ๔ (วันมาฆบูชา)', '2026-03-11': 'แรม ๘ ค่ำ เดือน ๔', '2026-03-18': 'แรม ๑๕ ค่ำ เดือน ๔', '2026-03-26': 'ขึ้น ๘ ค่ำ เดือน ๕',
        '2026-04-02': 'ขึ้น ๑๕ ค่ำ เดือน ๕', '2026-04-10': 'แรม ๘ ค่ำ เดือน ๕', '2026-04-16': 'แรม ๑๔ ค่ำ เดือน ๕', '2026-04-24': 'ขึ้น ๘ ค่ำ เดือน ๖',
        '2026-05-01': 'ขึ้น ๑๕ ค่ำ เดือน ๖', '2026-05-09': 'แรม ๘ ค่ำ เดือน ๖', '2026-05-16': 'แรม ๑๕ ค่ำ เดือน ๖', '2026-05-24': 'ขึ้น ๘ ค่ำ เดือน ๗', '2026-05-31': 'ขึ้น ๑๕ ค่ำ เดือน ๗ (วันวิสาขบูชา)',
        '2026-06-08': 'แรม ๘ ค่ำ เดือน ๗', '2026-06-14': 'แรม ๑๔ ค่ำ เดือน ๗', '2026-06-22': 'ขึ้น ๘ ค่ำ เดือน ๘', '2026-06-29': 'ขึ้น ๑๕ ค่ำ เดือน ๘',
        '2026-07-07': 'แรม ๘ ค่ำ เดือน ๘', '2026-07-14': 'แรม ๑๕ ค่ำ เดือน ๘', '2026-07-22': 'ขึ้น ๘ ค่ำ เดือน ๘-๘', '2026-07-29': 'ขึ้น ๑๕ ค่ำ เดือน ๘-๘ (วันอาสาฬหบูชา)',
        '2026-08-06': 'แรม ๘ ค่ำ เดือน ๘-๘', '2026-08-13': 'แรม ๑๕ ค่ำ เดือน ๘-๘', '2026-08-21': 'ขึ้น ๘ ค่ำ เดือน ๙', '2026-08-28': 'ขึ้น ๑๕ ค่ำ เดือน ๙',
        '2026-09-05': 'แรม ๘ ค่ำ เดือน ๙', '2026-09-11': 'แรม ๑๔ ค่ำ เดือน ๙', '2026-09-19': 'ขึ้น ๘ ค่ำ เดือน ๑๐', '2026-09-26': 'ขึ้น ๑๕ ค่ำ เดือน ๑๐',
        '2026-10-04': 'แรม ๘ ค่ำ เดือน ๑๐', '2026-10-11': 'แรม ๑๕ ค่ำ เดือน ๑๐', '2026-10-19': 'ขึ้น ๘ ค่ำ เดือน ๑๑', '2026-10-27': 'ขึ้น ๑๕ ค่ำ เดือน ๑๑ (วันออกพรรษา)',
        '2026-11-03': 'แรม ๘ ค่ำ เดือน ๑๑', '2026-11-09': 'แรม ๑๔ ค่ำ เดือน ๑๑', '2026-11-17': 'ขึ้น ๘ ค่ำ เดือน ๑๒', '2026-11-24': 'ขึ้น ๑๕ ค่ำ เดือน ๑๒ (วันลอยกระทง)',
        '2026-12-02': 'แรม ๘ ค่ำ เดือน ๑๒', '2026-12-09': 'แรม ๑๕ ค่ำ เดือน ๑๒', '2026-12-17': 'ขึ้น ๘ ค่ำ เดือน ๑', '2026-12-24': 'ขึ้น ๑๕ ค่ำ เดือน ๑'
    };

    const MONTH_NAMES_TH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const WEEKDAYS_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

    let currentYear = 2026;
    let currentMonth = 0; 
    let selectedDateStr = "";

    function getBuddhaSVG() {
        return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 15 C52 23 48 23 50 28 Z" fill="#FF8C00"/><circle cx="50" cy="34" r="7" fill="#FF8C00"/><path d="M42 32 C41 35 43 37 43 37" stroke="#FF8C00" stroke-width="1.5" fill="none"/><path d="M58 32 C59 35 57 37 57 37" stroke="#FF8C00" stroke-width="1.5" fill="none"/><path d="M50 42 L42 46 L38 58 L45 68 L55 68 L62 58 L58 46 Z" fill="#FF8C00"/><path d="M42 46 Q48 54 55 68 L45 68 Q41 56 42 46 Z" fill="#FFA500" opacity="0.8"/><path d="M30 68 C28 74 38 76 50 76 C62 76 72 74 70 68 C66 65 34 65 30 68 Z" fill="#FF8C00"/><circle cx="50" cy="65" r="4" fill="#FFA500"/></svg>`;
    }

    function getLunarDetails(dateString) {
        if (BUDDHIST_DAYS_2026[dateString]) {
            return { isBuddhistDay: true, text: BUDDHIST_DAYS_2026[dateString] };
        }
        const targetDate = new Date(dateString);
        const refDate = new Date('2025-01-13T07:00:00+07:00'); 
        const diffDays = (targetDate - refDate) / (1000 * 60 * 60 * 24);
        const LUNAR_CYCLE = 29.53059;
        let age = diffDays % LUNAR_CYCLE;
        if (age < 0) age += LUNAR_CYCLE;

        if (age < 14.765) {
            const dayNum = Math.min(15, Math.max(1, Math.round(age) + 1));
            return { isBuddhistDay: false, text: `ขึ้น ${thaiNumber(dayNum)} ค่ำ` };
        } else {
            const dayNum = Math.min(15, Math.max(1, Math.round(age - 14.765) + 1));
            return { isBuddhistDay: false, text: `แรม ${thaiNumber(dayNum)} ค่ำ` };
        }
    }

    function thaiNumber(num) {
        const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
        return num.toString().split('').map(digit => thaiDigits[digit] || digit).join('');
    }

    function renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        const monthTitle = document.getElementById('monthTitle');
        grid.innerHTML = '';

        monthTitle.innerText = `${MONTH_NAMES_TH[currentMonth]} พ.ศ. ${currentYear + 543}`;

        WEEKDAYS_TH.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'weekday';
            dayHeader.innerText = day;
            grid.appendChild(dayHeader);
        });

        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'day empty';
            grid.appendChild(emptyDiv);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';

            const monthStr = String(currentMonth + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

            if (new Date().getFullYear() === currentYear && new Date().getMonth() === currentMonth && new Date().getDate() === day) {
                dayDiv.classList.add('today');
            }

            const numDiv = document.createElement('div');
            numDiv.className = 'day-num';
            numDiv.innerText = day;
            dayDiv.appendChild(numDiv);

            const lunar = getLunarDetails(dateKey);
            const lunarDiv = document.createElement('div');
            lunarDiv.className = 'lunar-info';
            
            if (lunar.isBuddhistDay) {
                lunarDiv.classList.add('buddhist-day');
                lunarDiv.innerHTML = `<span>🙏 ${lunar.text}</span>`;
                
                const iconContainer = document.createElement('div');
                iconContainer.className = 'buddhist-icon';
                iconContainer.innerHTML = getBuddhaSVG();
                dayDiv.appendChild(iconContainer);
            } else {
                lunarDiv.innerText = lunar.text;
            }
            dayDiv.appendChild(lunarDiv);

            if (THAI_HOLIDAYS[dateKey]) {
                const holidayDiv = document.createElement('div');
                holidayDiv.className = 'holiday';
                holidayDiv.innerText = THAI_HOLIDAYS[dateKey];
                dayDiv.appendChild(holidayDiv);
            }

            const savedNote = localStorage.getItem(`note_${dateKey}`);
            if (savedNote) {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'note-preview';
                previewDiv.innerText = savedNote;
                dayDiv.appendChild(previewDiv);
            }

            dayDiv.onclick = () => openModal(dateKey, day);
            grid.appendChild(dayDiv);
        }
    }

    function openModal(dateKey, dayNum) {
        selectedDateStr = dateKey;
        const modal = document.getElementById('noteModal');
        const header = document.getElementById('modalHeader');
        const input = document.getElementById('noteInput');
        header.innerText = `บันทึกความจำ วันที่ ${dayNum} ${MONTH_NAMES_TH[currentMonth]} พ.ศ. ${currentYear + 543}`;
        input.value = localStorage.getItem(`note_${dateKey}`) || "";
        modal.style.display = 'flex';
        input.focus();
    }

    function closeModal() { document.getElementById('noteModal').style.display = 'none'; }

    function saveNote() {
        const text = document.getElementById('noteInput').value.trim();
        if (text === "") localStorage.removeItem(`note_${selectedDateStr}`);
        else localStorage.setItem(`note_${selectedDateStr}`, text);
        closeModal();
        renderCalendar();
    }

    function changeMonth(direction) {
        currentMonth += direction;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        else if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    }

    window.onload = () => { renderCalendar(); };
</script>
</body>
</html>
