/* global cc, ccui, adv_map: true
*/
adv_map.layers.BonusLevel = adv_map.layers.NodeExtra.extend({
  ctor: function (opts) {
    'use strict';

    this._super(opts);
    this.setPosition(opts.pos);
    this.build(opts);
    this.setContentSize(opts.size);
  },

  build: function (opts) {
    'use strict';

    var image = new ccui.ImageView(opts.settings.locked,
      ccui.Widget.PLIST_TEXTURE);

    image.setPosition(cc.p(opts.size.width * 0.5, opts.size.height * 0.5));
    this.addChild(image);
  }
});
