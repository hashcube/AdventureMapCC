/* global cc, ccui,
  NodeLayer: true, res
 */

NodeLayer = ccui.Widget.extend({
  milestone: -1,
  ctor: function () {
    'use strict';

    this._super();
    return true;
  },

  build: function (opts) {
    'use strict';

    var node_pos, node_size, node_image,
      ms_number_text, ms_text_color, ms_stroke_color,
      self = this,
      max_ms = opts.max_ms,
      node_settings = self.node_settings = opts.node_settings,
      char_settings = node_settings.character_settings,
      url;

    self.milestone = opts.ms;
    self.scrollable_map = opts.scrollable_map;
    url = self.getImageURL(max_ms);

    node_image = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
    node_image.setTag('NODE_IMAGE_TAG');
    node_size = node_image.getContentSize();
    node_pos = cc.p(node_size.width * 0.5, node_size.height * 0.5);

    self.setContentSize(node_size);
    self.setPosition(cc.p(opts.x, opts.y));

    ms_number_text = new cc.LabelTTF(opts.ms,
        cc._mGetCustomFontName(res[char_settings.font]));
    ms_text_color = cc.color(char_settings.font_color);
    ms_stroke_color = cc.color(char_settings.stroke_color);
    ms_number_text.setPosition(cc.p(node_pos.x, node_pos.y * 0.55));
    ms_number_text.setFontFillColor(ms_text_color);
    ms_number_text.enableStroke(ms_stroke_color, char_settings.stroke_width);
    ms_number_text.setFontSize(char_settings.font_size);
    node_image.addChild(ms_number_text);

    node_image.setPosition(node_pos);
    self.addChild(node_image);
    if (self.milestone <= max_ms) {
      self.addOnTouchListener();
      if (self.milestone === max_ms) {
        self.scrollable_map.buildLevelNavigator(self, node_settings);
      }
    }
  },

  addOnTouchListener: function () {
    'use strict';

    var self = this;

    self.addTouchEventListener(_.bind(self.onMilestoneSelected, self), self);
  },

  onMilestoneSelected: function (target, type) {
    'use strict';

    var ms_number,
      self = this,
      map = self.scrollable_map;

    if (type === ccui.Widget.TOUCH_ENDED) {
      ms_number = target.milestone;
      cc.eventManager.dispatchCustomEvent('ms_selected', {
        ms: ms_number
      });
      map.map_position = map.getInnerContainerPosition();
    }
  },

  getImageURL: function (max_ms) {
    'use strict';

    var self = this,
      node_settings = self.node_settings,
      nodes = node_settings.nodes,
      ms = self.milestone,
      stars = node_settings.star_data[ms],
      url;

    url = ms <= max_ms ? nodes[stars].image :
      nodes[nodes.length - 1].image;
    return url;
  },

  refreshNode: function (max_ms, star_data) {
    'use strict';

    var self = this,
      node_img = self.getChildByTag('NODE_IMAGE_TAG'),
      url;

    self.node_settings.star_data = star_data;
    url = self.getImageURL(max_ms);
    node_img.loadTexture(url, ccui.Widget.PLIST_TEXTURE);
    if (self.milestone <= max_ms) {
      self.addOnTouchListener();
    }
  },

  getMilestone: function () {
    'use strict';

    return this.milestone;
  }
});
