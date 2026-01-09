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
    const current = data.list[0];
    
    // تحديث النصوص الأساسية
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('temp').innerText = `${Math.round(current.main.temp)}°`;
    document.getElementById('description').innerText = current.weather[0].description;
    document.getElementById('weatherEmoji').innerText = weatherIcons[current.weather[0].main] || '🌡️';
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-EG', {weekday: 'long', day: 'numeric', month: 'long'});

    // --- الحل لمشكلة الرطوبة والرياح (تأكد من وجود هذه الـ IDs في الـ HTML) ---
    if(document.getElementById('humidity')) {
        document.getElementById('humidity').innerText = `${current.main.humidity}%`;
    }
    if(document.getElementById('windSpeed')) {
        document.getElementById('windSpeed').innerText = `${current.wind.speed} كم/س`;
    }

    // بقية كود الـ 5 أيام كما هو في رسالتك...
}
    // 2. تحديث توقعات الـ 5 أيام (مع الحرارة العليا والسفلى)
// --- تحديث توقعات الـ 5 أيام القادمة بدقة ---
const dGrid = document.getElementById('dailyGrid');
dGrid.innerHTML = ''; // تنظيف القائمة قبل الإضافة

const dailyData = {};

// تجميع كل القراءات القادمة من الـ API وتصنيفها حسب اليوم
data.list.forEach(item => {
    const dateKey = new Date(item.dt * 1000).toLocaleDateString('en-GB'); 
    
    if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
            allTemps: [],
            icon: item.weather[0].main,
            dayName: new Date(item.dt * 1000).toLocaleDateString('ar-EG', {weekday: 'short'})
        };
    }
    // إضافة درجة الحرارة الحالية لهذه الساعة إلى قائمة درجات اليوم
    dailyData[dateKey].allTemps.push(item.main.temp);
});

// تحويل البيانات المجمعة إلى كروت وعرضها (أول 5 أيام فقط)
Object.values(dailyData).slice(0, 5).forEach(day => {
    const highTemp = Math.round(Math.max(...day.allTemps)); // استخراج أعلى درجة
    const lowTemp = Math.round(Math.min(...day.allTemps));  // استخراج أقل درجة

    dGrid.innerHTML += `
        <div class="day-card">
            <p style="font-size: 14px; opacity: 0.8; margin-bottom: 5px;">${day.dayName}</p>
            <p style="font-size: 35px; margin: 10px 0;">${weatherIcons[day.icon] || '☀️'}</p>
            <div style="display: flex; justify-content: center; gap: 10px; margin-top: 5px;">
                <span style="color: #ff4d4d; font-weight: bold; font-size: 16px;">${highTemp}°</span>
                <span style="color: #38bdf8; font-weight: bold; font-size: 16px;">${lowTemp}°</span>
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
