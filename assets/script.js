// Api Key from openweathermap.org/
var APIkey = "46cd90b85dedebbff86728e5a1257082";

// city name provided by users
var cityInputEl = $('#cityInput');

//buttons
var searchBtn = $('#searchBtn');
var clearBtn = $('#clearBtn');
var pastCityBtn = $('#previous-searches');
console.log(cityInputEl);

//displays current date and time upon opening the app
var todayDate = moment().format('dddd, MMM Do YYYY LTS ');
$("#currentDay").html(todayDate);
var clockTick = setInterval( () => {
    currentDay.innerHTML = moment().format(" dddd, MMM Do YYYY LTS ")} )

var currentCity;


function get5DayWeather(data) {
  // 5 day forecast API
  var apiURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&units=imperial&appid=${APIkey}`
  fetch(apiURL)
    .then(function (response) {
      return response.json();
    })
    // creates current weather container
    .then(function (data) {
      console.log(data)
      var currentWeatherEl = $('#currentWeather')
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
      var weatherIcon = data.current.weather[0].icon;
      var weatherIconEl = $('<img>');
      weatherIconEl.attr("src", "http://openweathermap.org/img/wn/" + weatherIcon + ".png");
      cityNameEl.append(weatherIconEl);

      // get current UV index, and set background color based on level
      var uvIndex = data.current.uvi;
      var uvIndexEl = $('<h4>');
      var uvIndexSpan = $('<span>');
      uvIndexEl.append(uvIndexSpan);

      uvIndexSpan.text(`UV: ${uvIndex}`)
      // UV index colors
      if (uvIndex < 3) {
        uvIndexSpan.css({ 'background-color': 'green', 'color': 'white' });
      } else if (uvIndex < 6) {
        uvIndexSpan.css({ 'background-color': 'yellow', 'color': 'black' });
      } else if (uvIndex < 8) {
        uvIndexSpan.css({ 'background-color': 'orange', 'color': 'white' });
      } else if (uvIndex < 11) {
        uvIndexSpan.css({ 'background-color': 'red', 'color': 'white' });
      } else {
        uvIndexSpan.css({ 'background-color': 'violet', 'color': 'white' });
      }
      currentWeatherEl.append(uvIndexEl);
            
      // current temperature
      var currentCityTemp = data.current.temp;
      var currentTempEl = $('<p>')
      currentTempEl.text(`Temp: ${currentCityTemp}°F`)
      currentWeatherEl.append(currentTempEl);

      // current wind speed 
      var windSpeed = data.current.wind_speed;
      var windSpeedEl = $('<p>')
      windSpeedEl.text(`Wind: ${windSpeed} MPH`)
      currentWeatherEl.append(windSpeedEl);

      // current humidity
      var currentHumidity = data.current.humidity;
      var currentHumidityEl = $('<p>')
      currentHumidityEl.text(`Humidity: ${currentHumidity}%`)
      currentWeatherEl.append(currentHumidityEl);

      // 5 day forecast
      var forecastHeaderEl = $('#forecastHeader');
      var fiveDayHeaderEl = $('<h2>');
      fiveDayHeaderEl.text('5 Day Forecast:');
      forecastHeaderEl.append(fiveDayHeaderEl);

      var fiveDayForecastEl = $('#fiveDayForecast');

      // get weather info from five day forecast API and display
      for (var i = 1; i <= 5; i++) {
        var date;
        var temp;
        var icon;
        var wind;
        var humidity;

        date = data.daily[i].dt;
        date = moment.unix(date).format("MM/DD/YYYY");

        temp = data.daily[i].temp.day;
        icon = data.daily[i].weather[0].icon;
        wind = "Wind Speed: " + data.daily[i].wind_speed;
        humidity = "Humidity: " + data.daily[i].humidity;

        //creates a card for the next five days.
        var card = document.createElement('div');
        card.classList.add('card', 'row', 'm-2', 'border-dark');

        // defines card elements and append it to the card.
        var cardEl = document.createElement('section');
        cardEl.classList.add('card-body');
        cardEl.innerHTML = `<h4>${date}</h4>
         <img src= "http://openweathermap.org/img/wn/${icon}.png"> </>
         <br>
        ${temp}°F<br>
        ${wind} MPH <br>
        ${humidity}%`

        card.appendChild(cardEl);
        fiveDayForecastEl.append(card);
      }
    })
  return;
}


// ONE CALL API
function getCoordinates(cityname) {
  // find ONE CALL api with ?q=${cityname}&appid=${APIkey}
  var apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${APIkey}`
  var storedSearches = JSON.parse(localStorage.getItem("cities")) || [];

  fetch(apiURL)
    .then(function (response) {
      if (response.status == 200) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(function (data) {
      console.log(data)
      // locate the city using longitude and latitude
      var cityInfo = {
        city: currentCity,
        lon: data.city.coord.lon,
        lat: data.city.coord.lat
      }
      
      storedSearches.push(cityInfo);
      localStorage.setItem("cities", JSON.stringify(storedSearches));

      displayHistory();
      get5DayWeather(cityInfo)
    })
}
// displays search history using local storage and set as buttons 
function displayHistory() {
  var storedSearches = JSON.parse(localStorage.getItem("cities")) || [];
  var previousSearchesEl = document.getElementById('previous-searches');

  previousSearchesEl.innerHTML = '';

  for (i = 0; i < storedSearches.length; i++) {

    var pastCityBtn = document.createElement("button");
    pastCityBtn.classList.add("btn", "btn-danger", "my-2", "past-city");
    pastCityBtn.setAttribute("style", "width: 100%");
    pastCityBtn.textContent = `${storedSearches[i].city}`;
    previousSearchesEl.appendChild(pastCityBtn);
  }
  return;
}

// When user clicks on city button that was previously searched, the weather will be updated and displayed on the page
function getPastCity(event) {
  var element = event.target;

  if (element.matches(".past-city")) {
    currentCity = element.textContent;

    clearCurrentCity();

    var apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${APIkey}`;

    fetch(apiURL)
      .then(function (response) {
        if (response.status == 200) {
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

// clears the current city weather to allow room for a new result.
function clearCurrentCity() {
  currentWeatherEl = document.getElementById("currentWeather");
  currentWeatherEl.innerHTML = '';

  var forecastHeaderEl = document.getElementById("forecastHeader");
  forecastHeaderEl.innerHTML = '';

  var fiveDayForecastEl = document.getElementById("fiveDayForecast");
  fiveDayForecastEl.innerHTML = '';
  return;
}

// searches for the weather of a given city by coordinates, and clears the current city weather if there is any.
function submitSearch (event) {
  event.preventDefault();
  currentCity = cityInputEl.val().trim();
  //clear current city weather
  clearCurrentCity();
  getCoordinates(currentCity);
  return;
}

// clears the search history.
function clearHistory(event) {
  event.preventDefault();
  var previousSearchesEl = document.getElementById('previous-searches');
  localStorage.removeItem("cities");
  previousSearchesEl.innerHTML = '';
  return;
}


// buttons

searchBtn.on("click", submitSearch );

clearBtn.on("click", clearHistory);

pastCityBtn.on("click", getPastCity);


