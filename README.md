# WatchLyst

<p align="center">
  <img src="https://i.imgur.com/WUXKZzZ.png" alt="WatchLyst Logo"/>
  <p align="center">Thanks <a href="https://twitter.com/MarcelSteak2">@MarcelSteak2</a> for the logo!</p>
  <hr />
</p>

A Discord bot which allows server staff to create a list of troublesome users, and will alert when one of the users join the server.

![GIF Example](https://i.imgur.com/omb6BgP.gif "GIF Example")

### [Invite WatchLyst to your server](https://discord.com/api/oauth2/authorize?client_id=765240772781932555&permissions=84996&scope=bot)

# Usage

### Staff

- `!w add <User ID> <Reason (Optional, max 512 characters)>` Adds a user to the WatchLyst

- `!w remove <User ID>` Removes a user from the WatchLyst

- `!w list <Page>` Displays a list of users in the server's WatchLyst

- `!w check <User ID>` Displays information about a specific user in the server's WatchLyst


### Admins only
- `!w setup` Lists server setup commands

- `!w channel <Channel ID>` Specify the channel where WatchLyst will notify when a listed user joins the server (Default: DMs the server owner)

- `!w role <Role ID>` Specify a role that will get access to WatchLyst commands (Excluding admin commands)

- `!w toggleping` Toggle whether or not the assigned role will be pinged once a listed member joins the server (Default: Off)

- `!w clearbans` Removes all banned users from the server's WatchLyst
