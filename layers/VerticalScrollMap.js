/* global cc, ccui, VerticalScrollMap: true,
  LAYER_POS: true
 */
 LAYER_POS = {
   TOP: 0,
   BOTTOM: 1
 };
VerticalScrollMap = ccui.ScrollView.extend({
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
      locItems = this.getChildren();

    length = locItems.length;
    totalHeight = 0;
    for (i = 0; i < length; i++) {
      totalHeight += locItems[i].getContentSize().height;
    }
    totalWidth = locItems[0].getContentSize().width;
    this.setInnerContainerSize(cc.size(totalWidth, totalHeight));
    this.setTopAndBottomChildIndex();
  },

  checkTopBoundary: function () {
    'use strict';

    var top_view_item = this.getTopmostItemInCurrentView(),
      top_visible_item = this.getChildren()[this.getTopChildIndex()],
      top_distance = Math.abs(top_view_item.y - top_visible_item.y);

    if (top_distance < 2 * top_view_item.getContentSize().height) {
      this.addChildToMap(LAYER_POS.TOP);
    }
  },

  checkBottomBoundary: function () {
    'use strict';

    var bottom_view_item = this.getBottommostItemInCurrentView(),
      bottom_visible_item = this.getChildren()[this.getBottomChildIndex()],
      bottom_distance = Math.abs(bottom_view_item.y - bottom_visible_item.y);

    if (bottom_distance < 2 * bottom_view_item.getContentSize().height) {
      this.addChildToMap(LAYER_POS.BOTTOM);
    }
  },

  onScroll: function (event, type) {
    'use strict';

    var start_pos, end_pos;

    if (type === ccui.ScrollView.EVENT_CONTAINER_MOVED) {
      start_pos = event.getTouchBeganPosition().y;
      end_pos = event.getTouchEndPosition().y;
      if (start_pos - end_pos > 0) {
        this.checkTopBoundary();
      } else {
        this.checkBottomBoundary();
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

  onEnter: function () {
    'use strict';

    this._super();
    this.jumpToBottom();
    this.addEventListener(_.bind(this.onScroll, this));
  },

  setTopAndBottomChildIndex: function () {
    'use strict';

    var item_length = this.getChildrenCount();

    this.setBottomChildIndex(item_length - 1);
    this.setTopChildIndex(item_length - this.cycle_length);
  },

  setMapVariables: function (tile_config, max_cycle) {
    'use strict';

    this.cycle_length = 0;
    tile_config.forEach(_.bind(function (tileData) {
      this.cycle_length += tileData.repeat;
    }, this));
    this.max_cycle = max_cycle;
  },

  addChildToMap: function (pos) {
    'use strict';

    var add_index, remove_index;

    if (pos === LAYER_POS.TOP) {
      add_index = this.getTopChildIndex() - 1;
      if (add_index < 0) {
        return;
      }
      this.setTopChildIndex(add_index);
      remove_index = this.getBottomChildIndex();
      this.setBottomChildIndex(remove_index - 1);
    } else {
      add_index = this.getBottomChildIndex() + 1;
      if (add_index >= this.getChildrenCount()) {
        return;
      }
      this.setBottomChildIndex(add_index);
      remove_index = this.getTopChildIndex();
      this.setTopChildIndex(remove_index + 1);
    }
    cc.pool.putInPool(this.getChildren()[remove_index]);
    this.getParent().createMapWithTile(undefined, 1, add_index, true);
  },

  getTopmostItemInCurrentView: function () {
    'use strict';

    if (this.getDirection() === ccui.ScrollView.DIR_VERTICAL) {
      return this.getClosestItemToPositionInCurrentView(
        cc.p(0.5, 1),
        cc.p(0.5, 0.5)
      );
    }
    return null;
  },

  getBottommostItemInCurrentView: function () {
    'use strict';

    if (this.getDirection() === ccui.ScrollView.DIR_VERTICAL) {
      return this.getClosestItemToPositionInCurrentView(
        cc.p(0.5, 0),
        cc.p(0.5, 0.5)
      );
    }
    return null;
  },

  getClosestItemToPositionInCurrentView: function (positionRatioInView,
      childAnchorPoint) {
    'use strict';

    var contentSize, targetPosition;

    contentSize = this.getContentSize();
    targetPosition = cc.pMult(this.getInnerContainerPosition(), -1);
    targetPosition.x += contentSize.width * positionRatioInView.x;
    targetPosition.y += contentSize.height * positionRatioInView.y;

    return this.getClosestItemToPosition(targetPosition, childAnchorPoint);
  },

  getClosestItemToPosition: function (targetPosition, childAnchorPoint) {
    'use strict';

    var firstIndex, firstPosition, distanceFromFirst, lastIndex, lastPosition,
      distanceFromLast,
      children = this.getChildren();

    if (children.length === 0) {
      return null;
    }

    // Find the closest item through binary search
    firstIndex = 0;
    firstPosition = this._calculateChildPositionWithAnchor(
      children[firstIndex],
      childAnchorPoint
    );
    distanceFromFirst = cc.pLength(cc.pSub(targetPosition, firstPosition));

    lastIndex = this.getChildrenCount() - 1;
    lastPosition = this._calculateChildPositionWithAnchor(
      children[lastIndex],
      childAnchorPoint
    );
    distanceFromLast = cc.pLength(cc.pSub(targetPosition, lastPosition));

    return this._findClosestChild(targetPosition, children, childAnchorPoint,
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

    var midIndex, childPosition, distanceFromMid;

    cc.assert(firstIndex >= 0 && lastIndex < children.length &&
      firstIndex <= lastIndex, '');
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
    childPosition = this._calculateChildPositionWithAnchor(
      children[midIndex],
      childAnchorPoint
    );
    distanceFromMid = cc.pLength(cc.pSub(targetPosition, childPosition));

    if (distanceFromFirst <= distanceFromLast) {
      // Left half
      return this._findClosestChild(targetPosition, children, childAnchorPoint,
        firstIndex, distanceFromFirst, midIndex, distanceFromMid);
    } else {
      // Right half
      return this._findClosestChild(targetPosition, children, childAnchorPoint,
        midIndex, distanceFromMid, lastIndex, distanceFromLast);
    }
  },

  getChildIndex: function (child) {
    'use strict';

    if (child === null) {
      return -1;
    }
    return this.getChildren().indexOf(child);
  }
});
