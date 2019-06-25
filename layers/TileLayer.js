/* global cc, ccui, TileLayer: true, NodeLayer,
  ADV_MAP_CONTAINER_TAG: true, ADV_MAP_NODE_TAG: true
*/

TileLayer = ccui.Widget.extend({
  ms_number: 0,
  map_idx: -1,
  row_idx: -1,
  prev_map_max_range: -1,
  tile_map: '',
  hor_size: null,
  map_data: null,
  node_settings: null,
  ctor: function (map_data) {
    'use strict';

    var hor_layout_width = map_data.tileWidth * map_data.rowLength,
      hor_layout_height = map_data.tileHeight;

    this._super();
    this.hor_size = cc.size(hor_layout_width, hor_layout_height);
    this.map_data = map_data;
    return true;
  },

  build: function (map_data, map, node_settings) {
    'use strict';

    var self = this,
      hor_size = self.hor_size;

    self.scrollable_map = map;
    self.node_settings = node_settings;
    self.setContentSize(hor_size);
    self.generateTileLayer(map_data);
  },

  generateTileLayer: function (map_data) {
    'use strict';

    var j, tile_added, prev_tiles_added, data,
      self = this;

    prev_tiles_added = self.row_idx * map_data.rowLength;
    for (j = 0; j < map_data.rowLength; j++) {
      tile_added = prev_tiles_added + j;
      data = self.checkInArray(map_data.nodes, tile_added);
      if (data) {
        self.setMilestone(data, map_data);
      }
    }
  },

  reCreateTileLayer: function (map_data) {
    'use strict';

    var tile, url, i, container, tile_added, prev_tiles_added,
      tile_layer,
      self = this;

    tile_layer = cc.pool.getFromPool(TileLayer);
    container = tile_layer.getChildByTag(ADV_MAP_CONTAINER_TAG);
    container.retain();
    container.removeFromParent();
    self.addChild(container);

    prev_tiles_added = self.row_idx * map_data.rowLength;
    for (i = 0; i < container.getChildrenCount(); i++) {
      tile = container.getChildren()[i];
      tile_added = prev_tiles_added + i;
      url = self.tile_map + '_' + self.row_idx + '_' + i + '.png';
      tile.loadTexture(url, ccui.Widget.PLIST_TEXTURE);
      self.setNode(map_data, tile_added, tile);
    }
  },

  createTileLayer: function () {
    'use strict';

    var tile, j, url, container, tile_added, prev_tiles_added, map_data,
      self = this;

    map_data = self.map_data;
    container = new ccui.Layout();
    container.setLayoutType(ccui.Layout.LINEAR_HORIZONTAL);
    container.setContentSize(self.hor_size);
    self.addChild(container);
    container.setTag(ADV_MAP_CONTAINER_TAG);
    prev_tiles_added = self.row_idx * map_data.rowLength;
    for (j = 0; j < map_data.rowLength; j++) {
      url = self.tile_map + '_' + self.row_idx + '_' + j + '.png';
      tile_added = prev_tiles_added + j;
      tile = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
      self.setNode(map_data, tile_added, tile);
      container.addChild(tile);
    }
  },

  setNode: function (map_data, tile_number, parent) {
    'use strict';

    var node, data,
      self = this,
      node_settings = self.node_settings;

    parent.removeAllChildren();
    data = self.checkInArray(map_data.nodes, tile_number);
    if (data) {
      self.setMilestone(data, map_data);
      node = new NodeLayer();
      data.max_ms = map_data.max_ms_no;
      data.ms = self.ms_number;
      data.scrollable_map = self.scrollable_map;
      data.node_settings = node_settings;
      node.build(data);
      node.setTouchEnabled(true);
      node.setTag(ADV_MAP_NODE_TAG);
      parent.addChild(node);
    }
  },

  setMilestone: function (data, map_data) {
    'use strict';

    var self = this,
      map = self.scrollable_map,
      ms_in_map, ms, ms_number;

    ms_in_map = map_data.nodes.length * map_data.repeat;
    ms = data.node + map_data.nodes.length * self.map_idx;
    ms_number = self.prev_map_max_range + ms;
    if (ms_number === map_data.max_ms_no) {
      map.setFocusChild(self);
    }
    self.ms_number = ms_number;
  },

  checkInArray: function (array, condition) {
    'use strict';

    return _.find(array, function (obj) {
      return obj.map === condition;
    });
  },

  getTiles: function () {
    'use strict';

    return this.getChildByTag(ADV_MAP_CONTAINER_TAG).getChildren();
  },

  hasContainer: function () {
    'use strict';

    return !!this.getChildByTag(ADV_MAP_CONTAINER_TAG);
  },

  unuse: function () {
    'use strict';

    this.setVisible(false);
  }
});
