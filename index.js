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
    this.scrollable_map = new VerticalScrollMap();

    _.bindAll(this, 'refreshMap');

    return true;
  },

  build: function (opts) {
    'use strict';

    var tile_config, node_settings,
      self = this,
      map = self.scrollable_map,
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

    var i, j, k, tile_data, tile, repeat, map_data,
      hor_layout, map, col_length, range,
      self = this;

    for (k = 0; k < tile_config.length; k++) {
      tile_data = tile_config[k];
      tile = tile_data.tile_id;
      repeat = tile_data.repeat;
      range = tile_data.range;
      map = self.scrollable_map;

      map_data = cc.loader.getRes(self.data_path + tile + '.json');
      map_data.max_ms_no = max_ms_no;
      cc.spriteFrameCache.addSpriteFrames(res[tile], res[tile + '_img']);
      col_length = map_data.colLength;

      for (i = repeat; i > 0; i--) {
        for (j = 0; j < col_length; j++) {
          hor_layout = new TileLayer(map_data);
          hor_layout.tile_map = tile;
          hor_layout.map_idx = i - 1;
          hor_layout.row_idx = j;
          hor_layout.prev_map_max_range = range ? range.min - 1 : 0;
          hor_layout.setVisible(false);
          hor_layout.build(map_data, map, node_settings);
          map.addChild(hor_layout);
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
      this.scrollable_map.player_navigator.reposition(node);
    }
  },

  createMapWithTile: function (index) {
    'use strict';

    var hor_layout, map_data,
      self = this,
      map = self.scrollable_map;

    hor_layout = map.map_children[index];
    hor_layout.setVisible(true);
    map_data = cc.loader.getRes(self.data_path + hor_layout.tile_map + '.json');
    map_data.max_ms_no = self.max_ms;
    hor_layout.reCreateTileLayer(map_data);
  },

  setPlayerNavigator: function (url) {
    'use strict';

    this.scrollable_map.player_navigator.refresh(url);
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
      map = this.scrollable_map,
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

  cycleThroughMap: function (max_ms, star_data) {
    'use strict';

    var map = this.scrollable_map,
      i = 0,
      tileLayer;

    for (i = 0; i < map.map_children.length; i++) {
      tileLayer = map.map_children[i];
      tileLayer.node_settings.star_data = star_data;
      if (tileLayer.ms_number === max_ms) {
        map.setFocusChild(tileLayer);
      } else if (tileLayer.hasContainer()) {
        cc.pool.putInPool(tileLayer);
      }
    }
    map.jumpToVisibleArea();
  },

  refreshMap: function (opts) {
    'use strict';

    var nodes_in_map,
      star_data = opts.star_data,
      max_ms = this.max_ms = opts.max_ms_no;

    this.cycleThroughMap(max_ms, star_data);
    nodes_in_map = this.getAllVisibleNodesInMap();
    _.each(nodes_in_map, _.bind(function (node) {
      node.refreshNode(max_ms, star_data);
    }, this));
    if (opts.fb_picture_url) {
      this.setPlayerNavigator(opts.fb_picture_url);
    }
  }
});
