### 1.2.0 - March 11 2022
- New logo (Thanks [@MarcelSteak2](https://twitter.com/MarcelSteak2)!)
- Upgraded to discord.js v13
- Code rewrite / cleanup
- Added `!w check`, which displays details about a specific user in the server's WatchLyst
- Added `!w clearbans`, which removes all of the banned users in the server's WatchLyst
- Add command now displays the provided reason
- Changed some colors around to match the new logo
- Fixed a bug where the aliases for `!w toggleping` was not functioning
- Fixed a bug where command parameters would not work if seperated by newlines or extra spaces
- Add command no longer replaces an apostophe (') with a tilted apostophe (’)
- Improved error messages

### 1.1.1 - January 1 2021
- Fixed a bug where WatchLyst would check for a bot-breaking character only once instead of all instances in an entry's reason.
- When a user encounters an issue, WatchLyst now directs them to the GitHub.

### 1.1.0 - December 24 2020
- Added pages to the list command. Can be used by adding a number after typing the command (May be replaced in the future with reactions as a way to flip between the pages).
- Added a check to see if a user is already in the server when adding that user.
- Limited listing reason from 1,000 characters to 512 for future-proofing.

### 1.0.3 - November 24 2020
- Reenabled banned user check (New method).
- The 'OK' emoji is now in a lighter shade of green.

### 1.0.2 - November 21 2020
- Added an option to toggle on/off pinging the assigned role when a listed user joins the server with `!w toggleping` (Default: Off).
- Added emojis to most of the embed messages.
- The 'You don't have permission to use this' and 'Only an admin may use this command' errors will now be deleted after 5 seconds.

### 1.0.1 - November 20 2020
- Disabled banned users check when listing a new user due to reports of false positives.
- Updated description for when a bot sends a message to the server's owner for the first time.

### 1.0.0 - November 19 2020
- Initial release.