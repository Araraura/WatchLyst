# WatchLyst
A Discord bot which allows server staff to create a list of troublesome users, and will alert when one of the users join the server.

### [Invite WatchLyst to your server](https://discord.com/oauth2/authorize?client_id=765240772781932555&scope=bot&permissions=84996)

# Usage

### Staff

- `!w add <User ID> <Reason (Optional, max 512 characters)>` Adds a user to the WatchLyst

- `!w remove <User ID>` Removes a user from the WatchLyst

- `!w list <Page>` Displays a list of users in the server's WatchLyst

- `!w setup` List of server setup commands (Admin Only)

### Admins only
- `!w channel <Channel ID>` Specify the channel where WatchLyst will notify when a listed user joins the server (Default: DMs the server owner)

- `!w role <Role ID>` Specify a role that will get access to WatchLyst commands (Excluding admin commands)

- `!w toggleping` Toggle whether or not the assigned role will be pinged once a listed member joins the server (Default: Off)