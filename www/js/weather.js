const OPENWEATHER_API = 'de6e56b5bb651df9844567bf0e22e6e8';
const COUNTRY_FLAG_ENDPOINT = 'https://countryflagsapi.com/png'
const DEFAUL_CITY_ID = '6053154'; //Lethbridge
let CITIES = [];


function RenderCityOption(id, name, country) {
    return `<a href="#${encodeURI((name) + ',' + (country))}">
                <div class="option" data-id="${id}" data-city="${name}">
                    <span class="city">${name}</span>, <span class="country">${country}</span>
                </div>
            </a>`;
}

function RenderWeather(weatherJSON) {
    if(!weatherJSON) new Error('Current weather cannot be reported.');

    const temp = weatherJSON.main.temp;
    const minTemp = weatherJSON.main.temp_min;
    const maxTemp = weatherJSON.main.temp_max;
    const feelsLike = weatherJSON.main.feels_like;
    const pressure = weatherJSON.main.pressure;
    const humidity = weatherJSON.main.humidity;
    const windSpeed = weatherJSON.wind.speed;
    const city = weatherJSON.name;
    const description = weatherJSON.weather[0].description;
    const id = weatherJSON.weather[0].id;
    const countryCode = weatherJSON.sys.country;
    const sunset = weatherJSON.sys.sunset;
    const sunrise = weatherJSON.sys.sunrise;
    const timezone = weatherJSON.timezone;

    const localSunrise = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm a');
    const localSunset = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm a');
    

    $('#temp').text('');
    $('#location').text('');
    $('#feelslike').text('');
    $('#description').text('');
    $('#conditionicon > i').removeClass();
    $('#mintemp').text('');
    $('#maxtemp').text('');
    $('#countryCode > img').attr('src', '');
    // $('#countryCode').text('');

    if(temp) $('#temp').text(Math.round(temp));
    if(minTemp) $('#mintemp').text(Math.round(minTemp));
    if(maxTemp) $('#maxtemp').text(Math.round(maxTemp));
    if(feelsLike) $('#feelslike').text(Math.round(feelsLike));
    if(pressure) $('#pressure').text(pressure);
    if(humidity) $('#humidity').text(humidity);
    if(windSpeed) $('#windSpeed').text(windSpeed);
    if(city) $('#location').text(city);
    if(description) $('#description').text(description);
    if(id) $('#conditionicon > i').addClass(`wi wi-owm-${id}`);
    if(countryCode) $('#countryCode > img').attr('src', `${COUNTRY_FLAG_ENDPOINT}/${countryCode}`);
    if(sunset) $('#sunset').text(localSunset);
    if(sunrise) $('#sunrise').text(localSunrise);

    // if(weatherJSON.sys.country) {
    //     $('#countryCode').text(weatherJSON.sys.country);
    // }
    


    console.log(weatherJSON)
}


function SearchHandler(event) {
    event.preventDefault();
    const optionsEl = $('#options');
    const query = $('#cityfield').val().trim();

    let citiesFound = [];
    citiesFound = Filter(query);
    optionsEl.html('');
    
    if (citiesFound.length > 0) {
        citiesFound.forEach(function(city) {
            let option = RenderCityOption(city.id, city.name, city.country);
            optionsEl.append(option);
        }); 
        $('.option').on('click', OptionClickHandler);    
    }
}

async function FindCurrentWeather(cityID) {
    console.log('city id selected: ', cityID);
    return new Promise((resolve, reject) => {
        $.get(`https://api.openweathermap.org/data/2.5/weather?units=metric&id=${cityID}&appid=${OPENWEATHER_API}`)
            .done(function(data) {
                resolve(data);
            })
            .fail(function(error) {
                console.log(error);
                reject(new Error('Cannot fetch latest weather report.'))
             })
    });
    


}

async function OptionClickHandler(event) {
    const cityID = $(this).attr('data-id');

    $('.option').removeClass('selected')
    $(this).addClass('selected');
    $('#options').hide();
    $('#cityfield').val($(this).attr('data-city').trim())

    const weatherJSON = await FindCurrentWeather(cityID);
    RenderWeather(weatherJSON);
}

function FocusInSearchHandler(event) {
    // const currentValue = $(this).val().slice(0, -4);
    // $(this).val(currentValue); 
    $('#options').show();
}

function Filter(queryString) {
    if(queryString.length < 3) return new Error('Query too short.');
    const regex = new RegExp(`^${queryString}`, 'i');
    return CITIES.filter(function(city) {
        return (regex).test(city.name); 
    })
}


async function FetchCities() {
    return new Promise((resolve, reject) => {
        $.getJSON("./js/city.list.json")
            .done(function(data){
                resolve(data);
            })
            .fail(function(error){
                console.log(error);
                reject(new Error('Cannot fetch cities.'));
            });
    });
}







$(document).ready(async function() {

    $('#cityfield').on('keyup', SearchHandler);
    $('#search #cityfield').on('focusin', FocusInSearchHandler);
    $('#search').on('submit', SearchHandler);
    $('#search #searchicon').on('click', SearchHandler);

    try {
        CITIES = await FetchCities();
        $('#cityfield').val('Lethbridge');
        const DEFAULT_CITY_ID_JSON = await FindCurrentWeather(DEFAUL_CITY_ID);
        RenderWeather(DEFAULT_CITY_ID_JSON);
        // console.log('working here: ', CITIES);
    } catch(error) {

    }




});