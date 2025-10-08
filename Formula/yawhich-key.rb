class YawhichKey < Formula
  desc "Which-key like keybinding helper for macOS"
  homepage "https://github.com/adelin-b/yawhich-key"
  version "1.0.0"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/adelin-b/yawhich-key/releases/download/v#{version}/yawhich-key_#{version}_aarch64.dmg"
      sha256 "PLACEHOLDER_SHA256_ARM64"
    else
      url "https://github.com/adelin-b/yawhich-key/releases/download/v#{version}/yawhich-key_#{version}_x86_64.dmg"
      sha256 "PLACEHOLDER_SHA256_X86_64"
    end
  end

  depends_on macos: ">= :catalina"

  def install
    prefix.install "yawhich-key.app"
    bin.install_symlink prefix/"yawhich-key.app/Contents/MacOS/yawhich-key" => "yawhich-key"
  end

  def caveats
    <<~EOS
      yawhich-key has been installed!

      The app bundle is available at:
        #{prefix}/yawhich-key.app

      The command-line binary is linked to:
        #{bin}/yawhich-key

      To configure yawhich-key, create your config at:
        ~/.config/yawhich-key/

      For more information, visit:
        https://github.com/adelin-b/yawhich-key
    EOS
  end

  test do
    system "#{bin}/yawhich-key", "--version"
  end
end
