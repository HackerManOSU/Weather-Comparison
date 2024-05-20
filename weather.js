document.getElementById('compareBtn').addEventListener('click', compareWeather);

async function compareWeather() {
    const city1 = document.getElementById('city1').value;
    const state1 = document.getElementById('state1').value;
    const unit1 = document.getElementById('unit1').value;
    const city2 = document.getElementById('city2').value;
    const state2 = document.getElementById('state2').value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';

    if (!city1 || !city2) {
        errorMessage.textContent = 'Both city names are required!';
        return;
    }

    try {
        const [lat1, lon1] = await getCoordinates(city1, state1);
        const [lat2, lon2] = await getCoordinates(city2, state2);

        const forecast1 = await fetchWeather(lat1, lon1, unit1);
        const forecast2 = await fetchWeather(lat2, lon2, unit1);
        const citycontainer = document.getElementById('city-title-container');
        citycontainer.innerHTML = '';  // Clear previous content
        const container = document.getElementById('forecast-container');
        container.innerHTML = '';  // Clear previous content
        displayForecast(forecast1, city1);
        displayForecast(forecast2, city2);
        
    } catch (error) {
        errorMessage.textContent = 'Error fetching weather data. Please check the city names and try again.';
    }
}

async function getCoordinates(city, state) {
    const apiKey = 'ad6023e8e98313694c7071bd07f273d4';
    const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${apiKey}`);
    const data = await response.json();

    if (data.length === 0) {
        throw new Error('Location not found');
    }

    return [data[0].lat, data[0].lon];
}

async function fetchWeather(lat, lon, units) {
    const apiKey = 'ad6023e8e98313694c7071bd07f273d4';
    const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,hourly,alerts&appid=${apiKey}`);
    if (!response.ok) {
        throw new Error('Weather data not found');
    }
    return response.json();
}

function displayForecast(forecast, cityName) {
    const cityHeader = document.createElement('h2');
    const container = document.getElementById('forecast-container');
    const citycontainer = document.getElementById('city-title-container');

    
    cityHeader.textContent = cityName+':';
    citycontainer.appendChild(cityHeader);

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Day</th>
        <th>High Temp</th>
        <th>Low Temp</th>
        <th>Outlook</th>
        <th>Rainfall %</th>
    `;
    table.appendChild(headerRow);

    forecast.daily.slice(0, 5).forEach(day => {
        const row = document.createElement('tr');
        const iconCode = day.weather[0].icon;
        const iconUrl = `photos/${iconCode}.png`;
        const rainPercentage = day.pop * 100;  // Convert probability of precipitation to percentage

        row.innerHTML = `
            <td>${new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' })}</td>
            <td>${day.temp.max}</td>
            <td>${day.temp.min}</td>
            <td><img src="${iconUrl}" alt="${day.weather[0].description}"></td>
            <td>${rainPercentage.toFixed(2)}%</td>
        `;
        table.appendChild(row);
    });

    container.appendChild(table);
}