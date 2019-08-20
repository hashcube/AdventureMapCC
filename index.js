/* global cc, adv_map: true, res
 */

adv_map = {
  constants: {
    tags: {
      container: 0,
      node: 1,
      node_image: 2,
      navigator: 3
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
    },
    scale: {
      node: 1
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

    _.bindAll(this, 'refreshMap', 'onMSSelected', 'onMapBuilt');

    return true;
  },

  onEnter: function () {
    'use strict';

    this._super();

    // Event listener for milestone clicked
    cc.eventManager.addCustomListener('ms_selected', this.onMSSelected);
  },

  onExit: function () {
    'use strict';

    this._super();
    cc.eventManager.removeCustomListeners('ms_selected');
  },

  build: function (opts) {
    'use strict';

    var tile_config, node_settings,
      map = this.scrollable_map,
      max_ms_no = this.max_ms = opts.max_ms;

    this.data_path = opts.data_path;
    node_settings = this.node_settings = cc.loader.getRes(
      this.data_path + 'settings/node_settings.json'
    );
    this.fb_data = opts.fb_data;
    node_settings.star_data = opts.star_data;
    tile_config = this.tile_config = cc.loader.getRes(this.data_path +
      'tile_config.json');
    cc.spriteFrameCache.addSpriteFrames(res[node_settings.node_plist],
      res[node_settings.node_img]
    );

    adv_map.constants.scale.node = opts.tablet_scale || 1;
    this.initializeMap(tile_config, max_ms_no, node_settings);
    map.setAdventureMapSize();
    this.addChild(map);
  },

  initializeMap: function (tile_config, max_ms_no, node_settings) {
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
      map_data.max_ms_no = max_ms_no;
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

  onMapBuilt: function () {
    'use strict';

    this.buildPlayerLevelNavigator(this.node_settings);
    if (this.fb_data) {
      this.buildFriendsPlayerNavigator(this.fb_data.friends_data,
        this.fb_data.status);
    }
    cc.eventManager.dispatchCustomEvent('map_built');
  },

  findTileLayerByMSNumber: function (ms) {
    'use strict';

    var layers = this.scrollable_map.map_children,
      i;

    for (i = layers.length - 1; i >= 0; i--) {
      if (layers[i].ms_number === ms) {
        return layers[i];
      }
    }
  },

  getAllTileLayersWithNodes: function () {
    'use strict';

    var layers = this.scrollable_map.map_children,
      tile_layers = [],
      i;

    for (i = layers.length - 1; i >= 0; i--) {
      if (layers[i].ms_number !== 0) {
        tile_layers.push(layers[i]);
      }
    }

    return tile_layers;
  },

  buildFriendsPlayerNavigator: function (friends_data, logged_in) {
    'use strict';

    var node, friend_navigator, tile_layer, nav_data,
      node_settings = this.node_settings;

    _.each(friends_data, _.bind(function (ms, uid) {
      if (ms <= this.tile_config[1].range.max) {
        node = this.findNodeByMSNumber(ms);
        nav_data = {
          uid: uid,
          is_friend: true
        };
        if (node && logged_in) {
          friend_navigator = new adv_map.layers.LevelNavigator(true);
          friend_navigator.build(node, node_settings);
          friend_navigator.refresh(uid);
          node.tile_layer.saveNavigatorData(nav_data);
          node.addNavigator(friend_navigator);
        } else if (node && !logged_in) {
          while (node.getChildByTag(adv_map.constants.tags.navigator)) {
            node.removeChildByTag(adv_map.constants.tags.navigator);
          }
        } else {
          tile_layer = this.findTileLayerByMSNumber(ms);
          if (tile_layer && logged_in) {
            tile_layer.saveNavigatorData(nav_data);
          } else if (tile_layer && !logged_in) {
            tile_layer.resetNavigatorData();
          }
        }
      }
    }, this));
  },

  buildPlayerLevelNavigator: function (node_settings) {
    'use strict';

    var player_uid = this.fb_data ? this.fb_data.uid : '',
      parent = this.findNodeByMSNumber(this.max_ms);

    if (parent && !this.player_navigator) {
      this.player_navigator = new adv_map.layers.LevelNavigator();
      this.player_navigator.build(parent, node_settings);
      this.player_navigator.refresh(player_uid);
      parent.tile_layer.saveNavigatorData({
        uid: player_uid,
        is_friend: false
      });
      parent.addNavigator(this.player_navigator);
    }
  },

  onMSSelected: function (evt) {
    'use strict';

    var params = evt.getUserData(),
      ms = params.ms,
      node = this.findNodeByMSNumber(ms);

    if (node) {
      this.player_navigator.reposition(node);
    }
  },

  createMapWithTile: function (index) {
    'use strict';

    var hor_layout, map_data,
      map = this.scrollable_map;

    hor_layout = map.map_children[index];
    hor_layout.setVisible(true);
    map_data = hor_layout.map_data;
    map_data.max_ms_no = this.max_ms;
    hor_layout.reCreateTileLayer(map_data);
  },

  resetPlayerNavigator: function (uid) {
    'use strict';

    var focus_child, node;

    this.player_navigator.refresh(uid);
    focus_child = this.scrollable_map.getFocusChild();
    node = focus_child.getNode();
    if (node) {
      node.tile_layer.saveNavigatorData({
        uid: uid,
        is_friend: false
      });
      this.player_navigator.reposition(node);
    }
    this.scrollable_map.jumpToVisibleArea();
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
      node = tile_layer.getNode();
      if (node) {
        nodes.push(node);
      }
    }

    return nodes;
  },

  cycleThroughMap: function (curr_ms, star_data) {
    'use strict';

    var map = this.scrollable_map,
      i = 0,
      tileLayer;

    for (i = 0; i < map.map_children.length; i++) {
      tileLayer = map.map_children[i];
      tileLayer.resetNavigatorData();
      tileLayer.node_settings.star_data = star_data;
      if (tileLayer.ms_number === curr_ms) {
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

    var star_data = opts.star_data,
      max_ms = this.max_ms = opts.max_ms,
      curr_ms = opts.curr_ms,
      fb_data = opts.fb_data,
      sync = opts.sync;

    if (sync) {
      this.cycleThroughMap(curr_ms, star_data);
      this.buildFriendsPlayerNavigator(fb_data.friends_data, fb_data.status);
    }

    _.each(this.getAllVisibleNodesInMap(), _.bind(function (node) {
      node.refreshNode(max_ms, star_data);
      if (node.milestone === curr_ms) {
        this.scrollable_map.setFocusChild(node.tile_layer);
      }
    }, this));

    this.fb_data = fb_data;
    this.resetPlayerNavigator(fb_data.uid);
  }
});
