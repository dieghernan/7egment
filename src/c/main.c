#include <pebble.h>
#include "main.h"
#include "weekday.h"
#include "weathericon.h"
//Static and initial vars
static GFont FontHour,  FontMinute, FontDate, FontTemp, FontCond, FontCiti, FontSymbol, FontBatt;
char tempstring[44], condstring[44], citistring[44];
static Window * s_window;
static Layer * s_canvas;
static int s_hours, s_minutes, s_weekday, s_day, s_loop, s_countdown;
//////Init Configuration///
//Init Clay
ClaySettings settings;
// Initialize the default settings
static void prv_default_settings(){
  settings.BackgroundColor = GColorWhite;
  settings.ForegroundColor = GColorOxfordBlue;
  settings.HourColor=GColorRed;
  settings.MinColor=GColorOxfordBlue;
  settings.HourColorNight=GColorOrange;
  settings.MinColorNight=GColorWhite;
  settings.DotsColor = GColorBlueMoon;
  settings.BatteryColor = GColorPictonBlue;
  settings.BackgroundColorNight = GColorPictonBlue;
  settings.ForegroundColorNight = GColorOrange;
  settings.DotsColorNight = GColorOrange;
  settings.BatteryColorNight = GColorOrange;
  settings.WeatherUnit = false;
  settings.WeatherCond = 0;
  settings.UpSlider = 30;
  settings.HourSunrise = 600;
  settings.HourSunset = 1700;
  settings.DisplayLoc = false;
  settings.DisplayDate = false;
  settings.DisplayLoc = false;
  settings.DisplayDots = false;
  settings.DisplayBattery = false;
  settings.BTOn = true;
  settings.GPSOn = false;
  settings.NightTheme = true;
  settings.IsNightNow = false;
  settings.ClockMode=1;
}
//////End Configuration///
///////////////////////////
static int32_t get_angle_dot(int dot){
  // Progress through 12 hours, out of 360 degrees
  return (dot * 360) / 12;
}
static int get_angle_for_minutes(int minutes){
  int floor5=minutes/5;
  return (floor5*5 * 360) / 60;
};
static int get_angle_for_battery(int battery){
  int floor30 = (100 - battery) * 360 / 3000;
  return (floor30 * 30);
};
static int hourtodraw(bool hourformat, int hournow){
  if (hourformat){
    return hournow;
  } 
  else{
    if (hournow == 0){
      return 12;
    } else if (hournow <= 12){
      return hournow;
    } else{
      return hournow - 12;
    }
  }
};
static int xdaterect(bool is24, GRect hourect, GRect inner, GRect minrect){
  if (!is24 && settings.ClockMode==1){
    return hourect.origin.x - (inner.size.w / 2 - hourect.size.w / 2 - minrect.size.w / 2 + 3);
  } 
  else if(!is24 && settings.ClockMode==3){
    return hourect.origin.x + hourect.size.w + 1+20;
  }
  else return  hourect.origin.x + hourect.size.w + 1;
}
static GColor ColorSelect(GColor ColorDay, GColor ColorNight){
  if (settings.NightTheme && settings.IsNightNow ){
    return ColorNight;
  } 
  else{
    return ColorDay;
  }
}
static GTextAlignment AlignDate(bool is24){
  if (!is24 && settings.ClockMode==1){
    return GTextAlignmentRight;
  } else{
    return GTextAlignmentLeft;
  }
}
// Callback for js request
void request_watchjs(){
  //Starting loop at 0
  s_loop = 0;
  // Begin dictionary
  DictionaryIterator * iter;
  app_message_outbox_begin( & iter);
  // Add a key-value pair
  dict_write_uint8(iter, 0, 0);
  // Send the message!
  app_message_outbox_send();
}
///BT Connection
static void bluetooth_callback(bool connected){
  settings.BTOn = connected;
}
static void onreconnection(bool before, bool now){
  if (!before && now){
    APP_LOG(APP_LOG_LEVEL_DEBUG, "BT reconnected, requesting weather at %d", s_minutes);
    request_watchjs();
  }
}
//Update main layer
static void layer_update_proc(Layer * layer, GContext * ctx){
  // Settings: Colors
  graphics_context_set_text_color(ctx, ColorSelect(settings.ForegroundColor, settings.ForegroundColorNight));
  graphics_context_set_stroke_color(ctx, ColorSelect(settings.ForegroundColor, settings.ForegroundColorNight));
  // Create Rects
  GRect bounds = layer_get_bounds(layer);
  //Reference
  graphics_draw_line(ctx, GPoint(-10,bounds.size.h/2), GPoint(bounds.size.w+10, bounds.size.h/2));
  //Hour and Minute
  int hourtodraw;
  if (clock_is_24h_style()){
    hourtodraw=s_hours;
  }
  else {
    if (s_hours==0 || s_hours==12){
      hourtodraw=12;
    }
    else hourtodraw=s_hours%12;    
  }
  char hourminnow[8];
  snprintf(hourminnow, sizeof(hourminnow), "%02d:%02d", hourtodraw,s_minutes);
   GRect HourMinRect = GRect(bounds.origin.x, bounds.size.h/2-20, bounds.size.w, 60) ;
  graphics_draw_text(ctx, hourminnow, FontHour, HourMinRect, GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL); 
 //Frame
  graphics_context_set_stroke_width(ctx, 3);
  GRect MediumBand= GRect(-10, bounds.size.h/4, bounds.size.w+20, bounds.size.h/2);
  graphics_draw_rect(ctx, MediumBand); 
  //Date
  // Local language
  const char * sys_locale = i18n_get_system_locale();
  char datenow[44];
  fetchwday(s_weekday, sys_locale, datenow);
  char convertday[4];
  snprintf(convertday, sizeof(convertday), " %02d", s_day);
  // Concatenate date
  strcat(datenow, convertday);
  int offsetdate = PBL_IF_RECT_ELSE(5, 10);
  GRect DateRect = GRect(0, offsetdate, bounds.size.w, bounds.size.h/4);
  graphics_draw_text(ctx, datenow, FontDate, DateRect, GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  //Battery
  int battery_level = battery_state_service_peek().charge_percent;
  char battperc[4];
  snprintf(battperc, sizeof(battperc), "%d", battery_level);
  strcat(battperc, "%");
  GRect BattRec = GRect(bounds.size.w*1/5-10,MediumBand.origin.y+1,bounds.size.w*3/5+20,20);
  graphics_draw_text(ctx, battperc, FontBatt, BattRec, GTextOverflowModeWordWrap, GTextAlignmentRight, NULL);
  // AM PM 24H
  char ampm[4];
  if (clock_is_24h_style()){
    snprintf(ampm, sizeof(ampm), "24H");
  }
  else if (s_hours<12){
    snprintf(ampm, sizeof(ampm), "AM");    
  }
  else {
    snprintf(ampm, sizeof(ampm), "PM"); 
  }
  graphics_draw_text(ctx, ampm, FontBatt, BattRec, GTextOverflowModeWordWrap, GTextAlignmentLeft, NULL);
  // Location
  char location[20];
  snprintf(location, sizeof(location), "%s", citistring);
  GRect TempLoc = GRect(0, MediumBand.origin.y+MediumBand.size.h-25, bounds.size.w, 20);
  graphics_draw_text(ctx, location, FontBatt, TempLoc, GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);  
  // Temp and contition
  char temp1[80];
  snprintf(temp1, sizeof(temp1), "%s", tempstring);
  graphics_draw_text(ctx, temp1, FontBatt, BattRec, GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  char cond1[80];
  snprintf(cond1, sizeof(cond1), "%s", condstring);
  GRect CondRect =GRect(0, bounds.size.h*3/4, bounds.size.w, bounds.size.h/3);
  graphics_draw_text(ctx, cond1, FontBatt, CondRect, GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
}
/////////////////////////////////////////
////Init: Handle Settings and Weather////
/////////////////////////////////////////
// Read settings from persistent storage
static void prv_load_settings(){
  // Load the default settings
  prv_default_settings();
  // Read settings from persistent storage, if they exist
  persist_read_data(SETTINGS_KEY, & settings, sizeof(settings));
}
// Save the settings to persistent storage
static void prv_save_settings(){
  persist_write_data(SETTINGS_KEY, & settings, sizeof(settings));
}
// Handle the response from AppMessage
static void prv_inbox_received_handler(DictionaryIterator * iter, void * context){
  s_loop = s_loop + 1;
  if (s_loop == 1){
    //Clean vars
    strcpy(tempstring, "");
    strcpy(condstring, "");
    strcpy(citistring, "");
  }
  // Background Color
  Tuple * bg_color_t = dict_find(iter, MESSAGE_KEY_BackgroundColor);
  if (bg_color_t){
    settings.BackgroundColor = GColorFromHEX(bg_color_t-> value -> int32);
  }
  Tuple * nbg_color_t = dict_find(iter, MESSAGE_KEY_BackgroundColorNight);
  if (nbg_color_t){
    settings.BackgroundColorNight = GColorFromHEX(nbg_color_t -> value -> int32);
  }
  // Foreground Color
  Tuple * fg_color_t = dict_find(iter, MESSAGE_KEY_ForegroundColor);
  if (fg_color_t){
    settings.ForegroundColor = GColorFromHEX(fg_color_t -> value -> int32);
  }
  Tuple * nfg_color_t = dict_find(iter, MESSAGE_KEY_ForegroundColorNight);
  if (nfg_color_t){
    settings.ForegroundColorNight = GColorFromHEX(nfg_color_t -> value -> int32);
  }
  // Dots Color
  Tuple * dt_color_t = dict_find(iter, MESSAGE_KEY_DotsColor);
  if (dt_color_t){
    settings.DotsColor = GColorFromHEX(dt_color_t -> value -> int32);
  }
  Tuple * ndt_color_t = dict_find(iter, MESSAGE_KEY_DotsColorNight);
  if (ndt_color_t){
    settings.DotsColorNight = GColorFromHEX(ndt_color_t -> value -> int32);
  }
  //Battery Color
  Tuple * batt_color_t = dict_find(iter, MESSAGE_KEY_BatteryColor);
  if (batt_color_t){
    settings.BatteryColor = GColorFromHEX(batt_color_t -> value -> int32);
  }
  Tuple * nbatt_color_t = dict_find(iter, MESSAGE_KEY_BatteryColorNight);
  if (nbatt_color_t){
    settings.BatteryColorNight = GColorFromHEX(nbatt_color_t -> value -> int32);
  }
  Tuple * hour_color_t = dict_find(iter, MESSAGE_KEY_HourColor);
  if (hour_color_t){
    settings.HourColor = GColorFromHEX(hour_color_t -> value -> int32);
  }
  Tuple * nhour_color_t = dict_find(iter, MESSAGE_KEY_HourColorNight);
  if (nhour_color_t){
    settings.HourColorNight = GColorFromHEX(nhour_color_t -> value -> int32);
  }
  Tuple * min_color_t = dict_find(iter, MESSAGE_KEY_MinColor);
  if (min_color_t){
    settings.MinColor = GColorFromHEX(min_color_t -> value -> int32);
  }
  Tuple * nmin_color_t = dict_find(iter, MESSAGE_KEY_MinColorNight);
  if (nmin_color_t){
    settings.MinColorNight = GColorFromHEX(nmin_color_t -> value -> int32);
  }
  //Control of data from http
  // Weather Cond
  Tuple * wcond_t = dict_find(iter, MESSAGE_KEY_WeatherCond);
  if (wcond_t){
    get_conditions((int) wcond_t -> value -> int32, condstring, settings.IsNightNow);
  }
  // Weather Temp
  Tuple * wtemp_t = dict_find(iter, MESSAGE_KEY_WeatherTemp);
  if (wtemp_t){
    snprintf(tempstring, sizeof(tempstring), "%s", wtemp_t -> value -> cstring);
  }
  //Hour Sunrise and Sunset
  Tuple * sunrise_t = dict_find(iter, MESSAGE_KEY_HourSunrise);
  if (sunrise_t){
    settings.HourSunrise = (int) sunrise_t -> value -> int32;
  }
  Tuple * sunset_t = dict_find(iter, MESSAGE_KEY_HourSunset);
  if (sunset_t){
    settings.HourSunset = (int) sunset_t -> value -> int32;
  }
  // Location
  Tuple * neigh_t = dict_find(iter, MESSAGE_KEY_NameLocation);
  if (neigh_t){
    snprintf(citistring, sizeof(citistring), "%s", neigh_t -> value -> cstring);
  }
  //Control of data gathered for http
  APP_LOG(APP_LOG_LEVEL_DEBUG, "After loop %d temp is %s Cond is %s and City is %s Sunrise is %d Sunset is %d", s_loop, tempstring, condstring, citistring, settings.HourSunrise, settings.HourSunset);
  if (strcmp(tempstring, "") != 0 && strcmp(condstring, "") != 0 && strcmp(citistring, "")){
    APP_LOG(APP_LOG_LEVEL_DEBUG, "GPS fully working at loop %d", s_loop);
    settings.GPSOn = true;
  } else{
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Missing info at loop %d, GPS false", s_loop);
    settings.GPSOn = false;
  }
  //End data gathered
  // Get display handlers
  Tuple * frequpdate = dict_find(iter, MESSAGE_KEY_UpSlider);
  if (frequpdate){
    settings.UpSlider = (int) frequpdate -> value -> int32;
    //Restart the counter
    s_countdown = settings.UpSlider;
  }
  Tuple * disdate_t = dict_find(iter, MESSAGE_KEY_DisplayDate);
  if (disdate_t){
    if (disdate_t -> value -> int32 == 0){
      settings.DisplayDate = false;
    } else settings.DisplayDate = true;
  }
  Tuple * distemp_t = dict_find(iter, MESSAGE_KEY_DisplayTemp);
  if (distemp_t){
    if (distemp_t -> value -> int32 == 0){
      settings.DisplayTemp = false;
    } else settings.DisplayTemp = true;
  }
  Tuple * disloc_t = dict_find(iter, MESSAGE_KEY_DisplayLoc);
  if (disloc_t){
    if (disloc_t -> value -> int32 == 0){
      settings.DisplayLoc = false;
    } else settings.DisplayLoc = true;
  }
  Tuple * disdot_t = dict_find(iter, MESSAGE_KEY_DisplayDots);
  if (disdot_t){
    if (disdot_t -> value -> int32 == 0){
      settings.DisplayDots = false;
    } else settings.DisplayDots = true;
  }
  Tuple * disbatt_t = dict_find(iter, MESSAGE_KEY_DisplayBattery);
  if (disbatt_t){
    if (disbatt_t -> value -> int32 == 0){
      settings.DisplayBattery = false;
    } else settings.DisplayBattery = true;
  }
  Tuple * disntheme_t = dict_find(iter, MESSAGE_KEY_NightTheme);
  if (disntheme_t){
    if (disntheme_t -> value -> int32 == 0){
      settings.NightTheme = false;
      APP_LOG(APP_LOG_LEVEL_DEBUG, "NTHeme off");
    } else settings.NightTheme = true;
  }
  Tuple * clockmode_t = dict_find(iter, MESSAGE_KEY_ClockMode);
  if (clockmode_t){
    settings.ClockMode=atoi(clockmode_t->value->cstring);
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Mode %d",settings.ClockMode);
  }
  //Update colors
  layer_mark_dirty(s_canvas);
  window_set_background_color(s_window, ColorSelect( settings.BackgroundColor, settings.BackgroundColorNight));
  // Save the new settings to persistent storage
  prv_save_settings();
}
//Load main layer
static void window_load(Window * window){
  Layer * window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);
  s_canvas = layer_create(bounds);
  layer_set_update_proc(s_canvas, layer_update_proc);
  layer_add_child(window_layer, s_canvas);
}
static void window_unload(Window * window){
  layer_destroy(s_canvas);
  window_destroy(s_window);
  fonts_unload_custom_font(FontTemp);
  fonts_unload_custom_font(FontHour);
  fonts_unload_custom_font(FontMinute);
  fonts_unload_custom_font(FontCiti);
  fonts_unload_custom_font(FontCond);
  fonts_unload_custom_font(FontSymbol);
  fonts_unload_custom_font(FontDate);
  fonts_unload_custom_font(FontBatt);
}
void main_window_push(){
  s_window = window_create();
  window_set_background_color(s_window, ColorSelect(settings.BackgroundColor, settings.BackgroundColorNight));
  window_set_window_handlers(s_window, (WindowHandlers){
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(s_window, true);
}
void main_window_update(int hours, int minutes, int weekday, int day){
  s_hours = hours;
  s_minutes = minutes;
  s_day = day;
  s_weekday = weekday;
  layer_mark_dirty(s_canvas);
}
static void tick_handler(struct tm * time_now, TimeUnits changed){
  main_window_update(time_now -> tm_hour, time_now -> tm_min, time_now -> tm_wday, time_now -> tm_mday);
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Tick at %d", time_now -> tm_min);
  s_loop = 0;
  if (s_countdown == 0){
    //Reset
    s_countdown = settings.UpSlider;
  } else{
    s_countdown = s_countdown - 1;
  }
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Countdown to update %d", s_countdown);
  // Evaluate if is day or night
  int nowthehouris = s_hours * 100 + s_minutes;
  if (settings.HourSunrise <= nowthehouris && nowthehouris <= settings.HourSunset){
    settings.IsNightNow = false;
  } else{
    settings.IsNightNow = true;
  }
  // Extra catch on sunrise and sunset
  if (nowthehouris == settings.HourSunrise || nowthehouris == settings.HourSunset){
    s_countdown = 1;
  }
  if (settings.GPSOn && settings.NightTheme){
    //Extra catch around 1159 to gather information of today
    if (nowthehouris == 1159 && s_countdown > 5){
      s_countdown = 1;
    };
    // Change Color of background
    layer_mark_dirty(s_canvas);
    window_set_background_color(s_window, ColorSelect( settings.BackgroundColor, settings.BackgroundColorNight));
  }
  // Get weather update every requested minutes and extra request 5 minutes earlier
  if (s_countdown == 0 || s_countdown == 5){
    if (settings.DisplayTemp || settings.DisplayLoc){
      APP_LOG(APP_LOG_LEVEL_DEBUG, "Update weather at %d", time_now -> tm_min);
      request_watchjs();
    }
  }
  //If GPS was off request weather every 15 minutes
  if (!settings.GPSOn){
    if (settings.DisplayTemp || settings.DisplayLoc){
      if (settings.UpSlider > 15){
        if (s_countdown % 15 == 0){
          APP_LOG(APP_LOG_LEVEL_DEBUG, "Attempt to request GPS on %d", time_now -> tm_min);
          request_watchjs();
        }
      }
    }
  }
}
static void init(){
  prv_load_settings();
  // Listen for AppMessages
  //Starting loop at 0
  s_loop = 0;
  s_countdown = settings.UpSlider;
  //Clean vars
  strcpy(tempstring, "");
  strcpy(condstring, "");
  strcpy(citistring, "");
  time_t now = time(NULL);
  struct tm *t = localtime(&now);
  s_hours=t->tm_hour;
  s_minutes=t->tm_min;
  s_day=t->tm_mday;
  s_weekday=t->tm_wday;
  //Register and open
  app_message_register_inbox_received(prv_inbox_received_handler);
  app_message_open(512, 512);
  // Load Fonts
  FontHour = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_DIG_40));
  FontMinute = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_GBOLD_22));
  FontDate = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_DIGITAL_25));
  FontTemp = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_GLIGHT_14));
  FontCond = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_WICON_22));
  FontCiti = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_GLIGHT_10));
  FontSymbol = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_SYMBOL_16));
  FontBatt  = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_DIGITAL_19));  
  main_window_push();
  // Register with Event Services
  tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);
  connection_service_subscribe((ConnectionHandlers){
    .pebble_app_connection_handler = bluetooth_callback
  });
}
static void deinit(){
  tick_timer_service_unsubscribe();
  app_message_deregister_callbacks(); //Destroy the callbacks for clean up
}
int main(){
  init();
  app_event_loop();
  deinit();
}