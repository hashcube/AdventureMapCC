/* global cc, adv_map: true
*/
adv_map.layers.GiftingLevel = adv_map.layers.NodeExtra.extend({
  ctor: function (opts) {
    'use strict';

    this._super(opts);
    this.setPosition(opts.pos);
    this.build(opts);
    this.setContentSize(opts.size);
  },

  build: function (opts) {
    'use strict';

    var idle_animation = opts.settings.idle_animation,
      image = new cc.Sprite('#' + idle_animation.frames[0]),
      anim_frames = [],
      str = '',
      i, sprite_frame, anim_frame, animation, animate, animate_with_delay;

    image.setPosition(cc.p(opts.size.width * 0.5, opts.size.height * 0.5));
    this.addChild(image);

    for (i = 0; i < idle_animation.frames.length; i++) {
      str = idle_animation.frames[i];
      sprite_frame = cc.spriteFrameCache.getSpriteFrame(str);
      anim_frame = new cc.AnimationFrame();
      anim_frame.initWithSpriteFrame(sprite_frame, 1, null);
      anim_frames.push(anim_frame);
    }
    animation = new cc.Animation(anim_frames, 0.08);
    animate = new cc.Animate(animation);
    animate_with_delay = new cc.Sequence(animate, cc.delayTime(1));

    image.runAction(new cc.RepeatForever(animate_with_delay));
  }
});
