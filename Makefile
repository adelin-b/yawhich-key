NAME=yawhich-key
# VERSION=`git describe --abbrev=0 --tags`
VERSION=0.9.0

# DIRS=etc lib bin sbin share
# INSTALL_DIRS=`find $(DIRS) -type d 2>/dev/null`
# INSTALL_FILES=`find $(DIRS) -type f 2>/dev/null`
DOC_FILES=README.md

PKG_DIR=pkg
PKG_NAME=$(NAME)-$(VERSION)
PKG=$(PKG_DIR)/$(PKG_NAME).tar.gz
# SIG=$(PKG_DIR)/$(PKG_NAME).asc

PREFIX=/usr/local

DOC_DIR=$(PREFIX)/share/doc/$(PKG_NAME)

pkg:
	mkdir -p $(PKG_DIR)

$(PKG): pkg
	git archive --output=$(PKG) --prefix=$(PKG_NAME)/ HEAD

build: $(PKG)

# $(SIG): $(PKG)
#   gpg --sign --detach-sign --armor $(PKG)
#
# sign: $(SIG)
#
# clean:
#   rm -f $(PKG) $(SIG)
#
# all: $(PKG) $(SIG)

test:
	./scripts/test

# tag:
#   echo $(version)
#   # git tag v$(VERSION)
#   # git push --tags

# release: $(PKG) $(SIG) tag

install:
	# for dir in $(INSTALL_DIRS); do mkdir -p $(PREFIX)/$$dir; done
	# for file in $(INSTALL_FILES); do cp $$file $(PREFIX)/$$file; done
	mkdir -p $(DESTDIR)$(PREFIX)/bin/
	cp yawhich-key $(DESTDIR)$(PREFIX)/bin/yawhich-key

uninstall:
	rm -f $(DESTDIR)$(PREFIX)/bin/yawhich-key
	# for file in $(INSTALL_FILES); do rm -f $(PREFIX)/$$file; done
	# rm -rf $(DOC_DIR)

.PHONY: build sign clean test tag release install uninstall all
