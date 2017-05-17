#include <pebble.h>
#include "weathericon.h"
#include "string.h"
static const char* const iconmap[]={
  "a", //tornado
  "b", //day-storm-showers
  "c", //hurricane
  "d", //thunderstorm
  "e", //rain-mix
  "f", //hail
  "g", //showers
  "h", //snowflake-cold
  "i", //dust
  "j", //fog
  "k", //windy
  "l", //strong-wind
  "m", //smoke
  "n", //cloudy
  "o", //day-cloudy
  "o", //day-cloudy
  "r", //sunny
  "r", //sunny
  "t", //sunny-overcast
  "t", //sunny-overcast
  "u", //hot
  "v", //stars
  "b", //day-storm-showers
  "x", //day-rain-mix
  "x", //day-rain-mix
  "z", //thermometer
  "0", //na
};
static const char* const iconmapnight[]={
  "a", //tornado
  "w", //night-alt-storm-showers
  "c", //hurricane
  "d", //thunderstorm
  "e", //rain-mix
  "f", //hail
  "g", //showers
  "h", //snowflake-cold
  "i", //dust
  "j", //fog
  "k", //windy
  "l", //strong-wind
  "m", //smoke
  "n", //cloudy
  "p", //night-alt-cloudy
  "p", //night-alt-cloudy
  "q", //night-clear
  "q", //night-clear
  "s", //night-alt-partly-cloudy
  "s", //night-alt-partly-cloudy
  "u", //hot
  "v", //stars
  "w", //night-alt-storm-showers
  "y", //night-alt-rain-mix
  "y", //night-alt-rain-mix
  "z", //thermometer
  "0", //na
};
void get_conditions(int condtosearch, char *conditionnow, bool alreadynight ){
  if (alreadynight){
    strcpy(conditionnow, iconmapnight[condtosearch]);
  }
  else strcpy(conditionnow, iconmap[condtosearch]);
}