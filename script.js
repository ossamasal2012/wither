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

    // 1. تحديث البيانات الأساسية (الرطوبة والرياح تم إصلاحها هنا)
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('temp').innerText = `${Math.round(current.main.temp)}°`;
    document.getElementById('description').innerText = current.weather[0].description;
    document.getElementById('weatherEmoji').innerText = weatherIcons[current.weather[0].main] || '🌡️';
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-EG', {weekday: 'long', day: 'numeric', month: 'long'});
    
    // ربط الرطوبة والرياح بالعناصر
    document.getElementById('humidity').innerText = `${current.main.humidity}%`;
    document.getElementById('windSpeed').innerText = `${current.wind.speed} كم/س`;

    // 2. تحديث التسلسل الزمني (الساعات)
    const hList = document.getElementById('hourlyList');
    if(hList) {
        hList.innerHTML = '';
        data.list.slice(0, 10).forEach(hourData => {
            const time = new Date(hourData.dt * 1000);
            const hour = time.getHours();
            const ampm = hour >= 12 ? 'م' : 'ص';
            const hour12 = hour % 12 || 12;

            hList.innerHTML += `
                <div class="hour-card">
                    <p style="font-size: 12px; opacity: 0.7;">${hour12} ${ampm}</p>
                    <p style="font-size: 25px; margin: 5px 0;">${weatherIcons[hourData.weather[0].main] || '☀️'}</p>
                    <p style="font-weight: bold;">${Math.round(hourData.main.temp)}°</p>
                </div>`;
        });
    }

    // 3. تحديث الـ 5 أيام (الحرارة العليا والسفلى)
    const dGrid = document.getElementById('dailyGrid');
    dGrid.innerHTML = '';
    const dailyData = {};

    data.list.forEach(item => {
        const dateKey = new Date(item.dt * 1000).toLocaleDateString('en-GB'); 
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                temps: [],
                icon: item.weather[0].main,
                dayName: new Date(item.dt * 1000).toLocaleDateString('ar-EG', {weekday: 'short'})
            };
        }
        dailyData[dateKey].temps.push(item.main.temp);
    });

    Object.values(dailyData).slice(0, 5).forEach(day => {
        const high = Math.round(Math.max(...day.temps));
        const low = Math.round(Math.min(...day.temps));
        dGrid.innerHTML += `
            <div class="day-card">
                <p style="font-size: 13px;">${day.dayName}</p>
                <p style="font-size: 30px; margin: 8px 0;">${weatherIcons[day.icon] || '☀️'}</p>
                <div style="display: flex; justify-content: center; gap: 5px;">
                    <span style="color: #ff4d4d; font-weight: bold;">${high}°</span>
                    <span style="color: #38bdf8; font-weight: bold;">${low}°</span>
                </div>
            </div>`;
    });
}
