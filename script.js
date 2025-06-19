const apiKey = "3eab15326a8f8e4e3f5fbe010a553750";
const geoKey = "edbdc08360e7414a91f11c5ff3f3418e";

// Fetch weather data
async function fetchWeatherData({ city = null, lat = null, lon = null, displayName = null }) {
  let weatherUrl, forecastUrl;

  if (city) {
    weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  } else if (lat && lon) {
    weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  } else {
    console.error("City or coordinates are required.");
    return;
  }

  try {
    const [weatherRes, forecastRes] = await Promise.all([fetch(weatherUrl), fetch(forecastUrl)]);

    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.statusText}`);
    }
    if (!forecastRes.ok) {
      throw new Error(`Forecast API error: ${forecastRes.statusText}`);
    }

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    if (!weatherData.weather || !weatherData.weather.length) {
      throw new Error("Invalid weather data received.");
    }

    const condition = weatherData.weather[0].main.toLowerCase();
    const icon = weatherData.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const localTime = new Date((weatherData.dt + weatherData.timezone) * 1000)
      .toLocaleString("en-IN", { timeZone: "UTC" });

    setBackground(condition, icon);

    document.getElementById("weatherInfo").innerHTML = `
      <h3>${displayName || weatherData.name}, ${weatherData.sys.country}</h3>
      <img src="${iconUrl}" alt="${weatherData.weather[0].description}" />
      <p><strong>${weatherData.weather[0].description}</strong></p>
      <p>Temperature: ${weatherData.main.temp}°C</p>
      <p>Humidity: ${weatherData.main.humidity}%</p>
      <p>Wind: ${weatherData.wind.speed} m/s</p>
      <p>Local Time: ${localTime}</p>
    `;

    const forecastHtml = forecastData.list
      .filter((_, i) => i % 8 === 0)
      .map(item => {
        const date = new Date(item.dt * 1000).toDateString();
        const icon = item.weather[0].icon;
        return `
          <div class="forecast-item">
            <h4>${date}</h4>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
            <p>${item.weather[0].main}</p>
            <p>Temp: ${item.main.temp}°C</p>
          </div>
        `;
      })
      .join("");

    document.getElementById("forecast").innerHTML = `
      <h3>5-Day Forecast</h3>
      <div class="forecast">${forecastHtml}</div>
    `;
  } catch (error) {
    console.error("Weather fetch error:", error);
    document.getElementById("weatherInfo").innerHTML = `<p>Error fetching weather: ${error.message}</p>`;
    document.getElementById("forecast").innerHTML = "";
  }
}

// City name search
function getWeather() {
  const city = document.getElementById("city").value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }
  fetchWeatherData({ city });
}

// Geolocation weather
function getWeatherByLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude: lat, longitude: lon } = position.coords;
    let displayName = "Your Location";

    try {
      const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${geoKey}`);
      const geoData = await geoRes.json();
      const components = geoData.results[0]?.components;
      displayName = components?.city || components?.town || components?.village || components?.state || "Your Location";
    } catch (err) {
      console.warn("Failed to fetch location name:", err);
    }

    fetchWeatherData({ lat, lon, displayName });
  }, () => {
    alert("Geolocation permission denied.");
  });
}

// Background image logic
function setBackground(condition, icon) {
  const isNight = icon.includes("n");

  const images = {
    night: {
      clear: 'https://img.freepik.com/free-vector/beautiful-night-sky-starry-banner-stunning-display-universe_1017-50560.jpg',
      clouds: 'https://static.vecteezy.com/system/resources/thumbnails/008/964/358/small_2x/8k-night-stars-in-cloudy-blue-sky-video.jpg',
      rain: 'https://i.ytimg.com/vi/6FAoy-P1GJA/hqdefault.jpg',
      drizzle: 'https://www.shutterstock.com/shutterstock/videos/3576285633/thumb/1.jpg',
      thunderstorm: 'https://media.istockphoto.com/id/517643357/photo/thunderstorm-lightning-with-dark-cloudy-sky.jpg?s=612x612&w=0&k=20&c=x3G3UijRPVGFMFExnlYGbnQtnlH6-oUoMU48BTkc0Os=',
      snow: 'https://media.istockphoto.com/id/1066432482/photo/falling-snow-on-black-background-winter-background-in-pure-dark-heavy-snow.jpg?s=612x612&w=0&k=20&c=T2HdYviPxIaUrHsHr9x2xQ54AAIzpNbRCLFFF8l6FcY=',
      fog: 'https://cdn.mos.cms.futurecdn.net/x86vuR5DEJ6FqZpUJWgZpd.jpg'
    },
    day: {
      clear: 'https://media.istockphoto.com/id/1188520316/photo/landscape-of-the-clear-sky.jpg?s=612x612&w=0&k=20&c=Vnk6XNgITN9AkTk7KMSdYZG7Olk4rAIvJNpm_nCM7t0=',
      clouds: 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg',
      rain: 'https://t3.ftcdn.net/jpg/09/11/41/68/360_F_911416885_C4V4dpl6jNkX8yCesYs8gEcmeJN7Adqx.jpg',
      drizzle: 'https://www.collinsdictionary.com/images/full/drizzle_223387984.jpg',
      thunderstorm: 'https://media.istockphoto.com/id/517643357/photo/thunderstorm-lightning-with-dark-cloudy-sky.jpg?s=612x612&w=0&k=20&c=x3G3UijRPVGFMFExnlYGbnQtnlH6-oUoMU48BTkc0Os=',
      snow: 'https://static.vecteezy.com/system/resources/previews/000/641/300/non_2x/christmas-landscape-with-snow-caps-and-falling-snowfall-vector-illustration.jpg',
      mist: 'https://images.unsplash.com/photo-1542826522-beb53da5f648',
      haze: 'https://images.unsplash.com/photo-1533757704860-384affeed946',
      fog: 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227'
    }
  };

  const group = isNight ? images.night : images.day;
  document.body.style.backgroundImage = `url('${group[condition] || 'https://source.unsplash.com/1600x900/?weather,nature'}')`;
}
