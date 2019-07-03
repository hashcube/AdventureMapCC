/* global cc, ccui, facebook, LevelNavigator: true
*/
LevelNavigator = ccui.Widget.extend({
  node_settings: null,
  ctor: function (is_friend) {
    'use strict';

    this._super();
    this.retain();
    this.is_friend = !!is_friend;
    return true;
  },

  build: function (parent, node_settings) {
    'use strict';

    var size = this.size = parent.getContentSize();

    this.node_settings = node_settings;
    this.setContentSize(size);
  },

  addNavigatorWithImage: function (texture, size) {
    'use strict';

    var player_image, frame;

    this.removeAllChildren();
    player_image = new ccui.ImageView(texture, ccui.Widget.PLIST_TEXTURE);
    player_image.setPosition(cc.p(0, size.height));
    this.addChild(player_image);
    frame = new ccui.ImageView(this.node_settings.player_frame,
      ccui.Widget.PLIST_TEXTURE);
    frame.setPosition(cc.p(size.width * 0.5 - 50, size.height * 0.5 + 45));
    this.addChild(frame);
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

    var size = this.getContentSize(),
      frame_url, image_size, frame_pos;

    if (this.is_friend) {
      frame_url = this.node_settings.friend_frame;
      image_size = cc.size(40, 40);
      frame_pos = cc.p(size.width * 0.5 - 55, size.height * 0.5 + 49);
    } else {
      frame_url = this.node_settings.player_frame;
      image_size = cc.size(50, 50);
      frame_pos = cc.p(size.width * 0.5 - 50, size.height * 0.5 + 45);
    }
    this.removeAllChildren();
    if (cc.sys.isNative && facebook.isLoggedIn() && uid) {
      facebook.addFBProfilePic({
        parent: this,
        uid: uid,
        size: image_size,
        frame_url: frame_url,
        image_pos: cc.p(0, size.height),
        frame_pos: frame_pos
      });
    } else {
      this.addNavigatorWithImage(this.node_settings.no_profile, size);
    }
  },

  onEnter: function () {
    'use strict';

    this._super();
    this.addAnimation();
  }
});
