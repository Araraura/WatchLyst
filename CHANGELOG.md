### 2.0.0 - February 12 2023
- Completely rewrote the bot using TypeScript and [discordx](https://discordx.js.org/)
- Updated to discord.js v14
- Now using the [Sequelize](https://sequelize.org/) ORM
- Now using environmental variables to store credentials
- Replaced all regular commands with Slash commands
- WatchLyst now requires less permissions to function (Send Messages and Ban Members)
- Listed users will be displayed with their username and ID instead of just ID
- WatchLyst now handles Snowflake IDs through the Discord API instead of as strings. Non-existent IDs will be rejected
- Changed `/setup` to `/config [Channel] [Role] [Toggle Ping]` and removed `/channel` `/role` `/toggleping`
- Made it possible to remove assigned channel and role by using `/config` without arguments
- Added navigation buttons to `/list` to flip between pages
- Increased the maximum amount of characters for a listed user's reason from 512 to 999
- Added `/update [User ID*] [New description]` as a way to update existing users
- A message will be sent when a listed user leaves the server. That will not remove the listed user from the server's WatchLyst
- When a listed user is banned from the server, they will be automatically unlisted
- When an assigned role or channel are deleted in a server, WatchLyst will automatically remove them from the server's configuration and notify the server's owner
- A server's WatchLyst information will automatically be destroyed when WatchLyst is removed from the server (but not its listed users)
- Error messages will only be displayed to the user who sent the command
- Fixed an issue where IDs not 18 characters in length would not be registered

### 1.2.0 - March 11 2022
- New logo (Thanks [@MarcelSteak2](https://twitter.com/MarcelSteak2)!)
- Upgraded to discord.js v13
- Code rewrite / cleanup
- Added `!w check`, which displays details about a specific user in the server's WatchLyst
- Added `!w clearbans`, which removes all of the banned users from the server's WatchLyst
- Add command now displays the provided reason
- Changed some colors around to match the new logo
- Fixed a bug where the aliases for `!w toggleping` was not functioning
- Fixed a bug where command parameters would not work if seperated by newlines or extra spaces
- Add command no longer replaces an apostophe (') with a tilted apostophe (’)
- Improved error messages

### 1.1.1 - January 1 2021
- Fixed a bug where WatchLyst would check for a bot-breaking character only once instead of all instances in an entry's reason
- When a user encounters an issue, WatchLyst now directs them to the GitHub

### 1.1.0 - December 24 2020
- Added pages to the list command. Can be used by adding a number after typing the command (May be replaced in the future with reactions as a way to flip between the pages)
- Added a check to see if a user is already in the server when adding that user
- Limited listing reason from 1,000 characters to 512 for future-proofing

### 1.0.3 - November 24 2020
- Reenabled banned user check (New method)
- The 'OK' emoji is now in a lighter shade of green

### 1.0.2 - November 21 2020
- Added an option to toggle on/off pinging the assigned role when a listed user joins the server with `!w toggleping` (Default: Off)
- Added emojis to most of the embed messages
- The 'You don't have permission to use this' and 'Only an admin may use this command' errors will now be deleted after 5 seconds

### 1.0.1 - November 20 2020
- Disabled banned users check when listing a new user due to reports of false positives
- Updated description for when a bot sends a message to the server's owner for the first time

### 1.0.0 - November 19 2020
- Initial release