#pragma once
#include <pebble.h>
#define SETTINGS_KEY 1
// A structure containing our settings
typedef struct ClaySettings {
  GColor BackgroundColor;
  GColor ForegroundColor;
  GColor DotsColor;
  GColor BatteryColor;
  GColor BackgroundColorNight;
  GColor ForegroundColorNight;
  GColor DotsColorNight;
  GColor BatteryColorNight;
  GColor HourColor;
  GColor HourColorNight;
  GColor MinColor;
  GColor MinColorNight;
  bool WeatherUnit;
  int WeatherCond;
  int UpSlider;
  int HourSunrise;
  int HourSunset;
  int ClockMode;
  char* WeatherTemp;
  bool DisplayDate;
  bool DisplayTemp;
  bool DisplayLoc;
  bool DisplayDots;
  bool DisplayBattery;
  bool BTOn;
  bool GPSOn;
  bool NightTheme;
  bool IsNightNow;
} __attribute__((__packed__)) ClaySettings;