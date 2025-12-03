function formatDuration(seconds) {
    if (seconds <= 0) return "0小时0分钟";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  }
  
  async function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
      alert("请选择一个 JSON 文件");
      return;
    }
  
    try {
      const text = await file.text();
      const data = JSON.parse(text);
  
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // JS 月份从 0 开始
  
      const weekdayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      let totalSeconds = 0;
      const details = [];
  
      for (const [dateStr, value] of Object.entries(data)) {
        if (!value?.entries) continue;
  
        const entries = Array.isArray(value.entries) ? value.entries : [value.entries];
        const datetimes = entries.map(ts => new Date(ts)).sort((a, b) => a - b);
        const recordDate = new Date(dateStr);
  
        const year = recordDate.getFullYear();
        const month = recordDate.getMonth() + 1;
        if (year !== currentYear || month !== currentMonth) continue;
  
        const weekdayIndex = recordDate.getDay();
        const isWeekend = weekdayIndex === 0 || weekdayIndex === 6;
        const timesStr = datetimes.map(d => d.toTimeString().slice(0, 5)).join(", ");
  
        let overtimeSec = 0;
        if (isWeekend) {
          const start = datetimes[0];
          const end = datetimes[datetimes.length - 1];
          overtimeSec = (end - start) / 1000;
        } else {
          const workEndTime = new Date(recordDate);
          workEndTime.setHours(17, 30, 0, 0);
          const latest = datetimes[datetimes.length - 1];
          if (latest > workEndTime) {
            overtimeSec = (latest - workEndTime) / 1000;
          }
        }
  
        if (overtimeSec > 0) totalSeconds += overtimeSec;
  
        details.push({
          date: dateStr,
          weekday: weekdayNames[weekdayIndex],
          times: timesStr,
          durationStr: formatDuration(overtimeSec)
        });
      }
  
      details.sort((a, b) => new Date(a.date) - new Date(b.date));
  
      let html = `<div class="result"><h2>${currentYear}年${currentMonth}月 加班明细</h2>`;
      details.forEach(day => {
        html += `<p><strong>${day.date} (${day.weekday})</strong><br>
                 打卡时间: ${day.times}<br>
                 加班时长: ${day.durationStr}</p><hr>`;
      });
      html += `<p><strong>总加班时长: ${(totalSeconds / 3600).toFixed(2)} 小时</strong></p></div>`;
  
      document.getElementById('result').innerHTML = html;
  
    } catch (err) {
      document.getElementById('result').innerHTML = `<p style="color:red">❌ 错误: ${err.message}</p>`;
    }
  }