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
    const todayDate = new Date().toLocaleDateString('en-GB');

    // تحديث الطقس الحالي
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('temp').innerText = `${Math.round(current.main.temp)}°`;
    document.getElementById('description').innerText = current.weather[0].description;
    document.getElementById('weatherEmoji').innerText = weatherIcons[current.weather[0].main] || '🌡️';
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-EG', {weekday: 'long', day: 'numeric', month: 'long'});
    document.getElementById('humidity').innerText = `${current.main.humidity}%`;
    document.getElementById('windSpeed').innerText = `${Math.round(current.wind.speed * 3.6)} كم/س`;

    // تحديث التوقعات
    const dGrid = document.getElementById('dailyGrid');
    dGrid.innerHTML = '';
    const dailyData = {};

    data.list.forEach(item => {
        const dateKey = new Date(item.dt * 1000).toLocaleDateString('en-GB'); 
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                dateKey: dateKey, // تخزين المفتاح للمقارنة
                temps: [],
                icon: item.weather[0].main,
                dayName: new Date(item.dt * 1000).toLocaleDateString('ar-EG', {weekday: 'short'})
            };
        }
        dailyData[dateKey].temps.push(item.main.temp);
    });

    // الفلترة لتبدأ من غدٍ
    Object.values(dailyData)
        .filter(day => day.dateKey !== todayDate) // حذف اليوم الحالي من القائمة
        .slice(0, 5)
        .forEach(day => {
            const high = Math.round(Math.max(...day.temps));
            const low = Math.round(Math.min(...day.temps));
            
            dGrid.innerHTML += `
                <div class="day-card">
                    <p style="font-size: 14px; opacity: 0.8;">${day.dayName}</p>
                    <p style="font-size: 35px; margin: 10px 0;">${weatherIcons[day.icon] || '☀️'}</p>
                    <div style="display: flex; justify-content: center; gap: 8px;">
                        <span style="color: #ff4d4d;">${high}°</span>
                        <span style="color: #38bdf8;">${low}°</span>
                    </div>
                </div>`;
        });
}

// دالة البحث
document.getElementById('searchBtn').onclick = () => {
    const val = document.getElementById('cityInput').value.trim();
    if(val) {
        getWeatherData(val);
        document.getElementById('cityInput').value = '';
    }
};

// تبديل الوضع
document.getElementById('themeToggle').onclick = () => {
    document.body.classList.toggle('light-mode');
};
