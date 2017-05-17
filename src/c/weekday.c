#include <pebble.h>
#include "weekday.h"
#include "string.h"
const char* WEEKDAY_ES[] = {
  "Dom",
  "Lun",
  "Mar",
  "Mie",
  "Jue",
  "Vie",
  "Sab",
};
const char* WEEKDAY_EN[] = {
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
};
const char* WEEKDAY_DE[] = {
  "Son",
  "Mon",
  "Die",
  "Mit",
  "Don",
  "Fre",
  "Sam",
};
const char* WEEKDAY_FR[] = {
  "Dim",
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
};
const char* WEEKDAY_PT[] = {
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sab",
};
const char* WEEKDAY_IT[] = {
  "Dom",
  "Lun",
  "Mar",
  "Mer",
  "Gio",
  "Ven",
  "Sab",
};//End_Weekday
void fetchwday(int WD, const char* lang, char *iterweekday ){
  if (strcmp(lang,"es_ES")==0) {strcpy(iterweekday, WEEKDAY_ES[WD]);}
  else if (strcmp(lang,"fr_FR")==0) {strcpy(iterweekday, WEEKDAY_FR[WD]);}
  else if (strcmp(lang,"de_DE")==0) {strcpy(iterweekday, WEEKDAY_DE[WD]);}
  else if (strcmp(lang,"it_IT")==0) {strcpy(iterweekday, WEEKDAY_IT[WD]);}
  else if (strcmp(lang,"pt_PT")==0) {strcpy(iterweekday, WEEKDAY_PT[WD]);}
  else {strcpy(iterweekday, WEEKDAY_EN[WD]);};
}