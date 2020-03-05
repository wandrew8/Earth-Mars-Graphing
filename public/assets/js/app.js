
document.addEventListener("DOMContentLoaded", function(event) {
    
    const options = {
        enableHighAccuracy: true,
        timeout: 2000,
    };
    
    function success(pos) {
        const crd = pos.coords;
        
        console.log('Your current position is:');
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);
        generateMap(crd.latitude, crd.longitude);
        getWeatherData(crd.latitude, crd.longitude);
        getMarsData();
    }
    
    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
    
    function getWeatherData(lat, long) {
        const weatherUrl = `https://fcc-weather-api.glitch.me/api/current?lat=${lat.toFixed()}&lon=${long.toFixed()}`;
        // const weatherUrl = `https://www.api.openweathermap.org/data/2.5/weather?lat=${lat.toFixed()}&lon=${long.toFixed()}&appid=45d20cc421fedd596f1922360bb0d062`;
        fetch(weatherUrl)
        .then(response => response.json())
        .then(data =>  {
            postWeatherData(data)
        })
        .catch(error => console.log(error));
    }
    
    function getMarsData() {
        const nasaUrl = "https://api.nasa.gov/insight_weather/?api_key=CgCQ474D810WdQ2jdcRZr7aZbd4DhxaFjBtdOTKb&feedtype=json&ver=1.0"
        fetch(nasaUrl)
        .then(response => response.json())
        .then(data =>  {
            postMarsData(data)
        })
        .catch(error => console.log(error));
    }
    
    function postWeatherData(data) {
        let html = '';
        html = `<h2>${data.name}</h2><img src=${data.weather[0].icon} alt=${data.weather[0].description}><p>${data.weather[0].description}</p>`
        document.querySelector('.data').innerHTML = html;
    }

    function postMarsData(data) {
        console.log(data)
    }

    function generateMap(lat, long) {
        var map = new ol.Map({
            target: 'map',
            layers: [
              new ol.layer.Tile({
                source: new ol.source.OSM()
              })
            ],
            view: new ol.View({
              center: ol.proj.fromLonLat([long.toFixed(2), lat.toFixed(2)]),
              zoom: 12
            })
          });
    }
})