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
      char_settings = opts.character_settings,
      url = opts.url;

    self.milestone = opts.ms;
    node_image = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
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
  }
});
