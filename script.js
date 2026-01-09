const apiKey = "319eb791872b393e9a40b2ea08eb2bc0";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const weatherIcons = { 'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️', 'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️' };

window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => getWeatherData(p.coords.latitude, p.coords.longitude, true), 
        () => getWeatherData('Baghdad'));
    }
};

async function getWeatherData(q, lon = null, isCoords = false) {
    let url = isCoords 
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${q}&lon=${lon}&appid=${apiKey}&units=metric&lang=ar`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${q}&appid=${apiKey}&units=metric&lang=ar`;

    const res = await fetch(url);
    const data = await res.json();
    if(data.cod === "200") updateUI(data);
}

function updateUI(data) {
    // 1. تحديث الواجهة الرئيسية (الطقس الحالي)
    const current = data.list[0];
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('temp').innerText = `${Math.round(current.main.temp)}°`;
    document.getElementById('description').innerText = current.weather[0].description;
    document.getElementById('weatherEmoji').innerText = weatherIcons[current.weather[0].main] || '🌡️';
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-EG', {weekday: 'long', day: 'numeric', month: 'long'});

    // 2. تحديث توقعات الـ 5 أيام (مع الحرارة العليا والسفلى)
    const dGrid = document.getElementById('dailyGrid');
    dGrid.innerHTML = '';

    const dailyData = {};

    data.list.forEach(item => {
        // نستخدم التاريخ كمفتاح لتجميع القراءات (مثل: 09/01/2026)
        const date = new Date(item.dt * 1000).toLocaleDateString('en-GB'); 
        
        if (!dailyData[date]) {
            dailyData[date] = {
                allTemps: [],
                icon: item.weather[0].main,
                name: new Date(item.dt * 1000).toLocaleDateString('ar-EG', {weekday: 'short'})
            };
        }
        dailyData[date].allTemps.push(item.main.temp);
    });

    // عرض أول 5 أيام من القائمة المجمعة
    Object.values(dailyData).slice(0, 5).forEach(day => {
        const high = Math.round(Math.max(...day.allTemps)); // استخراج الدرجة القصوى
        const low = Math.round(Math.min(...day.allTemps));  // استخراج الدرجة الدنيا

        dGrid.innerHTML += `
            <div class="day-card">
                <p style="font-size:14px; opacity:0.8">${day.name}</p>
                <p style="font-size:35px; margin:10px 0">${weatherIcons[day.icon] || '☀️'}</p>
                <div style="display: flex; justify-content: center; gap: 8px;">
                    <span style="color: #ff4d4d; font-weight: bold;">${high}°</span>
                    <span style="color: #38bdf8; font-weight: bold;">${low}°</span>
                </div>
            </div>`;
    });
}

// دالة البحث عن مدينة
document.getElementById('searchBtn').onclick = () => {
    const val = document.getElementById('cityInput').value.trim();
    if(val) {
        getWeatherData(val);
        document.getElementById('cityInput').value = '';
    }
};

// تبديل الوضع الليلي/النهاري
document.getElementById('themeToggle').onclick = () => {
    document.body.classList.toggle('light-mode');
    const icon = document.querySelector('#themeToggle i');
    if(icon) {
        icon.className = document.body.classList.contains('light-mode') ? 'fas fa-sun' : 'fas fa-moon';
    }
};
