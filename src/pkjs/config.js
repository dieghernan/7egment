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
        "type": "color",
        "messageKey": "Back1Color",
        "defaultValue": "0x000000",
        "label": "Main Display"
      },
      {
        "type": "color",
        "messageKey": "Back2Color",
        "defaultValue": "0x000000",
        "label": "Secondary Display"
      },
      {
        "type": "color",
        "messageKey": "FrameColor",
        "defaultValue": "0xFFFFFF",
        "label": "Frame"
      },
      {
        "type": "color",
        "messageKey": "Text1Color",
        "defaultValue": "0xFFFFFF",
        "label": "Main Text"
      }, 
      {
        "type": "color",
        "messageKey": "Text2Color",
        "defaultValue": "0xFFFFFF",
        "label": "Complications"
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
         },
         {
           "type": "color",
           "messageKey": "Back1ColorN",
           "defaultValue": "0xFFFFFF",
           "label": "Main Display"
         },
         {
           "type": "color",
           "messageKey": "Back2ColorN",
           "defaultValue": "0xFFFFFF",
           "label": "Secondary Display"
         },
         {
           "type": "color",
           "messageKey": "FrameColorN",
           "defaultValue": "0x000000",
           "label": "Frame"
         },
         {
           "type": "color",
           "messageKey": "Text1ColorN",
           "defaultValue": "0x000000",
           "label": "Main Text"
         }, 
         {
           "type": "color",
           "messageKey": "Text2ColorN",
           "defaultValue": "0x000000",
           "label": "Complications"
         },
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
            "messageKey": "WeatherUnit",
            "label": "Temperature in Fahrenheit",
            "defaultValue": false,
          },
          {
            "type": "select",
            "messageKey": "WeatherProv",
            "defaultValue": "owm",
            "label": "Weather Provider",
            "options": [
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
          "defaultValue": "version v1.0",
          "size":6
          },
          {
          "type": "heading",
          "defaultValue": "Made in Madrid, Spain",
          "size":6
          }
        ];