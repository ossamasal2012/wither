const apiKey = "319eb791872b393e9a40b2ea08eb2bc0";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const weatherIcons = { 'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️', 'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️' };

window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            p => getWeatherData(p.coords.latitude, p.coords.longitude, true), 
            () => getWeatherData('Baghdad')
        );
    }
};

async function getWeatherData(q, lon = null, isCoords = false) {
    let url = isCoords 
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${q}&lon=${lon}&appid=${apiKey}&units=metric&lang=ar`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${q}&appid=${apiKey}&units=metric&lang=ar`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if(data.cod === "200") updateUI(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function updateUI(data) {
    const current = data.list[0];
    const now = new Date();
    
    // تصحيح: الحصول على التاريخ الحالي بتوقيت الجهاز المحلي بصيغة YYYY-MM-DD
    const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    // 1. تحديث الواجهة العلوية
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('temp').innerText = `${Math.round(current.main.temp)}°`;
    document.getElementById('description').innerText = current.weather[0].description;
    document.getElementById('weatherEmoji').innerText = weatherIcons[current.weather[0].main] || '🌡️';
    document.getElementById('currentDate').innerText = now.toLocaleDateString('ar-EG', {weekday: 'long', day: 'numeric', month: 'long'});
    
    // ربط الرطوبة والرياح (إصلاح النقص في الصورة الأولى)
    document.getElementById('humidity').innerText = `${current.main.humidity}%`;
    document.getElementById('windSpeed').innerText = `${Math.round(current.wind.speed * 3.6)} كم/س`;

    // 2. معالجة بيانات الأيام
    const dGrid = document.getElementById('dailyGrid');
    dGrid.innerHTML = '';
    const dailyData = {};

    data.list.forEach(item => {
        const datePart = item.dt_txt.split(' ')[0]; // يأخذ "2026-01-09" مثلاً
        
        if (!dailyData[datePart]) {
            dailyData[datePart] = {
                temps: [],
                icon: item.weather[0].main,
                dayName: new Date(item.dt * 1000).toLocaleDateString('ar-EG', {weekday: 'short'})
            };
        }
        dailyData[datePart].temps.push(item.main.temp);
    });

    // 3. الفلترة الصارمة والحساب الواقعي
    Object.keys(dailyData).forEach(date => {
        // حذف اليوم الحالي (todayStr) من الظهور في الشبكة السفلى
        if (date !== todayStr) {
            const day = dailyData[date];
            const sorted = day.temps.sort((a, b) => b - a);
            
            // حساب واقعي: متوسط أعلى درجتين للعظمى، وأقل درجة للصغرى
            const high = sorted.length > 1 ? Math.round((sorted[0] + sorted[1]) / 2) : Math.round(sorted[0]);
            const low = Math.round(Math.min(...day.temps));

            // منع التكرار: نكتفي بـ 5 أيام فقط
            if (dGrid.children.length < 5) {
                dGrid.innerHTML += `
                    <div class="day-card">
                        <p style="font-size: 14px; opacity: 0.8;">${day.dayName}</p>
                        <p style="font-size: 35px; margin: 10px 0;">${weatherIcons[day.icon] || '☀️'}</p>
                        <div style="display: flex; justify-content: center; gap: 8px;">
                            <span style="color: #ff4d4d; font-weight: bold;">${high}°</span>
                            <span style="color: #38bdf8; font-weight: bold;">${low}°</span>
                        </div>
                    </div>`;
            }
        }
    });
}

// أزرار البحث والتبديل كما هي
document.getElementById('searchBtn').onclick = () => {
    const val = document.getElementById('cityInput').value.trim();
    if(val) { getWeatherData(val); document.getElementById('cityInput').value = ''; }
};
document.getElementById('themeToggle').onclick = () => { document.body.classList.toggle('light-mode'); };
