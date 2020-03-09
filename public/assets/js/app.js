document.addEventListener("DOMContentLoaded", function(event) {
    localStorage.setItem("fahrenheit", "true")
    let fahrenheit = localStorage.getItem("fahrenheit");
    let latitude = localStorage.getItem("latitude"); 
    let longitude = localStorage.getItem("longitude"); 
    const options = {
        enableHighAccuracy: true,
        timeout: 2000,
    };
    
    function success(pos) {
        const crd = pos.coords;
        localStorage.setItem("latitude", crd.latitude);
        localStorage.setItem("longitude", crd.longitude);
        generateMap(crd.latitude, crd.longitude);
        getWeatherData(crd.latitude, crd.longitude);
        getWeatherForecast(crd.latitude, crd.longitude);
        getMarsData();
        getNewsArticles();
    }
    
    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
    
    function getWeatherData(lat, long) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat.toFixed()}&lon=${long.toFixed()}&appid=45d20cc421fedd596f1922360bb0d062`;
        fetch(weatherUrl)
        .then(response => response.json())
        .then(data =>  {
            postWeatherData(data)
        })
        .catch(error => console.log(error));
    }

    function searchByZip(zip) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=45d20cc421fedd596f1922360bb0d062`;
        fetch(weatherUrl)
        .then(response => response.json())
        .then(data =>  {
            postWeatherData(data)
        })
        .catch(error => console.log(error));
    }

    function convertZipToCoord(zip) {
        const proxyURL = 'https://cors-anywhere.herokuapp.com/';
        const url = `https://www.zipcodeapi.com/rest/zvDU2yGt7e22hPw2xu8px42H6qOdyzuUqnmhq9cqcFNUsf9Dyfj90pWF9xAdBfiI/info.json/${zip}/degrees`;
        fetch(proxyURL + url)
        .then(response => response.json())
        .then(data =>  {
            console.log(data);
            generateMap(data.lat, data.lng);
            showLocation(data);
        })
        .catch(error => console.log(error));
    }
    
    function kelvinToF(temp) {
        return (9/5 * temp - 459.67).toFixed();
    }

    function kelvinToC(temp) {
        return (temp - 273.15).toFixed();
    }

    function convertFToC(temp) {
        return (5/9) * (temp - 32);
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

    function getNewsArticles() {
        const today = new Date();
        const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const url = `http://newsapi.org/v2/everything?q=weather&from=${dateString}&sortBy=popularity&apiKey=1607dbe0f68548328a153148fe3b9431`;
        fetch(url)
        .then(response => response.json())
        .then(data =>  {
           console.log(data)
           postNewsArticles(data)
        })
        .catch(error => console.log(error));
    }

    function showLocation(data) {
        document.querySelector(".zipCode").textContent = data.zip_code;
        document.querySelector(".city").textContent = `${data.city}, ${data.state}`;
        document.querySelector(".location-heading").textContent = `WEATHER CONDITIONS IN ${data.city.toUpperCase()}`
    }

    function postWeatherForecast(data) {
        let nodeEl = document.querySelector(".forecast");
        nodeEl.innerHTML = '';
        const dataArray = data.list;
        const daysArray = dataArray.filter(day => day.dt_txt.includes("12:00:00"));
        console.log(daysArray)
        daysArray.forEach(item => {
                cardForecast = `
                <div class="item">
                    <h2>${formatDate(new Date(item.dt_txt).toDateString())}</h2>
                    <img src="${getWeatherIcon(item.weather[0].icon)}" alt=${item.weather[0].description}>
                    <h4>${item.weather[0].description.toUpperCase()}</h4>
                    <div class="forecastConditions">
                        <p class="temp"><b>Temperature:</b>  ${localStorage.fahrenheit === "true" ? kelvinToF(item.main.temp) : kelvinToC(item.main.temp)}<span>&#176;</span>${localStorage.fahrenheit === "true" ? "F" : "C"}</p>
                        <p class="temp"><b>Humidity:</b>  ${item.main.humidity}%</p>
                    </div>
                </div>
    
            `
            nodeEl.innerHTML += cardForecast;
        });
        toggleClasses();
    }

    function postNewsArticles(data) {
        let nodeEl = document.querySelector(".articles");
        nodeEl.innerHTML = '';
        let articleCard
        data.articles.forEach(article => {
                articleCard = `
                <div class="article">
                    <a href="${article.url}" target="_blank">
                        <h2>${article.title}</h2>
                    </a>
                    <img src="${article.urlToImage}"/>
                    <h4>${article.author}</h4>
                    <div class="forecastConditions">
                        <p class="text">${article.description}</p>
                    </div>
                </div>
    
            `
            nodeEl.innerHTML += articleCard;
        });
    }
    
    function postWeatherData(data) {
        let html = '';
        const now = new Date;
        console.log(data)
        html = `<h3>${formatDate(now.toDateString())}<h3>
                <h4>${data.weather[0].description.toUpperCase()}</h4>
                <div class="tempToggle">
                    <span id="tempF">&#176;F</span><span> / </span><span id="tempC">&#176;C</span>
                </div>
                <div class="gridContainer3">
                    <div>
                        <img src="${getWeatherIcon(data.weather[0].icon)}" alt=${data.weather[0].description}>
                    </div>
                    <div class="items">
                        <h4>Temperature</h4>
                        <p class="temp"><i class="fas fa-thermometer-half"></i><b>Current: </b><span class="tempCurr">${localStorage.fahrenheit == "true" ? kelvinToF(data.main.temp) : kelvinToC(data.main.temp)}&#176;${localStorage.fahrenheit == "true" ? "F" : "C"}</span></p>
                        <p class="temp"><i class="fas fa-thermometer-full"></i><b>High: </b><span class="tempMax">${localStorage.fahrenheit == "true" ? kelvinToF(data.main.temp_max) : kelvinToC(data.main.temp_max)}&#176;${localStorage.fahrenheit == "true" ? "F" : "C"}</span></p>
                        <p class="temp"><i class="fas fa-thermometer-empty"></i><b>Low: </b><span class="tempMin">${localStorage.fahrenheit == "true" ? kelvinToF(data.main.temp_min) : kelvinToC(data.main.temp_min)}&#176;${localStorage.fahrenheit == "true" ? "F" : "C"}</span></p>
                    </div>
                    <div class="items">
                        <h4>Conditions</h4>
                        <p class="temp"><i class="fas fa-tint"></i><b>Humidity:</b>  ${data.main.humidity}%</p>
                        <p class="temp"><i class="fas fa-fan"></i><b>Air Pressure:</b>  ${data.main.pressure} hPa</p>
                        <p class="temp"><i class="fas fa-wind"></i><b>Wind</b>  ${data.wind.speed} MPH</p>
                    </div>
                </div>
                `
        document.querySelector('.data').innerHTML = html;
        addEventListeners();
        
    }

    function toggleClasses() {
        console.log(localStorage.fahrenheit)
        if (localStorage.fahrenheit === "true") {
            document.querySelector("#tempF").classList.remove('selected');
            document.querySelector("#tempC").classList.add('selected');
        }
        else {
            document.querySelector("#tempF").classList.add('selected');
            document.querySelector("#tempC").classList.remove('selected');
        }
    }

    function formatDate(date) {
        const array = date.split(' ')
        const dateNum = parseInt(array[2]);

        if (dateNum === 1 || dateNum === 21) {
            return `${array[0]} ${array[1]} ${removeZero(array[2])}st, ${array[3]}`
        }
        else if (dateNum === 2 || dateNum === 22) {
            return `${array[0]} ${array[1]} ${removeZero(array[2])}nd, ${array[3]}`
        }
        else if (dateNum === 3 || dateNum === 23) {
            return `${array[0]} ${array[1]} ${removeZero(array[2])}rd, ${array[3]}`
        }
        else {
            return `${array[0]} ${array[1]} ${removeZero(array[2])}th, ${array[3]}`
        }
    }

    function removeZero(day) {
        const array = day.toString().split('');
        if (array[0] === "0") {
            return array[1]
        } else {
            return array.join("");
        }
    }

    function addEventListeners() {
        document.querySelector("#tempF").addEventListener('click', function() {
            console.log("You clicked F");
            localStorage.setItem("fahrenheit", true);
            console.log(localStorage)
            console.log(localStorage.fahrenheit)
            console.log(localStorage.getItem("fahrenheit"));
            getWeatherData(parseFloat(latitude), parseFloat(longitude));
            getWeatherForecast(parseFloat(latitude), parseFloat(longitude));
        });
        document.querySelector("#tempC").addEventListener('click', function() {
            localStorage.setItem("fahrenheit", false);
            getWeatherData(parseFloat(latitude), parseFloat(longitude));
            getWeatherForecast(parseFloat(latitude), parseFloat(longitude)); 
        })
    }

    function getWeatherIcon(icon) {
        switch(icon) {
            case "01d": 
            case "01n":
              return "public/assets/images/day.svg"
              break;
            case "02d":
            case "02n":
            case "03d":
            case "03n":
            case "04d":
            case "04n":
              return "public/assets/images/cloudy.svg"
              break;
            case "09d":
            case "09n":
              return "public/assets/images/rainy-6.svg"
              break;
            case "10d":
            case "10n":
              return "public/assets/images/rainy-5.svg"
              break;
            case "11d":
            case "11n":
              return "public/assets/images/thunder.svg"
              break;
            case "13d":
            case "13n":
              return "public/assets/images/snowy-6.svg"
              break;
            default:
                return "public/assets/images/cloudy.svg"
            }
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
                    <h3>${formatDate(new Date(item.First_UTC).toDateString())}</h3>
                    <br>
                    <p class="temp"><b>High Temp:</b> ${item.AT.mx.toFixed()}<span>&#176;</span>F</p>
                    <p class="temp"><b>Low Temp:</b> ${item.AT.mn.toFixed()}<span>&#176;</span>F</p>
                    <p class="temp"><b>Average Temp:</b> ${item.AT.av.toFixed()}<span>&#176;</span>F</p>
                </div>`
            divEl.innerHTML += card;
        })
    }

    function generateMap(lat, long) {
        document.querySelector("#map").innerHTML = '';
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

        const inputEl = document.querySelector('#zip-code');
        const form = document.querySelector(".search-zip");
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            searchByZip(inputEl.value);
            convertZipToCoord(inputEl.value);
            console.log(inputEl.value)
            inputEl.value = '';
        })

})