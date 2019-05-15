/* global cc, ccui, res,
  NodeLayer: true, TEXT_TAG: true
 */
 TEXT_TAG = 0;

NodeLayer = ccui.ImageView.extend({
  ctor: function () {
    'use strict';

    this._super(res.msicon);
    return true;
  },

  build: function (data, ms_number) {
    'use strict';

    var ms_number_text, node_posx, node_posy;

    this.attr({
      x: data.x,
      y: data.y
    });

    ms_number_text = new cc.LabelTTF(ms_number,
      cc._mGetCustomFontName(res.Sansita_Bold));
    ms_number_text.setTag(TEXT_TAG);
    node_posx = this.getContentSize().width / 2;
    node_posy = this.getContentSize().height / 4;
    ms_number_text.setPosition(cc.p(node_posx, node_posy));
    this.addChild(ms_number_text);
  }
});
