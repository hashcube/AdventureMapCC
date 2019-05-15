/* global cc, ccui, res, CONTAINER_TAG: true,
  TileLayer: true, TEXT_TAG: true
 */

TEXT_TAG = 0;
CONTAINER_TAG = 1;

TileLayer = ccui.Widget.extend({
  map_idx: -1,
  row_idx: -1,
  prev_max_ms: -1,
  tile_map: '',
  hor_size: null,
  map_data: null,
  ctor: function (mapData) {
    'use strict';

    var horLayoutWidth = mapData.tileWidth * mapData.rowLength,
      horLayoutHeight = mapData.tileHeight;

    this._super();
    this.hor_size = cc.size(horLayoutWidth, horLayoutHeight);
    this.map_data = mapData;
    return true;
  },

  build: function (mapData, map) {
    'use strict';

    var self = this,
      horSize = self.hor_size;

    self.map = map;
    self.setContentSize(horSize);
    self.generateTileLayer(mapData);
  },

  generateTileLayer: function (mapData) {
    'use strict';

    var j, tile_added, prev_tiles_added, data,
      self = this;

    prev_tiles_added = self.row_idx * mapData.rowLength;
    for (j = 0; j < mapData.rowLength; j++) {
      tile_added = prev_tiles_added + j;
      data = _.find(mapData.nodes, function (obj) {
        return obj.map === tile_added;
      });
      if (data) {
        self.setMilestone(data, mapData);
      }
    }
  },

  reCreateTileLayer: function (mapData) {
    'use strict';

    var tile, url, i, container, tile_added, prev_tiles_added,
      tile_layer,
      self = this;

    tile_layer = cc.pool.getFromPool(TileLayer);
    container = tile_layer.getChildByTag(CONTAINER_TAG);
    container.retain();
    container.removeFromParent();
    self.addChild(container);

    prev_tiles_added = self.row_idx * mapData.rowLength;
    for (i = 0; i < container.getChildrenCount(); i++) {
      tile = container.getChildren()[i];
      tile_added = prev_tiles_added + i;
      url = self.tile_map + '_' + self.row_idx + '_' + i + '.png';
      tile.loadTexture(url, ccui.Widget.PLIST_TEXTURE);
      self.setNode(mapData, tile_added, tile);
    }
  },

  createTileLayer: function (mapData) {
    'use strict';

    var tile, j, url, container, tile_added, prev_tiles_added,
      self = this;

    mapData = mapData || self.map_data;
    container = new ccui.Layout();
    container.setLayoutType(ccui.Layout.LINEAR_HORIZONTAL);
    container.setContentSize(this.hor_size);
    self.addChild(container);
    container.setTag(CONTAINER_TAG);
    prev_tiles_added = self.row_idx * mapData.rowLength;
    for (j = 0; j < mapData.rowLength; j++) {
      url = self.tile_map + '_' + self.row_idx + '_' + j + '.png';
      tile_added = prev_tiles_added + j;
      tile = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
      self.setNode(mapData, tile_added, tile);
      container.addChild(tile);
    }
  },

  setNode: function (mapData, tile_number, parent) {
    'use strict';

    var node, data, node_posx, node_posy, ms_number_text;

    parent.removeAllChildren();
    data = _.find(mapData.nodes, function (obj) {
      return obj.map === tile_number;
    });
    if (data) {
      this.setMilestone(data, mapData);
      node = new ccui.ImageView(res.msicon);
      node.attr({
        x: data.x,
        y: data.y
      });

      ms_number_text = new cc.LabelTTF(this._msNumber,
        cc._mGetCustomFontName(res.Sansita_Bold));
      ms_number_text.setTag(TEXT_TAG);
      node_posx = node.getContentSize().width / 2;
      node_posy = node.getContentSize().height / 4;
      ms_number_text.setPosition(cc.p(node_posx, node_posy));
      node.addChild(ms_number_text);
      node.setTouchEnabled(true);
      node.addTouchEventListener(_.bind(this.onMilestoneSelected, this), node);
      parent.addChild(node);
    }
  },

  setMilestone: function (data, mapData) {
    'use strict';

    var self = this,
      map = self.map,
      ms_in_map, ms, ms_number;

    ms_in_map = mapData.nodes.length * mapData.repeat;
    ms = data.node + mapData.nodes.length * self.map_idx;
    ms_number = self.prev_max_ms + ms;
    if (ms_number === mapData.max_ms_no) {
      map.setFocusChild(this);
    }
    this._msNumber = ms_number;
  },

  onMilestoneSelected: function (target, type) {
    'use strict';

    var ms_number;

    if (type === ccui.Widget.TOUCH_ENDED) {
      ms_number = target.getChildByTag(TEXT_TAG).getString();
      cc.eventManager.dispatchCustomEvent('ms_selected', {ms: ms_number});
      this.map.map_position = this.map.getInnerContainerPosition();
    }
  },

  unuse: function () {
    'use strict';

    this.setVisible(false);
  }
});
