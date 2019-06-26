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

    var hor_size = this.hor_size;

    this.scrollable_map = map;
    this.node_settings = node_settings;
    this.setContentSize(hor_size);
    this.generateTileLayer(map_data);
  },

  generateTileLayer: function (map_data) {
    'use strict';

    var j, tile_added, prev_tiles_added, data;

    prev_tiles_added = this.row_idx * map_data.rowLength;
    for (j = 0; j < map_data.rowLength; j++) {
      tile_added = prev_tiles_added + j;
      data = this.checkInArray(map_data.nodes, tile_added);
      if (data) {
        this.setMilestone(data, map_data);
        if (this.ms_number === map_data.max_ms_no) {
          this.scrollable_map.setFocusChild(this);
        }
      }
    }
  },

  reCreateTileLayer: function (map_data) {
    'use strict';

    var tile, url, i, container, tile_added, prev_tiles_added,
      tile_layer, tile_map, row_idx;

    tile_layer = cc.pool.getFromPool(TileLayer);
    container = tile_layer.getChildByTag(ADV_MAP_CONTAINER_TAG);
    container.retain();
    container.removeFromParent();
    this.addChild(container);

    prev_tiles_added = this.row_idx * map_data.rowLength;
    tile_map = this.tile_map;
    row_idx = this.row_idx;
    for (i = 0; i < container.getChildrenCount(); i++) {
      tile = container.getChildren()[i];
      tile_added = prev_tiles_added + i;
      url = tile_map + '_' + row_idx + '_' + i + '.png';
      tile.loadTexture(url, ccui.Widget.PLIST_TEXTURE);
      this.setNode(map_data, tile_added, tile);
    }
  },

  createTileLayer: function () {
    'use strict';

    var tile, j, url, container, tile_added, prev_tiles_added, map_data,
      tile_map, row_idx;

    map_data = this.map_data;
    container = new ccui.Layout();
    container.setLayoutType(ccui.Layout.LINEAR_HORIZONTAL);
    container.setContentSize(this.hor_size);
    this.addChild(container);
    container.setTag(ADV_MAP_CONTAINER_TAG);
    prev_tiles_added = this.row_idx * map_data.rowLength;
    tile_map = this.tile_map;
    row_idx = this.row_idx;
    for (j = 0; j < map_data.rowLength; j++) {
      url = tile_map + '_' + row_idx + '_' + j + '.png';
      tile_added = prev_tiles_added + j;
      tile = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
      this.setNode(map_data, tile_added, tile);
      container.addChild(tile);
    }
  },

  setNode: function (map_data, tile_number, parent) {
    'use strict';

    var node, data,
      node_settings = this.node_settings;

    parent.removeAllChildren();
    data = this.checkInArray(map_data.nodes, tile_number);
    if (data) {
      this.setMilestone(data, map_data);
      node = new NodeLayer();
      data.max_ms = map_data.max_ms_no;
      data.ms = this.ms_number;
      data.scrollable_map = this.scrollable_map;
      data.node_settings = node_settings;
      node.build(data);
      node.setTouchEnabled(true);
      node.setTag(ADV_MAP_NODE_TAG);
      parent.addChild(node);
    }
  },

  setMilestone: function (data, map_data) {
    'use strict';

    var ms_in_map, ms, ms_number;

    ms_in_map = map_data.nodes.length * map_data.repeat;
    ms = data.node + map_data.nodes.length * this.map_idx;
    ms_number = this.prev_map_max_range + ms;
    this.ms_number = ms_number;
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

  getNode: function () {
    'use strict';

    var tiles = this.getTiles(),
      tile, j, node;

    for (j = 0; j < tiles.length; j++) {
      tile = tiles[j];
      node = tile.getChildByTag(ADV_MAP_NODE_TAG);
      if (node) {
        return node;
      }
    }
    return null;
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
