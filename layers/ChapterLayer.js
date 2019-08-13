/* global ChapterLayer: true, cc, ccui, res
*/
ChapterLayer = ccui.Widget.extend({
  ctor: function (opts) {
    'use strict';

    var chapter_img, chapter_text, chapter_number, chapter_img_size,
      chapter_settings = opts.settings,
      size = opts.size,
      chapter = opts.chapter,
      chapter_stroke = chapter_settings.chapter_text.stroke,
      number_stroke = chapter_settings.number_text.stroke;

    this._super();
    this.setPosition(cc.p(size.width * 0.5, size.height * 1.5));
    this.setContentSize(size);

    chapter_img = new ccui.ImageView(chapter_settings.image,
      ccui.Widget.PLIST_TEXTURE);
    chapter_img.setPosition(cc.p(size.width * 0.5, size.height * 0.5));
    chapter_img_size = chapter_img.getContentSize();
    this.addChild(chapter_img);

    chapter_text = new ccui.Text(chapter_settings.text,
      cc._mGetCustomFontName(res[chapter_settings.chapter_text.font], true),
      chapter_settings.chapter_text.font_size);
    if (chapter_stroke) {
      chapter_text.enableStroke(cc.color(chapter_stroke.stroke_color),
        chapter_stroke.stroke_width);
    }
    chapter_text.setPosition(cc.p(chapter_img_size.width * 0.5,
      chapter_img_size.height * 0.48));
    chapter_img.addChild(chapter_text);

    chapter_number = new cc.LabelTTF(chapter,
      cc._mGetCustomFontName(res[chapter_settings.number_text.font], true));
    chapter_number.setFontSize(chapter_settings.number_text.font_size);
    if (number_stroke) {
      chapter_number.enableStroke(cc.color(number_stroke.stroke_color),
        number_stroke.stroke_width);
    }
    chapter_number.setPosition(cc.p(chapter_img_size.width * 0.5,
      chapter_img_size.height * 0.2));
    chapter_img.addChild(chapter_number);
  }
});
