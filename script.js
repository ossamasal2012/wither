const apiKey = "319eb791872b393e9a40b2ea08eb2bc0";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const themeToggle = document.getElementById('themeToggle');

const weatherIcons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '💨',
    'Haze': '🌫️'
};

window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            getWeatherData(pos.coords.latitude, pos.coords.longitude, true);
        }, () => getWeatherData('Baghdad')); 
    }
};

async function getWeatherData(query, lon = null, isCoords = false) {
    let url = isCoords 
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${query}&lon=${lon}&appid=${apiKey}&units=metric&lang=ar`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${apiKey}&units=metric&lang=ar`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if(data.cod !== "200") throw new Error();
        updateUI(data);
    } catch (error) {
        console.error("Error fetching data:", error);
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
    
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-EG', options);

    // --- الحل الجذري لمشكلة تسلسل الساعات ---
    const hourlyList = document.getElementById('hourlyList');
    hourlyList.innerHTML = '';
    
    // 1. نأخذ أول 12 قراءة (تغطي 36 ساعة قادمة)
    // 2. نتأكد من ترتيبها حسب الوقت الفعلي (dt) لضمان عدم التكرار أو التداخل
    const hourlyData = data.list.slice(0, 12).sort((a, b) => a.dt - b.dt);
    
    hourlyData.forEach(hour => {
        const dateObj = new Date(hour.dt * 1000);
        const hourTime = dateObj.getHours().toString().padStart(2, '0') + ":00";
        
        // إضافة "غداً" إذا انتقل الوقت ليوم جديد لكي لا يختلط الأمر على المستخدم
        const isNextDay = dateObj.getDate() !== new Date().getDate();
        const dayLabel = isNextDay ? '<small style="display:block; font-size:10px; color:var(--accent-color)">غداً</small>' : '';

        hourlyList.innerHTML += `
            <div class="hour-item">
                <p>${hourTime}${dayLabel}</p>
                <p style="font-size:30px">${weatherIcons[hour.weather[0].main] || '☀️'}</p>
                <p><b>${Math.round(hour.main.temp)}°</b></p>
            </div>
        `;
    });

    // --- توقعات 5 أيام (بدقة أكبر) ---
    const dailyGrid = document.getElementById('dailyGrid');
    dailyGrid.innerHTML = '';
    
    // تصفية البيانات لأخذ قراءة واحدة فقط من منتصف كل يوم (ساعة 12:00 مثلاً)
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach(day => {
        dailyGrid.innerHTML += `
            <div class="day-card">
                <p>${new Date(day.dt * 1000).toLocaleDateString('ar-EG', {weekday: 'short'})}</p>
                <p style="font-size:35px">${weatherIcons[day.weather[0].main] || '☀️'}</p>
                <p><b>${Math.round(day.main.temp)}°</b></p>
            </div>
        `;
    });
}

// دالة إضافة المدينة للقائمة
function addCityToSidebar(city) {
    const container = document.getElementById('savedCities');
    const existing = [...container.querySelectorAll('.city-n')].map(el => el.innerText.toLowerCase());
    
    if (existing.includes(city.toLowerCase())) return;

    const div = document.createElement('div');
    div.className = 'city-card';
    div.innerHTML = `
        <div style="flex-grow:1" onclick="getWeatherData('${city}')">
            <span class="city-n">${city}</span>
        </div>
        <button class="delete-city" onclick="removeCity(this, event)">
            <i class="fas fa-trash-alt"></i>
        </button>
    `;
    container.appendChild(div);
}

function removeCity(btn, e) {
    e.stopPropagation(); 
    const card = btn.parentElement;
    card.style.opacity = '0';
    card.style.transform = 'scale(0.8)';
    setTimeout(() => card.remove(), 300);
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if(city) {
        getWeatherData(city);
        addCityToSidebar(city);
        cityInput.value = '';
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const icon = themeToggle.querySelector('i');
    const isLight = document.body.classList.contains('light-mode');
    icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    themeToggle.querySelector('span').innerText = isLight ? 'الوضع الفاتح' : 'الوضع الليلي';
});
