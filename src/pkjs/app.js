var Clay = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);

var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};
// Request for WU
function locationSuccessWU(pos){
  //Request WU
  var lat=pos.coords.latitude;
  var lon= pos.coords.longitude;
  var settings = JSON.parse(localStorage.getItem('clay-settings')) || {};
  var units = unitsToString(settings.WeatherUnit);
  var keyAPIwu = localStorage.getItem('wuKey');
  var userKeyApi=settings.APIKEY_User;
  var endapikey=apikeytouse(userKeyApi,keyAPIwu);  
  // Construct URL
  var urlWU = "http://api.wunderground.com/api/"+
      endapikey + "/conditions/astronomy/q/"+
      lat+","+lon+
      ".json";
  console.log("WUUrl= " + urlWU);
  xhrRequest(encodeURI(urlWU), 'GET', function(responseText) {
    // responseText contains a JSON object with weather info
    var json = JSON.parse(responseText);
    localStorage.setItem("OKAPI", 0);
    // Temperature
    var tempf = Math.round(json.current_observation.temp_f)+"°" + units;
    var tempc = Math.round(json.current_observation.temp_c)+"°" + units;
    var tempwu=temptousewu(units,tempf,tempc);
    // Condition
    var condwu=json.current_observation.icon;
    var condwuparsed=parsewu(condwu);
    // City
    var citywu = json.current_observation.display_location.city;
    // Sunrise and Sunset
    var sunrisewu=parseInt(json.sun_phase.sunrise.hour*100)+parseInt(json.sun_phase.sunrise.minute*1);
    var sunsetwu=parseInt(json.sun_phase.sunset.hour*100)+parseInt(json.sun_phase.sunset.minute*1);
    localStorage.setItem("OKAPI", 1);
    console.log("OK API");
    // Assemble dictionary
    var dictionary = {
      "WeatherTemp": tempwu,
      "WeatherCond": condwuparsed,
      "HourSunset": sunsetwu,
      "HourSunrise":sunrisewu,
      "NameLocation": citywu
    };
    // Send to Pebble
    Pebble.sendAppMessage(dictionary,function(e) {console.log("Weather from WU sent to Pebble successfully!");},
                                     function(e) {console.log("Error sending WU info to Pebble!");}
                                    );
  });
}
// Request for OWM
function locationSuccessOWM(pos){
  //Request OWM
  var lat=pos.coords.latitude;
  var lon= pos.coords.longitude;
  var settings = JSON.parse(localStorage.getItem('clay-settings')) || {};
  var keyAPIowm=localStorage.getItem('owmKey');
  var userKeyApi=settings.APIKEY_User;
  var endapikey=apikeytouse(userKeyApi,keyAPIowm);  
  var units = unitsToString(settings.WeatherUnit);
  var unitsOWM=unitsToStringOWM(settings.WeatherUnit);
  var langtouse=translate(navigator.language);
  // Construct URL
  var urlOWM = "http://api.openweathermap.org/data/2.5/weather?lat=" +
      lat + "&lon=" + lon +
      '&appid=' + endapikey+
      '&units='+unitsOWM+
      '&lang='+langtouse;
  console.log("OWMUrl= " + urlOWM);
  // Send request to OpenWeatherMap
  xhrRequest(encodeURI(urlOWM), 'GET',function(responseText) {
    // responseText contains a JSON object with weather info
    var json = JSON.parse(responseText);
    localStorage.setItem("OKAPI", 0);
    // Temperature
    var tempowm = Math.round(json.main.temp)+"°" + units;
    // Conditions
    var condowm = json.weather[0].id;
    var condowmparsed=parseowm(condowm);
    // Sunrise and Sunset
    var auxsunowm =new Date(json.sys.sunrise*1000);
    var sunriseowm=auxsunowm.getHours()*100+auxsunowm.getMinutes();
    var auxsetowm =new Date(json.sys.sunset*1000);
    var sunsetowm=auxsetowm.getHours()*100+auxsetowm.getMinutes();
    // Location
    var cityowm=json.name;
    localStorage.setItem("OKAPI", 1);
    console.log("OK API");
    // Assemble dictionary using our keys
    var dictionary = {
      "WeatherTemp": tempowm,
      "WeatherCond": condowmparsed,
      "HourSunset": sunsetowm,
      "HourSunrise":sunriseowm,
      "NameLocation": cityowm
    };
    // Send to Pebble
    Pebble.sendAppMessage(dictionary,
                          function(e) {console.log("Weather from OWM sent to Pebble successfully!");},
                          function(e) { console.log("Error sending OWM info to Pebble!");}
                         );
  });
}
// Request for Yahoo
function locationSuccessYahoo(pos) {
  var lat=pos.coords.latitude;
  var lon= pos.coords.longitude;
  var settings = JSON.parse(localStorage.getItem('clay-settings')) || {};
  var units = unitsToString(settings.WeatherUnit);
  // Construct URL
  //Get JSON from Yahoo Weather
  var urlyahoo = 'https://query.yahooapis.com/v1/public/yql?q=select astronomy,item.condition, ' +
      'location from weather.forecast(1) where woeid in ' +
      '(select woeid from geo.places(1) where ' +
      'text=\'(' + lat + ',' + lon + ')\') and ' +
      'u=\'' + units + '\'&format=json';
  console.log("WeatherUrl= " + urlyahoo);
  // Send request to Yahoo for weather
  xhrRequest(encodeURI(urlyahoo), 'GET',function(responseText) {
    var json = JSON.parse(responseText);
    var temperature = Math.round(json.query.results.channel.item.condition.temp) +"°" + units;
    // Conditions item.condition.code
    var conditions = Math.round(json.query.results.channel.item.condition.code);
    var condyahooparsed=parseyahoo(conditions);
    // Sunrise
    var risebase=json.query.results.channel.astronomy.sunrise;
    var sunrisehhmm=gettime(risebase);
    //Sunset
    var setbase=json.query.results.channel.astronomy.sunset;
    var sunsethhmm=gettime(setbase);
    // Assemble dictionary using our keys
    var dictionary = {
      "WeatherTemp": temperature,
      "WeatherCond": condyahooparsed,
      "HourSunset": sunsethhmm,
      "HourSunrise":sunrisehhmm
    };
    // Send to Pebble
    Pebble.sendAppMessage(dictionary,function(e) {
      console.log("Weather info from Yahoo sent to Pebble successfully!");
    },
                          function(e) {
                            console.log("Error sending weather info to Pebble!");});
  }
            );
  //Request location
  var langtouse=translate(navigator.language);
  var urlgeoplaces = 'https://query.yahooapis.com/v1/public/yql?q=' +
      'select locality1.content,locality2.content from geo.places(1) where ' +
      'text=\'(' + lat + ',' + lon + ')\' and ' +
      'lang=\'' + langtouse +'\'&format=json';
  console.log("GeoPlacesUrl= " + urlgeoplaces);
  //Send request to GeoPlaces
  xhrRequest(encodeURI(urlgeoplaces), 'GET', function(responseText) {
    // responseText contains a JSON object with weather info
    var jsonloc = JSON.parse(responseText);
    // Location
    var location=jsonloc.query.results.place.locality2;
    var city=jsonloc.query.results.place.locality1;
    var locfinYahoo=locationyahoo(location,city);
    // Assemble dictionary using our keys
    var dictionary = {
      "NameLocation": locfinYahoo
    };
    // Send to Pebble
    Pebble.sendAppMessage(dictionary, function(e) {console.log("Location info sent to Pebble successfully!");},
                          function(e) { console.log("Error sending location info to Pebble!");});
  }
            );
}
function locationError(err) {
  console.log("Error requesting geolocation!");
  //Send response null
  var location="";
  // Assemble dictionary using our keys
  var dictionary = {
    "NameLocation": location};
  Pebble.sendAppMessage(dictionary,
                        function(e) {
                          console.log("Null key sent to Pebble successfully!");
                        },
                        function(e) {
                          console.log("Null key error sending to Pebble!");
                        }
                       );
}
function getinfo() {
  // Get keys from pmkey
  var settings = JSON.parse(localStorage.getItem('clay-settings')) || {};
  var email=settings.EmailPMKEY;
  var pin=settings.PINPMKEY;
  if (email !== undefined && pin !== undefined) {
    //Request API from pmkey.xyz
    var urlpmk='https://pmkey.xyz/search/?email='+email+"&pin="+pin;
    console.log("Url PMKEY is "+ urlpmk);
    var keys = parseInt(localStorage.getItem("OKAPI"));
    console.log("Flag keys is " + keys);
    if (keys===0){
      xhrRequest(encodeURI(urlpmk),'GET',
                 function(responseText){
                   var jsonpmk=JSON.parse(responseText);
                   var wuKey=jsonpmk.keys.weather.wu;
                   var owmKey=jsonpmk.keys.weather.owm;
                   localStorage.setItem("wuKey", wuKey);
                   localStorage.setItem("owmKey", owmKey);
                 }
                );
    }
  }
  var weatherprov=settings.WeatherProv;
  if (weatherprov=="yahoo"){
    console.log("Requesting weather from Yahoo");
    navigator.geolocation.getCurrentPosition(
      locationSuccessYahoo,
      locationError,
      {enableHighAccuracy:true,timeout: 15000, maximumAge: 1000}
    );
  }
  else if(weatherprov=="owm") {
    console.log("Ready from OWM");
    navigator.geolocation.getCurrentPosition(
      locationSuccessOWM,
      locationError,
      {enableHighAccuracy:true,timeout: 15000, maximumAge: 1000}
    );
  }
  else if (weatherprov=="wu"){
    console.log("Ready from WU");
    navigator.geolocation.getCurrentPosition(
      locationSuccessWU,
      locationError,
      {enableHighAccuracy:true,timeout: 15000, maximumAge: 1000}
    );
  }
}
// Listen for when the watchface is opened
Pebble.addEventListener('ready',
                        function(e) {
                          console.log("Starting Watchface!");
                          localStorage.setItem("OKAPI", 0);
                          // Get the initial weather
                          getinfo();
                        }
                       );
// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
                        function(e) {
                          console.log("Requesting geoposition!");
                          getinfo();
                        }
                       );
// Listen for when the Config app changes
Pebble.addEventListener('webviewclosed',
                        function(e) {
                          console.log("Updating config!");
                          getinfo();
                        }
                       );
//functions and mappings
function unitsToStringOWM(unit) {
  if (unit) {
    return 'imperial';
  }
  return 'metric';
}
function unitsToString(unit) {
  if (unit) {
    return 'f';
  }
  return 'c';
}
function translate(langloc){
  if (langloc==='es-ES'){
    return 'es';
  }
  else if (langloc==='fr_FR'){
    return 'fr';
  }
  else if (langloc==='de_DE'){
    return 'de';
  }
  else if (langloc==='it_IT'){
    return 'it';
  }
  else if (langloc==='pt_PT'){
    return 'pt';
  }
  else {
    return 'en';
  }
}
function gettime(timetoparse){
  var arrayrise = timetoparse.split(" ");
  var aamm=arrayrise[1];
  var array1m=arrayrise[0];
  var arrayhhmm=array1m.split(":");
  var hh=parseInt(arrayhhmm[0]);
  var mm=parseInt(arrayhhmm[1]);
  if (aamm=='am'){
    if (hh==12){
      return mm;
    }
    else {
      return (hh*100)+mm;
    }
  }
  else {
    if (hh==12){
      return (hh*100)+mm;
    }
    else {
      return ((hh+12)*100)+mm;
    }
  }
}
function locationyahoo(neigh,cit){
  if (neigh!==null){
    return neigh;
  }
  else {
    return cit;
  }
}
function temptousewu(unit,tempf,tempc){
  if (unit=="f"){
    return tempf; }
  else return tempc;
}
function apikeytouse(APIUser,APIPMKEY){
  if (APIUser===""){
    console.log("Using pmkey");
    return APIPMKEY;
  }
  else {
    console.log("Using Key User");
    return APIUser;
  }
}
// Function to return condition values from OWM
function parseowm(condcode){
if (condcode==200) return 1; //Condcode is thunderstorm with light rain - icon is day-storm-showers
else if (condcode==201) return 3; //Condcode is thunderstorm with rain - icon is thunderstorm
else if (condcode==202) return 3; //Condcode is thunderstorm with heavy rain - icon is thunderstorm
else if (condcode==210) return 1; //Condcode is light thunderstorm - icon is day-storm-showers
else if (condcode==211) return 3; //Condcode is thunderstorm - icon is thunderstorm
else if (condcode==212) return 3; //Condcode is heavy thunderstorm - icon is thunderstorm
else if (condcode==221) return 1; //Condcode is ragged thunderstorm - icon is day-storm-showers
else if (condcode==230) return 1; //Condcode is thunderstorm with light drizzle - icon is day-storm-showers
else if (condcode==231) return 1; //Condcode is thunderstorm with drizzle - icon is day-storm-showers
else if (condcode==232) return 3; //Condcode is thunderstorm with heavy drizzle - icon is thunderstorm
else if (condcode==300) return 23; //Condcode is light intensity drizzle - icon is day-rain-mix
else if (condcode==301) return 5; //Condcode is drizzle - icon is hail
else if (condcode==302) return 5; //Condcode is heavy intensity drizzle - icon is hail
else if (condcode==310) return 23; //Condcode is light intensity drizzle rain - icon is day-rain-mix
else if (condcode==311) return 5; //Condcode is drizzle rain - icon is hail
else if (condcode==312) return 5; //Condcode is heavy intensity drizzle rain - icon is hail
else if (condcode==313) return 5; //Condcode is shower rain and drizzle - icon is hail
else if (condcode==314) return 5; //Condcode is heavy shower rain and drizzle - icon is hail
else if (condcode==321) return 5; //Condcode is shower drizzle - icon is hail
else if (condcode==500) return 23; //Condcode is light rain - icon is day-rain-mix
else if (condcode==501) return 6; //Condcode is moderate rain - icon is showers
else if (condcode==502) return 6; //Condcode is heavy intensity rain - icon is showers
else if (condcode==503) return 6; //Condcode is very heavy rain - icon is showers
else if (condcode==504) return 6; //Condcode is extreme rain - icon is showers
else if (condcode==511) return 5; //Condcode is freezing rain - icon is hail
else if (condcode==520) return 23; //Condcode is light intensity shower rain - icon is day-rain-mix
else if (condcode==521) return 6; //Condcode is shower rain - icon is showers
else if (condcode==522) return 6; //Condcode is heavy intensity shower rain - icon is showers
else if (condcode==531) return 6; //Condcode is ragged shower rain - icon is showers
else if (condcode==600) return 7; //Condcode is light snow - icon is snowflake-cold
else if (condcode==601) return 7; //Condcode is snow - icon is snowflake-cold
else if (condcode==602) return 7; //Condcode is heavy snow - icon is snowflake-cold
else if (condcode==611) return 4; //Condcode is sleet - icon is rain-mix
else if (condcode==612) return 4; //Condcode is shower sleet - icon is rain-mix
else if (condcode==615) return 4; //Condcode is light rain and snow - icon is rain-mix
else if (condcode==616) return 7; //Condcode is rain and snow - icon is snowflake-cold
else if (condcode==620) return 4; //Condcode is light shower snow - icon is rain-mix
else if (condcode==621) return 7; //Condcode is shower snow - icon is snowflake-cold
else if (condcode==622) return 7; //Condcode is heavy shower snow - icon is snowflake-cold
else if (condcode==701) return 9; //Condcode is mist - icon is fog
else if (condcode==711) return 12; //Condcode is smoke - icon is smoke
else if (condcode==721) return 10; //Condcode is haze - icon is windy
else if (condcode==731) return 8; //Condcode is sand, dust whirls - icon is dust
else if (condcode==741) return 9; //Condcode is fog - icon is fog
else if (condcode==751) return 8; //Condcode is sand - icon is dust
else if (condcode==761) return 8; //Condcode is dust - icon is dust
else if (condcode==762) return 8; //Condcode is volcanic ash - icon is dust
else if (condcode==771) return 1; //Condcode is squalls - icon is day-storm-showers
else if (condcode==781) return 0; //Condcode is tornado - icon is tornado
else if (condcode==800) return 17; //Condcode is clear sky - icon is sunny
else if (condcode==801) return 19; //Condcode is few clouds - icon is sunny-overcast
else if (condcode==802) return 14; //Condcode is scattered clouds - icon is day-cloudy
else if (condcode==803) return 13; //Condcode is broken clouds - icon is cloudy
else if (condcode==804) return 13; //Condcode is overcast clouds - icon is cloudy
else if (condcode==900) return 0; //Condcode is tornado - icon is tornado
else if (condcode==901) return 1; //Condcode is tropical storm - icon is day-storm-showers
else if (condcode==902) return 2; //Condcode is hurricane - icon is hurricane
else if (condcode==903) return 7; //Condcode is cold - icon is snowflake-cold
else if (condcode==904) return 25; //Condcode is hot - icon is thermometer
else if (condcode==905) return 11; //Condcode is windy - icon is strong-wind
else if (condcode==906) return 5; //Condcode is hail - icon is hail
else if (condcode==951) return 17; //Condcode is calm - icon is sunny
else if (condcode==952) return 10; //Condcode is light breeze - icon is windy
else if (condcode==953) return 10; //Condcode is gentle breeze - icon is windy
else if (condcode==954) return 10; //Condcode is moderate breeze - icon is windy
else if (condcode==955) return 11; //Condcode is fresh breeze - icon is strong-wind
else if (condcode==956) return 11; //Condcode is strong breeze - icon is strong-wind
else if (condcode==957) return 11; //Condcode is high wind, near gale - icon is strong-wind
else if (condcode==958) return 11; //Condcode is gale - icon is strong-wind
else if (condcode==959) return 11; //Condcode is severe gale - icon is strong-wind
else if (condcode==960) return 1; //Condcode is storm - icon is day-storm-showers
else if (condcode==961) return 1; //Condcode is violent storm - icon is day-storm-showers
else if (condcode==962) return 2; //Condcode is hurricane - icon is hurricane
else return 26;
}
// Function to translate Yahoo
function parseyahoo(condcode){
 if (condcode===0) return 0; //Condcode is tornado - icon is tornado
else if (condcode==1) return 1; //Condcode is tropical storm - icon is day-storm-showers
else if (condcode==2) return 2; //Condcode is hurricane - icon is hurricane
else if (condcode==3) return 3; //Condcode is severe thunderstorms - icon is thunderstorm
else if (condcode==4) return 3; //Condcode is thunderstorms - icon is thunderstorm
else if (condcode==5) return 4; //Condcode is mixed rain and snow - icon is rain-mix
else if (condcode==6) return 4; //Condcode is mixed rain and sleet - icon is rain-mix
else if (condcode==7) return 4; //Condcode is mixed snow and sleet - icon is rain-mix
else if (condcode==8) return 5; //Condcode is freezing drizzle - icon is hail
else if (condcode==9) return 6; //Condcode is drizzle - icon is showers
else if (condcode==10) return 5; //Condcode is freezing rain - icon is hail
else if (condcode==11) return 6; //Condcode is showers - icon is showers
else if (condcode==12) return 23; //Condcode is showers - icon is day-rain-mix
else if (condcode==13) return 7; //Condcode is snow flurries - icon is snowflake-cold
else if (condcode==14) return 7; //Condcode is light snow showers - icon is snowflake-cold
else if (condcode==15) return 7; //Condcode is blowing snow - icon is snowflake-cold
else if (condcode==16) return 7; //Condcode is snow - icon is snowflake-cold
else if (condcode==17) return 5; //Condcode is hail - icon is hail
else if (condcode==18) return 4; //Condcode is sleet - icon is rain-mix
else if (condcode==19) return 8; //Condcode is dust - icon is dust
else if (condcode==20) return 9; //Condcode is foggy - icon is fog
else if (condcode==21) return 8; //Condcode is haze - icon is dust
else if (condcode==22) return 12; //Condcode is smoky - icon is smoke
else if (condcode==23) return 11; //Condcode is blustery - icon is strong-wind
else if (condcode==24) return 10; //Condcode is windy - icon is windy
else if (condcode==25) return 7; //Condcode is cold - icon is snowflake-cold
else if (condcode==26) return 13; //Condcode is cloudy - icon is cloudy
else if (condcode==27) return 15; //Condcode is mostly cloudy (night) - icon is night-alt-cloudy
else if (condcode==28) return 14; //Condcode is mostly cloudy (day) - icon is day-cloudy
else if (condcode==29) return 15; //Condcode is partly cloudy (night) - icon is night-alt-cloudy
else if (condcode==30) return 14; //Condcode is partly cloudy (day) - icon is day-cloudy
else if (condcode==31) return 16; //Condcode is clear (night) - icon is night-clear
else if (condcode==32) return 17; //Condcode is sunny - icon is sunny
else if (condcode==33) return 18; //Condcode is fair (night) - icon is night-alt-partly-cloudy
else if (condcode==34) return 19; //Condcode is fair (day) - icon is sunny-overcast
else if (condcode==35) return 4; //Condcode is mixed rain and hail - icon is rain-mix
else if (condcode==36) return 25; //Condcode is hot - icon is thermometer
else if (condcode==37) return 1; //Condcode is isolated thunderstorms - icon is day-storm-showers
else if (condcode==38) return 1; //Condcode is scattered thunderstorms - icon is day-storm-showers
else if (condcode==39) return 1; //Condcode is scattered thunderstorms - icon is day-storm-showers
else if (condcode==40) return 6; //Condcode is scattered showers - icon is showers
else if (condcode==41) return 7; //Condcode is heavy snow - icon is snowflake-cold
else if (condcode==42) return 7; //Condcode is scattered snow showers - icon is snowflake-cold
else if (condcode==43) return 7; //Condcode is heavy snow - icon is snowflake-cold
else if (condcode==44) return 19; //Condcode is partly cloudy - icon is sunny-overcast
else if (condcode==45) return 1; //Condcode is thundershowers - icon is day-storm-showers
else if (condcode==46) return 7; //Condcode is snow showers - icon is snowflake-cold
else if (condcode==47) return 1; //Condcode is isolated thundershowers - icon is day-storm-showers
else return 26;
}
// Function to translate wu
function parsewu(condcode){
 if (condcode=='chanceflurries') return 7; //Condcode is Chance of Flurries - icon is snowflake-cold
 else if (condcode=='chancerain') return 6; //Condcode is Chance of Rain - icon is showers
 else if (condcode=='chancerain') return 6; //Condcode is Chance Rain - icon is showers
 else if (condcode=='chancesleet') return 4; //Condcode is Chance of Freezing Rain - icon is rain-mix
 else if (condcode=='chancesleet') return 4; //Condcode is Chance of Sleet - icon is rain-mix
 else if (condcode=='chancesnow') return 7; //Condcode is Chance of Snow - icon is snowflake-cold
 else if (condcode=='chancetstorms') return 3; //Condcode is Chance of Thunderstorms - icon is thunderstorm
 else if (condcode=='chancetstorms') return 3; //Condcode is Chance of a Thunderstorm - icon is thunderstorm
 else if (condcode=='clear') return 17; //Condcode is Clear - icon is sunny
 else if (condcode=='cloudy') return 13; //Condcode is Cloudy - icon is cloudy
 else if (condcode=='flurries') return 7; //Condcode is Flurries - icon is snowflake-cold
 else if (condcode=='fog') return 9; //Condcode is Fog - icon is fog
 else if (condcode=='hazy') return 8; //Condcode is Haze - icon is dust
 else if (condcode=='mostlycloudy') return 14; //Condcode is Mostly Cloudy - icon is day-cloudy
 else if (condcode=='mostlysunny') return 19; //Condcode is Mostly Sunny - icon is sunny-overcast
 else if (condcode=='partlycloudy') return 19; //Condcode is Partly Cloudy - icon is sunny-overcast
 else if (condcode=='partlysunny') return 14; //Condcode is Partly Sunny - icon is day-cloudy
 else if (condcode=='sleet') return 4; //Condcode is Freezing Rain - icon is rain-mix
 else if (condcode=='rain') return 6; //Condcode is Rain - icon is showers
 else if (condcode=='sleet') return 4; //Condcode is Sleet - icon is rain-mix
 else if (condcode=='snow') return 7; //Condcode is Snow - icon is snowflake-cold
 else if (condcode=='sunny') return 17; //Condcode is Sunny - icon is sunny
 else if (condcode=='tstorms') return 3; //Condcode is Thunderstorms - icon is thunderstorm
 else if (condcode=='tstorms') return 3; //Condcode is Thunderstorm - icon is thunderstorm
 else if (condcode=='unknown') return 26; //Condcode is Unknown - icon is na
 else if (condcode=='cloudy') return 13; //Condcode is Overcast - icon is cloudy
 else if (condcode=='partlycloudy') return 19; //Condcode is Scattered Clouds - icon is sunny-overcast
 else return 26;
}