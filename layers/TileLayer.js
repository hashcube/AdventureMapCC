/* global cc, ccui, res, CONTAINER_TAG: true,
  TileLayer: true, TEXT_TAG: true
 */

TEXT_TAG = 0;
CONTAINER_TAG = 1;

TileLayer = ccui.Widget.extend({
  map_idx: -1,
  row_idx: -1,
  map_mpx: -1,
  tile_map: '',
  ctor: function () {
    'use strict';

    this._super();
    return true;
  },

  initTilesInLayer: function (mapData, map) {
    'use strict';

    var horLayoutWidth = mapData.tileWidth * mapData.rowLength,
      horLayoutHeight = mapData.tileHeight,
      horSize = cc.size(horLayoutWidth, horLayoutHeight),
      tile_layer, container, self;

    self = this;
    self.map = map;
    self.setContentSize(horSize);

    if (self.visible) {
      tile_layer = cc.pool.getFromPool(TileLayer);
      if (tile_layer) {
        self.reCreateTileLayer(mapData, tile_layer);
      } else {
        container = new ccui.Layout();
        container.setLayoutType(ccui.Layout.LINEAR_HORIZONTAL);
        container.setContentSize(horSize);
        self.addChild(container);
        container.setTag(CONTAINER_TAG);
        self.createTileLayer(mapData);
      }
    }
  },

  reCreateTileLayer: function (mapData, tile_layer) {
    'use strict';

    var tile, url, i, container, tile_added,
      self = this;

    container = tile_layer.getChildByTag(CONTAINER_TAG);
    container.retain();
    container.removeFromParent();
    self.addChild(container);
    for (i = 0; i < container.getChildrenCount(); i++) {
      tile = container.getChildren()[i];
      tile_added = self.row_idx * mapData.rowLength + i;
      url = self.tile_map + '_' + self.row_idx + '_' + i + '.png';
      tile.loadTexture(url, ccui.Widget.PLIST_TEXTURE);
      self.setNode(mapData, tile_added, tile);
    }
  },

  createTileLayer: function (mapData) {
    'use strict';

    var tile, j, url, container, tile_added,
      self = this;

    container = self.getChildByTag(CONTAINER_TAG);
    for (j = 0; j < mapData.rowLength; j++) {
      url = self.tile_map + '_' + self.row_idx + '_' + j + '.png';
      tile_added = self.row_idx * mapData.rowLength + j;
      tile = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
      self.setNode(mapData, tile_added, tile);
      container.addChild(tile);
    }
  },

  setNode: function (mapData, tile_number, parent) {
    'use strict';

    var node, data, ms_number, node_posx, node_posy,
      ms, ms_mpx, tile_id, ms_number_text, listener,
      ms_in_map, map, self;

    parent.removeAllChildren();
    data = _.find(mapData.nodes, function (obj) {
      return obj.map === tile_number;
    });
    if (data) {
      self = this;
      node = new cc.Sprite(res.msicon);
      map = self.map;
      node.attr({
        x: data.x,
        y: data.y
      });

      tile_id = Number(self.tile_map.split('_')[1]);
      ms_in_map = mapData.nodes.length * mapData.repeat;
      ms = data.node + mapData.nodes.length *
        (self.map_idx - 1);
      ms = tile_id === 1 ? ms : ms_in_map + ms;
      ms_mpx = self.map_mpx;
      ms_number = (ms_mpx - 1) * (2 * ms_in_map) + ms;

      ms_number_text = new cc.LabelTTF(ms_number,
        cc._mGetCustomFontName(res.Sansita_Bold));
      ms_number_text.setTag(TEXT_TAG);
      node_posx = node.getContentSize().width / 2;
      node_posy = node.getContentSize().height / 4;
      ms_number_text.setPosition(cc.p(node_posx, node_posy));
      node.addChild(ms_number_text);
      listener = cc.EventListener.create({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        onTouchBegan: self.onMilestoneSelected
      });
      cc.eventManager.addListener(listener, node);
      parent.addChild(node);
    }
  },

  onMilestoneSelected: function (touch, event) {
    'use strict';

    var target = event.getCurrentTarget(),
      point = touch.getLocation(),
      locationInNode = target.convertToNodeSpace(point),
      targetSize = target.getContentSize(),
      rect = cc.rect(0, 0, targetSize.width, targetSize.height),
      ms_number;

    if (cc.rectContainsPoint(rect, locationInNode)) {
      ms_number = target.getChildByTag(TEXT_TAG).getString();
      cc.eventManager.dispatchCustomEvent('ms_selected', {ms: ms_number});
    }
    return true;
  },

  unuse: function () {
    'use strict';

    this.setVisible(false);
  }
});
