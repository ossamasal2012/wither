const apiKey = "319eb791872b393e9a40b2ea08eb2bc0";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.getElementById("weather-icon");

async function checkWeather(city) {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    var data = await response.json();

    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°م";
    document.querySelector(".humidity").innerHTML = data.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " كم/س";

    // منطق الإيموجيات المتطور
    const main = data.weather[0].main;
    const hours = new Date().getHours();
    const isNight = hours > 18 || hours < 6;

    if (main == "Clouds") {
        weatherIcon.innerHTML = "☁️";
    } else if (main == "Clear") {
        weatherIcon.innerHTML = isNight ? "🌙" : "☀️";
    } else if (main == "Rain") {
        weatherIcon.innerHTML = "🌧️";
    } else if (main == "Drizzle") {
        weatherIcon.innerHTML = "🌦️";
    } else if (main == "Mist") {
        weatherIcon.innerHTML = "🌫️";
    }

    // تغيير الخلفية حسب الوقت
    document.body.style.background = isNight 
        ? "linear-gradient(135deg, #2c3e50, #000000)" 
        : "linear-gradient(135deg, #00feba, #5b548a)";
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});
