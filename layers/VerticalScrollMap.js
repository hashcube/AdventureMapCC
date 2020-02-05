
/* global cc, ccui, adv_map: true
 */

adv_map.layers.VerticalScrollMap = cc.ScrollView.extend({
  map_children: [],
  map_built: null,
  map_layout: null,
  map_offset: null,
  ctor: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: ctor ");
    'use strict';

    this.map_layout = new ccui.Layout();
    this.map_layout.setLayoutType(ccui.Layout.LINEAR_VERTICAL);

    this._super(cc.winSize, this.map_layout);
    this.setBounceable(false);
    this.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
    this.setDelegate(this);
  },

  setAdventureMapSize: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: setAdventureMapSize ");
    'use strict';

    var i, length, totalHeight, totalWidth,
      locItems = this.map_children = this.map_layout.getChildren();

    length = locItems.length;
    totalHeight = 0;
    for (i = 0; i < length; i++) {
      totalHeight += locItems[i].getContentSize().height;
    }
    totalWidth = locItems[0].getContentSize().width;
    this.map_layout.setContentSize(cc.size(totalWidth, totalHeight));
  },

  checkTopBoundary: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: checkTopBoundary ");
    'use strict';

    var top_view_item = this.getTopmostItemInCurrentView(),
      top_view_item_height = top_view_item.getContentSize().height,
      top_visible_item = this.map_children[this.getTopChildIndex()],
      top_distance = top_visible_item.y - top_view_item.y,
      dist_checker = adv_map.constants.scrollmap.dist_check_const *
        top_view_item_height;

    if (top_distance < dist_checker) {
      this.addChildToMap(adv_map.constants.scrollmap.pos_top);
    }
  },

  checkBottomBoundary: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: checkBottomBoundary ");
    'use strict';

    var bottom_view_item = this.getBottommostItemInCurrentView(),
      bottom_view_item_height = bottom_view_item.getContentSize().height,
      bottom_visible_item = this.map_children[this.getBottomChildIndex()],
      bottom_distance = bottom_view_item.y - bottom_visible_item.y,
      dist_checker = adv_map.constants.scrollmap.dist_check_const *
        bottom_view_item_height;

    if (bottom_distance < dist_checker) {
      this.addChildToMap(adv_map.constants.scrollmap.pos_bottom);
    }
  },

  scrollViewDidScroll: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: scrollViewDidScroll ");
    'use strict';
    app.user.emit('end_pos', 0);
    app.user.emit('start_pos', 0);
    cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: scrollViewDidScroll set zero");

    var start_pos, end_pos;

    if (this.map_built) {
      start_pos = this.map_offset.y;
      end_pos = this.getContentOffset().y;
      
      // cc.log("{call-stack} :: VYSHNAV start: ", start_pos);
      // cc.log("{call-stack} :: VYSHNAV end_pos: ", end_pos);
      // cc.log("{call-stack} :: VYSHNAV end_pos: ", start_pos - end_pos);
      
      cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: VYSHNAV before emit srtart_pos");

      app.user.emit('start_pos', start_pos);
      cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: VYSHNAV before emit endpos");

      app.user.emit('end_pos', end_pos);
      cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: VYSHNAV after emit endpos");

      // game.views.TopHudLayer.tempMasterScore(start_pos);
      // game.views.TopHudLayer.tempGold(end_pos);
      cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: VYSHNAV before subtract if start");
      if (start_pos - end_pos > 0) {
        cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: VYSHNAV subtract if before");

        this.checkTopBoundary();
        cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: VYSHNAV subtract if after");
      } else {
        cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: VYSHNAV subtract else before");

        this.checkBottomBoundary();
        cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: VYSHNAV subtract else after");
      }
      cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: VYSHNAV after subtract final");

    }
    cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: scrollViewDidScroll before getContentOffset ");
    this.map_offset = this.getContentOffset();
    cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: scrollViewDidScroll end getContentOffset");
  },

  setTopChildIndex: function (idx) {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: setTopChildIndex ");
    'use strict';

    this.top_child_idx = idx;
  },

  getTopChildIndex: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: getTopChildIndex ");
    'use strict';

    return this.top_child_idx;
  },

  setBottomChildIndex: function (idx) {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: setBottomChildIndex ");
    'use strict';

    this.bottom_child_idx = idx;
  },

  getBottomChildIndex: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: getBottomChildIndex ");
    'use strict';

    return this.bottom_child_idx;
  },

  setFocusChild: function (child) {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: setFocusChild ");
    'use strict';

    this.focus_child_idx = child;
  },

  getFocusChild: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: getFocusChild ");
    'use strict';

    return this.focus_child_idx;
  },

  onEnter: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: onEnter ");
    'use strict';

    this._super();

    if (!this.map_built) {
      this.createVisibleArea();
      this.getParent().onMapBuilt();
      this.map_built = true;
    }
  },

  createVisibleArea: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: createVisibleArea ");
    'use strict';

    var i, buffer, tileLayer,
      focus_index = this.getChildIndex(this.getFocusChild()),
      bottom_visible_idx = focus_index + 20,
      top_visible_idx = focus_index - 20,
      last_child_idx = this.map_children.length - 1;

    if (top_visible_idx < 0) {
      buffer = Math.abs(top_visible_idx);
      top_visible_idx = 0;
      bottom_visible_idx += buffer;
    } else if (bottom_visible_idx > last_child_idx) {
      buffer = Math.abs(bottom_visible_idx - last_child_idx);
      bottom_visible_idx = last_child_idx;
      top_visible_idx -= buffer;
    }

    for (i = top_visible_idx; i <= bottom_visible_idx; i++) {
      if (cc.pool.hasObject(adv_map.layers.TileLayer)) {
        this.getParent().createMapWithTile(i);
      } else {
        tileLayer = this.map_children[i];
        tileLayer.createTileLayer();
        tileLayer.setVisible(true);
      }
    }

    this.jumpToVisibleArea();
    this.setTopAndBottomChildIndex(top_visible_idx, bottom_visible_idx);
  },

  jumpToVisibleArea: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: jumpToVisibleArea ");
    'use strict';

    var focus_index = this.getChildIndex(this.getFocusChild()),
      last_child_idx = this.map_children.length - 1,
      focus_offset = 4,
      focus_size = this.getFocusChild().getContentSize(),
      max_pos = this.getContainer().getContentSize().height * -1,
      pos;

    pos = (focus_index - last_child_idx + focus_offset) * focus_size.height;
    if (pos > 0) {
      pos = 0;
    } else if (pos < max_pos) {
      pos = max_pos;
    }
    this.setContentOffset(cc.p(0, pos), !!this.map_built);
  },

  setTopAndBottomChildIndex: function (top_visible_idx, bottom_visible_idx) {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: setTopAndBottomChildIndex ");
    'use strict';

    this.setTopChildIndex(top_visible_idx);
    this.setBottomChildIndex(bottom_visible_idx);
  },

  addChildToMap: function (pos) {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: addChildToMap ");
    'use strict';

    var add_index, remove_index;

    if (pos === adv_map.constants.scrollmap.pos_top) {
      add_index = this.getTopChildIndex() - 1;
      if (add_index < 0) {
        return;
      }
      this.setTopChildIndex(add_index);
      remove_index = this.getBottomChildIndex();
      this.setBottomChildIndex(remove_index - 1);
    } else {
      add_index = this.getBottomChildIndex() + 1;
      if (add_index >= this.map_children.length) {
        return;
      }
      this.setBottomChildIndex(add_index);
      remove_index = this.getTopChildIndex();
      this.setTopChildIndex(remove_index + 1);
    }
    cc.pool.putInPool(this.map_children[remove_index]);
    this.getParent().createMapWithTile(add_index);
  },

  getTopmostItemInCurrentView: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: getTopmostItemInCurrentView ");
    'use strict';

    var i;

    for (i = this.getTopChildIndex(); i < this.getBottomChildIndex(); i++) {
      if (this.isNodeVisible(this.map_children[i])) {
        return this.map_children[i];
      }
    }
    return null;
  },

  getBottommostItemInCurrentView: function () {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: getBottommostItemInCurrentView ");
    'use strict';

    var i;

    for (i = this.getBottomChildIndex(); i > this.getTopChildIndex(); i--) {
      if (this.isNodeVisible(this.map_children[i])) {
        return this.map_children[i];
      }
    }
    return null;
  },

  getChildIndex: function (child) {
cc.log(" {call-stack} :: ./layers/VerticalScrollMap.js :: getChildIndex ");
    'use strict';

    if (child === null) {
      return -1;
    }
    return this.map_children.indexOf(child);
  }
});
