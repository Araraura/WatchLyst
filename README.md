# WatchLyst
A bot which lets a Discord's server staff to create a list of troublesome users which will notify them once they join the server.

### [Invite to your server](https://discord.com/oauth2/authorize?client_id=765240772781932555&scope=bot&permissions=84996)

[Version changelog](https://pastebin.com/raw/wpJD9qC6)



# Usage

### Regular staff

`!w add <User ID> <Reason (Optional, max 512 characters)>` Adds a user to the WatchLyst

`!w remove <User ID>` Removes a user from the WatchLyst

`!w list <Page>` Displays a list of users in the server's WatchLyst

`!w setup` List of server setup commands (Admin Only)

### Admins only
`!w channel <Channel ID>` Specify the channel where WatchLyst will notify when a listed user joins the server

`!w role <Role ID>` Specify a role that will get access to WatchLyst commands (Excluding admin commands)

`!w toggleping` Toggle whether or not the assigned role will be pinged once a listed member joins the server (Off by default)



# Planned Features

`!w check <User ID>` View a specific user in the server's WatchLyst

`!w clear` An admin command which completely deletes an entire server's WatchLyst's listings

a Daily check for banned users across the entire database. If a user is banned in a specific server, delete them from that server's WatchLyst

**DangerLyst** - a Global database containing users that would be harmful to any sort of server, which mostly consists of ToS breaking users. People could suggest adding dangerous users to it (Assuming there is evidence of harmful behaviour) and servers could choose to opt-in or out of this feature.
