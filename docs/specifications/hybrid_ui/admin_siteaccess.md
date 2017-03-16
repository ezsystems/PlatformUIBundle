# Admin Siteaccess
As the admin UI is being moved closer to the core, it makes sense to consider making the admin
a siteaccess (SA) again. It would transparently make any frontend route available to the
backoffice, starting with the URL aliases and user generated content actions.

The admin SA will be automatically generated without any extra configuration.
 
## Siteaccess groups mapping
By default, an admin SA will be generated per SA group, thus being shared by the group elements.
 
### Mono-site
If there is only one group, the siteaccess will be named `admin`.

### Multi-site
If there are several, one will be named after each group, stripped down from the `_group` suffix.

Example: if the groups 'site_a_group' and 'site_b_group' are defined, the admin siteaccesses
will be named 'admin_site_a' and 'admin_site_b'.

## 'admin' siteaccess group
All the generated admin SA will be added to an 'admin_group' SA group.  

## Customization
Use-cases to be defined.

Ideas:
- custom admin SA name, globally or "per admin" (how do we "target" an admin SA ?)
- custom matching (host, port... all of them)
- extra admin SA (what for ?)

## Open questions
- This works for URI element siteaccess matching, but not for any kind of mapping. How do we f.e. cover host mapping ?
- Clarify how languages should be handled.
- Consider implementing mapping on repository + root node tupples (used by related SA handling).
  May be done by implementing `SiteAccessGroups` and `RepositoryRoot` admin "generators".

## Tasks
- Update the Hybrid Prototype's `AdminRequestMatcher` to match on the siteaccess group.
