const apiKey = "319eb791872b393e9a40b2ea08eb2bc0";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const weatherIcons = { 'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️', 'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️' };

window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => getWeatherData(p.coords.latitude, p.coords.longitude, true));
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
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('temp').innerText = `${Math.round(current.main.temp)}°`;
    document.getElementById('description').innerText = current.weather[0].description;
    document.getElementById('humidity').innerText = `${current.main.humidity}%`;
    document.getElementById('windSpeed').innerText = `${current.wind.speed} كم/س`;
    document.getElementById('weatherEmoji').innerText = weatherIcons[current.weather[0].main] || '🌡️';
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-EG', {weekday:'long', day:'numeric', month:'long'});

    // --- عرض 4 ساعات قادمة فقط بدون تكرار ---
    const hourlyList = document.getElementById('hourlyList');
    hourlyList.innerHTML = '';
    
    // نأخذ القراءات الـ 4 القادمة فقط
    data.list.slice(1, 5).forEach(item => {
        const time = new Date(item.dt * 1000).getHours() + ":00";
        hourlyList.innerHTML += `
            <div class="hour-item">
                <p>${time}</p>
                <p style="font-size:25px">${weatherIcons[item.weather[0].main] || '☀️'}</p>
                <p><b>${Math.round(item.main.temp)}°</b></p>
            </div>`;
    });

    // --- توقعات 5 أيام ---
    const dailyGrid = document.getElementById('dailyGrid');
    dailyGrid.innerHTML = '';
    const days = data.list.filter(f => f.dt_txt.includes("12:00:00")).slice(0, 5);
    days.forEach(day => {
        dailyGrid.innerHTML += `
            <div class="day-card">
                <p>${new Date(day.dt * 1000).toLocaleDateString('ar-EG', {weekday: 'short'})}</p>
                <p style="font-size:30px">${weatherIcons[day.weather[0].main] || '☀️'}</p>
                <p><b>${Math.round(day.main.temp)}°</b></p>
            </div>`;
    });
}

document.getElementById('searchBtn').onclick = () => {
    const val = document.getElementById('cityInput').value;
    if(val) {
        getWeatherData(val);
        const div = document.createElement('div');
        div.className = 'city-card';
        div.innerHTML = `<span onclick="getWeatherData('${val}')">${val}</span>
                         <button class="delete-btn" onclick="this.parentElement.remove()"><i class="fas fa-trash"></i></button>`;
        document.getElementById('savedCities').appendChild(div);
        document.getElementById('cityInput').value = '';
    }
};

document.getElementById('themeToggle').onclick = () => {
    document.body.classList.toggle('light-mode');
};
