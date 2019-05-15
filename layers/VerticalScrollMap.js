/* global cc, ccui, VerticalScrollMap: true,
  MAP_CONSTANTS: true
 */
 MAP_CONSTANTS = {
   POS_TOP: 0,
   POS_BOTTOM: 1,
   DIST_CHECK_CONST: 10
 };
VerticalScrollMap = ccui.ScrollView.extend({
  map_children: [],
  map_position: null,
  ctor: function () {
    'use strict';

    this._super();
    this.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
    this.setContentSize(cc.winSize);
    this.setDirection(ccui.ScrollView.DIR_VERTICAL);
    this.setTouchEnabled(true);
    this.setScrollBarEnabled(false);
  },

  setAdventureMapSize: function () {
    'use strict';

    var i, length, totalHeight, totalWidth,
      locItems = this.map_children = this.getChildren();

    length = locItems.length;
    totalHeight = 0;
    for (i = 0; i < length; i++) {
      totalHeight += locItems[i].getContentSize().height;
    }
    totalWidth = locItems[0].getContentSize().width;
    this.setInnerContainerSize(cc.size(totalWidth, totalHeight));
  },

  checkTopBoundary: function () {
    'use strict';

    var self = this,
      top_view_item = self.getTopmostItemInCurrentView(),
      top_view_item_height = top_view_item.getContentSize().height,
      top_visible_item = self.map_children[self.getTopChildIndex()],
      top_distance = top_visible_item.y - top_view_item.y,
      dist_checker = MAP_CONSTANTS.DIST_CHECK_CONST * top_view_item_height;

    if (top_distance < dist_checker) {
      self.addChildToMap(MAP_CONSTANTS.POS_TOP);
    }
  },

  checkBottomBoundary: function () {
    'use strict';

    var self = this,
      bottom_view_item = self.getBottommostItemInCurrentView(),
      bottom_view_item_height = bottom_view_item.getContentSize().height,
      bottom_visible_item = self.map_children[self.getBottomChildIndex()],
      bottom_distance = bottom_view_item.y - bottom_visible_item.y,
      dist_checker = MAP_CONSTANTS.DIST_CHECK_CONST * bottom_view_item_height;

    if (bottom_distance < dist_checker) {
      self.addChildToMap(MAP_CONSTANTS.POS_BOTTOM);
    }
  },

  onScroll: function (event, type) {
    'use strict';

    var start_pos, end_pos,
      self = this;

    if (type === ccui.ScrollView.EVENT_CONTAINER_MOVED) {
      start_pos = event.getTouchBeganPosition().y;
      end_pos = event.getTouchEndPosition().y;
      if (start_pos - end_pos > 0) {
        self.checkTopBoundary();
      } else {
        self.checkBottomBoundary();
      }
    }
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

    if (this.map_position) {
      this.setInnerContainerPosition(this.map_position);
    } else {
      this.jumpToVisibleArea();
      this.addEventListener(_.bind(this.onScroll, this));
    }
  },

  jumpToVisibleArea: function () {
    var percent, i, average, buffer,
      focus_index = this.getChildIndex(this.getFocusChild()),
      tot_children = this.map_children.length,
      bottom_visible_idx = focus_index + 20,
      top_visible_idx = focus_index - 20,
      last_child_idx = this.map_children.length - 1;

    average = Math.floor(bottom_visible_idx + top_visible_idx) / 2;
    if (top_visible_idx < 0) {
      buffer = Math.abs(top_visible_idx);
      top_visible_idx = 0;
      bottom_visible_idx += buffer;
    } else if (bottom_visible_idx > last_child_idx) {
      buffer = Math.abs(bottom_visible_idx - last_child_idx);
      bottom_visible_idx = last_child_idx;
      top_visible_idx -= buffer;
    }

    percent = (average / tot_children) * 100;
    this.jumpToPercentVertical(percent);
    for (i = top_visible_idx; i <= bottom_visible_idx; i++) {
      this.map_children[i].createTileLayer();
      this.map_children[i].setVisible(true);
    }
    this.setTopAndBottomChildIndex(top_visible_idx, bottom_visible_idx);
  },

  setTopAndBottomChildIndex: function (top_visible_idx, bottom_visible_idx) {
    'use strict';

    var self = this;

    self.setTopChildIndex(top_visible_idx);
    self.setBottomChildIndex(bottom_visible_idx);
  },

  addChildToMap: function (pos) {
    'use strict';

    var self = this,
      add_index, remove_index;

    if (pos === MAP_CONSTANTS.POS_TOP) {
      add_index = self.getTopChildIndex() - 1;
      if (add_index < 0) {
        return;
      }
      self.setTopChildIndex(add_index);
      remove_index = self.getBottomChildIndex();
      self.setBottomChildIndex(remove_index - 1);
    } else {
      add_index = self.getBottomChildIndex() + 1;
      if (add_index >= self.getChildrenCount()) {
        return;
      }
      self.setBottomChildIndex(add_index);
      remove_index = self.getTopChildIndex();
      self.setTopChildIndex(remove_index + 1);
    }
    cc.pool.putInPool(self.map_children[remove_index]);
    self.getParent().createMapWithTile(add_index);
  },

  getTopmostItemInCurrentView: function () {
    'use strict';

    return this.getClosestItemToPositionInCurrentView(
      cc.p(0.5, 1),
      cc.p(0.5, 0.5)
    );
  },

  getBottommostItemInCurrentView: function () {
    'use strict';

    return this.getClosestItemToPositionInCurrentView(
      cc.p(0.5, 0),
      cc.p(0.5, 0.5)
    );
  },

  getClosestItemToPositionInCurrentView: function (positionRatioInView,
      childAnchorPoint) {
    'use strict';

    var self = this,
      contentSize, targetPosition;

    contentSize = self.getContentSize();
    targetPosition = cc.pMult(self.getInnerContainerPosition(), -1);
    targetPosition.x += contentSize.width * positionRatioInView.x;
    targetPosition.y += contentSize.height * positionRatioInView.y;

    return self.getClosestItemToPosition(targetPosition, childAnchorPoint);
  },

  getClosestItemToPosition: function (targetPosition, childAnchorPoint) {
    'use strict';

    var firstIndex, firstPosition, distanceFromFirst, lastIndex, lastPosition,
      distanceFromLast,
      self = this,
      children = self.map_children;

    if (children.length === 0) {
      return null;
    }

    // Find the closest item through binary search
    firstIndex = 0;
    firstPosition = self._calculateChildPositionWithAnchor(
      children[firstIndex],
      childAnchorPoint
    );
    distanceFromFirst = cc.pLength(cc.pSub(targetPosition, firstPosition));

    lastIndex = children.length - 1;
    lastPosition = self._calculateChildPositionWithAnchor(
      children[lastIndex],
      childAnchorPoint
    );
    distanceFromLast = cc.pLength(cc.pSub(targetPosition, lastPosition));

    return self._findClosestChild(targetPosition, children, childAnchorPoint,
      firstIndex, distanceFromFirst, lastIndex, distanceFromLast);
  },

  _calculateChildPositionWithAnchor: function (child, childAnchorPoint) {
    'use strict';

    var origin, size, x, y;

    origin = cc.p(child.getLeftBoundary(), child.getBottomBoundary());
    size = child.getContentSize();
    x = origin.x + size.width * childAnchorPoint.x;
    y = origin.y + size.height * childAnchorPoint.y;
    return cc.p(x, y);
  },

  _findClosestChild: function (targetPosition, children, childAnchorPoint,
      firstIndex, distanceFromFirst, lastIndex, distanceFromLast) {
    'use strict';

    var self = this,
      midIndex, childPosition, distanceFromMid;

    if (firstIndex === lastIndex) {
      return children[firstIndex];
    }
    if (lastIndex - firstIndex === 1) {
      if (distanceFromFirst <= distanceFromLast) {
        return children[firstIndex];
      } else {
        return children[lastIndex];
      }
    }

    // Binary search
    midIndex = Math.floor((firstIndex + lastIndex) / 2);
    childPosition = self._calculateChildPositionWithAnchor(
      children[midIndex],
      childAnchorPoint
    );
    distanceFromMid = cc.pLength(cc.pSub(targetPosition, childPosition));

    if (distanceFromFirst <= distanceFromLast) {
      // Left half
      return self._findClosestChild(targetPosition, children, childAnchorPoint,
        firstIndex, distanceFromFirst, midIndex, distanceFromMid);
    } else {
      // Right half
      return self._findClosestChild(targetPosition, children, childAnchorPoint,
        midIndex, distanceFromMid, lastIndex, distanceFromLast);
    }
  },

  getChildIndex: function (child) {
    'use strict';

    if (child === null) {
      return -1;
    }
    return this.map_children.indexOf(child);
  }
});
