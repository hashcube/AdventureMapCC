/* global cc, ccui, facebook, LevelIndicator: true
*/
LevelIndicator = ccui.Widget.extend({
  node_settings: null,
  ctor: function () {
    'use strict';

    this._super();
    return true;
  },

  build: function (parent, node_settings) {
    'use strict';

    var self = this,
      size = parent.getContentSize();

    self.node_settings = node_settings;
    self.setPosition(cc.p(size.width * 0.5, size.height * 0.5));
    self.setContentSize(size);
    self.refresh(node_settings.fb_data.img_url);
  },

  addIndicatorWithImage: function (texture, size) {
    'use strict';

    var player_image, frame,
      self = this;

    self.removeAllChildren();
    player_image = new cc.Sprite(texture);
    player_image.setPosition(cc.p(0, size.height));
    self.addChild(player_image);
    frame = new cc.Sprite(self.node_settings.player_frame);
    frame.setPosition(cc.p(size.width * 0.5 - 50, size.height * 0.5 + 45));
    self.addChild(frame);
  },

  reposition: function (parent) {
    'use strict';

    this.retain();
    this.removeFromParent();
    parent.addChild(this);
  },

  refresh: function (imageUrl) {
    'use strict';

    var self = this,
      size = self.getContentSize();

    if (cc.sys.isNative && facebook.isLoggedIn() && imageUrl) {
      cc.textureCache.addImageAsync(imageUrl, function (texture) {
        if (texture instanceof cc.Texture2D) {
          self.addIndicatorWithImage(texture, size);
        } else {
          self.addIndicatorWithImage(self.node_settings.no_profile, size);
        }
      }, self);
    } else {
      self.addIndicatorWithImage(self.node_settings.no_profile, size);
    }
  }
});
