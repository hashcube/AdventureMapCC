/* global cc, ccui,
  NodeLayer: true
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
      num_layout, num_width, num_height, num, i,
      self = this,
      numbers = [],
      url = opts.url;

    self.milestone = opts.ms;
    node_image = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
    node_size = node_image.getContentSize();
    node_pos = cc.p(node_size.width * 0.5, node_size.height * 0.5);

    self.setContentSize(node_size);
    self.setPosition(cc.p(opts.x, opts.y));

    numbers = self.getNumbersInMs(opts.ms);
    num_layout = new ccui.Layout();
    num_layout.setLayoutType(ccui.Layout.LINEAR_HORIZONTAL);
    num_width = 0;
    for (i = 0; i < numbers.length; i++) {
      num = new ccui.ImageView(numbers[i] + '.png', ccui.Widget.PLIST_TEXTURE);
      num_width += num.getContentSize().width;
      num_layout.addChild(num);
    }
    num_height = num.getContentSize().height;
    num_layout.setContentSize(cc.size(num_width, num_height));
    num_layout.setPosition(cc.p(node_pos.x, node_pos.y * 0.5));
    num_layout.setAnchorPoint(cc.p(0.5, 0.5));
    node_image.addChild(num_layout);

    node_image.setPosition(node_pos);
    self.addChild(node_image);
  },

  getNumbersInMs: function (ms) {
    'use strict';

    var numbers = [];

    while (ms > 0) {
      numbers.push(ms % 10);
      ms = Math.floor(ms / 10);
    }
    return numbers.reverse();
  }
});
