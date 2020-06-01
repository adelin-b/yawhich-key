NAME=project
# VERSION=`git describe --abbrev=0 --tags`
VERSION=0.6.0

# DIRS=etc lib bin sbin share
# INSTALL_DIRS=`find $(DIRS) -type d 2>/dev/null`
# INSTALL_FILES=`find $(DIRS) -type f 2>/dev/null`
DOC_FILES=README.md

# PKG_DIR=pkg
PKG_NAME=$(NAME)-$(VERSION)
# PKG=$(PKG_DIR)/$(PKG_NAME).tar.gz
# SIG=$(PKG_DIR)/$(PKG_NAME).asc

PREFIX?=/usr/local/bin
DOC_DIR=$(PREFIX)/share/doc/$(PKG_NAME)

# pkg:
#   mkdir -p $(PKG_DIR)
#
# $(PKG): pkg
#   git archive --output=$(PKG) --prefix=$(PKG_NAME)/ HEAD
#
# build: $(PKG)
#
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
	mkdir -p $(DOC_DIR)
	cp -r $(DOC_FILES) $(DOC_DIR)/
	cp yawhich-key $(PREFIX)/yawhich-key

uninstall:
	# for file in $(INSTALL_FILES); do rm -f $(PREFIX)/$$file; done
	# rm -rf $(DOC_DIR)
	rm -f $(PREFIX)/yawhich-key


.PHONY: build sign clean test tag release install uninstall all
