/* global cc, ccui, facebook, LevelNavigator: true, app
*/
LevelNavigator = ccui.Widget.extend({
  node_settings: null,
  is_friend: null,
  tile_layer: null,
  ctor: function (is_friend) {
    'use strict';

    this._super();
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

    player_image = new ccui.ImageView(texture, ccui.Widget.PLIST_TEXTURE);
    player_image.setPosition(cc.p(size.width * 0.5, size.height * 0.5));
    this.addChild(player_image);
    frame = new ccui.ImageView(this.node_settings.player_frame,
      ccui.Widget.PLIST_TEXTURE);
    frame.setPosition(cc.p(size.width * 0.52, size.height * 0.45));
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

  reposition: function (node) {
    'use strict';

    var old_nav_data = this.tile_layer.navigator_data,
      cond_func = function (data) {
        if (data) {
          return data.is_friend === false;
        }
      },
      index;

    index = _.findIndex(old_nav_data, cond_func);

    if (index !== -1) {
      node.tile_layer.saveNavigatorData(old_nav_data.splice(index, 1)[0]);
      this.tile_layer.navigator_data = old_nav_data;
    }
    this.removeFromParent();
    node.addNavigator(this);
  },

  refresh: function (uid) {
    'use strict';

    var size = this.getContentSize(),
      frame_url, image_size, frame_pos;

    if (this.is_friend) {
      frame_url = this.node_settings.friend_frame;
      image_size = cc.size(40, 40);
      frame_pos = cc.p(size.width * 0.51, size.height * 0.48);
    } else {
      frame_url = this.node_settings.player_frame;
      image_size = cc.size(50, 50);
      frame_pos = cc.p(size.width * 0.53, size.height * 0.45);
    }
    this.removeAllChildren();
    if (app.user.isFbLoggedIn() && uid) {
      facebook.addFBProfilePic({
        parent: this,
        uid: uid,
        size: image_size,
        frame_url: frame_url,
        image_pos: cc.p(size.width * 0.5, size.height * 0.5),
        frame_pos: frame_pos
      });
    } else {
      this.addNavigatorWithImage(this.node_settings.no_profile, size);
    }
  },

  addOnTouchListener: function () {
    'use strict';

    this.addTouchEventListener(_.bind(function (evt, type) {
      if (type === ccui.Widget.TOUCH_ENDED) {
        cc.eventManager.dispatchCustomEvent('ms_selected', {
          ms: this.getParent().milestone
        });
      }
    }, this), this);
  },

  setTileLayer: function (layer) {
    'use strict';

    this.tile_layer = layer;
  },

  onEnter: function () {
    'use strict';

    this._super();
    if (!this.is_friend) {
      this.setTouchEnabled(true);
      this.addOnTouchListener();
      this.retain();
      this.addAnimation();
    }
  }
});
