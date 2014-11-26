if (typeof Def === 'undefined')
  Def = {};

Def.FieldAlarms = {
  /**
   * Sets off an alarm with few shakes and a "bonk" sound
   *
   * @param field a field which should be shaked when the alarm is setoff
   **/
  setOffAlarm: function(field) {
    if (this.bonk === undefined)
      this.bonk = new Audio('/soundmanager/bonk.mp3')
    // Reset the play position back the the beginning, if the sound has
    // been loaded sufficiently.
    if (this.bonk.readyState >= 2)
      this.bonk.currentTime = 0;
    this.bonk.play();
    Effect.Shake(field.id, 5);
  }, // end of setOffAlarm

  /**
   *  Cancels the alarm.
   */
  cancelAlarm: function(field) {
    field.shakeCanceled = true;
    this.bonk.pause();
    this.bonk.currentTime = 0;
  }
};

