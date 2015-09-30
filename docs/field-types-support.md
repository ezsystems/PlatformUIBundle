# PlatformUI field type support

This document lists the available field types in eZ Publish Platform and how each
is supported while viewing and editing a content and viewing and editing a
content type in the PlatformUI application.

## Author

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## BinaryFile

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Checkbox

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Country

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Date

* Content view: Yes (but [missing localization](https://jira.ez.no/browse/EZP-23429))
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## DateAndTime

* Content view: Yes (but [missing localization](https://jira.ez.no/browse/EZP-23429) and buggy on the time because of that)
* Content edit: Yes (only for [browsers supporting the HTML5 date/time input](https://jira.ez.no/browse/EZP-23744))
* Content type view: No
* Content type edit: Yes

## EmailAddress

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Float

* Content view: Yes (but [missing localization](https://jira.ez.no/browse/EZP-23429)
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Image

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Integer

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## ISBN

* Content view: No
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Keyword

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## MapLocation

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Media

* Content view: Yes
* Content edit: Yes (only for HTML5 Audio and Video)
* Content type view: No
* Content type edit: Yes

## Page

* Content view: No
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Rating

* Content view: No
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Relation

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## RelationList

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## RichText

* Content view: Yes
* Content edit: Yes (WIP on the editor)
* Content type view: No
* Content type edit: Yes

## Selection

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## TextBlock

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## TextLine

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Time

* Content view: Yes (but [missing localization](https://jira.ez.no/browse/EZP-23429) and buggy because of that)
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## Url

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## User

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: Yes

## XmlText

* Content view: Yes (only display the XmlCode)
* Content edit: Yes (only provides a textarea to edit the XmlCode)
* Content type view: No
* Content type edit: Yes
