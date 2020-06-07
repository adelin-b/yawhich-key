# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.8.0](https://github.com/adelin-b/yawhich-key/compare/v0.7.0...v0.8.0) (2020-06-07)


### Features

* **layers:** now use the window_class key in yaml ([dfd2a4c](https://github.com/adelin-b/yawhich-key/commit/dfd2a4c861f91928c00cd05a42a980e28c25c664))


### Bug Fixes

* **layers:** now doesnt have weird duplicates ([1a9d3e3](https://github.com/adelin-b/yawhich-key/commit/1a9d3e30a5e04c2a5d07d2778e3e3df01f4d1785))

## [0.7.0](https://github.com/adelin-b/yawhich-key/compare/v0.6.0...v0.7.0) (2020-06-06)


### Features

* **color:** add color in config ([baa0eb2](https://github.com/adelin-b/yawhich-key/commit/baa0eb2b1307f74169eeae524b0d969710760535))
* **config:** now load layers and theme from config folder [#5](https://github.com/adelin-b/yawhich-key/issues/5) ([e7fb71f](https://github.com/adelin-b/yawhich-key/commit/e7fb71f434791b9485ea33db6be8e4495b032bed))
* **layers:** add i3 layer ([0d2b78b](https://github.com/adelin-b/yawhich-key/commit/0d2b78b6852473a7527714ad7f94b30f4eaf7b86))
* **menu:** show the memu path and use message instead of prompt ([3bf8dc4](https://github.com/adelin-b/yawhich-key/commit/3bf8dc4ca621786a177242c1695fe99ac9d37339))


### Bug Fixes

* **sort:** sort by ignoring case ([32dc7c3](https://github.com/adelin-b/yawhich-key/commit/32dc7c3d354d9321bd7abe49c8f03bfafbaeb96a))
* **theme:** set theme config correctly ([1c1501f](https://github.com/adelin-b/yawhich-key/commit/1c1501fc883cb04fb9d32e8447740841e12e52fa))

## [0.6.0](https://github.com/adelin-b/yawhich-key/compare/v0.5.0...v0.6.0) (2020-05-31)


### Features

* **layers:** auto create layer and edit it when --major is called ([d5697d3](https://github.com/adelin-b/yawhich-key/commit/d5697d363d32b55cc37286638f48398edc57fc64))
* **new_command:** add keymap everywhere to add custom command to layer ([d6b9ef3](https://github.com/adelin-b/yawhich-key/commit/d6b9ef3c7bf95b148f3991685199abbabf76f9c2))

## [0.5.0](https://github.com/adelin-b/yawhich-key/compare/v0.4.0...v0.5.0) (2020-05-31)


### ⚠ BREAKING CHANGES

* **layers:** To migrate to the new layer format run this in yawhich-key directory,
you might have to escape some commands that used to be strings with '' around

Multilines commands migration is not supported (please avoid thoses for now)

```bash
cd layers;
for r in *; do
  mv "$r" "$r.bak"
  ../scripts/layers-v1-to-v2.sh "$r.bak" > $r
done
```

### Features

* **config:** add new config options ([4a9ee96](https://github.com/adelin-b/yawhich-key/commit/4a9ee9658e97105d13c0a01b40d9fdb7f747b32a))
* **layers:** improve layer format [#14](https://github.com/adelin-b/yawhich-key/issues/14) [#15](https://github.com/adelin-b/yawhich-key/issues/15) ([95dcc58](https://github.com/adelin-b/yawhich-key/commit/95dcc586a2cb1380aecf77472e291663bf559594))
* **prompt:** display the layer title ([d6325cc](https://github.com/adelin-b/yawhich-key/commit/d6325cc001ada9340b8b1762ccee701c0172bab7))


### Bug Fixes

* **new_layer:** add command to create new layer ([6c75119](https://github.com/adelin-b/yawhich-key/commit/6c751190fad46f4cc6ec76b7376fd3192f4d3e31))
* **prompt:** show prefix between all layers ([81f87b8](https://github.com/adelin-b/yawhich-key/commit/81f87b86943734be30fd09a1f5cd3fc333a261b2))

## [0.4.0](https://github.com/adelin-b/yawhich-key/compare/v0.3.1...v0.4.0) (2020-05-28)


### Features

* **config:** add config file handling ([7fb53c7](https://github.com/adelin-b/yawhich-key/commit/7fb53c7d5f029e07f93cd7d049e80b1576d06f0c))

### [0.3.1](https://github.com/adelin-b/yawhich-key/compare/v0.3.0...v0.3.1) (2020-05-28)


### Bug Fixes

* handle dipslay of more keys at once ([c6258d3](https://github.com/adelin-b/yawhich-key/commit/c6258d3043437d1aa3ba587da68dca4f6afa1ac9))

## [0.3.0](https://github.com/adelin-b/yawhich-key/compare/v0.2.0...v0.3.0) (2020-05-28)


### Features

* **add_new:** propose to add new command directly ([fe9de07](https://github.com/adelin-b/yawhich-key/commit/fe9de07abafc7198d120abbf2ea0fc9efc945b53))
* **layer/core:** add major mode command in core ([cb216ae](https://github.com/adelin-b/yawhich-key/commit/cb216ae95735760f2d76a8132a50f4f297a6f701))


### Bug Fixes

* **sorting:** now sort list correctly ([b193326](https://github.com/adelin-b/yawhich-key/commit/b19332645209851f7135e709f2ac69563c13d1fd))
* wrong naming of env variables ([cd2444d](https://github.com/adelin-b/yawhich-key/commit/cd2444d67e4ec7efbacf8ebd1bd1da12f471c4be))

## [0.2.0](https://github.com/adelin-b/yawhich-key/compare/v0.1.0...v0.2.0) (2020-05-28)


### ⚠ BREAKING CHANGES

* **layers:** json is not used and all the layers are now .yaml,
- you now have to install 'yq' from https://github.com/mikefarah/yq (be careful there is another 'yq' written in python, dont install the wrong one)
- if you already wrote lot of config you can use https://github.com/dbohdan/remarshal with this command to convert all json to yaml `for file in layers/*.json; do remarshal $file --of yaml > `echo $file | sed -e 's/\.json/\.yaml/g'`; done

### Features

* **layer/files-config:** allow to create new layers faster ([9ab5718](https://github.com/adelin-b/yawhich-key/commit/9ab57188be2872c671d67d4b403ce7e983a01196))
* **layer/kitty:** add kitty ([736c125](https://github.com/adelin-b/yawhich-key/commit/736c125b8e62cbd72bd3f4e7f4c986477df520b6))
* **layer/vivaldi-snapshot:** new layer ([5a2dd4a](https://github.com/adelin-b/yawhich-key/commit/5a2dd4a809be55618212fc09bfc3bd570473ad21))
* **layers:** layers are now in yaml ([e9764d8](https://github.com/adelin-b/yawhich-key/commit/e9764d8c43efcfbb03021edae24932e319463ac4))
* **major-mode:** add application specific keymaps handling ([1d23a28](https://github.com/adelin-b/yawhich-key/commit/1d23a282764bc5cb7718175dc971c8fc39923e3f))


### Bug Fixes

* no argument made the variable unbound ([783ec04](https://github.com/adelin-b/yawhich-key/commit/783ec042355dd4d5e479bc48554b2c1beb0dc7c5))

## [0.1.0](https://github.com/adelin-b/yawhich-key/compare/9175af68ecab08bef0a54d31e3ac41e29089da4d...v0.1.0) (2020-05-27)


### Features

* **layers:** add basic layers ([6268793](https://github.com/adelin-b/yawhich-key/commit/62687937de3256980822974c70a7f80561ab3ac2))
* **themes:** add default theme ([fba8062](https://github.com/adelin-b/yawhich-key/commit/fba8062daad7e4355c1ee9965cf49e006e6b968c))
* **yawhich-key:** show which key popup using rofi ([9175af6](https://github.com/adelin-b/yawhich-key/commit/9175af68ecab08bef0a54d31e3ac41e29089da4d))
