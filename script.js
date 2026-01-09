const apiKey = "319eb791872b393e9a40b2ea08eb2bc0";
let currentLang = 'ar';

const translations = {
    ar: { humidity: "الرطوبة", wind: "الرياح", placeholder: "ابحث عن مدينة...", loading: "جاري التحميل..." },
    en: { humidity: "Humidity", wind: "Wind Speed", placeholder: "Search city...", loading: "Loading..." }
};

// دالة تغيير اللغة
function changeLang(lang) {
    currentLang = lang;
    const htmlTag = document.getElementById("html-tag");
    htmlTag.dir = lang === 'ar' ? 'rtl' : 'ltr';
    htmlTag.lang = lang;
    
    document.getElementById("city-input").placeholder = translations[lang].placeholder;
    document.getElementById("hum-text").innerText = translations[lang].humidity;
    document.getElementById("wind-text").innerText = translations[lang].wind;
}

async function checkWeather(city = "", lat = null, lon = null) {
    let url = `https://api.openweathermap.org/data/2.5/weather?units=metric&lang=${currentLang}&appid=${apiKey}`;
    
    if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
    else url += `&q=${city}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === "404") {
            alert(currentLang === 'ar' ? "المدينة غير موجودة" : "City not found");
            return;
        }

        // حل مشكلة الـ undefined: التأكد من وجود البيانات قبل عرضها
        document.querySelector(".city").innerText = data.name;
        document.querySelector(".temp").innerText = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerText = data.main.humidity + "%"; // التأكد من المسار الصحيح
        document.querySelector(".wind").innerText = data.wind.speed + " km/h";
        document.querySelector(".description").innerText = data.weather[0].description;

        updateTheme(data.weather[0].main);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function updateTheme(condition) {
    const iconDiv = document.getElementById("weather-icon");
    const hour = new Date().getHours();
    const isNight = hour > 18 || hour < 6;

    const icons = {
        Clear: isNight ? "🌙" : "☀️",
        Clouds: "☁️",
        Rain: "🌧️",
        Drizzle: "🌦️",
        Mist: "🌫️",
        Snow: "❄️"
    };

    iconDiv.innerText = icons[condition] || "🌡️";
    document.body.style.background = isNight 
        ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)" 
        : "linear-gradient(135deg, #4facfe, #00f2fe)";
}

// تشغيل الموقع التلقائي
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (p) => checkWeather("", p.coords.latitude, p.coords.longitude),
            () => checkWeather("Riyadh")
        );
    }
};

document.getElementById("search-btn").addEventListener("click", () => {
    checkWeather(document.getElementById("city-input").value);
});
