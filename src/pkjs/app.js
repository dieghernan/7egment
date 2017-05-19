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
  var langtouse=translatewu(navigator.language);
  // Construct URL
  var urlWU = "http://api.wunderground.com/api/"+
      endapikey + "/conditions/astronomy/lang:"+langtouse+"/q/"+
      lat+","+lon+
      ".json";
  console.log("WUUrl= " + urlWU);
  xhrRequest(encodeURI(urlWU), 'GET', function(responseText) {
    // responseText contains a JSON object with weather info
    var json = JSON.parse(responseText);
    localStorage.setItem("OKAPI", 0);
    // Temperature
    var tempf = Math.round(json.current_observation.temp_f)+ units;
    var tempc = Math.round(json.current_observation.temp_c)+ units;
    var tempwu=temptousewu(units,tempf,tempc);
    // Condition
    var condwu=json.current_observation.weather;
    var condclean=replaceDiacritics(condwu);
    // City
    var citywu = json.current_observation.display_location.city;
    var cityclean=replaceDiacritics(citywu);
    // Sunrise and Sunset
    var sunrisewu=parseInt(json.sun_phase.sunrise.hour*100)+parseInt(json.sun_phase.sunrise.minute*1);
    var sunsetwu=parseInt(json.sun_phase.sunset.hour*100)+parseInt(json.sun_phase.sunset.minute*1);
    localStorage.setItem("OKAPI", 1);
    console.log("OK API");
    // Assemble dictionary
    var dictionary = {
      "WeatherTemp": tempwu,
      "WeatherCond": condclean,
      "HourSunset": sunsetwu,
      "HourSunrise":sunrisewu,
      "NameLocation": cityclean
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
    var tempowm = Math.round(json.main.temp)+units;
    // Conditions
    var condowm=json.weather[0].description;
    var condclean=replaceDiacritics(condowm);
    // Sunrise and Sunset
    var auxsunowm =new Date(json.sys.sunrise*1000);
    var sunriseowm=auxsunowm.getHours()*100+auxsunowm.getMinutes();
    var auxsetowm =new Date(json.sys.sunset*1000);
    var sunsetowm=auxsetowm.getHours()*100+auxsetowm.getMinutes();
    // Location
    var cityowm=json.name;
    var cityclean=replaceDiacritics(cityowm);
    localStorage.setItem("OKAPI", 1);
    console.log("OK API");
    // Assemble dictionary using our keys
    var dictionary = {
      "WeatherTemp": tempowm,
      "WeatherCond": condclean,
      "HourSunset": sunsetowm,
      "HourSunrise":sunriseowm,
      "NameLocation": cityclean
    };
    // Send to Pebble
    Pebble.sendAppMessage(dictionary,
                          function(e) {console.log("Weather from OWM sent to Pebble successfully!");},
                          function(e) { console.log("Error sending OWM info to Pebble!");}
                         );
  });
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
  if (weatherprov=="wu"){
    console.log("Ready from WU");
    navigator.geolocation.getCurrentPosition(
      locationSuccessWU,
      locationError,
      {enableHighAccuracy:true,timeout: 15000, maximumAge: 1000}
    );
  }
  else {
    console.log("Ready from OWM");
    navigator.geolocation.getCurrentPosition(
      locationSuccessOWM,
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
function translatewu(langloc){
  if (langloc==='es-ES'){
    return 'SP';
  }
  else if (langloc==='fr_FR'){
    return 'FR';
  }
  else if (langloc==='de_DE'){
    return 'DL';
  }
  else if (langloc==='it_IT'){
    return 'IT';
  }
  else if (langloc==='pt_PT'){
    return 'BR';
  }
  else {
    return 'EN';
  }
}
function temptousewu(unit,tempf,tempc){
  if (unit=="f"){
    return tempf; }
  else return tempc;
}
function replaceDiacritics(s){
    var diacritics =[
        /[\300-\306]/g, /[\340-\346]/g,  // A, a
        /[\310-\313]/g, /[\350-\353]/g,  // E, e
        /[\314-\317]/g, /[\354-\357]/g,  // I, i
        /[\322-\330]/g, /[\362-\370]/g,  // O, o
        /[\331-\334]/g, /[\371-\374]/g,  // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];

    var chars = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

    for (var i = 0; i < diacritics.length; i++)
    {
        s = s.replace(diacritics[i],chars[i]);
    }
  var end=s;
  return end;
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