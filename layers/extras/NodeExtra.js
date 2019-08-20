/* global cc, ccui, adv_map: true, res
*/
adv_map.layers.NodeExtra = ccui.Widget.extend({
  node_tag: '',
  ctor: function (opts) {
    'use strict';

    var settings = opts.settings;

    cc.spriteFrameCache.addSpriteFrames(res[settings.res_url.plist],
      res[settings.res_url.png]);

    this._super();
    this.node_tag = opts.tag;
    this.setTouchEnabled(true);
    this.addTouchEventListener(_.bind(this.onSelected, this), this);
  },

  onSelected: function (target, type) {
    'use strict';

    if (type === ccui.Widget.TOUCH_ENDED) {
      cc.eventManager.dispatchCustomEvent('map_extra', {
        tag: this.node_tag,
        ms: this.getParent().milestone
      });
    }
  }
});
