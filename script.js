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

    try {
        const res = await fetch(url);
        const data = await res.json();
        if(data.cod === "200") updateUI(data);
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

function updateUI(data) {
    const current = data.list[0];
    
    // تحديد تاريخ اليوم بدقة (سنة-شهر-يوم) للمقارنة الجازمة
    const now = new Date();
    const todayString = now.toISOString().split('T')[0]; 

    // 1. تحديث الطقس الحالي
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('temp').innerText = `${Math.round(current.main.temp)}°`;
    document.getElementById('description').innerText = current.weather[0].description;
    document.getElementById('weatherEmoji').innerText = weatherIcons[current.weather[0].main] || '🌡️';
    document.getElementById('currentDate').innerText = now.toLocaleDateString('ar-EG', {weekday: 'long', day: 'numeric', month: 'long'});
    
    document.getElementById('humidity').innerText = `${current.main.humidity}%`;
    document.getElementById('windSpeed').innerText = `${Math.round(current.wind.speed * 3.6)} كم/س`;

    // 2. معالجة وتصفية الأيام
    const dGrid = document.getElementById('dailyGrid');
    dGrid.innerHTML = '';
    const dailyData = {};

    data.list.forEach(item => {
        // استخراج التاريخ بتنسيق (YYYY-MM-DD)
        const dateKey = item.dt_txt.split(' ')[0]; 
        
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                date: dateKey,
                temps: [],
                icon: item.weather[0].main,
                dayName: new Date(item.dt * 1000).toLocaleDateString('ar-EG', {weekday: 'short'})
            };
        }
        dailyData[dateKey].temps.push(item.main.temp);
    });

    // تحويل الكائن إلى مصفوفة، ثم الحذف، ثم العرض
    Object.values(dailyData)
        .filter(day => day.date !== todayString) // حذف اليوم الحالي (مقارنة تاريخ الطقس بتاريخ اليوم)
        .slice(0, 5) // عرض 5 أيام تبدأ من غدٍ
        .forEach(day => {
            const high = Math.round(Math.max(...day.temps));
            const low = Math.round(Math.min(...day.temps));
            
            dGrid.innerHTML += `
                <div class="day-card">
                    <p style="font-size: 14px; opacity: 0.8;">${day.dayName}</p>
                    <p style="font-size: 35px; margin: 10px 0;">${weatherIcons[day.icon] || '☀️'}</p>
                    <div style="display: flex; justify-content: center; gap: 8px;">
                        <span style="color: #ff4d4d; font-weight: bold;">${high}°</span>
                        <span style="color: #38bdf8; font-weight: bold;">${low}°</span>
                    </div>
                </div>`;
        });
}

document.getElementById('searchBtn').onclick = () => {
    const val = document.getElementById('cityInput').value.trim();
    if(val) {
        getWeatherData(val);
        document.getElementById('cityInput').value = '';
    }
};

document.getElementById('themeToggle').onclick = () => {
    document.body.classList.toggle('light-mode');
};
