const apiKey = "319eb791872b393e9a40b2ea08eb2bc0";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiKey = 'YOUR_API_KEY'; // استبدله بمفتاحك الخاص
const weatherIcons = { 
    'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 
    'Drizzle': '🌦️', 'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️' 
};

// تحديد الموقع عند التشغيل
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
    } catch (e) {
        console.error("خطأ في جلب البيانات");
    }
}

function updateUI(data) {
    const current = data.list[0];
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('temp').innerText = `${Math.round(current.main.temp)}°`;
    document.getElementById('description').innerText = current.weather[0].description;
    document.getElementById('humidity').innerText = `${current.main.humidity}%`;
    document.getElementById('windSpeed').innerText = `${current.wind.speed} كم/س`;
    document.getElementById('weatherEmoji').innerText = weatherIcons[current.weather[0].main] || '🌡️';
    
    // التاريخ الحالي
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-EG', options);

    // --- توقعات 5 أيام فقط ---
    const dailyGrid = document.getElementById('dailyGrid');
    dailyGrid.innerHTML = '';
    
    // فلترة البيانات للحصول على قراءة واحدة لكل يوم (ساعة 12:00 ظهراً)
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
    
    dailyData.forEach(day => {
        dailyGrid.innerHTML += `
            <div class="day-card">
                <p style="margin-bottom:10px">${new Date(day.dt * 1000).toLocaleDateString('ar-EG', {weekday: 'short'})}</p>
                <p style="font-size:35px">${weatherIcons[day.weather[0].main] || '☀️'}</p>
                <p><b>${Math.round(day.main.temp)}°</b></p>
            </div>`;
    });
}

// إضافة مدينة للقائمة والبحث
document.getElementById('searchBtn').onclick = () => {
    const val = document.getElementById('cityInput').value.trim();
    if(val) {
        getWeatherData(val);
        addCityToSidebar(val);
        document.getElementById('cityInput').value = '';
    }
};

function addCityToSidebar(city) {
    const container = document.getElementById('savedCities');
    const div = document.createElement('div');
    div.className = 'city-card';
    div.innerHTML = `
        <button class="city-name-btn" onclick="getWeatherData('${city}')">${city}</button>
        <button class="delete-btn" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
        </button>`;
    container.appendChild(div);
}

// تبديل الوضع الداكن/الفاتح
document.getElementById('themeToggle').onclick = () => {
    document.body.classList.toggle('light-mode');
    const icon = document.querySelector('#themeToggle i');
    icon.className = document.body.classList.contains('light-mode') ? 'fas fa-sun' : 'fas fa-moon';
};
