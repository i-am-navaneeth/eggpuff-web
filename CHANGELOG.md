# Changelog

All notable changes to EggPuff are documented here.

## [0.5.0] — Smart Feed V4 & UX Improvements

### Added

- Smart Feed V4 improvements for smarter content discovery and feed behavior.
- Like button fallback behavior for more reliable interactions.
- Coming Soon state for payments, plans, and purchases.

### Improved

- Re-added the back button for improved navigation.
- Improved the question-opening experience so question text appears immediately while answers load.
- Updated the feed skeleton loading UI.
- Improved paragraph and normal-post spacing.
- Adjusted post text size for improved readability.
- Improved UI for long links and links without image previews.
- Updated the streak SVG UI.
- Improved More sheet behavior when scrolling or interacting with other action menus.
- Fixed Share menu positioning.
- Improved navbar layering and visibility.

### Fixed

- Fixed the duplicate-report issue when the same user reports a question again.
- Fixed navbar visibility on profile pages.
- Fixed navbar z-index behavior with overlays.
- Improved automatic closing behavior for More/action menus.

### Internal / Technical

- Refined Smart Feed V4 implementation and feed behavior.
- Performed load testing across multiple virtual-user levels, including 100 and 150 VUs.
- Improved loading and interaction behavior across question/feed surfaces.
- Refined overlay stacking and interaction handling.
- Improved frontend fallback behavior for unreliable interaction states.