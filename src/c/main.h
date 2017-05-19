#pragma once
#include <pebble.h>
#define SETTINGS_KEY 1
// A structure containing our settings
typedef struct ClaySettings {
  GColor Back1Color;
  GColor Back2Color;
  GColor FrameColor;
  GColor Text1Color;
  GColor Text2Color;
  GColor Back1ColorN;
  GColor Back2ColorN;
  GColor FrameColorN;
  GColor Text1ColorN;
  GColor Text2ColorN;  
  bool WeatherUnit;
  int WeatherCond;
  int UpSlider;
  int HourSunrise;
  int HourSunset;
  char* WeatherTemp;
  bool BTOn;
  bool GPSOn;
  bool NightTheme;
  bool IsNightNow;
} __attribute__((__packed__)) ClaySettings;