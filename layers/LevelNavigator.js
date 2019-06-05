/* global cc, ccui, facebook, LevelNavigator: true
*/
LevelNavigator = ccui.Widget.extend({
  node_settings: null,
  ctor: function () {
    'use strict';

    this._super();
    this.retain();
    return true;
  },

  build: function (parent, node_settings) {
    'use strict';

    var self = this,
      size = this.size = parent.getContentSize();

    self.node_settings = node_settings;
    self.setContentSize(size);
    self.refresh(node_settings.fb_data.img_url);
  },

  addNavigatorWithImage: function (texture, size) {
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

  addAnimation: function () {
    'use strict';

    var timeInSecs = 3,
      distInPixels = 15,
      moveUp = cc.moveBy(timeInSecs,
        cc.p(0, distInPixels)).easing(cc.easeInOut(2.0)),
      moveDown = cc.moveBy(timeInSecs,
        cc.p(0, -distInPixels)).easing(cc.easeInOut(2.0)),
      seq = cc.sequence(moveUp, moveDown);

    this.runAction(seq.repeatForever());
  },

  reposition: function (parent) {
    'use strict';

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
          self.addNavigatorWithImage(texture, size);
        } else {
          self.addNavigatorWithImage(self.node_settings.no_profile, size);
        }
      }, self);
    } else {
      self.addNavigatorWithImage(self.node_settings.no_profile, size);
    }
  },

  onEnter: function () {
    'use strict';

    this._super();
    this.setPosition(cc.p(this.size.width * 0.5, this.size.height * 0.5));
    this.addAnimation();
  }
});
