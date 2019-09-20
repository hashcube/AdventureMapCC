/* global cc, adv_map: true, res
 */

adv_map = {
  constants: {
    tags: {
      container: 0,
      node_image: 1
    },
    z_index: {
      container: 1,
      navigator: 2,
      chapter: 3
    },
    scrollmap: {
      pos_top: 0,
      pos_bottom: 1,
      dist_check_const: 10
    }
  },
  layers: {}
};

adv_map.AdventureMapLayer = cc.Layer.extend({
  data_path: '',
  max_ms: 0,
  node_settings: null,
  player_navigator: null,
  tile_config: null,
  ctor: function () {
    'use strict';

    this._super();
    this.scrollable_map = new adv_map.layers.VerticalScrollMap();
    this.addChild(this.scrollable_map);

    _.bindAll(this, 'refreshMap');

    return true;
  },

  build: function (opts) {
    'use strict';

    var tile_config, node_settings,
      map = this.scrollable_map;

    this.data_path = opts.data_path;
    node_settings = this.node_settings = _.extend(cc.loader.getRes(
      this.data_path + 'settings/node_settings.json'),
      opts.node_settings || {});
    tile_config = this.tile_config = cc.loader.getRes(this.data_path +
      'tile_config.json');

    this.initializeMap(tile_config, opts.ms, node_settings);
    map.setAdventureMapSize();
  },

  initializeMap: function (tile_config, ms, node_settings) {
    'use strict';

    var i, j, k, tile_data, tile, repeat, map_data, chapter,
      hor_layout, map, col_length, range;

    map = this.scrollable_map;
    chapter = tile_config.length / 2;
    for (k = 0; k < tile_config.length; k++) {
      tile_data = tile_config[k];
      tile = tile_data.tile_id;
      chapter += tile.indexOf('bridge') !== -1 ? -1 : 0;
      repeat = tile_data.repeat;
      range = tile_data.range;

      map_data = cc.loader.getRes(this.data_path + tile + '.json');
      map_data.ms = ms;
      cc.spriteFrameCache.addSpriteFrames(res[tile], res[tile + '_img']);
      col_length = map_data.colLength;

      for (i = repeat; i > 0; i--) {
        for (j = 0; j < col_length; j++) {
          hor_layout = new adv_map.layers.TileLayer(map_data);
          hor_layout.tile_map = tile;
          hor_layout.map_idx = i - 1;
          hor_layout.row_idx = j;
          hor_layout.chapter = chapter;
          hor_layout.prev_map_max_range = range ? range.min - 1 : 0;
          hor_layout.setVisible(false);
          hor_layout.build(map_data, map, node_settings);
          map.addChild(hor_layout);
        }
      }
    }
  },

  findTileLayerByMSNumber: function (ms) {
    'use strict';

    var layers = this.scrollable_map.map_children;

    return _.find(layers, function (layer) {
      return layer.ms_number === ms;
    });
  },

  getAllTileLayersWithNodes: function () {
    'use strict';

    var layers = this.scrollable_map.map_children;

    return _.filter(layers, function (layer) {
      return layer.ms_number > 0;
    });
  },

  getTagById: function (id) {
    'use strict';

    var layers = this.getAllTileLayersWithNodes(),
      layer;

    layer = _.find(layers, function (layer) {
      return !_.isNull(layer.getChildByName(id));
    });

    if (layer) {
      return layer.getChildByName(id);
    }
    return null;
  },

  removeTag: function (id) {
    'use strict';

    var child = this.getTagById(id);

    if (child) {
      child.removeFromParent();
    }
  },

  removeTagByMs: function (tag, ms) {
    'use strict';

    var layer = this.findTileLayerByMSNumber(ms),
      child;

    if (layer) {
      child = layer.getChildByName(tag);
      if (child) {
        child.removeFromParent();
      }
    }
  },

  createMapWithTile: function (index) {
    'use strict';

    var hor_layout, map_data,
      map = this.scrollable_map;

    hor_layout = map.map_children[index];
    hor_layout.setVisible(true);
    map_data = hor_layout.map_data;
    hor_layout.reCreateTileLayer(map_data);
  },

  findNodeByMSNumber: function (ms) {
    'use strict';

    var nodes = this.getAllVisibleNodesInMap(),
      i;

    for (i = 0; i < nodes.length; i++) {
      if (nodes[i].milestone === ms) {
        return nodes[i];
      }
    }
  },

  getAllVisibleNodesInMap: function () {
    'use strict';

    var i, tile_layer, node,
      nodes = [],
      map = this.scrollable_map,
      children = map.map_children,
      child_max = map.getBottomChildIndex(),
      child_min = map.getTopChildIndex();

    for (i = child_min; i <= child_max; i++) {
      tile_layer = children[i];
      node = tile_layer.getChildByName('NodeLayer');
      if (node) {
        nodes.push(node);
      }
    }

    return nodes;
  },

  cycleThroughMap: function (ms) {
    'use strict';

    var map = this.scrollable_map,
      i = 0,
      tileLayer;

    for (i = 0; i < map.map_children.length; i++) {
      tileLayer = map.map_children[i];
      tileLayer.resetNavigatorData();
      if (tileLayer.ms_number === ms) {
        map.setFocusChild(tileLayer);
      }
      if (tileLayer.hasContainer()) {
        cc.pool.putInPool(tileLayer);
      }
    }
    map.createVisibleArea();
  },

  refreshMap: function (opts) {
    'use strict';

    var ms = opts.ms,
      sync = opts.sync,
      tile_layer;

    if (sync) {
      this.cycleThroughMap(ms);
    }

    _.each(this.getAllVisibleNodesInMap(), _.bind(function (node) {
      node.refreshNode();
      if (node.milestone === ms) {
        tile_layer = this.findTileLayerByMSNumber(ms);
        this.scrollable_map.setFocusChild(tile_layer);
      }
    }, this));

    this.scrollable_map.jumpToVisibleArea();
  }
});
