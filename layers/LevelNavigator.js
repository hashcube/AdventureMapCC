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
  },

  addNavigatorWithImage: function (texture, size) {
    'use strict';

    var player_image, frame,
      self = this;

    self.removeAllChildren();
    player_image = new ccui.ImageView(texture, ccui.Widget.PLIST_TEXTURE);
    player_image.setPosition(cc.p(0, size.height));
    self.addChild(player_image);
    frame = new ccui.ImageView(self.node_settings.player_frame,
      ccui.Widget.PLIST_TEXTURE);
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

  refresh: function (uid) {
    'use strict';

    var size = this.getContentSize();

    this.removeAllChildren();
    if (cc.sys.isNative && facebook.isLoggedIn() && uid) {
      facebook.addFBProfilePic({
        parent: this,
        uid: uid,
        size: cc.size(50, 50),
        frame_url: this.node_settings.player_frame,
        image_pos: cc.p(0, size.height),
        frame_pos: cc.p(size.width * 0.5 - 50, size.height * 0.5 + 45)
      });
    } else {
      this.addNavigatorWithImage(this.node_settings.no_profile, size);
    }
  },

  onEnter: function () {
    'use strict';

    this._super();
    this.setPosition(cc.p(this.size.width * 0.5, this.size.height * 0.5));
    this.addAnimation();
  }
});
