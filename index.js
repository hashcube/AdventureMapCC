/* global cc, VerticalScrollMap, TileLayer,
  AdventureMapLayer: true, res, ADV_MAP_CONTAINER_TAG: true,
  ADV_MAP_NODE_TAG: true, ADV_MAP_NODE_IMAGE_TAG: true
 */

ADV_MAP_CONTAINER_TAG = 0;
ADV_MAP_NODE_TAG = 1;
ADV_MAP_NODE_IMAGE_TAG = 2;

AdventureMapLayer = cc.Layer.extend({
  data_path: '',
  max_ms: 0,
  node_settings: null,
  ctor: function () {
    'use strict';

    this._super();
    this.scrollableMap = new VerticalScrollMap();

    return true;
  },

  build: function (opts) {
    'use strict';

    var tile_config, node_settings,
      self = this,
      map = self.scrollableMap,
      max_ms_no = self.max_ms = opts.max_ms;

    self.data_path = opts.data_path;
    node_settings = cc.loader.getRes(
      self.data_path + 'settings/node_settings.json'
    );
    node_settings.fb_data = opts.fb_data;
    node_settings.star_data = opts.star_data;
    tile_config = cc.loader.getRes(self.data_path + 'tile_config.json');
    cc.spriteFrameCache.addSpriteFrames(res[node_settings.node_plist],
      res[node_settings.node_img]
    );

    self.initializeMap(tile_config, max_ms_no, node_settings);
    map.setAdventureMapSize();
    self.addChild(map);

    // Event listener for milestone clicked
    cc.eventManager.addCustomListener('ms_selected',
      self.onMSSelected.bind(self));
  },

  initializeMap: function (tile_config, max_ms_no, node_settings) {
    'use strict';

    var i, j, k, tileData, tile, repeat, mapData,
      horLayout, map, colLength, range,
      self = this;

    for (k = 0; k < tile_config.length; k++) {
      tileData = tile_config[k];
      tile = tileData.tile_id;
      repeat = tileData.repeat;
      range = tileData.range;
      map = self.scrollableMap;

      mapData = cc.loader.getRes(self.data_path + tile + '.json');
      mapData.max_ms_no = max_ms_no;
      cc.spriteFrameCache.addSpriteFrames(res[tile], res[tile + '_img']);
      colLength = mapData.colLength;

      for (i = repeat; i > 0; i--) {
        for (j = 0; j < colLength; j++) {
          horLayout = new TileLayer(mapData);
          horLayout.tile_map = tile;
          horLayout.map_idx = i - 1;
          horLayout.row_idx = j;
          horLayout.prev_map_max_range = range ? range.min - 1 : 0;
          horLayout.setVisible(false);
          horLayout.build(mapData, map, node_settings);
          map.addChild(horLayout);
        }
      }
    }
  },

  onMSSelected: function (evt) {
    'use strict';

    var params = evt.getUserData(),
      ms = params.ms,
      node = this.findNodeByMSNumber(ms);

    if (node) {
      this.scrollableMap.player_navigator.reposition(node);
    }
  },

  createMapWithTile: function (index) {
    'use strict';

    var horLayout, mapData,
      self = this,
      map = self.scrollableMap;

    horLayout = map.map_children[index];
    horLayout.setVisible(true);
    mapData = cc.loader.getRes(self.data_path + horLayout.tile_map + '.json');
    mapData.max_ms_no = self.max_ms;
    horLayout.reCreateTileLayer(mapData);
  },

  setPlayerNavigator: function (url) {
    'use strict';

    this.scrollableMap.player_navigator.refresh(url);
  },

  findNodeByMSNumber: function (ms) {
    'use strict';

    var nodes = this.getAllVisibleNodesInMap(),
      i;

    for (i = 0; i < nodes.length; i++) {
      if (nodes[i].getMilestone() === ms) {
        return nodes[i];
      }
    }
  },

  getAllVisibleNodesInMap: function () {
    'use strict';

    var i, j, tile_layer, len, tile, tiles, node,
      nodes = [],
      map = this.scrollableMap,
      children = map.map_children,
      child_max = map.getBottomChildIndex(),
      child_min = map.getTopChildIndex();

    for (i = child_min; i <= child_max; i++) {
      tile_layer = children[i];
      len = tile_layer.getTiles().length;
      tiles = tile_layer.getTiles();
      for (j = 0; j < len; j++) {
        tile = tiles[j];
        node = tile.getChildByTag(ADV_MAP_NODE_TAG);
        if (node) {
          nodes.push(node);
        }
      }
    }

    return nodes;
  },

  refreshMap: function (opts) {
    'use strict';

    var self = this,
      nodes_in_map = self.getAllVisibleNodesInMap(),
      star_data = opts.star_data,
      max_ms = opts.max_ms_no;

    _.each(nodes_in_map, _.bind(function (node) {
      node.refreshNode(max_ms, star_data);
    }, self));
  }
});
