const apiKey = "319eb791872b393e9a40b2ea08eb2bc0";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiKey = 'ضع_مفتاحك_هنا'; 
const weatherIcons = { 'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️', 'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️' };

// مصفوفة لتخزين المدن
let savedCities = JSON.parse(localStorage.getItem('weatherCities')) || [];

window.onload = () => {
    // تحميل المدن المحفوظة مسبقاً
    renderSavedCities();
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => getWeatherData(p.coords.latitude, p.coords.longitude, true), 
        () => getWeatherData('Baghdad'));
    }
};

async function getWeatherData(q, lon = null, isCoords = false) {
    // إظهار مؤشر بسيط (يمكنك إضافة عنصر loader في HTML)
    document.getElementById('cityName').innerText = "جاري التحميل...";
    
    let url = isCoords 
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${q}&lon=${lon}&appid=${apiKey}&units=metric&lang=ar`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${q}&appid=${apiKey}&units=metric&lang=ar`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if(data.cod === "200") {
            updateUI(data);
        } else {
            document.getElementById('cityName').innerText = "مدينة غير معروفة";
        }
    } catch (e) {
        document.getElementById('cityName').innerText = "خطأ في الاتصال";
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
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-EG', {weekday: 'long', day: 'numeric', month: 'long'});

    const dailyGrid = document.getElementById('dailyGrid');
    dailyGrid.innerHTML = '';
    
    for(let i = 0; i < 40; i += 8) {
        if(!data.list[i]) break;
        const dayData = data.list[i];
        const date = new Date(dayData.dt * 1000);
        dailyGrid.innerHTML += `
            <div class="day-card">
                <p style="font-weight:bold; color:var(--accent-color)">${date.toLocaleDateString('ar-EG', {weekday: 'short'})}</p>
                <p style="font-size:35px; margin:10px 0">${weatherIcons[dayData.weather[0].main] || '☀️'}</p>
                <p><b>${Math.round(dayData.main.temp)}°</b></p>
            </div>`;
    }
}

// دالة البحث وحفظ المدينة
document.getElementById('searchBtn').onclick = () => {
    const val = document.getElementById('cityInput').value.trim();
    if(val && !savedCities.includes(val)) {
        getWeatherData(val);
        savedCities.push(val);
        localStorage.setItem('weatherCities', JSON.stringify(savedCities));
        renderSavedCities();
        document.getElementById('cityInput').value = '';
    }
};

// دالة عرض المدن من الذاكرة
function renderSavedCities() {
    const container = document.getElementById('savedCities');
    container.innerHTML = '';
    savedCities.forEach((city, index) => {
        const div = document.createElement('div');
        div.className = 'city-card';
        div.innerHTML = `
            <span onclick="getWeatherData('${city}')">${city}</span>
            <button class="delete-btn" onclick="removeCity(${index})">
                <i class="fas fa-trash"></i>
            </button>`;
        container.appendChild(div);
    });
}

function removeCity(index) {
    savedCities.splice(index, 1);
    localStorage.setItem('weatherCities', JSON.stringify(savedCities));
    renderSavedCities();
}

// تغيير الثيم (مع الحفظ في الذاكرة أيضاً)
document.getElementById('themeToggle').onclick = () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    const icon = document.querySelector('#themeToggle i');
    icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
};

// استرجاع الثيم المفضل عند الفتح
if(localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
}
