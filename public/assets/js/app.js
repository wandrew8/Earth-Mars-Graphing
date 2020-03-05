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
            generateGraph(data)
        })
        .catch(error => console.log(error));
    }
    
    function postWeatherData(data) {
        let html = '';
        html = `<h2>${data.name}</h2><img src=${data.weather[0].icon} alt=${data.weather[0].description}><p>${data.weather[0].description}</p>`
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
        console.log(dates.map(item => item))
        filteredArray.forEach(item => {

            let card = `
                <div class="tempInfo">
                    <h2>${new Date(item.First_UTC).toDateString()}</h2>
                    <br>
                    <p><b>High Temp:</b> ${item.AT.mx}</p>
                    <p><b>Low Temp:</b> ${item.AT.mn}</p>
                    <p><b>Average Temp:</b> ${item.AT.av}</p>
                </div>
            `
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
    console.log(filteredArray)
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