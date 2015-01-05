# PlatformUI field type support

This document lists the available field types in eZ Publish Platform and how each
is supported while viewing and editing a content and viewing and editing a
content type in the PlatformUI application.

## Author

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: No

## BinaryFile

* Content view: Yes
* Content edit: Yes (missing [drag and drop](https://jira.ez.no/browse/EZP-23789))
* Content type view: No
* Content type edit: No

## Checkbox

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: No

## Country

* Content view: No, [EZP-22347](https://jira.ez.no/browse/EZP-22247) (need to implement a new API in the JS REST Client)
* Content edit: No, [EZP-21715](https://jira.ez.no/browse/EZP-21715) (need to implement a new API in the JS REST Client)
* Content type view: No
* Content type edit: No

## Date

* Content view: Yes (but [missing localization](https://jira.ez.no/browse/EZP-23429))
* Content edit: Yes (only for [browsers supporting the HTML5 date input](https://jira.ez.no/browse/EZP-23744))
* Content type view: No
* Content type edit: No

## DateAndTime

* Content view: Yes (but [missing localization](https://jira.ez.no/browse/EZP-23429) and buggy on the time because of that)
* Content edit: Yes (only for [browsers supporting the HTML5 date/time input](https://jira.ez.no/browse/EZP-23744))
* Content type view: No
* Content type edit: No

## EmailAddress

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: No

## Float

* Content view: Yes (but [missing localization](https://jira.ez.no/browse/EZP-23429)
* Content edit: Yes
* Content type view: No
* Content type edit: No

## Image

* Content view: Yes
* Content edit: Yes (missing [drag and drop](https://jira.ez.no/browse/EZP-23789))
* Content type view: No
* Content type edit: No

## Integer

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: No

## ISBN

* Content view: No
* Content edit: No
* Content type view: No
* Content type edit: No

## Keyword

* Content view: No, [EZP-23729](https://jira.ez.no/browse/EZP-23729) (the generic field view is somehow working but it does not detect an empty field)
* Content edit: Yes
* Content type view: No
* Content type edit: No

## MapLocation

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: No

## Media

* Content view: No [EZP-23730](https://jira.ez.no/browse/EZP-23730)
* Content edit: Yes (only for HTML5 Audio and Video and missing [drag and drop](https://jira.ez.no/browse/EZP-23789))
* Content type view: No
* Content type edit: No

## Page

* Content view: No
* Content edit: No
* Content type view: No
* Content type edit: No

## Rating

* Content view: No
* Content edit: No
* Content type view: No
* Content type edit: No

## Relation

* Content view: Yes
* Content edit: No [EZP-23816](https://jira.ez.no/browse/EZP-23816)
* Content type view: No
* Content type edit: No

## RelationList

* Content view: Yes
* Content edit: No [EZP-23818](https://jira.ez.no/browse/EZP-23818)
* Content type view: No
* Content type edit: No

## RichText

* Content view: No [EZP-23814](https://jira.ez.no/browse/EZP-23814)
* Content edit: No [EZP-23815](https://jira.ez.no/browse/EZP-23815)
* Content type view: No
* Content type edit: No

## Selection

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: No

## TextBlock

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: No

## TextLine

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: No

## Time

* Content view: Yes (but [missing localization](https://jira.ez.no/browse/EZP-23429) and buggy because of that)
* Content edit: Yes (only for [browsers supporting the HTML5 time input](https://jira.ez.no/browse/EZP-23744))
* Content type view: No
* Content type edit: No

## Url

* Content view: Yes
* Content edit: Yes
* Content type view: No
* Content type edit: No

## User

* Content view: Yes
* Content edit: No (missing [a REST resource to check for the availability of a login](https://jira.ez.no/browse/EZP-21819))
* Content type view: No
* Content type edit: No

## XmlText

* Content view: Yes (only display the XmlCode)
* Content edit: Yes (only provides a textarea to edit the XmlCode)
* Content type view: No
* Content type edit: No
