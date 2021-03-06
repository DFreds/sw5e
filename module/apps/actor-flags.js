export class ActorSheetFlags extends BaseEntitySheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return mergeObject(options, {
      id: "actor-flags",
	    classes: ["sw5e"],
      template: "systems/sw5e/templates/apps/actor-flags.html",
      width: 500,
      closeOnSubmit: true
    });
  }

  /* -------------------------------------------- */

  /**
   * Configure the title of the special traits selection window to include the Actor name
   * @type {String}
   */
  get title() {
    return `${game.i18n.localize('SW5E.FlagsTitle')}: ${this.object.name}`;
  }

  /* -------------------------------------------- */

  /**
   * Prepare data used to render the special Actor traits selection UI
   * @return {Object}
   */
  getData() {
    const data = super.getData();
    data.actor = this.object;
    data.flags = this._getFlags();
    data.bonuses = this._getBonuses();
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Prepare an object of flags data which groups flags by section
   * Add some additional data for rendering
   * @return {Object}
   */
  _getFlags() {
    const flags = {};
    for ( let [k, v] of Object.entries(CONFIG.SW5E.characterFlags) ) {
      if ( !flags.hasOwnProperty(v.section) ) flags[v.section] = {};
      let flag = duplicate(v);
      flag.type = v.type.name;
      flag.isCheckbox = v.type === Boolean;
      flag.isSelect = v.hasOwnProperty('choices');
      flag.value = this.entity.getFlag("sw5e", k);
      flags[v.section][`flags.sw5e.${k}`] = flag;
    }
    return flags;
  }

  /* -------------------------------------------- */

  /**
   * Get the bonuses fields and their localization strings
   * @return {Array}
   * @private
   */
  _getBonuses() {
    const bonuses = [
      {name: "data.bonuses.mwak.attack", label: "SW5E.BonusMWAttack"},
      {name: "data.bonuses.mwak.damage", label: "SW5E.BonusMWDamage"},
      {name: "data.bonuses.rwak.attack", label: "SW5E.BonusRWAttack"},
      {name: "data.bonuses.rwak.damage", label: "SW5E.BonusRWDamage"},
      {name: "data.bonuses.msak.attack", label: "SW5E.BonusMSAttack"},
      {name: "data.bonuses.msak.damage", label: "SW5E.BonusMSDamage"},
      {name: "data.bonuses.rsak.attack", label: "SW5E.BonusRSAttack"},
      {name: "data.bonuses.rsak.damage", label: "SW5E.BonusRSDamage"},
      {name: "data.bonuses.abilities.check", label: "SW5E.BonusAbilityCheck"},
      {name: "data.bonuses.abilities.save", label: "SW5E.BonusAbilitySave"},
      {name: "data.bonuses.abilities.skill", label: "SW5E.BonusAbilitySkill"},
      {name: "data.bonuses.power.dc", label: "SW5E.BonusPowerDC"}
    ];
    for ( let b of bonuses ) {
      b.value = getProperty(this.object.data, b.name) || "";
    }
    return bonuses;
  }

  /* -------------------------------------------- */

  /**
   * Update the Actor using the configured flags
   * Remove/unset any flags which are no longer configured
   */
  async _updateObject(event, formData) {
    const actor = this.object;
    const updateData = expandObject(formData);

    // Unset any flags which are "false"
    let unset = false;
    const flags = updateData.flags.sw5e;
    for ( let [k, v] of Object.entries(flags) ) {
      if ( [undefined, null, "", false, 0].includes(v) ) {
        delete flags[k];
        if ( hasProperty(actor.data.flags, `sw5e.${k}`) ) {
          unset = true;
          flags[`-=${k}`] = null;
        }
      }
    }

    // Apply the changes
    await actor.update(updateData, {diff: false});
  }
}
