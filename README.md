# WatchLyst

<p align="center">
  <img src="https://i.imgur.com/WUXKZzZ.png" alt="WatchLyst Logo"/>
  <p align="center">Thanks <a href="https://twitter.com/MarcelSteak2">@MarcelSteak2</a> for the logo!</p>
  <hr />
</p>

A Discord bot which allows server staff to create a list of troublesome users, and will alert when one of the users join the server.

![GIF Example](https://i.imgur.com/omb6BgP.gif "GIF Example")

### [Invite WatchLyst to your server](https://discord.com/api/oauth2/authorize?client_id=765240772781932555&permissions=2052&scope=bot%20applications.commands)

# Usage

### Commands

- `/add [User ID*] [Reason]` Add a user to the server's WatchLyst

- `/remove [User ID*]` Remove a user from the server's WatchLyst

- `/update [User ID*] [Reason]` Update a user's information in the server's WatchLyst

- `/list [Page]` Display a list of users in the server's WatchLyst

- `/check [User ID*]` Show information about a user in the server's WatchLyst

- `/help` Display a list of WatchLyst commands (Also usable in DMs)

- `/config [Channel ID] [Role ID] [Toggle Pings]` (Admin only) Configurate a channel that WatchLyst will send alerts to, a role that will have access to the WatchLyst commands, and whether or not to ping the role when a user joins the server. Leave all arguments blank to display or reset the configuration.

### Events

- **When WatchLyst is added to a new server** -> WatchLyst will send the owner a message and create new configuration for the server.

- **When WatchLyst is removed from a server** -> WatchLyst will remove the server's configuration.

- **When a listed user joins or leaves** -> WatchLyst will send an alert.

- **When a listed user is banned** -> WatchLyst will send an alert and unlist the user.

- **When an assigned channel is deleted** -> The channel will be removed from the server's WatchLyst configuration.

- **When an assigned role is deleted** -> The role will be removed from the server's WatchLyst configuration.