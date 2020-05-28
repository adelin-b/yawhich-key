## [](https://github.com/adelin-b/yawhich-key/compare/v0.3.1...v) (2020-05-28)

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

