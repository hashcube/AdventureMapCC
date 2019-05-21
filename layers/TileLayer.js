/* global cc, ccui, CONTAINER_TAG: true,
  TileLayer: true, NodeLayer
 */

CONTAINER_TAG = 0;

TileLayer = ccui.Widget.extend({
  map_idx: -1,
  row_idx: -1,
  prev_max_ms: -1,
  tile_map: '',
  hor_size: null,
  map_data: null,
  node_settings: null,
  ctor: function (mapData) {
    'use strict';

    var horLayoutWidth = mapData.tileWidth * mapData.rowLength,
      horLayoutHeight = mapData.tileHeight;

    this._super();
    this.hor_size = cc.size(horLayoutWidth, horLayoutHeight);
    this.map_data = mapData;
    return true;
  },

  build: function (mapData, map, node_settings) {
    'use strict';

    var self = this,
      horSize = self.hor_size;

    self.map = map;
    self.node_settings = node_settings;
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
      data = self.checkInArray(mapData.nodes, tile_added);
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
    container.setContentSize(self.hor_size);
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

    var node, data,
      self = this,
      node_settings = self.node_settings;

    parent.removeAllChildren();
    data = self.checkInArray(mapData.nodes, tile_number);
    if (data) {
      self.setMilestone(data, mapData);
      node = new NodeLayer();
      data.url = self.getImageURL(mapData.max_ms_no);
      data.ms = self._msNumber;
      data.character_settings = node_settings.character_settings;
      node.build(data);
      node.setTouchEnabled(true);
      if (self._msNumber <= mapData.max_ms_no) {
        node.addTouchEventListener(_.bind(self.onMilestoneSelected, self
        ), node);
      }
      if (self._msNumber === mapData.max_ms_no) {
        self.map.buildLevelNavigator(node, node_settings);
      }
      parent.addChild(node);
    }
  },

  getImageURL: function (max_ms) {
    'use strict';

    var self = this,
      node_settings = self.node_settings,
      nodes = node_settings.nodes,
      ms = self._msNumber,
      stars = node_settings.star_data[ms],
      url;

    url = ms <= max_ms ? nodes[stars].image :
      nodes[nodes.length - 1].image;
    return url;
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
      map.setFocusChild(self);
    }
    self._msNumber = ms_number;
  },

  onMilestoneSelected: function (target, type) {
    'use strict';

    var ms_number,
      self = this;

    if (type === ccui.Widget.TOUCH_ENDED) {
      ms_number = target.milestone;
      cc.eventManager.dispatchCustomEvent('ms_selected', {
        ms: ms_number,
        node: target
      });
      self.map.map_position = self.map.getInnerContainerPosition();
    }
  },

  checkInArray: function (array, condition) {
    'use strict';

    return _.find(array, function (obj) {
      return obj.map === condition;
    });
  },

  unuse: function () {
    'use strict';

    this.setVisible(false);
  }
});
