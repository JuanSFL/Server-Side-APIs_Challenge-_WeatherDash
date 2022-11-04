var APIkey = "46cd90b85dedebbff86728e5a1257082";

var cityInputEl = $('#city-input');
var searchBtn = $('#search-button');
var clearBtn = $('#clear-button');
var pastSearchedCitiesEl = $('#past-searches');
console.log(cityInputEl);


var currentCity;
// 5 day forecast
function get5DayWeather({ city, lon, lat }) {

    var requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then (function(data) {
            var currentWeatherEl= $('#currentWeather')
            currentWeatherEl.addClass('border border-dark')

            var cityNameEl = $('<h2>')
            cityNameEl.text(currentCity)
            currentWeatherEl.append(cityNameEl)

            var currentCityDate;
            currentCityDate = moment.unix(currentCityDate).format("MM/DD/YYYY");
            var currentDateEl = $('<span>');
            currentDateEl.text(` (${currentCityDate}) `);
            cityNameEl.append(currentDateEl);
      
    })
  return
}

// ONE CALL
function getCoordinates (cityname) {
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
      .then(function(data) {
        console.log(data)
        // check how data is return to see how to navigate to value
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

function displaySearchHistory() {
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
    var pastSearchesEl = document.getElementById('past-searches');

    pastSearchesEl.innerHTML ='';

    for (i = 0; i < storedCities.length; i++) {
        
        var pastCityBtn = document.createElement("button");
        pastCityBtn.classList.add("btn", "btn-primary", "my-2", "past-city");
        pastCityBtn.setAttribute("style", "width: 100%");
        pastCityBtn.textContent = `${storedCities[i].city}`;
        pastSearchesEl.appendChild(pastCityBtn);
    }
    return;
}

function handleCityFormSubmit (event) {
    event.preventDefault();
    currentCity = cityInputEl.val().trim();

    //clear currenct city weather
    getCoordinates(currentCity);

    return;
}
function handleClearHistory (event) {
    event.preventDefault();
    var pastSearchesEl = document.getElementById('past-searches');

    localStorage.removeItem("cities");
    pastSearchesEl.innerHTML ='';

    return;
}


searchBtn.on("click", handleCityFormSubmit);
displaySearchHistory();
clearBtn.on("click", handleClearHistory);



