document.getElementById('compare-button').addEventListener('click', compareWeather); // Add click event listener to the compare button

async function compareWeather() {
    const city1 = document.getElementById('city1').value; // value of the first city input
    const state1 = document.getElementById('state1').value; // value of the first state selection
    const unit1 = document.getElementById('unit1').value; // value of the unit selection
    const city2 = document.getElementById('city2').value; // value of the second city input
    const state2 = document.getElementById('state2').value; // value of the second state selection
    const errorMessage = document.getElementById('error-message'); // Get the error message element
    errorMessage.textContent = ''; // Clear any previous error message

    if (!city1 || !city2) { // Check if either city input is empty
        errorMessage.textContent = 'Both city names are required!'; // Display error message
        return; // Exit the function
    }

    try {
        const [lat1, lon1] = await getCoordinates(city1, state1); // Get coordinates of the first city
        const [lat2, lon2] = await getCoordinates(city2, state2); // Get coordinates of the second city

        const forecast1 = await fetchWeather(lat1, lon1, unit1); // Fetch weather data for the first city
        const forecast2 = await fetchWeather(lat2, lon2, unit1); // Fetch weather data for the second city
        const citycontainer = document.getElementById('city-title-container'); // Get the city title container element
        citycontainer.innerHTML = '';  // Clear previous content
        const container = document.getElementById('forecast-container'); // Get the forecast container element
        container.innerHTML = '';  // Clear previous content
        displayForecast(forecast1, city1, state1); // Display forecast for first city
        displayForecast(forecast2, city2, state2); // Display forecast for second city

    } catch (error) {
        errorMessage.textContent = 'Error fetching weather data, Please check the inputed city names and try again.'; // Display error message if fetching fails
    }
}

async function getCoordinates(city, state) {
    const apiKey = 'ad6023e8e98313694c7071bd07f273d4'; // OpenWeatherMap API key
    const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${apiKey}`); // Fetch coordinates from OpenWeatherMap
    const data = await response.json(); // Parse the response as JSON

    if (data.length === 0) { // Check if no data was returned
        throw new Error('Location not found'); // Throw an error
    }

    return [data[0].lat, data[0].lon]; // Return latitude and longitude
}

async function fetchWeather(lat, lon, units) {
    const apiKey = 'ad6023e8e98313694c7071bd07f273d4'; // OpenWeatherMap API key
    const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,hourly,alerts&appid=${apiKey}`); // Fetch weather data from OpenWeatherMap
    if (!response.ok) { // Check if the response is not OK
        throw new Error('Weather data not found'); // Throw an error
    }
    return response.json(); // Parse the response as JSON
}

function displayForecast(forecast, cityName, stateName) {
    const cityHeader = document.createElement('h2'); // Create an h2 element for city name
    const container = document.getElementById('forecast-container'); // Get forecast container element
    const citycontainer = document.getElementById('city-title-container'); // Get city title container element

    cityHeader.textContent = cityName + ' ' + stateName; // Set the text content of the h2 element
    citycontainer.appendChild(cityHeader); // Append the h2 element to the city title container

    const table = document.createElement('table'); // Create a table element
    const headerRow = document.createElement('tr'); // Create a table row for the header
    headerRow.innerHTML = `
        <th>Day</th>
        <th>High Temp</th>
        <th>Low Temp</th>
        <th>Outlook</th>
        <th>% of Rainfall</th>
    `; // Set the header row content
    table.appendChild(headerRow); // Append the header row to the table

    forecast.daily.slice(0, 5).forEach(day => { // Loop through the first 5 days of the forecast
        const row = document.createElement('tr'); // Create a table row
        const iconCode = day.weather[0].icon; // Get the weather icon code
        const iconUrl = `images/${iconCode}.png`; // Construct the URL for the weather icon
        const rainPercentage = day.pop * 100;  // Convert probability of precipitation to percentage

        row.innerHTML = `
            <td>${new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' })}</td> <!-- Day of the week -->
            <td>${day.temp.max}</td> <!-- High temperature -->
            <td>${day.temp.min}</td> <!-- Low temperature -->
            <td><img src="${iconUrl}" alt="${day.weather[0].description}"></td> <!-- Weather icon -->
            <td>${rainPercentage.toFixed(2)}%</td> <!-- Percentage of rainfall -->
        `; // Set the row content
        table.appendChild(row); // Append the row to the table
    });

    container.appendChild(table); // Append the table to the forecast container
}
