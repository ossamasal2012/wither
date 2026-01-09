const apiKey = "319eb791872b393e9a40b2ea08eb2bc0";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const weatherIcons = { 
    'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 
    'Drizzle': '🌦️', 'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️' 
};

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
        if(data.cod === "200") {
            updateUI(data);
        } else {
            console.error("خطأ من API:", data.message);
        }
    } catch (e) {
        console.error("فشل الاتصال بالخادم");
    }
}

function updateUI(data) {
    // 1. تحديث الطقس الحالي
    const current = data.list[0];
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('temp').innerText = `${Math.round(current.main.temp)}°`;
    document.getElementById('description').innerText = current.weather[0].description;
    document.getElementById('humidity').innerText = `${current.main.humidity}%`;
    document.getElementById('windSpeed').innerText = `${current.wind.speed} كم/س`;
    document.getElementById('weatherEmoji').innerText = weatherIcons[current.weather[0].main] || '🌡️';
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-EG', {weekday: 'long', day: 'numeric', month: 'long'});

    // 2. تحديث توقعات 5 أيام (إصلاح الفراغ)
    const dailyGrid = document.getElementById('dailyGrid');
    dailyGrid.innerHTML = '';
    
    // منطق جديد: نأخذ قراءة واحدة كل 8 قراءات (لأن API يعطي قراءة كل 3 ساعات)
    // 8 قراءات * 3 ساعات = 24 ساعة (يوم كامل)
    const forecastList = data.list;
    for (let i = 0; i < forecastList.length; i += 8) {
        const dayData = forecastList[i];
        const date = new Date(dayData.dt * 1000);
        
        // بناء كارت اليوم
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `
            <p style="font-weight:bold; margin-bottom:8px">${date.toLocaleDateString('ar-EG', {weekday: 'short'})}</p>
            <p style="font-size:30px; margin:5px 0">${weatherIcons[dayData.weather[0].main] || '☀️'}</p>
            <p style="font-size:18px"><b>${Math.round(dayData.main.temp)}°</b></p>
        `;
        dailyGrid.appendChild(dayCard);
        
        // نكتفي بـ 5 أيام فقط
        if (dailyGrid.children.length >= 5) break;
    }
}

// أزرار البحث والحذف والوضع
document.getElementById('searchBtn').onclick = () => {
    const val = document.getElementById('cityInput').value.trim();
    if(val) {
        getWeatherData(val);
        const div = document.createElement('div');
        div.className = 'city-card';
        div.innerHTML = `<span style="cursor:pointer" onclick="getWeatherData('${val}')">${val}</span>
                         <button style="color:red; border:none; background:none; cursor:pointer" onclick="this.parentElement.remove()">✕</button>`;
        document.getElementById('savedCities').appendChild(div);
        document.getElementById('cityInput').value = '';
    }
};

document.getElementById('themeToggle').onclick = () => {
    document.body.classList.toggle('light-mode');
};
