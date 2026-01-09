const apiKey = '319eb791872b393e9a40b2ea08eb2bc0';
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const themeToggle = document.getElementById('themeToggle');

// ايموجيات حالات الطقس
const weatherIcons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️'
};

// تحديد الموقع عند التشغيل
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            getWeatherData(pos.coords.latitude, pos.coords.longitude, true);
        });
    }
};

// دالة جلب البيانات
async function getWeatherData(query, lon = null, isCoords = false) {
    let url = isCoords 
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${query}&lon=${lon}&appid=${apiKey}&units=metric&lang=ar`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${apiKey}&units=metric&lang=ar`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        alert("فشل جلب البيانات، تأكد من اسم المدينة أو المفتاح.");
    }
}

function updateUI(data) {
    const current = data.list[0];
    document.getElementById('cityName').innerText = data.city.name;
    document.getElementById('temp').innerText = `${Math.round(current.main.temp)}°`;
    document.getElementById('description').innerText = current.weather[0].description;
    document.getElementById('humidity').innerText = `${current.main.humidity}%`;
    document.getElementById('windSpeed').innerText = `${current.wind.speed} كم/س`;
    document.getElementById('weatherEmoji').innerText = weatherIcons[current.weather[0].main] || '☀️';
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-EG', {weekday: 'long', day: 'numeric', month: 'long'});

    // تحديث الساعات
    const hourlyList = document.getElementById('hourlyList');
    hourlyList.innerHTML = '';
    data.list.slice(0, 8).forEach(hour => {
        hourlyList.innerHTML += `
            <div class="hour-item">
                <p>${new Date(hour.dt * 1000).getHours()}:00</p>
                <p style="font-size:24px">${weatherIcons[hour.weather[0].main] || '☀️'}</p>
                <p><b>${Math.round(hour.main.temp)}°</b></p>
            </div>
        `;
    });

    // تحديث 5 أيام (يأخذ قراءة واحدة من كل يوم)
    const dailyGrid = document.getElementById('dailyGrid');
    dailyGrid.innerHTML = '';
    for (let i = 0; i < data.list.length; i += 8) {
        const day = data.list[i];
        dailyGrid.innerHTML += `
            <div class="day-card">
                <p>${new Date(day.dt * 1000).toLocaleDateString('ar-EG', {weekday: 'short'})}</p>
                <p style="font-size:30px">${weatherIcons[day.weather[0].main] || '☀️'}</p>
                <p><b>${Math.round(day.main.temp)}°</b></p>
            </div>
        `;
    }
}

// إضافة مدينة للقائمة
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if(city) {
        getWeatherData(city);
        addCityToSidebar(city);
    }
});

function addCityToSidebar(city) {
    const container = document.getElementById('savedCities');
    const div = document.createElement('div');
    div.className = 'city-card';
    div.innerHTML = `<span>${city}</span> <i class="fas fa-chevron-left"></i>`;
    div.onclick = () => getWeatherData(city);
    container.appendChild(div);
}

// تغيير الوضع (داكن/فاتح)
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const icon = themeToggle.querySelector('i');
    if(document.body.classList.contains('light-mode')) {
        icon.className = 'fas fa-sun';
        themeToggle.querySelector('span').innerText = "الوضع الفاتح";
    } else {
        icon.className = 'fas fa-moon';
        themeToggle.querySelector('span').innerText = "الوضع الليلي";
    }
});
