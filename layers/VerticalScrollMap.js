/* global cc, ccui, adv_map: true
 */

adv_map.layers.VerticalScrollMap = cc.ScrollView.extend({
  map_children: [],
  map_built: null,
  map_layout: null,
  map_offset: null,
  ctor: function () {
    'use strict';

    this.map_layout = new ccui.Layout();
    this.map_layout.setLayoutType(ccui.Layout.LINEAR_VERTICAL);

    this._super(cc.winSize, this.map_layout);
    this.setBounceable(false);
    this.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
    this.setDelegate(this);
  },

  setAdventureMapSize: function () {
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
    'use strict';

    var top_view_item = this.getTopmostItemInCurrentView(),
      top_view_item_height, top_visible_item, top_distance,
      dist_checker;

    if (top_view_item) {
      top_view_item_height = top_view_item.getContentSize().height;
      top_visible_item = this.map_children[this.getTopChildIndex()];
      top_distance = top_visible_item.y - top_view_item.y;
      dist_checker = adv_map.constants.scrollmap.dist_check_const *
        top_view_item_height;

      if (top_distance < dist_checker) {
        this.addChildToMap(adv_map.constants.scrollmap.pos_top);
      }
    } else {
      this.addChildToMap(adv_map.constants.scrollmap.pos_top);
    }
  },

  checkBottomBoundary: function () {
    'use strict';

    var bottom_view_item = this.getBottommostItemInCurrentView(),
      bottom_view_item_height, bottom_visible_item, bottom_distance,
      dist_checker;

    if (bottom_view_item) {
      bottom_view_item_height = bottom_view_item.getContentSize().height;
      bottom_visible_item = this.map_children[this.getBottomChildIndex()];
      bottom_distance = bottom_view_item.y - bottom_visible_item.y;
      dist_checker = adv_map.constants.scrollmap.dist_check_const *
        bottom_view_item_height;

      if (bottom_distance < dist_checker) {
        this.addChildToMap(adv_map.constants.scrollmap.pos_bottom);
      }
    } else {
      this.addChildToMap(adv_map.constants.scrollmap.pos_bottom);
    }
  },

  scrollViewDidScroll: function () {
    'use strict';

    var start_pos, end_pos;

    if (this.map_built) {
      start_pos = this.map_offset.y;
      end_pos = this.getContentOffset().y;

      if (start_pos - end_pos > 0) {
        this.checkTopBoundary();
      } else {
        this.checkBottomBoundary();
      }
    }
    this.map_offset = this.getContentOffset();
  },

  setTopChildIndex: function (idx) {
    'use strict';

    this.top_child_idx = idx;
  },

  getTopChildIndex: function () {
    'use strict';

    return this.top_child_idx;
  },

  setBottomChildIndex: function (idx) {
    'use strict';

    this.bottom_child_idx = idx;
  },

  getBottomChildIndex: function () {
    'use strict';

    return this.bottom_child_idx;
  },

  setFocusChild: function (child) {
    'use strict';

    this.focus_child_idx = child;
  },

  getFocusChild: function () {
    'use strict';

    return this.focus_child_idx;
  },

  onEnter: function () {
    'use strict';

    this._super();

    if (!this.map_built) {
      this.createVisibleArea();
      this.getParent().onMapBuilt();
      this.map_built = true;
    }
    this.setTouchEnabled(true);
  },

  onExit: function () {
    'use strict';

    this._super();
    this.setTouchEnabled(false);
  },

  createVisibleArea: function () {
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
    'use strict';

    this.setTopChildIndex(top_visible_idx);
    this.setBottomChildIndex(bottom_visible_idx);
  },

  addChildToMap: function (pos) {
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
    'use strict';

    if (child === null) {
      return -1;
    }
    return this.map_children.indexOf(child);
  }
});
