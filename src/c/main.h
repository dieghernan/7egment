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
  int WeatherCond;
  int UpSlider;
  char* WeatherTemp;
  bool NightTheme;
} __attribute__((__packed__)) ClaySettings;