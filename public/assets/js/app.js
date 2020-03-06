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
        getWeatherForecast(crd.latitude, crd.longitude);
        getMarsData();
    }
    
    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
    
    function getWeatherData(lat, long) {
        // const weatherUrl = `https://fcc-weather-api.glitch.me/api/current?lat=${lat.toFixed()}&lon=${long.toFixed()}`;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat.toFixed()}&lon=${long.toFixed()}&appid=45d20cc421fedd596f1922360bb0d062`;
        fetch(weatherUrl)
        .then(response => response.json())
        .then(data =>  {
            postWeatherData(data)
        })
        .catch(error => console.log(error));
    }
    
    function kelvinToF(temp) {
        return (9/5 * temp - 459.67).toFixed();
    }
    
    function getWeatherForecast(lat, long) {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat.toFixed()}&lon=${long.toFixed()}&appid=45d20cc421fedd596f1922360bb0d062`;
        fetch(forecastUrl)
        .then(response => response.json())
        .then(data =>  {
            postWeatherForecast(data)
        })
        .catch(error => console.log(error));
    }

    function getMarsData() {
        const nasaUrl = "https://api.nasa.gov/insight_weather/?api_key=CgCQ474D810WdQ2jdcRZr7aZbd4DhxaFjBtdOTKb&feedtype=json&ver=1.0"
        fetch(nasaUrl)
        .then(response => response.json())
        .then(data =>  {
            postMarsData(data)
            generateGraph(data)
        })
        .catch(error => console.log(error));
    }

    function postWeatherForecast(data) {
        const dataArray = data.list;
        const daysArray = dataArray.filter(day => day.dt_txt.includes("12:00:00"));
        console.log(daysArray)
        daysArray.forEach(item => {
            let cardForecast = `
                <div class="item">
                    <h2>${new Date(item.dt_txt).toDateString()}</h2>
                    <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt=${item.weather[0].description}>
                    <h4>${item.weather[0].description.toUpperCase()}</h4>
                    <div class="forecastConditions">
                        <p class="temp"><b>Temperature:</b>  ${kelvinToF(item.main.temp)}<span>&#176;</span>F</p>
                        <p class="temp"><b>Humidity:</b>  ${item.main.humidity}%</p>
                    </div>
                </div>
    
            `
            document.querySelector(".forecast").innerHTML += cardForecast;
        })
    }
    
    function postWeatherData(data) {
        let html = '';
        const now = new Date;
        html = `<h3>${now.toDateString()}<h3>
                <h4>${data.weather[0].description.toUpperCase()}</h4>
                <div class="gridContainer3">
                    <div>
                        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt=${data.weather[0].description}>
                    </div>
                    <div class="items">
                        <h4>Temperature</h4>
                        <p class="temp"><b>Current:</b>  ${kelvinToF(data.main.temp)}<span>&#176;</span>F</p>
                        <p class="temp"><b>High:</b>  ${kelvinToF(data.main.temp_min)}<span>&#176;</span>F</p>
                        <p class="temp"><b>Low:</b>  ${kelvinToF(data.main.temp_max)}<span>&#176;</span>F</p>
                    </div>
                    <div class="items">
                        <h4>Conditions</h4>
                        <p class="temp"><b>Humidity:</b>  ${data.main.humidity}%</p>
                        <p class="temp"><b>Air Pressure:</b>  ${data.main.pressure} hPa</p>
                        <p class="temp"><b>Wind Speed:</b>  ${data.wind.speed} MPH</p>
                    </div>
                </div>
                `
        document.querySelector('.data').innerHTML = html;
    }

    function postMarsData(data) {
        const divEl = document.querySelector("#marsWeather");
        const dataArray = Object.keys(data).map(sol => {
            return data[sol];
        });
        const filteredArray = dataArray.filter(sol => sol.AT);
        const aveTemp = filteredArray.map(sol => sol.AT.av);
        const lowTemp = filteredArray.map(sol => sol.AT.mn);
        const highTemp = filteredArray.map(sol => sol.AT.mx);
        const dates = filteredArray.map(sol => new Date(sol.First_UTC));
        filteredArray.forEach(item => {
            let card = `
                <div class="tempInfo">
                    <h3>${new Date(item.First_UTC).toDateString()}</h3>
                    <br>
                    <p class="temp"><b>High Temp:</b> ${item.AT.mx.toFixed()}<span>&#176;</span>F</p>
                    <p class="temp"><b>Low Temp:</b> ${item.AT.mn.toFixed()}<span>&#176;</span>F</p>
                    <p class="temp"><b>Average Temp:</b> ${item.AT.av.toFixed()}<span>&#176;</span>F</p>
                </div>`
            divEl.innerHTML += card;
        })
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

    function generateGraph(data) {

        const dataArray = Object.keys(data).map(sol => {
            return data[sol];
        });
        const filteredArray = dataArray.filter(sol => sol.AT);
        const aveTemp = filteredArray.map(sol => sol.AT.av);
        const lowTemp = filteredArray.map(sol => sol.AT.mn);
        const highTemp = filteredArray.map(sol => sol.AT.mx);
        const dates = filteredArray.map(sol => new Date(sol.First_UTC));
        const dataCollection = [...aveTemp, ...lowTemp, ...highTemp, ...dates];
        
        var svg = d3.select("#marsGraph").append("svg")
            .attr("height","200px")
            .attr("width","100%");

        // Select, append to SVG, and add attributes to rectangles for bar chart
        svg.selectAll("rect")
            .data(aveTemp)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("height", function(d, i) {return d * -2})
                .attr("width","80")
                .attr("x", function(d, i) {return (i * 90) + 25})
                .attr("y", function(d, i) {return 200 - (d * -2)});

        // Select, append to SVG, and add attributes to text
        svg.selectAll("text")
            .data(aveTemp)
            .enter().append("text")
            .text(function(d) {return d})
                .attr("class", "text")
                .attr("x", function(d, i) {return (i * 90) + 36})
                .attr("y", function(d, i) {return 230 - (d * -2)});
            }

})