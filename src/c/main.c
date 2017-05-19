#include <pebble.h>
#include "main.h"
#include "weekday.h"
//Static and initial vars
static GFont FontHour, FontDate,FontComp;
char tempstring[44], condstring[44], citistring[44];
static Window * s_window;
static Layer * s_canvas;
static int s_hours, s_minutes, s_weekday, s_day, s_loop, s_countdown;
//////Init Configuration///
//Init Clay
ClaySettings settings;
// Initialize the default settings
static void prv_default_settings(){
  settings.Back1Color = GColorBlack;
  settings.Back2Color= GColorBlack;
  settings.FrameColor = GColorWhite;
  settings.Text1Color = GColorWhite;
  settings.Text2Color = GColorWhite;
  settings.Back1ColorN = GColorWhite;
  settings.Back2ColorN = GColorWhite;
  settings.FrameColorN = GColorBlack;
  settings.Text1ColorN = GColorBlack;
  settings.Text2ColorN = GColorBlack; 
  settings.WeatherUnit = false;
  settings.WeatherCond = 0;
  settings.UpSlider = 30;
  settings.HourSunrise = 600;
  settings.HourSunset = 1700;
  settings.BTOn = true;
  settings.GPSOn = false;
  settings.NightTheme = true;
  settings.IsNightNow = false;
}
//////End Configuration///
///////////////////////////
static GColor ColorSelect(GColor ColorDay, GColor ColorNight){
  if (settings.NightTheme && settings.IsNightNow &&settings.GPSOn ){
    return ColorNight;
  } 
  else{
    return ColorDay;
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
  // Create Rects
  GRect bounds = layer_get_bounds(layer);
  GRect MediumBand= GRect(-10, bounds.size.h/4, bounds.size.w+20, bounds.size.h/2);
  GRect HourMinRect = GRect(bounds.origin.x, bounds.size.h/2-20, bounds.size.w, 60) ;
  int offsetdate = PBL_IF_RECT_ELSE(5, 10);
  GRect DateRect = GRect(0, offsetdate, bounds.size.w, bounds.size.h/4);
  GRect UpRec = GRect(bounds.size.w*1/5-10,MediumBand.origin.y,bounds.size.w*3/5+20,20);
  GRect LocRec = GRect(0, MediumBand.origin.y+MediumBand.size.h-25, bounds.size.w, 20);
  int round=PBL_IF_ROUND_ELSE(1, 0);
  GRect CondRectRound =GRect(UpRec.origin.x-5, MediumBand.origin.y+MediumBand.size.h, UpRec.size.w+10, bounds.size.h-MediumBand.origin.y-MediumBand.size.h);
  GRect CondRect =GRect(bounds.origin.x, MediumBand.origin.y+MediumBand.size.h, bounds.size.w,bounds.size.h-MediumBand.origin.y-MediumBand.size.h); 
  //Prepare Strings
  //Hour and minute
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
  //Date
  // Local language
  const char * sys_locale = i18n_get_system_locale();
  char datenow[44];
  fetchwday(s_weekday, sys_locale, datenow);
  char convertday[4];
  snprintf(convertday, sizeof(convertday), " %02d", s_day);
  // Concatenate date
  strcat(datenow, convertday);
  //Battery
  int battery_level = battery_state_service_peek().charge_percent;
  char battperc[4];
  snprintf(battperc, sizeof(battperc), "%d", battery_level);
  strcat(battperc, "%");
  // Draw AM PM 24H
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
  //Connection settings
  // Prepare to draw
  // Update connection toggle
  onreconnection(settings.BTOn, connection_service_peek_pebble_app_connection());
  bluetooth_callback(connection_service_peek_pebble_app_connection());
  char TempToDraw[80];
  char LocToDraw[20];
  char CondToDraw[80];
  if (!settings.BTOn){
    snprintf(TempToDraw, sizeof(TempToDraw), " ");
    snprintf(LocToDraw, sizeof(LocToDraw), " ");
    snprintf(CondToDraw, sizeof(CondToDraw), "Bluetooth Disc");
  }
  else if (!settings.GPSOn){
    snprintf(TempToDraw, sizeof(TempToDraw), " ");
    snprintf(LocToDraw, sizeof(LocToDraw), " ");
    snprintf(CondToDraw, sizeof(CondToDraw), "Weather NA");    
  }
  else {
    snprintf(TempToDraw, sizeof(TempToDraw), "%s",tempstring);
    snprintf(LocToDraw, sizeof(LocToDraw), "%s",citistring);
    snprintf(CondToDraw, sizeof(CondToDraw), "%s",condstring);    
  }
  //Build display
  //Secondary  
  graphics_context_set_fill_color(ctx, ColorSelect(settings.Back2Color, settings.Back2ColorN));
  graphics_fill_rect(ctx, bounds, 0, GCornerNone);
  //Main  
  graphics_context_set_fill_color(ctx, ColorSelect(settings.Back1Color, settings.Back1ColorN));
  graphics_fill_rect(ctx, MediumBand,0,GCornerNone);
  //Frame
  graphics_context_set_stroke_width(ctx, 3);
  graphics_context_set_stroke_color(ctx, ColorSelect(settings.FrameColor, settings.FrameColorN)); 
  graphics_draw_rect(ctx, MediumBand);
  //Write
  //Main Band
  graphics_context_set_text_color(ctx, ColorSelect(settings.Text1Color, settings.Text1ColorN));
  graphics_draw_text(ctx, hourminnow, FontHour, HourMinRect, GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL); 
  graphics_draw_text(ctx, battperc, FontComp, UpRec, GTextOverflowModeWordWrap, GTextAlignmentRight, NULL);
  graphics_draw_text(ctx, ampm, FontComp, UpRec, GTextOverflowModeWordWrap, GTextAlignmentLeft, NULL);
  graphics_draw_text(ctx, TempToDraw, FontComp, UpRec, GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  graphics_draw_text(ctx, LocToDraw, FontComp, LocRec, GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  //Secondary
  graphics_context_set_text_color(ctx, ColorSelect(settings.Text2Color, settings.Text2ColorN));
  graphics_draw_text(ctx, datenow, FontDate, DateRect, GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  if (round==1){
    graphics_draw_text(ctx, CondToDraw, FontComp, CondRectRound, GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  }
  else {
    graphics_draw_text(ctx, CondToDraw, FontComp, CondRect, GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);      
  }
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
  Tuple * bg1_color_t = dict_find(iter, MESSAGE_KEY_Back1Color);
  if (bg1_color_t){
    settings.Back1Color = GColorFromHEX(bg1_color_t-> value -> int32);
  }
  Tuple * nbg1_color_t = dict_find(iter, MESSAGE_KEY_Back1ColorN);
  if (nbg1_color_t){
    settings.Back1ColorN = GColorFromHEX(nbg1_color_t-> value -> int32);
  }
  Tuple * bg2_color_t = dict_find(iter, MESSAGE_KEY_Back2Color);
  if (bg2_color_t){
    settings.Back2Color = GColorFromHEX(bg2_color_t-> value -> int32);
  }
  Tuple * nbg2_color_t = dict_find(iter, MESSAGE_KEY_Back2ColorN);
  if (nbg2_color_t){
    settings.Back2ColorN = GColorFromHEX(nbg2_color_t-> value -> int32);
  }  
  Tuple * tx1_color_t = dict_find(iter, MESSAGE_KEY_Text1Color);
  if (tx1_color_t){
    settings.Text1Color = GColorFromHEX(tx1_color_t-> value -> int32);
  }
  Tuple * ntx1_color_t = dict_find(iter, MESSAGE_KEY_Text1ColorN);
  if (ntx1_color_t){
    settings.Text1ColorN = GColorFromHEX(ntx1_color_t-> value -> int32);
  }
  Tuple * tx2_color_t = dict_find(iter, MESSAGE_KEY_Text2Color);
  if (tx2_color_t){
    settings.Text2Color = GColorFromHEX(tx2_color_t-> value -> int32);
  }
  Tuple * ntx2_color_t = dict_find(iter, MESSAGE_KEY_Text2ColorN);
  if (ntx2_color_t){
    settings.Text2ColorN = GColorFromHEX(ntx2_color_t-> value -> int32);
  }
  Tuple * frame_t = dict_find(iter, MESSAGE_KEY_FrameColor);
    if (frame_t){
    settings.FrameColor = GColorFromHEX(frame_t-> value -> int32);
  }
  Tuple * nframe_t = dict_find(iter, MESSAGE_KEY_FrameColorN);
    if (nframe_t){
    settings.FrameColorN = GColorFromHEX(nframe_t-> value -> int32);
  }  
  //Control of data from http
  // Weather Cond
  Tuple * wcond_t = dict_find(iter, MESSAGE_KEY_WeatherCond);
  if (wcond_t){
    snprintf(condstring, sizeof(condstring), "%s", wcond_t -> value -> cstring);
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
  Tuple * disntheme_t = dict_find(iter, MESSAGE_KEY_NightTheme);
  if (disntheme_t){
    if (disntheme_t -> value -> int32 == 0){
      settings.NightTheme = false;
      APP_LOG(APP_LOG_LEVEL_DEBUG, "NTHeme off");
    } else settings.NightTheme = true;
  } 
  //Update colors
  layer_mark_dirty(s_canvas);
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
  fonts_unload_custom_font(FontHour);
  fonts_unload_custom_font(FontComp);
}
void main_window_push(){
  s_window = window_create();
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
  }
  // Get weather update every requested minutes and extra request 5 minutes earlier
  if (s_countdown == 0 || s_countdown == 5){
      APP_LOG(APP_LOG_LEVEL_DEBUG, "Update weather at %d", time_now -> tm_min);
      request_watchjs();    
  }
  //If GPS was off request weather every 15 minutes
  if (!settings.GPSOn){
      if (settings.UpSlider > 15){
        if (s_countdown % 15 == 0){
          APP_LOG(APP_LOG_LEVEL_DEBUG, "Attempt to request GPS on %d", time_now -> tm_min);
          request_watchjs();
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
  FontDate = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_DIGITAL_25));
  FontComp  = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_DIGITAL_19));  
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