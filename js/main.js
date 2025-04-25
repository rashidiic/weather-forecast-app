const apiKey = '14f8eb0cc4416e46cc6e9097d51b8dd4';

const citySelect = document.getElementById('citySelect');
const button = document.getElementById('getForecastBtn');
const forecastContainer = document.getElementById('forecast');
const themeToggle = document.getElementById('themeToggle');
// const body = document.getElementById('body');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggle.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }

    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        citySelect.value = lastCity;
        const cachedForecast = localStorage.getItem(`forecast_${lastCity}`);
        if (cachedForecast) {
            displayForecast(JSON.parse(cachedForecast), lastCity);
        } else {
            getForecast(lastCity);
        }
    }
});

button.addEventListener('click', () => {
    const city = citySelect.value;
    localStorage.setItem('lastCity', city);
    getForecast(city);
});

function getForecast(city) {
    forecastContainer.innerHTML = `
  <div class="loader">
    <div class="spinner"></div>
  </div>
  `;

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},AZ&appid=${apiKey}&units=metric&lang=en`;

    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error('City not found or API error');
            }
            return res.json();
        })
        .then(data => {
            const filtered = data.list.filter(item => item.dt_txt.includes('12:00:00'));
            localStorage.setItem(`forecast_${city}`, JSON.stringify(filtered));
            displayForecast(filtered, city);
        })
        .catch(error => {
            const cached = localStorage.getItem(`forecast_${city}`);
            if (cached) {
                const cachedData = JSON.parse(cached);
                displayForecast(cachedData, city);
                forecastContainer.innerHTML += `<p style="color: orange;">Offline mode: showing saved forecast.</p>`;
            } else {
                forecastContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
            }
        });
}

function displayForecast(days, cityName) {
    forecastContainer.innerHTML = '';

    const cityHeader = document.createElement('h2');
    cityHeader.textContent = cityName;
    cityHeader.classList.add('city-name');
    forecastContainer.appendChild(cityHeader);

    const forecastWrapper = document.createElement('div'); // теперь это глобально
    forecastWrapper.className = "forecast-wrapper";
    forecastWrapper.style.display = 'flex';
    forecastWrapper.style.flexWrap = 'wrap';
    forecastWrapper.style.justifyContent = 'center';
    forecastWrapper.style.gap = '2rem';

    days.forEach(day => {
        const date = new Date(day.dt * 1000);
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.innerHTML = `
          <h4>${date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
          <img src="${icon}" alt="icon">
          <p>${description}</p>
          <p>Temperature: ${temp}°C</p>
        `;

        dayDiv.addEventListener("click", function () {
            openFullScreenForecast(day); 
        });

        forecastWrapper.appendChild(dayDiv);
    });

    forecastContainer.appendChild(forecastWrapper);

}

function openFullScreenForecast(day) {
    const fullscreenDiv = document.createElement('div');
    fullscreenDiv.className = 'fullscreen-forecast';

    fullscreenDiv.innerHTML = `
        <div class="fullscreen-content">
            <span class="close-btn">&times;</span>
            <h2>${new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="icon">
            <p><strong>Description:</strong> ${day.weather[0].description}</p>
            <p><strong>Temperature:</strong> ${Math.round(day.main.temp)}°C</p>
            <p><strong>Feels like:</strong> ${Math.round(day.main.feels_like)}°C</p>
            <p><strong>Humidity:</strong> ${day.main.humidity}%</p>
            <p><strong>Wind:</strong> ${day.wind.speed} m/s</p>
        </div>
    `;

    document.body.appendChild(fullscreenDiv);


    fullscreenDiv.querySelector('.close-btn').addEventListener('click', () => {
        fullscreenDiv.remove();
    });
}


function showModal(content) {
    const modal = document.createElement('div');
    modal.classList.add('fullscreen-forecast');

    modal.innerHTML = `
        <div class="fullscreen-content">
            <span class="close-btn">&times;</span>
            ${content}
        </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('lock-scroll');

    modal.querySelector('.close-btn').addEventListener('click', () => {
        modal.remove();
        document.body.classList.remove('lock-scroll');
    });
}
