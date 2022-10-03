const OPENWEATHER_API = 'de6e56b5bb651df9844567bf0e22e6e8';
const COUNTRY_FLAG_ENDPOINT = 'https://countryflagsapi.com/png'
const DEFAULT_CITY_ID = '6053154'; //Lethbridge
let CITIES = [];


function RenderCityOption(id, name, country) {
    return `<a href="#${encodeURI((name) + ',' + (country))}">
                <div class="option" data-id="${id}" data-city="${name}">
                    <span class="city">${name}</span>, <span class="country">${country}</span>
                </div>
            </a>`;
}

function RenderForecastCard(datetime, temp, weatherID, weatherDescription, timezone) {
    return `
    <div class="forecast-card">
        <h6>
            <div class="forecast-date opensans-light">${FormatDate(datetime, timezone)}</div>
            <div class="forecast-time opensans-light">${FormatTime(datetime, timezone)}</div>
        </h6>
        <div class="forecast-symbol"><i class="wi wi-owm-${weatherID}"></i></div>
        <h6 class="opensans-light">${Math.round(temp)} &deg;</h6>
    </div>`;
}


function FormatTime(dt, timezone) {
    return moment.utc(dt, 'X').add(timezone, 'seconds').format('hh:mm a');
}

function FormatDate(dt, timezone) {
    return moment.utc(dt, 'X').add(timezone, 'seconds').format('MMM DD');
}


function RenderForecast(forecast) {
    if(forecast.list.length === 0) new Error('No forecast to report.');
    if(!forecast.city.id) new Error('No city for this forecast');

    $('#forecastList').html('');
    forecast.list.forEach(function (weather) {
        $('#forecastList').append(RenderForecastCard(weather.dt, weather.main.temp, weather.weather[0].id, weather.weather[0].description, forecast.city.timezone));
    });
}

function RenderBackgroundImage(weatherCategory) {
    $('body').removeClass();
    $('#credit').attr('href', '').text('');

    const condition = weatherCategory.slice(0,2);
    const time = weatherCategory.slice(-1);
    let backgroundClass = '';
    let author = '';
    let authorUrl = '';
    switch(condition) {
        case '01':
            if (time === 'n') {
                backgroundClass = 'con-clearnight';
                author = 'Klemen Vrankar';
                authorUrl = 'https://unsplash.com/@vklemen?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText';
            } else {
                backgroundClass = 'con-clearday';
                author = 'Grooveland Designs';
                authorUrl = 'https://unsplash.com/@groovelanddesigns?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText';
            }
            break;
        case '02':
        case '03':
        case '04':
            if (time === 'n') {
                backgroundClass = 'con-cloudynight';
                authorUrl = 'https://unsplash.com/@hngstrm?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText';
                author = 'Henry & Co.';
            } else {
                backgroundClass = 'con-cloudyday';
                authorUrl = 'https://unsplash.com/@billy_huy?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText';
                author = 'Billy Huynh';
            }
            break;
        case '09':
        case '10':
            backgroundClass = 'con-rainy';
            author = 'Brazil Topno';
            authorUrl = 'https://unsplash.com/@b620?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText'
            break;
        case '11':
            backgroundClass = 'con-thunderstorm';
            author = 'Brandon Morgan';
            authorUrl = 'https://unsplash.com/@littleppl85?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText';
            break;
        case '13':
            backgroundClass = 'con-snow';
            author = 'Aditya Vyas';
            authorUrl = 'https://unsplash.com/@aditya1702?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText';
            break;
        case '50':
            backgroundClass = 'con-hazy';
            author = 'Glenn Abelson';
            authorUrl = 'https://unsplash.com/@glenna1984?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText';
            break;
        default:
            backgroundClass = 'con-default';
            author = '';
            authorUrl = '';
            break;
    }
    $('body').addClass(backgroundClass);  
    $('#credit').attr('href', authorUrl).text(author);
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
    const weatherCategory = weatherJSON.weather[0].icon;
    const countryCode = weatherJSON.sys.country;
    const sunset = weatherJSON.sys.sunset;
    const sunrise = weatherJSON.sys.sunrise;
    const timezone = weatherJSON.timezone;

    const localSunrise = FormatTime(sunrise, timezone);
    const localSunset = FormatTime(sunset, timezone);
    

    $('#temp').text('');
    $('#location').text('');
    $('#feelslike').text('');
    $('#description').text('');
    $('#conditionicon > i').removeClass();
    $('#mintemp').text('');
    $('#maxtemp').text('');
    $('#countryCode > img').attr('src', '');

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

    RenderBackgroundImage(weatherCategory);
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

async function FindForecastWeather(cityID) {
    return new Promise((resolve, reject) => {
        $.get(`https://api.openweathermap.org/data/2.5/forecast?units=metric&id=${cityID}&appid=${OPENWEATHER_API}`)
            .done(function(data) {
                if(data.list.length > 20) {
                    resolve({list: data.list.slice(0, 20), city: data.city});
                } else {
                    resolve({list: data.list, city: data.city});
                }
            })
            .fail(function(error) {
                console.log(error);
                reject(new Error('Cannot fetch forecast report.'))
             })
    });
}

async function OptionClickHandler(event) {
    const cityID = $(this).attr('data-id');
    try {
        ShowBodySpinner();
        $('.option').removeClass('selected')
        $(this).addClass('selected');
        $('#options').hide();
        $('#cityfield').val($(this).attr('data-city').trim())
    
        const weatherJSON = await FindCurrentWeather(cityID);
        RenderWeather(weatherJSON);
        const forecastJSON = await FindForecastWeather(cityID);
        RenderForecast(forecastJSON);
    
    } catch (error) {
        console.log(error)
    } finally {
        HideBodySpinner();
    }
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


function ShowBodySpinner() {
    $('#spinner').css('display', 'flex');
}

function HideBodySpinner() {
    $('#spinner').css('display', 'none');
}





$(document).ready(async function() {

    ShowBodySpinner();
    $('#cityfield').on('keyup', SearchHandler);
    $('#search #cityfield').on('focusin', FocusInSearchHandler);
    $('#search').on('submit', SearchHandler);
    $('#search #searchicon').on('click', SearchHandler);

    try {
        CITIES = await FetchCities();
        $('#cityfield').val('Lethbridge');
        const DEFAULT_CITY_ID_JSON = await FindCurrentWeather(DEFAULT_CITY_ID);
        RenderWeather(DEFAULT_CITY_ID_JSON);
        const DEFAULT_CITY_ID_FORECAST = await FindForecastWeather(DEFAULT_CITY_ID);
        RenderForecast(DEFAULT_CITY_ID_FORECAST);
    } catch(error) {
        console.log(error)
    } finally {
        HideBodySpinner();
    }


    $(document).on('click', function(event) {
        if($(event.target).closest('form#search').length === 0) {
            $('#options').hide();
        }
    })
});
// editor