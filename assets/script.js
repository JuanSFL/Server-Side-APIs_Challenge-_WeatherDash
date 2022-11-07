var APIkey = "46cd90b85dedebbff86728e5a1257082";

var cityInputEl = $('#city-input');
var searchBtn = $('#search-button');
var clearBtn = $('#clear-button');
var pastSearchedCitiesEl = $('#past-searches');
console.log(cityInputEl);


var currentCity;

function get5DayWeather(data) {
  // 5 day forecast API
  var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${APIkey}`
  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })

    .then(function (data) {
      console.log(data)
      var currentWeatherEl = $('#currentConditions')
      currentWeatherEl.addClass('border border-dark')

      // displays city name.
      var cityNameEl = $('<h2>')
      cityNameEl.text(currentCity)
      currentWeatherEl.append(cityNameEl)

      // current weather
      var currentCityDate;
      currentCityDate = moment().format("MM/DD/YYYY");
      var currentDateEl = $('<span>');
      currentDateEl.text(` (${currentCityDate}) `);
      cityNameEl.append(currentDateEl);

      // current weather icon
      var currentCityWeatherIcon = data.current.weather[0].icon;
      var currentWeatherIconEl = $('<img>');
      currentWeatherIconEl.attr("src", "http://openweathermap.org/img/wn/" + currentCityWeatherIcon + ".png");
      cityNameEl.append(currentWeatherIconEl);

      // current temperature
      var currentCityTemp = data.current.temp;
      var currentTempEl = $('<p>')
      currentTempEl.text(`Temp: ${currentCityTemp}°F`)
      currentWeatherEl.append(currentTempEl);

      // current wind speed 
      var currentCityWind = data.current.wind_speed;
      var currentWindEl = $('<p>')
      currentWindEl.text(`Wind: ${currentCityWind} MPH`)
      currentWeatherEl.append(currentWindEl);

      // current humidity
      var currentCityHumidity = data.current.humidity;
      var currentHumidityEl = $('<p>')
      currentHumidityEl.text(`Humidity: ${currentCityHumidity}%`)
      currentWeatherEl.append(currentHumidityEl);

      // get current UV index, set background color based on level and display
      var currentCityUV = data.current.uvi;
      var currentUvEl = $('<p>');
      var currentUvSpanEl = $('<span>');
      currentUvEl.append(currentUvSpanEl);

      currentUvSpanEl.text(`UV: ${currentCityUV}`)

      if (currentCityUV < 3) {
        currentUvSpanEl.css({ 'background-color': 'green', 'color': 'white' });
      } else if (currentCityUV < 6) {
        currentUvSpanEl.css({ 'background-color': 'yellow', 'color': 'black' });
      } else if (currentCityUV < 8) {
        currentUvSpanEl.css({ 'background-color': 'orange', 'color': 'white' });
      } else if (currentCityUV < 11) {
        currentUvSpanEl.css({ 'background-color': 'red', 'color': 'white' });
      } else {
        currentUvSpanEl.css({ 'background-color': 'violet', 'color': 'white' });
      }

      currentWeatherEl.append(currentUvEl);

    })
  return
}

// ONE CALL API
function getCoordinates(cityname) {
  // find ONE CALL api with ?q=${cityname}&appid=${APIkey}
  var requestUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${APIkey}`
  var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

  fetch(requestUrl)
    .then(function (response) {
      if (response.status >= 200 && response.status <= 299) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(function (data) {
      console.log(data)
      // check how data is return to see how to navigate to desired location.
      var cityInfo = {
        city: currentCity,
        lon: data.city.coord.lon,
        lat: data.city.coord.lat
      }

      storedCities.push(cityInfo);
      localStorage.setItem("cities", JSON.stringify(storedCities));

      displaySearchHistory();
      get5DayWeather(cityInfo)
    })
}
// will display previous cities as buttons
function displaySearchHistory() {
  var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
  var pastSearchesEl = document.getElementById('past-searches');

  pastSearchesEl.innerHTML = '';

  for (i = 0; i < storedCities.length; i++) {

    var pastCityBtn = document.createElement("button");
    pastCityBtn.classList.add("btn", "btn-danger", "my-2", "past-city");
    pastCityBtn.setAttribute("style", "width: 100%");
    pastCityBtn.textContent = `${storedCities[i].city}`;
    pastSearchesEl.appendChild(pastCityBtn);
  }
  return;
}

// When user clicks on city button that was previously searched, the weather will be updated and displayed on the page
function getPastCity(event) {
  var element = event.target;

  if (element.matches(".past-city")) {
    currentCity = element.textContent;

    clearCurrentCityWeather();

    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${APIkey}`;

    fetch(requestUrl)
      .then(function (response) {
        if (response.status >= 200 && response.status <= 299) {
          return response.json();
        } else {
          throw Error(response.statusText);
        }
      })
      .then(function (data) {
        var cityInfo = {
          city: currentCity,
          lon: data.coord.lon,
          lat: data.coord.lat
        }
        return cityInfo;
      })
      .then(function (data) {
        get5DayWeather(data);
      })
  }
  return;
}
// clears the curreent city weather to allow room for a new result.
function clearCurrentCityWeather() {
  currentConditionsEl = document.getElementById("currentConditions");
  currentConditionsEl.innerHTML = '';
  return;
}
// searches the weather for a given city, and clears the current city weather if there is any.
function handleCityFormSubmit(event) {
  event.preventDefault();
  currentCity = cityInputEl.val().trim();
  //clear currenct city weather
  clearCurrentCityWeather();
  getCoordinates(currentCity);
  return;
}

// clears the search history.
function handleClearHistory(event) {
  event.preventDefault();
  var pastSearchesEl = document.getElementById('past-searches');
  localStorage.removeItem("cities");
  pastSearchesEl.innerHTML = '';
  return;
}

displaySearchHistory();
// buttons

searchBtn.on("click", handleCityFormSubmit);

clearBtn.on("click", handleClearHistory);

pastSearchedCitiesEl.on("click", getPastCity);

