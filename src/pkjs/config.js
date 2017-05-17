// Clay Config: see https://github.com/pebble/clay
module.exports = [
  {
    "type": "heading",
    "defaultValue": "Settings"
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Theme settings"
      },
      {
        "type": "select",
        "messageKey": "ClockMode",
        "label": "Clock Mode",
        "defaultValue": "1",
        "options": [
          {
            "label": "Digital",
            "value": "1"
          },
          {
            "label": "Analog",
            "value": "2"
          },
          {
            "label": "Dual",
            "value": "3"
          }
        ]
      },
      {
        "type": "toggle",
        "messageKey": "DisplayDate",
        "label": "Date",
        "defaultValue": false
      },
      {
        "type": "toggle",
        "messageKey": "DisplayDots",
        "label": "Display Dots",
        "defaultValue": false
      },
      {
        "type": "toggle",
        "messageKey": "DisplayBattery",
        "label": "Display Battery Level",
        "defaultValue": false,
        "description": "Displayed as a clockwise arc near the bezel"
      },
      {
        "type": "color",
        "messageKey": "BackgroundColor",
        "defaultValue": "0xFFFFFF",
        "label": "Background"
      },
      {
        "type": "color",
        "messageKey": "ForegroundColor",
        "defaultValue": "0x000055",
        "label": "Text"
      },
      {
        "type": "color",
        "messageKey": "HourColor",
        "defaultValue": "0xFF0000",
        "label": "Hour Hand"
      },
      {
        "type": "color",
        "messageKey": "MinColor",
        "defaultValue": "0x55AAFF",
        "label": "Minute Hand"
      },
      {
        "type": "color",
        "messageKey": "DotsColor",
        "defaultValue": "0x0055FF",
        "label": "Dots Color"
      },
      {
        "type": "color",
        "messageKey": "BatteryColor",
        "defaultValue": "0x55AAFF",
        "label": "Battery Bar Color",
        "description": "On battery below 20% the color switchs to red"
      },
      {"type": "section",
       "items": [
         {
           "type": "heading",
           "defaultValue": "Night Theme",
           "size":4
         } ,
         {
           "type": "toggle",
           "messageKey": "NightTheme",
           "label": "Activate Night Theme",
           "defaultValue": false,
           "description": "When activate requires GPS. Theme applied between sunset and sunrise."
         },
         {
           "type": "color",
           "messageKey": "BackgroundColorNight",
           "defaultValue": "0x000055",
           "label": "Background"
         },
         {
           "type": "color",
           "messageKey": "ForegroundColorNight",
           "defaultValue": "0xFF5500",
           "label": "Text"
         },
         {
           "type": "color",
           "messageKey": "HourColorNight",
           "defaultValue": "0xFF5500",
           "label": "Hour Hand"
         },
         {
           "type": "color",
           "messageKey": "MinColorNight",
           "defaultValue": "0xFFFFFF",
           "label": "Minute Hand"
         },
         {
           "type": "color",
           "messageKey": "DotsColorNight",
           "defaultValue": "0xFF5500",
           "label": "Dots Color"
         },
         {
           "type": "color",
           "messageKey": "BatteryColorNight",
           "defaultValue": "0xFF5500",
           "label": "Battery Bar Color"
         }
       ]
      }
    ]
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Connection settings"
      },
      {
        "type": "toggle",
        "messageKey": "DisplayLoc",
        "label": "Location",
        "defaultValue": false
      },
      {
        "type": "toggle",
        "messageKey": "DisplayTemp",
        "label": "Weather",
        "defaultValue": false
      },
      {
        "type": "toggle",
        "messageKey": "WeatherUnit",
        "label": "Temperature in Fahrenheit",
        "defaultValue": false,
        "description": "Applicable if Weather toggle is active"
      },
      {
        "type": "select",
        "messageKey": "WeatherProv",
        "defaultValue": "yahoo",
        "label": "Weather Provider",
        "description": "WU and OWM requires authentification. See next section",
        "options": [
          {
            "label": "Yahoo",
            "value": "yahoo"
          },
          {
            "label": "OpenWeatherMap",
            "value": "owm"
          },
          {
            "label": "WeatherUnderground",
            "value": "wu"
          }
        ]
      },
      {
        "type": "input",
        "messageKey": "APIKEY_User",
        "defaultValue": "",
        "label": "API Key",
        "description": "Paste here your API Key. If blank the watch will attempt to request pmkey.xyz",
        "attributes": {
          "placeholder": "eg: xxxxxxxxxxxxx"
        }
      },
      {
        "type": "input",
        "messageKey": "EmailPMKEY",
        "defaultValue": "",
        "label": "pmkey.xyz User",
        "description": "pmkey.xyz is a free service for Pebble users that allows you to store safely all your API keys in a single place. Check <a href=https://www.pmkey.xyz/>pmkey.xyz</a> ",
        "attributes": {
          "placeholder": "eg: john.doe@pmkey.xyz",
          "type": "email"
        }
      },
      {
        "type": "input",
        "messageKey": "PINPMKEY",
        "defaultValue": "",
        "label": "pmkey.xyz PIN",
        "attributes": {
          "placeholder": "eg: 12345"
        }
      },
      {
        "type": "slider",
        "messageKey": "UpSlider",
        "defaultValue": 30,
        "label": "Update frequency (minutes)",
        "description": "More frequent requests will drain your phone battery faster",
        "min": 15,
        "max": 120,
        "step": 15},
    ]
      },
      {
      "type": "submit",
      "defaultValue":"Ok"
      },
      {
      "type": "heading",
      "defaultValue": "version v5.0",
      "size":6
      },
      {
      "type": "heading",
      "defaultValue": "Made in Madrid, Spain",
      "size":6
      }
    ];