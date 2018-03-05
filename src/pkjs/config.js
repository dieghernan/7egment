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
          "defaultValue": "version v1.4",
          "size":6
          },
          {
          "type": "heading",
          "defaultValue": "Made in Madrid, Spain",
          "size":6
          },
          {
          "type": "text",
          "defaultValue":"<a href='https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=AAYBMD7APLZFN'><img  src='data:image/gif;base64,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' /></a>"
          }
        ];