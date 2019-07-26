/* global cc, ccui, ADV_MAP_NODE_IMAGE_TAG: true,
  NodeLayer: true, res, ADV_MAP_NAVIGATOR_TAG: true,
  ADV_MAP_NAVIGATOR_INDEX: true
 */

NodeLayer = ccui.Widget.extend({
  milestone: -1,
  navigator_array: null,
  tile_layer: null,
  ctor: function (tile_layer) {
    'use strict';

    this._super();
    this.navigator_array = [];
    this.tile_layer = tile_layer;
    return true;
  },

  build: function (opts) {
    'use strict';

    var node_pos, node_size, node_image,
      ms_number_text, ms_text_color, ms_stroke_color,
      max_ms = opts.max_ms,
      node_settings = this.node_settings = opts.node_settings,
      char_settings = node_settings.character_settings,
      url;

    this.milestone = opts.ms;
    this.scrollable_map = opts.scrollable_map;
    url = this.getImageURL(max_ms);

    node_image = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
    node_image.setTag(ADV_MAP_NODE_IMAGE_TAG);
    node_size = node_image.getContentSize();
    node_pos = cc.p(node_size.width * 0.5, node_size.height * 0.5);

    this.setContentSize(node_size);
    this.setPosition(cc.p(opts.x, opts.y));

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
    this.addChild(node_image);
    if (this.milestone <= max_ms) {
      this.addOnTouchListener();
    }
  },

  addOnTouchListener: function () {
    'use strict';

    this.addTouchEventListener(_.bind(this.onMilestoneSelected, this), this);
  },

  onMilestoneSelected: function (target, type) {
    'use strict';

    var ms_number;

    if (type === ccui.Widget.TOUCH_ENDED) {
      ms_number = target.milestone;
      cc.eventManager.dispatchCustomEvent('ms_selected', {
        ms: ms_number
      });
    }
  },

  getImageURL: function (max_ms) {
    'use strict';

    var node_settings = this.node_settings,
      nodes = node_settings.nodes,
      ms = this.milestone,
      stars = node_settings.star_data[ms],
      url;

    url = ms <= max_ms ? nodes[stars].image :
      nodes[nodes.length - 1].image;
    return url;
  },

  refreshNode: function (max_ms, star_data) {
    'use strict';

    var node_img = this.getChildByTag(ADV_MAP_NODE_IMAGE_TAG),
      url;

    this.node_settings.star_data = star_data;
    url = this.getImageURL(max_ms);
    node_img.loadTexture(url, ccui.Widget.PLIST_TEXTURE);
    if (this.milestone <= max_ms) {
      this.addOnTouchListener();
    }
  },

  addNavigator: function (player_navigator) {
    'use strict';

    var nav_array = this.navigator_array,
      prev_nav, prev_nav_pos, new_nav_pos;

    new_nav_pos = player_navigator.is_friend ?
      cc.p(player_navigator.size.width * 0.5, player_navigator.size.height) :
      cc.p(0, player_navigator.size.height);

    if (nav_array.length > 0 && player_navigator.is_friend) {
      prev_nav = nav_array[nav_array.length - 1];
      prev_nav_pos = prev_nav.getPosition();
      new_nav_pos.x = prev_nav_pos.x +
        prev_nav.getContentSize().width * 0.25;
    }
    if (player_navigator.is_friend) {
      player_navigator.setTag(ADV_MAP_NAVIGATOR_TAG);
    }
    player_navigator.setPosition(new_nav_pos);
    player_navigator.setTileLayer(this.tile_layer);
    this.navigator_array.push(player_navigator);
    this.addChild(player_navigator, ADV_MAP_NAVIGATOR_INDEX);
  }
});
