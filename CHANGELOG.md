# Changelog

All notable changes to EggPuff are documented here.

## [0.6.0] — Product Experience Upgrade

### Added

- Added Read More behavior for long posts and text content to improve readability.
- Added partial rich-text support, including bold text formatting.
- Added mobile shortcuts for bold and rich-text formatting.
- Added onboarding and Explore animation to improve the first-time user experience.
- Added HipoLabs API integration for college search and discovery.
- Added manual graduation-batch entry during profile setup.
- Added college request functionality for colleges that are not yet available in EggPuff.
- Added profile navigation behavior to guide users directly toward the college selection area during setup.

### Improved

- Improved Question Card alignment, spacing, and overall visual consistency.
- Improved readability and presentation of long-form post content.
- Improved the visual handling of long URLs by shortening them when displayed.
- Improved the mobile content-creation experience with easier rich-text formatting.
- Improved the profile setup and onboarding flow for new students.
- Improved college search behavior and campus selection interactions.
- Improved college request handling and feedback states.
- Improved profile setup interactions around college and graduation-batch selection.

### Fixed

- Fixed the PYP click error that prevented reliable interaction with PYP content.
- Fixed issues in the profile and college setup flow.
- Fixed navigation behavior when directing users to the college selection area.
- Fixed interaction issues related to college search and college requests.
- Fixed supporting content interaction issues related to long text and rich-text handling.

### Internal / Technical

- Integrated the HipoLabs college API through the EggPuff college-search API route.
- Refined the editor and content-processing flow to support rich-text formatting.
- Updated editor change handling for improved rich-text behavior.
- Refined feed content components and supporting hooks for improved content presentation.
- Updated profile setup logic to support manual graduation-batch entry and college requests.
- Refined supporting profile, feed, and question components for the updated UX.
- Updated project dependencies and package configuration where required.
- Improved frontend handling of content, profile, and onboarding interactions.

### Release Summary

- v0.6.0 is a feature-focused release centered around improving the overall student experience.
- This release strengthens EggPuff's content creation, content readability, profile setup, onboarding, campus discovery, and PYP experience.
- No breaking architectural or product changes were introduced in this release.

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